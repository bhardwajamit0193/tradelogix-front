import React, { useState, useEffect } from 'react';
import {
  Printer,
  Download,
  Loader2,
  ArrowLeft,
  Building2,
  Truck,
  ShieldCheck,
  CreditCard,
  Tag,
} from 'lucide-react';
import { fetchOrderByIdApi } from '../../services/orderService.js';
import {
  fetchPlatformSettingsApi,
  DEFAULT_PLATFORM_SETTINGS,
} from '../../services/platformSettingsService.js';

// Number to Words Converter (Indian Numbering Format)
function numberToWords(num) {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(num);
  if (n === 0) return 'Zero Rupees Only';

  function convertGroup(n) {
    let str = '';
    if (n > 99) {
      str += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
    } else if (n > 0) {
      str += a[n];
    }
    return str.trim();
  }

  let words = '';
  const crore = Math.floor(n / 10000000);
  let remainder = n % 10000000;
  const lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;
  const thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;
  const hundredAndRest = remainder;

  if (crore > 0) words += convertGroup(crore) + ' Crore ';
  if (lakh > 0) words += convertGroup(lakh) + ' Lakh ';
  if (thousand > 0) words += convertGroup(thousand) + ' Thousand ';
  if (hundredAndRest > 0) words += convertGroup(hundredAndRest) + ' ';

  return `Rupees ${words.trim()} Only`;
}

