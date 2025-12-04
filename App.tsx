import React, { useState, useEffect } from 'react';
import { analyzeTranscript } from './services/geminiService';
import { AnalysisResult, AnalysisStatus, ScriptInput } from './types';
import TimelineView from './components/TimelineView';
import StructureView from './components/StructureView';
import HookView from './components/HookView';
import { SparklesIcon, ZapIcon, AlertCircleIcon } from './components/Icons';

function App() {
  const [scripts, setScripts] = useState<ScriptInput[]>([
    { id: '1', title: '대본 1', content: '', source: 'text' }
  ]);
  const [activeScriptId, setActiveScriptId] = useState<string>('1');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'structure' | 'timeline'>('structure');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);
  const [rememberKey, setRememberKey] = useState<boolean>(true);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setRememberKey(true);
    } else {
      setShowApiKeyInput(true);
    }
  }, []);

  // Save API key to localStorage when remember is checked
  useEffect(() => {
    if (rememberKey && apiKey) {
      localStorage.setItem('gemini_api_key', apiKey);
    } else if (!rememberKey) {
      localStorage.removeItem('gemini_api_key');
    }
  }, [apiKey, rememberKey]);

  const addScript = () => {
    if (scripts.length >= 5) {
      setErrorMsg("최대 5개의 대본까지만 추가할 수 있습니다.");
      return;
    }
    const newId = String(scripts.length + 1);
    const newScript: ScriptInput = {
      id: newId,
      title: `대본 ${newId}`,
      content: '',
      source: 'text'
    };
    setScripts([...scripts, newScript]);
    setActiveScriptId(newId);
  };

  const removeScript = (id: string) => {
    if (scripts.length === 1) return;
    const filtered = scripts.filter(s => s.id !== id);
    setScripts(filtered);
    if (activeScriptId === id) {
      setActiveScriptId(filtered[0].id);
    }
  };

  const updateScriptContent = (id: string, content: string) => {
    setScripts(scripts.map(s => s.id === id ? { ...s, content } : s));
  };

  const updateScriptTitle = (id: string, title: string) => {
    setScripts(scripts.map(s => s.id === id ? { ...s, title } : s));
  };

  const handleFileUpload = async (id: string, file: File) => {
    if (!file.name.endsWith('.txt')) {
      setErrorMsg("txt 파일만 업로드 가능합니다.");
      return;
    }

    try {
      let content = '';
      
      // Read text file with proper encoding support
      const reader = new FileReader();
      content = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => {
          const text = e.target?.result as string;
          resolve(text || '');
        };
        reader.onerror = () => reject(new Error('파일 읽기 실패'));
        // Use UTF-8 encoding for proper Korean character support
        reader.readAsText(file, 'UTF-8');
      });

      setScripts(scripts.map(s => 
        s.id === id 
          ? { ...s, content, source: 'file', fileName: file.name }
          : s
      ));
      setErrorMsg(null);
    } catch (error) {
      console.error('File read error:', error);
      setErrorMsg("파일을 읽는 중 오류가 발생했습니다. UTF-8 인코딩으로 저장된 txt 파일을 사용해주세요.");
    }
  };

  const handleAnalyze = async () => {
    if (!apiKey.trim()) {
      setShowApiKeyInput(true);
      setErrorMsg("API 키를 먼저 입력해주세요.");
      return;
    }

    const filledScripts = scripts.filter(s => s.content.trim());
    if (filledScripts.length === 0) {
      setErrorMsg("최소 1개 이상의 대본을 입력해주세요.");
      return;
    }

    const totalLength = filledScripts.reduce((sum, s) => sum + s.content.length, 0);
    if (totalLength < 50) {
      setErrorMsg("대본이 너무 짧습니다. 더 자세한 내용을 입력해주세요.");
      return;
    }

    setStatus(AnalysisStatus.ANALYZING);
    setErrorMsg(null);
    setResult(null);

    try {
      // Combine all scripts with context
      const combinedScript = filledScripts.map((s, idx) => 
        `[자료 ${idx + 1}: ${s.title}]\n${s.content}`
      ).join('\n\n---\n\n');

      const data = await analyzeTranscript(combinedScript, apiKey);
      setResult(data);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(AnalysisStatus.ERROR);
      const errorMessage = error instanceof Error ? error.message : "분석 중 오류가 발생했습니다.";
      setErrorMsg(errorMessage.includes('API') ? "API 키가 올바르지 않습니다. 다시 확인해주세요." : "분석 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const activeScript = scripts.find(s => s.id === activeScriptId) || scripts[0];

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="text-xs font-medium px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
              title="API 키 설정"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              {apiKey ? 'API 키 변경' : 'API 키 설정'}
            </button>
            <div className="text-xs font-medium px-2 py-1 bg-brand-900/30 text-brand-300 border border-brand-800 rounded">
              BETA
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* API Key Input Section */}
        {showApiKeyInput && (
          <div className="mb-6 bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="bg-brand-600/20 p-2 rounded-lg">
                <svg className="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-200 mb-1">Gemini API 키 설정</h3>
                <p className="text-sm text-slate-400 mb-4">
                  <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-brand-300 underline">
                    Google AI Studio
                  </a>에서 무료 API 키를 발급받을 수 있습니다.
                </p>
                <div className="flex gap-3">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIza...로 시작하는 API 키를 입력하세요"
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => setShowApiKeyInput(false)}
                    disabled={!apiKey.trim()}
                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    저장
                  </button>
                </div>
                <label className="flex items-center gap-2 mt-3 text-sm text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberKey}
                    onChange={(e) => setRememberKey(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-brand-600 focus:ring-2 focus:ring-brand-500"
                  />
                  브라우저에 API 키 기억하기 (로컬에만 저장됩니다)
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Script Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {scripts.map(script => (
                <div key={script.id} className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveScriptId(script.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      activeScriptId === script.id
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {script.fileName || script.title}
                    {script.content && <span className="ml-1 text-xs">●</span>}
                  </button>
                  {scripts.length > 1 && (
                    <button
                      onClick={() => removeScript(script.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="삭제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              {scripts.length < 5 && (
                <button
                  onClick={addScript}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors flex items-center gap-1"
                  title="대본 추가"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  추가
                </button>
              )}
            </div>

            {/* Script Title & File Upload */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={activeScript.title}
                onChange={(e) => updateScriptTitle(activeScript.id, e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="대본 제목"
              />
              <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 cursor-pointer transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                파일
                <input
                  type="file"
                  accept=".txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(activeScript.id, file);
                    e.target.value = '';
                  }}
                  className="hidden"
                />
              </label>
              {activeScript.content && (
                <button
                  onClick={() => {
                    if (confirm('현재 대본 내용을 모두 지우시겠습니까?')) {
                      updateScriptContent(activeScript.id, '');
                    }
                  }}
                  className="px-4 py-2 bg-red-900/20 hover:bg-red-900/30 border border-red-800 rounded-lg text-sm font-medium text-red-400 transition-colors flex items-center gap-2"
                  title="내용 초기화"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  초기화
                </button>
              )}
            </div>

            {/* Script Content */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-1 shadow-inner">
              <textarea
                value={activeScript.content}
                onChange={(e) => updateScriptContent(activeScript.id, e.target.value)}
                placeholder="대본, 기사, 또는 관련 자료를 입력하세요...&#13;&#10;여러 자료를 추가하면 AI가 팩트만 추출하여 분석합니다."
                className="w-full h-[400px] lg:h-[calc(100vh-24rem)] bg-transparent text-slate-200 placeholder-slate-500 p-4 resize-none focus:outline-none text-base leading-relaxed scrollbar-thin"
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
              disabled={status === AnalysisStatus.ANALYZING}
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
                  팩트 추출 및 분석 중...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  {scripts.filter(s => s.content).length > 1 ? '팩트 추출 & 떡상 구조 생성' : '대본 분석 및 떡상 구조 생성'}
                </>
              )}
            </button>
            
            <p className="text-center text-slate-500 text-xs">
              {scripts.filter(s => s.content).length > 1 
                ? `${scripts.filter(s => s.content).length}개의 자료에서 핵심 팩트를 추출하여 최적의 구조를 제안합니다.`
                : 'Gemini 2.5 AI가 문맥을 파악하여 최적의 타임라인과 후킹을 제안합니다.'}
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
                <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-md">
                    <div className="bg-slate-800/50 p-3 rounded text-xs text-slate-400">
                        ✨ <b>Hook</b><br/>첫 5초 이탈 방지
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded text-xs text-slate-400">
                        ⏳ <b>Timeline</b><br/>복잡한 사건 정리
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded text-xs text-slate-400">
                        📄 <b>다중 자료</b><br/>팩트만 추출
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
