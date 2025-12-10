import React from 'react';

interface ResultSectionProps {
  title: string;
  items: string[];
  icon: React.ReactNode;
  colorClass: string;
  delay?: number;
}

export const ResultSection: React.FC<ResultSectionProps> = ({ title, items, icon, colorClass, delay = 0 }) => {
  return (
    <div 
        className="animate-slide-up bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-lg border border-slate-100 overflow-hidden transition-all duration-300"
        style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`px-5 py-4 border-b border-slate-50 flex items-center gap-3 ${colorClass} bg-opacity-[0.08]`}>
        <div className={`p-2 rounded-lg ${colorClass} text-white shadow-sm`}>
          {icon}
        </div>
        <h3 className="font-bold text-slate-800 tracking-tight">{title}</h3>
      </div>
      <div className="p-5">
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-slate-600 text-sm leading-relaxed group">
              <span className={`mt-2 w-1.5 h-1.5 rounded-full ${colorClass.replace('bg-', 'bg-')} opacity-60 group-hover:scale-125 transition-transform flex-shrink-0`} />
              <span>{item}</span>
            </li>
          ))}
          {items.length === 0 && (
            <li className="text-slate-400 text-sm italic pl-1">Not mentioned clearly.</li>
          )}
        </ul>
      </div>
    </div>
  );
};