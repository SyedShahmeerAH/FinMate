import OpenAI from "openai";
import type { AgentType } from "./types";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

export async function classifyIntent(message: string): Promise<AgentType> {
  try {
    const response = await client.chat.completions.create({
      model: "openai/gpt-oss-20b",
      temperature: 0,
      max_tokens: 20,
      messages: [
        {
          role: "system",
          content: `Classify user message into exactly ONE category:
- transaction: ANY mention of money amounts, income, salary, allowance, spending, buying, paid, costs, prices, earned, received, expenses, subscription, cancel, record, log
- goal: saving targets, financial goals, want to save for, emergency fund, laptop fund
- budget: budget planning, spending limits, allocation, how much can I spend
- insights: spending analysis, patterns, "where did money go", how much did I spend on, savings rate
- general: ONLY greeting, chitchat, questions about the app, help, thanks — NO money mentions

Reply with ONLY the category name.`
        },
        { role: "user", content: message }
      ]
    });
    const raw = (response.choices[0]?.message?.content?.trim() || "general").toLowerCase();
    if (["transaction", "goal", "budget", "insights", "general"].includes(raw)) {
      return raw as AgentType;
    }
    return "general";
  } catch {
    return "general";
  }
}
