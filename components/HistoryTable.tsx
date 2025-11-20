import React, { useState, useMemo } from 'react';
import { SensorData } from '../types';
import { Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  data: SensorData[];
}

const ITEMS_PER_PAGE = 50;

const HistoryTable: React.FC<Props> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reverse data for table to show newest first (Full dataset for export)
  const fullSortedData = useMemo(() => [...data].reverse(), [data]);

  // Calculate pagination
  const totalPages = Math.ceil(fullSortedData.length / ITEMS_PER_PAGE);
  
  // Get current page data
  const currentData = useMemo(() => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      return fullSortedData.slice(start, start + ITEMS_PER_PAGE);
  }, [fullSortedData, currentPage]);

  const handleDownload = () => {
    const headers = ["Timestamp", "Level (cm)", "Status", "Network", "Signal", "Device", "SMS"];
    const csvContent = [
        headers.join(","),
        ...fullSortedData.map(row => [
            row.timestamp,
            row.waterLevel,
            row.status,
            row.network,
            row.network === 'WiFi' ? `${row.wifiStrength}dBm` : `${row.gsmStrength}CSQ`,
            row.device,
            row.smsStatus
        ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'water_monitor_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!data || data.length === 0) {
      return <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">No history logs available.</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
             {/* Title moved to parent view for cleaner layout */}
             <div className="relative">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                    type="text" 
                    placeholder="Filter logs..." 
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 w-full sm:w-64 transition-all"
                    disabled // Placeholder for future functionality
                 />
             </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs text-slate-400 hidden sm:inline-block">
                {fullSortedData.length} total records
            </span>
            <button 
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors flex-1 sm:flex-none"
            >
                <Download size={16} />
                <span>Export CSV</span>
            </button>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar min-h-[300px]">
        <table className="w-full text-left border-collapse relative">
          <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm">
            <tr className="text-slate-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold border-b border-slate-200 bg-slate-50">Timestamp</th>
              <th className="p-4 font-semibold border-b border-slate-200 bg-slate-50">Level</th>
              <th className="p-4 font-semibold border-b border-slate-200 bg-slate-50">Status</th>
              <th className="p-4 font-semibold border-b border-slate-200 bg-slate-50">Network</th>
              <th className="p-4 font-semibold border-b border-slate-200 bg-slate-50 hidden md:table-cell">Signal</th>
              <th className="p-4 font-semibold border-b border-slate-200 bg-slate-50 hidden sm:table-cell">SMS</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
            {currentData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 whitespace-nowrap font-medium font-mono text-xs sm:text-sm">{row.timestamp}</td>
                <td className="p-4 font-bold">{row.waterLevel} cm</td>
                <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold
                        ${row.status === 'Good' ? 'bg-emerald-100 text-emerald-700' : 
                          row.status === 'Low' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {row.status}
                    </span>
                </td>
                <td className="p-4">
                    <span className="flex items-center gap-1">
                        {row.network}
                    </span>
                </td>
                <td className="p-4 hidden md:table-cell text-slate-400 text-xs">
                    {row.network === 'WiFi' ? `${row.wifiStrength} dBm` : `${row.gsmStrength} CSQ`}
                </td>
                <td className="p-4 hidden sm:table-cell text-slate-500 text-xs truncate max-w-[150px]">
                    {row.smsStatus}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600"
              >
                  <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-medium text-slate-600">
                  Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600"
              >
                  <ChevronRight size={20} />
              </button>
          </div>
      )}
    </div>
  );
};

export default HistoryTable;