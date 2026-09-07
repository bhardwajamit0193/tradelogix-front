import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchOrdersApi,
} from '../../services/orderService.js';
import { formatPrice } from '../../utils/formatters.js';
import {
  Search,
  Eye,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Sparkles,
  RotateCcw,
  FileText,
  CreditCard,
  Building2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Download,
  Loader2,
} from 'lucide-react';
import { generateAndDownloadInvoicePdf } from './InvoicePdfDocument.jsx';

export default function OrderTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [downloadingOrderId, setDownloadingOrderId] = useState(null);

  const handleDownloadInvoice = async (e, order) => {
    e.preventDefault();
    e.stopPropagation();
    setDownloadingOrderId(order.id);
    try {
      await generateAndDownloadInvoicePdf(order);
    } catch (err) {
      console.error('Failed to download invoice PDF', err);
    } finally {
      setDownloadingOrderId(null);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    const liveList = await fetchOrdersApi();
    if (liveList && Array.isArray(liveList)) {
      setOrders(liveList);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchesStatus =
        statusFilter === 'All' ||
        (ord.fulfillmentStatus || ord.status || '').toLowerCase() === statusFilter.toLowerCase();

      const matchesPayment =
        paymentFilter === 'All' ||
        (ord.paymentMethod || '').toLowerCase() === paymentFilter.toLowerCase();

      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesStatus && matchesPayment;

      const orderIdStr = (ord.id || '').toLowerCase();
      const custNameStr = (ord.customerName || '').toLowerCase();
      const custEmailStr = (ord.customerEmail || '').toLowerCase();
      const remarksStr = (ord.orderRemarks || '').toLowerCase();
      const utrStr = (ord.offlineUtrNumber || '').toLowerCase();

      const matchesSearch =
        orderIdStr.includes(query) ||
        custNameStr.includes(query) ||
        custEmailStr.includes(query) ||
        remarksStr.includes(query) ||
        utrStr.includes(query);

      return matchesStatus && matchesPayment && matchesSearch;
    });
  }, [orders, statusFilter, paymentFilter, searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, paymentFilter, searchQuery, pageSize]);

  // Paginated Slices
  const totalItems = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredOrders.slice(startIndex, startIndex + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const getFulfillmentBadge = (status) => {
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

  const getPaymentStatusBadge = (order) => {
    const st = order.paymentStatus || 'Pending';
    if (st.includes('Paid')) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
          <CheckCircle2 className="w-2.5 h-2.5" /> Paid
        </span>
      );
    }
    if (st.includes('NEFT') || st.includes('Verification')) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" /> Pending NEFT
        </span>
      );
    }
    if (st.includes('Partial')) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" /> Partial COD (10%+90%)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1">
        <DollarSign className="w-2.5 h-2.5" /> COD
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls & Filter Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Customer, UTR, or Remarks..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
          />
        </div>

        {/* Filter Controls Row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Payment Method Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
              Payment:
            </span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
            >
              <option value="All">All Gateways</option>
              <option value="Razorpay">Razorpay Gateway</option>
              <option value="OfflineTransfer">Offline Bank Transfer</option>
              <option value="PartialCOD">Partial COD</option>
              <option value="COD">Standard COD</option>
            </select>
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap pl-1">
              Status:
            </span>
            {['All', 'Pending', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Live DB Refresh Button */}
          <button
            onClick={loadOrders}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
            title="Refresh Live Orders from Database"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4 pl-6">Order ID & Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4">Total Value</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading database orders...
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-400">
                    No orders matching the active search or filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const totalVal = parseFloat(order.totalAmount || order.total || 0);
                  const orderDetailUrl = `/admin/orders/${order.id}`;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Order ID & Link */}
                      <td className="p-4 pl-6">
                        <a
                          href={orderDetailUrl}
                          className="font-mono font-bold text-brand-600 hover:text-brand-700 text-xs hover:underline inline-flex items-center gap-1"
                        >
                          {order.id}
                        </a>
                        <div className="text-[11px] text-slate-400">{order.date || 'Recent'}</div>
                      </td>

                      {/* Customer */}
                      <td className="p-4 max-w-xs">
                        <div className="font-bold text-slate-900">{order.customerName || 'B2B Buyer'}</div>
                        <div className="text-[11px] text-slate-500 truncate">{order.customerEmail || ''}</div>
                      </td>

                      {/* Payment Method */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">
                          {order.paymentMethod === 'Razorpay'
                            ? 'Razorpay Gateway'
                            : order.paymentMethod === 'OfflineTransfer'
                            ? 'Offline Bank Transfer'
                            : order.paymentMethod === 'PartialCOD'
                            ? 'Partial COD (10%+90%)'
                            : 'Cash On Delivery'}
                        </div>
                        {order.offlineUtrNumber && (
                          <div className="font-mono text-[10px] text-slate-400">UTR: {order.offlineUtrNumber}</div>
                        )}
                      </td>

                      {/* Payment Status Badge */}
                      <td className="p-4">{getPaymentStatusBadge(order)}</td>

                      {/* Total Amount (Correct Value) */}
                      <td className="p-4 font-display font-black text-slate-900 text-sm">
                        {formatPrice(totalVal)}
                      </td>

                      {/* Fulfillment Status Simple Badge */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${getFulfillmentBadge(
                            order.fulfillmentStatus || order.status
                          )}`}
                        >
                          {order.fulfillmentStatus || order.status || 'Pending'}
                        </span>
                      </td>

                      {/* Actions: Direct PDF Download and Link to Full Order Details Page */}
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleDownloadInvoice(e, order)}
                            disabled={downloadingOrderId === order.id}
                            className="px-2.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white border border-brand-200 hover:border-brand-600 text-xs font-bold transition-all inline-flex items-center gap-1 shadow-sm disabled:opacity-50"
                            title="Download Tax Invoice PDF"
                          >
                            {downloadingOrderId === order.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden xl:inline">PDF</span>
                          </button>
                          <a
                            href={orderDetailUrl}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-800 text-slate-700 hover:text-white border border-slate-200 hover:border-slate-800 text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Details</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION CONTROLS FOOTER ================= */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          {/* Items count & Per Page Selector */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-slate-500 font-medium">
              Showing{' '}
              <strong className="text-slate-900">
                {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-900">
                {Math.min(currentPage * pageSize, totalItems)}
              </strong>{' '}
              of <strong className="text-slate-900">{totalItems}</strong> orders
            </span>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px] font-bold uppercase">Per Page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 font-bold text-xs text-slate-800 outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Navigation Page Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Page indicator pill */}
            <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 text-xs shadow-sm">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
