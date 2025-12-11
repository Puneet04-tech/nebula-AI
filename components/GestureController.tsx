
import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, GestureRecognizer, FaceLandmarker } from '@mediapipe/tasks-vision';
import { ActionType, EngagementState } from '../types';

interface GestureControllerProps {
  onTrigger: (action: ActionType) => void;
  onLandmarks: (x: number, y: number, isPinching: boolean) => void;
  onClose: () => void;
  onEngagementUpdate: (state: EngagementState, observation: string) => void;
}

export const GestureController: React.FC<GestureControllerProps> = ({ onTrigger, onLandmarks, onClose, onEngagementUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<string>("Initializing AI...");
  const [detectedGesture, setDetectedGesture] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  const requestRef = useRef<number>(0);
  const recognizerRef = useRef<GestureRecognizer | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  
  const lastGestureRef = useRef<string | null>(null);
  const holdStartTimeRef = useRef<number>(0);
  const triggeredRef = useRef<boolean>(false);
  const lastTimestampRef = useRef<number>(0);
  const analysisIntervalRef = useRef<number | null>(null);
  const cursorRef = useRef({ x: 0.5, y: 0.5 });
  const lastScrollYRef = useRef<number | null>(null);
  
  // Engagement State Tracking
  const lastEngagementStateRef = useRef<EngagementState>(EngagementState.Neutral);
  const lastEngagementTimeRef = useRef<number>(0);
  
  const HOLD_DURATION = 1000; 
  const ANALYSIS_INTERVAL = 2000; // Check engagement every 2 seconds locally

  useEffect(() => {
    let isMounted = true;
    let recognizerInstance: GestureRecognizer | null = null;
    let faceInstance: FaceLandmarker | null = null;

    const loadModels = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        
        if (!isMounted) return;

        // Load Gesture Model (Hands)
        recognizerInstance = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "CPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });

        // Load Face Model (Engagement)
        faceInstance = await FaceLandmarker.createFromOptions(vision, {
           baseOptions: {
             modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
             delegate: "GPU"
           },
           outputFaceBlendshapes: true,
           outputFacialTransformationMatrixes: true,
           runningMode: "VIDEO",
           numFaces: 1
        });
        
        if (isMounted) {
          recognizerRef.current = recognizerInstance;
          faceLandmarkerRef.current = faceInstance;
          setStatus("Ready");
        }
      } catch (error) {
        console.error("Error loading models:", error);
        if (isMounted) setStatus("Error");
      }
    };

    loadModels();

    return () => { 
      isMounted = false; 
      if (recognizerInstance) recognizerInstance.close();
      if (faceInstance) faceInstance.close();
    };
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      if (!videoRef.current) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Local Engagement Loop
        analysisIntervalRef.current = window.setInterval(() => {
           // Engagement is handled in the animation frame loop now for better sync
        }, ANALYSIS_INTERVAL);

      } catch (err) {
        setStatus("No Camera");
      }
    };

    if (status === "Ready") startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
      }
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
    };
  }, [status]);

  useEffect(() => {
    if (!recognizerRef.current || !faceLandmarkerRef.current || !videoRef.current) return;

    const detect = () => {
      if (!videoRef.current || !recognizerRef.current || !faceLandmarkerRef.current) return;

      if (videoRef.current.paused || videoRef.current.ended || videoRef.current.readyState < 2) {
        requestRef.current = requestAnimationFrame(detect);
        return;
      }

      try {
        const now = Date.now();
        const timestamp = now > lastTimestampRef.current ? now : lastTimestampRef.current + 1;
        lastTimestampRef.current = timestamp;

        // 1. Gesture Recognition
        const gestureResults = recognizerRef.current.recognizeForVideo(videoRef.current, timestamp);
        
        if (gestureResults.landmarks && gestureResults.landmarks.length > 0) {
          const landmarks = gestureResults.landmarks[0];
          const indexTip = landmarks[8];
          const thumbTip = landmarks[4];
          const wrist = landmarks[0];
          
          if (indexTip && thumbTip) {
            const targetX = 1 - indexTip.x;
            const targetY = indexTip.y;
            const lerpFactor = 0.2;
            cursorRef.current.x += (targetX - cursorRef.current.x) * lerpFactor;
            cursorRef.current.y += (targetY - cursorRef.current.y) * lerpFactor;
            const distance = Math.sqrt(Math.pow(indexTip.x - thumbTip.x, 2) + Math.pow(indexTip.y - thumbTip.y, 2));
            onLandmarks(cursorRef.current.x, cursorRef.current.y, distance < 0.05);
          }

          // Scrolling (Closed Fist)
          if (gestureResults.gestures.length > 0 && gestureResults.gestures[0].length > 0) {
             const gestureName = gestureResults.gestures[0][0].categoryName;
             if (gestureName === 'Closed_Fist') {
                if (lastScrollYRef.current !== null) {
                   const deltaY = (wrist.y - lastScrollYRef.current) * 1000;
                   window.scrollBy({ top: deltaY, behavior: 'auto' });
                }
                lastScrollYRef.current = wrist.y;
             } else {
                lastScrollYRef.current = null;
             }
          }
        }

        let currentGesture = "None";
        if (gestureResults.gestures.length > 0 && gestureResults.gestures[0].length > 0) {
          const topGesture = gestureResults.gestures[0][0];
          if (topGesture.score > 0.5) currentGesture = topGesture.categoryName;
        }

        setDetectedGesture(currentGesture !== "None" ? currentGesture : null);

        // Gesture Trigger Logic
        let targetAction: ActionType | null = null;
        if (currentGesture === "Open_Palm") targetAction = ActionType.Explain;
        else if (currentGesture === "Victory") targetAction = ActionType.Quiz;
        else if (currentGesture === "Thumb_Up") targetAction = ActionType.Summary;
        else if (currentGesture === "ILoveYou") targetAction = ActionType.Examples; 

        if (targetAction) {
          if (lastGestureRef.current === currentGesture) {
            if (!triggeredRef.current) {
              const elapsed = now - holdStartTimeRef.current;
              const prog = Math.min((elapsed / HOLD_DURATION) * 100, 100);
              setProgress(prog);

              if (elapsed >= HOLD_DURATION) {
                triggeredRef.current = true;
                onTrigger(targetAction);
                setDetectedGesture(`Sent!`);
                setTimeout(() => {
                  triggeredRef.current = false;
                  holdStartTimeRef.current = Date.now(); 
                  setProgress(0);
                }, 1500);
              }
            }
          } else {
            lastGestureRef.current = currentGesture;
            holdStartTimeRef.current = now;
            triggeredRef.current = false;
            setProgress(0);
          }
        } else {
          lastGestureRef.current = null;
          setProgress(0);
        }

        // 2. Engagement Analysis (Every 2 seconds)
        if (now - lastEngagementTimeRef.current > ANALYSIS_INTERVAL) {
           lastEngagementTimeRef.current = now;
           const faceResult = faceLandmarkerRef.current.detectForVideo(videoRef.current, timestamp);
           
           if (faceResult.faceBlendshapes.length > 0 && faceResult.facialTransformationMatrixes.length > 0) {
              const shapes = faceResult.faceBlendshapes[0].categories;
              // const matrix = faceResult.facialTransformationMatrixes[0].data;

              // Helper to find score
              const getScore = (name: string) => shapes.find(s => s.categoryName === name)?.score || 0;

              const browDown = (getScore('browDownLeft') + getScore('browDownRight')) / 2;
              const eyeBlink = (getScore('eyeBlinkLeft') + getScore('eyeBlinkRight')) / 2;
              // Simple yaw estimation (looking away) could be done with matrix, but let's use eye look for simplicity
              const eyeLookOut = (getScore('eyeLookOutLeft') + getScore('eyeLookOutRight')) / 2;

              let newState = EngagementState.Focused;
              let obs = "Focused on content";

              if (eyeLookOut > 0.6) {
                 newState = EngagementState.Distracted;
                 obs = "Looking away from screen";
              } else if (browDown > 0.6) {
                 newState = EngagementState.Confused;
                 obs = "Facial expression indicates confusion";
              } else if (eyeBlink > 0.6) { // Simplified check for eyes closed
                 newState = EngagementState.Bored;
                 obs = "Eyes closed / Drowsy";
              }

              if (newState !== lastEngagementStateRef.current) {
                 lastEngagementStateRef.current = newState;
                 onEngagementUpdate(newState, obs);
              }
           } else {
              // No face detected
              if (lastEngagementStateRef.current !== EngagementState.Distracted) {
                  lastEngagementStateRef.current = EngagementState.Distracted;
                  onEngagementUpdate(EngagementState.Distracted, "No face detected");
              }
           }
        }

      } catch (e) {
        console.error("Detection error", e);
      }

      requestRef.current = requestAnimationFrame(detect);
    };

    requestRef.current = requestAnimationFrame(detect);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [onTrigger, onLandmarks, status, onEngagementUpdate]); 

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end space-y-4 font-sans">
      <div className="relative group">
        <div className={`absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-75 blur transition duration-500 ${progress > 0 ? 'opacity-100' : 'opacity-0'}`}></div>
        
        <div className="relative bg-slate-900 rounded-[1.8rem] shadow-2xl p-1.5 ring-1 ring-white/10 overflow-hidden w-64 transition-all hover:scale-[1.02]">
          
          <div className="flex justify-between items-center px-4 py-3 border-b border-white/5 bg-white/5 mb-1">
             <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${status === 'Ready' ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-yellow-400 animate-pulse'}`}></div>
                <span className="text-white text-xs font-bold tracking-wider uppercase">Gesture & Face AI</span>
             </div>
             <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
             </button>
          </div>

          <div className="flex">
            <div className="w-24 h-16 rounded-xl overflow-hidden bg-black relative ml-2 mb-2 shadow-inner border border-white/10 shrink-0">
               <video ref={videoRef} className="w-full h-full object-cover transform scale-x-[-1] opacity-80" playsInline muted />
               {detectedGesture && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                   <span className="text-xl">{
                     detectedGesture === "Open_Palm" ? "✋" : 
                     detectedGesture === "Victory" ? "✌️" :
                     detectedGesture === "Thumb_Up" ? "👍" :
                     detectedGesture === "ILoveYou" ? "🤟" : 
                     detectedGesture === "Closed_Fist" ? "✊" : "👆"
                   }</span>
                 </div>
               )}
            </div>

            <div className="flex-1 px-3 py-1 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-300">
               <div className="flex items-center space-x-1"><span className="text-white">✋</span><span>Explain</span></div>
               <div className="flex items-center space-x-1"><span className="text-white">✌️</span><span>Quiz</span></div>
               <div className="flex items-center space-x-1"><span className="text-white">👍</span><span>Summary</span></div>
               <div className="flex items-center space-x-1"><span className="text-white">🤟</span><span>Examples</span></div>
               <div className="flex items-center space-x-1"><span className="text-white">✊</span><span>Scroll</span></div>
            </div>
          </div>
          
          <div className="h-1 bg-slate-800 w-full mt-1">
             <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
