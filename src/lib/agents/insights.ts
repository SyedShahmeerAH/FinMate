import OpenAI from "openai";
import { getTransactions, getUserSummary } from "@/lib/userData";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

function buildInsightsData(userId: string): string {
  const summary = getUserSummary(userId);
  const transactions = getTransactions(userId);

  const lines: string[] = [];
  lines.push(`Balance: Rs. ${summary.balance.toLocaleString()}`);
  lines.push(`Total Income: Rs. ${summary.totalIncome.toLocaleString()}`);
  lines.push(`Total Expenses: Rs. ${summary.totalExpenses.toLocaleString()}`);

  const savingsRate = summary.totalIncome > 0
    ? Math.round(((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100)
    : 0;
  lines.push(`Savings Rate: ${savingsRate}%`);

  if (Object.keys(summary.categoryTotals).length > 0) {
    lines.push("Spending Breakdown:");
    const sorted = Object.entries(summary.categoryTotals).sort((a, b) => b[1] - a[1]);
    for (const [cat, amt] of sorted) {
      const pct = summary.totalExpenses > 0 ? Math.round((amt / summary.totalExpenses) * 100) : 0;
      lines.push(`- ${cat}: Rs. ${amt.toLocaleString()} (${pct}%)`);
    }
  }

  const expenses = transactions.filter(t => t.amount < 0);
  if (expenses.length > 0) {
    const avgExpense = Math.round(expenses.reduce((s, t) => s + Math.abs(t.amount), 0) / expenses.length);
    lines.push(`Average Expense: Rs. ${avgExpense.toLocaleString()}`);

    const topExpense = expenses.reduce((max, t) => Math.abs(t.amount) > Math.abs(max.amount) ? t : max, expenses[0]);
    lines.push(`Largest Expense: ${topExpense.description} Rs. ${Math.abs(topExpense.amount)}`);
  }

  return lines.join("\n");
}

export async function runInsightsAgent(
  userId: string,
  messages: Array<Record<string, unknown>>
): Promise<{ content: string; executedActions: [] }> {
  const insightsData = buildInsightsData(userId);
  const systemPrompt = `You are Finmate's Insights Agent. All money in PKR (Rs.).

USER DATA:
${insightsData}

RULES:
- Answer "where did my money go?" with actual data
- Calculate savings rate and compare to recommended (10-20%)
- Identify unusual spending patterns
- Provide actionable suggestions, not just numbers
- Do NOT create or modify transactions — only analyze
- Be concise and direct
- Use actual numbers from the data`;

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
    content: res.choices[0]?.message?.content || "No insights available.",
    executedActions: [],
  };
}
