import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, QrCode, PlusCircle, X } from 'lucide-react';
import QRCode from 'qrcode';
import { Session } from '../types';
import { fetchSessions, createSession } from '../services/supabaseService';

const Sessions: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    eventName: '',
    venue: '',
    participants: '',
    sessionDate: ''
  });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    const data = await fetchSessions();
    setSessions(data);
    setLoading(false);
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    // Generate QR code
    const qrData = JSON.stringify({
      sessionId: Date.now().toString(),
      eventName: formData.eventName,
      venue: formData.venue,
      date: formData.sessionDate
    });
    const qrUrl = await QRCode.toDataURL(qrData);

    // Create session in database
    const { data, error } = await createSession({
      host_id: 1, // Assume current user is host with ID 1
      event_name: formData.eventName,
      venue: formData.venue,
      participants: formData.participants,
      qr_code: qrUrl,
      session_date: formData.sessionDate
    });

    if (!error) {
      setQrCodeUrl(qrUrl);
      setIsCreateModalOpen(false);
      setIsQrModalOpen(true); // Show QR modal
      setFormData({ eventName: '', venue: '', participants: '', sessionDate: '' });
      await loadSessions(); // Refresh the list
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Session Management</h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage event sessions.</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-xl text-white text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200"
        >
          <PlusCircle size={16} /> Create Session
        </button>
      </div>

      {/* Create Session Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center gap-2"><Calendar size={20} /> Create Session</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={18} /></button>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Event Name</label>
                  <input
                    required
                    type="text"
                    value={formData.eventName}
                    onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                    placeholder="e.g. Corporate Meeting"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Venue</label>
                  <input
                    required
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                    placeholder="e.g. Convention Centre"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Participants (comma-separated emails)</label>
                  <textarea
                    value={formData.participants}
                    onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                    rows={3}
                    placeholder="user1@example.com, user2@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Session Date & Time</label>
                  <input
                    required
                    type="datetime-local"
                    value={formData.sessionDate}
                    onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                  />
                </div>
                <div className="pt-4 flex gap-3 border-t border-slate-100 mt-4">
                  <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-2 border border-slate-300 rounded-xl text-slate-600 font-medium hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="flex-1 py-2 bg-indigo-600 rounded-xl text-white font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200">Create Session</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="bg-green-600 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center gap-2"><QrCode size={20} /> Session QR Code</h3>
              <button onClick={() => setIsQrModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={18} /></button>
            </div>
            <div className="p-6 text-center">
              <p className="text-sm text-slate-600 mb-4">Share this QR code with participants for pre-registration.</p>
              <img src={qrCodeUrl} alt="QR Code" className="mx-auto mb-4" />
              <button 
                onClick={() => setIsQrModalOpen(false)}
                className="px-4 py-2 bg-green-600 rounded-xl text-white font-medium hover:bg-green-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-500">Loading sessions...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">
                <Calendar size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No Sessions Created</h3>
                <p className="text-slate-500">Create your first event session to get started.</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div key={session.session_id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">{session.event_name}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          {session.venue}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(session.session_date).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setQrCodeUrl(session.qr_code || '');
                          setIsQrModalOpen(true);
                        }}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 flex items-center gap-1"
                      >
                        <QrCode size={14} /> View QR
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    <strong>Participants:</strong> {session.participants || 'None specified'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sessions;