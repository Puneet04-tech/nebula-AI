import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UserRole, EducationLevel, ActionType, AppState, ConcentrationEntry, EngagementState, Persona, FeedbackType, GroundingChunk, ClassroomStats, P2PMessage } from './types';
import { generateTeachingContent } from './services/geminiService';
import { p2pService } from './services/p2pService';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ResultDisplay } from './components/ResultDisplay';
import { LiveCamera } from './components/LiveCamera';
import { GestureController } from './components/GestureController';
import { ConcentrationSidebar } from './components/ConcentrationSidebar';
import { VoiceController } from './components/VoiceController';
import { FlashcardDeck } from './components/FlashcardDeck';
import { AccessibilityControls } from './components/AccessibilityControls';
import { ReadingRuler } from './components/ReadingRuler';
import { ClassroomDashboard } from './components/ClassroomDashboard';
import { StudentJoinModal } from './components/StudentJoinModal';
import { InstructionsModal } from './components/InstructionsModal';

// Icons
const IconUpload = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>;
const IconCamera = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>;
const IconSparkles = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>;
const IconHand = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575V12a6.75 6.75 0 006.75 6.75h.75c2.486 0 4.5-2.014 4.5-4.5v-5.25" /></svg>;
const IconMic = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const IconSpeaker = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>;
const IconEye = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconTranslate = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" /></svg>;
const IconClassroom = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /></svg>;
const IconHelp = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>;

