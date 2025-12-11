import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';

interface LiveCameraProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

export const LiveCamera: React.FC<LiveCameraProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [gestureStatus, setGestureStatus] = useState<string>("Initializing...");
  const [countdown, setCountdown] = useState<number | null>(null);
  const recognizerRef = useRef<GestureRecognizer | null>(null);
  const requestRef = useRef<number>(0);
  const countdownRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(0);

  // Model & Camera Logic (Identical to previous, just re-styling render)
  useEffect(() => {
    let isMounted = true;
    let recognizerInstance: GestureRecognizer | null = null;
    
    const loadModel = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");
        if (!isMounted) return;
        recognizerInstance = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task", delegate: "CPU" },
          runningMode: "VIDEO", numHands: 1
        });
        if (isMounted) {
          recognizerRef.current = recognizerInstance;
          setIsModelLoading(false);
          setGestureStatus("Show 👍 Thumb Up to capture");
        }
      } catch (error) {
        if (isMounted) { setGestureStatus("Error loading AI."); setIsModelLoading(false); }
      }
    };
    loadModel();
    return () => { isMounted = false; if (recognizerInstance) recognizerInstance.close(); };
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      if (!videoRef.current) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } });
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      } catch (err) { setGestureStatus("Camera permission denied."); }
    };
    if (!isModelLoading) startCamera();
    return () => { if (videoRef.current && videoRef.current.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop()); if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isModelLoading]);

  const captureImage = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      onCapture(canvas.toDataURL('image/jpeg', 0.85));
    }
  };

  useEffect(() => {
    if (!recognizerRef.current || !videoRef.current) return;
    let thumbUpFrames = 0;
    const REQUIRED_FRAMES = 10; 

    const detect = () => {
      if (!videoRef.current || !recognizerRef.current) return;
      if (videoRef.current.paused || videoRef.current.ended || videoRef.current.readyState < 2) {
        requestRef.current = requestAnimationFrame(detect);
        return;
      }
      try {
        const now = Date.now();
        const timestamp = now > lastTimestampRef.current ? now : lastTimestampRef.current + 1;
        lastTimestampRef.current = timestamp;
        const results = recognizerRef.current.recognizeForVideo(videoRef.current, timestamp);
        let detectedThumbUp = false;
        if (results.gestures.length > 0) {
          const gesture = results.gestures[0][0];
          if (gesture.categoryName === "Thumb_Up" && gesture.score > 0.6) detectedThumbUp = true;
        }
        detectedThumbUp ? thumbUpFrames++ : thumbUpFrames = 0;
        if (thumbUpFrames > REQUIRED_FRAMES && countdownRef.current === null) startCountdown();
      } catch (e) {}
      requestRef.current = requestAnimationFrame(detect);
    };

    const startCountdown = () => {
      if (countdownRef.current !== null) return;
      let count = 3;
      setCountdown(count);
      countdownRef.current = count; 
      const interval = setInterval(() => {
        count--; setCountdown(count);
        if (count <= 0) { clearInterval(interval); captureImage(); }
      }, 1000);
    };
    requestRef.current = requestAnimationFrame(detect);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); }
  }, [isModelLoading]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
      <div className="relative w-full h-full max-w-5xl flex flex-col p-4 md:p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center space-x-3">
             <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
             <h2 className="text-white text-2xl font-bold tracking-tight">Live Capture</h2>
           </div>
           <button onClick={onClose} className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:rotate-90">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>

        {/* Viewfinder */}
        <div className="flex-1 relative rounded-3xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/10 group">
          {isModelLoading && (
             <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-20">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-indigo-200 font-medium">Initializing AI Vision...</span>
                </div>
             </div>
          )}
          
          <video ref={videoRef} playsInline muted onLoadedMetadata={(e) => e.currentTarget.play()} className="w-full h-full object-cover transform scale-x-[-1]" />
          
          {/* Overlay Grid */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100px_100px]"></div>

          {/* Status Pill */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
             <div className="glass-dark px-8 py-4 rounded-full flex items-center space-x-4 shadow-xl">
               {countdown !== null ? (
                 <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse">{countdown}</span>
               ) : (
                 <>
                    <span className="text-2xl">{!isModelLoading && gestureStatus.includes("Thumb Up") ? "👍" : "📷"}</span>
                    <span className="text-white font-medium text-lg">{gestureStatus}</span>
                 </>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};