import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { userStore, logoutUser } from '../../store/authStore.js';
import { User, LogOut, ChevronDown } from 'lucide-react';

export default function UserMenuDropdown() {
  const user = useStore(userStore);
  const [isOpen, setIsOpen] = useState(false);

  if (!user || !user.isLoggedIn) {
    return (
      <a
        href="/login"
        className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-glow-primary flex items-center gap-1.5"
      >
        <User className="w-3.5 h-3.5" />
        Sign In
      </a>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-gray-900/80 border border-white/10 hover:border-white/20 transition-all text-xs font-medium"
      >
        <img
          src={user.avatar}
          alt={user.name}
          className="w-7 h-7 rounded-lg object-cover border border-white/20"
        />
        <span className="hidden sm:inline-block font-semibold text-gray-200">{user.name}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-52 glass-panel rounded-2xl p-2 z-50 shadow-2xl border border-white/10 text-xs">
            <div className="px-3 py-2 border-b border-white/10 mb-1">
              <p className="font-semibold text-white truncate">{user.name}</p>
              <p className="text-gray-400 text-[11px] truncate">{user.email}</p>
            </div>

            <div className="py-1">
              <button
                onClick={() => {
                  logoutUser();
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all flex items-center gap-2.5 font-semibold"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
