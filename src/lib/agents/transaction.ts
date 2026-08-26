import OpenAI from "openai";
import type { AgentTool } from "./types";
import { getTransactions, addTransaction, deleteTransaction } from "@/lib/userData";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

export const TRANSACTION_TOOLS: AgentTool[] = [
  {
    type: "function",
    function: {
      name: "add_transaction",
      description: "Record a financial transaction. ONLY call when user explicitly states they spent or received money.",
      parameters: {
        type: "object",
        properties: {
          description: { type: "string", description: "What the transaction was for" },
          category: { type: "string", enum: ["FOOD", "SUBS", "EDU", "TRANSIT", "ENTERTAIN", "UTILITIES", "INCOME", "SAVINGS", "OTHER"] },
          amount: { type: "number", description: "PKR. POSITIVE for income, NEGATIVE for expense" },
          date: { type: "string", description: "YYYY-MM-DD, defaults to today" }
        },
        required: ["description", "category", "amount"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_multiple_transactions",
      description: "Record MULTIPLE transactions at once. Use when user mentions income AND expenses together, or lists multiple expenses.",
      parameters: {
        type: "object",
        properties: {
          transactions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                description: { type: "string" },
                category: { type: "string", enum: ["FOOD", "SUBS", "EDU", "TRANSIT", "ENTERTAIN", "UTILITIES", "INCOME", "SAVINGS", "OTHER"] },
                amount: { type: "number", description: "PKR. POSITIVE for income, NEGATIVE for expense" }
              },
              required: ["description", "category", "amount"]
            }
          }
        },
        required: ["transactions"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "remove_transaction",
      description: "Remove a transaction by ID or description keyword.",
      parameters: {
        type: "object",
        properties: {
          txId: { type: "string", description: "Transaction ID" },
          description: { type: "string", description: "Keyword to match" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_transaction",
      description: "Update an existing transaction.",
      parameters: {
        type: "object",
        properties: {
          txId: { type: "string", description: "Transaction ID to update" },
          description: { type: "string" },
          amount: { type: "number" },
          category: { type: "string" }
        },
        required: ["txId"]
      }
    }
  }
];

function buildUserDataString(userId: string): string {
  const transactions = getTransactions(userId);
  if (transactions.length === 0) return "No transactions yet.";
  return transactions
    .map(t => `- [${t._id}] ${t.description} (${t.category}) Rs. ${t.amount} on ${t.date}`)
    .join("\n");
}

function executeTransactionAction(userId: string, tc: { id: string; function: { name: string; arguments: string } }): string {
  const { name, arguments: argsStr } = tc.function;
  let args: Record<string, unknown>;
  try { args = JSON.parse(argsStr); } catch { return "Parse error"; }
  try {
    switch (name) {
      case "add_transaction": {
        const tx = addTransaction(userId, {
          date: (args.date as string) || new Date().toISOString().split("T")[0],
          description: String(args.description || "UNKNOWN").toUpperCase(),
          category: String(args.category || "OTHER").toUpperCase(),
          amount: Number(args.amount || 0),
          createdAt: new Date().toISOString(),
        });
        return `RECORDED: ${tx.description} Rs. ${tx.amount} (${tx.category})`;
      }
      case "add_multiple_transactions": {
        const txArr = args.transactions as Array<{ description: string; category: string; amount: number }>;
        const results: string[] = [];
        for (const item of (txArr || [])) {
          const tx = addTransaction(userId, {
            date: new Date().toISOString().split("T")[0],
            description: String(item.description || "UNKNOWN").toUpperCase(),
            category: String(item.category || "OTHER").toUpperCase(),
            amount: Number(item.amount || 0),
            createdAt: new Date().toISOString(),
          });
          results.push(`${tx.description} Rs. ${tx.amount} (${tx.category})`);
        }
        return "RECORDED: " + results.join(", ");
      }
      case "remove_transaction": {
        if (args.txId) return deleteTransaction(userId, String(args.txId)) ? "DELETED" : "NOT FOUND";
        if (args.description) {
          const txs = getTransactions(userId);
          const matches = txs.filter(t => t.description.toLowerCase().includes(String(args.description).toLowerCase()));
          let count = 0;
          for (const tx of matches) { if (deleteTransaction(userId, tx._id)) count++; }
          return `DELETED ${count} matching '${args.description}'`;
        }
        return "NO MATCH";
      }
      case "update_transaction": {
        const txId = String(args.txId || "");
        const txs = getTransactions(userId);
        const existing = txs.find(t => t._id === txId);
        if (!existing) return "NOT FOUND";
        if (args.description) existing.description = String(args.description).toUpperCase();
        if (args.amount !== undefined) existing.amount = Number(args.amount);
        if (args.category) existing.category = String(args.category).toUpperCase();
        deleteTransaction(userId, txId);
        addTransaction(userId, { date: existing.date, description: existing.description, category: existing.category, amount: existing.amount, createdAt: existing.createdAt });
        return `UPDATED: ${existing.description} Rs. ${existing.amount}`;
      }
      default:
        return "UNKNOWN TOOL";
    }
  } catch (e) {
    return "ERROR: " + (e instanceof Error ? e.message : "unknown");
  }
}

export async function runTransactionAgent(
  userId: string,
  messages: Array<Record<string, unknown>>
): Promise<{ content: string; executedActions: string[] }> {
  const userData = buildUserDataString(userId);
  const systemPrompt = `You are Finmate's Transaction Agent. All money in PKR (Rs.).

USER TRANSACTIONS:
${userData}

RULES:
- When user states income AND expenses in ONE message, record ALL of them using add_multiple_transactions
- When user states multiple expenses, record ALL of them
- Record income as positive, expenses as negative
- Do NOT ask for permission — just record everything
- Do NOT record hypothetical or informational mentions
- Do NOT auto-split income into budget categories
- Confirm everything you recorded

EXAMPLES:
- "I have 21k/month" → add_transaction: SALARY, INCOME, +21000
- "I spent 500 on food" → add_transaction: FOOD, FOOD, -500
- "My income is 25k, lunch is 250 and fuel is 200" → add_multiple_transactions: [{INCOME, INCOME, +25000}, {LUNCH, FOOD, -250}, {FUEL, TRANSIT, -200}]
- "Expenses: 300 on food, 150 on transport, 200 on phone" → add_multiple_transactions for all 3
- "Cancel Netflix" → remove_transaction: SUBS

MULTI-EXPENSE LOGIC:
- If user mentions lunch/dinner/breakfast daily or weekly, calculate monthly: daily amount × days/week × 4
- "250rs lunch for 4 days/week" → 250 × 4 × 4 = -4000 monthly
- "200rs fuel for 4 days/week" → 200 × 4 × 4 = -3200 monthly
- Record calculated monthly amounts

Categories: FOOD, SUBS, EDU, TRANSIT, ENTERTAIN, UTILITIES, INCOME, SAVINGS, OTHER`;

  const groqMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  const res = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: groqMessages as any,
    tools: TRANSACTION_TOOLS as any,
    tool_choice: "auto",
    temperature: 0.4,
    max_tokens: 1024,
  });

  const msg = res.choices[0]?.message;
  if (!msg) return { content: "No response from transaction agent.", executedActions: [] };

  let executedActions: string[] = [];
  let finalContent = msg.content || "";

  if (msg.tool_calls && msg.tool_calls.length > 0) {
    for (const tc of msg.tool_calls) {
      executedActions.push(executeTransactionAction(userId, tc as any));
    }

    groqMessages.push(msg as any);
    for (let i = 0; i < msg.tool_calls.length; i++) {
      groqMessages.push({ role: "tool", tool_call_id: (msg.tool_calls[i] as any).id, content: executedActions[i] });
    }

    const followUp = await client.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: "You are Finmate, a friendly finance AI for Pakistani students. The user's transaction was just recorded. Respond in a natural, helpful way. Mention what was recorded, current balance if relevant, and offer next steps. Keep it 2-3 sentences max." },
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
