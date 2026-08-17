import React, { useState, useEffect } from 'react';
import { getCustomersApi, updateCustomerStatusApi, deleteCustomerApi, userStore } from '../../store/authStore.js';
import { Search, Building2, User2, CheckCircle2, XCircle, AlertCircle, Calendar, MapPin, Filter, RotateCw, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CustomerManager() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Set default dropdown status filter based on URL query parameter if present
  const [statusFilter, setStatusFilter] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const statusParam = params.get('status');
      if (statusParam) {
        const lower = statusParam.toLowerCase();
        if (lower === 'all') return 'All';
        if (lower === 'pending' || lower === 'pending approval') return 'Pending Approval';
        if (lower === 'approved' || lower === 'approve') return 'Approved';
        if (lower === 'rejected') return 'Rejected';
        if (lower === 'suspended') return 'Suspended';
        if (lower === 'blocked') return 'Blocked';
        return statusParam;
      }
    }
    return 'Pending Approval';
  });
  const [buyerTypeFilter, setBuyerTypeFilter] = useState('All');
  
  // Pagination States
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [page, setPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get('page');
      if (pageParam) {
        const parsed = parseInt(pageParam, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    }
    return 1;
  });
  const [limit] = useState(10);
  
  // Standalone page links will be used for editing instead of modal popup

  // Fetch active token dynamically from the global userStore
  const token = userStore.get()?.accessToken || '';

  const fetchCustomers = async (currentPage = page) => {
    if (!token) {
      setError('Admin token not found. Please log in again.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit,
      };
      if (statusFilter !== 'All') params.status = statusFilter;
      if (buyerTypeFilter !== 'All') params.buyerType = buyerTypeFilter;
      if (searchQuery) params.search = searchQuery;

      const data = await getCustomersApi(token, params);
      setCustomers(data?.items || []);
      if (data?.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch customer directory.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset page to 1 and fetch on filter changes
  useEffect(() => {
    setPage(1);
    fetchCustomers(1);
  }, [statusFilter, buyerTypeFilter, token]);

  // Keep URL query parameters in sync with React state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (statusFilter === 'All') {
        url.searchParams.set('status', 'all');
      } else if (statusFilter === 'Pending Approval') {
        url.searchParams.set('status', 'pending');
      } else {
        url.searchParams.set('status', statusFilter.toLowerCase());
      }
      url.searchParams.set('page', page);
      window.history.pushState({}, '', url.pathname + url.search);
    }
  }, [statusFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
      fetchCustomers(newPage);
    }
  };

  const getVisiblePageRange = () => {
    const totalPages = pagination.totalPages;
    const range = [];
    const delta = 2; // Number of pages on each side of active page
    
    let start = Math.max(1, page - delta);
    let end = Math.min(totalPages, page + delta);
    
    if (page <= delta) {
      end = Math.min(totalPages, delta * 2 + 1);
    }
    if (page > totalPages - delta) {
      start = Math.max(1, totalPages - delta * 2);
    }
    
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  };

  const handleUpdateStatus = async (customerId, newStatus) => {
    if (!token) return;
    try {
      await updateCustomerStatusApi(token, customerId, { status: newStatus });
      fetchCustomers();
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this customer registration profile and associated user login?')) {
      try {
        await deleteCustomerApi(token, id);
        fetchCustomers();
      } catch (err) {
        alert(err.message || 'Failed to delete customer.');
      }
    }
  };



  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending Approval':
        return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Suspended':
      case 'Blocked':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Top Filter & Search Action Bar */}
      <form onSubmit={handleSearchSubmit} className="glass-panel p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-200 bg-white shadow-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by firm, owner name, gstin..."
            className="w-full pl-10 pr-4 py-2.5 glass-input bg-slate-50 border-slate-300 text-slate-900"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-semibold focus:ring-0 cursor-pointer pr-5 py-0"
            >
              <option value="All">All Statuses</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Suspended">Suspended</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={buyerTypeFilter}
              onChange={(e) => setBuyerTypeFilter(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-semibold focus:ring-0 cursor-pointer pr-5 py-0"
            >
              <option value="All">All Buyer Types</option>
              <option value="GST">GST Registered</option>
              <option value="NON_GST">Non-GST manual</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold transition-colors flex items-center gap-1.5 shadow"
          >
            Apply Query
          </button>
          
          <button
            type="button"
            onClick={fetchCustomers}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
            title="Refresh list"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Loading state */}
      {isLoading && (
        <div className="glass-panel p-12 rounded-3xl border border-slate-200 bg-white text-center space-y-4 shadow-sm">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500">Querying real-time customer directory database...</p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center gap-3 shadow-sm font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table Data */}
      {!isLoading && !error && (
        <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
          {customers.length === 0 ? (
            <div className="p-16 text-center text-slate-500 space-y-2">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700">No B2B Customers Found</p>
              <p className="text-[11px]">Adjust your filters or query string and try again.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4 pl-6">Company / Buyer Details</th>
                    <th className="p-4">Contact Profile</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4">Classification</th>
                    {statusFilter === 'All' && <th className="p-4">Approval Status</th>}
                    <th className="p-4 pr-6 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Company Name & GSTIN */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{cust.firmName || 'Unnamed Business'}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-700 uppercase">
                                {cust.buyerType === 'GST' ? 'GSTIN' : 'Non-GST'}
                              </span>
                              {cust.gstin && (
                                <span className="font-mono text-slate-500 text-[10px] tracking-wide">{cust.gstin}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Profile */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{cust.ownerName || 'Unknown Owner'}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">{cust.email}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{cust.mobileNumber}</div>
                      </td>

                      {/* Registration Date */}
                      <td className="p-4 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(cust.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}</span>
                        </div>
                      </td>

                      {/* Classification */}
                      <td className="p-4">
                        <div className="text-slate-800 font-semibold">{cust.category}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Price: <span className="font-semibold text-brand-600">{cust.priceGroup}</span></div>
                      </td>

                      {/* Status */}
                      {statusFilter === 'All' && (
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(cust.status)}`}>
                            {cust.status}
                          </span>
                        </td>
                      )}

                      {/* Administrative Actions */}
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-1.5">
                          <a
                            href={`/admin/users/${cust.id}`}
                            className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all text-[11px] ${
                              cust.status === 'Pending Approval'
                                ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-sm hover:scale-[1.02]'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <Edit2 className="w-3 h-3" />
                            {cust.status === 'Pending Approval' ? 'Review & Decide' : 'Edit'}
                          </a>
                          <button
                            onClick={() => handleDeleteCustomer(cust.id)}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-semibold flex items-center gap-1.5 transition-all text-[11px]"
                          >
                            <Trash2 className="w-3 h-3 text-rose-500" /> Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && !error && customers.length > 0 && (
        <div className="glass-panel p-4 rounded-3xl border border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm text-xs mt-4">
          <div className="text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{Math.min(pagination.total, (page - 1) * limit + 1)}</span> to{' '}
            <span className="font-bold text-slate-800">
              {Math.min(page * limit, pagination.total)}
            </span> of <span className="font-bold text-slate-800">{pagination.total}</span> customers
          </div>
          
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Previous Button */}
            <button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={`px-3 py-2 rounded-xl border font-semibold transition-all flex items-center gap-1.5 ${
                page === 1
                  ? 'text-slate-300 bg-slate-50/50 border-slate-100 cursor-not-allowed'
                  : 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50 hover:text-slate-900 cursor-pointer shadow-sm'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            
            {/* Numbered page buttons */}
            {getVisiblePageRange().map((pNum) => {
              const isCurrent = pNum === page;
              return (
                <button
                  type="button"
                  key={pNum}
                  onClick={() => handlePageChange(pNum)}
                  className={`w-9 h-9 rounded-xl font-bold transition-all text-center flex items-center justify-center border ${
                    isCurrent
                      ? 'bg-brand-600 border-brand-600 text-white shadow-glow-primary shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
                  }`}
                >
                  {pNum}
                </button>
              );
            })}
            
            {/* Next Button */}
            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === pagination.totalPages}
              className={`px-3 py-2 rounded-xl border font-semibold transition-all flex items-center gap-1.5 ${
                page === pagination.totalPages
                  ? 'text-slate-300 bg-slate-50/50 border-slate-100 cursor-not-allowed'
                  : 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50 hover:text-slate-900 cursor-pointer shadow-sm'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}


    </div>
  );
}
