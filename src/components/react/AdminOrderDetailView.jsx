import React, { useState, useEffect } from 'react';
import {
  fetchOrderByIdApi,
  updateOrderStatus,
  verifyOfflinePayment,
  collectPartialBalance,
} from '../../services/orderService.js';
import { formatPrice } from '../../utils/formatters.js';
import {
  ArrowLeft,
  Truck,
  CreditCard,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  FileText,
  Building2,
  User,
  MapPin,
  AlertCircle,
  RotateCcw,
  Check,
  PackageCheck,
  DollarSign,
  Tag,
  Percent,
  ShieldCheck,
} from 'lucide-react';

export default function AdminOrderDetailView({ orderId: initialOrderId }) {
  const getOrderId = () => {
    if (initialOrderId) return initialOrderId;
    if (typeof window !== 'undefined') {
      const parts = window.location.pathname.split('/').filter(Boolean);
      return parts[parts.length - 1] || '';
    }
    return '';
  };

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');
  const [adminNotesInput, setAdminNotesInput] = useState('');

  const loadData = async () => {
    const idToFetch = getOrderId();
    if (!idToFetch) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await fetchOrderByIdApi(idToFetch);
    if (data && data.id) {
      setOrder(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [initialOrderId]);

  const showNotification = (msg) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  const handleStatusChange = async (newStatus) => {
    if (!order) return;
    setIsUpdating(true);
    const updatedList = await updateOrderStatus(order.id, newStatus);
    const matched = updatedList.find((o) => o.id === order.id);
    if (matched) {
      setOrder(matched);
    } else {
      setOrder({ ...order, status: newStatus, fulfillmentStatus: newStatus });
    }
    setIsUpdating(false);
    showNotification(`Fulfillment status updated to "${newStatus}"`);
  };

  const handleVerifyOffline = async () => {
    if (!order) return;
    setIsUpdating(true);
    const updatedList = await verifyOfflinePayment(order.id, adminNotesInput || 'NEFT bank credit verified by admin');
    const matched = updatedList.find((o) => o.id === order.id);
    if (matched) {
      setOrder(matched);
    } else {
      setOrder({
        ...order,
        paymentStatus: 'Paid (Verified NEFT)',
        isOfflineVerified: true,
        status: 'Processing',
        fulfillmentStatus: 'Processing',
      });
    }
    setIsUpdating(false);
    showNotification('Offline NEFT Wire payment verified successfully!');
  };

  const handleCollectPartialBalance = async () => {
    if (!order) return;
    setIsUpdating(true);
    const updatedList = await collectPartialBalance(order.id, adminNotesInput || '90% COD balance received at dispatch');
    const matched = updatedList.find((o) => o.id === order.id);
    if (matched) {
      setOrder(matched);
    } else {
      setOrder({
        ...order,
        paymentStatus: 'Fully Paid (COD Cleared)',
        isPartialBalanceCollected: true,
      });
    }
    setIsUpdating(false);
    showNotification('90% COD Balance collected and recorded!');
  };

  if (loading) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading order details from database...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">Order Not Found</h2>
        <p className="text-xs text-slate-500">Could not locate order #{orderId} in database records.</p>
        <a
          href="/admin/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Orders
        </a>
      </div>
    );
  }

  const grandTotal = parseFloat(order.totalAmount || order.total || 0);
  const subtotal = parseFloat(order.subtotal || (grandTotal ? grandTotal * 0.847 : 0));
  const taxAmount = parseFloat(order.taxAmount || (grandTotal ? grandTotal * 0.153 : 0));
  const shippingCharge = parseFloat(order.shippingCharge || 0);

  const getFulfillmentBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Dispatched':
      case 'Shipped':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Processing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  const renderPaymentBadge = () => {
    if (order.paymentMethod === 'Razorpay' || order.paymentStatus === 'Paid') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Paid via Razorpay
        </span>
      );
    }
    if (order.paymentMethod === 'OfflineTransfer') {
      if (order.isOfflineVerified || order.paymentStatus.includes('Verified')) {
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Verified NEFT Wire
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Pending NEFT Verification
        </span>
      );
    }
    if (order.paymentMethod === 'PartialCOD') {
      if (order.isPartialBalanceCollected || order.paymentStatus.includes('Fully Paid')) {
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Fully Paid (Deposit + COD Cleared)
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          10% Paid • 90% Due on Delivery
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
        <DollarSign className="w-3.5 h-3.5 text-slate-600" />
        Cash On Delivery (Due at Arrival)
      </span>
    );
  };

  const lineItems = order.items && order.items.length > 0 ? order.items : [
    { id: 'item-1', name: 'Product Line Item', sku: 'SKU-GEN', qty: 1, price: grandTotal },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Breadcrumbs & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <a
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all w-fit shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Orders
        </a>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadData}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm"
            title="Reload from Database"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Refresh
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-md shadow-brand-500/20"
          >
            <Printer className="w-3.5 h-3.5" /> Print Invoice
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 animate-fadeIn text-xs font-bold shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Main Order Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-mono text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {order.id}
              </h1>
              {renderPaymentBadge()}
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getFulfillmentBadgeClass(order.fulfillmentStatus || order.status)}`}>
                {order.fulfillmentStatus || order.status || 'Pending'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Placed on {order.date || (order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : 'Recent')} • Order Reference ID: <span className="font-mono text-slate-700">{order.id}</span>
            </p>
          </div>

          {/* Quick Fulfillment Dropdown Selector */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center gap-3 shrink-0">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">
              Fulfillment Status:
            </span>
            <select
              value={order.fulfillmentStatus || order.status || 'Pending'}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdating}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer shadow-sm disabled:opacity-50"
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* CUSTOMER ORDER REMARKS (HIGH VISIBILITY PROMINENT BOX) */}
        {order.orderRemarks && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-950 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
              <FileText className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Customer Order Remark / Special Instructions</span>
            </div>
            <p className="text-xs sm:text-sm font-medium leading-relaxed pl-6 italic text-amber-900/90">
              "{order.orderRemarks}"
            </p>
          </div>
        )}

        {/* ================= PAYMENT AUDIT & META BOX ================= */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-100/90 px-6 py-3.5 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
            <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-600" />
              <span>Payment Gateway & Audit Trail</span>
            </div>
            <span className="font-mono text-xs text-slate-600">
              Method: <strong className="text-slate-900">{order.paymentMethod}</strong>
            </span>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Method</span>
                <div className="font-bold text-slate-900 text-xs mt-1">
                  {order.paymentMethod === 'Razorpay'
                    ? 'Razorpay Online Gateway (100% Paid)'
                    : order.paymentMethod === 'OfflineTransfer'
                    ? 'Offline Bank Transfer (NEFT/RTGS)'
                    : order.paymentMethod === 'PartialCOD'
                    ? 'Conditional Partial COD (10%+90%)'
                    : 'Cash On Delivery'}
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Status</span>
                <div className="mt-1">{renderPaymentBadge()}</div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Order Value</span>
                <div className="font-display font-black text-slate-900 text-base mt-1">
                  {formatPrice(grandTotal)}
                </div>
              </div>
            </div>

            {/* Offline Bank Transfer Verification Section */}
            {order.paymentMethod === 'OfflineTransfer' && (
              <div className="p-5 rounded-2xl bg-white border border-amber-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Bank UTR Transaction Reference</span>
                    <div className="font-mono font-bold text-slate-900 text-sm">{order.offlineUtrNumber || 'N/A'}</div>
                  </div>
                  {order.isOfflineVerified ? (
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      NEFT Credit Verified by Admin
                    </div>
                  ) : (
                    <button
                      onClick={handleVerifyOffline}
                      disabled={isUpdating}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" /> Verify NEFT Bank Payment
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Partial COD 10%/90% Breakdown and Collection */}
            {order.paymentMethod === 'PartialCOD' && (
              <div className="p-5 rounded-2xl bg-white border border-indigo-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">10% Online Advance Deposit</span>
                    <div className="font-display font-bold text-emerald-900 text-base mt-0.5">
                      {formatPrice(grandTotal * 0.10)}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold">Paid via Razorpay Gateway</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase">90% Remaining Due on Arrival</span>
                    <div className="font-display font-bold text-indigo-900 text-base mt-0.5">
                      {formatPrice(grandTotal * 0.90)}
                    </div>
                    <span className="text-[10px] text-indigo-600 font-semibold">Collect Cash upon Delivery</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
                  <div className="text-xs text-slate-600">
                    COD Balance Status:{' '}
                    <strong className={order.isPartialBalanceCollected ? 'text-emerald-700' : 'text-amber-700'}>
                      {order.isPartialBalanceCollected ? 'Collected & Cleared' : 'Pending Delivery Collection'}
                    </strong>
                  </div>
                  {!order.isPartialBalanceCollected && (
                    <button
                      onClick={handleCollectPartialBalance}
                      disabled={isUpdating}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Mark 90% Balance Collected
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= CUSTOMER & ADDRESSES (3 COLS) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer Profile Box */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 pb-2 border-b border-slate-200/60">
                <User className="w-4 h-4 text-brand-600" /> Customer Account Details
              </h3>
              <div className="space-y-1.5 text-xs text-slate-700 pt-3">
                <div className="font-bold text-slate-900 text-sm">{order.customerName}</div>
                <div>Email: <strong className="text-slate-900">{order.customerEmail || 'N/A'}</strong></div>
                <div>Phone: <strong className="text-slate-900">{order.customerMobile || 'N/A'}</strong></div>
                {order.companyName && <div>Company: <strong className="text-slate-900">{order.companyName}</strong></div>}
                {order.gstin && <div>GSTIN: <strong className="font-mono text-slate-900">{order.gstin}</strong></div>}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">Category:</span>
              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">
                {order.customerCategory || 'Retailer'}
              </span>
            </div>
          </div>

          {/* Shipping Consignee Address Box */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-600" /> Consignee Shipping Address
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold">
                  Dispatch Dock
                </span>
              </div>
              {order.shippingAddress ? (
                <div className="space-y-1 text-xs text-slate-700 leading-relaxed pt-3">
                  <div className="font-bold text-slate-900 text-sm">{order.shippingAddress.name}</div>
                  <div>{order.shippingAddress.addressLine1}</div>
                  {order.shippingAddress.addressLine2 && <div>{order.shippingAddress.addressLine2}</div>}
                  <div>{order.shippingAddress.city}, {order.shippingAddress.state} - <strong>{order.shippingAddress.pincode}</strong></div>
                  <div className="pt-1 text-[11px] text-slate-500">Contact: {order.shippingAddress.phone} • {order.shippingAddress.email}</div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic pt-3">No separate shipping address recorded.</div>
              )}
            </div>
          </div>

          {/* Billing / Tax Invoicing Address Box */}
          {(() => {
            const billing = order.billingAddress || (order.isBillingSameAsShipping ? order.shippingAddress : null);
            const isSame = order.isBillingSameAsShipping || !order.billingAddress;

            return (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-brand-600" /> Billing & Invoicing Address
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isSame ? 'bg-slate-200 text-slate-700' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {isSame ? 'Same as Shipping' : 'Separate Entity'}
                    </span>
                  </div>
                  {billing ? (
                    <div className="space-y-1 text-xs text-slate-700 leading-relaxed pt-3">
                      <div className="font-bold text-slate-900 text-sm">{billing.name}</div>
                      <div>{billing.addressLine1}</div>
                      {billing.addressLine2 && <div>{billing.addressLine2}</div>}
                      <div>{billing.city}, {billing.state} - <strong>{billing.pincode}</strong></div>
                      <div className="pt-1 text-[11px] text-slate-500">
                        Contact: {billing.phone || order.shippingAddress?.phone} • {billing.email || order.shippingAddress?.email}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic pt-3">
                      Billing address matches shipping consignee.
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* ================= ITEMIZED LINE ITEMS TABLE ================= */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-brand-600" /> Itemized Line Items ({lineItems.length} Products)
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 pl-5">Product Details</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5 text-center">Qty</th>
                  <th className="p-3.5 text-right">Unit Price</th>
                  <th className="p-3.5 pr-5 text-right">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {lineItems.map((item, idx) => {
                  const unitPrice = parseFloat(item.price || item.unitPrice || 0);
                  const qty = parseInt(item.qty || item.quantity || 1, 10);
                  const total = unitPrice * qty;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3.5 pl-5 font-bold text-slate-900">{item.name}</td>
                      <td className="p-3.5 font-mono text-slate-500 text-[11px]">{item.sku || 'SKU-ITEM'}</td>
                      <td className="p-3.5 text-center font-bold text-slate-800">{qty}</td>
                      <td className="p-3.5 text-right font-medium text-slate-600">{formatPrice(unitPrice)}</td>
                      <td className="p-3.5 pr-5 text-right font-bold text-slate-900">{formatPrice(total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= FINANCIAL TOTALS BREAKDOWN ================= */}
        <div className="flex justify-end pt-4">
          <div className="w-full sm:w-80 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Subtotal (Excl. Taxes)</span>
              <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
            </div>

            {/* Applied Promotional Coupon Discount */}
            {(() => {
              const explicitDisc = order.discountAmount !== undefined && order.discountAmount !== null ? parseFloat(order.discountAmount) : 0;
              const couponCode = order.couponCode;
              // Detect implicit discount if total is less than subtotal * 1.18
              const diff = subtotal > 0 && grandTotal > 0 ? (subtotal * 1.18 - grandTotal) : 0;
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

            <div className="flex items-center justify-between text-slate-600">
              <span>GST 18% (Input Tax Credit)</span>
              <span className="font-semibold text-slate-900">{formatPrice(taxAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Shipping & Handling</span>
              <span className="font-bold text-emerald-600">FREE DELIVERY</span>
            </div>
            <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Grand Total</span>
              <span className="font-display font-black text-brand-600 text-lg">
                {formatPrice(grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
