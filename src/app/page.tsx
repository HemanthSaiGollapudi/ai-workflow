"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Terminal, 
  Send, 
  Zap, 
  RefreshCw, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Copy,
  Check,
  Plus,
  Trash2,
  Clock,
  MessageSquare
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

interface TraceLog {
  timestamp: string;
  type: "info" | "success" | "error" | "api";
  message: string;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export default function TestPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "streaming" | "success" | "error">("idle");
  const [logs, setLogs] = useState<TraceLog[]>([]);
  const [latency, setLatency] = useState<number | null>(null);

  // Chat Memory States
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const responseContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (responseContainerRef.current) {
      responseContainerRef.current.scrollTop = responseContainerRef.current.scrollHeight;
    }
  }, [response, status]);

  const fetchSessions = async () => {
    setSidebarLoading(true);
    try {
      const res = await fetch("/api/chat/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (e) {
      console.error("Failed to fetch sessions", e);
    } finally {
      setSidebarLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const loadSession = async (sessionId: string) => {
    setStatus("loading");
    setResponse("");
    setLogs([]);
    setLatency(null);
    addLog(`Loading session node [${sessionId.substring(0, 8)}]...`, "info");
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`);
      if (!res.ok) throw new Error("Failed to fetch session messages.");
      const data = await res.json();
      
      setCurrentSessionId(sessionId);
      
      const userMsgs = data.messages.filter((m: any) => m.role === "user");
      const modelMsgs = data.messages.filter((m: any) => m.role === "model");
      
      if (userMsgs.length > 0) {
        setPrompt(userMsgs[userMsgs.length - 1].content);
      } else {
        setPrompt("");
      }
      
      if (modelMsgs.length > 0) {
        setResponse(modelMsgs[modelMsgs.length - 1].content);
        setStatus("success");
        addLog("Session restored successfully.", "success");
      } else {
        setResponse("");
        setStatus("idle");
        addLog("Session loaded (no replies found).", "info");
      }
    } catch (error: any) {
      console.error(error);
      setStatus("error");
      setResponse(error.message || "Failed to restore session.");
      addLog(`Session load failed: ${error.message || String(error)}`, "error");
    }
  };

  const deleteSession = async (sessionId: string) => {
    addLog(`Deleting session node [${sessionId.substring(0, 8)}]...`, "info");
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        addLog("Session deleted from database.", "success");
        if (currentSessionId === sessionId) {
          startNewChat();
        }
        fetchSessions();
      } else {
        throw new Error("Failed to delete session.");
      }
    } catch (error: any) {
      console.error(error);
      addLog(`Deletion failed: ${error.message || String(error)}`, "error");
    }
  };

  const startNewChat = () => {
    setCurrentSessionId(null);
    setPrompt("");
    setResponse("");
    setStatus("idle");
    setLogs([]);
    setLatency(null);
    addLog("Terminal session initialized.", "info");
  };

  const addLog = (message: string, type: TraceLog["type"] = "info") => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp: time, type, message }]);
  };

  const copyToClipboard = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectPreset = (presetText: string) => {
    setPrompt(presetText);
    addLog(`Loaded preset prompt: "${presetText.substring(0, 40)}..."`, "info");
  };

  const runAI = async () => {
    if (!prompt.trim()) {
      addLog("Cannot run empty prompt.", "error");
      return;
    }

    const startTime = performance.now();
    setStatus("loading");
    setResponse("");
    setLogs([]);
    setLatency(null);

    addLog("Initializing Cognitive Executor node...", "info");
    addLog("Validating request schema...", "info");
    addLog("Connecting to Gemini API Gateway...", "api");
    addLog("Streaming content request to model 'gemini-2.5-flash'...", "api");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          stream: true,
          sessionId: currentSessionId || "new",
        }),
      });

      if (!res.ok) {
        let errorMsg = "Gemini connection failed";
        try {
          const errData = await res.json();
          errorMsg = errData.error || errData.reply || errorMsg;
        } catch {
          try {
            errorMsg = await res.text();
          } catch {}
        }
        throw new Error(errorMsg);
      }

      // Read session ID from headers to sync with database session
      const returnedSessionId = res.headers.get("X-Session-Id");
      if (returnedSessionId) {
        setCurrentSessionId(returnedSessionId);
        fetchSessions();
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) {
        throw new Error("Response body is not readable.");
      }

      setStatus("streaming");
      addLog("Cognitive stream established. Decoding frames...", "info");

      let currentReply = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        currentReply += chunk;
        setResponse(currentReply);
      }

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      setLatency(duration);
      setStatus("success");
      addLog(`Response received from gemini-2.5-flash in ${duration}ms.`, "success");
      addLog("Response parsing complete.", "success");
      fetchSessions(); // Refresh updated timestamp in sidebar
    } catch (error: any) {
      console.error(error);
      setStatus("error");
      setResponse(error.message || "Error connecting to Gemini API.");
      addLog(`Network exception: ${error.message || String(error)}`, "error");
    }
  };

  const clearConsole = () => {
    startNewChat();
  };

  const presets = [
    {
      title: "Generate Database Schema",
      text: "Create a modern Prisma schema for a real-time collaborative workspace, including User, Session, Workspace, and ActivityLog models with appropriate relations.",
    },
    {
      title: "Optimize Telemetry Script",
      text: "Write a high-performance TypeScript helper function to aggregate and smooth live telemetry data streams (such as CPU load, socket connections, and token throughput) using a sliding window algorithm.",
    },
    {
      title: "Create Workflow Node",
      text: "Explain how to structure an autonomous Next.js worker node that periodically queries a third-party API, parses it, validates it with Zod, and pushes changes to a PostgreSQL database.",
    }
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar navigation */}
      <Sidebar onOpenCommandPalette={() => setIsPaletteOpen(true)} />

      {/* Main Workspace */}
      <main className="flex-1 pl-72 pr-6 py-6 flex flex-col gap-6 relative z-10">
        {/* Top Header Section */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'loading' || status === 'streaming' ? 'bg-violet-400' : 'bg-cyan-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'loading' || status === 'streaming' ? 'bg-violet-500' : 'bg-cyan-500'}`}></span>
              </span>
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                AetherOS Core // Cognitive Runner
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans flex items-center gap-2.5">
              AI Workflow Playground <span className="text-xs font-mono font-normal px-2 py-0.5 rounded border border-cyan-500/20 bg-cyan-500/5 text-cyan-400">v2.5</span>
            </h1>
            <p className="text-zinc-400 text-xs mt-1">
              Test real-time workflow generations powered by the latest production-ready <code className="text-violet-400 font-mono">gemini-2.5-flash</code> model.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/test"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-zinc-400 hover:text-white hover:bg-white/10 transition-all font-mono"
            >
              Go to /test <ArrowRight className="h-3 w-3" />
            </a>
            <a
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/5 text-xs text-cyan-400 hover:bg-cyan-500/10 transition-all font-mono"
            >
              Telemetry Cockpit
            </a>
          </div>
        </header>

        {/* Main Grid Workspace */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 items-stretch">
          {/* Chat History Sidebar */}
          <div className="xl:col-span-1 glass-panel border-white/5 rounded-2xl p-4 bg-black/40 flex flex-col justify-between min-h-[500px]">
            <div className="flex-1 flex flex-col overflow-hidden">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-3">
                COGNITIVE STREAMS
              </span>

              <button
                onClick={startNewChat}
                className="w-full mb-4 py-2 text-xs font-mono btn-neon-violet rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Initialize Node</span>
              </button>

              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[360px]">
                {sidebarLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-zinc-600 font-mono text-[10px] gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-violet-400" />
                    <span>SYNCHRONIZING READS...</span>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-zinc-600 italic text-center py-12 text-[10px] font-mono">
                    No streams captured.
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => loadSession(session.id)}
                      className={`relative group w-full text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-1 ${
                        currentSessionId === session.id
                          ? "bg-violet-500/10 border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)] text-white"
                          : "bg-white/3 hover:bg-white/5 border-white/5 hover:border-white/10 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-start gap-2 pr-6">
                        <MessageSquare className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${currentSessionId === session.id ? "text-violet-400" : "text-zinc-600"}`} />
                        <span className="text-xs font-semibold font-mono truncate leading-normal">
                          {session.title}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1 text-[9px] font-mono text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>
                          {new Date(session.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        className="absolute top-2.5 right-2.5 p-1 rounded border border-transparent hover:border-white/10 text-zinc-600 hover:text-rose-400 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        title="Delete Session"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>ACTIVE COGNITION</span>
              <span className="text-violet-400 flex items-center gap-1 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                {currentSessionId ? "SYNCED" : "EPHEMERAL"}
              </span>
            </div>
          </div>

          {/* Playground Workspace Inputs & Outputs */}
          <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Column: Command & Input */}
            <div className="space-y-6">
              <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4.5 w-4.5 text-violet-400" />
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Prompt Payload</span>
                  </div>
                  <button 
                    onClick={clearConsole}
                    className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> Reset
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={status === "loading" || status === "streaming"}
                    placeholder="Instruct the AI model... (e.g. Generate a Next.js helper script)"
                    className={`w-full h-64 p-4 bg-zinc-950/80 border border-white/5 focus:border-violet-500/50 rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500/20 font-sans resize-none transition-all ${(status === "loading" || status === "streaming") ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    {status === "loading" ? (
                      <span className="flex items-center gap-1.5 text-xs font-mono text-violet-400 animate-pulse">
                        <RefreshCw className="h-3 w-3 animate-spin" /> DISPATCHING ENGINE...
                      </span>
                    ) : status === "streaming" ? (
                      <span className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 animate-pulse">
                        <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '3s' }} /> COGNITIVE STREAM ACTIVE...
                      </span>
                    ) : status === "success" ? (
                      <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                        <CheckCircle className="h-3.5 w-3.5" /> AGENT ONLINE
                      </span>
                    ) : status === "error" ? (
                      <span className="flex items-center gap-1.5 text-xs font-mono text-rose-400 animate-pulse">
                        <AlertCircle className="h-3.5 w-3.5" /> CONNECTION FAILURE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
                        <Zap className="h-3 w-3" /> READY FOR DEPLOYMENT
                      </span>
                    )}
                  </div>

                  <button
                    onClick={runAI}
                    disabled={status === "loading" || status === "streaming"}
                    className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-mono text-xs cursor-pointer transition-all ${
                      (status === "loading" || status === "streaming")
                        ? "bg-zinc-800 border border-zinc-700 text-zinc-500 cursor-not-allowed"
                        : "btn-neon-violet text-white"
                    }`}
                  >
                    {status === "loading" ? "Executing..." : status === "streaming" ? "Streaming..." : "Run AI"}
                    <Send className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Quick presets */}
              <div className="glass-panel rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Quick Presets</span>
                </div>
                <div className="space-y-3">
                  {presets.map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => selectPreset(preset.text)}
                      className="w-full text-left p-3 rounded-xl bg-white/3 hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all group flex flex-col gap-1"
                    >
                      <span className="text-xs font-bold text-zinc-200 group-hover:text-cyan-400 transition-colors font-mono">
                        {preset.title}
                      </span>
                      <span className="text-[11px] text-zinc-500 line-clamp-1 leading-relaxed">
                        {preset.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Execution trace & response output */}
            <div className="space-y-6">
              {/* Diagnostic Trace Logs */}
              <div className="glass-panel rounded-2xl p-6 bg-black/40">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-3">Diagnostic Trace Feed</span>
                <div className="min-h-[120px] max-h-[140px] overflow-y-auto bg-zinc-950/80 border border-white/5 rounded-xl p-3.5 font-mono text-[10px] space-y-1.5 text-left">
                  {logs.length === 0 ? (
                    <div className="text-zinc-600 italic">No instructions dispatched yet. Logs will print here during run.</div>
                  ) : (
                    logs.map((log, i) => {
                      let color = "text-zinc-400";
                      if (log.type === "success") color = "text-emerald-400";
                      if (log.type === "error") color = "text-rose-400 font-semibold";
                      if (log.type === "api") color = "text-cyan-400";

                      return (
                        <div key={i} className={color}>
                          <span className="text-zinc-600 mr-2">[{log.timestamp}]</span>
                          {log.message}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Response Pane */}
              <div className="glass-panel rounded-2xl p-6 bg-black/20 flex flex-col min-h-[300px]">
                <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Aether Response Console</span>
                  <div className="flex items-center gap-3">
                    {latency !== null && (
                      <span className="text-[10px] font-mono text-zinc-500">
                        LATENCY: <strong className="text-cyan-400">{latency}ms</strong>
                      </span>
                    )}
                    <button
                      onClick={copyToClipboard}
                      disabled={!response}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono border transition-all ${
                        !response
                          ? "border-zinc-800 text-zinc-600 cursor-not-allowed"
                          : copied
                          ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                          : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div ref={responseContainerRef} className="flex-1 overflow-y-auto max-h-[340px] bg-zinc-950/40 border border-white/5 rounded-xl p-4 font-mono text-xs text-zinc-300 text-left whitespace-pre-wrap select-text">
                  {status === "loading" ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-zinc-500 gap-4">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-12 h-12 rounded-full border border-violet-500/30 animate-ping" />
                        <div className="absolute w-8 h-8 rounded-full border border-violet-400/50 animate-pulse" />
                        <RefreshCw className="h-6 w-6 animate-spin text-violet-400 relative z-10" />
                      </div>
                      <span className="text-[11px] font-mono tracking-wider text-zinc-400 animate-pulse uppercase">
                        Establishing Cognitive Neural Stream...
                      </span>
                    </div>
                  ) : (status === "streaming" || response) ? (
                    <div className="relative">
                      {response}
                      {status === "streaming" && (
                        <span className="inline-block w-1.5 h-3.5 ml-1 bg-violet-400 animate-pulse align-middle" />
                      )}
                    </div>
                  ) : (
                    <div className="text-zinc-600 italic py-20 text-center">
                      Ready to trigger cognitive pipeline. Enter a prompt or select a preset and click &quot;Run AI&quot;.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}