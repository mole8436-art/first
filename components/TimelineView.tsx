import React from 'react';
import { TimelineEvent } from '../types';
import { ClockIcon } from './Icons';

interface Props {
  events: TimelineEvent[];
}

const TimelineView: React.FC<Props> = ({ events }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        <ClockIcon className="text-brand-400" />
        사건 타임라인
      </h3>
      <div className="relative border-l-2 border-slate-700 ml-3 space-y-8">
        {events.map((event, index) => (
          <div key={index} className="relative pl-8 group">
            <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-slate-800 border-2 border-brand-500 group-hover:bg-brand-500 transition-colors"></span>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
              <span className="text-brand-300 font-mono text-sm font-bold min-w-[100px] shrink-0">
                {event.timeOrPhase}
              </span>
              <p className="text-slate-300 text-base leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineView;