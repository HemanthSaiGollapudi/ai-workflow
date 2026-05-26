"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Terminal, Navigation, RefreshCw, Cpu, MessageSquare, Play } from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: "navigation" | "actions" | "workflows";
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string[];
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: "go-landing",
      title: "Go to Portal Page",
      subtitle: "Navigate back to the main startup portal",
      category: "navigation",
      icon: Navigation,
      shortcut: ["G", "P"],
      action: () => {
        router.push("/");
        onClose();
      },
    },
    {
      id: "go-dashboard",
      title: "Go to Telemetry Console",
      subtitle: "Open system analytics and execution feeds",
      category: "navigation",
      icon: Cpu,
      shortcut: ["G", "D"],
      action: () => {
        router.push("/dashboard");
        onClose();
      },
    },
    {
      id: "go-builder",
      title: "Open Workflow Builder",
      subtitle: "Launch the node-based workspace and execution player",
      category: "navigation",
      icon: Terminal,
      shortcut: ["G", "B"],
      action: () => {
        router.push("/builder");
        onClose();
      },
    },
    {
      id: "run-simulation",
      title: "Trigger Core Diagnostics",
      subtitle: "Initiate simulated workflow execution across all nodes",
      category: "actions",
      icon: Play,
      action: () => {
        alert("Simulating diagnostic trigger sequence...");
        onClose();
      },
    },
    {
      id: "ai-assistant",
      title: "Initialize AI Architect",
      subtitle: "Activate the floating AI experience panel",
      category: "actions",
      icon: MessageSquare,
      shortcut: ["A", "I"],
      action: () => {
        // We will broadcast or dispatch an event that the AI panel should open
        window.dispatchEvent(new CustomEvent("open-ai-chat"));
        onClose();
      },
    },
    {
      id: "clear-logs",
      title: "Flush OS Cache",
      subtitle: "Clear recent activities and refresh telemetry states",
      category: "actions",
      icon: RefreshCw,
      action: () => {
        window.dispatchEvent(new CustomEvent("clear-system-logs"));
        onClose();
      },
    },
  ];

  // Filter commands
  const filtered = commands.filter((cmd) =>
    `${cmd.title} ${cmd.subtitle} ${cmd.category}`.toLowerCase().includes(search.toLowerCase())
  );

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setSearch("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle global keydown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        isOpen ? onClose() : window.dispatchEvent(new CustomEvent("toggle-command-palette"));
      }

      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filtered, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel w-full max-w-xl overflow-hidden rounded-xl shadow-2xl relative z-10 glow-border-cyan border-cyan-500/20"
          >
            {/* Input Wrapper */}
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
              <Search className="h-5 w-5 text-zinc-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search console actions or run commands..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
              />
              <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                ESC
              </span>
            </div>

            {/* List */}
            <div className="max-h-[350px] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-sm text-zinc-500 font-mono">
                  No terminal instructions match your input.
                </div>
              ) : (
                <div className="space-y-1">
                  {/* Categorized List */}
                  {["navigation", "actions"].map((cat) => {
                    const items = filtered.filter((i) => i.category === cat);
                    if (items.length === 0) return null;

                    return (
                      <div key={cat} className="space-y-1">
                        <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
                          {cat}
                        </div>
                        {items.map((cmd) => {
                          const idx = filtered.indexOf(cmd);
                          const active = idx === selectedIndex;
                          const Icon = cmd.icon;

                          return (
                            <button
                              key={cmd.id}
                              onClick={cmd.action}
                              onMouseEnter={() => setSelectedIndex(idx)}
                              className={`flex w-full items-center gap-3.5 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 ${
                                active
                                  ? "bg-violet-500/10 border border-violet-500/30 text-white"
                                  : "border border-transparent text-zinc-300 hover:bg-white/5"
                              }`}
                            >
                              <div
                                className={`rounded-lg p-2 ${
                                  active
                                    ? "bg-violet-500/20 text-violet-300"
                                    : "bg-white/5 text-zinc-400"
                                }`}
                              >
                                <Icon className="h-4.5 w-4.5" />
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium leading-none">{cmd.title}</p>
                                <p className="mt-1 truncate text-xs text-zinc-500 leading-none">
                                  {cmd.subtitle}
                                </p>
                              </div>
                              {cmd.shortcut && (
                                <div className="flex items-center gap-1">
                                  {cmd.shortcut.map((key) => (
                                    <kbd
                                      key={key}
                                      className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[9px] font-mono text-zinc-400"
                                    >
                                      {key}
                                    </kbd>
                                  ))}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/5 bg-black/40 px-4 py-2 text-[10px] font-mono text-zinc-500">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Enter</span>
              </div>
              <div>Cmd+K or Ctrl+K to close</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
