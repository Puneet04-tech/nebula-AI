import React, { useState } from 'react';

interface InstructionsModalProps {
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'gestures' | 'voice' | 'general'>('general');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass w-full max-w-4xl h-[80vh] rounded-3xl flex flex-col overflow-hidden border border-white/10 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">User Manual</h2>
              <p className="text-xs text-rose-300 uppercase tracking-wider font-bold">Nebula AI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-slate-900/50">
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'general' ? 'text-rose-400 border-b-2 border-rose-500 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Workflow
          </button>
          <button 
            onClick={() => setActiveTab('gestures')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'gestures' ? 'text-rose-400 border-b-2 border-rose-500 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}
          >
            ✋ Gestures
          </button>
          <button 
            onClick={() => setActiveTab('voice')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'voice' ? 'text-rose-400 border-b-2 border-rose-500 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}
          >
            🎙️ Voice
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-900/40">
          
          {activeTab === 'general' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-rose-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">1. Input Content</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Upload a clear image of a textbook page, diagram, or whiteboard. You can also use the Live Camera.</p>
                </div>
                
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-rose-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">2. Configure</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Choose your <strong>Action</strong> (Explain, Quiz, Flashcards) and <strong>Persona</strong> (Einstein, Cyber AI, etc.) to tailor the learning experience.</p>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-rose-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">3. Interact</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Use <strong>Gestures</strong> (like Thumbs Up) or <strong>Voice Commands</strong> ("Explain this") to control the AI hands-free.</p>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-rose-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">4. Classroom Mode</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Teachers can create a room. Students join via code. All content syncs instantly via P2P. Engagement is tracked automatically.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gestures' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-rose-900/20 border border-rose-500/30 p-4 rounded-xl flex items-start gap-4 mb-6">
                <div className="text-2xl">💡</div>
                <p className="text-sm text-rose-200"><strong>Pro Tip:</strong> Hold gestures for <strong>1 second</strong> until the progress bar fills to trigger an action.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: "✋", name: "Open Palm", action: "Explain", desc: "Detailed explanation of content." },
                  { icon: "👍", name: "Thumb Up", action: "Summary", desc: "Quick summary and key points." },
                  { icon: "✌️", name: "Victory", action: "Quiz", desc: "Generate a 3-question quiz." },
                  { icon: "🤟", name: "I Love You", action: "Examples", desc: "Show practice problems." },
                  { icon: "✊", name: "Closed Fist", action: "Scroll", desc: "Move hand up/down to scroll page." },
                  { icon: "🤏", name: "Pinch", action: "Select", desc: "Highlight specific regions." },
                ].map((g, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-4xl bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center border border-white/10 shadow-inner">
                      {g.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{g.name}</h4>
                      <div className="text-xs text-rose-400 font-mono mb-1 uppercase tracking-wide">{g.action}</div>
                      <p className="text-slate-400 text-xs">{g.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'voice' && (
             <div className="space-y-6 animate-fade-in">
               <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl flex items-start gap-4 mb-6">
                 <div className="text-2xl">🎙️</div>
                 <p className="text-sm text-indigo-200"><strong>Note:</strong> No wake word needed. Just speak clearly when the microphone is active.</p>
               </div>
 
               <div className="grid grid-cols-1 gap-4">
                 <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                   <h4 className="text-slate-300 font-bold mb-3 uppercase text-xs tracking-wider">Content Generation</h4>
                   <div className="flex flex-wrap gap-2">
                     {["Explain this", "Quiz me", "Create flashcards", "Summarize this", "Give me examples"].map(cmd => (
                       <span key={cmd} className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-sm">
                         "{cmd}"
                       </span>
                     ))}
                   </div>
                 </div>

                 <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                   <h4 className="text-slate-300 font-bold mb-3 uppercase text-xs tracking-wider">Navigation & Access</h4>
                   <div className="flex flex-wrap gap-2">
                     {["Scroll down", "Scroll up", "Read this", "Stop reading", "Dyslexia mode", "High contrast"].map(cmd => (
                       <span key={cmd} className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-sm">
                         "{cmd}"
                       </span>
                     ))}
                   </div>
                 </div>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};