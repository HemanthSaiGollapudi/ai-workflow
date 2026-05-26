"use client";

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  RotateCcw,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Cpu,
  Database,
  Terminal as TermIcon,
  HelpCircle,
  Code,
  CheckCircle,
  HelpCircle as QuestionIcon,
  GitCommit,
  GitPullRequest,
  Check,
} from "lucide-react";

interface Node {
  id: string;
  type: "trigger" | "ai" | "condition" | "database" | "analytics";
  label: string;
  x: number;
  y: number;
  status: "idle" | "running" | "success" | "failed";
  params: Record<string, string>;
}

interface Connection {
  from: string;
  to: string;
}

// Initial Preset Nodes
const defaultNodes: Node[] = [
  {
    id: "node-1",
    type: "trigger",
    label: "Webhook Event",
    x: 40,
    y: 160,
    status: "idle",
    params: { url: "/api/v1/ingest", method: "POST", auth: "Bearer Token" },
  },
  {
    id: "node-2",
    type: "ai",
    label: "Sentiment Agent",
    x: 290,
    y: 160,
    status: "idle",
    params: { model: "claude-3-5-sonnet", prompt: "Evaluate user feedback sentiment." },
  },
  {
    id: "node-3",
    type: "condition",
    label: "Score Evaluator",
    x: 540,
    y: 160,
    status: "idle",
    params: { rule: "sentiment_score < 0.45", action: "alert_branch" },
  },
  {
    id: "node-4",
    type: "database",
    label: "Prisma Schema Sync",
    x: 790,
    y: 70,
    status: "idle",
    params: { model: "AlertsTable", action: "UPSERT", connection: "DATABASE_URL" },
  },
  {
    id: "node-5",
    type: "analytics",
    label: "Slack Alert Engine",
    x: 790,
    y: 250,
    status: "idle",
    params: { channel: "#operations-log", template: "Severe warning detected" },
  },
];

const defaultConnections: Connection[] = [
  { from: "node-1", to: "node-2" },
  { from: "node-2", to: "node-3" },
  { from: "node-3", to: "node-4" },
  { from: "node-3", to: "node-5" },
];

