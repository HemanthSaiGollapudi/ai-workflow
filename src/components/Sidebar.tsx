import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, Compass, Terminal, ShieldAlert, Cpu, Keyboard, LogOut } from "lucide-react";

interface SidebarProps {
  onOpenCommandPalette: () => void;
}

export default function Sidebar({ onOpenCommandPalette }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  const menuItems = [
    { name: "Portal Page", href: "/", icon: Compass },
    { name: "Telemetry Console", href: "/dashboard", icon: LayoutDashboard },
    { name: "Workflow Workspace", href: "/builder", icon: Terminal },
  ];

  return (
    <aside className="fixed left-5 top-5 bottom-5 z-40 w-64 glass-panel rounded-2xl flex flex-col justify-between py-6 px-4 border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
      {/* Brand / Logo */}
      <div>
        <div className="flex items-center gap-3 px-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 shadow-md">
            <Cpu className="h-4 w-4 text-white" />
            <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-cyan-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wider text-zinc-100 uppercase">
              Aether<span className="text-cyan-400 font-bold">OS</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono">v1.0.4-beta</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-8 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono transition-all duration-300 group ${
                  isActive
                    ? "text-white bg-white/5 border border-white/10 glow-border-cyan border-cyan-500/20"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/3"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r bg-cyan-400" />
                )}
                <Icon className={`h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-cyan-400" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Diagnostics / Commands Trigger */}
      <div className="space-y-3">
        {/* Live diagnostics indicator */}
        <div className="rounded-xl border border-white/5 bg-black/40 p-3">
          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400">
            <span>CORE NODE STATE</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              ONLINE
            </span>
          </div>

          <div className="mt-2.5 space-y-1 text-[10px] font-mono">
            <div className="flex justify-between text-zinc-500">
              <span>WORKERS</span>
              <span className="text-zinc-300">12 Active</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>SYS DELAY</span>
              <span className="text-cyan-400">4.2ms</span>
            </div>
          </div>
        </div>

        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex w-full items-center justify-between px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-[11px] font-mono text-zinc-400 transition-all duration-200 hover:bg-white/10 hover:text-white"
        >
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-zinc-500" />
            <span>Command Palette</span>
          </div>
          <div className="flex items-center gap-0.5 text-[9px] text-zinc-500">
            <kbd className="rounded bg-white/5 px-1">⌘</kbd>
            <kbd className="rounded bg-white/5 px-1">K</kbd>
          </div>
        </button>

        {/* Logged in User widget */}
        {user && (
          <div className="flex items-center justify-between p-2 rounded-xl border border-white/5 bg-white/3">
            <div className="flex items-center gap-2 overflow-hidden">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  referrerPolicy="no-referrer"
                  className="h-7 w-7 rounded-lg border border-white/10 object-cover"
                />
              ) : (
                <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                  {user.name ? user.name.substring(0, 2) : "US"}
                </div>
              )}
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-[10px] font-bold text-zinc-200 font-mono truncate max-w-[110px]">
                  {user.name || "Aether User"}
                </span>
                <span className="text-[8px] text-zinc-500 font-mono truncate max-w-[110px]">
                  {user.email}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 rounded-lg border border-white/5 hover:border-red-500/20 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
