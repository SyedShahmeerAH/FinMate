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
import { useAuth } from "@/contexts/AuthContext";
import LandingPage from "@/components/LandingPage";

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
  const { user, loading: authLoading } = useAuth();
  const [userQuery, setUserQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [executedActions, setExecutedActions] = useState<ExecutedAction[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
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
      setMessages(conv.messages);
      setConversationId(conv._id);
      setShowHistory(false);
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
      resetChat();
      window.location.reload();
    } catch { /* silent */ }
  };

  const handleQuerySubmit = async (query: string) => {
    const newMessages: Message[] = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    setUserQuery(query);
    setIsLoading(true);
    setExecutedActions([]);

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

      let finalText = text;
      const convMatch = text.match(/^\[CONV_ID:(.*?)\]\n/);
      if (convMatch) {
        setConversationId(convMatch[1]);
        finalText = text.substring(convMatch[0].length);
      }

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
      }

      setExecutedActions(actions);
      const updated = [...newMessages, { role: "assistant" as const, content: displayText }];
      setMessages(updated);
      fetchConversations();
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        const errorMsg = { role: "assistant" as const, content: "Connection failed. Try again." };
        setMessages([...newMessages, errorMsg]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const resetChat = () => {
    setExecutedActions([]);
    setUserQuery("");
    setMessages([]);
    setConversationId(null);
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  };

  const isGreeting = messages.length === 0 && !isLoading;

  // Show landing page for signed-out users
  if (!authLoading && !user) {
    return <LandingPage />;
  }

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-mesh grain flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in-up">
          <div className="w-12 h-12 rounded-full border-2 border-[var(--cyan)]/30 border-t-[var(--cyan)] animate-spin mx-auto" />
          <p className="text-sm text-white/20">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Sidebar activeNav="ai" />
      <main className="md:ml-[296px] min-h-screen p-6 md:p-12 lg:p-16">
        <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-32">

          {/* GREETING */}
          {isGreeting && (
            <section className="flex flex-col gap-10 pt-16 md:pt-24">
              <div className="space-y-6">
                <StatusBadge
                  status="LISTENING"
                  user={user ? user.name.toUpperCase().replace(/\s+/g, "_") : "GUEST"}
                />
                <HeroSection
                  headline={user ? `Welcome, ${user.name}.` : "System Online."}
                  subline="How can I optimize your capital?"
                />
              </div>
              <div className="flex flex-col gap-5">
                <AIInput onSubmit={handleQuerySubmit} disabled={false} />
                <SuggestedQueries onSelect={(q) => handleQuerySubmit(q)} />
              </div>
            </section>
          )}

          {/* LOADING — only while waiting for API */}
          {!isGreeting && isLoading && (
            <section className="flex flex-col gap-6 pt-8">
              <UserQueryCard query={userQuery} />
              <AIResponseCard isLoading={true} responseText="" />
              <button
                onClick={handleStop}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-red-400/20 bg-red-400/5 text-red-400 text-sm hover:bg-red-400/10 transition-all duration-300 w-fit active:scale-[0.97]"
              >
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                Stop
              </button>
            </section>
          )}

          {/* CONVERSATION — always renders when messages exist and not loading */}
          {!isGreeting && !isLoading && (
            <section className="flex flex-col gap-6 pt-8">
              {messages.map((msg, i) => (
                <div key={i} className="flex flex-col gap-4">
                  {i > 0 && <ThreadDivider />}
                  {msg.role === "user" ? (
                    <UserQueryCard query={msg.content} />
                  ) : (
                    <AIResponseCard isLoading={false} responseText={msg.content} />
                  )}
                </div>
              ))}

              {executedActions.length > 0 && (
                <div className="doppelrand">
                  <div className="doppelrand-inner p-6">
                    <p className="text-xs uppercase tracking-[0.15em] text-[var(--cyan)] mb-4">Actions Performed</p>
                    <div className="flex flex-col gap-2">
                      {executedActions.map((a, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className={`text-sm ${a.success ? "text-[var(--cyan)]" : "text-red-400"}`}>
                            {a.success ? "\u2713" : "\u2717"}
                          </span>
                          <span className="text-sm text-white/40">{a.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-5 mt-4">
                <StatusBadge
                  status="LISTENING"
                  user={user ? user.name.toUpperCase().replace(/\s+/g, "_") : "GUEST"}
                />
                <AIInput onSubmit={handleQuerySubmit} disabled={false} />
              </div>
            </section>
          )}

          {/* HISTORY + CLEAR */}
          {user && (
            <section className="border-t border-white/[0.04] pt-8 mt-8 flex flex-col gap-4">
              {conversations.length > 0 && (
                <>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-xs text-white/20 hover:text-[var(--cyan)] transition-colors duration-300 text-left"
                  >
                    {showHistory ? "Hide" : "Past conversations"} ({conversations.length})
                  </button>
                  {showHistory && (
                    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                      {conversations.map((conv) => (
                        <button
                          key={conv._id}
                          onClick={() => loadConversation(conv._id)}
                          className="text-left rounded-2xl border border-white/[0.04] hover:border-white/[0.1] bg-white/[0.01] hover:bg-white/[0.03] px-5 py-4 transition-all duration-300"
                        >
                          <p className="text-sm text-white/60 truncate">{conv.title}</p>
                          <p className="text-[11px] text-white/15 mt-1">
                            {new Date(conv.updatedAt).toLocaleDateString()} · {conv.messages.length} messages
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
              <button
                onClick={clearAllData}
                className="text-xs text-white/10 hover:text-red-400/60 transition-colors duration-300 text-left mt-4"
              >
                Clear all data
              </button>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
