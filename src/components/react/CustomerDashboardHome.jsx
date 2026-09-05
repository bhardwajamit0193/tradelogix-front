import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { userStore } from '../../store/authStore.js';
import {
  fetchCustomerOrdersApi,
  fetchCustomerProfileApi,
  fetchCustomerAddressesApi,
} from '../../services/customerService.js';
import {
  Package,
  Clock,
  TrendingUp,
  MapPin,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Building,
  CheckCircle2,
  FileText,
  Truck,
  ExternalLink,
} from 'lucide-react';

export default function CustomerDashboardHome() {
  const user = useStore(userStore);
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [ordersList, profileData, addrList] = await Promise.all([
          fetchCustomerOrdersApi(user?.accessToken),
          fetchCustomerProfileApi(user?.accessToken),
          fetchCustomerAddressesApi(user?.accessToken),
        ]);
        if (ordersList) setOrders(ordersList);
        if (profileData) setProfile(profileData);
        if (addrList) setAddresses(addrList);
      } catch (e) {
        console.warn('Dashboard data load error', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const totalSpent = orders.reduce((sum, o) => sum + (parseFloat(o.total || o.totalAmount || 0) || 0), 0);
  const pendingOrdersCount = orders.filter(
    (o) => (o.status || '').toLowerCase() === 'pending' || (o.paymentStatus || '').toLowerCase().includes('pending')
  ).length;

  const shippingAddr = addresses.find((a) => (a.type || '').toLowerCase() === 'shipping') || addresses[0];

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

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-slate-200 rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
        </div>
        <div className="h-72 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full animate-fadeIn">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-brand-950 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-300 text-xs font-semibold backdrop-blur-sm border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Verified Wholesale Buyer
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white">
              Welcome back, {profile?.firmName || profile?.ownerName || user?.name || 'Valued Partner'}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Track live wholesale consignments, view verified GST invoices, and manage company delivery parameters.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Orders Placed</span>
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{orders.length}</span>
            <span className="text-xs text-slate-400 font-medium">Lifetime Orders</span>
          </div>
          {pendingOrdersCount > 0 ? (
            <p className="text-xs font-semibold text-amber-600 flex items-center gap-1.5 pt-1 border-t border-slate-100">
              <Clock className="w-3.5 h-3.5" /> {pendingOrdersCount} order(s) in fulfillment
            </p>
          ) : (
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 pt-1 border-t border-slate-100">
              <CheckCircle2 className="w-3.5 h-3.5" /> All consignments completed
            </p>
          )}
        </div>

        {/* Card 2: Total Spent */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Procurement</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{formatPrice(totalSpent)}</span>
          </div>
          <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 pt-1 border-t border-slate-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 18% GST Input Credit Available
          </p>
        </div>

        {/* Card 3: Primary Delivery Address */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Delivery Hub</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-sm font-bold text-slate-800 truncate block">
              {shippingAddr?.addressLine1 ? `${shippingAddr.city}, ${shippingAddr.state}` : 'Primary Dock Not Set'}
            </span>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {shippingAddr?.pincode ? `PIN: ${shippingAddr.pincode}` : 'Configure delivery address'}
            </p>
          </div>
          <a
            href="/dashboard/addresses"
            className="text-xs text-brand-600 font-bold hover:underline flex items-center gap-1 pt-1 border-t border-slate-100"
          >
            Manage Addresses <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Quick Actions Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <a
          href="/dashboard/orders"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-500 hover:shadow-sm transition-all text-center space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-50 group-hover:bg-brand-600 group-hover:text-white transition-colors text-brand-600 mx-auto flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div className="font-bold text-xs text-slate-800">My Orders</div>
          <div className="text-[11px] text-slate-400">View status & invoices</div>
        </a>

        <a
          href="/dashboard/profile"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-500 hover:shadow-sm transition-all text-center space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white transition-colors text-indigo-600 mx-auto flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div className="font-bold text-xs text-slate-800">Company Profile</div>
          <div className="text-[11px] text-slate-400">GSTIN, PAN & details</div>
        </a>

        <a
          href="/dashboard/addresses"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-500 hover:shadow-sm transition-all text-center space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white transition-colors text-emerald-600 mx-auto flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="font-bold text-xs text-slate-800">Address Book</div>
          <div className="text-[11px] text-slate-400">Shipping & Billing</div>
        </a>

        <a
          href="/shop"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-500 hover:shadow-sm transition-all text-center space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 group-hover:bg-amber-600 group-hover:text-white transition-colors text-amber-600 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="font-bold text-xs text-slate-800">Wholesale Store</div>
          <div className="text-[11px] text-slate-400">Bulk tech supplies</div>
        </a>
      </div>

      {/* Recent Orders Table Section - Hidden on mobile view */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-600" />
              Recent Purchase Orders
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Your most recent B2B orders with live fulfillment status</p>
          </div>
          <a
            href="/dashboard/orders"
            className="text-xs text-brand-600 font-bold hover:underline flex items-center gap-1"
          >
            View All ({orders.length}) <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 space-y-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">No purchase orders placed yet</p>
            <a
              href="/shop"
              className="inline-block px-5 py-2.5 rounded-xl gradient-brand text-white text-xs font-bold shadow-md hover:opacity-90 transition-all"
            >
              Start Procurement
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="pb-3 px-3">Order ID</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3">Items</th>
                  <th className="pb-3 px-3">Payment Method</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Total Amount</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-brand-700">{order.id}</td>
                    <td className="py-3.5 px-3 text-slate-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 font-medium">
                      {order.items?.length || order.itemsCount || 1} item(s)
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">{order.paymentMethod || 'Razorpay'}</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status || 'Processing'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-900 text-sm">
                      {formatPrice(order.total || order.totalAmount)}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <a
                        href={`/dashboard/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-600 hover:text-white text-slate-700 font-bold transition-all text-xs"
                      >
                        Details <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
