import React, { useState } from 'react';
import { analyzeAssignment } from './services/geminiService';
import { UHVAnalysisResult } from './types';
import { ResultSection } from './components/ResultSection';
import { CameraCapture } from './components/CameraCapture';

// Icons
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
);
const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
);
const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
);
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);
const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
);

// Hardcoded API Key as requested for client-side usage
const API_KEY = AIzaSyDCeYJGz_A8D_x_fC5K0NtA0gSHk8HkiuE";

const DEMO_TEXT = `Student Name: Bala Anandan
Roll Number: 23SU2360029

1. Role in Self:
I need to understand my own thoughts and desires clearly. Self-exploration is important to know what I truly want. I must maintain a balance between my physical needs and my mental well-being. Continuous learning helps me improve my understanding.

2. Role in Family:
My family is my support system. I should respect my elders and love my younger siblings. Trust and affection are the foundational values in my family relationships. I need to contribute to the household chores and ensure everyone is happy.

3. Role in Society:
We are all connected. I should not harm others and should help those in need. Following traffic rules and being a responsible citizen is important. I want to contribute to the education of underprivileged children in my locality.

4. Role in Environment:
Nature provides us with everything. We must not pollute the air and water. Planting trees is a duty. We should reduce plastic usage to save the earth for future generations.`;

