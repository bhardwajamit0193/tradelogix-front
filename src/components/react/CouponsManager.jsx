import React, { useState, useEffect } from 'react';
import {
  fetchCouponsApi,
  deleteCouponApi,
  generateCouponCodeApi,
} from '../../services/couponService.js';
import {
  Search,
  Plus,
  Trash2,
  Edit,
  Copy,
  Check,
  Tag,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  Percent,
  ShoppingCart,
  Package,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';

export default function CouponsManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'publish', 'draft'
  const [typeFilter, setTypeFilter] = useState('all');
  const [counts, setCounts] = useState({ all: 0, publish: 0, draft: 0 });
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetchCouponsApi({
        search: searchQuery,
        status: statusFilter,
        discountType: typeFilter,
      });
      const data = res && res.data !== undefined ? res.data : res;
      const items = Array.isArray(data) ? data : (data?.coupons || []);
      setCoupons(items);
      setCounts(
        data?.counts || {
          all: items.length,
          publish: items.filter((c) => c.status === 'publish').length,
          draft: items.filter((c) => c.status === 'draft').length,
        }
      );
    } catch (err) {
      console.error('Error loading coupons', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadCoupons();
  };

  const handleFilterApply = () => {
    loadCoupons();
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === coupons.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(coupons.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkApply = async () => {
    if (bulkAction === 'delete' && selectedIds.length > 0) {
      if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected coupon(s)?`)) {
        for (const id of selectedIds) {
          await deleteCouponApi(id);
        }
        setSelectedIds([]);
        showToast(`${selectedIds.length} coupons deleted.`);
        loadCoupons();
      }
    }
  };

  const handleDelete = async (id, code) => {
    if (window.confirm(`Delete coupon "${code}"?`)) {
      await deleteCouponApi(id);
      showToast(`Coupon "${code}" deleted.`);
      loadCoupons();
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const showToast = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const formatDiscountType = (type) => {
    switch (type) {
      case 'percent':
        return 'Percentage discount';
      case 'fixed_cart':
        return 'Fixed cart discount';
      case 'fixed_product':
        return 'Fixed product discount';
      default:
        return type;
    }
  };

  const formatExpiryDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const isExpired = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    d.setHours(23, 59, 59, 999);
    return new Date() > d;
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {actionMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {actionMessage}
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Coupons</h1>
            <a
              href="/admin/coupons/add"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 rounded-md transition-all shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add new coupon
            </a>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage promotional discount codes, spend thresholds, item exclusions, and usage limits.
          </p>
        </div>

        {/* View Switch / Status Tabs (All | Published | Draft) */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded transition-colors ${
              statusFilter === 'all'
                ? 'text-blue-600 font-bold bg-blue-50/80 border border-blue-100'
                : 'hover:text-slate-900'
            }`}
          >
            All <span className="text-slate-400 font-normal">({counts.all})</span>
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => setStatusFilter('publish')}
            className={`px-2.5 py-1 rounded transition-colors ${
              statusFilter === 'publish'
                ? 'text-blue-600 font-bold bg-blue-50/80 border border-blue-100'
                : 'hover:text-slate-900'
            }`}
          >
            Published <span className="text-slate-400 font-normal">({counts.publish})</span>
          </button>
          {counts.draft > 0 && (
            <>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => setStatusFilter('draft')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  statusFilter === 'draft'
                    ? 'text-blue-600 font-bold bg-blue-50/80 border border-blue-100'
                    : 'hover:text-slate-900'
                }`}
              >
                Draft <span className="text-slate-400 font-normal">({counts.draft})</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        {/* Left Side: Bulk Actions & Type Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Bulk actions</option>
              <option value="delete">Delete</option>
            </select>
            <button
              onClick={handleBulkApply}
              disabled={!bulkAction || selectedIds.length === 0}
              className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-blue-600 border border-blue-300 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Apply
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-1.5">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Show all types</option>
              <option value="percent">Percentage discount</option>
              <option value="fixed_cart">Fixed cart discount</option>
              <option value="fixed_product">Fixed product discount</option>
            </select>
            <button
              onClick={handleFilterApply}
              className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-blue-600 border border-blue-300 rounded-md transition-all"
            >
              Filter
            </button>
          </div>
        </div>

        {/* Right Side: Search Coupons Form */}
        <form onSubmit={handleSearch} className="flex items-center gap-1.5 w-full md:w-auto">
          <div className="relative grow md:w-56">
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-3 pr-8 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setTimeout(loadCoupons, 50);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-white hover:bg-slate-50 border border-blue-300 rounded-md whitespace-nowrap transition-all shadow-2xs"
          >
            Search coupons
          </button>
          <span className="text-xs text-slate-500 font-medium pl-2 hidden lg:inline">
            {coupons.length} {coupons.length === 1 ? 'item' : 'items'}
          </span>
        </form>
      </div>

      {/* Main Table View */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="w-10 px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={coupons.length > 0 && selectedIds.length === coupons.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Coupon type</th>
                <th className="px-4 py-3">Coupon amount</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Product IDs</th>
                <th className="px-4 py-3">Usage / Limit</th>
                <th className="px-4 py-3">Expiry date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-slate-400">
                    <div className="inline-flex items-center gap-2 text-xs font-medium">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading coupons...
                    </div>
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-slate-500">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
                        <Tag className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-sm text-slate-800">No coupons found</p>
                      <p className="text-xs text-slate-400">
                        Create your first promotional discount coupon or adjust your search filters.
                      </p>
                      <a
                        href="/admin/coupons/add"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm"
                      >
                        <Plus className="w-4 h-4" /> Create Coupon
                      </a>
                    </div>
                  </td>
                </tr>
              ) : (
                coupons.map((c) => {
                  const expired = isExpired(c.expiryDate);
                  const isSelected = selectedIds.includes(c.id);
                  const isCopied = copiedCode === c.code;

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-50/75 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="px-3 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(c.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      {/* Code Link */}
                      <td className="px-4 py-3.5 font-semibold text-blue-600 hover:text-blue-800">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/admin/coupons/${c.id}`}
                            className="font-bold underline-offset-2 hover:underline tracking-tight"
                          >
                            {c.code}
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopy(c.code)}
                            title="Copy coupon code"
                            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {c.status === 'draft' && (
                          <span className="inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Coupon Type */}
                      <td className="px-4 py-3.5 text-slate-600">
                        {formatDiscountType(c.discountType)}
                        {c.allowFreeShipping && (
                          <span className="block text-[10px] text-emerald-600 font-medium mt-0.5">
                            + Free shipping
                          </span>
                        )}
                      </td>

                      {/* Coupon Amount */}
                      <td className="px-4 py-3.5 font-semibold text-slate-900">
                        {c.discountType === 'percent' ? `${c.amount}%` : `₹${Number(c.amount).toFixed(2)}`}
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3.5 text-slate-500 max-w-xs truncate">
                        {c.description || '—'}
                      </td>

                      {/* Product IDs / Scope */}
                      <td className="px-4 py-3.5 text-slate-500">
                        {c.productIds && c.productIds.length > 0 ? (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                            <Package className="w-3 h-3 text-slate-400" />
                            {c.productIds.length} items
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Usage / Limit */}
                      <td className="px-4 py-3.5 text-slate-700 font-medium">
                        <span className="font-semibold text-slate-900">{c.usageCount || 0}</span>
                        <span className="text-slate-400 font-normal">
                          {' '}
                          / {c.usageLimit ? c.usageLimit : '∞'}
                        </span>
                      </td>

                      {/* Expiry Date */}
                      <td className="px-4 py-3.5 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <span>{formatExpiryDate(c.expiryDate)}</span>
                          {expired && (
                            <span className="inline-flex items-center text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                              Expired
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/admin/coupons/${c.id}`}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit coupon"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id, c.code)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50/80 border-t border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="w-10 px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={coupons.length > 0 && selectedIds.length === coupons.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Coupon type</th>
                <th className="px-4 py-3">Coupon amount</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Product IDs</th>
                <th className="px-4 py-3">Usage / Limit</th>
                <th className="px-4 py-3">Expiry date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Table Bottom Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 border-t border-slate-200 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-md px-2.5 py-1 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Bulk actions</option>
              <option value="delete">Delete</option>
            </select>
            <button
              onClick={handleBulkApply}
              disabled={!bulkAction || selectedIds.length === 0}
              className="px-3 py-1 text-xs font-semibold bg-white hover:bg-slate-50 text-blue-600 border border-blue-300 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Apply
            </button>
          </div>

          <div className="font-medium text-slate-600">
            {coupons.length} {coupons.length === 1 ? 'item' : 'items'}
          </div>
        </div>
      </div>
    </div>
  );
}
