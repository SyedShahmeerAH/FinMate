export type AgentType = "transaction" | "goal" | "budget" | "insights" | "general";

export interface AgentTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

export interface AgentResult {
  agent: AgentType;
  content: string;
  executedActions: string[];
}
