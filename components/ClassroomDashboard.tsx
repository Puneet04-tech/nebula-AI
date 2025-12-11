
import React from 'react';
import { ClassroomStats, EngagementState } from '../types';

interface ClassroomDashboardProps {
  stats: ClassroomStats;
  accessCode: string;
  onClose: () => void;
}

export const ClassroomDashboard: React.FC<ClassroomDashboardProps> = ({ stats, accessCode, onClose }) => {
  return (
    <div className="fixed inset-x-0 top-24 z-30 pointer-events-none px-4 animate-fade-in">
       <div className="max-w-6xl mx-auto flex justify-between items-start">
         {/* Teacher HUD */}
         <div className="glass p-6 rounded-3xl pointer-events-auto flex flex-col space-y-4 shadow-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]"></span>
                 Classroom Live
               </h2>
               <button onClick={onClose} className="text-slate-400 hover:text-white ml-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-xs text-slate-400 uppercase font-bold">Students</span>
                  <div className="text-2xl font-mono text-white">{stats.activeStudents}/{stats.studentCount}</div>
               </div>
               <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-xs text-slate-400 uppercase font-bold">Code</span>
                  <div className="text-2xl font-mono text-indigo-400 tracking-widest">{accessCode}</div>
               </div>
            </div>

            <div className="space-y-2">
               <span className="text-xs text-slate-400 uppercase font-bold">Room Vibe</span>
               <div className="flex items-center space-x-3 bg-white/5 p-2 rounded-xl border border-white/5">
                  <div className={`px-3 py-1 rounded-full text-sm font-bold border border-white/5 ${stats.avgEngagement === EngagementState.Focused ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                     {stats.avgEngagement}
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{stats.confusedCount} Confused</span>
               </div>
            </div>
            
            <div className="pt-2 border-t border-white/5">
                <span className="text-xs text-slate-400 uppercase font-bold">Lesson Timer</span>
                <div className="text-3xl font-black text-white font-mono tracking-tight">
                  {Math.floor(stats.lessonTimeRemaining / 60)}:{(stats.lessonTimeRemaining % 60).toString().padStart(2, '0')}
                </div>
            </div>
         </div>
       </div>
    </div>
  );
};
