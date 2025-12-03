import React from 'react';
import { ScriptSection } from '../types';
import { LayersIcon, ZapIcon } from './Icons';

interface Props {
  structure: ScriptSection[];
}

const StructureView: React.FC<Props> = ({ structure }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        <LayersIcon className="text-brand-400" />
        떡상 대본 구조
      </h3>
      <div className="grid gap-4">
        {structure.map((section, index) => (
          <div 
            key={index} 
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 hover:border-brand-500/50 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-lg font-bold text-white bg-brand-900/50 px-3 py-1 rounded text-brand-200 inline-block">
                {index + 1}. {section.sectionName}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded-full border border-yellow-700/30">
                <ZapIcon className="w-3 h-3" />
                <span>{section.psychologicalTrigger}</span>
              </div>
            </div>
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {section.contentProposal}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StructureView;