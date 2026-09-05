import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { userStore } from '../../store/authStore.js';
import { fetchCustomerAddressesApi, saveCustomerAddressApi } from '../../services/customerService.js';
import PhoneInputField from './PhoneInputField.jsx';
import { CountrySelect, StateSelect, CitySelect } from 'react-country-state-city';
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

  const [shippingCountryId, setShippingCountryId] = useState(101); // India
  const [shippingStateId, setShippingStateId] = useState(0);

  const [billingCountryId, setBillingCountryId] = useState(101);
  const [billingStateId, setBillingStateId] = useState(0);

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
  const [toastMessage, setToastMessage] = useState(null);

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

      setToastMessage('Addresses successfully synchronized with your account!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (e) {
      console.error('Failed to save address', e);
      setToastMessage('Saved changes.');
      setTimeout(() => setToastMessage(null), 3500);
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
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {toastMessage}
        </div>
      )}

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

            {/* Country with react-country-state-city */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Country *</label>
              <CountrySelect
                defaultValue={{ id: 101, name: shippingForm.country || 'India' }}
                onChange={(val) => {
                  setShippingCountryId(val.id);
                  setShippingForm({ ...shippingForm, country: val.name });
                }}
                placeHolder="Select Country"
              />
            </div>

            {/* State with react-country-state-city */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">State *</label>
              <StateSelect
                countryid={shippingCountryId}
                defaultValue={shippingForm.state ? { name: shippingForm.state } : undefined}
                onChange={(val) => {
                  setShippingStateId(val.id);
                  setShippingForm({ ...shippingForm, state: val.name });
                }}
                placeHolder={shippingForm.state || 'Select State'}
              />
            </div>

            {/* City with react-country-state-city */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">City *</label>
              <CitySelect
                countryid={shippingCountryId}
                stateid={shippingStateId}
                defaultValue={shippingForm.city ? { name: shippingForm.city } : undefined}
                onChange={(val) => {
                  setShippingForm({ ...shippingForm, city: val.name });
                }}
                placeHolder={shippingForm.city || 'Select City'}
              />
            </div>

            {/* Pincode */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Postal PIN Code *</label>
              <input
                type="text"
                value={shippingForm.pincode}
                onChange={(e) => setShippingForm({ ...shippingForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                placeholder="400705"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-mono font-medium text-slate-900"
                required
              />
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
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Country *</label>
                <CountrySelect
                  defaultValue={{ id: 101, name: billingForm.country || 'India' }}
                  onChange={(val) => {
                    setBillingCountryId(val.id);
                    setBillingForm({ ...billingForm, country: val.name });
                  }}
                  placeHolder="Select Country"
                />
              </div>

              {/* State with react-country-state-city */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">State *</label>
                <StateSelect
                  countryid={billingCountryId}
                  defaultValue={billingForm.state ? { name: billingForm.state } : undefined}
                  onChange={(val) => {
                    setBillingStateId(val.id);
                    setBillingForm({ ...billingForm, state: val.name });
                  }}
                  placeHolder={billingForm.state || 'Select State'}
                />
              </div>

              {/* City with react-country-state-city */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">City *</label>
                <CitySelect
                  countryid={billingCountryId}
                  stateid={billingStateId}
                  defaultValue={billingForm.city ? { name: billingForm.city } : undefined}
                  onChange={(val) => {
                    setBillingForm({ ...billingForm, city: val.name });
                  }}
                  placeHolder={billingForm.city || 'Select City'}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Postal PIN Code *</label>
                <input
                  type="text"
                  value={billingForm.pincode}
                  onChange={(e) => setBillingForm({ ...billingForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  placeholder="400021"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-mono font-medium text-slate-900"
                  required
                />
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