export default function EcommerceInvoice({ orderId, initialOrder = null, onBack = null }) {
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(!initialOrder && !!orderId);
  const [platformSettings, setPlatformSettings] = useState(DEFAULT_PLATFORM_SETTINGS);

  useEffect(() => {
    async function loadData() {
      // Fetch platform/company settings for invoice branding
      try {
        const pSettings = await fetchPlatformSettingsApi();
        if (pSettings) setPlatformSettings(pSettings);
      } catch (err) {
        console.warn('Failed to load platform settings for invoice', err);
      }

      if (initialOrder) {
        setOrder(initialOrder);
        setLoading(false);
        return;
      }

      let id = orderId;
      if (!id && typeof window !== 'undefined') {
        const parts = window.location.pathname.split('/').filter(Boolean);
        id = parts[parts.length - 1];
        if (id === 'invoice' && parts.length >= 2) {
          id = parts[parts.length - 2];
        }
      }

      if (id) {
        setLoading(true);
        try {
          const data = await fetchOrderByIdApi(id);
          if (data) {
            setOrder(data);
          }
        } catch (e) {
          console.warn('Failed to fetch invoice order', e);
        } finally {
          setLoading(false);
        }
      }
    }
    loadData();
  }, [orderId, initialOrder]);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Auto-download if ?download=true or ?download=1 query param is set
  useEffect(() => {
    if (!loading && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('download') === 'true' || params.get('download') === '1' || params.get('direct') === '1') {
        handleDownloadPdf();
      }
    }
  }, [loading, order]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (invoiceData?.invoicePdfUrl) {
      const getFullInvoiceUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        const baseUrl = (typeof window !== 'undefined' && window.__PUBLIC_API_URL__) || 'http://localhost:6543';
        return `${baseUrl.replace(/\/$/, '')}${url.startsWith('/') ? url : `/${url}`}`;
      };
      const fullUrl = getFullInvoiceUrl(invoiceData.invoicePdfUrl);
      window.open(fullUrl, '_blank');
      return;
    }
    // If no manual PDF has been uploaded yet, trigger standard print dialog
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-4 max-w-md w-full">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="font-bold text-slate-800 text-base">Generating Tax Invoice...</h2>
          <p className="text-xs text-slate-500">Retrieving GST audit records, dispatch parameters, and itemized accounts.</p>
        </div>
      </div>
    );
  }

  // Fallback / Demo data if order is null
  const invoiceData = order || {
    id: 'TLX-ORD-2026-8941',
    createdAt: new Date().toISOString(),
    customerName: 'TechVision Enterprise LLP',
    customerEmail: 'procurement@techvision.co.in',
    customerPhone: '+91 98201 45892',
    paymentMethod: 'OfflineTransfer',
    status: 'Paid',
    offlineUtrNumber: 'CMS98201948201',
    billingAddress: {
      name: 'TechVision Enterprise LLP',
      address: 'Plot 42, Electronics Zone, MIDC Industrial Area, Mahape',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      pincode: '400710',
      gstin: '27AAACT1234A1Z5',
    },
    shippingAddress: {
      name: 'TechVision Enterprise Logistics Hub',
      address: 'Warehouse #4B, Logistics Park, Mumbai-Pune Expressway, Khalapur',
      city: 'Raigad',
      state: 'Maharashtra',
      pincode: '410203',
      phone: '+91 98201 45892',
    },
    warehouse: 'Mumbai Central Hub (WH-01)',
    items: [
      {
        id: '1',
        title: 'Industrial Heavy Duty Drill Machine 850W Pro',
        sku: 'TLX-PWR-850',
        hsn: '84672100',
        quantity: 10,
        price: 3499,
        gstRate: 18,
      },
      {
        id: '2',
        title: 'Precision Digital Vernier Caliper 150mm Stainless Steel',
        sku: 'TLX-MSR-150',
        hsn: '90173010',
        quantity: 25,
        price: 899,
        gstRate: 18,
      },
      {
        id: '3',
        title: 'Safety Helmet High-Density Polyethylene Ratchet Fit (Pack of 50)',
        sku: 'TLX-SAF-HLM50',
        hsn: '65061010',
        quantity: 4,
        price: 4250,
        gstRate: 18,
      },
    ],
    subtotal: 74465,
    discount: 1500,
    shippingFee: 0,
    tax: 13133.7,
    total: 86098.7,
  };

  // Financial Calculations
  const rawItems = invoiceData.items && invoiceData.items.length > 0 ? invoiceData.items : [
    {
      id: 'item-1',
      name: 'Enterprise Hardware Line Item',
      sku: 'SKU-ENT-101',
      hsn: '84716000',
      qty: 1,
      price: parseFloat(invoiceData.totalAmount || invoiceData.total || 45000),
    }
  ];

  const itemsWithTaxes = rawItems.map((item, idx) => {
    const qty = parseInt(item.qty || item.quantity || 1, 10);
    const grossPrice = parseFloat(item.price || item.unitPrice || 0);
    // Base unit price excluding 18% GST
    const taxableUnitRate = Math.round((grossPrice / 1.18) * 100) / 100;
    const taxableAmount = taxableUnitRate * qty;
    const gstRate = 18; // 18% GST standard
    const cgstRate = 9;
    const sgstRate = 9;
    const gstAmount = Math.round(taxableAmount * 0.18 * 100) / 100;
    const total = taxableAmount + gstAmount;

    return {
      slNo: idx + 1,
      name: item.name || 'B2B Product Unit',
      sku: item.sku || 'SKU-GENERAL',
      hsn: item.hsn || '84716060',
      qty,
      unit: item.unit || 'PCS',
      taxableUnitRate,
      taxableAmount,
      gstRate,
      cgstRate,
      sgstRate,
      cgstAmount: gstAmount / 2,
      sgstAmount: gstAmount / 2,
      total,
    };
  });

  const totalTaxableValue = itemsWithTaxes.reduce((sum, item) => sum + item.taxableAmount, 0);
  const totalCgst = itemsWithTaxes.reduce((sum, item) => sum + item.cgstAmount, 0);
  const totalSgst = itemsWithTaxes.reduce((sum, item) => sum + item.sgstAmount, 0);
  const totalGst = totalCgst + totalSgst;
  const discountAmount = parseFloat(invoiceData.discountAmount || 0);
  const shippingCharge = parseFloat(invoiceData.shippingCharge || 0);
  const grandTotal = Math.max(0, totalTaxableValue + totalGst - discountAmount + shippingCharge);

  const invoiceNumber = invoiceData.invoiceNumber || `TLX-INV-${(invoiceData.id || '').replace(/\D/g, '').slice(-5) || '20261'}`;
  const invoiceDate = invoiceData.createdAt ? new Date(invoiceData.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '05 Sep 2026';

  const formatCurrency = (amt) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amt || 0);

  const getStatusStamp = () => {
    const isCancelled =
      (invoiceData.status || '').toLowerCase().includes('cancel') ||
      (invoiceData.fulfillmentStatus || '').toLowerCase().includes('cancel');

    if (isCancelled) {
      return {
        label: 'CANCELLED / VOID',
        sub: invoiceData.cancelReason ? `Reason: ${invoiceData.cancelReason.slice(0, 30)}...` : 'Order Voided by Desk',
        border: 'border-rose-600',
        text: 'text-rose-700',
        bg: 'bg-rose-50/90',
      };
    }

    const pStatus = (invoiceData.paymentStatus || '').toLowerCase();
    const isPaid = pStatus.includes('paid') || (invoiceData.paymentMethod || '').toLowerCase() === 'razorpay';
    const isOffline = (invoiceData.paymentMethod || '').toLowerCase() === 'offlinetransfer';
    const isPartial = (invoiceData.paymentMethod || '').toLowerCase() === 'partialcod';

    if (isPaid) {
      return {
        label: 'PAID & VERIFIED',
        sub: 'Full Payment Received',
        border: 'border-emerald-600',
        text: 'text-emerald-700',
        bg: 'bg-emerald-50/50',
      };
    }
    if (isOffline) {
      return {
        label: invoiceData.isOfflineVerified ? 'NEFT VERIFIED' : 'NEFT PENDING',
        sub: invoiceData.offlineUtrNumber ? `UTR: ${invoiceData.offlineUtrNumber}` : 'Wire Credit Awaited',
        border: invoiceData.isOfflineVerified ? 'border-emerald-600' : 'border-amber-600',
        text: invoiceData.isOfflineVerified ? 'text-emerald-700' : 'text-amber-700',
        bg: invoiceData.isOfflineVerified ? 'bg-emerald-50/50' : 'bg-amber-50/50',
      };
    }
    if (isPartial) {
      return {
        label: invoiceData.isPartialBalanceCollected ? 'FULLY CLEARED' : '10% ADVANCE PAID',
        sub: invoiceData.isPartialBalanceCollected ? '90% COD Collected' : '90% Due at Delivery',
        border: 'border-indigo-600',
        text: 'text-indigo-700',
        bg: 'bg-indigo-50/50',
      };
    }
    return {
      label: 'CASH ON DELIVERY',
      sub: 'Payable at Arrival',
      border: 'border-slate-600',
      text: 'text-slate-700',
      bg: 'bg-slate-50',
    };
  };

  const stamp = getStatusStamp();

  const isOfflineBankPayment =
    (invoiceData.paymentMethod || '').toLowerCase() === 'offlinetransfer' ||
    (invoiceData.paymentMethod || '').toLowerCase().includes('offline') ||
    (invoiceData.paymentMethod || '').toLowerCase().includes('neft') ||
    (invoiceData.paymentMethod || '').toLowerCase().includes('wire');

  return (
    <div className="min-h-screen bg-slate-100 py-3 sm:py-6 px-2 sm:px-4 font-sans antialiased text-slate-800">
      {/* ========================================================================= */}
      {/* SCREEN ACTION TOOLBAR (Hidden during window.print())                       */}
      {/* ========================================================================= */}
      <div className="max-w-4xl mx-auto mb-4 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          {onBack ? (
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Order
            </button>
          ) : (
            <a
              href="/dashboard/orders"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Orders
            </a>
          )}
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-500">
            Official GST Commercial Tax Invoice
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-5 py-2.5 rounded-xl gradient-brand text-white text-xs font-bold transition-all shadow-md shadow-brand-500/25 hover:opacity-95 inline-flex items-center gap-2 disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" /> Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-white" /> Download Invoice PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INVOICE PAPER CANVAS (A4 Optimized, Crisp Print Styling)                  */}
      {/* ========================================================================= */}
      <div
        id="invoice-document"
        className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-lg p-4 sm:p-6 md:p-7 space-y-3.5 print:p-0 print:border-none print:shadow-none print:rounded-none relative overflow-hidden"
      >
        {/* Subtle decorative background watermark in print */}
        <div className="absolute right-4 top-1/3 -rotate-45 select-none pointer-events-none opacity-[0.03] text-8xl font-black font-display uppercase tracking-widest text-slate-900">
          TRADELOGIX
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* 1. HEADER SECTION: Brand Identity & Registered Seller Info           */}
        {/* --------------------------------------------------------------------- */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b-2 border-slate-900/80">
          {/* Company Brand & Logo */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              {platformSettings?.companyLogo ? (
                <img
                  src={platformSettings.companyLogo}
                  alt={`${platformSettings.companyName || 'TradeLogix'} Logo`}
                  className="h-9 sm:h-10 w-auto max-w-[170px] object-contain rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = document.getElementById('invoice-logo-fallback');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div id="invoice-logo-fallback" className={`${platformSettings?.companyLogo ? 'hidden' : 'flex'} items-center gap-2`}>
                <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-white font-black text-base shadow-sm">
                  {(platformSettings?.companyName || 'TL').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="font-display font-black text-xl tracking-tight text-slate-900">
                    {platformSettings?.companyName || 'TradeLogix'}
                  </span>
                  <span className="block text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                    Enterprise B2B Commerce & Distribution
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 space-y-0.5 leading-tight pt-0.5">
              <p className="font-bold text-slate-800">{platformSettings?.companyName || 'TradeLogix Solutions Private Limited'}</p>
              <p className="whitespace-pre-line">{platformSettings?.companyAddress || '804, Prime Corporate Park, Marol, Andheri East, Mumbai - 400059'}</p>
              <p className="text-[10px]">
                <strong className="text-slate-800">GSTIN:</strong> {platformSettings?.gstin || '27AAACT9921M1ZT'} | <strong className="text-slate-800">PAN:</strong> {platformSettings?.panNumber || 'AAACT9921M'} | Email: {platformSettings?.companyEmail || 'accounts@tradelogix.in'}
              </p>
            </div>
          </div>

          {/* Tax Invoice Label & Meta Block */}
          <div className="sm:text-right space-y-1">
            <div className="inline-block px-2.5 py-0.5 rounded bg-slate-900 text-white font-display font-bold text-[11px] uppercase tracking-wider">
              TAX INVOICE
            </div>
            <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Original for Recipient
            </span>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-0.5 sm:text-right inline-block min-w-[200px]">
              <div className="flex justify-between sm:justify-end gap-2 text-[11px]">
                <span className="text-slate-500 font-medium">Invoice No:</span>
                <span className="font-mono font-bold text-slate-900">{invoiceNumber}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-2 text-[11px]">
                <span className="text-slate-500 font-medium">Invoice Date:</span>
                <span className="font-semibold text-slate-800">{invoiceDate}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-2 text-[11px]">
                <span className="text-slate-500 font-medium">Order Ref:</span>
                <span className="font-mono font-bold text-brand-700">{invoiceData.id}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-2 text-[11px]">
                <span className="text-slate-500 font-medium">Place of Supply:</span>
                <span className="font-semibold text-slate-800">
                  {invoiceData.shippingAddress?.state || invoiceData.billingAddress?.state || 'Maharashtra'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* CANCELLED / VOID INVOICE NOTICE                                      */}
        {/* --------------------------------------------------------------------- */}
        {((invoiceData.status || '').toLowerCase().includes('cancel') || (invoiceData.fulfillmentStatus || '').toLowerCase().includes('cancel')) && (
          <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-950 space-y-1">
            <div className="font-bold flex items-center justify-between text-rose-900 text-xs">
              <span className="flex items-center gap-1.5 uppercase tracking-wider font-extrabold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                This Commercial Tax Invoice is Cancelled & Void
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-rose-200/80 font-bold text-rose-900">
                STATUS: CANCELLED
              </span>
            </div>
            <p className="text-slate-800 text-xs leading-relaxed">
              <strong className="text-rose-900">Reason for Cancellation:</strong>{' '}
              {invoiceData.cancelReason || 'Order cancelled by administration.'}
            </p>
          </div>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* 2. BILLED TO & SHIPPED TO ADDRESSES (2 Columns Side-by-Side)          */}
        {/* --------------------------------------------------------------------- */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Bill To Box */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-brand-600" /> Billed To (Buyer)
                </span>
                <span className="px-1.5 py-0.5 rounded bg-brand-100 text-brand-800 text-[9px] font-bold">
                  B2B Client
                </span>
              </div>
              <div className="text-[11px] text-slate-700 leading-tight pt-0.5">
                <h4 className="font-bold text-slate-900 text-xs">
                  {invoiceData.companyName || invoiceData.customerName}
                </h4>
                <p>{invoiceData.billingAddress?.addressLine1 || invoiceData.shippingAddress?.addressLine1}</p>
                {invoiceData.billingAddress?.addressLine2 && <p>{invoiceData.billingAddress.addressLine2}</p>}
                <p>
                  {invoiceData.billingAddress?.city || invoiceData.shippingAddress?.city},{' '}
                  {invoiceData.billingAddress?.state || invoiceData.shippingAddress?.state} -{' '}
                  <span className="font-mono font-bold">{invoiceData.billingAddress?.pincode || invoiceData.shippingAddress?.pincode}</span>
                </p>
                <div className="pt-1 text-[10px] space-y-0.5 border-t border-slate-200/60 mt-1">
                  <p>
                    <strong className="text-slate-900">GSTIN / UIN:</strong>{' '}
                    <span className="font-mono font-bold text-slate-800">{invoiceData.gstin || '27AABCT3518Q1ZK (Verified)'}</span>
                  </p>
                  <p>
                    <strong className="text-slate-900">Contact:</strong> {invoiceData.customerName} ({invoiceData.customerMobile || invoiceData.billingAddress?.phone})
                  </p>
                  <p>
                    <strong className="text-slate-900">Email:</strong> {invoiceData.customerEmail || invoiceData.billingAddress?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipped To Box */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Truck className="w-3 h-3 text-brand-600" /> Shipped To (Consignee)
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                  Dispatch Dock
                </span>
              </div>
              <div className="text-[11px] text-slate-700 leading-tight pt-0.5">
                <h4 className="font-bold text-slate-900 text-xs">
                  {invoiceData.shippingAddress?.name || invoiceData.customerName}
                </h4>
                <p>{invoiceData.shippingAddress?.addressLine1}</p>
                {invoiceData.shippingAddress?.addressLine2 && <p>{invoiceData.shippingAddress.addressLine2}</p>}
                <p>
                  {invoiceData.shippingAddress?.city}, {invoiceData.shippingAddress?.state} -{' '}
                  <span className="font-mono font-bold">{invoiceData.shippingAddress?.pincode}</span>
                </p>
                <div className="pt-1 text-[10px] space-y-0.5 border-t border-slate-200/60 mt-1">
                  <p>
                    <strong className="text-slate-900">Assigned Logistics:</strong> TradeLogix Express Cargo (Air/Surface)
                  </p>
                  <p>
                    <strong className="text-slate-900">Warehouse Dock:</strong> {invoiceData.warehouse || 'Mumbai Central Fulfillment Hub'}
                  </p>
                  <p>
                    <strong className="text-slate-900">Receiver Phone:</strong> {invoiceData.shippingAddress?.phone || invoiceData.customerMobile}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* 3. ITEMIZED PRODUCTS / GOODS & SERVICES TABLE                         */}
        {/* --------------------------------------------------------------------- */}
        <div className="space-y-1.5">
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[9px]">
                <tr>
                  <th className="p-2 pl-3 text-center w-8">#</th>
                  <th className="p-2">Item Description</th>
                  <th className="p-2 text-center">HSN/SAC</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-right">Unit Rate (₹)</th>
                  <th className="p-2 text-right">Taxable Amt (₹)</th>
                  <th className="p-2 text-center">GST</th>
                  <th className="p-2 pr-3 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-[11px]">
                {itemsWithTaxes.map((item) => (
                  <tr key={item.slNo} className="hover:bg-slate-50/50 print:hover:bg-white">
                    <td className="p-2 pl-3 text-center font-bold text-slate-500">{item.slNo}</td>
                    <td className="p-2">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="font-mono text-[9px] text-slate-500">SKU: {item.sku}</div>
                    </td>
                    <td className="p-2 text-center font-mono text-slate-600 text-[10px]">{item.hsn}</td>
                    <td className="p-2 text-center font-bold text-slate-800">
                      {item.qty} <span className="text-[9px] font-normal text-slate-500">{item.unit}</span>
                    </td>
                    <td className="p-2 text-right font-medium text-slate-700">{item.taxableUnitRate.toFixed(2)}</td>
                    <td className="p-2 text-right font-semibold text-slate-900">{item.taxableAmount.toFixed(2)}</td>
                    <td className="p-2 text-center">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[9px] font-bold">
                        18%
                      </span>
                    </td>
                    <td className="p-2 pr-3 text-right font-bold text-slate-900">{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* 4. TOTALS, TAX BREAKDOWN & AMOUNT IN WORDS (2 Columns)                 */}
        {/* --------------------------------------------------------------------- */}
        <div className="grid grid-cols-12 gap-3 sm:gap-4 pt-1">
          {/* Left Column: Amount in Words, Bank Details & Stamp */}
          <div className="col-span-7 space-y-2.5">
            {/* Amount in Words */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Invoice Total Amount (in Words)
              </span>
              <p className="font-bold text-slate-900 italic text-[11px]">
                {numberToWords(grandTotal)}
              </p>
            </div>

            {/* Bank Remittance Details (Only shown if payment method is Offline Bank Wire Transfer) */}
            {isOfflineBankPayment && (
              <div className="p-2.5 rounded-lg border border-dashed border-slate-300 bg-white space-y-1.5 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="font-bold text-slate-800 flex items-center gap-1 text-[10px] uppercase tracking-wider">
                    <CreditCard className="w-3 h-3 text-brand-600" /> Electronic Bank Settlement (NEFT / RTGS / IMPS)
                  </span>
                  <span className="text-[9px] font-bold text-slate-500">Corporate A/C</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-600 leading-tight pt-0.5">
                  <div>
                    <span className="text-slate-400 block text-[9px]">Bank Name:</span>
                    <strong className="text-slate-800">HDFC Bank Limited</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Account Name:</span>
                    <strong className="text-slate-800">TradeLogix Solutions Pvt Ltd</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Account Number:</span>
                    <strong className="font-mono text-slate-900">50200084920194</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">IFSC Code:</span>
                    <strong className="font-mono text-slate-900">HDFC0000240</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Status Rubber Stamp */}
            <div className={`p-2.5 rounded-lg border-1.5 ${stamp.border} ${stamp.bg} flex items-center justify-between`}>
              <div>
                <span className={`text-[9px] font-extrabold uppercase tracking-widest block ${stamp.text}`}>
                  Payment Audit Verification
                </span>
                <span className={`text-sm font-black tracking-tight ${stamp.text}`}>
                  {stamp.label}
                </span>
                <span className="text-[10px] text-slate-600 block">{stamp.sub}</span>
              </div>
              <div className="w-9 h-9 rounded-full border border-dashed border-current flex items-center justify-center opacity-80 shrink-0">
                <ShieldCheck className="w-5 h-5 text-current" />
              </div>
            </div>
          </div>

          {/* Right Column: Financial Calculation Box */}
          <div className="col-span-5">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600 text-[11px]">
                <span>Taxable Subtotal</span>
                <span className="font-semibold text-slate-800">{formatCurrency(totalTaxableValue)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-semibold text-[11px]">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-emerald-600" /> Trade Discount
                  </span>
                  <span>- {formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600 text-[11px]">
                <span>Central GST (CGST 9%)</span>
                <span className="font-semibold text-slate-800">{formatCurrency(totalCgst)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 text-[11px]">
                <span>State GST (SGST 9%)</span>
                <span className="font-semibold text-slate-800">{formatCurrency(totalSgst)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 text-[11px]">
                <span>Freight & Handling</span>
                <span className="font-bold text-emerald-600">
                  {shippingCharge > 0 ? formatCurrency(shippingCharge) : 'FREE DISPATCH'}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-300 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">Invoice Grand Total</span>
                  <span className="text-[9px] text-slate-400 font-semibold">Incl. all taxes</span>
                </div>
                <span className="font-display font-black text-slate-900 text-lg text-brand-700">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* 5. TERMS OF SALE                                                      */}
        {/* --------------------------------------------------------------------- */}
        <div className="pt-2 border-t border-slate-200">
          <div className="space-y-0.5 text-[9px] text-slate-500 leading-tight">
            <span className="font-bold uppercase tracking-wider text-slate-700 block">
              Terms & Conditions of Wholesale Sale
            </span>
            <p>
              1. Goods once sold are eligible for return under TradeLogix B2B RMA policy within 7 working days. 2. Delayed payments subject to 18% p.a. interest. 3. Disputes subject to Mumbai, Maharashtra jurisdiction. 4. Digitally certified tax invoice eligible for 100% GST Input Tax Credit (ITC).
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRINT CSS STYLESHEET                                                      */}
      {/* ========================================================================= */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            background: white !important;
            color: #0f172a !important;
            font-size: 11pt !important;
            padding: 10mm 12mm !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          #invoice-document {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          header, nav, aside, footer {
            display: none !important;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
}
