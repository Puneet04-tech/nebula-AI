import React, { useState } from 'react';

interface StudentJoinModalProps {
  onJoin: (code: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const StudentJoinModal: React.FC<StudentJoinModalProps> = ({ onJoin, onCancel, isLoading }) => {
  const [code, setCode] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="glass p-8 rounded-3xl w-full max-w-md border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2">Join Classroom</h2>
        <p className="text-slate-400 mb-6">Enter the 4-digit code from your teacher's screen.</p>
        
        <input 
          type="text" 
          maxLength={4}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="CODE"
          className="w-full bg-slate-800/50 border border-slate-700 text-white text-center text-4xl tracking-[1rem] font-mono rounded-xl py-6 mb-6 focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
        />

        <div className="flex space-x-4">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-slate-700 text-slate-300 font-bold hover:bg-slate-600 transition-colors">
            Cancel
          </button>
          <button 
            onClick={() => onJoin(code)} 
            disabled={code.length < 4 || isLoading}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Join'}
          </button>
        </div>
      </div>
    </div>
  );
};
