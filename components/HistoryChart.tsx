import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Calendar } from 'lucide-react';
import { SensorData } from '../types';

interface Props {
  data: SensorData[];
}

type TimeRange = '24h' | '1w' | '1m' | 'all' | 'custom';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg z-50">
        <p className="text-xs text-slate-500 mb-1">{data.timestamp}</p>
        <p className="text-sm font-bold text-primary-700">
          Water Level: {data.waterLevel} cm
        </p>
        <p className={`text-xs font-medium mt-1 ${
            data.status === 'Good' ? 'text-emerald-600' : 'text-amber-600'
        }`}>
          Status: {data.status}
        </p>
         <p className="text-[10px] text-slate-400 mt-1">Via {data.network}</p>
      </div>
    );
  }
  return null;
};

const HistoryChart: React.FC<Props> = ({ data }) => {
  const [range, setRange] = useState<TimeRange>('24h');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // 1. Filter Data based on Range
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Always sort by time just in case (Oldest -> Newest)
    const sorted = [...data].sort((a, b) => a.timestampEpoch - b.timestampEpoch);
    
    if (range === 'all') return sorted;

    const now = Date.now();
    let startEpoch = 0;
    let endEpoch = now;

    if (range === '24h') {
        startEpoch = now - (24 * 60 * 60 * 1000);
    } else if (range === '1w') {
        startEpoch = now - (7 * 24 * 60 * 60 * 1000);
    } else if (range === '1m') {
        startEpoch = now - (30 * 24 * 60 * 60 * 1000);
    } else if (range === 'custom') {
        if (customStart) {
            startEpoch = new Date(customStart).getTime();
        }
        if (customEnd) {
            // Set to end of the selected day
            endEpoch = new Date(customEnd).getTime() + (24 * 60 * 60 * 1000) - 1;
        } else {
             // If no end date selected, default to now
             endEpoch = now;
        }
    }

    return sorted.filter(d => d.timestampEpoch >= startEpoch && d.timestampEpoch <= endEpoch);
  }, [data, range, customStart, customEnd]);

  // 2. Downsample Data for Performance (Max ~500 points)
  // This ensures the chart remains responsive even if you have 10,000 records
  const chartData = useMemo(() => {
      if (filteredData.length <= 500) return filteredData;
      
      const step = Math.ceil(filteredData.length / 500);
      return filteredData.filter((_, index) => index % step === 0);
  }, [filteredData]);

  if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-slate-400">No Data Available</div>;

  // Calculate min/max for Y-Axis padding based on visible data
  const levels = chartData.map(d => d.waterLevel);
  const minVal = levels.length ? Math.min(...levels) : 0;
  const maxVal = levels.length ? Math.max(...levels) : 30;

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
            <h3 className="text-slate-800 text-lg font-bold">Water Level Trends</h3>
            <p className="text-slate-500 text-sm">
                Showing {chartData.length} points (Total: {filteredData.length})
            </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
             {(['24h', '1w', '1m', 'all'] as const).map((r) => (
                 <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                        range === r 
                        ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                 >
                    {r === '24h' ? '24 Hours' : r === '1w' ? '1 Week' : r === '1m' ? '1 Month' : 'All Data'}
                 </button>
             ))}
             <button
                onClick={() => setRange('custom')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                    range === 'custom'
                    ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
             >
                <Calendar size={12} />
                Custom
             </button>
        </div>
      </div>

      {range === 'custom' && (
          <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center gap-3 animate-fade-in">
              <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Start:</span>
                  <input 
                    type="date" 
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="text-xs p-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-primary-400"
                  />
              </div>
              <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">End:</span>
                  <input 
                    type="date" 
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="text-xs p-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-primary-400"
                  />
              </div>
          </div>
      )}

      <div className="flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
                dataKey="timestampEpoch"
                type="number"
                scale="time"
                domain={['auto', 'auto']}
                tick={{fontSize: 10, fill: '#64748b'}} 
                tickFormatter={(epoch) => {
                    const date = new Date(epoch);
                    if (range === '24h') {
                        return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                    }
                    if (range === 'all' || range === 'custom') {
                        return date.toLocaleDateString([], {month: 'short', day: 'numeric', year: '2-digit'});
                    }
                    return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
                }}
                minTickGap={40}
            />
            <YAxis 
                domain={[Math.max(0, minVal - 5), maxVal + 5]} 
                tick={{fontSize: 10, fill: '#64748b'}}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={5} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'insideBottomLeft', value: 'Low', fill: '#f59e0b', fontSize: 10 }} />
            <ReferenceLine y={25} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'High', fill: '#ef4444', fontSize: 10 }} />
            <Area 
                type="monotone" 
                dataKey="waterLevel" 
                stroke="#0ea5e9" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorLevel)" 
                animationDuration={1000}
                isAnimationActive={filteredData.length < 500} // Disable animation for huge datasets to prevent lag
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoryChart;