import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import { 
  Search, Bell, MoreVertical, MapPin, 
  ArrowUpRight, Users, Clock, AlertTriangle, 
  Smartphone, Video, Map, Maximize2,
  Building, ChevronLeft, ChevronRight
} from 'lucide-react';
import { VisitorLog, UserType, AccessStatus, DashboardStats } from '../types';
import { generateSecurityBriefing } from '../services/geminiService';
import { fetchDashboardStats, fetchAccessLogs } from '../services/supabaseService';

// Fallback Data if DB is empty
const dailyTrafficData = [
  { name: '08:00', visitors: 45, staff: 120 },
  { name: '09:00', visitors: 35, staff: 80 },
  { name: '10:00', visitors: 50, staff: 40 },
  { name: '11:00', visitors: 30, staff: 25 },
  { name: '12:00', visitors: 60, staff: 90 },
  { name: '13:00', visitors: 45, staff: 110 },
  { name: '14:00', visitors: 55, staff: 60 },
  { name: '15:00', visitors: 40, staff: 35 },
  { name: '16:00', visitors: 25, staff: 30 },
  { name: '17:00', visitors: 15, staff: 20 },
];

const userCategories = [
  { name: 'Staff', value: 450, color: '#3b82f6' }, // Blue
  { name: 'Visitor', value: 300, color: '#10b981' }, // Green
  { name: 'Contractor', value: 120, color: '#f59e0b' }, // Orange
  { name: 'VIP', value: 15, color: '#8b5cf6' }, // Purple
  { name: 'Delivery', value: 45, color: '#06b6d4' }, // Cyan
];

