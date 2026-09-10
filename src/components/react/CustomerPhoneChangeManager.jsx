import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useStore } from '@nanostores/react';
import { userStore } from '../../store/authStore.js';
import PhoneInputField from './PhoneInputField.jsx';
import {
  fetchCustomerProfileApi,
  sendPhoneChangeOtpApi,
  verifyAndUpdatePhoneApi,
} from '../../services/customerService.js';
import {
  Phone,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Lock,
  Smartphone,
  LogIn,
  Clock,
} from 'lucide-react';

export default function CustomerPhoneChangeManager() {
  const user = useStore(userStore);

  // Initialize immediately from store or localStorage
  const [currentPhone, setCurrentPhone] = useState(() => {
    if (user?.mobileNumber || user?.mobile) return user.mobileNumber || user.mobile;
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('tradelogix_user') || '{}');
        return stored?.mobileNumber || stored?.mobile || '';
      } catch (e) {}
    }
    return '';
  });

  const [newPhone, setNewPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState(1); // 1 = Enter Number, 2 = Verify OTP, 3 = Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [mockCode, setMockCode] = useState(null);

  // 15-Minute Expiry Countdown
  const [otpExpirySeconds, setOtpExpirySeconds] = useState(15 * 60);

  useEffect(() => {
    let interval = null;
    if (step === 2 && otpExpirySeconds > 0) {
      interval = setInterval(() => {
        setOtpExpirySeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpExpirySeconds]);

  const formatOtpTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    async function loadCurrent() {
      try {
        const profile = await fetchCustomerProfileApi(user?.accessToken);
        if (profile?.mobileNumber) {
          setCurrentPhone(profile.mobileNumber);
        } else if (user?.mobileNumber || user?.mobile) {
          setCurrentPhone(user.mobileNumber || user.mobile);
        }
      } catch (e) {}
    }
    loadCurrent();
  }, [user]);

  // Resend Timer countdown
  useEffect(() => {
    let interval = null;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError(null);

    const clean = (newPhone || '').replace(/\D/g, '').slice(-10);
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    const cleanCurrent = (currentPhone || '').replace(/\D/g, '').slice(-10);
    if (clean === cleanCurrent) {
      setError('New mobile number cannot be the same as your current active number');
      toast.error('New mobile number cannot be the same as your current active number');
      return;
    }

    setLoading(true);
    try {
      const res = await sendPhoneChangeOtpApi(user?.accessToken, clean);
      if (res?.otpCode) {
        setMockCode(res.otpCode);
      }
      setStep(2);
      setResendTimer(30);
      setOtpExpirySeconds(15 * 60);
      toast.info('OTP verification code sent (valid for 15 minutes)');
    } catch (err) {
      const msg = err?.message || 'Failed to send OTP to new number';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setError(null);

    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter the 6-digit verification code');
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    const clean = (newPhone || '').replace(/\D/g, '').slice(-10);
    setLoading(true);

    try {
      const res = await verifyAndUpdatePhoneApi(user?.accessToken, clean, otpCode);
      const msg = res?.message || 'Mobile number updated successfully!';
      setSuccessMessage(msg);
      setCurrentPhone(clean);
      setStep(3);
      toast.success(msg);
    } catch (err) {
      const msg = err?.message || 'Invalid or expired OTP code';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayPhone = (raw) => {
    if (!raw) return 'Login required';
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    if (digits.length === 12 && digits.startsWith('91')) return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
    return `+${digits}`;
  };

  const token = user?.accessToken || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('tradelogix_user') || '{}')?.accessToken : '');

  if (!token) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Authentication Required</h2>
          <p className="text-xs text-slate-500 mt-1">Please sign in to view and modify your B2B login credentials.</p>
        </div>
        <a
          href="/login?redirect=/dashboard/change-phone"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow transition-all"
        >
          <LogIn className="w-4 h-4" /> Sign In to Customer Account
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Change Login Mobile Number</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Securely update your primary B2B authentication number via OTP verification.
            </p>
          </div>
        </div>

        {/* Current Active Number Badge */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Active Number</span>
            <div className="font-mono font-bold text-sm text-slate-800">
              {formatDisplayPhone(currentPhone)}
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Active Login ID
          </span>
        </div>

        {/* Alert / Error Banners */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            {error}
          </div>
        )}

        {/* ================= STEP 1: ENTER NEW NUMBER ================= */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">New Mobile Number *</label>
              <PhoneInputField
                country={'in'}
                value={newPhone}
                onChange={(phone) => setNewPhone(phone)}
                inputClass="!w-full !h-12 !text-sm !bg-slate-50 !rounded-xl !border-slate-200 font-bold !text-slate-900"
                buttonClass="!bg-slate-50 !border-slate-200 !rounded-l-xl"
                containerClass="!w-full shadow-sm"
              />
              <p className="text-[11px] text-slate-400">
                A 6-digit one-time password (OTP) will be sent to this number for ownership verification.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading || (newPhone || '').replace(/\D/g, '').length < 10}
                className="px-6 py-3 rounded-xl gradient-brand text-white font-bold text-xs shadow-md hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <KeyRound className="w-4 h-4" />
                )}
                {loading ? 'Sending OTP...' : 'Send Verification OTP'}
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 2: VERIFY OTP ================= */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 animate-fadeIn">
            <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-brand-900">OTP Sent!</div>
                <div className="flex items-center gap-1.5 py-1 px-2.5 bg-white/80 border border-brand-200 rounded-full text-[11px] font-mono font-bold text-brand-900">
                  <Clock className="w-3.5 h-3.5 text-brand-600" />
                  {otpExpirySeconds > 0 ? (
                    <span>Expires: {formatOtpTime(otpExpirySeconds)}</span>
                  ) : (
                    <span className="text-rose-600">Expired</span>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-brand-700">
                We sent a 6-digit verification code to <strong className="font-mono">{formatDisplayPhone(newPhone)}</strong>
              </p>
              {mockCode && (
                <div className="mt-2 pt-2 border-t border-brand-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-brand-600 font-medium">Demo Code:</span>
                  <span className="font-mono font-bold text-brand-900 bg-white px-2 py-0.5 rounded border border-brand-200">
                    {mockCode}
                  </span>
                </div>
              )}
            </div>

            {otpExpirySeconds <= 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>This OTP code has expired (15 min limit). Please click <strong>Resend OTP</strong> to request a new code.</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Enter 6-Digit OTP *</label>
              <input
                type="text"
                maxLength={6}
                disabled={otpExpirySeconds <= 0}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-bold text-slate-900 disabled:opacity-50"
                required
              />
            </div>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              OTP is valid for a maximum of 15 minutes. For security, expired codes are permanently deleted after 16 minutes.
            </p>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                &larr; Change Number
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={resendTimer > 0 || loading}
                  onClick={handleSendOtp}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 disabled:text-slate-400 transition-colors"
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                </button>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6 || otpExpirySeconds <= 0}
                  className="px-6 py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {loading ? 'Verifying...' : 'Verify & Update'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ================= STEP 3: SUCCESS ================= */}
        {step === 3 && (
          <div className="text-center py-6 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Mobile Number Updated!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {successMessage || 'Your primary B2B authentication number has been successfully updated.'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-sm mx-auto text-xs space-y-1 text-left">
              <div className="text-slate-400 font-medium">New Login Identifier:</div>
              <div className="font-mono font-bold text-slate-900 text-sm">
                {formatDisplayPhone(currentPhone)}
              </div>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <a
                href="/dashboard/profile"
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                View Profile
              </a>
              <a
                href="/shop"
                className="px-5 py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow hover:opacity-90 transition-all flex items-center gap-1.5"
              >
                Continue Shopping &rarr;
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