const App: React.FC = () => {
  const [ocrText, setOcrText] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [result, setResult] = useState<UHVAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!ocrText.trim() && !capturedImage) {
      setError("Please provide input (Text or Image) to analyze.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeAssignment({
        text: !capturedImage ? ocrText : undefined,
        imageBase64: capturedImage || undefined
      }, API_KEY);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while processing.");
    } finally {
      setLoading(false);
    }
  };

  const loadDemo = () => {
    setCapturedImage(null);
    setOcrText(DEMO_TEXT);
    setError(null);
    setResult(null);
  };

  const resetAll = () => {
    setCapturedImage(null);
    setOcrText('');
    setResult(null);
    setError(null);
  };

  const handleCapture = (base64: string) => {
    setCapturedImage(base64);
    setIsCameraOpen(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Glassmorphic Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200">
              <BrainIcon />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                UHV Processor
              </h1>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">Universal Human Values Analyzer</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
             <button
                onClick={resetAll}
                className="flex text-xs font-semibold text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors items-center gap-1.5 whitespace-nowrap"
             >
                <RefreshIcon /> Reset
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: INPUT */}
          <div className="space-y-6">
            <div className="bg-white p-1 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="bg-slate-50/50 p-6 rounded-[20px]">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-2">
                     <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">1</span>
                     <h2 className="text-lg font-bold text-slate-800">Assignment Input</h2>
                  </div>
                  <button 
                    onClick={loadDemo}
                    className="text-xs font-semibold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 px-3 py-1.5 rounded-full transition-all duration-200 border border-indigo-100"
                  >
                    Auto-fill Demo
                  </button>
                </div>

                {/* Input Container */}
                <div className="w-full h-[450px] relative bg-white border-2 border-slate-200 border-dashed rounded-2xl overflow-hidden group hover:border-indigo-300 transition-colors">
                  {isCameraOpen ? (
                    <CameraCapture onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />
                  ) : capturedImage ? (
                    <div className="w-full h-full flex flex-col items-center justify-center relative bg-slate-900 animate-fade-in">
                      <img 
                        src={`data:image/jpeg;base64,${capturedImage}`} 
                        alt="Captured Assignment" 
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-4 right-4 z-10">
                         <button 
                          onClick={() => setCapturedImage(null)}
                          className="bg-black/50 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-sm transition-all shadow-lg"
                          title="Remove image"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                      <div className="absolute bottom-6 left-0 w-full flex justify-center pointer-events-none">
                          <span className="bg-indigo-600/90 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                            Image Ready
                          </span>
                      </div>
                    </div>
                  ) : (
                    <textarea
                      value={ocrText}
                      onChange={(e) => setOcrText(e.target.value)}
                      placeholder="Paste text here OR use the Camera button below to scan..."
                      className="w-full h-full p-6 bg-transparent focus:ring-0 outline-none resize-none font-mono text-sm text-slate-700 leading-relaxed placeholder:text-slate-400"
                    />
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-5 flex flex-col gap-3">
                   {!isCameraOpen && (
                      <button
                          onClick={() => setIsCameraOpen(true)}
                          className="w-full py-3 px-4 bg-white border border-slate-200 hover:border-indigo-500 text-slate-700 hover:text-indigo-600 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 group"
                      >
                          <div className="p-1 bg-slate-100 rounded-md group-hover:bg-indigo-100 transition-colors">
                            <CameraIcon />
                          </div>
                          Scan Paper with Camera
                      </button>
                   )}

                  <button
                    onClick={handleProcess}
                    disabled={loading || (isCameraOpen) || (!ocrText.trim() && !capturedImage)}
                    className={`w-full py-3.5 px-4 rounded-xl text-white font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]
                      ${loading || (isCameraOpen) || (!ocrText.trim() && !capturedImage)
                        ? 'bg-slate-300 shadow-none cursor-not-allowed text-slate-500' 
                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:to-indigo-600 hover:shadow-xl'}`}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                          <span>Analyze Assignment</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                      </>
                    )}
                  </button>
                  
                  {error && (
                    <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-start gap-3 animate-fade-in">
                      <div className="mt-0.5 min-w-[16px]"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: RESULTS */}
          <div className="space-y-6">
             <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">2</span>
                    <h2 className="text-lg font-bold text-slate-800">Values Extraction</h2>
                </div>
                {result && (
                     <button 
                        onClick={() => {
                            const jsonString = JSON.stringify(result, null, 2);
                            const blob = new Blob([jsonString], { type: "application/json" });
                            const href = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = href;
                            link.download = `uhv_${result.rollNo}.json`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-indigo-100 flex items-center gap-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Export JSON
                    </button>
                )}
            </div>
            
            {/* Empty State */}
            {!result && !loading && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 p-8 text-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <BrainIcon />
                </div>
                <p className="text-slate-600 font-semibold">Ready to Process</p>
                <p className="text-sm mt-1 max-w-xs">Upload an image or paste text to see the AI analysis here.</p>
              </div>
            )}

            {/* Loading Skeletons */}
            {loading && !result && (
              <div className="space-y-4">
                <div className="h-28 bg-slate-100 rounded-2xl animate-pulse"></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-48 bg-slate-100 rounded-2xl animate-pulse"></div>
                    <div className="h-48 bg-slate-100 rounded-2xl animate-pulse"></div>
                    <div className="h-48 bg-slate-100 rounded-2xl animate-pulse"></div>
                    <div className="h-48 bg-slate-100 rounded-2xl animate-pulse"></div>
                </div>
              </div>
            )}

            {/* Result Content */}
            {result && (
              <div className="space-y-6">
                {/* Student Info Header */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg shadow-indigo-200 text-white flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 animate-slide-up">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold opacity-80 mb-1">Student Name</p>
                    <p className="text-2xl font-bold tracking-tight">{result.name}</p>
                  </div>
                  <div className="sm:text-right bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10">
                    <p className="text-[10px] uppercase tracking-widest font-bold opacity-80 mb-1">Roll Number</p>
                    <p className="text-lg font-mono font-medium tracking-wide">{result.rollNo}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ResultSection 
                    title="Role in Self" 
                    items={result.self} 
                    icon={<UserIcon />} 
                    colorClass="bg-blue-500"
                    delay={100} 
                  />
                  <ResultSection 
                    title="Role in Family" 
                    items={result.family} 
                    icon={<HomeIcon />} 
                    colorClass="bg-emerald-500" 
                    delay={200}
                  />
                  <ResultSection 
                    title="Role in Society" 
                    items={result.society} 
                    icon={<UsersIcon />} 
                    colorClass="bg-violet-500" 
                    delay={300}
                  />
                  <ResultSection 
                    title="Role in Environment" 
                    items={result.environment} 
                    icon={<GlobeIcon />} 
                    colorClass="bg-amber-500" 
                    delay={400}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;