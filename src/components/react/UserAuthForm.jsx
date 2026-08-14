import React, { useState } from 'react';
import { loginUser } from '../../store/authStore.js';
import { ArrowRight } from 'lucide-react';

export default function UserAuthForm() {
  const [email, setEmail] = useState('alex.mercer@example.com');
  const [password, setPassword] = useState('••••••••••••');

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser(email, password, 'customer');
    window.location.href = '/shop';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div className="space-y-1">
        <label className="text-slate-700 font-semibold">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your.email@example.com"
          className="w-full p-3 glass-input bg-slate-50 border-slate-300 text-slate-900"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-slate-700 font-semibold">Password</label>
          <a href="#" className="text-[11px] text-brand-600 hover:underline">Forgot password?</a>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••••••"
          className="w-full p-3 glass-input bg-slate-50 border-slate-300 text-slate-900"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3.5 rounded-xl gradient-brand text-white font-semibold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-4 text-xs"
      >
        Sign In <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}
