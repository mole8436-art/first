import React, { useState, useEffect } from 'react';
import { analyzeTranscript } from './services/geminiService';
import { AnalysisResult, AnalysisStatus } from './types';
import TimelineView from './components/TimelineView';
import StructureView from './components/StructureView';
import HookView from './components/HookView';
import { SparklesIcon, ZapIcon, AlertCircleIcon } from './components/Icons';

function App() {
  const [inputScript, setInputScript] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'structure' | 'timeline'>('structure');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check for API key on mount
  useEffect(() => {
    if (!process.env.API_KEY) {
      setErrorMsg("API Key가 설정되지 않았습니다. 환경 변수를 확인해주세요.");
      setStatus(AnalysisStatus.ERROR);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!inputScript.trim()) return;
    if (inputScript.length < 50) {
        setErrorMsg("대본이 너무 짧습니다. 더 자세한 내용을 입력해주세요.");
        return;
    }

    setStatus(AnalysisStatus.ANALYZING);
    setErrorMsg(null);
    setResult(null);

    try {
      const data = await analyzeTranscript(inputScript);
      setResult(data);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(AnalysisStatus.ERROR);
      setErrorMsg("분석 중 오류가 발생했습니다. 다시 시도하거나 대본을 확인해주세요.");
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-brand-500/30 selection:text-brand-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 p-1.5 rounded-lg">
              <ZapIcon className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Viral Script Architect
            </h1>
          </div>
          <div className="text-xs font-medium px-2 py-1 bg-brand-900/30 text-brand-300 border border-brand-800 rounded">
             BETA
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-1 shadow-inner">
              <textarea
                value={inputScript}
                onChange={(e) => setInputScript(e.target.value)}
                placeholder="여기에 사건 관련 대본이나 기사 내용을 붙여넣으세요...&#13;&#10;(최소 200자 이상 권장)"
                className="w-full h-[500px] lg:h-[calc(100vh-12rem)] bg-transparent text-slate-200 placeholder-slate-500 p-4 resize-none focus:outline-none text-base leading-relaxed scrollbar-thin"
              />
            </div>
            
            {errorMsg && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/50">
                    <AlertCircleIcon className="w-4 h-4" />
                    {errorMsg}
                </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={status === AnalysisStatus.ANALYZING || !inputScript.trim()}
              className={`
                w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01]
                ${status === AnalysisStatus.ANALYZING 
                  ? 'bg-slate-700 text-slate-400 cursor-wait' 
                  : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-brand-900/50'}
              `}
            >
              {status === AnalysisStatus.ANALYZING ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  분석 및 구조화 중...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  대본 분석 및 떡상 구조 생성
                </>
              )}
            </button>
            
            <p className="text-center text-slate-500 text-xs">
              Gemini 2.5 AI가 문맥을 파악하여 최적의 타임라인과 후킹을 제안합니다.
            </p>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7 flex flex-col h-full">
            {status === AnalysisStatus.SUCCESS && result ? (
              <div className="space-y-6 animate-fade-in">
                {/* Score Card */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
                  <div>
                    <h2 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">예상 바이럴 점수</h2>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-black ${scoreColor(result.viralScore)}`}>{result.viralScore}</span>
                        <span className="text-slate-500">/ 100</span>
                    </div>
                  </div>
                  <div className="flex-1 border-l border-slate-700 pl-0 sm:pl-6">
                    <h3 className="text-slate-300 font-semibold mb-2 text-sm">💡 AI의 조언</h3>
                    <ul className="text-sm text-slate-400 space-y-1">
                        {result.tips.slice(0, 2).map((tip, idx) => (
                            <li key={idx}>• {tip}</li>
                        ))}
                    </ul>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl min-h-[600px]">
                    <div className="flex border-b border-slate-800">
                        <button 
                            onClick={() => setActiveTab('structure')}
                            className={`flex-1 py-4 text-sm font-bold tracking-wide transition-colors ${activeTab === 'structure' ? 'bg-brand-900/20 text-brand-400 border-b-2 border-brand-500' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
                        >
                            구조 & 후킹
                        </button>
                        <button 
                            onClick={() => setActiveTab('timeline')}
                            className={`flex-1 py-4 text-sm font-bold tracking-wide transition-colors ${activeTab === 'timeline' ? 'bg-brand-900/20 text-brand-400 border-b-2 border-brand-500' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
                        >
                            사건 타임라인
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto max-h-[calc(100vh-20rem)] scrollbar-thin scrollbar-thumb-slate-700">
                        {activeTab === 'structure' ? (
                            <div className="space-y-10">
                                <HookView hooks={result.hooks} />
                                <div className="border-t border-slate-800 pt-8">
                                    <StructureView structure={result.scriptStructure} />
                                </div>
                            </div>
                        ) : (
                            <TimelineView events={result.timeline} />
                        )}
                    </div>
                </div>
              </div>
            ) : (
              // Empty State
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/50">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <SparklesIcon className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-300 mb-2">분석 대기 중</h3>
                <p className="text-slate-500 max-w-sm">
                  왼쪽에 대본을 입력하고 버튼을 누르면,<br/>
                  AI가 떡상 가능한 구조와 후킹 멘트를 제안해드립니다.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-md">
                    <div className="bg-slate-800/50 p-3 rounded text-xs text-slate-400">
                        ✨ <b>Hook</b><br/>첫 5초 이탈 방지
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded text-xs text-slate-400">
                        ⏳ <b>Timeline</b><br/>복잡한 사건 정리
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;