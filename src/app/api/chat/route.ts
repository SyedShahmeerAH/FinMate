import { verifyToken } from "@/lib/auth";
import { getUserSummary } from "@/lib/userData";
import { createConversation, getConversation, saveConversation } from "@/lib/conversations";
import { classifyIntent } from "@/lib/agents/router";
import { runTransactionAgent } from "@/lib/agents/transaction";
import { runGoalAgent } from "@/lib/agents/goal";
import { runBudgetAgent } from "@/lib/agents/budget";
import { runInsightsAgent } from "@/lib/agents/insights";
import OpenAI from "openai";

const generalClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

async function buildUserDataString(userId: string): Promise<string> {
  try {
    const summary = await getUserSummary(userId);
    const lines: string[] = [];
    lines.push(`Balance: Rs. ${summary.balance.toLocaleString()}`);
    lines.push(`Income: Rs. ${summary.totalIncome.toLocaleString()}`);
    lines.push(`Expenses: Rs. ${summary.totalExpenses.toLocaleString()}`);
    if (summary.transactionCount > 0) {
      lines.push(`Transactions: ${summary.transactionCount}`);
    }
    if (summary.targets.length > 0) {
      lines.push("Goals:");
      for (const t of summary.targets) {
        lines.push(`- ${t.name}: ${t.progress}% (Rs. ${t.remaining.toLocaleString()} remaining)`);
      }
    }
    return lines.join("\n");
  } catch {
    return "(No data)";
  }
}

async function getUserId(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("Authorization");
  let token = authHeader?.replace("Bearer ", "");
  if (!token) {
    const cookie = request.headers.get("Cookie");
    token = cookie?.split(";").find(c => c.trim().startsWith("token="))?.split("=")[1];
  }
  if (!token) return null;
  return verifyToken(token)?.userId || null;
}

async function saveMsg(userId: string, conversationId: string | null, userMsg: string, assistantMsg: string): Promise<string | null> {
  if (!userId) return null;
  if (conversationId) {
    const conv = await getConversation(userId, conversationId);
    if (conv) {
      conv.messages.push({ role: "user", content: userMsg });
      conv.messages.push({ role: "assistant", content: assistantMsg });
      conv.updatedAt = new Date().toISOString();
      await saveConversation(userId, conv);
    }
    return null;
  }
  const title = userMsg.substring(0, 50) + (userMsg.length > 50 ? "..." : "");
  const conv = await createConversation(userId, title, [
    { role: "user", content: userMsg },
    { role: "assistant", content: assistantMsg },
  ]);
  return conv._id;
}

export async function POST(request: Request) {
  try {
    const { messages, conversationId } = await request.json();
    const userId = await getUserId(request);

    if (!messages || messages.length === 0) {
      return new Response("No messages provided.", { status: 400, headers: { "Content-Type": "text/plain" } });
    }

    const lastUserMsg = messages[messages.length - 1]?.content || "";
    if (!lastUserMsg) {
      return new Response("Empty message.", { status: 400, headers: { "Content-Type": "text/plain" } });
    }

    // Classify intent
    let intent = await classifyIntent(lastUserMsg);

    // Fallback: if message contains financial patterns, force correct agent
    const transactionPattern = /\b\d+\s*(k|rs|pkr|lakh|thousand)|spent|bought|paid|earned|received|salary|allowance|income|expense|cancel|subscription|lunch|dinner|breakfast|fuel|rent|bills\b/i;
    const goalPattern = /\bsave|saving|savings|goal|target|want to|dream|plan for|saved\b/i;
    if (intent === "general") {
      if (goalPattern.test(lastUserMsg)) {
        intent = "goal";
      } else if (transactionPattern.test(lastUserMsg)) {
        intent = "transaction";
      }
    }

    let result: { content: string; executedActions: string[] };

    if (!userId) {
      // Not logged in — general chat only
      const generalRes = await generalClient.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: "You are Finmate, a finance AI for Pakistani university students. All money in PKR (Rs.). User is not logged in." },
          ...messages,
        ],
        temperature: 0.4,
        max_tokens: 1024,
      });
      result = {
        content: generalRes.choices[0]?.message?.content || "Please log in to use Finmate.",
        executedActions: [],
      };
    } else {
      switch (intent) {
        case "transaction":
          result = await runTransactionAgent(userId, messages);
          break;
        case "goal":
          result = await runGoalAgent(userId, messages);
          break;
        case "budget":
          result = await runBudgetAgent(userId, messages);
          break;
        case "insights":
          result = await runInsightsAgent(userId, messages);
          break;
        default: {
          // General conversation
          const userDataString = await buildUserDataString(userId);
          const generalRes = await generalClient.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [
              {
                role: "system",
                content: `You are Finmate, a helpful finance AI for Pakistani university students. All money in PKR (Rs.).

USER DATA:
${userDataString}

RULES:
- Be helpful and friendly
- If user mentions money, suggest they can record it
- Keep responses concise
- Do NOT record transactions — tell user to describe their spending/income and the Transaction Agent will handle it`
              },
              ...messages,
            ],
            temperature: 0.4,
            max_tokens: 1024,
          });
          result = {
            content: generalRes.choices[0]?.message?.content || "How can I help you with your finances?",
            executedActions: [],
          };
          break;
        }
      }
    }

    // Build response
    const prefix = result.executedActions.length > 0
      ? "[ACTIONS_EXECUTED:" + result.executedActions.join(";") + "]"
      : "";
    const fullResponse = prefix + (prefix ? "\n" : "") + result.content;

    // Save conversation
    const newConvId = userId ? await saveMsg(userId, conversationId || null, lastUserMsg, result.content) : null;
    if (newConvId) {
      return new Response("[CONV_ID:" + newConvId + "]\n" + fullResponse, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    return new Response(fullResponse, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (error) {
    return new Response("Server error: " + (error instanceof Error ? error.message : "unknown"), {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
