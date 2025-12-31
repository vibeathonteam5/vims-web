import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px]">
        
        {/* Left Side - Image/Branding */}
        <div className="w-full md:w-1/2 bg-slate-900 relative flex flex-col justify-between p-12 text-white">
          <div className="absolute inset-0 opacity-20 bg-[url('https://picsum.photos/800/1200')] bg-cover bg-center"></div>
          <div className="relative z-10">
             <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-900/50">
                <ShieldCheck size={28} />
             </div>
             <h1 className="text-4xl font-bold leading-tight mb-2">Visitor Integrated Management System</h1>
             <p className="text-slate-400 text-lg">Auxiliary Police Unit</p>
          </div>
          
          <div className="relative z-10">
             <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 mb-4">
                <p className="text-sm font-medium">"Ensuring safety and streamlined access for a secure environment."</p>
             </div>
             <p className="text-xs text-slate-500">© 2024 VIMS Security. All rights reserved.</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-white relative">
           <div className="max-w-xs mx-auto w-full">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome Back</h2>
              <p className="text-slate-500 mb-8 text-sm">Please enter your credentials to access the dashboard.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                 <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Officer ID</label>
                    <div className="relative">
                        <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          placeholder="APD-001"
                          required
                        />
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl py-3 pl-12 pr-12 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          placeholder="••••••••"
                          required
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                        >
                           {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                        </button>
                    </div>
                 </div>

                 <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                       <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                       Remember me
                    </label>
                    <a href="#" className="text-blue-600 font-medium hover:underline">Forgot password?</a>
                 </div>

                 <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                 >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Sign In <ShieldCheck size={18} />
                      </>
                    )}
                 </button>
              </form>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Login;