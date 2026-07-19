import React, { useState, useEffect } from 'react';
import { Copy, Check, FileCode, Terminal, HelpCircle } from 'lucide-react';
import { GeneratedFile } from '../types';

interface CodePlaygroundProps {
  file: GeneratedFile | null;
}

export default function CodePlayground({ file }: CodePlaygroundProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-brand-code border border-brand-border rounded-lg p-8 text-center text-slate-500" id="code-playground-empty">
        <HelpCircle className="w-12 h-12 mb-4 text-slate-600 animate-pulse" />
        <p className="text-sm font-medium text-slate-400">Select a file from the explorer to inspect its code</p>
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(file.content);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Fast, highly aesthetic line-level highlighting
  const highlightCode = (code: string, lang: string) => {
    const lines = code.split('\n');
    return lines.map((line, i) => {
      let styledLine = line;

      // Handle common syntax highlights matching Professional Polish (purple/emerald/gray)
      if (lang === 'python') {
        // Comments
        if (line.trim().startsWith('#')) {
          styledLine = `<span class="text-gray-500 italic">${line}</span>`;
        } else {
          // Highlight import keywords
          styledLine = styledLine
            .replace(/\b(import|from|as|def|class|return|if|else|elif|try|except|finally|with|assert)\b/g, '<span class="text-purple-400">$1</span>')
            // Strings
            .replace(/(['"])(.*?)\1/g, '<span class="text-emerald-400">\'$2\'</span>');
        }
      } else if (lang === 'java' || lang === 'csharp' || lang === 'javascript' || lang === 'typescript') {
        // Comments
        if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
          styledLine = `<span class="text-gray-500 italic">${line}</span>`;
        } else {
          // Keywords
          styledLine = styledLine
            .replace(/\b(import|package|public|private|protected|class|interface|extends|implements|new|return|this|void|async|await|const|let|function|expect|export)\b/g, '<span class="text-purple-400">$1</span>')
            // Annotations (e.g., @Test, @BeforeEach)
            .replace(/(@[A-Za-z0-9_]+)/g, '<span class="text-indigo-400">$1</span>')
            // Strings
            .replace(/(["'])(.*?)\1/g, '<span class="text-emerald-400">"$2"</span>');
        }
      } else if (lang === 'yaml' || lang === 'yml') {
        // Comments
        if (line.trim().startsWith('#')) {
          styledLine = `<span class="text-gray-500 italic">${line}</span>`;
        } else {
          // Keys
          styledLine = styledLine
            .replace(/^(\s*)([^#:\s]+)(\s*:)/, '$1<span class="text-purple-400">$2</span>$3')
            // Values
            .replace(/(:\s+)(.*)$/, '$1<span class="text-emerald-400">$2</span>');
        }
      }

      return (
        <div key={i} className="flex leading-6 hover:bg-brand-border/20 px-4 transition-colors">
          {/* Line Number */}
          <span className="w-12 text-right pr-4 text-slate-600 font-mono text-xs select-none border-r border-brand-border">
            {i + 1}
          </span>
          {/* Code Body */}
          <pre 
            className="pl-4 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre"
            dangerouslySetInnerHTML={{ __html: styledLine || ' ' }}
          />
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-brand-code border border-brand-border rounded-lg overflow-hidden shadow-2xl" id={`code-playground-${file.name.replace(/[/.]/g, '-')}`}>
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-brand-header border-b border-brand-border shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs font-mono text-slate-300 truncate">{file.path}</span>
          <span className="text-[10px] bg-brand-border text-slate-400 px-2 py-0.5 rounded-full font-mono uppercase">
            {file.language}
          </span>
        </div>
        
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-border hover:bg-brand-border/80 text-slate-300 hover:text-white transition-all text-xs font-medium border border-brand-border/60 cursor-pointer"
          title="Copy to clipboard"
          id="btn-copy-code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400 animate-scale" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Editor Scroll Container */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar bg-brand-code/40">
        <div className="flex flex-col min-w-max">
          {highlightCode(file.content, file.language)}
        </div>
      </div>
    </div>
  );
}
