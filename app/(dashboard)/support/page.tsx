"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeadphonesIcon, Send, Loader2, Mail, RefreshCw,
  ChevronRight, AlertCircle, CheckCircle2, User, Bot,
  CreditCard, FileText, MessageCircle, Zap, HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id:        string;
  role:      "user" | "assistant";
  content:   string;
  loading?:  boolean;
}

// ── Suggested starter questions ───────────────────────────────────────────────

const SUGGESTIONS = [
  { icon: MessageCircle, text: "Why did my AI messages stop?",            category: "limits"   },
  { icon: CreditCard,    text: "I paid but my plan didn't update",        category: "billing"  },
  { icon: FileText,      text: "My CV won't upload — how do I fix it?",   category: "cv"       },
  { icon: Zap,           text: "How do I use my free credits?",           category: "credits"  },
  { icon: RefreshCw,     text: "My plan expired — what happens to my data?", category: "plan" },
  { icon: HelpCircle,    text: "What's the difference between the plans?", category: "plans"   },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).slice(2);
}

function formatContent(text: string) {
  // Convert markdown-style bold and line breaks for display
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br />");
}

// ── Message bubble ─────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isUser ? "bg-indigo-600" : "bg-amber-500/20 border border-amber-500/30"
      }`}>
        {isUser
          ? <User className="w-3.5 h-3.5 text-white" />
          : <Bot  className="w-3.5 h-3.5 text-amber-400" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
        isUser
          ? "bg-indigo-600 text-white rounded-tr-sm"
          : "bg-card border border-border text-foreground rounded-tl-sm"
      }`}>
        {message.loading ? (
          <span className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Thinking…
          </span>
        ) : (
          <span
            dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
          />
        )}
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SupportPage() {
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [input,     setInput]     = useState("");
  const [streaming, setStreaming] = useState(false);
  const [started,   setStarted]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    setInput("");
    setStarted(true);

    const userMsg: Message = { id: generateId(), role: "user", content: trimmed };
    const assistantId = generateId();
    const loadingMsg: Message = { id: assistantId, role: "assistant", content: "", loading: true };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setStreaming(true);

    try {
      const history = [...messages, userMsg].map(({ role, content }) => ({ role, content }));

      const res = await fetch("/api/support/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: history }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Error ${res.status}`);
      }

      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let   full    = "";

      // Replace loading bubble with streaming content
      setMessages((prev) =>
        prev.map((m) => m.id === assistantId ? { ...m, content: "", loading: false } : m)
      );

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.delta) {
              full += parsed.delta;
              setMessages((prev) =>
                prev.map((m) => m.id === assistantId ? { ...m, content: full } : m)
              );
            }
            if (parsed.error) throw new Error(parsed.error);
          } catch { /* ignore non-JSON lines */ }
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Sorry, something went wrong. Please try again or email support@careerintelsa.co.za", loading: false }
            : m
        )
      );
    } finally {
      setStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const reset = () => {
    setMessages([]);
    setStarted(false);
    setInput("");
  };

  return (
    <div className="max-w-3xl space-y-0 flex flex-col h-[calc(100vh-8rem)]">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
            <HeadphonesIcon className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Help & Support</h1>
            <p className="text-xs text-muted-foreground">
              AI support · available 24/7 · escalates to a human when needed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {started && (
            <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              New chat
            </Button>
          )}
          <a
            href="mailto:support@careerintelsa.co.za"
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-border hover:border-amber-500/30 hover:bg-amber-500/5 text-muted-foreground hover:text-foreground transition-all"
          >
            <Mail className="w-3.5 h-3.5" />
            Email us
          </a>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-background/50 p-4 space-y-4 min-h-0">
        {!started ? (
          /* Welcome / suggestions screen */
          <div className="flex flex-col items-center justify-center h-full py-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center mx-auto">
                <HeadphonesIcon className="w-7 h-7 text-amber-400" />
              </div>
              <h2 className="text-lg font-bold text-foreground">How can I help you today?</h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                I can help with platform issues, billing questions, feature explanations, and troubleshooting.
              </p>
            </div>

            {/* Suggestion chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.text}
                  onClick={() => sendMessage(s.text)}
                  className="flex items-center gap-2.5 text-left px-3.5 py-2.5 rounded-xl border border-border hover:border-amber-500/30 hover:bg-amber-500/5 text-sm text-muted-foreground hover:text-foreground transition-all group"
                >
                  <s.icon className="w-4 h-4 text-amber-400/70 group-hover:text-amber-400 flex-shrink-0" />
                  <span>{s.text}</span>
                </button>
              ))}
            </div>

            {/* Escalation callout */}
            <div className="flex items-start gap-3 bg-secondary border border-border rounded-xl px-4 py-3 w-full max-w-lg text-xs text-muted-foreground">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-foreground font-medium">Prefer to email us directly?</span>
                {" "}Reach our team at{" "}
                <a href="mailto:support@careerintelsa.co.za" className="text-amber-400 hover:text-amber-300 font-medium">
                  support@careerintelsa.co.za
                </a>
                {" "}— we respond within 24–48 business hours.
              </div>
            </div>
          </div>
        ) : (
          /* Message thread */
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 pt-3 space-y-2">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }}}
            placeholder="Describe your issue…"
            disabled={streaming}
            className="flex-1"
          />
          <Button
            variant="indigo"
            size="sm"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || streaming}
            className="px-4 gap-1.5"
          >
            {streaming
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />}
            {streaming ? "Sending…" : "Send"}
          </Button>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 px-1">
          <span>Billing & refunds → <a href="mailto:legal@careerintelsa.co.za" className="hover:text-muted-foreground">legal@careerintelsa.co.za</a></span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500/60" />
            Available 24/7
          </span>
        </div>
      </div>

    </div>
  );
}
