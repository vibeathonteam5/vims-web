import React, { useState } from 'react';
import { 
  Shield, X, Search, Filter, ZoomIn, ZoomOut, Compass
} from 'lucide-react';
import { VisitorLog, UserType, AccessStatus } from '../types';

// Mock data for the map view
const mapLogs: VisitorLog[] = [
  { id: '1', profile_id: 'mp-1', name: 'Officer Henry', type: UserType.STAFF, location: 'Guard House A', timestamp: '', status: AccessStatus.CHECKED_IN, avatarUrl: 'https://picsum.photos/100/100', vehiclePlate: 'WB 1234' },
  { id: '2', profile_id: 'mp-2', name: 'Sarah Connor', type: UserType.VISITOR, location: 'Tower 1', timestamp: '', status: AccessStatus.CHECKED_IN, avatarUrl: 'https://picsum.photos/101/101', company: 'Tech Corp' },
  { id: '3', profile_id: 'mp-3', name: 'Mike Ross', type: UserType.CONTRACTOR, location: 'Tower 2', timestamp: '', status: AccessStatus.CHECKED_IN, avatarUrl: 'https://picsum.photos/102/102', company: 'FixIt' },
  { id: '4', profile_id: 'mp-4', name: 'Ali Baba', type: UserType.DELIVERY, location: 'Guard House B', timestamp: '', status: AccessStatus.CHECKED_IN, avatarUrl: 'https://picsum.photos/103/103', vehiclePlate: 'JJU 8888' },
  { id: '5', profile_id: 'mp-5', name: 'VIP Guest', type: UserType.VIP, location: 'Convention Ctr', timestamp: '', status: AccessStatus.CHECKED_IN, avatarUrl: 'https://picsum.photos/104/104', isVipPrivacy: true },
  { id: '6', profile_id: 'mp-6', name: 'Staff A', type: UserType.STAFF, location: 'Tower 3', timestamp: '', status: AccessStatus.CHECKED_IN, avatarUrl: 'https://picsum.photos/105/105' },
  { id: '7', profile_id: 'mp-7', name: 'Public User', type: UserType.TRANSIENT, location: 'Mosque', timestamp: '', status: AccessStatus.CHECKED_IN, avatarUrl: 'https://picsum.photos/106/106' },
  { id: '8', profile_id: 'mp-8', name: 'Coach Ted', type: UserType.TRANSIENT, location: 'Sports Field', timestamp: '', status: AccessStatus.CHECKED_IN, avatarUrl: 'https://picsum.photos/107/107' },
];

