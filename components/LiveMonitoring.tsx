import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, MapPin, Clock, 
  Shield, User, Briefcase, Star, Download,
  ArrowRight, AlertCircle, Ban, Timer, X, Calendar, Building,
  ScanLine, Truck, Users, AlertTriangle, EyeOff, Car, PlusCircle,
  Edit, Trash2, FileText
} from 'lucide-react';
import { VisitorLog, UserType, AccessStatus } from '../types';
import { fetchAccessLogs, createAccessLog } from '../services/supabaseService';
import { supabase } from '../lib/supabaseClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const LiveMonitoring: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  
  // Modal States
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryName, setEntryName] = useState(''); // Simplified: In real app, search user first
  const [entryPurpose, setEntryPurpose] = useState('');
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<VisitorLog | null>(null);
  const [extendHours, setExtendHours] = useState(0);
  const [extendMinutes, setExtendMinutes] = useState(0);
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const loadLogs = async () => {
    const data = await fetchAccessLogs(20);
    // Map DB columns to frontend properties to ensure status tallies with DB
    const mappedData = data.map((log: any) => ({
      ...log,
      id: log.id || log.id_logs,
      status: log.access_status || log.status,
      timestamp: log.entry_timestamp || log.timestamp
    }));
    setLogs(mappedData);
  };

  const handleExport = (type: 'csv' | 'pdf') => {
    if (type === 'csv') {
      const headers = ['Name', 'Role', 'Company', 'Purpose', 'Location', 'Entry Time', 'Status'];
      const csvContent = [
        headers.join(','),
        ...logs.map(log =>
          [
            `"${log.name}"`,
            log.type,
            `"${log.company || ''}"`,
            `"${log.purpose || ''}"`,
            `"${log.location}"`,
            new Date(log.timestamp).toLocaleString(),
            log.status
          ].join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `visitor_logs_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } else {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [['Name', 'Role', 'Company', 'Purpose', 'Location', 'Entry Time', 'Status']],
        body: logs.map(log => [
          log.name,
          log.type,
          log.company || '',
          log.purpose || '',
          log.location,
          new Date(log.timestamp).toLocaleString(),
          log.status
        ]),
      });
      doc.save(`visitor_logs_${new Date().toISOString().split('T')[0]}.pdf`);
    }
    setShowExportOptions(false);
  };

  const handleExtend = (log: VisitorLog) => {
    setSelectedLog(log);
    setExtendHours(0);
    setExtendMinutes(0);
    setIsExtendModalOpen(true);
  };

  const handleRevoke = (log: VisitorLog) => {
    setSelectedLog(log);
    setIsRevokeModalOpen(true);
  };

  const handleExtendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLog) {
      try {
        const currentEntry = new Date(selectedLog.timestamp);
        const addedMilliseconds = (extendHours * 60 * 60 * 1000) + (extendMinutes * 60 * 1000);
        const newEntryTime = new Date(currentEntry.getTime() + addedMilliseconds).toISOString();

        const { data, error } = await supabase
          .from('access_logs')
          .update({ entry_timestamp: newEntryTime })
          .eq('id_logs', selectedLog.id)
          .neq('access_status', AccessStatus.REVOKED)
          .neq('access_status', AccessStatus.DENIED)
          .select();

        if (error) throw error;

        if (!data || data.length === 0) {
          alert('Cannot extend time: User access is revoked or denied.');
          setIsExtendModalOpen(false);
          loadLogs(); // Refresh to sync status
          return;
        }

        // Optimistic update: Update local state immediately
        setLogs(prev => prev.map(log => 
          log.id === selectedLog.id ? { ...log, timestamp: newEntryTime } : log
        ));

        await loadLogs();
      } catch (error) {
        console.error('Error extending time:', error);
        alert('Failed to extend time');
      }
    }
    setIsExtendModalOpen(false);
    setSelectedLog(null);
  };

  const handleRevokeConfirm = async () => {
    if (selectedLog) {
      try {
        const { data, error } = await supabase
          .from('access_logs')
          .update({ access_status: AccessStatus.REVOKED })
          .eq('id_logs', selectedLog.id)
          .select();

        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error('Update failed: No records modified. Check RLS policies or permissions.');
        }

        // Optimistic update: Update local state immediately
        setLogs(prev => prev.map(log => 
          log.id === selectedLog.id ? { ...log, status: AccessStatus.REVOKED } : log
        ));

        await loadLogs();
      } catch (error) {
        console.error('Error revoking access:', error);
        alert('Failed to revoke access');
      }
    }
    setIsRevokeModalOpen(false);
    setSelectedLog(null);
  };

  const handleReinstate = async (log: VisitorLog) => {
    try {
      const { data, error } = await supabase
        .from('access_logs')
        .update({ access_status: AccessStatus.CHECKED_IN })
        .eq('id_logs', log.id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Update failed: No records modified. Check RLS policies or permissions.');
      }

      // Optimistic update: Update local state immediately
      setLogs(prev => prev.map(l => 
        l.id === log.id ? { ...l, status: AccessStatus.CHECKED_IN } : l
      ));

      await loadLogs();
    } catch (error) {
      console.error('Error reinstating access:', error);
      alert('Failed to reinstate access');
    }
  };

  const calculateRemainingTime = (log: VisitorLog) => {
    if (log.exit_timestamp || log.status === AccessStatus.REVOKED || log.status === AccessStatus.DENIED) {
      return 'Expired';
    }
    const entryTime = new Date(log.timestamp);
    const now = new Date();
    const diffMs = now.getTime() - entryTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const remainingHours = 8 - diffHours; // Assume 8 hour access
    if (remainingHours <= 0) return 'Expired';
    const hours = Math.floor(remainingHours);
    const minutes = Math.floor((remainingHours - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  const getRoleIcon = (type: UserType) => {
    switch (type) {
      case UserType.STAFF: return <Shield size={14} className="text-blue-600" />;
      case UserType.VISITOR: return <User size={14} className="text-green-600" />;
      case UserType.CONTRACTOR: return <Briefcase size={14} className="text-orange-600" />;
      case UserType.VIP: return <Star size={14} className="text-purple-600" />;
      default: return <User size={14} className="text-slate-600" />;
    }
  };

  const getStatusColor = (status: AccessStatus | string) => {
    switch (status) {
      case AccessStatus.CHECKED_IN: 
      case 'Checked In':
        return 'bg-green-100 text-green-700 border-green-200';
      case AccessStatus.CHECKED_OUT: 
      case 'Checked Out':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      case AccessStatus.DENIED: 
      case AccessStatus.REVOKED:
        return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || log.type === filterType || 
                        (filterType === 'On-Site' && (log.status === AccessStatus.CHECKED_IN || log.status === 'Checked In'));
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 relative">
      
      {/* Extend Access Modal */}
      {isExtendModalOpen && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
             <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
                <h3 className="font-bold text-lg flex items-center gap-2"><Timer size={20}/> Extend Access</h3>
                <button onClick={() => setIsExtendModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={18}/></button>
             </div>
             <div className="p-6">
                 <p className="text-sm text-slate-600 mb-4">Extend access time for <strong>{selectedLog.name}</strong></p>
                 <form onSubmit={handleExtendSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Hours</label>
                          <input 
                            type="number" 
                            min="0" 
                            max="24" 
                            value={extendHours} 
                            onChange={(e) => setExtendHours(parseInt(e.target.value) || 0)} 
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm" 
                            placeholder="0"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Minutes</label>
                          <input 
                            type="number" 
                            min="0" 
                            max="59" 
                            value={extendMinutes} 
                            onChange={(e) => setExtendMinutes(parseInt(e.target.value) || 0)} 
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm" 
                            placeholder="0"
                          />
                      </div>
                    </div>
                    <div className="pt-4 flex gap-3 border-t border-slate-100 mt-4">
                        <button type="button" onClick={() => setIsExtendModalOpen(false)} className="flex-1 py-2 border border-slate-300 rounded-xl text-slate-600 font-medium hover:bg-slate-50">Cancel</button>
                        <button type="submit" className="flex-1 py-2 bg-indigo-600 rounded-xl text-white font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200">Extend</button>
                    </div>
                 </form>
             </div>
          </div>
        </div>
      )}

      {/* Revoke Access Modal */}
      {isRevokeModalOpen && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
             <div className="bg-red-600 px-6 py-4 flex justify-between items-center text-white">
                <h3 className="font-bold text-lg flex items-center gap-2"><Ban size={20}/> Revoke Access</h3>
                <button onClick={() => setIsRevokeModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={18}/></button>
             </div>
             <div className="p-6">
                 <p className="text-sm text-slate-600 mb-4">Are you sure you want to revoke access for <strong>{selectedLog.name}</strong>? This will mark them as revoked immediately.</p>
                 <div className="pt-4 flex gap-3 border-t border-slate-100 mt-4">
                    <button onClick={() => setIsRevokeModalOpen(false)} className="flex-1 py-2 border border-slate-300 rounded-xl text-slate-600 font-medium hover:bg-slate-50">Cancel</button>
                    <button onClick={handleRevokeConfirm} className="flex-1 py-2 bg-red-600 rounded-xl text-white font-medium hover:bg-red-700 shadow-lg shadow-red-200">Revoke Access</button>
                 </div>
             </div>
          </div>
        </div>
      )}

      {/* Header Area */}
      <div className="bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Live Monitoring</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time access logs and user movements.</p>
        </div>
        <div className="flex gap-3 relative">
           <div className="relative">
             <button 
                  onClick={() => setShowExportOptions(!showExportOptions)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-xl text-white text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors"
             >
                  <Download size={16} /> Export Logs
             </button>
             {showExportOptions && (
               <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                 <button 
                   onClick={() => handleExport('csv')}
                   className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                 >
                   <FileText size={14} /> Export as CSV
                 </button>
                 <button 
                   onClick={() => handleExport('pdf')}
                   className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-50"
                 >
                   <FileText size={14} /> Export as PDF
                 </button>
               </div>
             )}
           </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-8 py-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, company, plate..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 pl-12 pr-4 py-3 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
            />
        </div>

        {/* Quick Filters */}
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          {['All', 'On-Site', UserType.STAFF, UserType.VISITOR, UserType.TRANSIENT, UserType.VIP].map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterType(filter)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                filterType === filter 
                  ? 'bg-slate-800 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Table */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-left">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Purpose</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Entry Time</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Remaining Duration</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                    <tr key={log.id} className={`group transition-colors ${log.isSuspicious ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-50'}`}>
                      {/* User Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img src={log.avatarUrl} alt="" className={`w-10 h-10 rounded-full object-cover border-2 ${log.isSuspicious ? 'border-red-400' : 'border-slate-100'}`} />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{log.name}</p>
                            <p className="text-xs text-slate-500">ID: #{log.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-slate-100 rounded-full">
                            {getRoleIcon(log.type)}
                          </div>
                          <span className="text-sm text-slate-700 font-medium">{log.type}</span>
                        </div>
                      </td>

                      {/* Company Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                         <span className="text-sm text-slate-600">{log.company || 'N/A'}</span>
                      </td>

                      {/* Purpose Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600">{log.purpose || 'N/A'}</span>
                      </td>

                      {/* Location Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center gap-2 text-sm text-slate-800 font-medium">
                               <MapPin size={14} className="text-blue-500" />
                               {log.location}
                         </div>
                      </td>

                      {/* Time Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock size={14} className="text-slate-400" />
                            {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </div>
                      </td>

                      {/* Remaining Duration Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                         <span className="text-sm text-slate-600">{calculateRemainingTime(log)}</span>
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(log.status)}`}>
                          {(log.status === AccessStatus.DENIED || log.status === AccessStatus.REVOKED) && <AlertCircle size={12} />}
                          {log.status}
                        </span>
                      </td>

                      {/* Action Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {(log.status === AccessStatus.CHECKED_IN || log.status === 'Checked In') && (
                            <button 
                              onClick={() => handleExtend(log)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 flex items-center gap-1"
                            >
                              <Edit size={12} /> Extend
                            </button>
                          )}
                          {(log.status === AccessStatus.DENIED || log.status === AccessStatus.REVOKED) ? (
                            <button 
                              onClick={() => handleReinstate(log)}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 flex items-center gap-1"
                            >
                              <PlusCircle size={12} /> Reinstate
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleRevoke(log)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 flex items-center gap-1"
                            >
                              <Trash2 size={12} /> Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitoring;
