import React, { useEffect, useRef, useState } from 'react';
import { Scene } from './components/Scene';
import { initializeHandLandmarker, detectGesture } from './services/gestureService';
import { GestureType } from './types';
import { Hand, Camera, AlertCircle, Info } from 'lucide-react';

const App: React.FC = () => {
  const [gesture, setGesture] = useState<GestureType>(GestureType.NONE);
  const [loading, setLoading] = useState(true);
  const [cameraError, setCameraError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const requestRef = useRef<number>(0);
  const lastGestureRef = useRef<GestureType>(GestureType.NONE);

  // Initialize Gesture Recognition
  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 320, 
            height: 240,
            facingMode: 'user' 
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', async () => {
            await initializeHandLandmarker();
            setLoading(false);
            predictWebcam();
          });
        }
      } catch (err) {
        console.error("Camera access denied or failed:", err);
        setCameraError(true);
        setLoading(false);
      }
    };

    setupCamera();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const predictWebcam = () => {
    if (videoRef.current && videoRef.current.readyState >= 2) {
      const detected = detectGesture(videoRef.current);
      
      // Only update state if gesture changes to avoid re-renders
      // If detected is NONE, we generally want to keep the last state OR reset
      // For this app, let's allow it to go to NONE (which Scene interprets as Tree)
      // to make it responsive.
      if (detected !== lastGestureRef.current) {
        lastGestureRef.current = detected;
        setGesture(detected);
      }
    }
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  // Manual Fallback Controls
  const toggleGesture = (type: GestureType) => {
    const newGesture = gesture === type ? GestureType.NONE : type;
    lastGestureRef.current = newGesture;
    setGesture(newGesture);
  };

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Scene gesture={gesture} />
      </div>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 pointer-events-none flex justify-center items-start">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">
              可乐的圣诞树🎄
          </h1>
          {/*<p className="text-yellow-100/70 text-sm mt-1">Interactive Particle Tree</p>*/}
        </div>
      </div>

      {/* Webcam Feed (Small Picture-in-Picture) */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end gap-2">
         {/* Webcam Element */}
         <div className={`relative w-48 h-36 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl transition-all duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover transform -scale-x-100" 
            />
            {/* Detection Indicator */}
            <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 backdrop-blur text-xs font-mono flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${gesture === GestureType.NONE ? 'bg-gray-500' : 'bg-green-500 animate-pulse'}`} />
              {gesture === GestureType.NONE ? "Scanning..." : gesture}
            </div>
         </div>

         {/* Instructions / Status */}
         <div className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-xl max-w-xs text-sm">
            {loading ? (
              <div className="flex items-center gap-2 text-yellow-300">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span>
                Initializing AI Model...
              </div>
            ) : cameraError ? (
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertCircle size={16} />
                <span>Camera access needed for gestures.</span>
              </div>
            ) : (
              <div className="space-y-2">
                 <div className="flex items-center gap-2 text-white/90">
                    <Hand size={16} className="text-yellow-400" />
                    <span><strong>Fist / None:</strong> Build Tree</span>
                 </div>
                 <div className="flex items-center gap-2 text-white/90">
                    <Hand size={16} className="text-red-400" />
                    <span><strong>Open Palm:</strong> Explode</span>
                 </div>
                 <div className="flex items-center gap-2 text-white/50 text-xs mt-2 border-t border-white/10 pt-2">
                    <Info size={12} />
                    <span>Bring hand closer if not detected.</span>
                 </div>
              </div>
            )}

            {/* Manual Controls Backup */}
            <div className="mt-4 grid grid-cols-2 gap-2 pointer-events-auto">
                <button 
                  onClick={() => toggleGesture(GestureType.FIST)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${gesture === GestureType.FIST || gesture === GestureType.NONE ? 'bg-yellow-500 text-black' : 'bg-white/10 hover:bg-white/20'}`}
                >
                  Force Tree
                </button>
                <button 
                  onClick={() => toggleGesture(GestureType.PALM)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${gesture === GestureType.PALM ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20'}`}
                >
                  Force Explode
                </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default App;