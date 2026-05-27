"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User, Sparkles, RefreshCw, Zap,
  BookOpen, TrendingUp, Target, AlertCircle, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  error?: boolean;
  streaming?: boolean;
}

const STARTER_QUESTIONS = [
  { icon: TrendingUp, text: "What are the top 5 scarce skills in SA for 2026?" },
  { icon: Target, text: "How do I transition from Finance to Data Science in SA?" },
  { icon: BookOpen, text: "What NQF qualifications do I need for cybersecurity?" },
  { icon: Zap, text: "What is a realistic salary for a mid-level software engineer in Joburg?" },
];

const SUGGESTED_TOPICS = [
  "Scarce skills & SETA funding",
  "Salary negotiation in SA",
  "Graduate programme applications",
  "Remote work opportunities in SA",
  "Career switching strategies",
  "SA tech industry outlook",
  "Bursary & scholarship options",
  "LinkedIn profile for SA market",
  "Artisan trade career paths",
  "B-BBEE & employment equity",
];

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: `Sawubona! I'm CareerIQ, your AI career coach specialising in the South African job market.

I can help you with:
- **Career advice** tailored to SA's labour market — from tech to trades
- **Salary intelligence** — realistic ZAR ranges by role and province
- **Skills gap analysis** — what you need to qualify for your dream role
- **NQF qualifications & SETAs** — local learning pathways
- **Industry insights** — growing vs declining sectors in SA
- **Interview coaching** — SA employer expectations

What career challenge can I help you navigate today?`,
  timestamp: new Date(),
};

function renderContent(text: string) {
  return text.split("\n").map((line, i) => {
    const formatted = line
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 rounded text-xs font-mono">$1</code>');
    return (
      <div
        key={i}
        className={i > 0 ? "mt-1.5" : ""}
        dangerouslySetInnerHTML={{ __html: formatted || "&nbsp;" }}
      />
    );
  });
}

