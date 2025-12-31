import React from 'react';
import { 
  Home, 
  Users, 
  ShieldCheck, 
  FileText, 
  Settings, 
  LogOut, 
  Activity,
  Map,
  CreditCard,
  Calendar
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: Home },
    { id: 'monitoring', label: 'Live Monitoring', icon: Activity },
    { id: 'visitors', label: 'Manage Visitors', icon: Users },
    { id: 'sessions', label: 'Session Management', icon: Calendar },
    { id: 'staff', label: 'Manage Staff', icon: ShieldCheck },
    { id: 'access', label: 'Access Control', icon: CreditCard },
    { id: 'maps', label: 'Premise Map', icon: Map },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 transition-all duration-300">
      {/* Logo Area */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <ShieldCheck size={20} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-wider">VIMS</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        <div className="mb-4">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 px-4">Main Menu</p>
          {menuItems.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 group ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </div>

        <div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 px-4">System</p>
          {menuItems.slice(4).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 group ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Log out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;