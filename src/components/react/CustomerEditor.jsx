import React, { useState, useEffect } from 'react';
import { getCustomerByIdApi, updateCustomerStatusApi, userStore } from '../../store/authStore.js';
import {
  ArrowLeft,
  Save,
  Building2,
  User2,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  MapPin,
  AlertCircle,
  RefreshCw,
  Truck,
  Building,
  CheckCircle2,
  Clock,
  Warehouse,
} from 'lucide-react';
import { getWarehouses } from '../../utils/mockDb.js';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:6543';

export default function CustomerEditor({ customerId }) {
  const [customer, setCustomer] = useState(null);
  const [warehousesList, setWarehousesList] = useState(() => getWarehouses());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form States
  const [status, setStatus] = useState('Pending Approval');
  const [category, setCategory] = useState('Retailer');
  const [priceGroup, setPriceGroup] = useState('Default');
  const [warehouse, setWarehouse] = useState('');
  const [salesExecutive, setSalesExecutive] = useState('');

  const token = userStore.get()?.accessToken || '';

  // Fetch warehouses list dynamically
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/warehouses`);
        if (res.ok) {
          const json = await res.json();
          const list = json.data || json;
          if (Array.isArray(list) && list.length > 0) {
            setWarehousesList(list);
            return;
          }
        }
      } catch (e) {}
      setWarehousesList(getWarehouses());
    };
    fetchWarehouses();
  }, []);

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
      };

      await updateCustomerStatusApi(token, customerId, payload);
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
      <div className="bg-white p-16 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm max-w-xl mx-auto">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 text-xs font-semibold">Querying full customer profile & addresses...</p>
      </div>
    );
  }

  if (error && !customer) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-6 shadow-sm max-w-xl mx-auto text-xs">
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

  // Extract addresses
  const addresses = customer.addresses || [];
  const shippingAddr = addresses.find((a) => (a.type || '').toLowerCase() === 'shipping') || addresses[0];
  const billingAddr = addresses.find((a) => (a.type || '').toLowerCase() === 'billing');

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-xs animate-fadeIn">
      {/* Top Header Navigation Bar */}
      <div className="flex items-center justify-between">
        <a
          href="/admin/users"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl shadow-sm transition-all text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customer Directory
        </a>
        <div className="text-slate-500 font-medium">
          Customer ID: <span className="font-mono text-slate-900 font-bold">{customerId}</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-3 shadow-sm font-semibold text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Admin Form (Left) & Customer Overview / Addresses (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Admin Classification & Approval Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">Administrative Configuration</h3>
                <p className="text-slate-500 text-[11px] mt-0.5">Assign classification tiers, pricing groups, and approval status.</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                customer.status === 'Approved'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : customer.status === 'Pending Approval'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {customer.status || 'Pending Approval'}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {customer.status !== 'Pending Approval' && (
                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-bold">Account Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none text-xs font-medium"
                    >
                      <option value="Approved">Approved</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Blocked">Blocked</option>
                    </select>
                  </div>
                )}

                <div className={`space-y-1.5 ${customer.status === 'Pending Approval' ? 'sm:col-span-2' : ''}`}>
                  <label className="text-slate-700 font-bold">Customer Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none text-xs font-medium"
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
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold">Price Group</label>
                  <select
                    value={priceGroup}
                    onChange={(e) => setPriceGroup(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none text-xs font-medium"
                  >
                    <option value="Default">Default</option>
                    <option value="Dealer">Dealer Group</option>
                    <option value="Distributor">Distributor Group</option>
                    <option value="Special">Special Group</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold">Assigned Fulfillment Warehouse</label>
                  <select
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none text-xs font-medium cursor-pointer"
                  >
                    <option value="">-- Select Fulfillment Warehouse --</option>
                    {warehousesList.map((wh) => (
                      <option key={wh.id || wh.code} value={wh.name}>
                        {wh.name} ({wh.code}) - {wh.city}, {wh.state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold">Assigned Sales Executive</label>
                <input
                  type="text"
                  value={salesExecutive}
                  onChange={(e) => setSalesExecutive(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none text-xs font-medium"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 flex-wrap">
                <a
                  href="/admin/users"
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors text-center text-xs"
                >
                  Cancel
                </a>
                {customer.status === 'Pending Approval' ? (
                  <>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSaveWithStatus('Rejected')}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow transition-all flex items-center gap-1.5 disabled:opacity-50 text-xs"
                    >
                      {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Reject Application'}
                    </button>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSaveWithStatus('Approved')}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow transition-all flex items-center gap-1.5 disabled:opacity-50 text-xs"
                    >
                      {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Approve Application'}
                    </button>
                  </>
                ) : (
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold shadow transition-all flex items-center gap-2 disabled:opacity-50 text-xs"
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

          {/* ================= CUSTOMER FULL ADDRESS DETAILS ================= */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-600" /> Customer Address Book & Dispatch Locations
                </h3>
                <p className="text-slate-500 text-[11px]">
                  Registered delivery docks and tax invoicing addresses configured for this customer.
                </p>
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {addresses.length} address record(s)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Primary Shipping Address */}
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <Truck className="w-4 h-4 text-brand-600" />
                    Primary Shipping Address
                  </div>
                  <span className="px-2 py-0.5 bg-brand-50 text-brand-700 text-[10px] font-bold rounded-full border border-brand-200">
                    Dispatch Dock
                  </span>
                </div>

                {shippingAddr ? (
                  <div className="space-y-1.5 text-slate-700 leading-relaxed text-xs">
                    <div className="font-bold text-slate-900">{shippingAddr.name || customer.firmName || customer.ownerName}</div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{shippingAddr.phone || customer.mobileNumber}</span>
                    </div>
                    {shippingAddr.email && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{shippingAddr.email}</span>
                      </div>
                    )}
                    <div className="text-slate-800 pt-1">
                      {shippingAddr.addressLine1}
                      {shippingAddr.addressLine2 && <div>{shippingAddr.addressLine2}</div>}
                    </div>
                    <div className="font-semibold text-slate-900">
                      {shippingAddr.city}, {shippingAddr.state} - <span className="font-mono">{shippingAddr.pincode}</span>
                    </div>
                  </div>
                ) : customer.address ? (
                  <div className="space-y-1.5 text-slate-700 leading-relaxed text-xs">
                    <div className="font-bold text-slate-900">{customer.firmName || customer.ownerName}</div>
                    <div className="text-slate-800">{customer.address}</div>
                    <div className="font-semibold text-slate-900">
                      {customer.city}, {customer.state} - <span className="font-mono">{customer.pincode}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 italic pt-1">From initial registration profile</div>
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-xs py-4 text-center">No shipping address configured yet</p>
                )}
              </div>

              {/* 2. Billing / Invoicing Address */}
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <Building className="w-4 h-4 text-indigo-600" />
                    Billing & Tax Invoicing Address
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full border border-indigo-200">
                    Tax Invoicing
                  </span>
                </div>

                {billingAddr ? (
                  <div className="space-y-1.5 text-slate-700 leading-relaxed text-xs">
                    <div className="font-bold text-slate-900">{billingAddr.name || customer.firmName}</div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{billingAddr.phone || customer.mobileNumber}</span>
                    </div>
                    {billingAddr.email && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{billingAddr.email}</span>
                      </div>
                    )}
                    <div className="text-slate-800 pt-1">
                      {billingAddr.addressLine1}
                      {billingAddr.addressLine2 && <div>{billingAddr.addressLine2}</div>}
                    </div>
                    <div className="font-semibold text-slate-900">
                      {billingAddr.city}, {billingAddr.state} - <span className="font-mono">{billingAddr.pincode}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-slate-600 text-xs">
                    <p className="text-slate-700 font-medium">Same as Primary Shipping & Registered Address</p>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-500">
                      Invoices are issued to <strong className="text-slate-800">{customer.firmName || customer.ownerName || 'Customer'}</strong> at registered address {customer.city ? `(${customer.city}, ${customer.state})` : ''}.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Details & Tax Identity Overview */}
        <div className="space-y-6">
          {/* Identity Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-900">B2B Business Profile</h3>
              <p className="text-slate-400 text-[10px]">Verified credentials & contact points.</p>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Firm / Legal Name</div>
                  <div className="font-bold text-slate-900 text-xs truncate" title={customer.firmName}>{customer.firmName || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                  <User2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Authorized Owner</div>
                  <div className="font-bold text-slate-800 text-xs truncate">{customer.ownerName || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Billing Email</div>
                  <div className="font-bold text-slate-800 text-xs truncate" title={customer.email}>{customer.email || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Login Mobile Number</div>
                  <div className="font-mono font-bold text-slate-900 text-xs">+91 {customer.mobileNumber || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Registered Since</div>
                  <div className="font-bold text-slate-800 text-xs">
                    {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    }) : 'Recent'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legal / GST Verification Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Tax & Legal Identification
            </h4>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Buyer Category:</span>
                <span className="font-bold text-slate-800">{customer.buyerType || 'NON_GST'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">GSTIN:</span>
                <span className="font-mono font-bold text-slate-900">{customer.gstin || 'Non-GST Registered'}</span>
              </div>
              {customer.pan && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">PAN Number:</span>
                  <span className="font-mono font-bold text-slate-900">{customer.pan}</span>
                </div>
              )}
              {customer.businessConstitution && customer.businessConstitution !== 'N/A' && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Constitution:</span>
                  <span className="font-bold text-slate-700">{customer.businessConstitution}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500 font-medium">GST Status:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  customer.gstVerificationStatus === 'Verified'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {customer.gstVerificationStatus || 'Not Verified'}
                </span>
              </div>
            </div>

            {customer.address && (
              <div className="space-y-1 bg-slate-50 p-3.5 border border-slate-200 rounded-xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> Registered Business Premises
                </div>
                <p className="text-slate-800 leading-relaxed mt-0.5 font-medium">{customer.address}</p>
                <p className="text-slate-600 font-bold mt-0.5">{customer.city}, {customer.state} - {customer.pincode}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