function MessageBubble({ message, onRetry }: { message: Message; onRetry?: (id: string) => void }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${isUser ? "bg-indigo-600" : "bg-gradient-to-br from-violet-600 to-indigo-600"}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      <div className={`max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            message.error
              ? "bg-red-500/10 border border-red-500/20 text-red-300 rounded-tl-sm"
              : isUser
              ? "bg-indigo-600 text-white rounded-tr-sm"
              : "bg-card border border-border text-foreground rounded-tl-sm"
          }`}
        >
          {message.error ? (
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p>{message.content}</p>
                {onRetry && (
                  <button
                    onClick={() => onRetry(message.id)}
                    className="mt-2 flex items-center gap-1 text-xs text-red-300 hover:text-white underline underline-offset-2 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Try again
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              {renderContent(message.content)}
              {message.streaming && (
                <motion.span
                  className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 -mb-0.5"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
              )}
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground px-1">
          {message.timestamp.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-indigo-400"
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

export default function CareerCoachPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const maxFree = 15;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Tracks the last user message for retry
  const lastUserMessageRef = useRef<string>("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text || input).trim();
    if (!content || isLoading) return;
    setInput("");
    lastUserMessageRef.current = content;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };
    const assistantId = `a-${Date.now() + 1}`;

    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: "assistant", content: "", timestamp: new Date(), streaming: true },
    ]);
    setIsLoading(true);
    setUserMessageCount((c) => c + 1);

    try {
      // Build history for Claude — must start with a user message.
      // Exclude: the static welcome message, error bubbles, and empty streaming placeholders.
      const history = [...messages, userMsg]
        .filter((m) => m.id !== "welcome" && !m.error && m.content.trim() !== "")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, context: "SA job market 2025" }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") { streamDone = true; break; }

          // Parse JSON separately from error/delta handling so real errors propagate
          let parsed: { delta?: string; error?: string } | null = null;
          try {
            parsed = JSON.parse(raw);
          } catch {
            continue; // skip malformed chunk
          }

          if (parsed?.error) throw new Error(parsed.error); // surfaces to outer catch
          if (parsed?.delta) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content + parsed!.delta }
                  : m
              )
            );
          }
        }
      }

      // Mark streaming complete
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m))
      );
    } catch (err) {
      const errMsg =
        err instanceof Error && err.message.includes("401")
          ? "Authentication issue. Please refresh the page and try again."
          : err instanceof Error && err.message.includes("500")
          ? "The AI service is temporarily unavailable. Please try again in a moment."
          : "Connection issue. Check your internet and try again.";

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: errMsg, error: true, streaming: false }
            : m
        )
      );
      setUserMessageCount((c) => Math.max(0, c - 1));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleRetry = useCallback(() => {
    // Remove last error message and resend
    setMessages((prev) => {
      const lastErr = [...prev].reverse().findIndex((m) => m.error);
      if (lastErr === -1) return prev;
      return prev.slice(0, prev.length - 1 - lastErr);
    });
    if (lastUserMessageRef.current) {
      sendMessage(lastUserMessageRef.current);
    }
  }, [sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const remainingMessages = maxFree - userMessageCount;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Career Coach</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Powered by Claude · Specialised for South Africa&apos;s job market
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground">
            <span className={`font-medium ${remainingMessages <= 3 ? "text-amber-400" : "text-foreground"}`}>
              {remainingMessages}
            </span>/{maxFree} free messages
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              setMessages([INITIAL_MESSAGE]);
              setUserMessageCount(0);
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New Chat
          </Button>
        </div>
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onRetry={msg.error ? handleRetry : undefined}
                />
              ))}
            </AnimatePresence>
            {isLoading && messages[messages.length - 1]?.content === "" && (
              <TypingIndicator />
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-border p-4">
            {/* Quick starters — shown only before first user message */}
            {userMessageCount === 0 && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q.text}
                    onClick={() => sendMessage(q.text)}
                    disabled={isLoading}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:border-indigo-500/30 hover:bg-indigo-500/5 text-left text-xs text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
                  >
                    <q.icon className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span className="line-clamp-2">{q.text}</span>
                  </button>
                ))}
              </div>
            )}

            {remainingMessages <= 3 && remainingMessages > 0 && (
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mb-3">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Only {remainingMessages} free message{remainingMessages !== 1 ? "s" : ""} remaining. Upgrade for unlimited coaching.
              </div>
            )}

            {remainingMessages === 0 ? (
              <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3">
                <p className="text-sm text-white/70">Free limit reached. Upgrade to keep chatting.</p>
                <Button variant="indigo" size="sm">Upgrade — R99/mo</Button>
              </div>
            ) : (
              <div className="flex items-end gap-3">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about careers in South Africa..."
                  rows={1}
                  disabled={isLoading}
                  className="flex-1 resize-none bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring border border-input max-h-32 min-h-[44px] disabled:opacity-60"
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = Math.min(el.scrollHeight, 128) + "px";
                  }}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  variant="indigo"
                  size="icon"
                  className="h-11 w-11 rounded-xl flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-2 text-center">
              CareerIQ is AI-powered · Not a substitute for registered career counsellors
            </p>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-64 flex-shrink-0 space-y-4">
          {/* Topics */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Suggested Topics
            </h3>
            <div className="space-y-1">
              {SUGGESTED_TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => sendMessage(topic)}
                  disabled={isLoading || remainingMessages === 0}
                  className="w-full text-left text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded hover:bg-secondary transition-colors disabled:opacity-40"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Upgrade */}
          <div className="bg-gradient-to-br from-indigo-600/15 to-violet-600/10 border border-indigo-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-white">Go Professional</span>
            </div>
            <p className="text-xs text-white/50 mb-3">
              Unlimited coaching, career simulations & salary forecasting.
            </p>
            <Button variant="indigo" size="sm" className="w-full text-xs">
              Upgrade — R99/mo
            </Button>
          </div>

          {/* AI Context */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              AI Context
            </h3>
            <div className="space-y-2">
              {[
                { label: "Market Data", value: "Live 2025", color: "emerald" },
                { label: "Province", value: "SA National", color: "indigo" },
                { label: "Salary Currency", value: "ZAR", color: "amber" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <Badge
                    variant={
                      item.color === "emerald"
                        ? "success"
                        : item.color === "amber"
                        ? "warning"
                        : "indigo"
                    }
                  >
                    {item.value}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
