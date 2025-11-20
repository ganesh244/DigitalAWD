import React from 'react';
import { HardDrive, Clock, Server, Activity } from 'lucide-react';
import { SensorData } from '../types';

interface Props {
  data: SensorData;
}

const SystemStatus: React.FC<Props> = ({ data }) => {
  // Avoid division by zero and handle edge cases
  const totalSize = data.sdSize > 0 ? data.sdSize : 1024; // Default to 1GB if unknown
  const remaining = data.sdRemaining || 0;
  
  const sdPercent = (remaining / totalSize) * 100;
  const displayPercent = Math.min(Math.max(sdPercent, 0), 100);

  let barColor = 'bg-emerald-500';
  if (displayPercent < 10) barColor = 'bg-red-500';
  else if (displayPercent < 25) barColor = 'bg-amber-500';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-full flex flex-col">
      <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-5">System Health</h3>
      
      <div className="flex-1 flex flex-col gap-6">
        {/* SD Card */}
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-slate-700">
                    <HardDrive size={18} className="text-slate-400" />
                    <span className="text-sm font-medium">SD Storage</span>
                </div>
                <span className="text-xs text-slate-500">{remaining.toFixed(0)} MB free</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                    className={`h-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${displayPercent}%` }}
                ></div>
            </div>
        </div>

        {/* Timestamp - using list layout to allow wrapping */}
        <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0 text-blue-500">
                <Clock size={18} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-400 uppercase mb-0.5">Last Sync</div>
                <div className="text-sm font-semibold text-slate-800 leading-tight">
                    {data.timestamp}
                </div>
            </div>
        </div>

        {/* Device Info */}
        <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0 text-indigo-500">
                <Server size={18} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-400 uppercase mb-0.5">Device</div>
                <div className="text-sm font-semibold text-slate-800 break-words">
                    {data.device}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                    <span className={`w-2 h-2 rounded-full ${data.dataType === 'Live' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></span>
                    {data.dataType} Mode
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;