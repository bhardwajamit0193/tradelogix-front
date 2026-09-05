import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { userStore } from '../../store/authStore.js';
import { fetchCustomerOrdersApi } from '../../services/customerService.js';
import {
  Package,
  Search,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  Clock,
  CheckCircle2,
  Filter,
} from 'lucide-react';

export default function CustomerOrdersView() {
  const user = useStore(userStore);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      try {
        const list = await fetchCustomerOrdersApi(user?.accessToken);
        if (list) setOrders(list);
      } catch (e) {
        console.warn('Orders fetch error', e);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [user]);

  const formatPrice = (amt) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt || 0);

  const getStatusBadge = (status) => {
    const s = (status || 'Pending').toLowerCase();
    if (s.includes('delivered') || s.includes('completed') || s.includes('paid')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (s.includes('shipped') || s.includes('dispatched') || s.includes('processing')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (s.includes('pending') || s.includes('verification')) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.paymentMethod || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.shippingAddress?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      (order.status || '').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const statuses = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-12 bg-slate-200 rounded-2xl" />
        <div className="h-24 bg-slate-200 rounded-3xl" />
        <div className="h-24 bg-slate-200 rounded-3xl" />
        <div className="h-24 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search & Filter Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID or Method..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            />
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {statuses.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  statusFilter === st
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-base">No Orders Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'All'
                ? 'Try adjusting your search criteria or status filter.'
                : "You haven't placed any wholesale purchase orders yet."}
            </p>
          </div>
          <a
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-brand text-white text-xs font-bold shadow-md hover:opacity-90 transition-all"
          >
            Explore Catalog <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all p-5 sm:p-6 space-y-4"
            >
              {/* Top Row: ID, Date, Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-sm text-slate-900">{order.id}</span>
                    <p className="text-xs text-slate-400">
                      Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status || 'Processing'}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                    {order.paymentMethod || 'Online'}
                  </span>
                </div>
              </div>

              {/* Middle Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Consignee & Destination</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {order.shippingAddress?.name || 'Customer'}
                  </p>
                  <p className="text-slate-500 truncate">
                    {order.shippingAddress?.city ? `${order.shippingAddress.city}, ${order.shippingAddress.state}` : 'Dispatched from Warehouse'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Fulfillment Dispatch</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {order.warehouse || 'Mumbai Central Hub'}
                  </p>
                  <p className="text-slate-500">
                    {order.items?.length || order.itemsCount || 1} item(s) total
                  </p>
                </div>

                <div className="sm:text-right">
                  <span className="text-slate-400 font-medium">Total Amount</span>
                  <div className="font-display font-extrabold text-base text-brand-600 mt-0.5">
                    {formatPrice(order.total || order.totalAmount)}
                  </div>
                  {order.paymentMethod === 'PartialCOD' && (
                    <span className="text-[10px] font-bold text-indigo-600">
                      Partial COD Balance: {formatPrice(order.partialCodAmount || 0)}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Bottom Row */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {order.offlineUtrNumber ? `UTR: ${order.offlineUtrNumber}` : 'Tax Invoice Available'}
                </span>
                <a
                  href={`/dashboard/orders/${order.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-brand-600 hover:text-white text-slate-800 text-xs font-bold transition-all shadow-sm"
                >
                  View Order Details <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
