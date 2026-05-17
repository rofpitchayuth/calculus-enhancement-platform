import React, { useState, useRef, useEffect } from 'react';
import "mathlive";

/**
 * MathImageUploader.tsx
 * =================================================================
 * A specialized component for the Admin dashboard that allows
 * pasting a math screenshot, extracting the LaTeX via AI, 
 * and fine-tuning it with a WYSIWYG MathLive editor.
 */

interface MathImageUploaderProps {
  onLatexChange: (latex: string) => void;
  onExtractedData?: (data: { latex: string; choices: string[] }) => void;
  initialValue?: string;
  label?: string;
}

import { API_BASE_URL as API_BASE } from '../../../shared/api/config';

const MathImageUploader: React.FC<MathImageUploaderProps> = ({ 
  onLatexChange,
  onExtractedData,
  initialValue = "",
  label = "Question Math / Equation"
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latex, setLatex] = useState(initialValue);
  const mathFieldRef = useRef<any>(null);

  // Sync state with parent's initial value
  useEffect(() => {
    if (initialValue && initialValue !== latex) {
      setLatex(initialValue);
    }
  }, [initialValue]);

  // Handle MathLive Web Component Lifecycle
  useEffect(() => {
    const mfe = mathFieldRef.current;
    if (mfe) {
      // Set initial value
      mfe.value = latex;
      
      // Configure MathLive (options like smartMode, virtualKeyboardMode can be set here)
      mfe.smartMode = true;
      
      const handleInput = (e: any) => {
        const newValue = e.target.value;
        setLatex(newValue);
        onLatexChange(newValue);
      };

      mfe.addEventListener('input', handleInput);
      return () => mfe.removeEventListener('input', handleInput);
    }
  }, []);

  // Update mathfield display if internal state changes (e.g., after AI extraction)
  useEffect(() => {
    if (mathFieldRef.current && mathFieldRef.current.value !== latex) {
      mathFieldRef.current.value = latex;
    }
  }, [latex]);

  /**
   * Captures image from clipboard, converts to base64, and calls AI Vision API.
   */
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    let imageFile: File | null = null;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        imageFile = items[i].getAsFile();
        break;
      }
    }

    if (!imageFile) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${API_BASE}/admin/extract-math-image`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ base64_image: base64String }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          if (response.status === 503) {
              throw new Error("AI Vision service is currently unavailable. Ensure the ML microservice is running.");
          }
          throw new Error(errData.detail || "Failed to extract LaTeX from image.");
        }

        const data = await response.json();
        const extractedLatex = data.latex;
        const extractedChoices = data.choices || [];
        
        setLatex(extractedLatex);
        onLatexChange(extractedLatex);
        
        if (onExtractedData) {
          onExtractedData({ latex: extractedLatex, choices: extractedChoices });
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(imageFile);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
        {latex && (
           <button 
             onClick={() => { setLatex(""); onLatexChange(""); }}
             className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
           >
             Clear Math
           </button>
        )}
      </div>

      {/* Paste & Drop Zone */}
      <div
        onPaste={handlePaste}
        tabIndex={0}
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all duration-300
          flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400
          ${loading ? 'bg-blue-50 border-blue-300 scale-[0.99]' : 'bg-gray-50 border-gray-300 hover:border-blue-400 hover:bg-white'}
        `}
      >
        {loading ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 font-bold text-[10px]">AI</div>
            </div>
            <p className="text-blue-600 font-semibold animate-pulse tracking-tight">🤖 AI Vision is extracting math...</p>
          </div>
        ) : (
          <div className="text-center group">
            <div className="bg-blue-100 p-3 rounded-full inline-block mb-3 group-hover:bg-blue-200 transition-colors">
               <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
            </div>
            <p className="text-gray-700 font-bold text-sm">Click here & Paste Image</p>
            <p className="text-gray-400 text-xs mt-1">Screenshot with (Ctrl+V / Cmd+V)</p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 shadow-sm animate-shake">
          <span className="text-lg">⚠️</span> {error}
        </div>
      )}

      {/* MathLive WYSIWYG Editor */}
      <div className="space-y-2">
        <div className={`
          border rounded-xl overflow-hidden shadow-sm transition-all duration-200 bg-white
          ${loading ? 'opacity-50 pointer-events-none grayscale' : 'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent'}
        `}>
          <math-field
            ref={mathFieldRef}
            class="mathlive-editor w-full p-4 outline-none min-h-[80px]"
          />
        </div>
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
            Visual Equation Editor (MathLive)
          </p>
          <p className="text-[10px] text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded-full">
            LATEX: {latex.length > 30 ? latex.substring(0, 30) + '...' : latex || 'empty'}
          </p>
        </div>
      </div>
      
      {/* Visual Hint */}
      {!latex && !loading && (
         <p className="text-center text-xs text-gray-400 italic bg-gray-50 py-2 rounded-lg border border-gray-100">
           Extract math from a screenshot or type it manually above.
         </p>
      )}
    </div>
  );
};

export default MathImageUploader;
