/**
 * mathRenderer.tsx — Shared Utility (Presentation Layer)
 * ========================================================
 * Renders a mixed string of plain text and LaTeX (delimited by $…$) as
 * React elements using react-katex's InlineMath component.
 *
 * Usage:
 *   import { renderMathText } from "./mathRenderer";
 *   <p>{renderMathText("หา $f'(x)$ เมื่อ $f(x) = x^2$")}</p>
 *
 * Design notes:
 *   - Pure function: no hooks, no state, no side effects.
 *   - Falls back gracefully: if KaTeX cannot parse a segment it renders the
 *     raw string wrapped in a red <span> instead of crashing.
 *   - Unicode → LaTeX substitution is applied before parsing so that question
 *     text that stores ∫, √, π, etc. as Unicode characters still renders.
 */

import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Unicode → LaTeX substitution table
// ---------------------------------------------------------------------------

const UNICODE_TO_LATEX: [RegExp, string][] = [
  [/∫/g,  "\\int "],
  [/→/g,  "\\to "],
  [/≤/g,  "\\leq "],
  [/≥/g,  "\\geq "],
  [/×/g,  "\\times "],
  [/÷/g,  "\\div "],
  [/±/g,  "\\pm "],
  [/≠/g,  "\\neq "],
  [/∞/g,  "\\infty "],
  [/π/g,  "\\pi "],
  [/√/g,  "\\sqrt "],
  [/α/g,  "\\alpha "],
  [/β/g,  "\\beta "],
  [/θ/g,  "\\theta "],
  [/Δ/g,  "\\Delta "],
];

function applyUnicodeSubstitutions(latex: string): string {
  return UNICODE_TO_LATEX.reduce(
    (acc, [pattern, replacement]) => acc.replace(pattern, replacement),
    latex
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Split text by $…$ delimiters and render math segments with KaTeX.
 *
 * @param text - Raw string that may contain $…$ LaTeX segments.
 * @returns    Array of ReactNode (spans for plain text, InlineMath for math).
 */
export function renderMathText(text: string): ReactNode {
  if (!text) return null;

  try {
    const parts = text.split("$");

    return parts.map((part, index) => {
      if (!part) return null;

      // Even indices are plain text segments.
      if (index % 2 === 0) {
        return (
          <span key={index} className="whitespace-pre-wrap">
            {part}
          </span>
        );
      }

      // Odd indices are LaTeX segments — apply Unicode substitutions first.
      const latex = applyUnicodeSubstitutions(part);

      return (
        <span key={index} className="mx-0.5">
          <InlineMath
            math={latex}
            // Graceful fallback: show the raw LaTeX wrapped in a red span.
            renderError={() => (
              <span className="font-mono text-red-500">${part}$</span>
            )}
          />
        </span>
      );
    });
  } catch {
    // If anything unexpected throws, fall back to the raw string.
    return <span>{text}</span>;
  }
}
