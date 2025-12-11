import React from 'react';
import { GroundingChunk } from '../types';

interface ResultDisplayProps {
  content: string;
  groundingData?: GroundingChunk[] | null;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ content, groundingData }) => {
  const formatText = (text: string) => {
    // Check for SVG Code Block
    const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/);
    let textContent = text;
    let svgContent: string | null = null;

    if (svgMatch) {
      svgContent = svgMatch[0];
      textContent = text.replace(svgMatch[0], ''); // Remove SVG from text to render separately
    }

    const lines = textContent.split('\n');
    
    return (
      <>
        {/* Render SVG if present (Magic Canvas) */}
        {svgContent && (
          <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-center overflow-hidden">
            <div dangerouslySetInnerHTML={{ __html: svgContent }} className="w-full max-w-lg" />
          </div>
        )}

        {lines.map((line, index) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={index} className="h-6" />;

          // Headers
          if (trimmed.startsWith('Title:') || trimmed.startsWith('Quiz title') || trimmed.startsWith('Short summary:') || trimmed.startsWith('Answer key')) {
            const titleText = trimmed.replace(/^(Title:|Quiz title|Short summary:|Answer key)\s*/, '');
            return (
              <div key={index} className="mt-8 mb-6">
                <h3 className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">
                  {titleText}
                </h3>
                <div className="h-1 w-20 bg-rose-500 rounded-full mt-2 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
              </div>
            );
          }
          
          // Sub-headers
          if (trimmed.startsWith('Key points:') || trimmed.startsWith('Plain-language explanation:') || trimmed.startsWith('Key concepts list:') || trimmed.startsWith('One-liner recap:')) {
            return (
              <h4 key={index} className="flex items-center space-x-2 text-sm font-bold text-rose-400 mt-6 mb-3 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 box-shadow-glow"></span>
                <span>{trimmed.replace(/:$/, '')}</span>
              </h4>
            );
          }

          // Bullet points
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <li key={index} className="ml-0 pl-6 mb-3 text-rose-100 leading-relaxed list-none relative group">
                <span className="absolute left-0 top-2.5 w-1.5 h-1.5 rounded-full bg-rose-500/50 group-hover:bg-rose-400 transition-colors"></span>
                {trimmed.substring(2)}
              </li>
            );
          }

          // Numbered lists (Quiz questions)
          if (/^\d+\./.test(trimmed)) {
            return (
              <div key={index} className="mt-6 mb-3 font-semibold text-rose-50 text-lg flex items-baseline">
                <span className="mr-2 text-rose-400 font-bold">{trimmed.split('.')[0]}.</span>
                <span>{trimmed.substring(trimmed.indexOf('.') + 1)}</span>
              </div>
            );
          }

          // Multiple choice
          if (/^[A-D]\./.test(trimmed) || /^[a-d]\./.test(trimmed)) {
            return (
              <div key={index} className="ml-8 mb-2 p-3 rounded-lg border border-transparent hover:border-rose-500/30 hover:bg-rose-500/10 transition-all cursor-default flex items-center">
                <span className="w-6 h-6 flex items-center justify-center bg-rose-900/50 text-rose-300 rounded-full text-xs font-bold mr-3 border border-rose-500/20">
                  {trimmed.charAt(0).toUpperCase()}
                </span>
                <span className="text-slate-400 group-hover:text-rose-200">{trimmed.substring(2)}</span>
              </div>
            );
          }

          // Default paragraph
          return (
            <p key={index} className="mb-4 text-slate-300 text-lg leading-8 font-light">
              {line}
            </p>
          );
        })}
      </>
    );
  };

  return (
    <div className="glass rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 md:p-12 animate-fade-in ring-1 ring-white/5">
      <div className="prose prose-invert max-w-none">
        {formatText(content)}
      </div>

      {/* Grounding Sources */}
      {groundingData && groundingData.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/10">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Verified Sources</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {groundingData.map((chunk, i) => chunk.web ? (
              <a 
                key={i} 
                href={chunk.web.uri} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/50 hover:bg-rose-900/30 border border-white/5 hover:border-rose-500/30 transition-all group"
              >
                <div className="p-2 bg-slate-900 rounded-lg text-rose-400 group-hover:text-rose-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                </div>
                <div className="overflow-hidden">
                   <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white">{chunk.web.title}</p>
                   <p className="text-xs text-slate-500 truncate">{new URL(chunk.web.uri).hostname}</p>
                </div>
              </a>
            ) : null)}
          </div>
        </div>
      )}
      
      <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between text-slate-500 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
          <span>AI Generated Content</span>
        </div>
        <span>Gemini 3 Pro</span>
      </div>
    </div>
  );
};