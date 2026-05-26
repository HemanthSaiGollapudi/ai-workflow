"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Terminal, 
  Send, 
  RefreshCw, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft,
  Copy,
  Check,
  Activity,
  Sparkles
} from "lucide-react";

interface DiagnosticLog {
  time: string;
  source: "CLIENT" | "API" | "SYSTEM";
  message: string;
  status: "info" | "success" | "warning" | "error";
}

export default function PlaygroundPage() {
    const [message, setMessage] = useState("");
    const [response, setResponse] = useState("");
    const [status, setStatus] = useState<"idle" | "running" | "streaming" | "success" | "error">("idle");
    const [logs, setLogs] = useState<DiagnosticLog[]>([]);
    const [copied, setCopied] = useState(false);
    const [responseTime, setResponseTime] = useState<number | null>(null);

    const responseContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (responseContainerRef.current) {
            responseContainerRef.current.scrollTop = responseContainerRef.current.scrollHeight;
        }
    }, [response, status]);

    const logMessage = (msg: string, source: DiagnosticLog["source"] = "SYSTEM", status: DiagnosticLog["status"] = "info") => {
        const timeStr = new Date().toLocaleTimeString();
        setLogs((prev) => [...prev, { time: timeStr, source, message: msg, status }]);
    };

    const copyResponse = () => {
        if (!response) return;
        navigator.clipboard.writeText(response);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const sendMessage = async () => {
        if (!message.trim()) {
            logMessage("Input payload cannot be empty.", "CLIENT", "warning");
            return;
        }

        const start = performance.now();
        setStatus("running");
        setResponse("");
        setLogs([]);
        setResponseTime(null);

        logMessage("Initiating API test handshake...", "CLIENT", "info");
        logMessage("Target Endpoint: POST /api/chat", "CLIENT", "info");
        logMessage("Dispatching payload (stream=true)...", "CLIENT", "info");

        try {
            logMessage("Awaiting reply from server cluster...", "API", "info");
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: message,
                    stream: true,
                }),
            });

            if (!res.ok) {
                let errorMsg = "API connection failed";
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

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) {
                throw new Error("Response body is not readable.");
            }

            setStatus("streaming");
            logMessage(`Socket handshake established. Receiving stream...`, "API", "success");

            let currentReply = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                currentReply += chunk;
                setResponse(currentReply);
            }

            const elapsed = Math.round(performance.now() - start);
            setResponseTime(elapsed);
            setStatus("success");
            logMessage(`Transmission complete. Received HTTP ${res.status}`, "API", "success");
            logMessage(`Execution duration: ${elapsed}ms`, "SYSTEM", "success");
        } catch (error: any) {
            console.error(error);
            setStatus("error");
            setResponse(error.message || "Error connecting to AI API.");
            logMessage(`Network request failed: ${error.message || String(error)}`, "CLIENT", "error");
        }
    };

    const flushAll = () => {
        setMessage("");
        setResponse("");
        setStatus("idle");
        setLogs([]);
        setResponseTime(null);
        logMessage("Terminal state reset.", "SYSTEM", "info");
    };

    return (
        <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full text-left">
            {/* Header */}
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-6 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="flex h-2 w-2 relative">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'running' || status === 'streaming' ? 'bg-violet-400' : 'bg-cyan-400'}`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'running' || status === 'streaming' ? 'bg-violet-500' : 'bg-cyan-500'}`}></span>
                        </span>
                        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                            AetherOS // Sandbox Diagnostics
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans flex items-center gap-2.5">
                        Endpoint Sandbox <span className="text-xs font-mono font-normal px-2 py-0.5 rounded border border-cyan-500/20 bg-cyan-500/5 text-cyan-400">/api/chat</span>
                    </h1>
                    <p className="text-zinc-400 text-xs mt-1">
                        Use this isolated playground to verify route configurations, network latency, and raw response outputs.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href="/"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-zinc-400 hover:text-white hover:bg-white/10 transition-all font-mono"
                    >
                        <ArrowLeft className="h-3 w-3" /> Back to Home
                    </a>
                </div>
            </header>

            {/* Grid layout */}
            <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 items-start">
                {/* Input panel */}
                <div className="space-y-6">
                    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Terminal className="h-4.5 w-4.5 text-cyan-400" />
                                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Payload Input</span>
                            </div>
                            <button 
                                onClick={flushAll}
                                className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 font-mono"
                            >
                                <RefreshCw className="h-3 w-3" /> Flush Sandbox
                            </button>
                        </div>

                        <div className="relative">
                            <textarea
                                className={`w-full h-64 p-4 bg-zinc-950/80 border border-white/5 focus:border-cyan-500/50 rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 font-sans resize-none transition-all ${(status === "running" || status === "streaming") ? 'opacity-50 cursor-not-allowed' : ''}`}
                                rows={5}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={status === "running" || status === "streaming"}
                                placeholder="Write something to send to /api/chat..."
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-4">
                            <div className="flex items-center gap-2">
                                {status === "running" ? (
                                    <span className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 animate-pulse">
                                        <Activity className="h-3.5 w-3.5 animate-spin" /> EXECUTING HANDSHAKE...
                                    </span>
                                ) : status === "streaming" ? (
                                    <span className="flex items-center gap-1.5 text-xs font-mono text-violet-400 animate-pulse">
                                        <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '3s' }} /> COGNITIVE STREAM ACTIVE...
                                    </span>
                                ) : status === "success" ? (
                                    <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                                        <CheckCircle className="h-3.5 w-3.5" /> DIAL OK
                                    </span>
                                ) : status === "error" ? (
                                    <span className="flex items-center gap-1.5 text-xs font-mono text-rose-400 animate-pulse">
                                        <AlertCircle className="h-3.5 w-3.5" /> HANDSHAKE ERROR
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
                                        <Terminal className="h-3.5 w-3.5" /> SANDBOX READY
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={sendMessage}
                                disabled={status === "running" || status === "streaming"}
                                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-mono text-xs cursor-pointer transition-all ${
                                    (status === "running" || status === "streaming")
                                        ? "bg-zinc-800 border border-zinc-700 text-zinc-500 cursor-not-allowed"
                                        : "btn-neon-cyan text-white"
                                }`}
                            >
                                {status === "running" ? "Running..." : status === "streaming" ? "Streaming..." : "Run AI"}
                                <Send className="h-3 w-3" />
                            </button>
                        </div>
                    </div>

                    {/* Diagnostic Monitor */}
                    <div className="glass-panel rounded-2xl p-6 bg-black/40">
                        <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-3">Diagnostic Stream Monitor</span>
                        <div className="min-h-[160px] max-h-[200px] overflow-y-auto bg-zinc-950/80 border border-white/5 rounded-xl p-3.5 font-mono text-[10px] space-y-2 text-left">
                            {logs.length === 0 ? (
                                <div className="text-zinc-600 italic">Sandbox idle. Dispatched payloads will generate trace logs.</div>
                            ) : (
                                logs.map((log, i) => {
                                    let badgeColor = "bg-zinc-800 text-zinc-400 border-zinc-700";
                                    let textColor = "text-zinc-300";

                                    if (log.status === "success") {
                                        badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                                        textColor = "text-emerald-300";
                                    } else if (log.status === "error") {
                                        badgeColor = "bg-rose-500/15 text-rose-400 border-rose-500/20";
                                        textColor = "text-rose-300";
                                    } else if (log.status === "warning") {
                                        badgeColor = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
                                        textColor = "text-yellow-300";
                                    } else if (log.source === "API") {
                                        badgeColor = "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
                                        textColor = "text-cyan-300";
                                    }

                                    return (
                                        <div key={i} className={`flex items-start gap-2 ${textColor}`}>
                                            <span className="text-zinc-600 select-none">[{log.time}]</span>
                                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${badgeColor} font-mono`}>
                                                {log.source}
                                            </span>
                                            <span className="flex-1">{log.message}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Output panel */}
                <div className="glass-panel rounded-2xl p-6 bg-black/20 flex flex-col min-h-[500px]">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
                        <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Payload Response</span>
                        <div className="flex items-center gap-3">
                            {responseTime !== null && (
                                <span className="text-[10px] font-mono text-zinc-500">
                                    LATENCY: <strong className="text-cyan-400">{responseTime}ms</strong>
                                </span>
                            )}
                            <button
                                onClick={copyResponse}
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
                                        <Copy className="h-3 w-3" /> Copy Output
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div ref={responseContainerRef} className="flex-1 overflow-y-auto max-h-[420px] bg-zinc-950/40 border border-white/5 rounded-xl p-4 font-mono text-xs text-zinc-300 text-left whitespace-pre-wrap select-text">
                        {status === "running" ? (
                            <div className="flex flex-col items-center justify-center h-full py-32 text-zinc-500 gap-4">
                                <div className="relative flex items-center justify-center">
                                    <div className="absolute w-12 h-12 rounded-full border border-cyan-500/30 animate-ping" />
                                    <div className="absolute w-8 h-8 rounded-full border border-cyan-400/50 animate-pulse" />
                                    <RefreshCw className="h-6 w-6 animate-spin text-cyan-400 relative z-10" />
                                </div>
                                <span className="text-[11px] font-mono tracking-wider text-zinc-400 animate-pulse uppercase">
                                    Negotiating Socket Handshake...
                                </span>
                            </div>
                        ) : (status === "streaming" || response) ? (
                            <div className="relative">
                                {response}
                                {status === "streaming" && (
                                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-cyan-400 animate-pulse align-middle" />
                                )}
                            </div>
                        ) : (
                            <div className="text-zinc-600 italic py-32 text-center">
                                Sandbox empty. Dispatch a request to see output.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}