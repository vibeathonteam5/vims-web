import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LiveMonitoring from './components/LiveMonitoring';
import PremiseMap from './components/PremiseMap';
import ManageVisitors from './components/ManageVisitors';
import Sessions from './components/Sessions';
import { checkSupabaseConnection } from './lib/supabaseClient';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    checkSupabaseConnection();
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar 
        onLogout={handleLogout} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      {activeTab === 'dashboard' ? (
        <Dashboard setActiveTab={setActiveTab} />
      ) : activeTab === 'monitoring' ? (
        <LiveMonitoring />
      ) : activeTab === 'maps' ? (
        <PremiseMap />
      ) : activeTab === 'visitors' ? (
        <ManageVisitors />
      ) : activeTab === 'sessions' ? (
        <Sessions />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400">
           <div className="text-center">
             <h2 className="text-2xl font-bold mb-2">Module Under Development</h2>
             <p>This section is currently being built.</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;