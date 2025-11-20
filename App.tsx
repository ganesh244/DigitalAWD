import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History as HistoryIcon, Settings, Droplets, RefreshCw, AlertCircle } from 'lucide-react';
import { SensorData, Tab } from './types';
import { fetchSensorData } from './services/dataService';

import WaterGauge from './components/WaterGauge';
import SignalCard from './components/SignalCard';
import SystemStatus from './components/SystemStatus';
import HistoryChart from './components/HistoryChart';
import HistoryTable from './components/HistoryTable';

const NavLink = ({ to, icon: Icon, label, active }: any) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
    }`}
  >
    <Icon size={20} />
    <span className="hidden md:block">{label}</span>
  </Link>
);

const DashboardView: React.FC<{ data: SensorData[], latest: SensorData | null, loading: boolean, refresh: () => void }> = ({ data, latest, loading, refresh }) => {
  if (loading && !latest) return (
    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
      <RefreshCw className="animate-spin" size={32} />
      <p>Connecting to Google Sheets...</p>
    </div>
  );

  if (!latest) return (
    <div className="h-full flex flex-col items-center justify-center text-slate-400">
      <p>No data found. Waiting for first reading...</p>
    </div>
  );

  // Calculate Stats
  const levels = data.map(d => d.waterLevel).filter(l => typeof l === 'number' && !isNaN(l));
  const maxLevel = levels.length > 0 ? Math.max(...levels) : 0;
  const minLevel = levels.length > 0 ? Math.min(...levels) : 0;
  const avgLevel = levels.length > 0 ? levels.reduce((a, b) => a + b, 0) / levels.length : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
          <p className="text-slate-500">Real-time monitoring for {latest.device}</p>
        </div>
        <button 
            onClick={refresh}
            disabled={loading}
            className={`p-2 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm hover:text-primary-600 hover:border-primary-200 transition-all ${loading ? 'animate-spin' : ''}`}
            title="Refresh Data"
        >
            <RefreshCw size={20} />
        </button>
      </header>

      {/* Top Row: Gauge and Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Water Gauge - Prominent */}
        <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center py-6">
           <WaterGauge level={latest.waterLevel} status={latest.status} />
           <p className="mt-4 text-xs text-slate-400">Capacity Estimate based on 30cm depth</p>
        </div>

        {/* Stats Column */}
        <div className="md:col-span-2 flex flex-col gap-6">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SignalCard data={latest} />
              <SystemStatus data={latest} />
           </div>
           
           {/* Stats Box Replacement */}
           <div className="flex-1">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-full">
                <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-4">Water Level Trends (Session)</h3>
                <div className="grid grid-cols-3 gap-4 h-full content-center">
                    <div className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="text-xs text-blue-400 uppercase font-bold mb-1">Average</div>
                        <div className="text-2xl font-bold text-blue-700">{avgLevel.toFixed(1)}</div>
                        <div className="text-xs text-blue-400">cm</div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-xs text-slate-400 uppercase font-bold mb-1">Max</div>
                        <div className="text-2xl font-bold text-slate-700">{maxLevel.toFixed(1)}</div>
                        <div className="text-xs text-slate-400">cm</div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-xs text-slate-400 uppercase font-bold mb-1">Min</div>
                        <div className="text-2xl font-bold text-slate-700">{minLevel.toFixed(1)}</div>
                        <div className="text-xs text-slate-400">cm</div>
                    </div>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const HistoryView: React.FC<{ data: SensorData[] }> = ({ data }) => {
  return (
    <div className="space-y-8 pb-10">
       <header>
          <h1 className="text-2xl font-bold text-slate-800">History & Analytics</h1>
          <p className="text-slate-500">Detailed breakdown of water usage and system logs</p>
        </header>
        
        {/* Chart Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="h-[400px] w-full">
                <HistoryChart data={data} />
            </div>
        </div>
        
        {/* Table Section */}
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-slate-800">Data Logs</div>
                <div className="text-sm text-slate-500">{data.length} records loaded this session</div>
            </div>
            <HistoryTable data={data} />
        </div>
    </div>
  );
};

// Define optional children prop explicitly to avoid TS errors
const Layout = ({ children }: { children?: React.ReactNode }) => {
    const location = useLocation();
    return (
        <div className="flex min-h-screen bg-slate-50/50">
            {/* Sidebar / Mobile Nav */}
            <aside className="fixed bottom-0 left-0 w-full md:w-64 md:static md:h-screen bg-white border-t md:border-t-0 md:border-r border-slate-200 z-50 flex md:flex-col justify-between py-2 px-4 md:p-6 shadow-lg md:shadow-none">
                <div className="flex md:flex-col w-full justify-around md:justify-start gap-2 md:gap-4">
                    <div className="hidden md:flex items-center gap-3 px-4 mb-8 text-primary-600">
                        <div className="p-2 bg-primary-100 rounded-lg">
                            <Droplets size={24} />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-800">AWD Online</span>
                    </div>

                    <NavLink to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
                    <NavLink to="/history" icon={HistoryIcon} label="History" active={location.pathname === '/history'} />
                    
                    {/* Settings link (disabled/placeholder) */}
                    <div className="hidden md:block mt-auto">
                       <div className="flex items-center gap-3 px-4 py-3 text-slate-400 cursor-not-allowed">
                           <Settings size={20} />
                           <span>Settings</span>
                       </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto h-screen">
                <div className="max-w-6xl mx-auto h-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

const AppContent = () => {
  const [data, setData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const loadData = async () => {
    // Don't show global loading spinner on background refreshes if we already have data
    if (data.length === 0) setLoading(true);
    
    try {
      const result = await fetchSensorData();
      
      if (result.length === 0) {
        console.warn("Fetched data is empty");
      } else {
        setError(null);
        // Replace data fully. sorting is handled in fetchSensorData.
        // This ensures we always have the authoritative history from the sheet.
        setData(result);
      }
    } catch (err) {
      console.error(err);
      // Only show error if we don't have any data yet, otherwise just log it
      if (data.length === 0) {
         setError("Failed to load data from Google Sheets. Please ensure your App Script web app is deployed correctly.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Auto-refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Since data is sorted Oldest -> Newest, the last item is the latest
  const latest = data.length > 0 ? data[data.length - 1] : null;

  if (error && data.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
            <AlertCircle size={48} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Connection Error</h2>
          <p className="text-slate-600 max-w-md mb-6">{error}</p>
          <button 
            onClick={loadData}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  return (
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardView data={data} latest={latest} loading={loading} refresh={loadData} />} />
          <Route path="/history" element={<HistoryView data={data} />} />
        </Routes>
      </Layout>
  );
}

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;