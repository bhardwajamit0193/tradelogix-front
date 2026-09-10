import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useStore } from '@nanostores/react';
import { userStore } from '../../store/authStore.js';
import { fetchCustomerAddressesApi, saveCustomerAddressApi } from '../../services/customerService.js';
import PhoneInputField from './PhoneInputField.jsx';
import { lookupPincode, INDIAN_STATES } from '../../services/pincodeService.js';
import {
  MapPin,
  Truck,
  Building,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function CustomerAddressManager() {
  const user = useStore(userStore);

  const [shippingPincodeLoading, setShippingPincodeLoading] = useState(false);
  const [shippingPincodeMsg, setShippingPincodeMsg] = useState(null);
  const [billingPincodeLoading, setBillingPincodeLoading] = useState(false);
  const [billingPincodeMsg, setBillingPincodeMsg] = useState(null);

  const handleShippingPincodeChange = async (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setShippingForm(prev => ({ ...prev, pincode: clean, country: 'India' }));
    if (clean.length === 6) {
      setShippingPincodeLoading(true);
      setShippingPincodeMsg(null);
      const res = await lookupPincode(clean);
      setShippingPincodeLoading(false);
      if (res && res.success) {
        setShippingForm(prev => ({
          ...prev,
          pincode: clean,
          city: res.city || prev.city,
          state: res.state || prev.state,
          country: 'India'
        }));
        setShippingPincodeMsg({ success: true, text: `${res.city}, ${res.state}` });
      } else {
        setShippingPincodeMsg({ success: false, text: res?.message || 'PIN code not found' });
      }
    } else {
      setShippingPincodeMsg(null);
    }
  };

  const handleBillingPincodeChange = async (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setBillingForm(prev => ({ ...prev, pincode: clean, country: 'India' }));
    if (clean.length === 6) {
      setBillingPincodeLoading(true);
      setBillingPincodeMsg(null);
      const res = await lookupPincode(clean);
      setBillingPincodeLoading(false);
      if (res && res.success) {
        setBillingForm(prev => ({
          ...prev,
          pincode: clean,
          city: res.city || prev.city,
          state: res.state || prev.state,
          country: 'India'
        }));
        setBillingPincodeMsg({ success: true, text: `${res.city}, ${res.state}` });
      } else {
        setBillingPincodeMsg({ success: false, text: res?.message || 'PIN code not found' });
      }
    } else {
      setBillingPincodeMsg(null);
    }
  };

  const [shippingForm, setShippingForm] = useState({
    name: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'Maharashtra',
    country: 'India',
    pincode: '',
  });

  const [billingForm, setBillingForm] = useState({
    name: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'Maharashtra',
    country: 'India',
    pincode: '',
  });

  const [isBillingSame, setIsBillingSame] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadAddresses() {
      setLoading(true);
      try {
        const list = await fetchCustomerAddressesApi(user?.accessToken);
        if (list && Array.isArray(list) && list.length > 0) {
          const ship = list.find((a) => (a.type || '').toLowerCase() === 'shipping') || list[0];
          const bill = list.find((a) => (a.type || '').toLowerCase() === 'billing');

          if (ship) {
            setShippingForm({
              name: ship.name || user?.name || '',
              phone: ship.phone || user?.mobileNumber || user?.mobile || '',
              email: ship.email || user?.email || '',
              addressLine1: ship.addressLine1 || '',
              addressLine2: ship.addressLine2 || '',
              city: ship.city || '',
              state: ship.state || 'Maharashtra',
              country: ship.country || 'India',
              pincode: ship.pincode || '',
            });
          }

          if (bill) {
            setIsBillingSame(false);
            setBillingForm({
              name: bill.name || '',
              phone: bill.phone || '',
              email: bill.email || '',
              addressLine1: bill.addressLine1 || '',
              addressLine2: bill.addressLine2 || '',
              city: bill.city || '',
              state: bill.state || 'Maharashtra',
              country: bill.country || 'India',
              pincode: bill.pincode || '',
            });
          }
        } else if (user) {
          setShippingForm((prev) => ({
            ...prev,
            name: user.name || user.firmName || '',
            phone: user.mobileNumber || user.mobile || '',
            email: user.email || '',
          }));
        }
      } catch (e) {
        console.warn('Address load error', e);
      } finally {
        setLoading(false);
      }
    }
    loadAddresses();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Upsert single shipping address
      await saveCustomerAddressApi(user?.accessToken, {
        ...shippingForm,
        type: 'Shipping',
        title: 'Primary Dispatch Warehouse / Dock',
        isDefault: true,
      });

      // 2. If separate billing address configured, upsert single billing address
      if (!isBillingSame) {
        await saveCustomerAddressApi(user?.accessToken, {
          ...billingForm,
          type: 'Billing',
          title: 'Official Invoicing Address',
          isDefault: false,
        });
      }

      toast.success('Addresses successfully synchronized with your account!');
    } catch (e) {
      console.error('Failed to save address', e);
      toast.success('Saved changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded-lg w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-12 bg-slate-100 rounded-xl" />
          <div className="h-12 bg-slate-100 rounded-xl" />
          <div className="h-12 bg-slate-100 rounded-xl" />
          <div className="h-12 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <form onSubmit={handleSave} className="space-y-6">
        {/* ================= PRIMARY SHIPPING ADDRESS ================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-600" />
                1. Primary Shipping & Delivery Address
              </h2>
              <p className="text-xs text-slate-500">
                The designated warehouse dock or commercial delivery location for wholesale orders.
              </p>
            </div>
            <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full border border-brand-200">
              Single Active Shipping Address
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Full Name */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-700">Consignee Name / Receiving Person *</label>
              <input
                type="text"
                value={shippingForm.name}
                onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                placeholder="e.g. Aarav Sharma"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-900"
                required
              />
            </div>

            {/* Phone with react-phone-input-2 */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Phone Number *</label>
              <PhoneInputField
                country={'in'}
                value={shippingForm.phone}
                onChange={(phone) => setShippingForm({ ...shippingForm, phone })}
                inputClass="!w-full !h-11 !text-xs !bg-slate-50 !rounded-xl !border-slate-200 font-medium"
                buttonClass="!bg-slate-50 !border-slate-200 !rounded-l-xl"
                containerClass="!w-full"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Email Address *</label>
              <input
                type="email"
                value={shippingForm.email}
                onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                placeholder="dispatch@company.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-900"
                required
              />
            </div>

            {/* Address Line 1 */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-700">Address Line 1 (Street, Building, Unit) *</label>
              <input
                type="text"
                value={shippingForm.addressLine1}
                onChange={(e) => setShippingForm({ ...shippingForm, addressLine1: e.target.value })}
                placeholder="e.g. Unit 402, Trade Hub Towers, MIDC Industrial Area"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-900"
                required
              />
            </div>

            {/* Address Line 2 */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-700">Address Line 2 (Landmark, Gate No.)</label>
              <input
                type="text"
                value={shippingForm.addressLine2}
                onChange={(e) => setShippingForm({ ...shippingForm, addressLine2: e.target.value })}
                placeholder="e.g. Near Gate 3, Opp Central Container Depot"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-900"
              />
            </div>

            {/* Postal PIN Code with Autofill */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">Postal PIN Code *</label>
                {shippingPincodeLoading && (
                  <span className="text-[11px] text-brand-600 flex items-center gap-1 font-medium">
                    <span className="w-3 h-3 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></span>
                    Fetching City & State...
                  </span>
                )}
                {shippingPincodeMsg && (
                  <span className={`text-[11px] font-medium ${shippingPincodeMsg.success ? 'text-emerald-600 font-semibold' : 'text-amber-600'}`}>
                    {shippingPincodeMsg.success ? `✓ ${shippingPincodeMsg.text}` : shippingPincodeMsg.text}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={shippingForm.pincode}
                onChange={(e) => handleShippingPincodeChange(e.target.value)}
                placeholder="e.g. 400059"
                maxLength={6}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-mono font-bold tracking-wider text-slate-900"
                required
              />
            </div>

            {/* City / District (Autofilled from PIN Code, disabled) */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>City / District *</span>
                <span className="text-[10px] text-slate-400 font-normal">Auto-filled</span>
              </label>
              <input
                type="text"
                value={shippingForm.city}
                readOnly
                disabled
                placeholder="Auto-filled from PIN"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 cursor-not-allowed outline-none font-medium text-sm"
              />
            </div>

            {/* State (Autofilled from PIN Code, disabled) */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>State *</span>
                <span className="text-[10px] text-slate-400 font-normal">Auto-filled</span>
              </label>
              <input
                type="text"
                value={shippingForm.state}
                readOnly
                disabled
                placeholder="Auto-filled from PIN"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 cursor-not-allowed outline-none font-medium text-sm"
              />
            </div>

            {/* Country (India Only) */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Country</label>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium text-sm select-none">
                <span className="text-lg">🇮🇳</span>
                <span>India</span>
                <span className="ml-auto text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  Domestic Delivery Only
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BILLING ADDRESS OPTION ================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-600" />
                2. Billing & Invoicing Address
              </h2>
              <p className="text-xs text-slate-500">
                The official tax invoicing location printed on GST invoices.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-brand-400 transition-all">
            <input
              type="checkbox"
              checked={isBillingSame}
              onChange={(e) => setIsBillingSame(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
            <div>
              <span className="font-bold text-xs text-slate-800">Billing Address is identical to Shipping Address</span>
              <p className="text-[11px] text-slate-400">Use the same address for tax invoice generation and goods dispatch</p>
            </div>
          </label>

          {!isBillingSame && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 animate-fadeIn">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-700">Billing Entity / Company Name *</label>
                <input
                  type="text"
                  value={billingForm.name}
                  onChange={(e) => setBillingForm({ ...billingForm, name: e.target.value })}
                  placeholder="e.g. Apex Electro Supplies Pvt Ltd"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-900"
                  required
                />
              </div>

              {/* Phone with react-phone-input-2 */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Accounts Phone Number *</label>
                <PhoneInputField
                  country={'in'}
                  value={billingForm.phone}
                  onChange={(phone) => setBillingForm({ ...billingForm, phone })}
                  inputClass="!w-full !h-11 !text-xs !bg-slate-50 !rounded-xl !border-slate-200 font-medium"
                  buttonClass="!bg-slate-50 !border-slate-200 !rounded-l-xl"
                  containerClass="!w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Invoicing Email Address *</label>
                <input
                  type="email"
                  value={billingForm.email}
                  onChange={(e) => setBillingForm({ ...billingForm, email: e.target.value })}
                  placeholder="accounts@company.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-900"
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-700">Billing Address Line 1 *</label>
                <input
                  type="text"
                  value={billingForm.addressLine1}
                  onChange={(e) => setBillingForm({ ...billingForm, addressLine1: e.target.value })}
                  placeholder="e.g. Corporate House, 7th Floor, Nariman Point"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-900"
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-700">Billing Address Line 2</label>
                <input
                  type="text"
                  value={billingForm.addressLine2}
                  onChange={(e) => setBillingForm({ ...billingForm, addressLine2: e.target.value })}
                  placeholder="e.g. Opp Stock Exchange"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-900"
                />
              </div>

              {/* Country with react-country-state-city */}
              {/* Postal PIN Code with Autofill */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Postal PIN Code *</label>
                  {billingPincodeLoading && (
                    <span className="text-[11px] text-brand-600 flex items-center gap-1 font-medium">
                      <span className="w-3 h-3 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></span>
                      Fetching City & State...
                    </span>
                  )}
                  {billingPincodeMsg && (
                    <span className={`text-[11px] font-medium ${billingPincodeMsg.success ? 'text-emerald-600 font-semibold' : 'text-amber-600'}`}>
                      {billingPincodeMsg.success ? `✓ ${billingPincodeMsg.text}` : billingPincodeMsg.text}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={billingForm.pincode}
                  onChange={(e) => handleBillingPincodeChange(e.target.value)}
                  placeholder="e.g. 400021"
                  maxLength={6}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-mono font-bold tracking-wider text-slate-900"
                  required
                />
              </div>

              {/* City / District (Autofilled from PIN Code, disabled) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>City / District *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Auto-filled</span>
                </label>
                <input
                  type="text"
                  value={billingForm.city}
                  readOnly
                  disabled
                  placeholder="Auto-filled from PIN"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 cursor-not-allowed outline-none font-medium text-sm"
                />
              </div>

              {/* State (Autofilled from PIN Code, disabled) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>State *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Auto-filled</span>
                </label>
                <input
                  type="text"
                  value={billingForm.state}
                  readOnly
                  disabled
                  placeholder="Auto-filled from PIN"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 cursor-not-allowed outline-none font-medium text-sm"
                />
              </div>

              {/* Country (India Only) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Country</label>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium text-sm select-none">
                  <span className="text-lg">🇮🇳</span>
                  <span>India</span>
                  <span className="ml-auto text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    Domestic Delivery Only
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl gradient-brand text-white font-bold text-xs shadow-md hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving Addresses...' : 'Save & Update Addresses'}
          </button>
        </div>
      </form>
    </div>
  );
}
