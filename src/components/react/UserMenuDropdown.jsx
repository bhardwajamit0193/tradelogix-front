import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { userStore, logoutUser } from '../../store/authStore.js';
import { User, LogOut, ChevronDown, LayoutDashboard, Package, Building, MapPin, ShieldCheck, Phone } from 'lucide-react';

export default function UserMenuDropdown() {
  const user = useStore(userStore);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-hydration SSR guard: Prevent flashing "Sign In" button on page reload
  if (!mounted) {
    const isAuthInDoc = typeof document !== 'undefined' && document.documentElement.classList.contains('tradelogix-auth-active');
    const isStoredLoggedIn = typeof window !== 'undefined' && (function() {
      try {
        const saved = localStorage.getItem('tradelogix_user');
        return saved && JSON.parse(saved)?.isLoggedIn;
      } catch (e) {
        return false;
      }
    })();

    if (isAuthInDoc || isStoredLoggedIn || user?.isLoggedIn) {
      // Render smooth placeholder that matches exact dimensions of authenticated user button
      return (
        <div className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-100/90 border border-slate-200/80 animate-pulse text-xs font-medium">
          <div className="w-7 h-7 rounded-lg bg-slate-200 shrink-0" />
          <div className="hidden sm:inline-block w-12 h-3.5 bg-slate-200 rounded" />
          <div className="w-3 h-3 bg-slate-200 rounded shrink-0" />
        </div>
      );
    }

    const loginUrl = typeof window !== 'undefined' && window.location.pathname !== '/login'
      ? `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
      : '/login';

    return (
      <a
        href={loginUrl}
        className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-glow-primary flex items-center gap-1.5"
      >
        <User className="w-3.5 h-3.5" />
        Sign In
      </a>
    );
  }

  // If user is not logged in after hydration
  if (!user || !user.isLoggedIn) {
    const loginUrl = typeof window !== 'undefined' && window.location.pathname !== '/login'
      ? `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
      : '/login';

    return (
      <a
        href={loginUrl}
        className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-glow-primary flex items-center gap-1.5"
      >
        <User className="w-3.5 h-3.5" />
        Sign In
      </a>
    );
  }

  // Authenticated State
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all text-xs font-medium"
      >
        <img
          src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
          alt={user.name}
          className="w-7 h-7 rounded-lg object-cover border border-slate-200"
        />
        <span className="hidden sm:inline-block font-semibold text-slate-800">{user.name}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl p-2 z-50 shadow-xl border border-slate-200 text-xs animate-fadeIn">
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <p className="font-semibold text-slate-900 truncate">{user.name}</p>
              <p className="text-slate-500 text-[11px] truncate">{user.email}</p>
            </div>

            <div className="py-1 border-b border-slate-100">
              {user.role === 'Admin' ? (
                /* Admin Single Nav Link to /admin */
                <a
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-800 hover:bg-slate-50 hover:text-brand-600 transition-all font-bold"
                >
                  <LayoutDashboard className="w-4 h-4 text-brand-600" />
                  Dashboard
                </a>
              ) : (
                /* Customer Portal Links */
                <>
                  <a
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-all font-semibold"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                    Dashboard
                  </a>
                  <a
                    href="/dashboard/orders"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-all font-semibold"
                  >
                    <Package className="w-4 h-4 text-slate-400" />
                    My Orders
                  </a>
                  <a
                    href="/dashboard/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-all font-semibold"
                  >
                    <Building className="w-4 h-4 text-slate-400" />
                    Company Profile
                  </a>
                  <a
                    href="/dashboard/addresses"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-all font-semibold"
                  >
                    <MapPin className="w-4 h-4 text-slate-400" />
                    Saved Addresses
                  </a>
                  <a
                    href="/dashboard/change-phone"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-all font-semibold"
                  >
                    <Phone className="w-4 h-4 text-slate-400" />
                    Change Login Mobile
                  </a>
                </>
              )}
            </div>

            <div className="py-1">
              <button
                onClick={() => {
                  logoutUser();
                  setIsOpen(false);
                  window.location.href = '/';
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-all flex items-center gap-2.5 font-semibold"
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
