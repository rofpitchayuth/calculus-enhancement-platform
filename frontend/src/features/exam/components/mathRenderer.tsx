import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import type { ReactNode } from "react";

// Unicode → LaTeX substitution table
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

      const latex = applyUnicodeSubstitutions(part);

      return (
        <span key={index} className="mx-0.5">
          <InlineMath
            math={latex}
            renderError={() => (
              <span className="font-mono text-red-500">${part}$</span>
            )}
          />
        </span>
      );
    });
  } catch {
    return <span>{text}</span>;
  }
}