const PremiseMap: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  // Helper to filter logs by zone match
  const getUsersInZone = (zoneName: string) => {
    return mapLogs.filter(log => log.location.includes(zoneName));
  };

  const getRoleColor = (type: UserType) => {
    switch (type) {
      case UserType.STAFF: return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]';
      case UserType.VISITOR: return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]';
      case UserType.VIP: return 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]';
      case UserType.CONTRACTOR: return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]';
      default: return 'bg-slate-500';
    }
  };

  // Reusable Building Footprint Component (The white floorplan look)
  const BuildingFootprint = () => (
    <div className="w-full h-full bg-white opacity-90 relative overflow-hidden flex flex-col border border-slate-300">
        <div className="flex-1 flex border-b border-slate-200">
            <div className="flex-1 border-r border-slate-200 bg-slate-50"></div>
            <div className="flex-[2] flex flex-col">
                <div className="flex-1 border-b border-slate-200"></div>
                <div className="flex-1 flex">
                     <div className="flex-1 border-r border-slate-200"></div>
                     <div className="flex-1"></div>
                </div>
            </div>
            <div className="flex-1 border-l border-slate-200 bg-slate-50"></div>
        </div>
        <div className="h-[30%] flex justify-center items-end pb-1">
             <div className="w-[40%] h-[80%] border-t border-x border-slate-300"></div>
        </div>
    </div>
  );

  const ZoneMarker: React.FC<{ 
    name: string; 
    className: string; 
    type: 'guard' | 'tower' | 'common' | 'field';
    label: string;
    rotation?: string;
  }> = ({ name, className, type, label, rotation = '0deg' }) => {
    const users = getUsersInZone(name);
    const isSelected = selectedZone === name;

    // Base container styles
    let containerStyle = "";
    let labelStyle = "";
    
    if (type === 'guard') {
        containerStyle = "bg-slate-800 rounded-xl shadow-2xl border border-slate-600";
        labelStyle = "text-white text-xs font-bold px-3 py-2 bg-slate-900/50 w-full rounded-t-xl border-b border-slate-700 flex items-center justify-between";
    } else if (type === 'tower') {
        containerStyle = "bg-indigo-600 rounded-xl shadow-xl border-b-4 border-indigo-800 transition-transform hover:-translate-y-1";
        labelStyle = "text-white text-[10px] font-bold px-2 py-1 bg-indigo-700 rounded-t-xl flex justify-between items-center";
    } else if (type === 'common') {
        containerStyle = "bg-emerald-500 rounded-full shadow-xl border-4 border-emerald-400/50 flex items-center justify-center p-4 transition-transform hover:scale-105";
        labelStyle = "absolute -top-6 text-emerald-800 font-bold text-sm bg-white/80 px-2 py-0.5 rounded backdrop-blur-sm shadow-sm";
    } else if (type === 'field') {
        containerStyle = "bg-emerald-600 rounded-lg shadow-inner border border-emerald-500 p-2";
        labelStyle = "text-white text-xs font-bold mb-1 opacity-80";
    }

    return (
      <button 
        onClick={() => setSelectedZone(name)}
        style={{ transform: `rotate(${rotation})` }}
        className={`absolute group cursor-pointer transition-all duration-300 z-20 ${className} ${containerStyle} ${isSelected ? 'ring-4 ring-yellow-400 scale-105 z-30' : ''}`}
      >
        {/* Structure Content */}
        {type === 'tower' && (
            <div className="w-full h-full flex flex-col p-1">
                <div className={labelStyle}>
                    {label}
                    <span className="bg-indigo-400 text-indigo-900 text-[8px] px-1 rounded">1</span>
                </div>
                <div className="flex-1 bg-indigo-500/50 p-1 rounded-b-lg relative">
                    <BuildingFootprint />
                    {/* Dots on Tower */}
                    <div className="absolute inset-0 flex items-end justify-start p-2 gap-1">
                        {users.map((u, i) => (
                            <div key={i} className={`w-2.5 h-2.5 rounded-full border border-white ${getRoleColor(u.type)}`} />
                        ))}
                    </div>
                </div>
            </div>
        )}

        {type === 'guard' && (
            <div className="w-full h-full flex flex-col relative">
                <div className={labelStyle}>
                    <div className="flex items-center gap-2">
                        <Shield size={12} className="text-yellow-400" />
                        {label}
                    </div>
                    <span className="bg-slate-700 px-1.5 rounded text-[10px]">1</span>
                </div>
                <div className="flex-1 p-3 flex flex-col gap-2">
                     {/* Legend-like list inside Guard House card */}
                     <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[10px] text-slate-300">
                             <div className="w-2 h-2 rounded-full bg-blue-500"></div> Staff
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-300">
                             <div className="w-2 h-2 rounded-full bg-orange-500"></div> Contractor
                        </div>
                     </div>
                     {/* Active Users Badge */}
                     {users.length > 0 && (
                         <div className="mt-auto flex items-center gap-1 bg-slate-700/50 p-1.5 rounded text-xs text-white">
                             <div className="flex -space-x-1.5">
                                {users.slice(0,3).map(u => <img key={u.id} src={u.avatarUrl} className="w-4 h-4 rounded-full border border-slate-800"/>)}
                             </div>
                             <span className="ml-1">+{users.length} Active</span>
                         </div>
                     )}
                </div>
            </div>
        )}

        {type === 'common' && (
            <>
                <div className={labelStyle}>{label}</div>
                <div className="w-full h-full bg-white opacity-90 rounded-sm relative overflow-hidden border border-slate-200">
                     {/* Simplified Footprint for common areas */}
                     <div className="absolute inset-2 border border-slate-300"></div>
                     <div className="absolute top-0 bottom-0 left-1/2 border-l border-slate-300"></div>
                </div>
                 {users.length > 0 && (
                    <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center border-2 border-emerald-500 shadow-sm z-10">
                        {users.length}
                    </div>
                )}
            </>
        )}

        {type === 'field' && (
             <div className="w-full h-full relative">
                <div className={labelStyle}>{label}</div>
                <div className="w-full h-[80%] bg-emerald-500/30 border-2 border-white/40 rounded flex items-center justify-center">
                    <div className="w-16 h-16 border-2 border-white/40 rounded-full"></div>
                    <div className="absolute w-full h-[1px] bg-white/40"></div>
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                     {users.map((u, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${getRoleColor(u.type)}`} />
                    ))}
                </div>
             </div>
        )}

      </button>
    );
  };

  const ParkingArea = ({ className, label = "P" }: { className: string, label?: string }) => (
      <div className={`absolute bg-slate-500 rounded border-2 border-dashed border-slate-400 flex items-center justify-center text-slate-300 font-bold text-xl ${className}`}>
          {label}
          {/* Parking Lines Pattern */}
          <div className="absolute inset-0 flex flex-col justify-between py-2 px-1 opacity-20">
             <div className="border-b border-white"></div>
             <div className="border-b border-white"></div>
             <div className="border-b border-white"></div>
             <div className="border-b border-white"></div>
          </div>
      </div>
  );

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 relative">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between flex-shrink-0 z-40 relative shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Premise Map</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time geospatial view of staff and visitors.</p>
        </div>
        <div className="flex gap-4">
           {/* Legend */}
           <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 flex items-center gap-4 text-xs font-medium text-slate-600 shadow-sm">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></div>Staff</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm"></div>Visitor</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm"></div>Contractor</div>
           </div>
           
           <div className="flex gap-2">
               <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"><ZoomIn size={18}/></button>
               <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"><ZoomOut size={18}/></button>
           </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative bg-[#F1F5F9]">
        
        {/* --- MAP CANVAS --- */}
        <div className="flex-1 relative overflow-hidden transform-gpu select-none cursor-grab active:cursor-grabbing">
            
            {/* Background Texture (Dot Grid) */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* --- ROADS INFRASTRUCTURE --- */}
            {/* Styles for roads: Dark Grey bg, White Dashed markings */}
            
            {/* 1. Main Vertical Road (Left) */}
            <div className="absolute left-[20%] top-0 bottom-[20%] w-24 bg-[#334155] border-x-4 border-dashed border-white/20 shadow-lg z-10 flex flex-col justify-center items-center">
                 <div className="h-full w-0 border-r-2 border-dashed border-yellow-500/40"></div>
                 {/* Arrows */}
                 <div className="absolute top-10 text-white/30 text-2xl">↓</div>
                 <div className="absolute bottom-1/2 text-white/30 text-2xl">↑</div>
            </div>

            {/* 2. Main Horizontal Road (Bottom) */}
            <div className="absolute left-0 right-0 bottom-[20%] h-24 bg-[#334155] border-y-4 border-dashed border-white/20 shadow-lg z-10 flex items-center justify-center">
                 <div className="w-full h-0 border-b-2 border-dashed border-white/30"></div>
                 <div className="absolute left-10 text-white/30 text-2xl">←</div>
                 <div className="absolute right-10 text-white/30 text-2xl">→</div>
            </div>

            {/* 3. Vertical Road (Right - Connecting to Mosque) */}
            <div className="absolute right-[20%] top-[25%] bottom-[20%] w-20 bg-[#334155] border-x-4 border-dashed border-white/20 shadow-lg z-10">
                 <div className="absolute inset-y-0 left-1/2 border-l-2 border-dashed border-white/30"></div>
            </div>

            {/* 4. Curved Road (Top Right) */}
            <div className="absolute top-[25%] right-[20%] w-24 h-24 bg-[#334155] rounded-tr-[4rem] z-10"></div>
            <div className="absolute top-[25%] right-0 w-[20%] h-20 bg-[#334155] border-y-4 border-dashed border-white/20 z-10"></div>
            
            {/* Intersection Cover-ups (To make seamless) */}
            <div className="absolute left-[20%] bottom-[20%] w-24 h-24 bg-[#334155] z-10"></div>
            <div className="absolute right-[20%] bottom-[20%] w-20 h-24 bg-[#334155] z-10"></div>


            {/* --- ZONES & PARKING --- */}
            
            {/* Corporate Zone Container */}
            <div className="absolute top-[10%] left-[28%] w-[45%] h-[55%] bg-blue-50/50 rounded-[3rem] border-2 border-dashed border-indigo-200 z-0">
                <div className="absolute top-4 left-6 text-indigo-400 text-xs font-bold tracking-[0.2em]">CORPORATE ZONE</div>
            </div>

            {/* Parking Lots */}
            <ParkingArea className="top-[40%] left-[5%] w-[12%] h-[30%]" />
            <ParkingArea className="top-[5%] left-[45%] w-[20%] h-[12%]" />
            <ParkingArea className="top-[30%] right-[5%] w-[12%] h-[25%]" />
            <ParkingArea className="bottom-[2%] left-[40%] w-[15%] h-[15%]" />


            {/* --- BUILDINGS --- */}

            {/* Convention Centre (Top Left) */}
            <ZoneMarker 
              name="Convention Ctr" 
              label="Convention Ctr" 
              type="common" 
              className="top-[10%] left-[8%] w-48 h-48"
            />

            {/* Mosque (Top Right) */}
            <ZoneMarker 
              name="Mosque" 
              label="Mosque" 
              type="common" 
              className="top-[10%] right-[5%] w-40 h-40"
            />

            {/* Towers (Center) */}
            <ZoneMarker 
              name="Tower 1" 
              label="Tower 1 (HQ)" 
              type="tower" 
              className="top-[20%] left-[32%] w-44 h-40"
            />
            <ZoneMarker 
              name="Tower 2" 
              label="Tower 2" 
              type="tower" 
              className="top-[20%] left-[55%] w-36 h-36"
            />
            <ZoneMarker 
              name="Tower 3" 
              label="Tower 3" 
              type="tower" 
              className="top-[45%] left-[45%] w-36 h-32"
            />

            {/* Guard House A (Bottom Left) */}
            <ZoneMarker 
              name="Guard House A" 
              label="Guard House A (Main)" 
              type="guard" 
              className="bottom-[5%] left-[12%] w-48 h-32"
            />

            {/* Guard House B (Mid Right) */}
            <ZoneMarker 
              name="Guard House B" 
              label="Guard House B" 
              type="guard" 
              className="bottom-[25%] right-[5%] w-40 h-28"
            />

             {/* Sports Field (Bottom Right) */}
             <ZoneMarker 
              name="Sports Field" 
              label="Sports Field" 
              type="field" 
              className="bottom-[3%] right-[8%] w-56 h-40"
            />

        </div>

        {/* Sidebar Info Panel (Slide over) */}
        {selectedZone && (
           <div className="w-80 bg-white border-l border-slate-200 shadow-2xl overflow-y-auto animate-slide-in-right absolute right-0 top-0 bottom-0 z-50">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
                 <div>
                   <h3 className="font-bold text-lg text-slate-800">{selectedZone}</h3>
                   <p className="text-xs text-slate-500">Zone Details</p>
                 </div>
                 <button onClick={() => setSelectedZone(null)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full shadow-sm"><X size={20}/></button>
              </div>
              
              <div className="p-4">
                 <div className="flex items-center justify-between mb-4">
                     <h4 className="text-xs font-bold text-slate-400 uppercase">Active Personnel</h4>
                     <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{getUsersInZone(selectedZone).length}</span>
                 </div>
                 
                 <div className="space-y-3">
                    {getUsersInZone(selectedZone).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                             <Compass size={32} className="mb-2 opacity-50"/>
                             <p className="text-sm italic">Area is currently empty.</p>
                        </div>
                    ) : getUsersInZone(selectedZone).map(user => (
                        <div key={user.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                           <div className="relative">
                               <img src={user.avatarUrl} className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                               <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getRoleColor(user.type)}`}></div>
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{user.isVipPrivacy ? 'VIP Guest' : user.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">{user.type}</span>
                                {user.company && <span className="text-[10px] text-slate-400 truncate">{user.company}</span>}
                              </div>
                           </div>
                        </div>
                    ))}
                 </div>

                 <div className="mt-6 pt-6 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Facility Info</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">Status</span>
                            <span className="font-medium text-green-600 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Open</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">Occupancy</span>
                            <span className="font-medium text-slate-800">85%</span>
                        </div>
                         <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2">
                            <span className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">Security Level</span>
                            <div className="flex items-center gap-1">
                                <div className="h-1.5 flex-1 bg-green-500 rounded-full"></div>
                                <div className="h-1.5 flex-1 bg-green-500 rounded-full"></div>
                                <div className="h-1.5 flex-1 bg-slate-200 rounded-full"></div>
                            </div>
                            <span className="text-xs text-slate-500 mt-1 block">Level 2 - Standard</span>
                        </div>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default PremiseMap;