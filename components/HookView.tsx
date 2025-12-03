import React, { useState } from 'react';
import { SparklesIcon, CopyIcon, CheckIcon } from './Icons';

interface Props {
  hooks: string[];
}

const HookView: React.FC<Props> = ({ hooks }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        <SparklesIcon className="text-brand-400" />
        킬러 후킹 (첫 5초)
      </h3>
      <div className="grid gap-3">
        {hooks.map((hook, index) => (
          <div 
            key={index} 
            className="group relative bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 p-4 rounded-lg hover:border-brand-500 transition-all shadow-lg hover:shadow-brand-900/20"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-500 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-lg text-white font-medium pr-10">"{hook}"</p>
            
            <button
              onClick={() => handleCopy(hook, index)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-brand-600 rounded-full transition-colors"
              title="복사하기"
            >
              {copiedIndex === index ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HookView;