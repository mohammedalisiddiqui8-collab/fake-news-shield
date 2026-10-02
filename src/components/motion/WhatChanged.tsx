import { motion } from "framer-motion";
import { GitCompare, Minus, Plus, AlertCircle } from "lucide-react";

export function WhatChanged() {
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="p-4 rounded" style={{ background: "#0C0C0C", border: "1px solid #242424" }}>
      <div className="flex items-center gap-1.5 mb-3">
        <GitCompare className="w-3.5 h-3.5" style={{ color: "#F1F0EA" }} />
        <span className="text-[9px] font-semibold tracking-[0.15em] uppercase" style={{ color: "#F1F0EA" }}>WHAT CHANGED?</span>
      </div>

      <div className="flex items-center gap-2 p-3 rounded" style={{ background: "rgba(241,240,234,0.04)", border: "1px solid #242424" }}>
        <AlertCircle className="w-4 h-4 shrink-0" style={{ color: "#A6A39B" }} />
        <div>
          <p className="text-[10px] font-semibold mb-0.5" style={{ color: "#A6A39B" }}>VERSION HISTORY UNAVAILABLE</p>
          <p className="text-[9px] leading-relaxed" style={{ color: "#A6A39B", opacity: 0.7 }}>
            This feature compares different versions of an article. Version history is only available when multiple versions or updates of the same article are detected.
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2 text-[9px]" style={{ color: "#A6A39B" }}>
          <div className="flex items-center gap-1"><Plus className="w-2.5 h-2.5" style={{ color: "#8FA58A" }} /><span>Added content</span></div>
          <div className="flex items-center gap-1"><Minus className="w-2.5 h-2.5" style={{ color: "#B3263E" }} /><span>Removed content</span></div>
          <div className="flex items-center gap-1"><GitCompare className="w-2.5 h-2.5" style={{ color: "#F1F0EA" }} /><span>Modified content</span></div>
        </div>
      </div>
    </motion.div>
  );
}
