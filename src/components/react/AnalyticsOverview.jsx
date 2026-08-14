import React from 'react';
import { DollarSign, ShoppingCart, Users, TrendingUp, ArrowUpRight, Award } from 'lucide-react';

export default function AnalyticsOverview() {
  const metrics = [
    { title: 'Total Revenue', value: '₹24,890.50', change: '+14.2%', isPositive: true, icon: DollarSign, color: 'brand' },
    { title: 'Total Orders', value: '1,420', change: '+8.5%', isPositive: true, icon: ShoppingCart, color: 'cyan' },
    { title: 'Active Customers', value: '892', change: '+12.1%', isPositive: true, icon: Users, color: 'emerald' },
    { title: 'Avg. Order Value', value: '₹175.28', change: '+3.4%', isPositive: true, icon: TrendingUp, color: 'violet' },
  ];

  const salesByMonth = [
    { month: 'Jan', sales: 18200 },
    { month: 'Feb', sales: 21400 },
    { month: 'Mar', sales: 19800 },
    { month: 'Apr', sales: 24500 },
    { month: 'May', sales: 28900 },
    { month: 'Jun', sales: 31200 },
    { month: 'Jul', sales: 27800 },
    { month: 'Aug', sales: 34100 },
  ];

  const maxSales = Math.max(...salesByMonth.map((m) => m.sales));

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{m.title}</span>
                <div className="p-2.5 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-display text-2xl font-extrabold text-white tracking-tight">{m.value}</h3>
                <div className="flex items-center gap-1 mt-1 text-xs font-bold text-emerald-400">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{m.change} vs last month</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sales Trend Bar Chart Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-xl text-white">Revenue Performance</h3>
              <p className="text-xs text-gray-400">Monthly sales revenue growth trajectory</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
              2026 YTD
            </span>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 pt-8 pb-2">
            {salesByMonth.map((item, idx) => {
              const heightPercent = (item.sales / maxSales) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{(item.sales / 1000).toFixed(1)}k
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full rounded-t-xl gradient-brand group-hover:brightness-125 transition-all shadow-glow-primary min-h-[12px]"
                  />
                  <span className="text-[11px] font-semibold text-gray-400">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Product Categories Distribution */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-bold text-lg text-white">Top Categories</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-gray-300 mb-1">
                <span>Audio & Headphones</span>
                <span className="text-white">38%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-900 overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full w-[38%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-gray-300 mb-1">
                <span>Curved OLED Displays</span>
                <span className="text-white">29%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-900 overflow-hidden">
                <div className="h-full bg-accent-cyan rounded-full w-[29%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-gray-300 mb-1">
                <span>Keyboards & Mice</span>
                <span className="text-white">18%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-900 overflow-hidden">
                <div className="h-full bg-accent-violet rounded-full w-[18%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-gray-300 mb-1">
                <span>Smart Wearables</span>
                <span className="text-white">15%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-900 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[15%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
