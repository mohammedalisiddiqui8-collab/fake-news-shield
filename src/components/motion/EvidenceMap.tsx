import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Link2, CheckCircle2, AlertTriangle, HelpCircle, ChevronRight, ChevronDown } from "lucide-react";

interface MapNode {
  id: string;
  label: string;
  type: "article" | "claim" | "source" | "evidence" | "assessment";
  status?: "supported" | "contradicted" | "uncertain";
  children?: MapNode[];
}

interface EvidenceMapProps {
  articleTitle: string;
  claims: Array<{
    id: number;
    text: string;
    status: string;
    sources: Array<{ name: string; relationship: string }>;
  }>;
  verdict: string;
  confidence: number;
}

function statusColor(status?: string) {
  if (status === "supported") return "#D4C4A8";
  if (status === "contradicted") return "#A85A50";
  return "#A8A098";
}

function StatusIcon({ status }: { status?: string }) {
  if (status === "supported") return <CheckCircle2 className="w-3 h-3" style={{ color: "#D4C4A8" }} />;
  if (status === "contradicted") return <AlertTriangle className="w-3 h-3" style={{ color: "#A85A50" }} />;
  return <HelpCircle className="w-3 h-3" style={{ color: "#A8A098" }} />;
}

export function EvidenceMap({ articleTitle, claims, verdict, confidence }: EvidenceMapProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const tree: MapNode[] = [
    {
      id: "article", label: articleTitle.slice(0, 60) + (articleTitle.length > 60 ? "..." : ""), type: "article",
      children: claims.slice(0, 5).map(c => ({
        id: "claim-" + c.id, label: "CLAIM " + String(c.id).padStart(2, "0"), type: "claim" as const,
        status: c.status === "supported" || c.status === "verified" ? "supported" as const : c.status === "contradicted" ? "contradicted" as const : "uncertain" as const,
        children: c.sources.length > 0
          ? c.sources.map((s, i) => ({
              id: "src-" + c.id + "-" + i, label: s.name, type: "source" as const,
              status: s.relationship === "supports" ? "supported" as const : s.relationship === "contradicts" ? "contradicted" as const : "uncertain" as const,
            }))
          : [{ id: "noev-" + c.id, label: "NO EVIDENCE FOUND", type: "evidence" as const, status: "uncertain" as const }],
      })),
    },
    { id: "assessment", label: verdict.replace("_", " ").toUpperCase() + " " + confidence + "%", type: "assessment", status: verdict === "likely_real" ? "supported" : verdict === "likely_fake" ? "contradicted" : "uncertain" },
  ];

  function renderNode(node: MapNode, depth: number = 0) {
    const isSelected = selectedNode === node.id;
    const hasChildren = node.children && node.children.length > 0;
    return (
      <div key={node.id}>
        <button type="button"
          className="flex items-center gap-2 w-full text-left py-1.5 px-2 rounded cursor-pointer transition-all duration-150 hover:bg-[#1E1E1E]/40"
          style={{ paddingLeft: depth * 16 + 8, background: isSelected ? "rgba(168,144,110,0.06)" : undefined }}
          onClick={() => setSelectedNode(isSelected ? null : node.id)}>
          {depth > 0 && <div className="w-3 h-px" style={{ background: "#1E1E1E" }} />}
          {hasChildren && <ChevronDown className="w-2.5 h-2.5 shrink-0" style={{ color: "#A8A098", transform: isSelected ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />}
          <StatusIcon status={node.status} />
          <span className="text-[10px] font-semibold truncate" style={{ color: statusColor(node.status) }}>{node.label}</span>
          {node.type === "article" && <FileText className="w-2.5 h-2.5 shrink-0 ml-auto" style={{ color: "#A8906E" }} />}
          {node.type === "source" && <Link2 className="w-2.5 h-2.5 shrink-0 ml-auto" style={{ color: "#A8A098", opacity: 0.5 }} />}
        </button>
        <AnimatePresence>
          {isSelected && hasChildren && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              {node.children!.map(child => renderNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tree.map(node => renderNode(node))}
    </div>
  );
}


