"use client";

import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import StatusBadge from "@/components/StatusBadge";
import HeroSection from "@/components/HeroSection";
import AIInput from "@/components/AIInput";
import SuggestedQueries from "@/components/SuggestedQueries";
import ThreadDivider from "@/components/ThreadDivider";
import UserQueryCard from "@/components/UserQueryCard";
import AIResponseCard from "@/components/AIResponseCard";
import ActionButtons from "@/components/ActionButtons";
import { useAuth } from "@/contexts/AuthContext";

type AppState = "greeting" | "input_active" | "response" | "executed";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ExecutedAction {
  type: string;
  message: string;
  success: boolean;
}

interface Conversation {
  _id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

export default function Home() {
  const { user } = useAuth();
  const [appState, setAppState] = useState<AppState>("greeting");
  const [userQuery, setUserQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [executedActions, setExecutedActions] = useState<ExecutedAction[]>([]);
  const [dataVersion, setDataVersion] = useState(0);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (user) fetchConversations();
  }, [user]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/conversations", {
        headers: { Authorization: "Bearer " + token },
      });
      if (res.ok) setConversations(await res.json());
    } catch { /* silent */ }
  };

  const loadConversation = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/conversations?id=" + id, {
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) return;
      const conv = await res.json();
      setChatHistory(conv.messages);
      setMessages(conv.messages);
      setConversationId(conv._id);
      setAppState("input_active");
      setShowHistory(false);
      setAiResponse("");
      setExecutedActions([]);
      setUserQuery("");
    } catch { /* silent */ }
  };

  const clearAllData = async () => {
    if (!confirm("DELETE ALL DATA? This cannot be undone.")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await fetch("/api/user/clear", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      });
      setConversations([]);
      handleReset();
      window.location.reload();
    } catch { /* silent */ }
  };

  const handleQuerySubmit = async (query: string) => {
    setUserQuery(query);
    setAppState("response");
    setIsLoading(true);
    setAiResponse("");
    setExecutedActions([]);

    const newMessages: Message[] = [...messages, { role: "user", content: query }];
    setMessages(newMessages);

    try {
      abortControllerRef.current = new AbortController();
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = "Bearer " + token;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({ messages: newMessages, conversationId }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Failed");
      }

      const text = await response.text();

      // Parse CONV_ID
      let finalText = text;
      const convMatch = text.match(/^\[CONV_ID:(.*?)\]\n/);
      if (convMatch) {
        setConversationId(convMatch[1]);
        finalText = text.substring(convMatch[0].length);
      }

      // Parse ACTIONS
      const actMatch = finalText.match(/^\[ACTIONS_EXECUTED:(.*?)\]\n/);
      let actions: ExecutedAction[] = [];
      let displayText = finalText;
      if (actMatch) {
        actions = actMatch[1].split(";").map(a => ({
          type: a.split(":")[0] || "unknown",
          message: a.trim(),
          success: !a.toLowerCase().includes("not found") && !a.toLowerCase().includes("failed"),
        }));
        displayText = finalText.substring(actMatch[0].length);
        setDataVersion(v => v + 1);
      }

      setAiResponse(displayText);
      setExecutedActions(actions);
      const updated = [...newMessages, { role: "assistant" as const, content: displayText }];
      setMessages(updated);
      setChatHistory(updated);
      setAppState("input_active");
      fetchConversations();
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        setAiResponse("ERROR: Connection failed. Try again.");
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleExecute = () => setAppState("executed");
  const handleModify = () => setAppState("input_active");
  const handleDiscussMore = () => setAppState("input_active");

  const handleReset = () => {
    setAppState("greeting");
    setExecutedActions([]);
    setUserQuery("");
    setAiResponse("");
    setMessages([]);
    setChatHistory([]);
    setConversationId(null);
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  };

  return (
    <>
      <Sidebar activeNav="ai" />
      <main className="flex-1 h-screen overflow-y-auto bg-black p-4 md:p-16 pt-20 md:pt-16 bg-grid-pattern relative scroll-smooth">
        <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-32">

          {/* Greeting */}
          {appState === "greeting" && chatHistory.length === 0 && (
            <section className="flex flex-col gap-8">
              <div className="space-y-6">
                <StatusBadge
                  status={isLoading ? "PROCESSING" : "LISTENING"}
                  user={user ? user.name.toUpperCase().replace(/\s+/g, "_") : "GUEST"}
                />
                <HeroSection
                  headline={isLoading ? "Analyzing..." : user ? `Welcome, ${user.name}.` : "System Online."}
                  subline={isLoading ? "Processing..." : "How can I optimize your capital?"}
                />
              </div>
              <div className="flex flex-col gap-5 mt-4">
                <AIInput onSubmit={handleQuerySubmit} disabled={isLoading} />
                {!isLoading && <SuggestedQueries onSelect={(q) => handleQuerySubmit(q)} />}
                {isLoading && (
                  <button onClick={handleStop} className="border-2 border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-black px-6 py-3 font-mono text-base transition-colors uppercase w-fit">
                    STOP_GENERATION
                  </button>
                )}
              </div>
            </section>
          )}

          {/* Loaded chat history */}
          {chatHistory.length > 0 && (
            <section className="flex flex-col gap-6">
              {chatHistory.map((msg, i) => (
                <div key={i} className="flex flex-col gap-4">
                  {i > 0 && <ThreadDivider />}
                  {msg.role === "user" ? (
                    <UserQueryCard query={msg.content} />
                  ) : (
                    <AIResponseCard isLoading={false} responseText={msg.content} />
                  )}
                </div>
              ))}
              {/* Show actions after last assistant message */}
              {executedActions.length > 0 && !isLoading && (
                <div className="border-2 border-[#00FFFF]/30 bg-[#00FFFF]/5 p-6">
                  <p className="font-mono text-sm text-[#00FFFF] mb-4">ACTIONS_PERFORMED:</p>
                  <div className="flex flex-col gap-2">
                    {executedActions.map((a, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className={a.success ? "text-[#00FFFF]" : "text-red-500"}>{a.success ? "✓" : "✗"}</span>
                        <span className="font-mono text-sm text-gray-300">{a.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Input when continuing a conversation */}
          {appState === "input_active" && (
            <section className="flex flex-col gap-5 mt-4">
              <StatusBadge status={isLoading ? "PROCESSING" : "LISTENING"} user={user ? user.name.toUpperCase().replace(/\s+/g, "_") : "GUEST"} />
              <AIInput onSubmit={handleQuerySubmit} disabled={isLoading} />
              {isLoading && (
                <button onClick={handleStop} className="border-2 border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-black px-6 py-3 font-mono text-base transition-colors uppercase w-fit">
                  STOP_GENERATION
                </button>
              )}
            </section>
          )}

          {/* Loading state during response */}
          {appState === "response" && isLoading && (
            <section className="flex flex-col gap-6">
              <UserQueryCard query={userQuery} />
              <AIResponseCard isLoading={true} responseText="" />
              <button onClick={handleStop} className="border-2 border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-black px-6 py-3 font-mono text-base transition-colors uppercase w-fit">
                STOP_GENERATION
              </button>
            </section>
          )}

          {/* History + Clear - Bottom */}
          {user && (
            <section className="border-t-2 border-gray-800 pt-8 mt-8 flex flex-col gap-4">
              {conversations.length > 0 && (
                <>
                  <button onClick={() => setShowHistory(!showHistory)} className="font-mono text-sm text-gray-500 hover:text-[#00FFFF] transition-colors text-left">
                    {showHistory ? "HIDE" : "PAST_CONVERSATIONS"} ({conversations.length})
                  </button>
                  {showHistory && (
                    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                      {conversations.map(conv => (
                        <button
                          key={conv._id}
                          onClick={() => loadConversation(conv._id)}
                          className="text-left border border-gray-800 hover:border-[#00FFFF] p-4 transition-colors"
                        >
                          <p className="font-mono text-sm text-white truncate">{conv.title}</p>
                          <p className="font-mono text-xs text-gray-600">
                            {new Date(conv.updatedAt).toLocaleDateString()} | {conv.messages.length} msgs
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
              <button onClick={clearAllData} className="font-mono text-xs text-red-500/50 hover:text-red-500 transition-colors text-left mt-4">
                CLEAR_ALL_DATA
              </button>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
