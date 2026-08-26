import OpenAI from "openai";
import { getTransactions, getUserSummary } from "@/lib/userData";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

async function buildBudgetData(userId: string): Promise<string> {
  const summary = await getUserSummary(userId);
  const transactions = await getTransactions(userId);

  const lines: string[] = [];
  lines.push(`Balance: Rs. ${summary.balance.toLocaleString()}`);
  lines.push(`Total Income: Rs. ${summary.totalIncome.toLocaleString()}`);
  lines.push(`Total Expenses: Rs. ${summary.totalExpenses.toLocaleString()}`);

  if (Object.keys(summary.categoryTotals).length > 0) {
    lines.push("Spending by Category:");
    for (const [cat, amt] of Object.entries(summary.categoryTotals)) {
      const pct = summary.totalExpenses > 0 ? Math.round((amt / summary.totalExpenses) * 100) : 0;
      lines.push(`- ${cat}: Rs. ${amt.toLocaleString()} (${pct}%)`);
    }
  }

  const recentTx = transactions.filter(t => t.amount < 0).slice(-5);
  if (recentTx.length > 0) {
    lines.push("Recent Expenses:");
    for (const tx of recentTx) {
      lines.push(`- ${tx.description} Rs. ${Math.abs(tx.amount)} (${tx.category})`);
    }
  }

  return lines.join("\n");
}

export async function runBudgetAgent(
  userId: string,
  messages: Array<Record<string, unknown>>
): Promise<{ content: string; executedActions: [] }> {
  const budgetData = await buildBudgetData(userId);
  const systemPrompt = `You are Finmate's Budget Agent. All money in PKR (Rs.).

USER BUDGET DATA:
${budgetData}

RULES:
- Analyze spending vs income
- Show budget vs actual comparison if data available
- Warn when approaching or exceeding spending limits
- Give practical budgeting advice for Pakistani students
- Do NOT create transactions — only analyze and advise
- Suggest realistic spending limits based on income

BUDGET GUIDELINES (monthly):
- Food: 35% of income
- Education: 18%
- Transport: 12%
- Subscriptions: 7%
- Entertainment: 7%
- Utilities: 7%
- Savings: 14%`;

  const groqMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  const res = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: groqMessages as any,
    temperature: 0.4,
    max_tokens: 1024,
  });

  return {
    content: res.choices[0]?.message?.content || "No budget analysis available.",
    executedActions: [],
  };
}
