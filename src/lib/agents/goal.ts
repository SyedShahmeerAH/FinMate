import OpenAI from "openai";
import type { AgentTool } from "./types";
import { getTargets, addTarget, updateTarget, deleteTarget, getTransactions } from "@/lib/userData";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

export const GOAL_TOOLS: AgentTool[] = [
  {
    type: "function",
    function: {
      name: "add_savings_goal",
      description: "Create a savings goal. ONLY call after user confirms they want it.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Goal name" },
          goal: { type: "number", description: "Target amount in PKR" },
          current: { type: "number", description: "Current saved amount" }
        },
        required: ["name", "goal"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_goal_progress",
      description: "Update savings goal. Use 'amount' to ADD to current progress (preferred), or 'current' to SET directly.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Goal name to lookup" },
          amount: { type: "number", description: "Amount to ADD to current progress" },
          current: { type: "number", description: "Set current amount directly (use if amount not provided)" }
        },
        required: ["name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "remove_goal",
      description: "Delete a goal.",
      parameters: {
        type: "object",
        properties: {
          targetId: { type: "string" }
        },
        required: ["targetId"]
      }
    }
  }
];

async function buildUserDataString(userId: string): Promise<string> {
  const transactions = await getTransactions(userId);
  const targets = await getTargets(userId);

  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const balance = totalIncome - totalExpenses;
  const savings = totalIncome * 0.14;

  const lines: string[] = [];
  lines.push(`Balance: Rs. ${balance.toLocaleString()}`);
  lines.push(`Monthly Income: Rs. ${totalIncome.toLocaleString()}`);
  lines.push(`Estimated Savings (14%): Rs. ${savings.toLocaleString()}`);

  if (targets.length > 0) {
    lines.push("Existing Goals:");
    for (const t of targets) {
      lines.push(`- [${t._id}] ${t.name}: Rs. ${t.current} / Rs. ${t.goal} (${Math.round((t.current / t.goal) * 100)}%)`);
    }
  } else {
    lines.push("No existing goals.");
  }

  return lines.join("\n");
}

async function executeGoalAction(userId: string, tc: { id: string; function: { name: string; arguments: string } }): Promise<string> {
  const { name, arguments: argsStr } = tc.function;
  let args: Record<string, unknown>;
  try { args = JSON.parse(argsStr); } catch { return "Parse error"; }
  try {
    switch (name) {
      case "add_savings_goal": {
        const colors = ["bg-[#00FFFF]", "bg-white", "bg-gray-500"];
        const existing = await getTargets(userId);
        const t = await addTarget(userId, {
          name: String(args.name || "GOAL").toUpperCase(),
          current: Number(args.current || 0),
          goal: Number(args.goal || 0),
          color: colors[existing.length % colors.length],
          createdAt: new Date().toISOString(),
        });
        return `CREATED GOAL: ${t.name} Rs. ${t.goal}`;
      }
      case "update_goal_progress": {
        const targets = await getTargets(userId);
        const t = targets.find(x => x.name.toLowerCase().includes(String(args.name || "").toLowerCase()));
        if (!t) return "GOAL NOT FOUND";
        const newAmount = args.amount !== undefined
          ? t.current + Number(args.amount)
          : Number(args.current || 0);
        const u = await updateTarget(userId, t._id, { current: newAmount });
        return u ? `UPDATED ${t.name}: Rs. ${t.current} → Rs. ${newAmount}` : "FAILED";
      }
      case "remove_goal":
        return await deleteTarget(userId, String(args.targetId || "")) ? "DELETED" : "NOT FOUND";
      default:
        return "UNKNOWN TOOL";
    }
  } catch (e) {
    return "ERROR: " + (e instanceof Error ? e.message : "unknown");
  }
}

type GoalResult = { content: string; executedActions: string[] };

export async function runGoalAgent(
  userId: string,
  messages: Array<Record<string, unknown>>
): Promise<GoalResult> {
  const userData = await buildUserDataString(userId);
  const systemPrompt = `You are Finmate's Goal Agent. All money in PKR (Rs.).

USER DATA:
${userData}

RULES:
- When user says "I want to save for X" or "I'm saving for X", CREATE the goal immediately using add_savings_goal
- When user says "I saved X for Y" or "I put X toward Y", UPDATE the goal progress using update_goal_progress — do NOT record this as income
- Show progress on existing goals when relevant
- Set realistic goal amounts based on income (e.g., laptop = Rs. 80000, emergency fund = 3 months expenses)

ACTION TRIGGERS:
- "I want to save for a laptop" → add_savings_goal: LAPTOP, 80000
- "I want to save for textbooks" → add_savings_goal: TEXTBOOKS, 20000
- "I saved 5k for my laptop" → update_goal_progress: LAPTOP, 5000 (ADD to existing current)
- "I put 3k toward my laptop" → update_goal_progress: LAPTOP, (current + 3000)
- "How are my goals going?" → show progress

IMPORTANT: When updating progress, read the current value from USER DATA and ADD the new amount to it. Example: if laptop current is 5000 and user says "I saved 3k more", update to 8000.`;

  const groqMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  const res = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: groqMessages as any,
    tools: GOAL_TOOLS as any,
    tool_choice: "auto",
    temperature: 0.4,
    max_tokens: 1024,
  });

  const msg = res.choices[0]?.message;
  if (!msg) return { content: "No response from goal agent.", executedActions: [] };

  let executedActions: string[] = [];
  let finalContent = msg.content || "";

  if (msg.tool_calls && msg.tool_calls.length > 0) {
    for (const tc of msg.tool_calls) {
      executedActions.push(await executeGoalAction(userId, tc as any));
    }

    groqMessages.push(msg as any);
    for (let i = 0; i < msg.tool_calls.length; i++) {
      groqMessages.push({ role: "tool", tool_call_id: (msg.tool_calls[i] as any).id, content: executedActions[i] });
    }

    const followUp = await client.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: "You are Finmate, a friendly finance AI for Pakistani students. The user's goal was just created or updated. Respond in a natural, encouraging way. Mention the goal name and target amount. Keep it 2-3 sentences max." },
        ...groqMessages as any,
      ],
      temperature: 0.4,
      max_tokens: 512,
    });

    if (followUp.choices[0]?.message?.content) {
      finalContent = followUp.choices[0].message.content;
    } else {
      finalContent = "Done. Here's what I did:\n" + executedActions.map(a => "- " + a).join("\n");
    }
  }

  return { content: finalContent, executedActions };
}
