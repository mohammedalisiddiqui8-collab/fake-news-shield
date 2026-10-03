import { motion } from "framer-motion";
import { GitCompare, Minus, Plus, AlertCircle } from "lucide-react";

export function WhatChanged() {
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="p-4 rounded" style={{ background: "var(--v-surface)", border: "1px solid var(--v-rule)" }}>
      <div className="flex items-center gap-1.5 mb-3">
        <GitCompare className="w-3.5 h-3.5" style={{ color: "var(--v-ink)" }} />
        <span className="text-[9px] font-semibold tracking-[0.15em] uppercase" style={{ color: "var(--v-ink)" }}>WHAT CHANGED?</span>
      </div>

      <div className="flex items-center gap-2 p-3 rounded" style={{ background: "rgb(var(--v-ink-rgb) /0.04)", border: "1px solid var(--v-rule)" }}>
        <AlertCircle className="w-4 h-4 shrink-0" style={{ color: "var(--v-ink-soft)" }} />
        <div>
          <p className="text-[10px] font-semibold mb-0.5" style={{ color: "var(--v-ink-soft)" }}>VERSION HISTORY UNAVAILABLE</p>
          <p className="text-[9px] leading-relaxed" style={{ color: "var(--v-ink-soft)", opacity: 0.7 }}>
            This feature compares different versions of an article. Version history is only available when multiple versions or updates of the same article are detected.
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2 text-[9px]" style={{ color: "var(--v-ink-soft)" }}>
          <div className="flex items-center gap-1"><Plus className="w-2.5 h-2.5" style={{ color: "var(--v-green)" }} /><span>Added content</span></div>
          <div className="flex items-center gap-1"><Minus className="w-2.5 h-2.5" style={{ color: "var(--v-crimson)" }} /><span>Removed content</span></div>
          <div className="flex items-center gap-1"><GitCompare className="w-2.5 h-2.5" style={{ color: "var(--v-ink)" }} /><span>Modified content</span></div>
        </div>
      </div>
    </motion.div>
  );
}
