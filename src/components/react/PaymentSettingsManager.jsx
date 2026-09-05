import React, { useState, useEffect } from 'react';
import {
  getPaymentSettings,
  savePaymentSettings,
  updatePaymentSettingsApi,
  fetchAdminPaymentSettingsApi,
  DEFAULT_PAYMENT_SETTINGS,
} from '../../services/paymentSettingsService.js';
import { userStore } from '../../store/authStore.js';
import { useStore } from '@nanostores/react';
import {
  CreditCard,
  Building2,
  Truck,
  Sparkles,
  Key,
  CheckCircle2,
  Save,
  Eye,
  EyeOff,
  RotateCcw,
  Lock,
} from 'lucide-react';

export default function PaymentSettingsManager() {
  const user = useStore(userStore);
  const [settings, setSettings] = useState(() => getPaymentSettings());
  const [showSecret, setShowSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    // Read local cache first for immediate render
    setSettings(getPaymentSettings());
    // Fetch live from database admin endpoint
    fetchAdminPaymentSettingsApi(user?.accessToken)
      .then((live) => {
        if (live) {
          setSettings(live);
        }
      })
      .catch((e) => {
        console.warn('Live settings fetch error', e);
      });
  }, [user]);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...(prev || DEFAULT_PAYMENT_SETTINGS), [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updated = await updatePaymentSettingsApi(user?.accessToken, settings);
      setSettings(updated);
      setToastMessage('Payment gateway settings & API keys successfully updated!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (e) {
      console.error(e);
      savePaymentSettings(settings);
      setToastMessage('Settings saved locally.');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset payment settings to TradeLogix defaults?')) {
      const defaults = { ...DEFAULT_PAYMENT_SETTINGS };
      savePaymentSettings(defaults);
      setSettings(defaults);
      setToastMessage('Reset to default configurations.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const currentSettings = settings || DEFAULT_PAYMENT_SETTINGS;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2.5 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider border border-brand-200">
            Storefront Gateway Control
          </span>
          <h2 className="font-display font-black text-2xl text-slate-900">
            Payment Gateways & Options Engine Settings
          </h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Toggle customer-facing checkout payment channels, configure Razorpay API credentials, set COD limits, and update offline bank transfer parameters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ================= 1. RAZORPAY GATEWAY ================= */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Razorpay Online Payment Gateway
                </h3>
                <p className="text-xs text-slate-500">
                  Accept Cards (Visa/MasterCard/RuPay), UPI, and Corporate NetBanking
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(currentSettings.razorpayEnabled)}
                onChange={(e) => handleChange('razorpayEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="ml-3 text-xs font-bold text-slate-700">
                {currentSettings.razorpayEnabled ? (
                  <span className="text-emerald-700">ENABLED</span>
                ) : (
                  <span className="text-slate-400">DISABLED</span>
                )}
              </span>
            </label>
          </div>

          {/* Razorpay API Key Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-brand-600" />
                Razorpay Key ID *
              </label>
              <input
                type="text"
                value={currentSettings.razorpayKeyId || ''}
                onChange={(e) => handleChange('razorpayKeyId', e.target.value)}
                placeholder="rzp_test_..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-mono text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <p className="text-[11px] text-slate-400">Public Key ID used in checkout modal script</p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-brand-600" />
                Razorpay Key Secret *
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={currentSettings.razorpayKeySecret || ''}
                  onChange={(e) => handleChange('razorpayKeySecret', e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-mono text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">Used for HMAC SHA256 webhook & signature verification</p>
            </div>
          </div>
        </div>

        {/* ================= 2. OFFLINE BANK TRANSFER (NEFT/RTGS) ================= */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Offline Bank Wire Transfer (NEFT / RTGS / IMPS)
                </h3>
                <p className="text-xs text-slate-500">
                  Display corporate account details on checkout and collect customer UTR references
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(currentSettings.offlineTransferEnabled)}
                onChange={(e) => handleChange('offlineTransferEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="ml-3 text-xs font-bold text-slate-700">
                {currentSettings.offlineTransferEnabled ? (
                  <span className="text-emerald-700">ENABLED</span>
                ) : (
                  <span className="text-slate-400">DISABLED</span>
                )}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-700">Beneficiary Legal Entity Name *</label>
              <input
                type="text"
                value={currentSettings.bankBeneficiaryName || ''}
                onChange={(e) => handleChange('bankBeneficiaryName', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Account Type *</label>
              <input
                type="text"
                value={currentSettings.bankAccountType || ''}
                onChange={(e) => handleChange('bankAccountType', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Account Number *</label>
              <input
                type="text"
                value={currentSettings.bankAccountNumber || ''}
                onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-mono text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">IFSC Code *</label>
              <input
                type="text"
                value={currentSettings.bankIfscCode || ''}
                onChange={(e) => handleChange('bankIfscCode', e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-mono text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Bank Name *</label>
              <input
                type="text"
                value={currentSettings.bankName || ''}
                onChange={(e) => handleChange('bankName', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-3 space-y-1.5">
              <label className="font-bold text-slate-700">Branch Name & Location</label>
              <input
                type="text"
                value={currentSettings.bankBranch || ''}
                onChange={(e) => handleChange('bankBranch', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* ================= 3. STANDARD CASH ON DELIVERY (COD) ================= */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Standard Cash On Delivery (COD)
                </h3>
                <p className="text-xs text-slate-500">
                  Allow cash collection at destination with configurable maximum cart threshold
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(currentSettings.codEnabled)}
                onChange={(e) => handleChange('codEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="ml-3 text-xs font-bold text-slate-700">
                {currentSettings.codEnabled ? (
                  <span className="text-emerald-700">ENABLED</span>
                ) : (
                  <span className="text-slate-400">DISABLED</span>
                )}
              </span>
            </label>
          </div>

          <div className="max-w-md space-y-1.5 text-xs">
            <label className="font-bold text-slate-700">Maximum COD Cart Limit (₹ INR) *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                value={currentSettings.codMaxLimit ?? 50000}
                onChange={(e) => handleChange('codMaxLimit', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-mono focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Orders exceeding this amount will automatically have COD disabled during checkout.
            </p>
          </div>
        </div>

        {/* ================= 4. CONDITIONAL PARTIAL COD ================= */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Conditional Partial COD (Online Deposit + Balance on Delivery)
                </h3>
                <p className="text-xs text-slate-500">
                  Collect immediate online deposit with remaining balance collected at delivery
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(currentSettings.partialCodEnabled)}
                onChange={(e) => handleChange('partialCodEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="ml-3 text-xs font-bold text-slate-700">
                {currentSettings.partialCodEnabled ? (
                  <span className="text-emerald-700">ENABLED</span>
                ) : (
                  <span className="text-slate-400">DISABLED</span>
                )}
              </span>
            </label>
          </div>

          <div className="max-w-md space-y-1.5 text-xs">
            <label className="font-bold text-slate-700">Online Deposit Percentage (%) *</label>
            <div className="relative">
              <input
                type="number"
                min="5"
                max="50"
                value={currentSettings.partialCodPercentage ?? 10}
                onChange={(e) => handleChange('partialCodPercentage', parseFloat(e.target.value) || 10)}
                className="w-full pl-4 pr-8 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-mono focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Default is 10% online via Razorpay + 90% balance COD due on arrival.
            </p>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 hover:shadow-slate-900/25 active:scale-98"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving Configurations...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Payment Gateway Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
