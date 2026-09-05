import React from 'react';
import { useStore } from '@nanostores/react';
import { userStore, logoutUser } from '../../store/authStore.js';
import {
  LayoutDashboard,
  Package,
  Building,
  MapPin,
  LogOut,
  ShieldCheck,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react';

export default function CustomerDashboardNav({ activeTab = 'overview' }) {
  const user = useStore(userStore);

  const navItems = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'orders',
      label: 'My Orders',
      href: '/dashboard/orders',
      icon: Package,
    },
    {
      id: 'profile',
      label: 'Business Profile',
      href: '/dashboard/profile',
      icon: Building,
    },
    {
      id: 'addresses',
      label: 'Shipping & Billing',
      href: '/dashboard/addresses',
      icon: MapPin,
    },
  ];

  return (
    <aside className="space-y-6">
      {/* Customer Profile Mini Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-md shrink-0">
            {(user?.name || user?.firmName || 'C')[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm text-slate-900 truncate">
              {user?.name || user?.firmName || 'Valued Customer'}
            </h3>
            <p className="text-xs text-slate-500 truncate">{user?.email || user?.mobileNumber || 'Verified Account'}</p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Account Status</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Verified B2B
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-sm space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-brand-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white/80' : 'text-slate-300'}`} />
            </a>
          );
        })}

        {user?.role === 'Admin' && (
          <a
            href="/admin"
            className="flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition-all border-t border-slate-100 mt-2"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Admin Panel</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
          </a>
        )}

        <button
          type="button"
          onClick={() => {
            logoutUser();
            window.location.href = '/';
          }}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all text-left border-t border-slate-100 mt-1"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Sign Out</span>
          </div>
        </button>
      </div>

      {/* Quick Action Box */}
      <div className="bg-gradient-to-br from-brand-900 to-slate-900 rounded-3xl p-5 text-white space-y-3 shadow-lg">
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-brand-300">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-xs">Need Bulk Supplies?</h4>
          <p className="text-[11px] text-slate-300 mt-0.5">Explore special wholesale prices on premium displays & audio hardware.</p>
        </div>
        <a
          href="/shop"
          className="inline-block w-full py-2.5 px-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-center text-xs font-bold transition-all shadow-md"
        >
          Browse Catalog
        </a>
      </div>
    </aside>
  );
}
