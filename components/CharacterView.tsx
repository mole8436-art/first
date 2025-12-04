import React from 'react';
import { Character } from '../types';

interface CharacterViewProps {
  characters: Character[];
}

const CharacterView: React.FC<CharacterViewProps> = ({ characters }) => {
  if (!characters || characters.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        대본에서 주요 인물 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="text-lg font-bold text-slate-200">주요 인물</h3>
        <span className="text-xs text-slate-500 ml-auto">{characters.length}명</span>
      </div>

      <div className="grid gap-4">
        {characters.map((character, idx) => (
          <div 
            key={idx} 
            className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-base font-bold text-slate-100">{character.name}</h4>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {character.age && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">나이:</span>
                  <span className="text-slate-300">{character.age}</span>
                </div>
              )}
              {character.occupation && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">직업:</span>
                  <span className="text-slate-300">{character.occupation}</span>
                </div>
              )}
              {character.location && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">거주지:</span>
                  <span className="text-slate-300">{character.location}</span>
                </div>
              )}
            </div>

            {character.description && (
              <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-sm text-slate-400 leading-relaxed">{character.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterView;
