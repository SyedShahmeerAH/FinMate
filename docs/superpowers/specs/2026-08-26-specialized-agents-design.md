# Finmate Specialized Agents — Design Spec

## Overview

Replace single monolithic chat agent with 4 specialized AI agents routed by a classifier. Uses OpenAI Agents SDK with Groq as backend. Fixes bugs: extra expenses, dashboard desync, missing goal suggestions, console logs.

## Architecture

```
User Message
    │
    ▼
┌─────────────────────────┐
│   Router Agent (LLM)    │  OpenAI Agents SDK → Groq (gpt-oss-20b)
│   Classifies intent     │
└────────┬────────────────┘
         │
    ┌────┼────┬────────────┐
    ▼    ▼    ▼            ▼
┌──────┐ ┌──────┐ ┌──────────┐ ┌──────────┐
│ Trans│ │ Goal │ │ Budget   │ │ Insights │
│ Agent│ │ Agent│ │ Agent    │ │ Agent    │
└──────┘ └──────┘ └──────────┘ └──────────┘
```

- **Router**: `openai/gpt-oss-20b` — fast classifier
- **Specialists**: `openai/gpt-oss-120b` — detailed reasoning
- **Backend**: Groq API via OpenAI Agents SDK

## Specialist Agents

### 1. Transaction Agent

**Purpose**: Record, edit, remove financial transactions.

**Tools**:
- `add_transaction(description, category, amount, date?)` — single transaction
- `add_multiple_transactions(transactions[])` — batch only when user lists multiple items
- `remove_transaction(txId?, description?)` — delete by ID or keyword
- `update_transaction(txId, description?, amount?, category?)` — edit existing

**System prompt rules**:
- ONLY record transactions user EXPLICITLY states they spent/received
- Do NOT record hypothetical, informational, or observed prices
- Do NOT auto-split income into categories
- Categories: FOOD, EDU, TRANSIT, SUBS, ENTERTAIN, UTILITIES, SAVINGS, OTHER
- Confirm what was recorded with amount and category

**Data access**: Reads `.finmate-data/{userId}-transactions.json` via `userData.ts`

### 2. Goal Agent

**Purpose**: Suggest, create, update savings goals.

**Tools**:
- `add_savings_goal(name, goal, current?)` — create target
- `update_goal_progress(name, current)` — update by name lookup
- `remove_goal(targetId)` — delete goal

**System prompt rules**:
- After recording income, SUGGEST 1-2 relevant goals based on savings allocation (14% of income)
- Common suggestions: emergency fund (3-month expenses), laptop, textbooks, travel
- NEVER create goal without user confirmation — ask "Want me to set that up?"
- Show progress on existing goals when relevant
- If user has no goals and mentions saving, suggest creating one

**Data access**: Reads `.finmate-data/{userId}-targets.json` via `userData.ts`

### 3. Budget Agent

**Purpose**: Analyze spending, set budget allocations.

**Tools**:
- `get_budget_summary()` — returns current budget vs actual spending
- `set_budget_allocation(category, percentage)` — set budget for category

**System prompt rules**:
- When user gives monthly income + mentions specific expenses, create budget categories for THOSE expenses only
- Do NOT auto-create 7-category split
- Show budget vs actual comparison
- Warn when approaching or exceeding budget limits

**Data access**: Reads transactions + targets via `userData.ts`

### 4. Insights Agent

**Purpose**: Spending analysis, patterns, recommendations.

**Tools**:
- `get_spending_patterns()` — category breakdown, top expenses
- `get_savings_rate()` — income vs savings ratio

**System prompt rules**:
- Answer "where did my money go?" with actual data
- Calculate savings rate and compare to recommended (10-20%)
- Identify unusual spending patterns
- Provide actionable suggestions, not just numbers

**Data access**: Reads transactions via `userData.ts`

## Router Logic

```typescript
// src/lib/agents/router.ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

type AgentType = "transaction" | "goal" | "budget" | "insights" | "general";

async function classifyIntent(message: string): Promise<AgentType> {
  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-20b",
    temperature: 0,
    max_tokens: 20,
    messages: [
      {
        role: "system",
        content: `Classify user message into exactly ONE category:
- transaction: spending, buying, income, recording money movement
- goal: saving targets, financial goals, want to save for
- budget: budget planning, spending limits, allocation
- insights: spending analysis, patterns, "where did money go"
- general: greeting, chitchat, questions about the app

