"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, RefreshCw, MessageCircle, Zap, BookOpen, TrendingUp, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const STARTER_QUESTIONS = [
  { icon: TrendingUp, text: "What are the top 5 scarce skills in SA for 2025?" },
  { icon: Target, text: "How do I transition from Finance to Data Science?" },
  { icon: BookOpen, text: "What NQF qualifications do I need for cybersecurity?" },
  { icon: Zap, text: "What is a realistic salary for a mid-level software engineer in Joburg?" },
];

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: `Sawubona! I'm CareerIQ, your AI career coach specialising in the South African job market. 🇿🇦

I can help you with:
- **Career advice** tailored to SA's labour market
- **Salary intelligence** — realistic ZAR ranges by role and province
- **Skills gap analysis** — what you need to qualify for your dream role
- **NQF qualifications & SETAs** — local learning pathways
- **Industry insights** — growing vs declining sectors in SA
- **Interview coaching** — SA employer expectations

What career challenge can I help you navigate today?`,
  timestamp: new Date(),
};

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isUser ? "bg-indigo-600" : "bg-gradient-to-br from-violet-600 to-indigo-600"}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      <div className={`max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-indigo-600 text-white rounded-tr-sm"
              : "bg-card border border-border text-foreground rounded-tl-sm"
          }`}
        >
          {message.content.split("\n").map((line, i) => {
            const formatted = line
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              .replace(/\*(.*?)\*/g, "<em>$1</em>")
              .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 rounded text-xs">$1</code>');
            return (
              <div key={i} className={i > 0 ? "mt-1.5" : ""} dangerouslySetInnerHTML={{ __html: formatted || "&nbsp;" }} />
            );
          })}
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
      <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-indigo-400"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
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
  const [sessionCount] = useState(3);
  const maxFree = 10;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content || isLoading) return;
    setInput("");

    const userMsg: Message = { id: Date.now().toString(), role: "user", content, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "assistant", content: data.content, timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Career Coach</h1>
          <p className="text-muted-foreground text-sm mt-1">Powered by Claude · Specialised for South Africa&apos;s job market</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground">
            <span className="text-foreground font-medium">{sessionCount}</span>/{maxFree} free messages
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setMessages([INITIAL_MESSAGE])}>
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
            <AnimatePresence>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </AnimatePresence>
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            {/* Quick starters */}
            {messages.length === 1 && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q.text}
                    onClick={() => sendMessage(q.text)}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:border-indigo-500/30 hover:bg-indigo-500/5 text-left text-xs text-muted-foreground hover:text-foreground transition-all"
                  >
                    <q.icon className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span className="line-clamp-2">{q.text}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-end gap-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about careers in South Africa..."
                rows={1}
                className="flex-1 resize-none bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring border border-input max-h-32 min-h-[44px]"
                style={{ height: "auto" }}
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
            <p className="text-xs text-muted-foreground mt-2 text-center">
              CareerIQ is AI-powered · Not a substitute for registered career counsellors
            </p>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-64 flex-shrink-0 space-y-4">
          {/* Topics */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Suggested Topics</h3>
            <div className="space-y-1.5">
              {[
                "Scarce skills & SETA funding",
                "Salary negotiation in SA",
                "Graduate programme applications",
                "Remote work opportunities",
                "Career switching strategies",
                "SA tech industry outlook",
                "Bursary & scholarship options",
                "LinkedIn profile for SA market",
              ].map((topic) => (
                <button
                  key={topic}
                  onClick={() => sendMessage(topic)}
                  className="w-full text-left text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded hover:bg-secondary transition-colors"
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
              <span className="text-sm font-semibold text-white">Go Premium</span>
            </div>
            <p className="text-xs text-white/50 mb-3">Unlock unlimited coaching, career simulations & salary forecasting.</p>
            <Button variant="indigo" size="sm" className="w-full text-xs">
              Upgrade — R199/mo
            </Button>
          </div>

          {/* Context badge */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">AI Context</h3>
            <div className="space-y-2">
              {[
                { label: "Market Data", value: "Live 2025", color: "emerald" },
                { label: "Province", value: "SA National", color: "indigo" },
                { label: "Salary Currency", value: "ZAR", color: "amber" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <Badge variant={item.color === "emerald" ? "success" : item.color === "amber" ? "warning" : "indigo"}>
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
