import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  fetchOrderByIdApi,
  updateOrderStatus,
  verifyOfflinePayment,
  updateOrderUtr,
  collectPartialBalance,
  uploadOrderInvoicePdfApi,
  updateOrderInvoicePdfApi,
} from '../../services/orderService.js';
import { confirmDialog } from '../../utils/dialogs.js';
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
  Download,
  XCircle,
  AlertTriangle,
  Save,
  Send,
  Info,
  Ban,
  UploadCloud,
  Trash2,
  ExternalLink,
  FileCheck,
  Eye,
  Upload,
} from 'lucide-react';

const getFullInvoiceUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = (typeof window !== 'undefined' && window.__PUBLIC_API_URL__) || 'http://localhost:6543';
  return `${baseUrl.replace(/\/$/, '')}${url.startsWith('/') ? url : `/${url}`}`;
};

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
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Cancellation & Logistics Inputs
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [carrierNameInput, setCarrierNameInput] = useState('');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [utrInput, setUtrInput] = useState('');

  // Manual Invoice PDF Management States
  const [invoiceNumberInput, setInvoiceNumberInput] = useState('');
  const [isUploadingInvoice, setIsUploadingInvoice] = useState(false);
  const [isSavingInvoiceNumber, setIsSavingInvoiceNumber] = useState(false);
  const [selectedInvoiceFile, setSelectedInvoiceFile] = useState(null);
  const [isDraggingInvoice, setIsDraggingInvoice] = useState(false);
  const invoiceFileInputRef = useRef(null);

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
      setSelectedStatus(data.fulfillmentStatus || data.status || 'Pending');
      setCancelReasonInput(data.cancelReason || '');
      setCarrierNameInput(data.carrierName || '');
      setTrackingNumberInput(data.trackingNumber || '');
      setUtrInput(data.offlineUtrNumber || '');
      setInvoiceNumberInput(data.invoiceNumber || data.id || '');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [initialOrderId]);

  const showNotification = (msg) => {
    if (msg.startsWith('⚠️')) {
      toast.warning(msg.replace(/^⚠️\s*/, ''));
    } else {
      toast.success(msg);
    }
  };

  const handleApplyStatusUpdate = async () => {
    if (!order) return;

    if (selectedStatus === 'Cancelled') {
      if (!cancelReasonInput || cancelReasonInput.trim() === '') {
        showNotification('⚠️ Please enter or select a cancellation reason below, then click "Confirm Reason & Cancel Order".');
        return;
      }
      return handleSaveCancellationReason();
    }

    if (selectedStatus === 'Dispatched') {
      if (!trackingNumberInput || trackingNumberInput.trim() === '') {
        showNotification('⚠️ Please enter the Airway Bill (AWB) Tracking No. below, then click "Save & Send Dispatch Tracking".');
        return;
      }
      return handleSaveLogisticsTracking();
    }

    setIsUpdating(true);
    const updatedList = await updateOrderStatus(order.id, selectedStatus, {});
    const matched = updatedList.find((o) => o.id === order.id);
    if (matched) {
      setOrder(matched);
      setSelectedStatus(matched.fulfillmentStatus || matched.status || selectedStatus);
    } else {
      setOrder({ ...order, status: selectedStatus, fulfillmentStatus: selectedStatus });
    }
    setIsUpdating(false);
    showNotification(`Fulfillment status updated to "${selectedStatus}" and email notified!`);
  };

  const handleSaveCancellationReason = async () => {
    if (!order) return;
    if (!cancelReasonInput || cancelReasonInput.trim() === '') {
      showNotification('⚠️ Please select or type a cancellation reason before saving.');
      return;
    }
    setIsUpdating(true);
    const updatedList = await updateOrderStatus(order.id, 'Cancelled', {
      cancelReason: cancelReasonInput.trim(),
    });
    const matched = updatedList.find((o) => o.id === order.id);
    if (matched) {
      setOrder(matched);
      setSelectedStatus('Cancelled');
    } else {
      setOrder({ ...order, status: 'Cancelled', fulfillmentStatus: 'Cancelled', cancelReason: cancelReasonInput.trim() });
      setSelectedStatus('Cancelled');
    }
    setIsUpdating(false);
    showNotification('Order marked as Cancelled & cancellation email sent with your reason!');
  };

  const handleSaveLogisticsTracking = async () => {
    if (!order) return;
    if (!trackingNumberInput || trackingNumberInput.trim() === '') {
      showNotification('⚠️ Please enter Airway Bill (AWB) Tracking No. before saving.');
      return;
    }
    setIsUpdating(true);
    const updatedList = await updateOrderStatus(order.id, 'Dispatched', {
      carrierName: carrierNameInput.trim() || 'TradeLogix Express Air Cargo',
      trackingNumber: trackingNumberInput.trim(),
    });
    const matched = updatedList.find((o) => o.id === order.id);
    if (matched) {
      setOrder(matched);
      setSelectedStatus('Dispatched');
    } else {
      setOrder({
        ...order,
        status: 'Dispatched',
        fulfillmentStatus: 'Dispatched',
        carrierName: carrierNameInput.trim() || 'TradeLogix Express Air Cargo',
        trackingNumber: trackingNumberInput.trim(),
      });
      setSelectedStatus('Dispatched');
    }
    setIsUpdating(false);
    showNotification('Consignment marked as Dispatched & live tracking email sent to customer!');
  };

  const handleSaveUtr = async () => {
    if (!order) return;
    if (!utrInput || !utrInput.trim()) {
      toast.warning('Please enter a Bank UTR Transaction Reference');
      return;
    }
    setIsUpdating(true);
    try {
      const updatedList = await updateOrderUtr(order.id, utrInput.trim());
      const matched = updatedList.find((o) => o.id === order.id);
      if (matched) {
        setOrder(matched);
      } else {
        setOrder({ ...order, offlineUtrNumber: utrInput.trim() });
      }
      toast.success('Bank UTR Transaction Reference saved successfully!');
    } catch (e) {
      toast.error('Failed to update Bank UTR number');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerifyOffline = async () => {
    if (!order) return;
    setIsUpdating(true);
    const updatedList = await verifyOfflinePayment(
      order.id,
      adminNotesInput || 'NEFT bank credit verified by admin',
      utrInput.trim() || order.offlineUtrNumber || ''
    );
    const matched = updatedList.find((o) => o.id === order.id);
    if (matched) {
      setOrder(matched);
    } else {
      setOrder({
        ...order,
        paymentStatus: 'Paid (Verified NEFT)',
        isOfflineVerified: true,
        offlineUtrNumber: utrInput.trim() || order.offlineUtrNumber,
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

  const handleSelectInvoiceFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF documents (.pdf) are permitted for tax invoices.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error('Invoice PDF exceeds the 25 MB limit.');
      return;
    }
    setSelectedInvoiceFile(file);
  };

  const handleDropInvoiceFile = (e) => {
    e.preventDefault();
    setIsDraggingInvoice(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF documents (.pdf) are permitted for tax invoices.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error('Invoice PDF exceeds the 25 MB limit.');
      return;
    }
    setSelectedInvoiceFile(file);
  };

  const handleUploadInvoicePdf = async () => {
    if (!selectedInvoiceFile || !order) return;

    if (order.invoicePdfUrl) {
      const confirmReplace = await confirmDialog({
        title: 'Replace Existing Invoice?',
        text: 'Uploading a new PDF will automatically delete the old invoice file permanently. Each order only retains one invoice. Proceed?',
        icon: 'warning',
        confirmButtonText: 'Yes, Replace & Delete Old',
        confirmButtonColor: '#2563eb',
      });
      if (!confirmReplace) return;
    }

    setIsUploadingInvoice(true);
    try {
      const res = await uploadOrderInvoicePdfApi(order.id, selectedInvoiceFile);
      setOrder((prev) => ({
        ...prev,
        invoicePdfUrl: res.invoicePdfUrl,
        invoiceNumber: res.invoiceNumber || invoiceNumberInput.trim() || prev.invoiceNumber,
      }));
      if (res.invoiceNumber) {
        setInvoiceNumberInput(res.invoiceNumber);
      }
      setSelectedInvoiceFile(null);
      if (invoiceFileInputRef.current) {
        invoiceFileInputRef.current.value = '';
      }
      toast.success('New invoice uploaded. Previous invoice file was automatically deleted!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to upload invoice PDF');
    } finally {
      setIsUploadingInvoice(false);
    }
  };

  const handleSaveInvoiceNumber = async () => {
    if (!order) return;
    setIsSavingInvoiceNumber(true);
    try {
      await updateOrderInvoicePdfApi(order.id, order.invoicePdfUrl, invoiceNumberInput.trim());
      setOrder((prev) => ({
        ...prev,
        invoiceNumber: invoiceNumberInput.trim(),
      }));
      toast.success('Invoice number updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update invoice number');
    } finally {
      setIsSavingInvoiceNumber(false);
    }
  };

  const handleDeleteInvoicePdf = async () => {
    if (!order || !order.invoicePdfUrl) return;
    const ok = await confirmDialog({
      title: 'Delete Invoice PDF?',
      text: 'This will permanently delete the invoice PDF file from the server. Are you sure?',
      confirmButtonText: 'Yes, Delete Permanently',
      confirmButtonColor: '#dc2626',
    });
    if (!ok) return;

    setIsUploadingInvoice(true);
    try {
      await updateOrderInvoicePdfApi(order.id, null, invoiceNumberInput.trim() || null);
      setOrder((prev) => ({
        ...prev,
        invoicePdfUrl: null,
      }));
      setSelectedInvoiceFile(null);
      if (invoiceFileInputRef.current) {
        invoiceFileInputRef.current.value = '';
      }
      toast.success('Invoice PDF file permanently deleted from server.');
    } catch (err) {
      toast.error(err.message || 'Failed to remove invoice PDF');
    } finally {
      setIsUploadingInvoice(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (!order?.invoicePdfUrl) {
      toast.info('No invoice PDF has been uploaded yet. Please upload the official invoice PDF using the upload field below.');
      return;
    }
    const fullUrl = getFullInvoiceUrl(order.invoicePdfUrl);
    window.open(fullUrl, '_blank');
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
            type="button"
            onClick={handleDownloadInvoice}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-md shadow-brand-500/20 cursor-pointer"
            title={order.invoicePdfUrl ? 'Download Official Tax Invoice PDF' : 'Upload invoice PDF first'}
          >
            <Download className="w-3.5 h-3.5" /> Download Invoice (PDF)
          </button>

          {order.invoicePdfUrl ? (
            <a
              href={getFullInvoiceUrl(order.invoicePdfUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" /> View Invoice
            </a>
          ) : (
            <button
              type="button"
              onClick={() => toast.info('No invoice PDF has been uploaded yet. Please upload it using the section below.')}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Upload invoice PDF below"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" /> View Invoice
            </button>
          )}
        </div>
      </div>

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

          {/* Quick Fulfillment Dropdown Selector & Update Button */}
          <div className="bg-slate-50 p-2.5 sm:p-3 rounded-2xl border border-slate-200 flex items-center gap-2.5 shrink-0 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">
              Fulfillment Status:
            </span>
            <select
              value={selectedStatus || order.fulfillmentStatus || order.status || 'Pending'}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={isUpdating}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer shadow-sm disabled:opacity-50"
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button
              type="button"
              onClick={handleApplyStatusUpdate}
              disabled={isUpdating}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isUpdating ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>Update Status</span>
            </button>
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

        {/* ================= ORDER CANCELLATION DETAILS (IF CANCELLED OR SELECTED AS CANCELLED) ================= */}
        {(selectedStatus === 'Cancelled' || order.fulfillmentStatus === 'Cancelled' || order.status === 'Cancelled') && (
          <div className="p-5 sm:p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-4 shadow-sm animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-rose-200/80 flex-wrap gap-2">
              <div className="flex items-center gap-2.5 font-bold text-sm text-rose-900">
                <Ban className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Order Cancellation — Reason Required & Email Notification</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                  Status: Cancelled
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white border border-slate-700">
                  Invoice: VOID
                </span>
              </div>
            </div>

            {/* Currently Saved Reason in Database */}
            {order.cancelReason ? (
              <div className="p-4 bg-white rounded-xl border border-rose-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Currently Saved Reason (Active on Customer Dashboard, Invoice & Emails):
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Saved in DB
                  </span>
                </div>
                <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-100 font-semibold text-slate-800 text-xs sm:text-sm leading-relaxed">
                  "{order.cancelReason}"
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Please select or type a cancellation reason below, then click <strong>"Confirm Reason & Cancel Order"</strong> to apply status and dispatch the email.</span>
              </div>
            )}

            {/* Input Form to Add or Update Reason */}
            <div className="space-y-3 pt-1">
              <label className="text-xs font-bold text-rose-900 uppercase tracking-wider block">
                {order.cancelReason ? 'Update / Edit Cancellation Reason:' : 'Enter Cancellation Reason (Required):'}
              </label>

              {/* Quick Reason Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[11px] font-bold text-rose-800 mr-1">Quick Select:</span>
                {[
                  'Buyer requested cancellation due to project delay',
                  'Item out of stock / factory replenishment delayed',
                  'Offline NEFT/RTGS payment verification failed / expired',
                  'Duplicate wholesale order placed by client',
                  'Price quotation or GST address discrepancy',
                ].map((reasonChip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCancelReasonInput(reasonChip)}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white hover:bg-rose-100/70 text-rose-900 border border-rose-200 hover:border-rose-300 transition-all text-left cursor-pointer shadow-2xs active:scale-95"
                  >
                    {reasonChip}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <input
                  type="text"
                  value={cancelReasonInput}
                  onChange={(e) => setCancelReasonInput(e.target.value)}
                  placeholder="Enter official wholesale cancellation reason..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-rose-300 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-rose-500 outline-none shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleSaveCancellationReason}
                  disabled={isUpdating || !cancelReasonInput}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{order.cancelReason ? 'Update Reason & Resend Email' : 'Confirm Reason & Cancel Order'}</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-rose-700 pt-0.5">
                <Info className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>This cancellation reason is recorded in the database and sent to the buyer in their cancellation email as <code className="font-mono text-rose-800 bg-rose-100 px-1 py-0.5 rounded text-[10px] font-bold">{`{cancelReason}`}</code>.</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= LOGISTICS & AWB TRACKING (IF DISPATCHED, DELIVERED, OR HAS LOGISTICS DATA) ================= */}
        {(selectedStatus === 'Dispatched' ||
          selectedStatus === 'Delivered' ||
          order.fulfillmentStatus === 'Dispatched' ||
          order.fulfillmentStatus === 'Delivered' ||
          order.status === 'Dispatched' ||
          order.status === 'Delivered' ||
          order.carrierName ||
          order.trackingNumber) && (
          <div className="p-5 sm:p-6 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 space-y-4 shadow-sm animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-blue-200/80 flex-wrap gap-2">
              <div className="flex items-center gap-2.5 font-bold text-sm text-blue-900">
                <Truck className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Logistics & Airway Bill (AWB) Tracking Details</span>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                (order.fulfillmentStatus === 'Delivered' || selectedStatus === 'Delivered')
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-blue-100 text-blue-800 border-blue-300'
              }`}>
                Status: {order.fulfillmentStatus || order.status || selectedStatus || 'Dispatched'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
                  Carrier / Logistics Partner ({`{carrierName}`})
                </label>
                <input
                  type="text"
                  value={carrierNameInput}
                  onChange={(e) => setCarrierNameInput(e.target.value)}
                  placeholder="TradeLogix Express / Blue Dart / Delhivery"
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-300 bg-white text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
                  Airway Bill / Tracking AWB No ({`{trackingNumber}`})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={trackingNumberInput}
                    onChange={(e) => setTrackingNumberInput(e.target.value)}
                    placeholder="AWB-98201948201"
                    className="w-full px-4 py-2.5 rounded-xl border border-blue-300 bg-white text-slate-900 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={handleSaveLogisticsTracking}
                    disabled={isUpdating || !trackingNumberInput}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{order.trackingNumber ? 'Update Tracking & Notify' : 'Save & Send Dispatch Tracking'}</span>
                  </button>
                </div>
              </div>
            </div>
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

            {/* Bank UTR Transaction Reference Section */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3.5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                      <span>Bank UTR Transaction Reference</span>
                      <span className="text-[10px] font-mono font-normal text-slate-500">(NEFT / RTGS / IMPS)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Record, update, or audit the official banking transaction reference / UTR number for this order.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {order.offlineUtrNumber ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                      UTR RECORDED
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                      UTR PENDING
                    </span>
                  )}

                  {order.isOfflineVerified && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      NEFT VERIFIED
                    </span>
                  )}
                </div>
              </div>

              {/* UTR Input & Action Buttons */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                  Bank UTR Reference Number
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={utrInput}
                      onChange={(e) => setUtrInput(e.target.value)}
                      placeholder="e.g. UTR-2026-982019482 or SBIN00012345678"
                      className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-white text-slate-900 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none shadow-2xs"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveUtr}
                    disabled={isUpdating || !utrInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all inline-flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-400" />
                    <span>{order.offlineUtrNumber ? 'Update UTR' : 'Save UTR'}</span>
                  </button>

                  {order.paymentMethod === 'OfflineTransfer' && !order.isOfflineVerified && (
                    <button
                      type="button"
                      onClick={handleVerifyOffline}
                      disabled={isUpdating}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md inline-flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verify NEFT Payment</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

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

        {/* ================= OFFICIAL TAX INVOICE PDF (MANUAL UPLOAD) ================= */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-100/90 px-6 py-3.5 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
            <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>Official Tax Invoice PDF (Manual Upload)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 border border-slate-300 text-[10px] font-bold">
                AUTO-GENERATE DISABLED
              </span>
              {order.invoicePdfUrl ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  INVOICE UPLOADED
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold inline-flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  INVOICE PENDING UPLOAD
                </span>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Top Row: Invoice Number Input & Status overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Invoice / Tax Bill Reference Number
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={invoiceNumberInput}
                    onChange={(e) => setInvoiceNumberInput(e.target.value)}
                    placeholder={order.id || 'INV-2026-0001'}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-mono font-bold focus:ring-2 focus:ring-brand-500 outline-none shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={handleSaveInvoiceNumber}
                    disabled={isSavingInvoiceNumber || !invoiceNumberInput.trim()}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingInvoiceNumber ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Save No.</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Custom invoice or bill number issued from your accounting or ERP software.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Invoice Document Status
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    {order.invoicePdfUrl ? (
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Official PDF document uploaded and available to buyer</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-700 font-medium text-xs">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>No invoice PDF attached. Buyer sees "Invoice Pending Upload".</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  Allowed file format: <strong>.pdf</strong> (max 25MB). Auto-generation is disabled.
                </p>
              </div>
            </div>

            {/* Single Invoice Enforcement Notice */}
            <div className="p-3.5 bg-blue-50/90 rounded-2xl border border-blue-200/80 flex items-start sm:items-center justify-between text-xs text-blue-950 gap-2 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="leading-relaxed">
                  <strong>Single Active Invoice Rule:</strong> Each order can have only one official invoice PDF. When you upload a replacement or delete it, the old invoice file is permanently and automatically deleted from the server.
                </span>
              </div>
            </div>

            {/* If Invoice Already Uploaded: Preview & Management Card */}
            {order.invoicePdfUrl && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm">
                        Official Invoice Attached
                      </h4>
                      {order.invoiceNumber && (
                        <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-mono font-bold text-[11px]">
                          #{order.invoiceNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 font-mono break-all line-clamp-1">
                      {order.invoicePdfUrl}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
                  <a
                    href={getFullInvoiceUrl(order.invoicePdfUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100/50 text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-700" /> View PDF
                  </a>
                  <a
                    href={getFullInvoiceUrl(order.invoicePdfUrl)}
                    download={`Invoice-${order.invoiceNumber || order.id}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm shadow-emerald-500/20"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                  <button
                    type="button"
                    onClick={() => invoiceFileInputRef.current?.click()}
                    disabled={isUploadingInvoice}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-600" /> Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteInvoicePdf}
                    disabled={isUploadingInvoice}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Delete
                  </button>
                </div>
              </div>
            )}

            {/* File Dropzone & Upload Picker */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingInvoice(true);
              }}
              onDragLeave={() => setIsDraggingInvoice(false)}
              onDrop={handleDropInvoiceFile}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
                isDraggingInvoice
                  ? 'border-brand-500 bg-brand-50/50 scale-[1.005]'
                  : 'border-slate-300 hover:border-slate-400 bg-white'
              }`}
            >
              <input
                type="file"
                ref={invoiceFileInputRef}
                onChange={handleSelectInvoiceFile}
                accept=".pdf,application/pdf"
                className="hidden"
              />

              <div className="max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 mx-auto shadow-2xs">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {order.invoicePdfUrl ? 'Upload Replacement Invoice PDF' : 'Upload Official Tax Invoice PDF'}
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Drag and drop your signed GST invoice PDF here, or click to browse.
                  </p>
                </div>

                {selectedInvoiceFile ? (
                  <div className="p-3 bg-brand-50/80 border border-brand-200 rounded-xl flex items-center justify-between text-left gap-3 animate-fadeIn">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileText className="w-5 h-5 text-brand-600 shrink-0" />
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-brand-950 truncate">
                          {selectedInvoiceFile.name}
                        </div>
                        <div className="text-[10px] text-brand-700">
                          {(selectedInvoiceFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceFile(null)}
                        disabled={isUploadingInvoice}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Clear selected file"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleUploadInvoicePdf}
                        disabled={isUploadingInvoice}
                        className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isUploadingInvoice ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Confirm & Upload</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => invoiceFileInputRef.current?.click()}
                      disabled={isUploadingInvoice}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5 text-brand-400" />
                      <span>Browse PDF File</span>
                    </button>
                    <p className="text-[10px] text-slate-400 mt-2">
                      Accepted file: Adobe PDF (.pdf) • Maximum file size: 25 Megabytes
                    </p>
                  </div>
                )}
              </div>
            </div>
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
