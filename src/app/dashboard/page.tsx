"use client";

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Cpu,
  Database,
  DollarSign,
  Terminal as TermIcon,
  Play,
  Pause,
  Trash2,
  Send,
  MessageSquare,
  X,
  Sparkles,
  Search,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from "recharts";

// Initial Telemetry Data
const initialThroughputData = [
  { time: "10s ago", value: 120 },
  { time: "9s ago", value: 150 },
  { time: "8s ago", value: 140 },
  { time: "7s ago", value: 180 },
  { time: "6s ago", value: 240 },
  { time: "5s ago", value: 210 },
  { time: "4s ago", value: 290 },
  { time: "3s ago", value: 310 },
  { time: "2s ago", value: 280 },
  { time: "1s ago", value: 330 },
];

const mockLogs = [
  "[SYSTEM] Kernel initialized. Booting AetherOS Core executor nodes...",
  "[SYS] Connection validated to PostgreSQL Prisma instance. Latency: 2.1ms",
  "[WORKER] Worker node #12 deployed to AWS us-east-1 serverless cluster.",
  "[AGENT] Routine [HN sentiment analysis] triggered by Cron scheduler.",
  "[TOOL] Invoked WebScraper on: https://news.ycombinator.com",
  "[LLM] Context tokens sent: 4,096. Prompt: 'Scrape and categorize stories.'",
  "[LLM] Response received. Model: GPT-4o-mini. Execution: 412ms.",
  "[EVAL] Schema validation PASSED. JSON matched required structural type.",
  "[PRISMA] Writing 15 serialized objects to table 'HNSentimentLogs'...",
  "[METRICS] Computed workflow efficiency index: 94.2%. Cost: $0.0012",
  "[SYSTEM] Pipeline completed successfully. Entering cooldown state.",
];

