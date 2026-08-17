import React, { useState } from 'react';
import { signInApi, setSession } from '../../store/authStore.js';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await signInApi(email, password);
      
      // Strict client-side check to ensure the user has the Admin role
      if (data.role && data.role.toLowerCase() === 'admin') {
        setSession(data);
        window.location.href = '/admin';
      } else {
        throw new Error('Access Denied: You do not have administrator privileges.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl flex items-start gap-2 text-[11px] animate-pulse">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-slate-700 font-semibold text-[11px]">Administrator Email</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin.name@tradelogix.io"
            className="w-full pl-10 pr-3 py-3 glass-input bg-slate-50 border-slate-300 text-slate-900 text-xs"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-slate-700 font-semibold text-[11px]">Security Password</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••••••"
            className="w-full pl-10 pr-3 py-3 glass-input bg-slate-50 border-slate-300 text-slate-900 text-xs"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !email || !password}
        className="w-full py-3.5 rounded-xl gradient-brand text-white font-semibold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-4 text-xs disabled:opacity-50"
      >
        {isLoading ? 'Verifying Credentials...' : 'Sign In as Administrator'} <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}
