"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

const ANALYSIS_PROMPT = `You are an expert fake news detector and media literacy analyst. Your task is to analyze the given news article or text and determine whether it is likely real or fake news.

Analyze the text for the following indicators:

RED FLAGS (indicators of fake news):
- Sensationalist or emotionally manipulative language
- Lack of specific sources, citations, or verifiable data
- Anonymous or vague sourcing ("experts say", "studies show")
- Clickbait headlines or excessive use of capital letters/exclamation marks
- Logical fallacies or unsupported claims
- Misleading statistics or data presentation
- Author has no verifiable credentials
- Content contradicts well-established scientific consensus
- Extreme bias or one-sided presentation
- Urgency or fear-mongering language
- Conspiracy theory language
- Lack of date or location specifics

GREEN FLAGS (indicators of real news):
- Specific named sources with credentials
- Balanced reporting with multiple perspectives
- Verifiable data, statistics, and citations
- Neutral or measured tone
- Author attribution with credible background
- Specific dates, locations, and names
- Quotes from named individuals
- Follows journalistic standards (who, what, where, when, why)
- Consistent with established facts from reliable sources

You must respond in this exact JSON format (no markdown, no code blocks, just raw JSON):
{
  "verdict": "likely_real" | "likely_fake" | "uncertain",
  "confidence": number between 0 and 100,
  "summary": "A brief 2-3 sentence summary of your analysis",
  "redFlags": ["array of specific red flags found, or empty array"],
  "greenFlags": ["array of specific green flags found, or empty array"],
  "reasoning": "A detailed 3-5 sentence explanation of your reasoning"
}`;

export const analyzeNews = action({
  args: {
    text: v.string(),
    inputType: v.union(v.literal("text"), v.literal("url")),
  },
  handler: async (_ctx, args) => {
    // Lazy-load OpenAI so missing env var doesn't crash module load
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const userMessage =
      args.inputType === "url"
        ? `Analyze the following news URL and its likely content:\n\n${args.text}\n\nIf this is a URL, evaluate what you can infer from the URL structure and domain, and provide your best assessment.`
        : `Analyze the following news article text for authenticity:\n\n${args.text}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: ANALYSIS_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from AI model");
      }

      const parsed = JSON.parse(content);

      return {
        verdict: parsed.verdict as "likely_real" | "likely_fake" | "uncertain",
        confidence: Math.min(100, Math.max(0, Number(parsed.confidence))),
        summary: parsed.summary as string,
        redFlags: parsed.redFlags as string[],
        greenFlags: parsed.greenFlags as string[],
        reasoning: parsed.reasoning as string,
      };
    } catch (error) {
      console.error("Analysis error:", error);
      if (error instanceof SyntaxError) {
        throw new Error("Failed to parse AI response. Please try again.");
      }
      throw error;
    }
  },
});
