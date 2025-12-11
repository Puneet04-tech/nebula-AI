
import React, { useEffect, useState, useRef } from 'react';
import { ActionType } from '../types';

interface VoiceControllerProps {
  onCommand: (action: ActionType) => void;
  onScroll: (direction: 'up' | 'down') => void;
  onStop: () => void;
  onRead: () => void;
  onAccessibilityToggle: (feature: string) => void;
}

export const VoiceController: React.FC<VoiceControllerProps> = ({ onCommand, onScroll, onStop, onRead, onAccessibilityToggle }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const shouldListenRef = useRef(true);
  const recognitionRef = useRef<any>(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.warn("Speech recognition not supported in this browser.");
      setTranscript("Browser not supported (Use Chrome)");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false; // Set to false to prevent buffer issues, we restart manually
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript.toLowerCase();
      setTranscript(text);

      if (event.results[current].isFinal) {
         if (text.includes('explain')) onCommand(ActionType.Explain);
         else if (text.includes('quiz')) onCommand(ActionType.Quiz);
         else if (text.includes('summary')) onCommand(ActionType.Summary);
         else if (text.includes('flashcard')) onCommand(ActionType.Flashcards);
         else if (text.includes('scroll down')) onScroll('down');
         else if (text.includes('scroll up')) onScroll('up');
         else if (text.includes('read') || text.includes('speak')) onRead();
         else if (text.includes('stop') || text.includes('quiet')) onStop();
         
         // Accessibility Commands
         else if (text.includes('dyslexia') || text.includes('font')) onAccessibilityToggle('dyslexia');
         else if (text.includes('high contrast') || text.includes('contrast')) onAccessibilityToggle('contrast');
         else if (text.includes('ruler') || text.includes('guide')) onAccessibilityToggle('ruler');
         else if (text.includes('bigger') || text.includes('larger')) onAccessibilityToggle('larger');
         else if (text.includes('normal text') || text.includes('reset text')) onAccessibilityToggle('normal');
         
         // Clear transcript after command
         setTimeout(() => setTranscript(''), 1000);
      }
    };

    recognition.onstart = () => {
      setIsListening(true);
      retryCountRef.current = 0;
    };
    
    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if we still want to listen
      if (shouldListenRef.current) {
        setTimeout(() => {
          try { recognition.start(); } catch (e) { /* ignore already started */ }
        }, 100);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Voice recognition error", event.error);
      if (event.error === 'not-allowed') {
        shouldListenRef.current = false;
        setTranscript("Mic Blocked");
      }
      if (event.error === 'network' || event.error === 'aborted') {
          if (retryCountRef.current < 5) {
             retryCountRef.current++;
             setTranscript("Reconnecting...");
          } else {
             shouldListenRef.current = false;
             setTranscript("Connection Lost");
          }
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }

    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [onCommand, onScroll, onStop, onRead, onAccessibilityToggle]);

  return (
    <div className="fixed bottom-36 right-8 z-40 flex flex-col items-end group">
      {/* Tooltip / Command List */}
      <div className="mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-slate-900/90 backdrop-blur border border-white/10 rounded-xl p-3 text-[10px] text-slate-300 shadow-xl w-48">
        <p className="font-bold text-white mb-2 uppercase tracking-wider border-b border-white/10 pb-1">Commands</p>
        <div className="grid grid-cols-2 gap-2">
           <span>• Explain</span>
           <span>• Quiz Me</span>
           <span>• Summary</span>
           <span>• Flashcards</span>
           <span>• Read / Speak</span>
           <span>• Stop</span>
           <span>• Scroll Down</span>
           <span>• Scroll Up</span>
           <span className="col-span-2 text-indigo-400 mt-1">• "Dyslexia Mode"</span>
           <span className="col-span-2 text-indigo-400">• "High Contrast"</span>
        </div>
      </div>

      {/* Main Widget */}
      <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center space-x-3 shadow-lg animate-fade-in hover:bg-slate-800 transition-colors cursor-pointer ring-1 ring-white/5">
        <div className="relative">
          <div className={`w-3 h-3 ${isListening ? 'bg-rose-500 animate-ping' : 'bg-slate-500'} rounded-full absolute`}></div>
          <div className={`w-3 h-3 ${isListening ? 'bg-rose-500' : 'bg-slate-500'} rounded-full relative`}></div>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
             Voice Control
             <span className="text-[8px] px-1 rounded bg-white/10 text-white group-hover:block hidden">?</span>
          </span>
          <span className="text-xs font-mono text-slate-200 truncate max-w-[150px]">
            {transcript || (isListening ? "Listening..." : "Paused")}
          </span>
        </div>
      </div>
    </div>
  );
};
