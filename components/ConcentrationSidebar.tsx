import React, { useRef, useEffect, useState } from 'react';
import { ConcentrationEntry, EngagementState } from '../types';

interface ConcentrationSidebarProps {
  logs: ConcentrationEntry[];
  isVisible: boolean;
}

export const ConcentrationSidebar: React.FC<ConcentrationSidebarProps> = ({ logs, isVisible }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isVisible) return null;

  return (
    <div className={`fixed left-4 top-32 z-30 transition-all duration-300 flex flex-col items-start ${isCollapsed ? 'w-12 h-12' : 'w-80 h-[60vh]'}`}>
      <div className={`rounded-3xl shadow-2xl overflow-hidden animate-fade-in glass flex flex-col w-full border border-white/10 transition-all duration-300 ${isCollapsed ? 'h-12 w-12 rounded-full items-center justify-center bg-rose-900/90' : 'h-full bg-rose-950/80'}`}>
        
        {/* Header */}
        <div className={`flex items-center w-full transition-all ${isCollapsed ? 'justify-center p-0' : 'justify-between p-4 border-b border-white/5 bg-rose-900/40'}`}>
          {!isCollapsed && (
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]"></span>
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-rose-100 text-sm tracking-tight truncate">Engagement</h3>
                <p className="text-[10px] uppercase font-semibold text-rose-300/70 tracking-wider truncate">Live Analysis</p>
              </div>
            </div>
          )}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className={`flex items-center justify-center rounded-full hover:bg-white/10 text-rose-300 hover:text-white transition-all ${isCollapsed ? 'w-full h-full' : 'p-2'}`}
            title={isCollapsed ? "Expand" : "Minimize"}
          >
            {isCollapsed ? (
               <div className="relative">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                 <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                 </span>
               </div>
            ) : (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
            )}
          </button>
        </div>

        {/* Logs List */}
        {!isCollapsed && (
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
            {logs.length === 0 ? (
               <div className="text-center text-rose-300/50 text-xs py-8">Waiting for data...</div>
            ) : (
              logs.map((log, i) => {
                const styles = log.state === EngagementState.Focused 
                  ? { bg: 'bg-emerald-900/40', text: 'text-emerald-300', border: 'border-emerald-800/50', badge: 'bg-emerald-900/60' }
                  : log.state === EngagementState.Confused 
                  ? { bg: 'bg-amber-900/40', text: 'text-amber-300', border: 'border-amber-800/50', badge: 'bg-amber-900/60' }
                  : log.state === EngagementState.Distracted 
                  ? { bg: 'bg-rose-900/40', text: 'text-rose-300', border: 'border-rose-800/50', badge: 'bg-rose-900/60' }
                  : { bg: 'bg-slate-900/40', text: 'text-slate-300', border: 'border-slate-800/50', badge: 'bg-slate-900/60' };

                return (
                  <div key={i} className={`p-3 rounded-xl ${styles.bg} border ${styles.border} animate-fade-in`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${styles.badge} ${styles.text} border border-white/5`}>
                        {log.state}
                      </span>
                      <span className="text-[10px] text-rose-300/50 font-mono">
                        {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-rose-100 leading-snug pl-1 border-l-2 border-white/10">
                      {log.observation}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};