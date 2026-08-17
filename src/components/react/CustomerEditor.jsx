import React, { useState, useEffect } from 'react';
import { getCustomerByIdApi, updateCustomerStatusApi, userStore } from '../../store/authStore.js';
import { ArrowLeft, Save, Building2, User2, Mail, Phone, Calendar, ShieldCheck, MapPin, AlertCircle, RefreshCw } from 'lucide-react';

export default function CustomerEditor({ customerId }) {
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form States
  const [status, setStatus] = useState('Pending Approval');
  const [category, setCategory] = useState('Retailer');
  const [priceGroup, setPriceGroup] = useState('Default');
  const [warehouse, setWarehouse] = useState('');
  const [salesExecutive, setSalesExecutive] = useState('');
  const [creditLimit, setCreditLimit] = useState('0.00');
  const [creditEligibility, setCreditEligibility] = useState(false);

  const token = userStore.get()?.accessToken || '';

  useEffect(() => {
    if (!token) {
      setError('Admin session not found. Please login again.');
      setIsLoading(false);
      return;
    }

    const fetchCustomer = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getCustomerByIdApi(token, customerId);
        setCustomer(data);
        setStatus(data.status || 'Pending Approval');
        setCategory(data.category || 'Retailer');
        setPriceGroup(data.priceGroup || 'Default');
        setWarehouse(data.assignedWarehouse || '');
        setSalesExecutive(data.assignedSalesExecutive || '');
        setCreditLimit(data.creditLimit || '0.00');
        setCreditEligibility(data.creditEligibility || false);
      } catch (err) {
        setError(err.message || 'Failed to fetch customer profile.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, token]);

  const handleSaveWithStatus = async (statusValue) => {
    if (!token) return;
    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        status: statusValue,
        category,
        priceGroup,
        assignedWarehouse: warehouse,
        assignedSalesExecutive: salesExecutive,
        creditLimit,
        creditEligibility,
      };
      
      await updateCustomerStatusApi(token, customerId, payload);
      // Navigate back to listing page on success
      window.location.href = '/admin/users';
    } catch (err) {
      setError(err.message || 'Failed to save customer changes.');
      setIsSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveWithStatus(status);
  };

  if (isLoading) {
    return (
      <div className="glass-panel p-16 rounded-3xl border border-slate-200 bg-white text-center space-y-4 shadow-sm max-w-xl mx-auto">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 text-xs">Querying registration profile database details...</p>
      </div>
    );
  }

  if (error && !customer) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-slate-200 bg-white text-center space-y-6 shadow-sm max-w-xl mx-auto text-xs">
        <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-bold text-slate-800 text-sm">Failed to Load Profile</h3>
          <p className="text-slate-500">{error}</p>
        </div>
        <a
          href="/admin/users"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Customer List
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-xs">
      {/* Top Header Navigation Bar */}
      <div className="flex items-center justify-between">
        <a
          href="/admin/users"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </a>
        <div className="text-slate-400 font-medium">
          Customer ID: <span className="font-mono text-slate-600 font-bold">{customerId}</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center gap-3 shadow-sm font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Form on Left, Customer context info card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Interactive Form */}
        <div className="lg:col-span-2 glass-panel bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">Administrative Configuration</h3>
            <p className="text-slate-500 text-[11px] mt-0.5">Assign classification tiers, lines of credit, and account review status.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {customer.status !== 'Pending Approval' && (
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold">Account Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2.5 glass-input bg-slate-50 border-slate-300 text-slate-900 focus:outline-none text-xs"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              )}

              <div className={`space-y-1 ${customer.status === 'Pending Approval' ? 'sm:col-span-2' : ''}`}>
                <label className="text-slate-700 font-semibold">Customer Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 glass-input bg-slate-50 border-slate-300 text-slate-900 focus:outline-none text-xs"
                >
                  <option value="Retailer">Retailer</option>
                  <option value="Dealer">Dealer</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Corporate Buyer">Corporate Buyer</option>
                  <option value="Institutional Buyer">Institutional Buyer</option>
                  <option value="Special">Special / Key Account</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Price Group</label>
                <select
                  value={priceGroup}
                  onChange={(e) => setPriceGroup(e.target.value)}
                  className="w-full p-2.5 glass-input bg-slate-50 border-slate-300 text-slate-900 focus:outline-none text-xs"
                >
                  <option value="Default">Default</option>
                  <option value="Dealer">Dealer Group</option>
                  <option value="Distributor">Distributor Group</option>
                  <option value="Special">Special Group</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Assigned Warehouse</label>
                <input
                  type="text"
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value)}
                  placeholder="e.g. Mumbai Hub"
                  className="w-full p-2.5 glass-input bg-slate-50 border-slate-300 text-slate-900 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Sales Executive</label>
                <input
                  type="text"
                  value={salesExecutive}
                  onChange={(e) => setSalesExecutive(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full p-2.5 glass-input bg-slate-50 border-slate-300 text-slate-900 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Credit Limit (INR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  className="w-full p-2.5 glass-input bg-slate-50 border-slate-300 text-slate-900 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <input
                type="checkbox"
                id="credit_eligibility"
                checked={creditEligibility}
                onChange={(e) => setCreditEligibility(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 cursor-pointer"
              />
              <label htmlFor="credit_eligibility" className="text-slate-700 font-semibold cursor-pointer select-none">
                Eligible for B2B Line of Credit
              </label>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 flex-wrap">
              <a
                href="/admin/users"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors text-center"
              >
                Cancel
              </a>
              {customer.status === 'Pending Approval' ? (
                <>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSaveWithStatus('Rejected')}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Reject Application'}
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSaveWithStatus('Approved')}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Approve Application'}
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold shadow transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Side: Customer Detail Context Card */}
        <div className="space-y-6">
          <div className="glass-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-900">B2B Profile Details</h3>
              <p className="text-slate-400 text-[10px]">Read-only registration details extracted during sign-up.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Firm Name</div>
                  <div className="font-bold text-slate-800 text-xs">{customer.firmName || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                  <User2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Owner Name</div>
                  <div className="font-bold text-slate-800 text-xs">{customer.ownerName || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Email Address</div>
                  <div className="font-bold text-slate-800 text-xs truncate max-w-[200px]" title={customer.email}>{customer.email || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Mobile Number</div>
                  <div className="font-mono font-bold text-slate-800 text-xs">{customer.mobileNumber || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Registration Date</div>
                  <div className="font-bold text-slate-800 text-xs">
                    {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    }) : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legal / GST Verification Box */}
          <div className="glass-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> GST Identification Verification
            </h4>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Buyer Type:</span>
                <span className="font-bold text-slate-700">{customer.buyerType || 'NON_GST'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">GSTIN:</span>
                <span className="font-mono font-bold text-slate-800">{customer.gstin || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Verification:</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  customer.gstVerificationStatus === 'Verified'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {customer.gstVerificationStatus || 'Not Verified'}
                </span>
              </div>
            </div>

            {customer.address && (
              <div className="space-y-1 bg-slate-50 p-3 border border-slate-200 rounded-xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Registered Address
                </div>
                <p className="text-slate-700 leading-relaxed mt-0.5">{customer.address}</p>
                <p className="text-slate-500 font-semibold mt-0.5">{customer.city}, {customer.state} - {customer.pincode}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
