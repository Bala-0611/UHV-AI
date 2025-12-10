import React, { useRef, useState, useEffect, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  const startCamera = useCallback(async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setError(null);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: any) {
      console.error("Camera Error:", err);
      setError("Unable to access camera. Please ensure permissions are granted.");
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  useEffect(() => {
     return () => {
       // cleanup managed in dependency effect
     }
  }, []);

  const handleCapture = () => {
    // Trigger visual flash
    setFlash(true);

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Slight delay to allow flash animation to be seen
        setTimeout(() => {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            const base64 = dataUrl.split(',')[1];
            onCapture(base64);
        }, 150);
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center shadow-2xl ring-1 ring-slate-900/5">
      {flash && <div className="absolute inset-0 bg-white z-50 flash-overlay pointer-events-none" />}
      
      {error ? (
        <div className="text-white p-6 text-center max-w-sm">
          <div className="mb-4 bg-red-500/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-red-200">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </div>
          <p className="mb-6 text-sm opacity-90">{error}</p>
          <button onClick={onClose} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors">Close Camera</button>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanner Overlay UI */}
          <div className="absolute inset-0 pointer-events-none z-10">
             {/* Corner brackets */}
             <div className="absolute top-8 left-8 w-12 h-12 border-l-4 border-t-4 border-white/70 rounded-tl-lg"></div>
             <div className="absolute top-8 right-8 w-12 h-12 border-r-4 border-t-4 border-white/70 rounded-tr-lg"></div>
             <div className="absolute bottom-8 left-8 w-12 h-12 border-l-4 border-b-4 border-white/70 rounded-bl-lg"></div>
             <div className="absolute bottom-8 right-8 w-12 h-12 border-r-4 border-b-4 border-white/70 rounded-br-lg"></div>
             
             {/* Scanning Line */}
             <div className="absolute left-0 w-full h-1 bg-indigo-500 scan-line z-10"></div>
             
             {/* Grid pattern overlay */}
             <div className="absolute inset-0 opacity-10" 
                  style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
             </div>
             
             {/* Text Hint */}
             <div className="absolute bottom-24 w-full text-center">
                 <span className="bg-black/40 backdrop-blur-md text-white/90 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide">
                    Position assignment within frame
                 </span>
             </div>
          </div>
          
          {/* Controls */}
          <div className="absolute bottom-0 w-full flex items-center justify-around px-8 pb-8 pt-12 bg-gradient-to-t from-black/80 to-transparent z-20">
            <button 
              onClick={onClose}
              className="p-3.5 rounded-full bg-slate-800/40 text-white hover:bg-slate-800/80 backdrop-blur-md transition-all border border-white/10"
              title="Close Camera"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            <button 
              onClick={handleCapture}
              className="w-18 h-18 rounded-full p-1 border-4 border-white/30 hover:border-white/60 transition-all active:scale-95 group"
              title="Capture Image"
            >
              <div className="w-16 h-16 bg-white rounded-full group-hover:scale-90 transition-transform duration-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
            </button>
            
            <button 
              onClick={toggleCamera}
              className="p-3.5 rounded-full bg-slate-800/40 text-white hover:bg-slate-800/80 backdrop-blur-md transition-all border border-white/10"
              title="Switch Camera"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0-4.418-3.582-8-8-8s-8 3.582-8 8c0 2.025.753 3.825 1.983 5.215"/><path d="M20 10v4h-4"/><path d="M4 10v4h4"/><path d="M12 21c4.418 0 8-3.582 8-8"/></svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
};