import { motion } from "framer-motion";
import { GitCompare, Minus, Plus, AlertCircle } from "lucide-react";

export function WhatChanged() {
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="p-4 rounded" style={{ background: "#FBF9F3", border: "1px solid #D8D0C3" }}>
      <div className="flex items-center gap-1.5 mb-3">
        <GitCompare className="w-3.5 h-3.5" style={{ color: "#596451" }} />
        <span className="text-[9px] font-semibold tracking-[0.15em] uppercase" style={{ color: "#171716" }}>WHAT CHANGED?</span>
      </div>

      <div className="flex items-center gap-2 p-3 rounded" style={{ background: "rgba(23,23,22,0.04)", border: "1px solid #D8D0C3" }}>
        <AlertCircle className="w-4 h-4 shrink-0" style={{ color: "#6F6A61" }} />
        <div>
          <p className="text-[10px] font-semibold mb-0.5" style={{ color: "#6F6A61" }}>VERSION HISTORY UNAVAILABLE</p>
          <p className="text-[9px] leading-relaxed" style={{ color: "#6F6A61", opacity: 0.7 }}>
            This feature compares different versions of an article. Version history is only available when multiple versions or updates of the same article are detected.
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2 text-[9px]" style={{ color: "#6F6A61" }}>
          <div className="flex items-center gap-1"><Plus className="w-2.5 h-2.5" style={{ color: "#71836B" }} /><span>Added content</span></div>
          <div className="flex items-center gap-1"><Minus className="w-2.5 h-2.5" style={{ color: "#A86155" }} /><span>Removed content</span></div>
          <div className="flex items-center gap-1"><GitCompare className="w-2.5 h-2.5" style={{ color: "#596451" }} /><span>Modified content</span></div>
        </div>
      </div>
    </motion.div>
  );
}
