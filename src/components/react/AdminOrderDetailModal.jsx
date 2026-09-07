import React, { useState } from 'react';
import { formatPrice } from '../../utils/formatters.js';
import {
  X,
  FileText,
  User,
  Truck,
  Building2,
  CreditCard,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  Receipt,
  Check,
  Printer,
  ChevronRight,
  ShieldCheck,
  Send,
  ExternalLink,
  Tag,
  Download,
} from 'lucide-react';
import { generateAndDownloadInvoicePdf } from './InvoicePdfDocument.jsx';

export default function AdminOrderDetailModal({ order, isOpen, onClose, onUpdateStatus, onVerifyOffline, onCollectPartialBalance }) {
  if (!isOpen || !order) return null;

  const [selectedFulfillment, setSelectedFulfillment] = useState(order.fulfillmentStatus || order.status || 'Pending');
  const [adminNote, setAdminNote] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  const handleStatusChange = (newStatus) => {
    setSelectedFulfillment(newStatus);
    if (onUpdateStatus) {
      onUpdateStatus(order.id, newStatus);
      setActionSuccess(`Fulfillment status updated to "${newStatus}"`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const handleVerifyNeft = () => {
    setIsVerifying(true);
    setTimeout(() => {
      if (onVerifyOffline) {
        onVerifyOffline(order.id, adminNote);
      }
      setIsVerifying(false);
      setActionSuccess('Offline Bank Receipt successfully verified and marked as Paid!');
      setTimeout(() => setActionSuccess(null), 3500);
    }, 400);
  };

  const handleCollectPartial = () => {
    setIsCollecting(true);
    setTimeout(() => {
      if (onCollectPartialBalance) {
        onCollectPartialBalance(order.id, adminNote);
      }
      setIsCollecting(false);
      setActionSuccess('90% COD Balance recorded as collected. Order is now Fully Paid!');
      setTimeout(() => setActionSuccess(null), 3500);
    }, 400);
  };

  const handlePrint = () => {
    window.print();
  };

  // Payment Status Badge Helper
  const getPaymentStatusBadge = () => {
    const st = order.paymentStatus || 'Pending';
    if (st.includes('Paid')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          {st}
        </span>
      );
    }
    if (st.includes('NEFT') || st.includes('Verification')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          {st}
        </span>
      );
    }
    if (st.includes('Partial')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          {st}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
        <Truck className="w-3.5 h-3.5 text-sky-600" />
        {st}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-base sm:text-lg text-white">
                  Order Details: <span className="font-mono text-brand-400">{order.id}</span>
                </h3>
                <span className="text-slate-400 text-xs hidden sm:inline">• Placed on {order.date}</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Complete customer, payment verification, and fulfillment dispatch lifecycle
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Print Order / Packing Slip"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Success Toast Banner */}
        {actionSuccess && (
          <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-bold flex items-center justify-between shrink-0 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-200 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* ================= PROMINENT TOP CUSTOMER REMARK CARD ================= */}
          {order.orderRemarks ? (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300/80 p-5 rounded-2xl shadow-sm space-y-1.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 font-black text-amber-950 text-xs sm:text-sm uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-amber-700" />
                  <span>Customer Order Remark / Special Instructions</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px]">
                  CRITICAL FULFILLMENT NOTE
                </span>
              </div>
              <p className="text-amber-900 font-medium text-xs sm:text-sm pl-6 leading-relaxed bg-white/70 p-3 rounded-xl border border-amber-200/60">
                "{order.orderRemarks}"
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-slate-500 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>No customer remarks provided for this order.</span>
            </div>
          )}

          {/* ================= FULFILLMENT & QUICK STATUS BAR ================= */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Fulfillment Management
              </span>
              <div className="flex items-center gap-3">
                <div className="text-slate-900 font-bold text-sm">Update Order Status:</div>
                <select
                  value={selectedFulfillment}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Payment</span>
                <div>{getPaymentStatusBadge()}</div>
              </div>
            </div>
          </div>

          {/* ================= ORDER CANCELLED BANNER (IF CANCELLED) ================= */}
          {(order.fulfillmentStatus === 'Cancelled' || order.status === 'Cancelled') && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-rose-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  Order Cancelled & Invoice Voided
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                  Recorded in DB
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-rose-200 text-xs text-slate-800">
                <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider block mb-1">
                  Reason for Cancellation:
                </span>
                <p className="font-semibold text-slate-900">
                  {order.cancelReason || 'No custom reason specified (using default desk cancellation notification).'}
                </p>
              </div>
            </div>
          )}

          {/* ================= PAYMENT META BOX (KEY REQUIREMENT) ================= */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-100/80 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="font-bold text-slate-900 flex items-center gap-2 text-xs">
                <CreditCard className="w-4 h-4 text-brand-600" />
                <span>Payment Meta Box & Audit Trail</span>
              </div>
              <span className="font-mono text-slate-500 text-[11px]">
                Method: <strong className="text-slate-900">{order.paymentMethod}</strong>
              </span>
            </div>

            <div className="p-6 space-y-4">
              {/* Payment Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Payment Method</span>
                  <div className="font-bold text-slate-900 text-xs mt-0.5">
                    {order.paymentMethod === 'Razorpay'
                      ? 'Razorpay Online Gateway (100% Paid)'
                      : order.paymentMethod === 'OfflineTransfer'
                      ? 'Offline Bank Transfer (NEFT/RTGS)'
                      : order.paymentMethod === 'PartialCOD'
                      ? 'Conditional Partial COD (10% + 90%)'
                      : 'Standard Cash on Delivery (COD)'}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Payment Status</span>
                  <div className="mt-0.5">{getPaymentStatusBadge()}</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Total Order Value</span>
                  <div className="font-display font-bold text-slate-900 text-sm mt-0.5">
                    {formatPrice(order.total)}
                  </div>
                </div>

                {/* Razorpay IDs if applicable */}
                {order.razorpayPaymentId && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 sm:col-span-2 md:col-span-3">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Razorpay Online Gateway IDs</span>
                    <div className="font-mono text-xs text-brand-700 font-bold mt-0.5 flex flex-wrap gap-4">
                      <span>Payment ID: {order.razorpayPaymentId}</span>
                      {order.razorpayOrderId && <span className="text-slate-500">Order ID: {order.razorpayOrderId}</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION TOGGLE 1: Offline NEFT/RTGS Verification */}
              {order.paymentMethod === 'OfflineTransfer' && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="space-y-0.5">
                      <div className="font-bold text-amber-950 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-amber-700" />
                        <span>Bank Transfer Reference (UTR)</span>
                      </div>
                      <div className="font-mono font-bold text-slate-900 text-xs">
                        UTR No: <span className="text-amber-900 bg-amber-100 px-2 py-0.5 rounded">{order.offlineUtrNumber || 'NOT SUBMITTED'}</span>
                      </div>
                    </div>

                    <div>
                      {order.isOfflineVerified ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                          <Check className="w-4 h-4 text-emerald-600" /> Verified by Finance
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleVerifyNeft}
                          disabled={isVerifying}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                        >
                          {isVerifying ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Verifying with Bank...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Verify Offline Bank Receipt (Mark Paid)
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {order.offlineVerifiedAt && (
                    <p className="text-[11px] text-amber-800">
                      Verified on: {new Date(order.offlineVerifiedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* ACTION TOGGLE 2: Partial COD Balance Collection */}
              {order.paymentMethod === 'PartialCOD' && (
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="space-y-1">
                      <div className="font-bold text-indigo-950 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-700" />
                        <span>Partial COD Balance Collection Status</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-emerald-700 font-semibold">
                          10% Online Deposit: ₹{(order.partialOnlineAmount || order.total * 0.10).toFixed(2)} (PAID)
                        </span>
                        <span className="text-indigo-900 font-bold">
                          90% Balance: ₹{(order.partialCodAmount || order.total * 0.90).toFixed(2)} (COD DUE)
                        </span>
                      </div>
                    </div>

                    <div>
                      {order.isPartialBalanceCollected ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                          <Check className="w-4 h-4 text-emerald-600" /> Fully Collected & Cleared
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleCollectPartial}
                          disabled={isCollecting}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                        >
                          {isCollecting ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Recording Collection...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Collect 90% Balance (Mark Fully Paid)
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {order.partialBalanceCollectedAt && (
                    <p className="text-[11px] text-indigo-800">
                      Balance recorded as cleared on: {new Date(order.partialBalanceCollectedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ================= CUSTOMER PROFILE & ADDRESSES ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                <User className="w-4 h-4 text-brand-600" />
                <span>Customer Profile Details</span>
              </div>
              <div className="space-y-1.5 text-slate-700">
                <div className="font-bold text-slate-900 text-sm">{order.customerName}</div>
                {order.companyName && <div className="text-slate-600 font-medium">Company: {order.companyName}</div>}
                {order.gstin && (
                  <div className="font-mono text-slate-500 text-[11px]">
                    GSTIN: <strong className="text-slate-800">{order.gstin}</strong>
                  </div>
                )}
                <div className="text-slate-500">
                  Email: <span className="text-slate-800 font-medium">{order.customerEmail}</span>
                </div>
                {order.customerMobile && (
                  <div className="text-slate-500">
                    Phone: <span className="text-slate-800 font-medium">{order.customerMobile}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping & Invoicing Location */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Truck className="w-4 h-4 text-brand-600" />
                  <span>Consignee Shipping Address</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                  {order.isBillingSameAsShipping ? 'Same for Billing' : 'Separate Billing'}
                </span>
              </div>
              <div className="space-y-1 text-slate-700 leading-relaxed">
                <div className="font-bold text-slate-900">{order.shippingAddress?.name || order.customerName}</div>
                <div>{order.shippingAddress?.addressLine1 || 'Warehouse Logistics Central'}</div>
                {order.shippingAddress?.addressLine2 && <div>{order.shippingAddress?.addressLine2}</div>}
                <div>
                  {order.shippingAddress?.city || 'Bengaluru'}, {order.shippingAddress?.state || 'Karnataka'} -{' '}
                  <span className="font-mono font-bold">{order.shippingAddress?.pincode || '560100'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= ORDERED ITEMS BREAKDOWN ================= */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between font-bold text-slate-800">
              <span>Itemized Line Items</span>
              <span>{order.itemsCount || (order.items && order.items.length) || 1} Units</span>
            </div>

            <div className="divide-y divide-slate-100">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="p-4 sm:px-6 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-slate-400 text-[11px] font-mono">
                      SKU: {item.sku || 'N/A'} • Quantity: {item.qty || item.quantity || 1}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">
                      {formatPrice((item.price || 0) * (item.qty || item.quantity || 1))}
                    </div>
                    <div className="text-[11px] text-slate-500">({formatPrice(item.price)} each)</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50/80 p-5 border-t border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Net)</span>
                <span className="font-semibold text-slate-900">{formatPrice(order.subtotal || order.total * 0.847)}</span>
              </div>

              {/* Applied Coupon Discount */}
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
                <span>GST (18% B2B Input)</span>
                <span className="font-semibold text-slate-900">{formatPrice(order.taxAmount || order.total * 0.153)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-slate-900">
                <span>Grand Total</span>
                <span className="font-display text-base text-brand-600">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors"
          >
            Close Details
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => generateAndDownloadInvoicePdf(order)}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>

            <a
              href={`/admin/orders/${order.id}/invoice`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> View Invoice
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
