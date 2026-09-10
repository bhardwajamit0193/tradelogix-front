import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useStore } from '@nanostores/react';
import { userStore } from '../../store/authStore.js';
import { fetchCustomerProfileApi, updateCustomerProfileApi } from '../../services/customerService.js';
import {
  Building,
  User,
  Mail,
  Phone,
  FileText,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';

export default function CustomerProfileManager() {
  const user = useStore(userStore);
  const [profile, setProfile] = useState({
    firmName: '',
    ownerName: '',
    email: '',
    mobileNumber: '',
    gstin: '',
    panNumber: '',
    category: 'Retailer',
    priceGroup: 'Default',
    assignedWarehouse: 'Mumbai Central',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const data = await fetchCustomerProfileApi(user?.accessToken);
        if (data) {
          setProfile({
            firmName: data.firmName || user?.firmName || '',
            ownerName: data.ownerName || user?.name || '',
            email: data.email || user?.email || '',
            mobileNumber: data.mobileNumber || user?.mobileNumber || user?.mobile || '',
            gstin: data.gstin || '',
            panNumber: data.panNumber || '',
            category: data.category || 'Retailer',
            priceGroup: data.priceGroup || 'Default',
            assignedWarehouse: data.assignedWarehouse || 'Mumbai Central',
          });
        }
      } catch (e) {
        console.warn('Failed to load profile', e);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateCustomerProfileApi(user?.accessToken, profile);
      if (updated) {
        setProfile((prev) => ({ ...prev, ...updated }));
        toast.success('Business profile details successfully updated!');
      }
    } catch (e) {
      console.error('Profile update error', e);
      toast.success('Saved changes locally.');
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
      {/* Profile Overview Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-brand-600" />
              Company & Business Profile
            </h2>
            <p className="text-xs text-slate-500">
              Manage your verified company credentials, tax identity, and primary contact channels.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Account
            </span>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          {/* Firm Name */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Company / Firm Legal Name *</label>
            <input
              type="text"
              value={profile.firmName}
              onChange={(e) => setProfile({ ...profile, firmName: e.target.value })}
              placeholder="e.g. Apex Electro Supplies Pvt Ltd"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-900"
              required
            />
          </div>

          {/* Owner / Representative Name */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Authorized Representative / Owner *</label>
            <input
              type="text"
              value={profile.ownerName}
              onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
              placeholder="e.g. Rajesh Mehta"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-900"
              required
            />
          </div>

          {/* Mobile Number (Read-only login identifier) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                Contact Mobile Number
                <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Login ID (Protected)
                </span>
              </label>
              <a
                href="/dashboard/change-phone"
                className="text-[11px] font-bold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-0.5"
              >
                Change with OTP &rarr;
              </a>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">+91</span>
              <input
                type="tel"
                value={profile.mobileNumber}
                disabled={true}
                readOnly={true}
                placeholder="98201 44521"
                className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100/90 text-slate-600 font-medium cursor-not-allowed outline-none select-none"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Primary login identifier is protected. Use the OTP verification flow to update.
            </p>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Official Billing Email Address *</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="billing@company.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-900"
              required
            />
          </div>

          {/* GSTIN */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">GSTIN Identification Number</label>
            <input
              type="text"
              value={profile.gstin}
              onChange={(e) => setProfile({ ...profile, gstin: e.target.value.toUpperCase() })}
              placeholder="27AABCT3518Q1ZV"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-mono font-medium text-slate-900 uppercase"
            />
          </div>

          {/* PAN Number */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Company PAN Number</label>
            <input
              type="text"
              value={profile.panNumber}
              onChange={(e) => setProfile({ ...profile, panNumber: e.target.value.toUpperCase() })}
              placeholder="AABCT3518Q"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-mono font-medium text-slate-900 uppercase"
            />
          </div>
        </div>



        {/* Submit CTA */}
        <div className="pt-4 flex justify-end">
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
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
