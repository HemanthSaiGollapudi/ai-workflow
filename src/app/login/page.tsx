"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Cpu, Sparkles, RefreshCw } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (e) {
      console.error("Login failed", e);
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("credentials", { callbackUrl: "/" });
    } catch (e) {
      console.error("Guest login failed", e);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-4 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel rounded-2xl p-8 bg-black/40 border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center relative z-10">
        {/* Brand / Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 shadow-md">
            <Cpu className="h-6 w-6 text-white" />
            <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-wider text-zinc-100 uppercase mt-2">
              Aether<span className="text-cyan-400 font-bold">OS</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1">Cognitive Auth Gateway</p>
          </div>
        </div>

        {/* Info card */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-zinc-300 font-mono mb-2">RESTRICTED ACCESS</h2>
          <p className="text-xs text-zinc-500 leading-relaxed font-sans">
            Please authenticate using your authorization profile to gain access to the autonomous executor node and pipeline dashboards.
          </p>
        </div>

        {/* Login Action */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 px-4 font-mono text-xs text-white btn-neon-violet rounded-xl flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-violet-400" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4 fill-white"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          <button
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="w-full py-3 px-4 font-mono text-xs text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
                <span>Initializing Session...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
                <span>Access as Guest (Demo Mode)</span>
              </>
            )}
          </button>
        </div>

        {/* Footer info */}
        <div className="border-t border-white/5 pt-4 mt-8 flex items-center justify-between text-[9px] font-mono text-zinc-600">
          <span>SECURE SECURE LAYER</span>
          <span className="flex items-center gap-1 text-cyan-500/50">
            <Sparkles className="h-3 w-3 text-cyan-500/50 animate-pulse" />
            TLS 1.3 SYNCHRONIZED
          </span>
        </div>
      </div>
    </div>
  );
}