const cctvFeeds = [
  { id: 1, name: 'Guard House A', location: 'Main Entrance', img: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=500&auto=format&fit=crop' },
  { id: 2, name: 'Guard House B', location: 'Side Entrance', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=500&auto=format&fit=crop' },
  { id: 3, name: 'Convention Centre', location: 'Main Hall', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=500&auto=format&fit=crop' },
  { id: 4, name: 'Mosque', location: 'Prayer Hall Entrance', img: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=500&auto=format&fit=crop' },
];

interface DashboardProps {
    setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const [stats, setStats] = useState<DashboardStats>({
      totalVisitors: 0,
      activeStaff: 0,
      alerts: 0,
      avgDuration: '0m'
  });
  const [recentLogs, setRecentLogs] = useState<VisitorLog[]>([]);
  const [briefing, setBriefing] = useState<string>("");
  const [loadingBriefing, setLoadingBriefing] = useState<boolean>(false);
  const [activeMapTab, setActiveMapTab] = useState<'map' | 'cctv'>('map');
  const [cctvPage, setCctvPage] = useState(0);
  const [timeframe, setTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

  // Load Data from Supabase
  useEffect(() => {
    const loadData = async () => {
        const dashboardStats = await fetchDashboardStats();
        const logs = await fetchAccessLogs(5); // Get latest 5
        setStats(dashboardStats);
        setRecentLogs(logs);
    };
    loadData();
    
    // Optional: Polling every 30 seconds for live updates
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleBriefing = async () => {
    setLoadingBriefing(true);
    const text = await generateSecurityBriefing(stats, recentLogs);
    setBriefing(text);
    setLoadingBriefing(false);
  };

  const currentCctvFeeds = cctvFeeds.slice(cctvPage * 4, (cctvPage + 1) * 4);

  // Reusable Mini-Map Zone Component
  const MiniZone = ({ className, color, label }: { className: string, color: string, label: string }) => (
     <div 
        className={`absolute rounded-md shadow-sm border border-black/10 flex items-center justify-center text-[8px] font-bold text-white uppercase tracking-wider cursor-pointer hover:scale-110 transition-transform z-20 ${className}`}
        style={{ backgroundColor: color }}
        title={label}
     >
        {label}
     </div>
  );

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 flex-shrink-0">
        <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 w-96">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search visitor, ID, or vehicle..." 
            className="bg-transparent border-none outline-none text-sm ml-3 w-full text-slate-700 placeholder-slate-400"
          />
        </div>
        
        <div className="flex items-center gap-6">
          <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
            <Bell size={20} className="text-slate-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          
          <div className="flex items-center gap-3">
             <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-800">Officer Henry</p>
                <p className="text-xs text-slate-500">Auxiliary Police</p>
             </div>
             <img src="https://picsum.photos/200/200" alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-slate-200" />
          </div>
        </div>
      </header>

      {/* Main Content Scrollable */}
      <main className="flex-1 overflow-y-auto p-8">
        
        {/* Top Stats Row */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-xl font-bold text-slate-800">Premise Overview</h2>
             <button 
                onClick={handleBriefing}
                className="text-xs font-semibold bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-2"
             >
                {loadingBriefing ? 'Analyzing...' : 'AI Security Briefing'}
                <ArrowUpRight size={14} />
             </button>
          </div>
          
          {briefing && (
            <div className="mb-6 bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-indigo-900 text-sm animate-fade-in">
                <p className="font-semibold mb-1">⚡ Smart Insight:</p>
                {briefing}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stat Card 1: Daily Total User Enter */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Daily Total Entries</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalVisitors}</h3>
                    <p className="text-xs text-green-500 flex items-center mt-1">
                        <ArrowUpRight size={12} className="mr-1" /> Live Count
                    </p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                    <Users size={20} />
                  </div>
               </div>
               <div className="h-8 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{v:20}, {v:40}, {v:30}, {v:50}, {v:35}, {v:60}, {v:45}]}>
                      <Bar dataKey="v" fill="#3b82f6" radius={[4, 4, 4, 4]} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Stat Card 2: Active Staff */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Active Staff On-Site</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.activeStaff}</h3>
                    <p className="text-xs text-green-500 flex items-center mt-1">
                        <ArrowUpRight size={12} className="mr-1" /> Checked In
                    </p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-full text-green-600">
                    <Clock size={20} />
                  </div>
               </div>
               <div className="h-8 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[{v:20}, {v:25}, {v:40}, {v:30}, {v:50}, {v:45}, {v:60}]}>
                       <Area type="monotone" dataKey="v" stroke="#10b981" fill="#ecfdf5" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

             {/* Stat Card 3: Most Premise Enter */}
             <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Most Active Zone</p>
                    <h3 className="text-lg font-bold text-slate-800 mt-1 truncate" title="Tower 1 (HQ)">Tower 1 (HQ)</h3>
                    <p className="text-xs text-slate-400">Based on recent logs</p>
                  </div>
                  <div className="p-2 bg-indigo-50 rounded-full text-indigo-600">
                    <Building size={20} />
                  </div>
               </div>
               <div className="mt-3 bg-slate-100 rounded-full h-1.5 w-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{width: '75%'}}></div>
               </div>
               <div className="mt-2 text-[10px] text-slate-400 text-right">High Traffic</div>
            </div>

            {/* Stat Card 4: Alerts */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Security Alerts</p>
                    <h3 className={`text-2xl font-bold mt-1 ${stats.alerts > 0 ? 'text-red-600' : 'text-slate-800'}`}>{stats.alerts}</h3>
                    <p className="text-xs text-red-400 mt-1 font-medium">{stats.alerts > 0 ? 'Denied Entries Today' : 'System Normal'}</p>
                  </div>
                  <div className={`p-2 rounded-full ${stats.alerts > 0 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
                    <AlertTriangle size={20} />
                  </div>
               </div>
               <div className="h-8 w-full flex items-end gap-1">
                   {[40, 60, 30, 80, 20, 50, 90, 40, 20].map((h, i) => (
                       <div key={i} className={`flex-1 rounded-sm ${stats.alerts > 0 ? 'bg-red-100' : 'bg-slate-100'}`} style={{height: `${h}%`}}></div>
                   ))}
               </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Main Bar Chart - Traffic Statistics */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Traffic Statistics</h3>
                        <p className="text-xs text-slate-500">Visitor and Staff entry comparison</p>
                    </div>
                    
                    {/* Timeframe Selector */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {(['Daily', 'Weekly', 'Monthly'] as const).map(t => (
                            <button 
                                key={t}
                                onClick={() => setTimeframe(t)}
                                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                    timeframe === t 
                                    ? 'bg-white text-slate-800 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyTrafficData} barSize={20} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 11, fill: '#94a3b8'}} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 11, fill: '#94a3b8'}} 
                            />
                            <Tooltip 
                                cursor={{fill: '#f8fafc'}} 
                                contentStyle={{
                                    borderRadius: '12px', 
                                    border: 'none', 
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    padding: '12px'
                                }}
                            />
                            <Bar name="Visitors" dataKey="visitors" fill="#3b82f6" radius={[4, 4, 4, 4]} />
                            <Bar name="Staff" dataKey="staff" fill="#93c5fd" radius={[4, 4, 4, 4]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Circular Chart - User Categories */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">User Categories</h3>
                        <p className="text-xs text-slate-500">Distribution by entry type</p>
                    </div>
                    <button className="p-1 hover:bg-slate-50 rounded-full text-slate-400">
                        <MoreVertical size={18} />
                    </button>
                </div>
                <div className="h-56 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={userCategories}
                                innerRadius={65}
                                outerRadius={85}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {userCategories.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{
                                    borderRadius: '8px', 
                                    border: 'none', 
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold text-slate-800">{stats.totalVisitors + 10}</span>
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Total Users</span>
                    </div>
                </div>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                    {userCategories.map((type, i) => (
                        <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-slate-50 last:border-0">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{backgroundColor: type.color}}></div>
                                <span className="text-slate-600 font-medium">{type.name}</span>
                            </div>
                            <span className="font-bold text-slate-800">{type.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Table */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800">Recent Access Activity</h3>
                    <button className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                        View All
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-50">
                                <th className="pb-3 pl-2">User</th>
                                <th className="pb-3">Type</th>
                                <th className="pb-3">Location</th>
                                <th className="pb-3">Time</th>
                                <th className="pb-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">No recent logs found via Database connection.</td>
                                </tr>
                            ) : recentLogs.map((log) => (
                                <tr key={log.id} className="group hover:bg-slate-50 transition-colors">
                                    <td className="py-3 pl-2">
                                        <div className="flex items-center gap-3">
                                            <img src={log.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                                            <span className="text-sm font-semibold text-slate-700">{log.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                            log.type === UserType.STAFF ? 'bg-blue-50 text-blue-600' :
                                            log.type === UserType.VISITOR ? 'bg-green-50 text-green-600' :
                                            'bg-orange-50 text-orange-600'
                                        }`}>
                                            {log.type}
                                        </span>
                                    </td>
                                    <td className="py-3 text-sm text-slate-500">{log.location}</td>
                                    <td className="py-3 text-sm text-slate-500">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                    <td className="py-3">
                                        <span className={`text-xs font-medium ${
                                            log.status === AccessStatus.CHECKED_IN ? 'text-green-600' :
                                            log.status === AccessStatus.CHECKED_OUT ? 'text-slate-400' :
                                            'text-red-500'
                                        }`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tabbed Map/CCTV Card */}
            <div className="bg-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[400px] lg:h-auto text-white relative">
                {/* Tabs Header */}
                <div className="flex border-b border-slate-700">
                    <button 
                        onClick={() => setActiveMapTab('map')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeMapTab === 'map' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        <Map size={16} /> Live Map
                    </button>
                    <button 
                        onClick={() => setActiveMapTab('cctv')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeMapTab === 'cctv' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        <Video size={16} /> CCTV Feeds
                    </button>
                </div>

                {/* Content Area */}
                <div className="relative flex-1 bg-slate-900 overflow-hidden group">
                    {activeMapTab === 'map' ? (
                        <div className="relative w-full h-full bg-[#F1F5F9] overflow-hidden">
                             {/* Mini Map Representation */}
                             <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:10px_10px]"></div>

                             {/* --- Roads --- */}
                             <div className="absolute left-[20%] top-0 bottom-[20%] w-8 bg-[#334155] border-x-2 border-dashed border-white/20 z-0"></div>
                             <div className="absolute left-0 right-0 bottom-[20%] h-8 bg-[#334155] border-y-2 border-dashed border-white/20 z-0"></div>
                             <div className="absolute right-[20%] top-[30%] bottom-[20%] w-6 bg-[#334155] border-x-2 border-dashed border-white/20 z-0"></div>

                             {/* --- Zones --- */}
                             <div className="absolute top-[10%] left-[28%] w-[45%] h-[55%] bg-blue-50/50 rounded-xl border border-dashed border-indigo-200 z-0"></div>

                             <MiniZone className="top-[10%] left-[8%] w-16 h-12" color="#10b981" label="Conv. Ctr" />
                             <MiniZone className="top-[10%] right-[5%] w-12 h-12 !rounded-full" color="#10b981" label="Mosque" />
                             <MiniZone className="top-[20%] left-[32%] w-14 h-12" color="#4f46e5" label="T1-HQ" />

                             <MiniZone className="bottom-[5%] left-[5%] w-16 h-10 !bg-slate-800" color="#1e293b" label="Guard A" />

                            {/* Navigation Button */}
                            <div className="absolute top-3 right-3 z-40">
                                <button 
                                    onClick={() => setActiveTab('maps')}
                                    className="p-1.5 bg-white text-blue-600 rounded-lg shadow-md hover:bg-blue-50 transition-transform hover:scale-105"
                                    title="View Full Map"
                                >
                                    <Maximize2 size={16} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col">
                            {/* Grid */}
                            <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-0.5 bg-slate-950">
                                {currentCctvFeeds.map((cam) => (
                                    <div key={cam.id} className="relative group/cam overflow-hidden bg-black">
                                        <img src={cam.img} alt={cam.name} className="w-full h-full object-cover opacity-70 group-hover/cam:opacity-90 transition-opacity" />
                                        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                                            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                                            <span className="text-[9px] font-bold tracking-wider bg-black/60 px-1.5 py-0.5 rounded text-red-400 border border-red-900/50">LIVE</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Pagination Controls */}
                            <div className="h-10 bg-slate-800 border-t border-slate-700 flex items-center justify-between px-4">
                                <span className="text-xs text-slate-400">Page {cctvPage + 1}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => setCctvPage(Math.max(0, cctvPage - 1))} className="p-1 rounded bg-slate-700 text-slate-300"><ChevronLeft size={14}/></button>
                                    <button onClick={() => setCctvPage(Math.min(1, cctvPage + 1))} className="p-1 rounded bg-slate-700 text-slate-300"><ChevronRight size={14}/></button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
