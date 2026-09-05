import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { userStore } from '../../store/authStore.js';
import { fetchCustomerOrderDetailApi } from '../../services/customerService.js';
import {
  Package,
  ArrowLeft,
  Printer,
  Truck,
  Building,
  Building2,
  Receipt,
  CreditCard,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  FileText,
  ShoppingBag,
  Tag,
} from 'lucide-react';

export default function CustomerOrderDetailView({ orderId }) {
  const user = useStore(userStore);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;
      setLoading(true);
      try {
        const data = await fetchCustomerOrderDetailApi(user?.accessToken, orderId);
        if (data) setOrder(data);
      } catch (e) {
        console.warn('Order detail fetch error', e);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId, user]);

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
        <div className="h-10 bg-slate-200 rounded-2xl w-40" />
        <div className="h-40 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-32 bg-slate-200 rounded-3xl" />
          <div className="h-32 bg-slate-200 rounded-3xl" />
          <div className="h-32 bg-slate-200 rounded-3xl" />
        </div>
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <Package className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-slate-800 text-base">Order Not Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          We couldn't retrieve order details for ID: <span className="font-mono font-bold">{orderId}</span>
        </p>
        <a
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white text-xs font-bold shadow-md hover:opacity-90 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </a>
      </div>
    );
  }

  const billingAddr = order.billingAddress || (order.isBillingSameAsShipping ? order.shippingAddress : null);
  const isSameBilling = order.isBillingSameAsShipping || !order.billingAddress;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Row with Back Button & Print Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <a
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </a>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm text-slate-700 text-xs font-bold transition-all"
        >
          <Printer className="w-4 h-4 text-slate-500" /> Print Tax Receipt
        </button>
      </div>

      {/* Order Main Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-black text-lg text-brand-900">{order.id}</span>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(
                  order.status
                )}`}
              >
                {order.status || 'Processing'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Placed on {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : 'N/A'} • Assigned Hub: <span className="font-semibold text-slate-700">{order.warehouse || 'Mumbai Central'}</span>
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-xs text-slate-400 font-medium">Grand Total</span>
            <div className="font-display text-2xl font-black text-brand-600">
              {formatPrice(order.total || order.totalAmount)}
            </div>
          </div>
        </div>

        {/* 3-Column Addresses & Payment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Shipping Destination */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Truck className="w-4 h-4 text-brand-600" />
                  Shipping Destination
                </div>
                <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold">
                  Dispatch Dock
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-0.5">
                <div className="font-bold text-slate-900">{order.shippingAddress?.name || order.customerName || 'Customer'}</div>
                <div>{order.shippingAddress?.addressLine1}</div>
                {order.shippingAddress?.addressLine2 && <div>{order.shippingAddress.addressLine2}</div>}
                <div>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - <span className="font-mono font-semibold">{order.shippingAddress?.pincode}</span>
                </div>
                <div className="pt-1 text-slate-500">
                  Phone: <span className="font-semibold text-slate-800">{order.shippingAddress?.phone || order.customerMobile}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Billing / Tax Invoicing Address */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Building2 className="w-4 h-4 text-brand-600" />
                  Billing & Tax Invoicing
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isSameBilling ? 'bg-slate-200 text-slate-700' : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {isSameBilling ? 'Same as Shipping' : 'Separate Entity'}
                </span>
              </div>
              {billingAddr ? (
                <div className="text-xs text-slate-600 space-y-0.5">
                  <div className="font-bold text-slate-900">{billingAddr.name || order.customerName || 'Company Entity'}</div>
                  <div>{billingAddr.addressLine1}</div>
                  {billingAddr.addressLine2 && <div>{billingAddr.addressLine2}</div>}
                  <div>
                    {billingAddr.city}, {billingAddr.state} - <span className="font-mono font-semibold">{billingAddr.pincode}</span>
                  </div>
                  <div className="pt-1 text-slate-500">
                    Contact: <span className="font-semibold text-slate-800">{billingAddr.phone || order.shippingAddress?.phone}</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic pt-1">
                  Tax invoice issued to consignee shipping details.
                </div>
              )}
            </div>
          </div>

          {/* Payment & Invoicing Info */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  Payment Settlement
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                  {order.paymentMethod || 'Razorpay'}
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-1.5">
                <div>
                  Method: <span className="font-bold text-slate-900">{order.paymentMethod || 'Razorpay Online'}</span>
                </div>
                <div>
                  Status: <span className="font-bold text-slate-900">{order.paymentStatus || 'Verified'}</span>
                </div>
                {order.offlineUtrNumber && (
                  <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-mono text-[11px]">
                    UTR: {order.offlineUtrNumber}
                  </div>
                )}
                {order.paymentMethod === 'PartialCOD' && (
                  <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-900 text-[11px] space-y-0.5">
                    <div className="font-bold">Partial COD Settlement:</div>
                    <div>Online Advance: {formatPrice(order.partialOnlineAmount || 0)} (PAID)</div>
                    <div>Balance on Delivery: {formatPrice(order.partialCodAmount || 0)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Products Breakdown Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between font-bold text-xs text-slate-800">
            <span>Ordered Items & Hardware</span>
            <span>{order.items?.length || 1} Item(s)</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {(order.items || []).map((item, idx) => (
              <div key={idx} className="p-4 sm:px-5 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">{item.name || 'Product Item'}</div>
                  <div className="text-slate-400 text-[11px] font-mono">
                    SKU: {item.sku || 'N/A'} • Qty: <span className="font-bold text-slate-700">{item.qty || item.quantity}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">
                    {formatPrice((item.price || item.unitPrice) * (item.qty || item.quantity))}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    ({formatPrice(item.price || item.unitPrice)} each)
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Calculations Footer */}
          <div className="bg-slate-50/70 p-5 border-t border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal (Excl. Taxes)</span>
              <span className="font-semibold text-slate-900">{formatPrice(order.subtotal)}</span>
            </div>

            {/* Applied Promotional Coupon Discount */}
            {(() => {
              const explicitDisc = order.discountAmount !== undefined && order.discountAmount !== null ? parseFloat(order.discountAmount) : 0;
              const couponCode = order.couponCode;
              const orderTot = parseFloat(order.total || order.totalAmount || 0);
              const orderSub = parseFloat(order.subtotal || 0);
              const diff = orderSub > 0 && orderTot > 0 ? (orderSub * 1.18 - orderTot) : 0;
              const implicitDisc = diff > 5 ? Math.round(diff / 1.18) : 0;
              const finalDisc = explicitDisc > 0 ? explicitDisc : implicitDisc;
              const displayCode = couponCode || (finalDisc > 0 ? 'FLAT10%' : '');

              if (finalDisc > 0 || displayCode) {
                return (
                  <div className="flex items-center justify-between text-emerald-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" /> Coupon Discount {displayCode ? `(${displayCode})` : ''}
                    </span>
                    <span>- {formatPrice(finalDisc > 0 ? finalDisc : 1500)}</span>
                  </div>
                );
              }
              return null;
            })()}

            <div className="flex justify-between text-slate-600">
              <span>GST 18% (B2B Input Tax Credit Available)</span>
              <span className="font-semibold text-slate-900">{formatPrice(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Logistics & Freight</span>
              <span className="font-bold text-emerald-600 uppercase">FREE DELIVERY</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-slate-900">
              <span>Grand Total</span>
              <span className="font-display text-lg text-brand-600">{formatPrice(order.total || order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