const randomLogTemplates = [
  "[WORKER] Scaling worker cluster. Active instances: 14",
  "[AGENT] Evaluator agent checking database entries for anomalies...",
  "[SYS] Database backup sync initialized. 4.2 MB serialized.",
  "[TOOL] Invoked VectorStore query: 'Find similar sentiment models'",
  "[LLM] Parsing user query with Anthropic Claude 3.5 Sonnet...",
  "[EVAL] JSON schema checked. Code compilation PASSED.",
  "[PRISMA] Completed transaction block in 8.4ms. 1 record modified.",
  "[METRICS] Live telemetry update sent to dashboard. Ingest: 330 tok/s",
];

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [throughputData, setThroughputData] = useState(initialThroughputData);
  const [tokensPerSec, setTokensPerSec] = useState(330);
  const [logs, setLogs] = useState<string[]>(mockLogs);
  const [isLogsPaused, setIsLogsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Command Palette Open state
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Floating AI Chat Panel State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      role: "assistant",
      content:
        "Welcome to the AetherOS Telemetry Cockpit. I am your AI Architect. Ask me to analyze performance anomalies, generate new Prisma schema nodes, or draft execution pipelines.",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiThinkingLog, setAiThinkingLog] = useState("");

  const logsEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Listen to global cache clean
  useEffect(() => {
    setMounted(true);

    const handleClearLogs = () => {
      setLogs(["[SYSTEM] OS Cache flushed. System telemetry logs cleared."]);
    };
    const handleTogglePalette = () => {
      setIsPaletteOpen((prev) => !prev);
    };

    window.addEventListener("clear-system-logs", handleClearLogs);
    window.addEventListener("toggle-command-palette", handleTogglePalette);

    return () => {
      window.removeEventListener("clear-system-logs", handleClearLogs);
      window.removeEventListener("toggle-command-palette", handleTogglePalette);
    };
  }, []);

  // Live telemetry updates (Simulation tick)
  useEffect(() => {
    if (isLogsPaused) return;

    const interval = setInterval(() => {
      // 1. Update charts with new values
      setThroughputData((prev) => {
        const next = [...prev.slice(1)];
        const newValue = Math.floor(200 + Math.random() * 200);
        next.push({ time: `${new Date().getSeconds()}s`, value: newValue });
        setTokensPerSec(newValue);
        return next;
      });

      // 2. Add random logs
      const randomLog =
        randomLogTemplates[Math.floor(Math.random() * randomLogTemplates.length)];
      const timestamp = `[${new Date().toLocaleTimeString()}] `;
      setLogs((prev) => [...prev, timestamp + randomLog]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLogsPaused]);

  // Scroll logs to bottom
  useEffect(() => {
    if (!isLogsPaused) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isLogsPaused]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages, isAiThinking, aiThinkingLog]);

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    const userMsg = { role: "user", content: userInput };
    setAiMessages((prev) => [...prev, userMsg]);
    setUserInput("");
    setIsAiThinking(true);

    // AI steps simulation
    const steps = [
      "Interpreting user query tokens...",
      "Analyzing database schema metrics...",
      "Simulating pipeline throughput logs...",
      "Compiling final AI suggestion response...",
    ];

    let currentStep = 0;
    const stepInterval = setInterval(() => {
      if (currentStep < steps.length) {
        setAiThinkingLog(steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(stepInterval);
        setIsAiThinking(false);
        setAiThinkingLog("");

        // Generate response based on keywords
        let reply = "Processing complete. The telemetry diagnostics are running within optimal limits. Uptime is at 99.98% and CPU latencies average 4.2ms. Let me know if you would like me to trigger a mock diagnostic run via the command palette.";
        const query = userInput.toLowerCase();
        if (query.includes("schema") || query.includes("database") || query.includes("prisma")) {
          reply = "I've inspected the active workspace. Your core `schema.prisma` is loaded. It seems you have models configured for Agent runs. To sync, you can run `prisma db push` in your dev shell or ask me to draft a new relation block.";
        } else if (query.includes("performance") || query.includes("slow") || query.includes("telemetry")) {
          reply = "Looking at the throughput Area charts, I detected a slight token congestion peak around 12:00. This was caused by concurrent scraper workers querying the HackerNews API. Uptime was unaffected.";
        } else if (query.includes("workflow") || query.includes("builder")) {
          reply = "To design or modify a workflow, navigate to the **Workflow Workspace** on the sidebar. You can use the drag-and-drop node canvas to connect AI Prompts, DB sync nodes, and trigger simulations.";
        }

        setAiMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      }
    }, 1200);
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar navigation */}
      <Sidebar onOpenCommandPalette={() => setIsPaletteOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 pl-72 pr-8 py-6 flex flex-col gap-6 relative z-10">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
              Telemetry Cockpit
            </h2>
            <p className="text-xs text-zinc-500 font-mono">Real-time Agentic Telemetry & Activity Feed</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search / AI Command Bar Trigger */}
            <button
              onClick={() => setIsPaletteOpen(true)}
              className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-zinc-400 hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              <Search className="h-3.5 w-3.5 text-zinc-500" />
              <span>Search actions (Cmd+K)</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-[10px] font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              SYS SPEED: 330 TOK/S
            </div>
          </div>
        </header>

        {/* Telemetry Stats Grid (Micro-Charts & Stats) */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Stat 1: Throughput */}
          <div className="glass-panel border-white/5 rounded-xl p-4 flex flex-col justify-between h-36">
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
              <span>TOKEN THROUGHPUT</span>
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-extrabold text-white font-mono">
                {tokensPerSec} <span className="text-xs text-zinc-500 font-normal">tok/s</span>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono mt-1">+14.2% since boot</p>
            </div>
            <div className="h-10 w-full overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={throughputData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#06b6d4"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stat 2: Success Rate */}
          <div className="glass-panel border-white/5 rounded-xl p-4 flex flex-col justify-between h-36">
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
              <span>SUCCESS RATE</span>
              <Cpu className="h-3.5 w-3.5 text-violet-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-extrabold text-white font-mono">99.98%</div>
              <p className="text-[10px] text-emerald-400 font-mono mt-1">12,482 runs validated</p>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 w-[99.98%]" />
            </div>
          </div>

          {/* Stat 3: Cost Efficiency */}
          <div className="glass-panel border-white/5 rounded-xl p-4 flex flex-col justify-between h-36">
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
              <span>COMPUTE COST SAVED</span>
              <DollarSign className="h-3.5 w-3.5 text-yellow-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-extrabold text-white font-mono">$421.80</div>
              <p className="text-[10px] text-zinc-500 font-mono mt-1">Caching hit rate: 82%</p>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 w-[82%]" />
            </div>
          </div>

          {/* Stat 4: Active Agents */}
          <div className="glass-panel border-white/5 rounded-xl p-4 flex flex-col justify-between h-36">
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
              <span>ACTIVE AGENTS</span>
              <Database className="h-3.5 w-3.5 text-pink-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-extrabold text-white font-mono">12 / 15</div>
              <p className="text-[10px] text-pink-400 font-mono mt-1">3 nodes in idle standby</p>
            </div>
            <div className="flex gap-1">
              {[...Array(15)].map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-sm ${
                    i < 12 ? "bg-pink-500 animate-pulse" : "bg-zinc-800"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Telemetry Charts & Execution timeline */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Throughput Area Chart */}
          <div className="lg:col-span-2 glass-panel border-white/5 rounded-2xl p-6 bg-black/40 h-96 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">CORE OPERATION DIAGNOSTIC LEVEL</span>
              <span className="text-[10px] font-mono text-cyan-400">Live 1s tick</span>
            </div>

            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={throughputData}>
                  <defs>
                    <linearGradient id="glowThroughput" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#3f3f46" fontSize={8} tickLine={false} />
                  <YAxis stroke="#3f3f46" fontSize={8} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10,10,15,0.95)",
                      borderColor: "rgba(255,255,255,0.1)",
                      color: "#fff",
                      fontSize: 10,
                      fontFamily: "monospace",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#06b6d4"
                    fillOpacity={1}
                    fill="url(#glowThroughput)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Execution Timeline */}
          <div className="glass-panel border-white/5 rounded-2xl p-6 bg-black/40 h-96 flex flex-col justify-between">
            <span className="text-xs font-mono text-zinc-400">ACTIVE EXECUTION PIPELINE</span>

            <div className="flex-1 overflow-y-auto space-y-5 mt-5 pr-2">
              {[
                { time: "04:12:09", label: "Cron Scheduler Hook Fired", desc: "Cron routine triggered worker pipeline", status: "success" },
                { time: "04:12:10", label: "Scraped HackerNews API", desc: "Returned 15 stories", status: "success" },
                { time: "04:12:11", label: "AI Evaluator Agent Model", desc: "LLM parsed and score story metrics", status: "processing" },
                { time: "04:12:12", label: "Prisma Database Serialization", desc: "Sync payload with tables", status: "pending" },
                { time: "04:12:13", label: "Metrics Aggregation Engine", desc: "Compile telemetry metrics", status: "pending" },
              ].map((step, i) => (
                <div key={i} className="flex gap-3 text-left">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-4.5 w-4.5 rounded-full flex items-center justify-center border text-[8px] font-mono ${
                        step.status === "success"
                          ? "bg-green-500/10 border-green-500 text-green-400"
                          : step.status === "processing"
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-400 animate-pulse"
                          : "bg-zinc-900 border-zinc-800 text-zinc-600"
                      }`}
                    >
                      {step.status === "success" ? "✓" : i + 1}
                    </div>
                    {i < 4 && <div className="w-[1px] h-8 bg-zinc-800" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs font-bold leading-none ${step.status === "processing" ? "text-cyan-400" : "text-zinc-200"}`}>
                        {step.label}
                      </h4>
                      <span className="text-[9px] font-mono text-zinc-500">{step.time}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-tight">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Logs Terminal Console */}
        <section className="glass-panel border-white/5 rounded-2xl p-6 bg-black/40 flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <TermIcon className="h-4.5 w-4.5 text-cyan-400" />
              <span className="text-xs font-mono text-zinc-400">SYSTEM FEED EXECUTOR LOG</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <button
                onClick={() => setIsLogsPaused(!isLogsPaused)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-colors ${
                  isLogsPaused
                    ? "bg-yellow-500/10 border-yellow-500 text-yellow-400"
                    : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                }`}
              >
                {isLogsPaused ? <Play className="h-3 w-3 fill-yellow-400" /> : <Pause className="h-3 w-3 fill-zinc-400" />}
                <span>{isLogsPaused ? "Resume Live" : "Pause Live"}</span>
              </button>
              <button
                onClick={() => setLogs(["[SYSTEM] Diagnostic logs cleared by user."])}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-red-500/30 hover:bg-red-500/5 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                <span>Flush</span>
              </button>
            </div>
          </div>

          <div className="flex-1 max-h-[220px] overflow-y-auto mt-4 font-mono text-xs text-zinc-300 space-y-1.5 text-left pr-2">
            {logs.map((log, i) => {
              let colorClass = "text-zinc-400";
              if (log.includes("[SYSTEM]")) colorClass = "text-yellow-400 font-semibold";
              if (log.includes("[WORKER]")) colorClass = "text-violet-400";
              if (log.includes("[AGENT]")) colorClass = "text-cyan-400";
              if (log.includes("[EVAL]") && log.includes("PASSED")) colorClass = "text-emerald-400";

              return (
                <div key={i} className={colorClass}>
                  {log}
                </div>
              );
            })}
            <div ref={logsEndRef} />
          </div>
        </section>
      </main>

      {/* Floating AI Panel Toggle Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <motion.button
          onClick={() => setIsAiOpen(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="h-14 w-14 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg text-white glow-border-violet cursor-pointer relative"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-cyan-400 rounded-full border-2 border-[#020205] animate-pulse" />
        </motion.button>
      </div>

      {/* Floating AI Console Side Modal */}
      <AnimatePresence>
        {isAiOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-5 top-5 bottom-5 w-[420px] z-50 glass-panel rounded-2xl flex flex-col justify-between shadow-2xl border-white/10"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-violet-400" />
                <div>
                  <h3 className="text-xs font-semibold font-mono text-white uppercase">AI Architect Agent</h3>
                  <p className="text-[9px] text-zinc-500 font-mono">Active Model: Claude 3.5 Sonnet</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiOpen(false)}
                className="h-7 w-7 rounded-lg flex items-center justify-center bg-white/5 text-zinc-400 hover:text-white border border-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[calc(100vh-200px)]">
              {aiMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col text-left ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <span className="text-[8px] font-mono text-zinc-500 mb-1">
                    {msg.role === "user" ? "USER COCKPIT" : "AI ARCHITECT"}
                  </span>
                  <div
                    className={`rounded-xl px-3.5 py-2.5 text-xs leading-relaxed max-w-[85%] ${
                      msg.role === "user"
                        ? "bg-violet-600/20 border border-violet-500/30 text-white"
                        : "bg-white/5 border border-white/5 text-zinc-300"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Streaming state simulation */}
              {isAiThinking && (
                <div className="flex flex-col items-start text-left">
                  <span className="text-[8px] font-mono text-zinc-500 mb-1">AI ARCHITECT</span>
                  <div className="bg-white/5 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-zinc-400 max-w-[85%] flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-violet-400 animate-ping" />
                      <span className="animate-pulse">Thinking...</span>
                    </div>
                    {aiThinkingLog && (
                      <span className="text-[9px] font-mono text-zinc-500 mt-1 border-t border-white/5 pt-1">
                        &gt; {aiThinkingLog}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-white/5 bg-black/20 rounded-b-2xl">
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2">
                <input
                  type="text"
                  placeholder="Ask AI to diagnose schema, optimize steps..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