export default function Builder() {
  const [mounted, setMounted] = useState(false);
  const [nodes, setNodes] = useState<Node[]>(defaultNodes);
  const [connections, setConnections] = useState<Connection[]>(defaultConnections);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("node-2");

  // Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Simulator Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePulseLine, setActivePulseLine] = useState<string | null>(null);
  const [simStep, setSimStep] = useState(0);

  // Command Palette Open state
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // AI Generation Sidebar State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratingLogs, setAiGeneratingLogs] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    const handleTogglePalette = () => setIsPaletteOpen((prev) => !prev);
    window.addEventListener("toggle-command-palette", handleTogglePalette);
    return () => window.removeEventListener("toggle-command-palette", handleTogglePalette);
  }, []);

  // Handle Dragging Events on Node Header
  const handlePointerDown = (e: React.PointerEvent, nodeId: string) => {
    e.preventDefault();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);

    // Get click location offset from node position
    dragOffsetRef.current = {
      x: e.clientX - node.x,
      y: e.clientY - node.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingNodeId) return;

    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === draggingNodeId) {
          // Keep node within builder canvas boundary constraints
          const x = Math.max(10, Math.min(1050, e.clientX - dragOffsetRef.current.x));
          const y = Math.max(10, Math.min(500, e.clientY - dragOffsetRef.current.y));
          return { ...node, x, y };
        }
        return node;
      })
    );
  };

  const handlePointerUp = () => {
    setDraggingNodeId(null);
  };

  // Run/Play Simulation Logic
  const handlePlaySimulation = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setSimStep(1);

    // Reset status on play
    setNodes((prev) => prev.map((n) => ({ ...n, status: "idle" })));

    // Step 1: Webhook Trigger runs
    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => (n.id === "node-1" ? { ...n, status: "success" } : n))
      );
      setActivePulseLine("node-1->node-2");

      // Step 2: Pulse moves to Agent
      setTimeout(() => {
        setNodes((prev) =>
          prev.map((n) => (n.id === "node-2" ? { ...n, status: "running" } : n))
        );

        setTimeout(() => {
          setNodes((prev) =>
            prev.map((n) => (n.id === "node-2" ? { ...n, status: "success" } : n))
          );
          setActivePulseLine("node-2->node-3");

          // Step 3: Pulse moves to Evaluator Condition
          setTimeout(() => {
            setNodes((prev) =>
              prev.map((n) => (n.id === "node-3" ? { ...n, status: "success" } : n))
            );
            setActivePulseLine("node-3->node-4,node-3->node-5");

            // Step 4: Split pulse to Database and Slack
            setTimeout(() => {
              setNodes((prev) =>
                prev.map((n) =>
                  n.id === "node-4" || n.id === "node-5"
                    ? { ...n, status: "success" }
                    : n
                )
              );
              setActivePulseLine(null);
              setIsPlaying(false);
            }, 1200);
          }, 1000);
        }, 1500);
      }, 1000);
    }, 800);
  };

  const handleResetSimulation = () => {
    setIsPlaying(false);
    setActivePulseLine(null);
    setNodes((prev) => prev.map((n) => ({ ...n, status: "idle" })));
  };

  // AI Workflow Builder compile logic
  const handleCompileWorkflow = () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setAiGeneratingLogs([]);

    const messages = [
      "Analyzing user pipeline request tokens...",
      "Resolving optimal graph node layout...",
      "Compiling Webhook Trigger configuration...",
      "Deploying Deep Learning LLM Agent parameters...",
      "Configuring conditional branch routes...",
      "Connecting serialization database synchronization block...",
      "Workflow generation sequence COMPLETE.",
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < messages.length) {
        setAiGeneratingLogs((prev) => [...prev, `> ${messages[index]}`]);
        index++;
      } else {
        clearInterval(interval);
        setAiGenerating(false);

        // Generate customized nodes based on prompt input
        const query = aiPrompt.toLowerCase();
        let newLabel = "User Ingest Source";
        let newAiLabel = "AI Semantic Translator";
        let newDbLabel = "Sync Data Rows";

        if (query.includes("email") || query.includes("scan")) {
          newLabel = "IMAP Email Trigger";
          newAiLabel = "Spam / Urgent Evaluator";
          newDbLabel = "Prisma MailDB Cache";
        } else if (query.includes("hacker") || query.includes("news")) {
          newLabel = "HN Scraper Feed";
          newAiLabel = "Tech Trend Analyst";
          newDbLabel = "TrendDatabaseSync";
        }

        const generatedNodes: Node[] = [
          {
            id: "node-1",
            type: "trigger",
            label: newLabel,
            x: 50,
            y: 220,
            status: "idle",
            params: { trigger: "OnEventReceived", frequency: "Realtime" },
          },
          {
            id: "node-2",
            type: "ai",
            label: newAiLabel,
            x: 320,
            y: 220,
            status: "idle",
            params: { agent: "DeepEvaluator", temperature: "0.2" },
          },
          {
            id: "node-3",
            type: "database",
            label: newDbLabel,
            x: 600,
            y: 220,
            status: "idle",
            params: { target: "PrismaORM", model: "IngestedEvent" },
          },
        ];

        const generatedConnections: Connection[] = [
          { from: "node-1", to: "node-2" },
          { from: "node-2", to: "node-3" },
        ];

        setNodes(generatedNodes);
        setConnections(generatedConnections);
        setSelectedNodeId("node-2");
        setAiPrompt("");
      }
    }, 900);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar navigation */}
      <Sidebar onOpenCommandPalette={() => setIsPaletteOpen(true)} />

      {/* Main Workspace */}
      <main className="flex-1 pl-72 pr-6 py-6 flex flex-col gap-6 relative z-10">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
              Workflow Workspace
            </h2>
            <p className="text-xs text-zinc-500 font-mono">Design agent flows and compile execution graphs</p>
          </div>

          {/* Controller buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetSimulation}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-mono text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={handlePlaySimulation}
              disabled={isPlaying}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono transition-all duration-200 ${
                isPlaying
                  ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 animate-pulse"
                  : "btn-neon-cyan"
              }`}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{isPlaying ? "Running..." : "Run Pipeline"}</span>
            </button>
          </div>
        </header>

        {/* Workspace Canvas + Properties Panel Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Node Canvas Area */}
          <div
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="lg:col-span-3 glass-panel border-white/5 rounded-2xl bg-black/60 relative overflow-hidden h-[540px] cursor-crosshair"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.02) 1.5px, transparent 1.5px)",
              backgroundSize: "20px 20px",
            }}
          >
            {/* SVG Connections Canvas */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {connections.map((conn, idx) => {
                const fromNode = nodes.find((n) => n.id === conn.from);
                const toNode = nodes.find((n) => n.id === conn.to);
                if (!fromNode || !toNode) return null;

                // Anchor Coords
                const x1 = fromNode.x + 180;
                const y1 = fromNode.y + 45;
                const x2 = toNode.x;
                const y2 = toNode.y + 45;

                // Control points for bezier curves
                const controlOffset = Math.abs(x2 - x1) * 0.45;
                const pathD = `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;
                const pulseId = `${conn.from}->${conn.to}`;
                const isLinePulsing = activePulseLine && activePulseLine.includes(pulseId);

                return (
                  <g key={idx}>
                    {/* Underlying line */}
                    <path
                      d={pathD}
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="2"
                      fill="none"
                    />

                    {/* Glowing execution trace line */}
                    {isLinePulsing && (
                      <>
                        <path
                          d={pathD}
                          stroke="#06b6d4"
                          strokeWidth="2.5"
                          className="animate-flow"
                          fill="none"
                        />
                        <motion.circle
                          r="4.5"
                          fill="#06b6d4"
                          className="shadow-[0_0_10px_#06b6d4]"
                        >
                          <animateMotion
                            path={pathD}
                            dur="1s"
                            repeatCount="indefinite"
                          />
                        </motion.circle>
                      </>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Draggable Nodes */}
            <AnimatePresence>
              {nodes.map((node) => {
                const isSelected = node.id === selectedNodeId;
                let borderTheme = "border-white/10";
                let badgeColor = "bg-zinc-800 text-zinc-400";
                let Icon = Cpu;

                if (node.type === "trigger") {
                  badgeColor = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                  Icon = GitCommit;
                } else if (node.type === "ai") {
                  badgeColor = "bg-violet-500/10 text-violet-400 border border-violet-500/20";
                  Icon = Sparkles;
                } else if (node.type === "condition") {
                  badgeColor = "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
                  Icon = GitPullRequest;
                } else if (node.type === "database") {
                  badgeColor = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
                  Icon = Database;
                } else if (node.type === "analytics") {
                  badgeColor = "bg-pink-500/10 text-pink-400 border border-pink-500/20";
                  Icon = TermIcon;
                }

                if (node.status === "running") borderTheme = "border-cyan-400 glow-border-cyan";
                if (node.status === "success") borderTheme = "border-emerald-400 glow-border-emerald";
                if (isSelected) borderTheme = "border-violet-500 glow-border-violet";

                return (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{ left: node.x, top: node.y }}
                    className={`absolute z-10 w-[180px] glass-panel rounded-xl overflow-hidden shadow-lg border ${borderTheme} transition-colors duration-300`}
                  >
                    {/* Header (Drag anchor handle) */}
                    <div
                      onPointerDown={(e) => handlePointerDown(e, node.id)}
                      className="h-8 bg-black/40 px-3 flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-white/5"
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="text-[10px] font-mono font-semibold tracking-wider text-zinc-300 uppercase">
                          {node.type}
                        </span>
                      </div>
                      {node.status === "success" && (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-3 text-left">
                      <p className="text-xs font-semibold truncate text-zinc-100">{node.label}</p>
                      <div className="mt-2.5 flex items-center justify-between">
                        <span className={`text-[8px] font-mono rounded px-1.5 py-0.5 ${badgeColor}`}>
                          {node.type.toUpperCase()}
                        </span>
                        <span className="text-[8px] font-mono text-zinc-500">ID: {node.id}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Properties Side Panel & AI Generator */}
          <div className="flex flex-col gap-4">
            {/* AI Generator Panel */}
            <div className="glass-panel border-white/5 rounded-2xl p-4 bg-black/40 flex flex-col justify-between min-h-[220px]">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">
                  AI GRAPH GENERATOR
                </span>
                <p className="text-[11px] text-zinc-400 mb-3 leading-snug">
                  Explain your desired routine to compile the connected node graph automatically.
                </p>

                <textarea
                  placeholder="e.g. Ingest new users, classify sentiment, database log..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  disabled={aiGenerating}
                  className="w-full h-18 rounded-lg bg-black/40 border border-white/10 p-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none"
                />
              </div>

              <div className="mt-3">
                {aiGenerating ? (
                  <div className="space-y-1 bg-black/30 rounded p-2 text-[9px] font-mono text-zinc-500 max-h-[80px] overflow-y-auto text-left">
                    {aiGeneratingLogs.map((log, i) => (
                      <div key={i} className={i === aiGeneratingLogs.length - 1 ? "text-cyan-400" : ""}>
                        {log}
                      </div>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={handleCompileWorkflow}
                    className="w-full py-2 text-xs font-mono btn-neon-violet rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Compile Graph</span>
                  </button>
                )}
              </div>
            </div>

            {/* Selected Node Properties */}
            <div className="glass-panel border-white/5 rounded-2xl p-4 bg-black/40 flex-1 flex flex-col justify-between">
              {selectedNode ? (
                <div className="flex flex-col h-full justify-between text-left">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">
                      NODE PROPERTIES
                    </span>
                    <h3 className="text-xs font-bold text-white font-mono uppercase">{selectedNode.label}</h3>
                    <p className="text-[9px] text-zinc-500 font-mono">TYPE: {selectedNode.type}</p>

                    <div className="mt-4 space-y-3.5">
                      {Object.entries(selectedNode.params).map(([key, val]) => (
                        <div key={key}>
                          <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">
                            {key.replace("_", " ")}
                          </label>
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => {
                              const updatedVal = e.target.value;
                              setNodes((prev) =>
                                prev.map((n) =>
                                  n.id === selectedNode.id
                                    ? {
                                        ...n,
                                        params: { ...n.params, [key]: updatedVal },
                                      }
                                    : n
                                )
                              );
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 font-mono outline-none focus:border-violet-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>COMPILE STATUS</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      VALID
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-600 font-mono text-xs">
                  <QuestionIcon className="h-8 w-8 mb-2 text-zinc-800" />
                  <span>Select a node to edit parameters.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