interface HighlightBox { x: number; y: number; w: number; h: number; }

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    role: UserRole.Teacher,
    level: EducationLevel.MiddleSchool,
    action: ActionType.Explain,
    persona: Persona.Standard,
    language: 'English',
    prompt: '',
    images: [], 
    focusedImageIndex: 0,
    isLoading: false,
    result: null,
    groundingData: null,
    error: null,
    xp: 0,
    levelNum: 1,
    isTtsActive: false,
    feedback: null,
    feedbackHistory: [],
    accessibility: {
      dyslexiaFont: false,
      highContrast: false,
      readingRuler: false,
      textSize: 'normal',
      colorFilter: 'none'
    },
    isClassroomMode: false,
    peerId: null,
    connectedPeers: 0
  });

  const [showCamera, setShowCamera] = useState(false);
  const [showGestureController, setShowGestureController] = useState(false);
  const [showVoiceControl, setShowVoiceControl] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const [highlightBox, setHighlightBox] = useState<HighlightBox | null>(null);
  const [concentrationLogs, setConcentrationLogs] = useState<ConcentrationEntry[]>([]);
  
  // Real Classroom Stats
  const [classroomStats, setClassroomStats] = useState<ClassroomStats>({
     studentCount: 0,
     activeStudents: 0,
     avgEngagement: EngagementState.Neutral,
     confusedCount: 0,
     lessonTimeRemaining: 2700 
  });
  
  const globalCursorCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const cursorRef = useRef<{x: number, y: number}>({ x: -100, y: -100 });
  const isPinchingRef = useRef<boolean>(false);
  const clickDebounceRef = useRef<number>(0);
  const boxRef = useRef<HighlightBox | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);

  // Initialize P2P Listener
  useEffect(() => {
    p2pService.onMessage((msg: P2PMessage) => {
      if (msg.type === 'SYNC_STATE') {
        const payload = msg.payload;
        if (state.role === UserRole.Student) {
            setState(prev => ({ 
              ...prev, 
              images: payload.images, 
              focusedImageIndex: payload.focusedIndex, 
              result: payload.result,
              isClassroomMode: true,
              error: null
            }));
        }
      } else if (msg.type === 'ENGAGEMENT_UPDATE') {
        const newState = msg.payload.state as EngagementState;
        setClassroomStats(prev => {
           const newConfused = newState === EngagementState.Confused ? prev.confusedCount + 1 : Math.max(0, prev.confusedCount - 1);
           return {
             ...prev,
             confusedCount: newConfused,
             avgEngagement: newConfused > (prev.activeStudents / 3) ? EngagementState.Confused : EngagementState.Focused
           }
        });
      }
    });
  }, [state.role]);

  // Classroom Timer
  useEffect(() => {
    if (!state.isClassroomMode) return;
    const interval = setInterval(() => {
      setClassroomStats(prev => ({...prev, lessonTimeRemaining: Math.max(0, prev.lessonTimeRemaining - 1)}));
    }, 1000);
    return () => clearInterval(interval);
  }, [state.isClassroomMode]);

  useEffect(() => {
    if (state.role === UserRole.Teacher && state.peerId) {
      p2pService.sendMessage({
        type: 'SYNC_STATE',
        payload: {
          images: state.images,
          focusedIndex: state.focusedImageIndex,
          result: state.result
        }
      });
    }
  }, [state.images, state.focusedImageIndex, state.result, state.peerId, state.role, state.connectedPeers]);

  const handleStartClass = async () => {
    try {
      const id = await p2pService.createRoom();
      setState(prev => ({ ...prev, isClassroomMode: true, peerId: id }));
      setInterval(() => {
        const count = p2pService.getPeerCount();
        setState(prev => ({...prev, connectedPeers: count}));
        setClassroomStats(prev => ({
          ...prev, 
          studentCount: count, 
          activeStudents: count 
        }));
      }, 2000);
    } catch (e) {
      console.error("Failed to start class", e);
      setState(prev => ({ ...prev, error: "Failed to create classroom session." }));
    }
  };

  const handleJoinClass = async (code: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await p2pService.joinRoom(code);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isClassroomMode: true, 
        role: UserRole.Student,
        peerId: code 
      }));
      setShowJoinModal(false);
      setShowGestureController(true); // Auto enable engagement
    } catch (e) {
      setState(prev => ({ ...prev, isLoading: false, error: "Invalid Class Code or Connection Failed" }));
    }
  };

  useEffect(() => {
    if (state.result && resultRef.current) resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [state.result]);

  useEffect(() => {
    if (state.accessibility.dyslexiaFont) document.body.classList.add('font-dyslexic');
    else document.body.classList.remove('font-dyslexic');
    if (state.accessibility.highContrast) document.body.classList.add('high-contrast');
    else document.body.classList.remove('high-contrast');
    document.body.classList.remove('text-large', 'text-xlarge');
    if (state.accessibility.textSize === 'large') document.body.classList.add('text-large');
    if (state.accessibility.textSize === 'xlarge') document.body.classList.add('text-xlarge');
    if (state.accessibility.colorFilter !== 'none') {
       document.body.style.filter = `url(#${state.accessibility.colorFilter})`;
    } else {
       document.body.style.filter = 'none';
    }
  }, [state.accessibility]);

  useEffect(() => {
    const renderLoop = () => {
      const canvas = globalCursorCanvasRef.current;
      if (canvas) {
        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        }
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const { x, y } = cursorRef.current;
          if (x >= 0 && y >= 0) {
            ctx.shadowColor = "rgba(225, 29, 72, 0.5)"; // Rose shadow
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 5, y + 26); 
            ctx.lineTo(x + 10, y + 16); 
            ctx.lineTo(x + 18, y + 24); 
            ctx.lineTo(x + 22, y + 20); 
            ctx.lineTo(x + 14, y + 12); 
            ctx.lineTo(x + 24, y + 12); 
            ctx.closePath();
            const grad = ctx.createLinearGradient(x, y, x+24, y+24);
            grad.addColorStop(0, isPinchingRef.current ? '#f43f5e' : '#e11d48'); // Rose
            grad.addColorStop(1, isPinchingRef.current ? '#be123c' : '#9f1239');
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.stroke();
            if (isPinchingRef.current) {
               ctx.beginPath();
               ctx.arc(x, y, 20, 0, 2 * Math.PI);
               ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
               ctx.lineWidth = 3;
               ctx.stroke();
            }
          }
        }
      }
      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };
    animationFrameRef.current = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages: string[] = [];
      let processedCount = 0;
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') newImages.push(reader.result);
          processedCount++;
          if (processedCount === files.length) {
            setState(prev => ({ 
              ...prev, 
              images: [...prev.images, ...newImages], 
              result: null, 
              groundingData: null, 
              error: null,
              focusedImageIndex: prev.images.length 
            }));
            setHighlightBox(null);
            boxRef.current = null;
            incrementXP(10 * files.length);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleLandmarks = useCallback((x: number, y: number, isPinching: boolean) => {
    const screenX = x * window.innerWidth;
    const screenY = y * window.innerHeight;
    cursorRef.current = { x: screenX, y: screenY };
    if (isPinching && !isPinchingRef.current) {
       const now = Date.now();
       if (now - clickDebounceRef.current > 500) { 
          clickDebounceRef.current = now;
          if (globalCursorCanvasRef.current) globalCursorCanvasRef.current.style.pointerEvents = 'none';
          const element = document.elementFromPoint(screenX, screenY);
          if (element instanceof HTMLElement) { element.click(); element.focus(); }
       }
       if (imgRef.current) {
         const rect = imgRef.current.getBoundingClientRect();
         if (screenX >= rect.left && screenX <= rect.right && screenY >= rect.top && screenY <= rect.bottom) {
             const localX = (screenX - rect.left) / rect.width;
             const localY = (screenY - rect.top) / rect.height;
             const size = 0.2; 
             const newBox = { x: localX - size/2, y: localY - size/2, w: size, h: size * (rect.width/rect.height) };
             setHighlightBox(newBox);
             boxRef.current = newBox;
         }
       }
    }
    isPinchingRef.current = isPinching;
  }, []);

  const handleEngagementUpdate = useCallback((engState: EngagementState, observation: string) => {
     setConcentrationLogs(prev => [...prev, { timestamp: new Date(), state: engState, observation }].slice(-20));
     if (state.role === UserRole.Student) {
       p2pService.sendMessage({
         type: 'ENGAGEMENT_UPDATE',
         payload: { state: engState }
       });
     }
  }, [state.role]);

  const incrementXP = (amount: number) => {
    setState(prev => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      return { ...prev, xp: newXP, levelNum: newLevel };
    });
  };

  const handleTTS = () => {
    if (!state.result) return;
    if (state.isTtsActive) {
      window.speechSynthesis.cancel();
      setState(prev => ({ ...prev, isTtsActive: false }));
    } else {
      const utterance = new SpeechSynthesisUtterance(state.result.replace(/<[^>]*>/g, ''));
      utterance.onend = () => setState(prev => ({ ...prev, isTtsActive: false }));
      window.speechSynthesis.speak(utterance);
      setState(prev => ({ ...prev, isTtsActive: true }));
    }
  };

  const handleGenerate = async (overrideAction?: ActionType) => {
    if (state.images.length === 0) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null, action: overrideAction || prev.action }));
    
    try {
      // Process Crop if exists
      let imagesToSend = state.images;
      
      // If a specific image is focused and we have a highlight box, crop it.
      if (boxRef.current && imgRef.current && state.images.length > 0) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = imgRef.current;
          
          if (ctx) {
             const box = boxRef.current;
             const sx = box.x * img.naturalWidth;
             const sy = box.y * img.naturalHeight;
             const sw = box.w * img.naturalWidth;
             const sh = box.h * img.naturalHeight;
             
             canvas.width = sw;
             canvas.height = sh;
             ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
             const croppedBase64 = canvas.toDataURL('image/jpeg');
             imagesToSend = [croppedBase64]; // Send ONLY the cropped focus area for better accuracy
          }
      }

      const response = await generateTeachingContent({
        images: imagesToSend,
        role: state.role,
        level: state.level,
        action: overrideAction || state.action,
        persona: state.persona,
        language: state.language,
        userPrompt: state.prompt,
        feedbackContext: state.feedbackHistory.join('\n')
      });

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        result: response.text, 
        groundingData: response.groundingMetadata 
      }));
      incrementXP(50);
    } catch (err) {
      setState(prev => ({ ...prev, isLoading: false, error: (err as Error).message }));
    }
  };

  return (
    <div className="min-h-screen text-slate-200 font-sans relative overflow-hidden">
      <canvas ref={globalCursorCanvasRef} className="fixed inset-0 pointer-events-none z-[9999]" />
      <ReadingRuler active={state.accessibility.readingRuler} />
      
      {/* --- HEADER --- */}
      <header className="fixed top-0 w-full z-40 bg-black/10 backdrop-blur-md border-b border-white/5 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 blur opacity-60 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative w-10 h-10 rounded-full bg-black flex items-center justify-center">
                <IconSparkles />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">Nebula AI</h1>
              <p className="text-[10px] text-rose-300 font-bold uppercase tracking-[0.2em] opacity-80">Teach with a Wave</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
             {/* XP Level Badge */}
             <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-[10px] uppercase font-bold text-slate-500">Level {state.levelNum}</span>
                <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-rose-500 to-purple-500" style={{ width: `${state.xp % 100}%` }}></div>
                </div>
             </div>

             <button 
                onClick={() => setShowInstructions(true)}
                className="p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/10"
                title="Help"
             >
               <IconHelp />
             </button>

             <button 
                onClick={() => setShowAccessibility(!showAccessibility)}
                className="p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/10"
             >
               <IconEye />
             </button>

             <button 
                onClick={() => {
                   if (state.role === UserRole.Teacher && !state.isClassroomMode) handleStartClass();
                   if (state.role === UserRole.Student && !state.isClassroomMode) setShowJoinModal(true);
                   if (state.isClassroomMode && state.role === UserRole.Teacher) {
                      // Maybe show dashboard toggle?
                   }
                }}
                className={`p-2.5 rounded-xl transition-all border border-transparent flex items-center gap-2 ${state.isClassroomMode ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30' : 'hover:bg-white/10 text-slate-400 hover:text-white hover:border-white/10'}`}
             >
               <IconClassroom />
               {state.isClassroomMode && <span className="text-xs font-bold">{state.connectedPeers}</span>}
             </button>
          </div>
        </div>
      </header>

      {/* --- MAIN LAYOUT --- */}
      <main className="pt-28 pb-12 px-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Input & Preview */}
        <div className="lg:col-span-5 space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
           <div className="glass rounded-3xl p-6 relative overflow-hidden group min-h-[400px] flex flex-col">
              {state.images.length > 0 ? (
                 <div className="relative flex-1 rounded-2xl overflow-hidden border border-white/10 bg-black/50">
                    <img 
                      ref={imgRef}
                      src={state.images[state.images.length - 1]} 
                      alt="Input" 
                      className="w-full h-full object-contain"
                    />
                    
                    {/* Highlight Box Overlay */}
                    {highlightBox && (
                       <div 
                         className="absolute border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)] bg-rose-500/10 transition-all duration-200"
                         style={{
                           left: `${highlightBox.x * 100}%`,
                           top: `${highlightBox.y * 100}%`,
                           width: `${highlightBox.w * 100}%`,
                           height: `${highlightBox.h * 100}%`
                         }}
                       >
                         <div className="absolute -top-6 left-0 bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">Focus Area</div>
                       </div>
                    )}

                    <button 
                      onClick={() => setState(prev => ({ ...prev, images: [], result: null }))}
                      className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-red-900/80 text-white rounded-lg backdrop-blur-md transition-colors"
                    >
                      <IconTrash />
                    </button>
                 </div>
              ) : (
                 <div className="flex-1 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center space-y-4 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all group-hover:scale-[1.01] duration-300">
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover:text-rose-400 transition-colors">
                       <IconUpload />
                    </div>
                    <div className="text-center">
                       <p className="text-slate-300 font-medium">Drop an image here</p>
                       <p className="text-slate-500 text-sm">or click to upload</p>
                    </div>
                    <input 
                       type="file" 
                       ref={fileInputRef}
                       className="absolute inset-0 opacity-0 cursor-pointer"
                       onChange={handleImageUpload}
                       accept="image/*"
                    />
                 </div>
              )}

              {/* Action Bar */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all"
                 >
                    <IconUpload /> <span className="text-sm font-bold">Upload</span>
                 </button>
                 <button 
                   onClick={() => setShowCamera(true)}
                   className="flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all"
                 >
                    <IconCamera /> <span className="text-sm font-bold">Camera</span>
                 </button>
              </div>
           </div>

           {/* Controls Card */}
           <div className="glass rounded-3xl p-6 space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">My Role</label>
                <div className="flex bg-slate-900/50 rounded-xl p-1 border border-white/5">
                  {[UserRole.Teacher, UserRole.Student].map(r => (
                    <button
                      key={r}
                      onClick={() => setState(prev => ({...prev, role: r}))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${state.role === r ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Action</label>
                   <select 
                      value={state.action}
                      onChange={(e) => setState(prev => ({...prev, action: e.target.value as ActionType}))}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-rose-500 outline-none appearance-none"
                   >
                     {Object.values(ActionType).map(a => (
                       <option key={a} value={a}>{a.replace('_', ' ').toUpperCase()}</option>
                     ))}
                   </select>
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Persona</label>
                   <select 
                      value={state.persona}
                      onChange={(e) => setState(prev => ({...prev, persona: e.target.value as Persona}))}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-rose-500 outline-none appearance-none"
                   >
                     {Object.values(Persona).map(p => (
                       <option key={p} value={p}>{p.toUpperCase()}</option>
                     ))}
                   </select>
                </div>
              </div>

              <button 
                onClick={() => handleGenerate()}
                disabled={state.isLoading || state.images.length === 0}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 text-white font-bold text-lg shadow-xl shadow-rose-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                {state.isLoading ? (
                   <>
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     <span>Thinking...</span>
                   </>
                ) : (
                   <>
                     <IconSparkles />
                     <span>Generate Content</span>
                   </>
                )}
              </button>
           </div>
        </div>

        {/* RIGHT COLUMN: Results */}
        <div className="lg:col-span-7 space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
           {state.result ? (
             <div ref={resultRef} className="relative group">
                {/* Result Toolbar */}
                <div className="absolute top-6 right-6 z-10 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={handleTTS} className={`p-2 rounded-full backdrop-blur-md transition-colors ${state.isTtsActive ? 'bg-rose-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                      <IconSpeaker />
                   </button>
                </div>

                {state.action === ActionType.Flashcards ? (
                   <FlashcardDeck content={state.result} />
                ) : (
                   <ResultDisplay content={state.result} groundingData={state.groundingData} />
                )}
             </div>
           ) : (
             <div className="h-full min-h-[400px] glass rounded-3xl flex flex-col items-center justify-center text-center p-12 border border-white/5 border-dashed">
                {state.isLoading ? (
                   <LoadingSpinner />
                ) : (
                   <div className="space-y-4 opacity-50 max-w-sm">
                      <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto flex items-center justify-center text-4xl">👋</div>
                      <h3 className="text-2xl font-bold text-white">Welcome to Nebula AI</h3>
                      <p className="text-slate-400">Upload a textbook page or diagram, then wave "Open Palm" ✋ to explain it.</p>
                   </div>
                )}
             </div>
           )}
        </div>
      </main>

      {/* --- OVERLAYS & MODALS --- */}
      
      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 left-8 flex flex-col space-y-4 z-40">
         <button 
           onClick={() => setShowGestureController(!showGestureController)}
           className={`p-4 rounded-full shadow-2xl transition-all ${showGestureController ? 'bg-rose-500 text-white rotate-0' : 'bg-slate-800 text-slate-400 hover:text-white -rotate-12 hover:rotate-0'}`}
         >
           <IconHand />
         </button>
         <button 
           onClick={() => setShowVoiceControl(!showVoiceControl)}
           className={`p-4 rounded-full shadow-2xl transition-all ${showVoiceControl ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
         >
           <IconMic />
         </button>
      </div>

      {showCamera && (
        <LiveCamera 
          onCapture={(img) => {
            setState(prev => ({ ...prev, images: [...prev.images, img], focusedImageIndex: prev.images.length }));
            setShowCamera(false);
          }} 
          onClose={() => setShowCamera(false)} 
        />
      )}

      {showGestureController && (
        <GestureController 
          onTrigger={(action) => handleGenerate(action)}
          onLandmarks={handleLandmarks}
          onEngagementUpdate={handleEngagementUpdate}
          onClose={() => setShowGestureController(false)}
        />
      )}

      {showVoiceControl && (
        <VoiceController 
           onCommand={(action) => handleGenerate(action)}
           onScroll={(dir) => window.scrollBy({ top: dir === 'down' ? 400 : -400, behavior: 'smooth' })}
           onStop={() => { window.speechSynthesis.cancel(); setState(prev => ({...prev, isTtsActive: false})); }}
           onRead={handleTTS}
           onAccessibilityToggle={(feat) => {
              if (feat === 'dyslexia') setState(prev => ({...prev, accessibility: {...prev.accessibility, dyslexiaFont: !prev.accessibility.dyslexiaFont}}));
              if (feat === 'contrast') setState(prev => ({...prev, accessibility: {...prev.accessibility, highContrast: !prev.accessibility.highContrast}}));
              if (feat === 'ruler') setState(prev => ({...prev, accessibility: {...prev.accessibility, readingRuler: !prev.accessibility.readingRuler}}));
           }}
        />
      )}

      {showAccessibility && (
         <AccessibilityControls 
            settings={state.accessibility} 
            onUpdate={(s) => setState(prev => ({...prev, accessibility: s}))}
            onClose={() => setShowAccessibility(false)}
         />
      )}

      {state.isClassroomMode && state.role === UserRole.Teacher && (
         <ClassroomDashboard 
            stats={classroomStats} 
            accessCode={state.peerId || '...'} 
            onClose={() => setState(prev => ({...prev, isClassroomMode: false, peerId: null}))} 
         />
      )}
      
      <ConcentrationSidebar 
         logs={concentrationLogs} 
         isVisible={state.isClassroomMode || showGestureController} 
      />

      {showJoinModal && (
        <StudentJoinModal 
           isLoading={state.isLoading}
           onJoin={handleJoinClass}
           onCancel={() => setShowJoinModal(false)}
        />
      )}

      {showInstructions && (
        <InstructionsModal onClose={() => setShowInstructions(false)} />
      )}

      {state.error && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-900/90 text-red-200 px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3 animate-fade-in border border-red-500/30">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
           {state.error}
           <button onClick={() => setState(prev => ({...prev, error: null}))} className="ml-2 hover:text-white">✕</button>
        </div>
      )}
    </div>
  );
};

export default App;