import { motion } from "framer-motion";
import {
  Brain,
  Layers,
  Search,
  BarChart3,
  Shield,
  BookOpen,
  Target,
  GitBranch,
} from "lucide-react";

const sections = [
  {
    icon: Brain,
    title: "System Architecture",
    content:
      "Fake News Shield employs a multi-layered NLP analysis pipeline built on Convex (serverless backend) with a React frontend. The architecture follows a modular design pattern where detection heuristics are separated from scoring logic and presentation layers.",
    details: [
      "Serverless Convex backend with real-time data synchronization",
      "React + TypeScript frontend with Vite for fast builds",
      "Shadcn/UI component library with custom Glassmorphism theme",
      "Framer Motion for smooth, meaningful animations",
    ],
  },
  {
    icon: Layers,
    title: "Three-Layer Analysis Pipeline",
    content:
      "The detection engine operates in three sequential layers: pattern extraction, severity scoring, and verdict calculation. Each layer builds on the output of the previous one.",
    details: [
      "Layer 1: Regex-based linguistic pattern extraction with weighted matching",
      "Layer 2: Category-level severity scoring (red flags vs. green flags)",
      "Layer 3: Ratio-based verdict calculation with confidence calibration",
      "Each layer is independently testable and auditable",
    ],
  },
  {
    icon: Search,
    title: "Red Flag Detection (12 Categories)",
    content:
      "The system identifies 12 distinct categories of misinformation indicators, each with severity-weighted patterns:",
    details: [
      "Sensationalist language — emotionally manipulative words and phrases",
      "Clickbait patterns — common headline manipulation tactics",
      "Anonymous sourcing — vague attribution without named individuals",
      "Fear-mongering — alarmist framing designed to provoke anxiety",
      "Conspiracy language — conspiratorial rhetoric and framing",
      "Excessive capitalization — non-professional formatting",
      "Emoji overuse — unprofessional content indicators",
      "ALL CAPS emphasis — shouting via typography",
      "Multi-exclamation marks — emotional punctuation abuse",
      "Urgency language — pressure tactics to force sharing",
      "Missing citations — no sources, URLs, or references",
      "Inappropriate length — too short for genuine articles",
    ],
  },
  {
    icon: Target,
    title: "Green Flag Detection (9 Categories)",
    content:
      "Simultaneously, the system evaluates credibility indicators consistent with established journalistic standards:",
    details: [
      "Named sources with credentials and specific attributions",
      "Quantitative data — statistics, percentages, dollar amounts",
      "Credible institutions — Reuters, BBC, universities, journals",
      "Temporal specificity — exact dates, timelines, event markers",
      "Balanced reporting — multiple perspectives, counterarguments",
      "Journalistic structure — who, what, where, when, why framework",
      "Neutral tone — absence of emotional or manipulative language",
      "Appropriate length — 80–800 words, consistent with news articles",
      "Named quotes — direct attributions to specific individuals",
    ],
  },
  {
    icon: BarChart3,
    title: "Scoring Methodology",
    content:
      "Verdicts are determined by calculating the ratio of red flag severity scores to green flag severity scores, then applying calibrated thresholds:",
    details: [
      "Red flag ratio ≥ 0.65 → Likely Fake (confidence 55–95%)",
      "Green flag ratio ≥ 0.65 → Likely Real (confidence 55–95%)",
      "Ratio difference > 0.1 → Leaning verdict (confidence 42–78%)",
      "Balanced scores → Uncertain (confidence 35–50%)",
      "Confidence is calibrated to prevent overconfident claims",
    ],
  },
  {
    icon: GitBranch,
    title: "Why Rule-Based Over ML?",
    content:
      "The system deliberately uses rule-based NLP rather than trained ML models. This design decision is grounded in the requirements of media literacy tools:",
    details: [
      "Explainability — every decision can be traced to specific patterns",
      "Transparency — users see exactly why content was flagged",
      "No training data required — works immediately without labeled datasets",
      "Interpretability — critical for educational and academic applications",
      "Consistency — deterministic output for the same input",
      "Trade-off acknowledged: ML models (BERT, RoBERTa) could achieve higher accuracy but sacrifice explainability",
    ],
  },
  {
    icon: BookOpen,
    title: "Academic References",
    content:
      "The detection heuristics are informed by established misinformation research:",
    details: [
      "MIT Media Lab — Fake News detection using linguistic feature extraction",
      "First Draft News — Misinformation taxonomy and indicator framework",
      "Stanford Internet Observatory — Virality Project pattern analysis",
      "Reuters Institute — Digital News Report credibility framework",
      "LIAR Dataset (Wang, 2017) — 12.8K labeled statements for NLP research",
      "MediaWise — Teen media literacy indicators research",
    ],
  },
  {
    icon: Shield,
    title: "Limitations & Future Work",
    content:
      "The current approach has acknowledged limitations that could be addressed in future versions:",
    details: [
      "Does not cross-reference claims against external fact-check databases",
      "No image/video analysis (only text-based content)",
      "Rule-based system requires manual pattern updates",
      "Future: Fine-tuned BERT classifier on LIAR dataset (12.8K statements)",
      "Future: TF-IDF vectorization for topic modeling",
      "Future: Google Fact Check Tools API integration",
      "Future: Image forensics for manipulated media detection",
    ],
  },
];

export function MethodologyView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Technical Methodology</h2>
            <p className="text-sm text-muted-foreground">
              How Fake News Shield detects misinformation — for academic reference
            </p>
          </div>
        </div>
      </motion.div>

      {/* Sections */}
      {sections.map((section, i) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.06 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <section.icon className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-base font-bold">{section.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {section.content}
          </p>
          <ul className="space-y-1.5">
            {section.details.map((detail) => (
              <li
                key={detail}
                className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed"
              >
                <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                {detail}
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
}
