import React, { useState, useEffect, useMemo } from 'react';
import { fetchOrdersApi } from '../../services/orderService.js';
import { getCustomersApi, userStore } from '../../store/authStore.js';
import { formatPrice } from '../../utils/formatters.js';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  Package,
  ArrowRight,
  Clock,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

const API_URL = import.meta.env.PUBLIC_API_URL || (typeof window !== 'undefined' && window.__PUBLIC_API_URL__) || 'http://localhost:6543';

export default function AnalyticsOverview() {
  const [orders, setOrders] = useState([]);
  const [customersCount, setCustomersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Real Live Orders
      const liveOrders = await fetchOrdersApi();
      if (Array.isArray(liveOrders)) {
        setOrders(liveOrders);
      }

      // 2. Fetch Real Live Customers Count
      try {
        const custRes = await getCustomersApi({ limit: 1 });
        if (custRes?.pagination?.total !== undefined) {
          setCustomersCount(custRes.pagination.total);
        } else if (Array.isArray(custRes)) {
          setCustomersCount(custRes.length);
        }
      } catch (e) {}
    } catch (err) {
      console.warn('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Compute live metrics from real orders
  const { totalRevenue, totalOrdersCount, avgOrderValue, monthlySales, recentOrders } = useMemo(() => {
    const totalOrdersCount = orders.length;
    const totalRevenue = orders.reduce((sum, ord) => sum + (parseFloat(ord.totalAmount || ord.total || 0)), 0);
    const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

    // Monthly Sales grouping for the last 6 months
    const monthsNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: monthsNames[d.getMonth()],
        year: d.getFullYear(),
        sales: 0,
      });
    }

    orders.forEach((ord) => {
      const ordDate = ord.createdAt ? new Date(ord.createdAt) : null;
      if (ordDate && !isNaN(ordDate.getTime())) {
        const key = `${ordDate.getFullYear()}-${String(ordDate.getMonth() + 1).padStart(2, '0')}`;
        const match = last6Months.find((m) => m.monthKey === key);
        if (match) {
          match.sales += parseFloat(ord.totalAmount || ord.total || 0);
        }
      } else {
        // Fallback for current month
        last6Months[last6Months.length - 1].sales += parseFloat(ord.totalAmount || ord.total || 0);
      }
    });

    // Recent 4 orders
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 4);

    return {
      totalRevenue,
      totalOrdersCount,
      avgOrderValue,
      monthlySales: last6Months,
      recentOrders,
    };
  }, [orders]);

  const maxMonthlySales = Math.max(...monthlySales.map((m) => m.sales), 1000);

  const metricsCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(totalRevenue),
      change: `${totalOrdersCount} orders placed`,
      isPositive: true,
      icon: DollarSign,
      color: 'brand',
    },
    {
      title: 'Total Orders',
      value: totalOrdersCount.toLocaleString(),
      change: `${orders.filter((o) => (o.status || '').toLowerCase() === 'delivered').length} completed`,
      isPositive: true,
      icon: ShoppingCart,
      color: 'cyan',
    },
    {
      title: 'Active Customers',
      value: (customersCount || (orders.length > 0 ? orders.length : 0)).toLocaleString(),
      change: 'Verified B2B Accounts',
      isPositive: true,
      icon: Users,
      color: 'emerald',
    },
    {
      title: 'Avg. Order Value',
      value: formatPrice(avgOrderValue),
      change: 'Per transaction',
      isPositive: true,
      icon: TrendingUp,
      color: 'violet',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="h-4 bg-slate-200 rounded w-24" />
              <div className="h-8 bg-slate-200 rounded w-36" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-72 bg-white rounded-3xl border border-slate-200 p-6" />
          <div className="h-72 bg-white rounded-3xl border border-slate-200 p-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsCards.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{m.title}</span>
                <div className="p-2.5 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">{m.value}</h3>
                <div className="flex items-center gap-1 mt-1 text-xs font-bold text-slate-500">
                  <span>{m.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Performance Chart (Dynamic Monthly Trajectory) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-6 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-xl text-slate-900">Revenue Performance</h3>
            <p className="text-xs text-slate-500">Real-time monthly sales trajectory from processed orders</p>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-3 py-1 rounded-full bg-brand-50 hover:bg-brand-100 text-brand-600 text-xs font-bold border border-brand-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Live Data
          </button>
        </div>

        <div className="h-64 flex items-end justify-between gap-4 pt-8 pb-2">
          {monthlySales.map((item, idx) => {
            const heightPercent = maxMonthlySales > 0 ? Math.max(8, (item.sales / maxMonthlySales) * 100) : 8;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatPrice(item.sales)}
                </div>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full rounded-t-xl gradient-brand group-hover:brightness-110 transition-all shadow-sm min-h-[12px]"
                />
                <span className="text-[11px] font-semibold text-slate-500">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Recent Customer Orders Feed */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-xl text-slate-900">Recent Customer Orders</h3>
            <p className="text-xs text-slate-500">Live incoming customer purchases awaiting fulfillment</p>
          </div>
          <a href="/admin/orders" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            Manage All Orders ({orders.length}) &rarr;
          </a>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-400 space-y-2">
            <Package className="w-8 h-8 mx-auto text-slate-300" />
            <p>No customer orders placed in database yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentOrders.map((ord) => (
              <a
                key={ord.id}
                href={`/admin/orders/${ord.id}`}
                className="glass-panel p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-brand-300 hover:shadow-md transition-all space-y-3 text-xs block group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-brand-600 group-hover:underline">{ord.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    (ord.status || '').toLowerCase() === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : (ord.status || '').toLowerCase() === 'processing'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {ord.status || 'Pending'}
                  </span>
                </div>
                <p className="font-bold text-slate-900 truncate text-sm">{ord.customerName || 'B2B Customer'}</p>
                <div className="flex items-center justify-between text-slate-500 pt-2 border-t border-slate-200 text-[11px]">
                  <span>{ord.date || 'Recent'}</span>
                  <span className="font-display font-extrabold text-slate-900 text-sm">
                    {formatPrice(ord.totalAmount || ord.total || 0)}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