Reply with ONLY the category name.`
      },
      { role: "user", content: message }
    ]
  });
  return (response.choices[0]?.message?.content?.trim() || "general") as AgentType;
}
```

## Chat API Flow

```
POST /api/chat
    │
    ▼
1. Parse auth token, get userId
    │
    ▼
2. Load user data (transactions, goals, balance)
    │
    ▼
3. Router classifies intent → AgentType
    │
    ▼
4. Select specialist agent + system prompt + tools
    │
    ▼
5. Call specialist with user data context
    │
    ▼
6. Execute tool calls (if any)
    │
    ▼
7. Follow-up call for natural language response
    │
    ▼
8. Return [ACTIONS_EXECUTED:...] + response text
```

## System Prompt Template (Specialists)

```
You are Finmate's {AGENT_NAME}. All money in PKR (Rs.).

USER DATA:
{user financial context — balance, recent transactions, goals}

CRITICAL RULES:
- Only record/modify what user EXPLICITLY states
- Never assume, infer, or create hypothetical transactions
- Confirm every action with what was recorded
- If unsure, ask user to clarify

{AGENT_SPECIFIC_INSTRUCTIONS}
```

## Bug Fixes

### 1. Dashboard Data Sync

**File**: `src/app/dashboard/page.tsx`

- Add polling: `useEffect(() => { const interval = setInterval(fetchData, 5000); return () => clearInterval(interval); }, [])`
- Refetch on window focus: `useEffect(() => { window.addEventListener('focus', fetchData); return () => window.removeEventListener('focus', fetchData); }, [])`

### 2. Remove Console Statements

Remove all 21 `console.error`/`console.warn` statements from:

| File | Lines |
|------|-------|
| `src/app/api/chat/route.ts` | 279, 364 |
| `src/app/api/user/transactions/route.ts` | 47, 71 |
| `src/app/api/user/targets/route.ts` | 47, 72, 96 |
| `src/app/api/agent/route.ts` | 155 |
| `src/app/api/auth/signup/route.ts` | 26 |
| `src/app/api/auth/login/route.ts` | 36 |
| `src/app/api/auth/me/route.ts` | 33 |
| `src/app/page.tsx` | 62, 82, 97 |
| `src/app/dashboard/page.tsx` | 44, 65 |
| `src/app/targets/page.tsx` | 37 |
| `src/app/ledger/page.tsx` | 35, 56, 69 |
| `src/lib/mongodb.ts` | 70 |

### 3. Fix AI Adding Extra Expenses

Replace system prompt in `buildSystemPrompt()`:
- REMOVE: "NEVER ask permission. Just record it using tools."
- REMOVE: Auto budget split instructions
- ADD: "Only record transactions the user explicitly states they spent/received"
- ADD: "Do NOT record hypothetical, informational, or observed prices"

### 4. Goal Suggestions

Goal Agent system prompt includes:
- After recording income, suggest 1-2 goals based on savings allocation
- Ask "Want me to set that up?" before creating
- Common suggestions: emergency fund, laptop, textbooks

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/lib/agents/router.ts` | NEW | Router classifier |
| `src/lib/agents/transaction.ts` | NEW | Transaction specialist |
| `src/lib/agents/goal.ts` | NEW | Goal specialist |
| `src/lib/agents/budget.ts` | NEW | Budget specialist |
| `src/lib/agents/insights.ts` | NEW | Insights specialist |
| `src/lib/agents/types.ts` | NEW | Shared types |
| `src/app/api/chat/route.ts` | REWRITE | Router + specialists |
| `src/app/dashboard/page.tsx` | FIX | Add polling |
| `src/app/page.tsx` | FIX | Remove console.error |
| All API routes | EDIT | Remove console statements |
| `src/app/api/agent/route.ts` | DELETE | Unused legacy endpoint |
| `package.json` | EDIT | Add `openai` package |

## Dependencies

- `openai` npm package (OpenAI Agents SDK)
- Groq API key (already in `.env.local`)

## Testing

1. Login → chat "I have 21k/month" → verify only income recorded, no auto-split
2. Chat "I want to save for a laptop" → verify goal suggestion, not auto-creation
3. Chat "I spent 500 on food" → verify transaction recorded
4. Check dashboard → verify data matches chat actions
5. Navigate away and back → verify dashboard refreshes
6. Check browser console → verify no console statements
