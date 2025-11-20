import React from 'react';
import { Wifi, Signal, Smartphone } from 'lucide-react';
import { SensorData } from '../types';

interface Props {
  data: SensorData;
}

const SignalCard: React.FC<Props> = ({ data }) => {
  const isWifi = data.network === 'WiFi';
  
  // Calculate signal percentages
  // WiFi RSSI usually -30 (great) to -90 (bad)
  const wifiQuality = Math.min(Math.max(2 * (data.wifiStrength + 100), 0), 100);
  
  // GSM CSQ usually 0-31. 31 is best.
  const gsmQuality = Math.min(Math.max((data.gsmStrength / 31) * 100, 0), 100);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-full">
      <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-5">Connectivity</h3>
      
      <div className="space-y-5">
        {/* Active Network Indicator */}
        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="text-slate-600 text-sm font-medium px-1">Active Source</span>
          <span className={`px-3 py-0.5 rounded-md text-xs font-bold border ${isWifi ? 'bg-white text-blue-600 border-blue-200' : 'bg-white text-purple-600 border-purple-200'}`}>
            {data.network}
          </span>
        </div>

        {/* WiFi Row */}
        <div className="flex items-center gap-3">
          <div className={`shrink-0 p-2 rounded-lg ${isWifi ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
            <Wifi size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-slate-700">WiFi</span>
              <span className="text-xs text-slate-500">{data.wifiStrength} dBm</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${wifiQuality}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* GSM Row */}
        <div className="flex items-center gap-3">
          <div className={`shrink-0 p-2 rounded-lg ${!isWifi ? 'bg-purple-50 text-purple-600' : 'bg-slate-50 text-slate-400'}`}>
            <Signal size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-slate-700">GSM <span className="text-xs font-normal text-slate-400">({data.simOperator})</span></span>
              <span className="text-xs text-slate-500">{data.gsmStrength} CSQ</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div 
                className="bg-purple-500 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${gsmQuality}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* SMS Status - Full Width Wrapping */}
         <div className="pt-3 border-t border-slate-100">
             <div className="flex gap-2">
                 <Smartphone size={16} className="text-slate-400 mt-0.5 shrink-0" />
                 <div className="min-w-0">
                     <p className="text-xs font-bold text-slate-500 uppercase mb-0.5">Last SMS</p>
                     <p className="text-sm text-slate-700 leading-snug break-words">
                        {data.smsStatus || "No messages"}
                     </p>
                 </div>
             </div>
         </div>

      </div>
    </div>
  );
};

export default SignalCard;