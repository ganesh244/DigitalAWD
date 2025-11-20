import React from 'react';

interface WaterGaugeProps {
  level: number;
  maxCapacity?: number;
  status: string;
}

const WaterGauge: React.FC<WaterGaugeProps> = ({ level, maxCapacity = 30, status }) => {
  const percentage = Math.min(Math.max((level / maxCapacity) * 100, 0), 100);
  
  let colorClass = "bg-primary-500";
  if (status === 'Low') colorClass = "bg-amber-500";
  if (status === 'Excess' || status === 'Flood Alert') colorClass = "bg-red-500";
  if (status === 'Good') colorClass = "bg-emerald-500";

  // Wave animation path
  // We use a simple CSS animation on an SVG path for the wave effect
  
  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <div className="relative w-40 h-60 bg-slate-100 rounded-b-3xl rounded-t-lg border-4 border-slate-300 overflow-hidden shadow-inner">
        {/* Background Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-4 px-2 opacity-30 z-10 pointer-events-none">
           <div className="w-full border-b border-slate-400 text-[10px] text-right pr-1">100%</div>
           <div className="w-full border-b border-slate-400 text-[10px] text-right pr-1">75%</div>
           <div className="w-full border-b border-slate-400 text-[10px] text-right pr-1">50%</div>
           <div className="w-full border-b border-slate-400 text-[10px] text-right pr-1">25%</div>
           <div className="w-full border-b border-slate-400 text-[10px] text-right pr-1">0%</div>
        </div>

        {/* Water Fill */}
        <div 
          className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-in-out ${colorClass} opacity-90`}
          style={{ height: `${percentage}%` }}
        >
            {/* Bubbles Overlay */}
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjIiLz4KPC9zdmc+')]"></div>
            
            {/* Top Wave Line (SVG) */}
            <div className="absolute -top-3 left-0 right-0 h-4 w-full overflow-hidden">
                <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="h-full w-full">
                    <path d="M0.00,49.98 C149.99,150.00 349.20,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" className={`fill-current ${colorClass.replace('bg-', 'text-')}`}></path>
                </svg>
            </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <div className="text-3xl font-bold text-slate-800">{level.toFixed(1)} <span className="text-lg text-slate-500">cm</span></div>
        <div className={`text-sm font-medium px-2 py-1 rounded-full mt-1 inline-block 
          ${status === 'Good' ? 'bg-emerald-100 text-emerald-700' : 
            status === 'Low' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
          {status}
        </div>
      </div>
    </div>
  );
};

export default WaterGauge;