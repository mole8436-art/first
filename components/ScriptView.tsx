import React, { useState } from 'react';
import { FullScriptResult } from '../types';

interface ScriptViewProps {
  scriptResult: FullScriptResult;
}

const ScriptView: React.FC<ScriptViewProps> = ({ scriptResult }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const copyFullScript = () => {
    const fullScript = `
**Intro**

${scriptResult.script.intro}


**Background**

${scriptResult.script.background}


**The Incident**

${scriptResult.script.incident}


**Investigation & Climax**

${scriptResult.script.climax}


**Outro**

${scriptResult.script.outro}
    `.trim();
    
    copyToClipboard(fullScript, 'full');
  };

  return (
    <div className="space-y-6">
      {/* Analysis Section */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-bold text-slate-200">사건 분석 보고서</h3>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-400 mb-2">사건 요약</h4>
            <p className="text-slate-300 leading-relaxed">{scriptResult.analysis.summary}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-400 mb-3">타임라인</h4>
            <div className="space-y-2">
              {scriptResult.analysis.timeline.map((event, idx) => (
                <div key={idx} className="flex gap-3 text-sm">
                  <span className="text-brand-400 font-mono whitespace-nowrap">{event.timeOrPhase}</span>
                  <span className="text-slate-300">{event.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-400 mb-3">추천 후킹 멘트</h4>
            <div className="space-y-2">
              {scriptResult.analysis.recommendedHooks.map((hook, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-brand-400 font-bold">{idx + 1}.</span>
                  <span className="text-slate-300">{hook}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Script Section */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h3 className="text-lg font-bold text-slate-200">유튜브 대본 스크립트</h3>
          </div>
          <button
            onClick={copyFullScript}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copiedSection === 'full' ? '복사됨!' : '전체 복사'}
          </button>
        </div>

        <div className="space-y-6">
          {[
            { title: 'Intro (The Hook)', content: scriptResult.script.intro, key: 'intro' },
            { title: 'Background (빌드업)', content: scriptResult.script.background, key: 'background' },
            { title: 'The Incident (사건 발생)', content: scriptResult.script.incident, key: 'incident' },
            { title: 'Investigation & Climax (절정)', content: scriptResult.script.climax, key: 'climax' },
            { title: 'Outro (결말 및 여운)', content: scriptResult.script.outro, key: 'outro' },
          ].map((section) => (
            <div key={section.key} className="border-l-4 border-brand-500 pl-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-bold text-slate-200">{section.title}</h4>
                <button
                  onClick={() => copyToClipboard(section.content, section.key)}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {copiedSection === section.key ? '복사됨' : '복사'}
                </button>
              </div>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line text-sm">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScriptView;
