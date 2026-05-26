"use client";

import React, { useState, useEffect } from "react";
import BackgroundCanvas from "./BackgroundCanvas";
import CommandPalette from "./CommandPalette";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsCommandPaletteOpen((prev) => !prev);
    const handleOpen = () => setIsCommandPaletteOpen(true);
    const handleClose = () => setIsCommandPaletteOpen(false);

    window.addEventListener("toggle-command-palette", handleToggle);
    window.addEventListener("open-ai-chat", handleOpen); // AI command can open it
    window.addEventListener("close-command-palette", handleClose);

    return () => {
      window.removeEventListener("toggle-command-palette", handleToggle);
      window.removeEventListener("open-ai-chat", handleOpen);
      window.removeEventListener("close-command-palette", handleClose);
    };
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col radial-gradient-mesh text-zinc-100 select-none overflow-x-hidden">
      {/* Cinematic grid line scan effects */}
      <div className="cyber-grid" />
      <div className="scanline" />

      {/* Global Interactive Canvas */}
      <BackgroundCanvas />

      {/* Core Pages Content */}
      <div className="relative z-10 flex-1 flex flex-col">{children}</div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
}
