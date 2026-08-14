import React, { useState } from 'react';
import { getOrders, updateOrderStatus } from '../../services/orderService.js';
import { formatPrice } from '../../utils/formatters.js';
import { Search, Eye, Filter, CheckCircle, Clock, Truck, PackageCheck } from 'lucide-react';

export default function OrderTable() {
  const [orders, setOrders] = useState(getOrders());
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleStatusChange = (orderId, newStatus) => {
    const updated = updateOrderStatus(orderId, newStatus);
    setOrders([...updated]);
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = statusFilter === 'All' || ord.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Shipped':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'Processing':
        return 'bg-brand-500/20 text-brand-400 border-brand-500/30';
      default:
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID or Customer..."
            className="w-full pl-10 pr-4 py-2 glass-input text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['All', 'Pending', 'Processing', 'Shipped', 'Delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'gradient-brand text-white shadow-glow-primary'
                  : 'bg-gray-900/80 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-900/90 text-gray-400 font-semibold border-b border-white/10 uppercase tracking-wider">
              <tr>
                <th className="p-4 pl-6">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 pl-6 font-mono font-bold text-brand-400">
                    {order.id}
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-white">{order.customerName}</div>
                    <div className="text-[11px] text-gray-400">{order.customerEmail}</div>
                  </td>
                  <td className="p-4 text-gray-400">{order.date}</td>
                  <td className="p-4 text-gray-300">
                    <span className="font-bold text-white">{order.itemsCount}</span> items
                  </td>
                  <td className="p-4 font-display font-bold text-white text-sm">
                    {formatPrice(order.total)}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="glass-input text-[11px] py-1 px-2 bg-gray-900 cursor-pointer font-semibold"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
