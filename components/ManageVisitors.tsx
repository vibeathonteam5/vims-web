import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Filter, 
  User, Shield, Briefcase, Ban, Edit, 
  CheckCircle, AlertOctagon, FileText,
  Mail, Phone, Truck, X
} from 'lucide-react';
import { UserType, UserProfile } from '../types';
import { fetchUsers, updateUserStatus, createUser } from '../services/supabaseService';

const ManageVisitors: React.FC = () => {
  const [visitors, setVisitors] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBlacklistModalOpen, setIsBlacklistModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<UserProfile | null>(null);
  const [blacklistReason, setBlacklistReason] = useState('');

  // Initial Load
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await fetchUsers();
    setVisitors(data);
    setLoading(false);
  };

  // --- Actions ---

  const handleEdit = (visitor: UserProfile) => {
    setSelectedVisitor(visitor);
    setIsEditModalOpen(true);
  };

  const handleBlacklist = (visitor: UserProfile) => {
    setSelectedVisitor(visitor);
    setBlacklistReason(visitor.blacklist_reason || '');
    setIsBlacklistModalOpen(true);
  };

  const confirmBlacklist = async () => {
      if (selectedVisitor) {
          const newStatus = selectedVisitor.status === 'Blacklisted' ? 'Active' : 'Blacklisted';
          await updateUserStatus(parseInt(selectedVisitor.id), newStatus, blacklistReason);
          await loadUsers(); // Refresh
          setIsBlacklistModalOpen(false);
      }
  };

  const filteredVisitors = visitors.filter(v => {
      const matchesSearch = v.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (v.company && v.company.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filterType === 'All' 
                            ? true 
                            : filterType === 'Blacklisted' 
                                ? v.status === 'Blacklisted'
                                : v.user_type === filterType;
      return matchesSearch && matchesFilter;
  });

  const getRoleBadge = (type: UserType) => {
      let colorClass = 'bg-slate-100 text-slate-600';
      if (type === UserType.STAFF) colorClass = 'bg-blue-100 text-blue-700';
      if (type === UserType.VISITOR) colorClass = 'bg-green-100 text-green-700';
      if (type === UserType.CONTRACTOR) colorClass = 'bg-orange-100 text-orange-700';
      if (type === UserType.VIP) colorClass = 'bg-purple-100 text-purple-700';

      return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${colorClass}`}>{type}</span>;
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 relative">
      
      {/* Blacklist Modal */}
      {isBlacklistModalOpen && selectedVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
              <div className={`px-6 py-4 flex justify-between items-center text-white ${selectedVisitor.status === 'Blacklisted' ? 'bg-green-600' : 'bg-red-600'}`}>
                 <h3 className="font-bold text-lg flex items-center gap-2">
                     {selectedVisitor.status === 'Blacklisted' ? <CheckCircle size={20}/> : <AlertOctagon size={20}/>} 
                     {selectedVisitor.status === 'Blacklisted' ? 'Reinstate Access' : 'Blacklist User'}
                 </h3>
                 <button onClick={() => setIsBlacklistModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={18}/></button>
              </div>
              <div className="p-6">
                  {selectedVisitor.status === 'Blacklisted' ? (
                      <div>
                          <p className="text-slate-600 mb-4">Are you sure you want to reinstate access for <span className="font-bold">{selectedVisitor.full_name}</span>?</p>
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 text-sm text-slate-500">
                              <span className="font-semibold block mb-1">Previous Reason:</span>
                              {selectedVisitor.blacklist_reason}
                          </div>
                      </div>
                  ) : (
                      <div>
                          <p className="text-slate-600 mb-4">You are about to blacklist <span className="font-bold">{selectedVisitor.full_name}</span>. This will deny all future entry attempts.</p>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Reason for Blacklisting</label>
                          <textarea 
                            value={blacklistReason} 
                            onChange={(e) => setBlacklistReason(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-3 text-sm h-24 resize-none"
                            placeholder="e.g. Repeated security violations, aggressive behavior..."
                          ></textarea>
                      </div>
                  )}
                  
                  <div className="flex gap-3 mt-6">
                      <button onClick={() => setIsBlacklistModalOpen(false)} className="flex-1 py-2 border border-slate-300 rounded-xl text-slate-600 font-medium hover:bg-slate-50">Cancel</button>
                      <button onClick={confirmBlacklist} className={`flex-1 py-2 rounded-xl text-white font-medium shadow-lg transition-colors ${selectedVisitor.status === 'Blacklisted' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}>
                          {selectedVisitor.status === 'Blacklisted' ? 'Reinstate User' : 'Confirm Blacklist'}
                      </button>
                  </div>
              </div>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Visitors</h1>
          <p className="text-sm text-slate-500 mt-1">Database of registered staff, visitors, and contractors.</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-xl text-white text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors">
                <Plus size={18} /> Add New User
           </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-8 py-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, IC, or company..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 pl-12 pr-4 py-3 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
            />
        </div>

        {/* Quick Filters */}
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          {['All', UserType.VISITOR, UserType.CONTRACTOR, 'Blacklisted'].map((filter) => (
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

      {/* List Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
         {loading ? (
             <div className="flex justify-center items-center h-40 text-slate-400">Loading user data...</div>
         ) : filteredVisitors.length === 0 ? (
             <div className="flex justify-center items-center h-40 text-slate-400">No users found.</div>
         ) : (
         <div className="grid grid-cols-1 gap-4">
             {filteredVisitors.map(visitor => {
                 const isBlacklisted = visitor.status === 'Blacklisted';
                 return (
                 <div key={visitor.id} className={`bg-white rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md flex items-center gap-6 ${isBlacklisted ? 'border-red-200 bg-red-50/50' : 'border-slate-200'}`}>
                     
                     {/* Avatar & Basic Info */}
                     <div className="flex items-center gap-4 min-w-[250px]">
                         <div className="relative">
                             <img src={visitor.avatar_url || 'https://via.placeholder.com/50'} className={`w-14 h-14 rounded-full object-cover border-2 ${isBlacklisted ? 'border-red-400 grayscale' : 'border-slate-100'}`} />
                             {isBlacklisted && <div className="absolute -top-1 -right-1 bg-red-600 text-white p-1 rounded-full border-2 border-white"><Ban size={12}/></div>}
                         </div>
                         <div>
                             <h3 className={`font-bold text-slate-800 ${isBlacklisted ? 'line-through text-slate-500' : ''}`}>{visitor.full_name}</h3>
                             <p className="text-xs text-slate-500 font-mono">ID: {visitor.id}</p>
                         </div>
                     </div>

                     {/* Role & Company */}
                     <div className="w-[200px]">
                         <div className="mb-1">{getRoleBadge(visitor.user_type)}</div>
                         <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                             <Briefcase size={14} className="text-slate-400"/> {visitor.company || 'N/A'}
                         </div>
                     </div>

                     {/* Contact Info */}
                     <div className="flex-1 space-y-1">
                         <div className="flex items-center gap-2 text-xs text-slate-500">
                             <Phone size={12} /> {visitor.phone || '-'}
                         </div>
                         <div className="flex items-center gap-2 text-xs text-slate-500">
                             <Mail size={12} /> {visitor.email || '-'}
                         </div>
                     </div>

                     {/* Status / Access Info */}
                     <div className="w-[180px] text-right pr-4 border-r border-slate-100">
                         {isBlacklisted ? (
                             <div>
                                 <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                                     <Ban size={12}/> BLACKLISTED
                                 </span>
                                 <p className="text-[10px] text-red-400 mt-1 italic max-w-[150px] truncate ml-auto">Reason: {visitor.blacklist_reason}</p>
                             </div>
                         ) : (
                             <div>
                                 <p className="text-xs text-slate-400 mb-1">Access Status</p>
                                 <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                                     <CheckCircle size={12}/> ACTIVE
                                 </span>
                             </div>
                         )}
                     </div>

                     {/* Actions */}
                     <div className="flex items-center gap-2">
                         <button 
                            onClick={() => handleBlacklist(visitor)}
                            className={`p-2 rounded-lg transition-colors ${isBlacklisted ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`} 
                            title={isBlacklisted ? "Reinstate Access" : "Blacklist User"}
                         >
                             {isBlacklisted ? <Shield size={18} /> : <Ban size={18} />}
                         </button>
                     </div>
                 </div>
             )})}
         </div>
         )}
      </div>
    </div>
  );
};

export default ManageVisitors;
