import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { sendOtpApi, verifyOtpApi, verifyGstApi, registerB2bCustomerApi, setSession, logoutUser } from '../../store/authStore.js';
import PhoneInputField from './PhoneInputField.jsx';
import { lookupPincode, INDIAN_STATES } from '../../services/pincodeService.js';
import { ArrowRight, Smartphone, Lock, CheckCircle, ChevronLeft, Building2, User2, AlertCircle, Info, Clock } from 'lucide-react';

export default function UserAuthForm() {
  const [step, setStep] = useState('mobile'); // 'mobile', 'otp', 'buyer_type', 'gst_form', 'nongst_form', 'pending_approval', 'success'
  const [mobileNumber, setMobileNumber] = useState('');
  const [code, setCode] = useState('');
  const [buyerType, setBuyerType] = useState('GST'); // 'GST', 'NON_GST'

  // 15-Minute OTP Expiration Countdown
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(15 * 60);

  useEffect(() => {
    let interval = null;
    if (step === 'otp' && otpSecondsLeft > 0) {
      interval = setInterval(() => {
        setOtpSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpSecondsLeft]);

  const formatOtpTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // If user is already logged in, redirect them away from the login screen
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tradelogix_user');
      if (saved) {
        const user = JSON.parse(saved);
        if (user && user.isLoggedIn) {
          const params = new URLSearchParams(window.location.search);
          const redirectUrl = params.get('redirect') || (user.role && user.role.toLowerCase() === 'admin' ? '/admin' : '/dashboard');
          window.location.replace(redirectUrl);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);
  
  // Registration Form Fields
  const [gstin, setGstin] = useState('');
  const [firmName, setFirmName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Maharashtra');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeMsg, setPincodeMsg] = useState(null);
  const [businessConstitution, setBusinessConstitution] = useState('');
  const [email, setEmail] = useState('');

  const handlePincodeChange = async (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setPincode(clean);
    setCountry('India');
    if (clean.length === 6) {
      setPincodeLoading(true);
      setPincodeMsg(null);
      const res = await lookupPincode(clean);
      setPincodeLoading(false);
      if (res && res.success) {
        if (res.city) setCity(res.city);
        if (res.state) setState(res.state);
        setCountry('India');
        setPincodeMsg({ success: true, text: `${res.city}, ${res.state}` });
      } else {
        setPincodeMsg({ success: false, text: res?.message || 'PIN code not found' });
      }
    } else {
      setPincodeMsg(null);
    }
  };
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otpCodeToShow, setOtpCodeToShow] = useState(null);
  const [gstVerified, setGstVerified] = useState(false);
  const [pendingStatusMsg, setPendingStatusMsg] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // OTP Sending Handlers
  const handleSendOtp = async (e) => {
    e.preventDefault();
    // Clear any previous session so old customer data never leaks
    logoutUser();
    
    // Normalize phone number for API (digits only, minimum 10)
    const cleanPhone = (mobileNumber || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await sendOtpApi(cleanPhone);
      setOtpCodeToShow(data.otpCode); // returned in response for easy testing
      setOtpSecondsLeft(15 * 60);
      setStep('otp');
      toast.info('OTP verification code sent (valid for 15 minutes)');
    } catch (err) {
      const msg = err.message || 'Failed to send OTP. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Verification Handlers
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) return;
    setIsLoading(true);
    setError(null);
    try {
      const cleanPhone = (mobileNumber || '').replace(/\D/g, '');
      const data = await verifyOtpApi(cleanPhone, code);
      if (data.isRegistered) {
        if (data.isApproved) {
          // Logged in! Save session and redirect
          setSession(data);
          toast.success('Signed in successfully');
          const params = new URLSearchParams(window.location.search);
          const redirectUrl = params.get('redirect') || (data.role && data.role.toLowerCase() === 'admin' ? '/admin' : '/dashboard');
          window.location.replace(redirectUrl);
        } else {
          // Account exists but is not approved
          const msg = `Your B2B account status is "${data.status}". Access to wholesale pricing is granted only after admin approval.`;
          setPendingStatusMsg(msg);
          toast.warning('Account pending admin approval');
          setStep('pending_approval');
        }
      } else {
        // New user! Go to selection
        toast.info('Mobile verified. Complete your registration.');
        setStep('buyer_type');
      }
    } catch (err) {
      const msg = err.message || 'Invalid OTP code.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // GST Verification Handler
  const handleVerifyGstin = async () => {
    if (!gstin || gstin.length !== 15) {
      setError('Please enter a valid 15-digit GSTIN.');
      toast.error('Please enter a valid 15-digit GSTIN.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await verifyGstApi(gstin);
      if (data.valid) {
        setGstVerified(true);
        setFirmName(data.tradeName || data.legalName || '');
        setOwnerName(data.legalName || '');
        setBusinessConstitution(data.constitutionOfBusiness || 'Proprietorship');
        setAddress(data.pradr?.addr?.bno ? `${data.pradr.addr.bno}, ${data.pradr.addr.st || ''}, ${data.pradr.addr.loc || ''}` : data.principalPlace || '');
        setCity(data.pradr?.addr?.dst || data.pradr?.addr?.city || '');
        setState(data.pradr?.addr?.stcd || data.state || 'Maharashtra');
        setPincode(data.pradr?.addr?.pncd || '');
        toast.success('GSTIN verified successfully');
      } else {
        const msg = 'Invalid GSTIN. Could not verify with tax registry.';
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = err.message || 'GSTIN verification failed. Please enter details manually.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Onboarding Registration Handlers
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!city || !state) {
      const msg = 'Please enter a valid 6-digit Indian PIN code to auto-detect City and State.';
      setError(msg);
      toast.error(msg);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const cleanPhone = (mobileNumber || '').replace(/\D/g, '');
      const payload = {
        mobileNumber: cleanPhone,
        buyerType: buyerType === 'GST' ? 'GST' : 'NON_GST',
        email,
        ownerName,
        firmName,
        address,
        country,
        city,
        state,
        pincode,
        businessConstitution: buyerType === 'GST' ? businessConstitution : 'N/A',
        gstin: buyerType === 'GST' ? gstin : null,
      };
      
      await registerB2bCustomerApi(payload);
      logoutUser();
      toast.success('Registration submitted successfully! Pending approval.');
      setStep('success');
    } catch (err) {
      const msg = err.message || 'Failed to complete registration.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Mobile number input
  if (step === 'mobile') {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="text-center space-y-1.5 mb-2">
          <h2 className="text-slate-900 font-extrabold text-2xl sm:text-3xl font-display tracking-tight">B2B Customer Sign In</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">Sign in or register your B2B account via Mobile OTP</p>
        </div>

        <form onSubmit={handleSendOtp} className="space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-start gap-2 text-[11px] font-medium leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px] flex items-center">
              Mobile Number <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <PhoneInputField
              country={'in'}
              value={mobileNumber}
              placeholder="98765 43210"
              onChange={(phone) => setMobileNumber(phone)}
              inputClass="!w-full !h-12 !text-sm !bg-white !rounded-xl !border-slate-300 focus:!border-brand-500 font-bold !text-slate-900 shadow-sm"
              buttonClass="!bg-white !border-slate-300 !rounded-l-xl"
              containerClass="!w-full shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || (mobileNumber || '').replace(/\D/g, '').length < 10 || !termsAccepted}
            className="w-full py-3.5 rounded-xl gradient-brand text-white font-display font-bold text-xs shadow-md hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Get OTP <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-start gap-2.5 pt-2 text-[11px] text-slate-500 font-medium leading-relaxed">
            <input
              type="checkbox"
              id="terms_accept"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 mt-0.5 cursor-pointer accent-brand-600"
            />
            <label htmlFor="terms_accept" className="cursor-pointer select-none text-[11px] text-slate-500">
              By continuing, you agree to our{' '}
              <a href="#" className="underline font-bold text-slate-800 hover:text-brand-600 transition-colors">
                Terms of Service
              </a>{' '}
              &{' '}
              <a href="#" className="underline font-bold text-slate-800 hover:text-brand-600 transition-colors">
                Privacy Policy
              </a>
            </label>
          </div>
        </form>
      </div>
    );
  }

  // Step 2: OTP Verification
  if (step === 'otp') {
    return (
      <div className="space-y-6 animate-fadeIn">
        <button 
          onClick={() => setStep('mobile')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Change Mobile Number
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto text-brand-600 shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-display text-slate-900">Verify OTP</h2>
          <p className="text-xs text-slate-500">
            Enter 6-digit code sent to <span className="font-semibold text-slate-800 font-mono">+{mobileNumber}</span>
          </p>
        </div>

        {/* 15-Minute Expiry Countdown Badge */}
        <div className="flex items-center justify-center gap-2 py-2 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl w-fit mx-auto text-xs font-mono">
          <Clock className="w-4 h-4 text-brand-600 shrink-0" />
          {otpSecondsLeft > 0 ? (
            <span className="text-slate-700">
              Valid for: <strong className="text-brand-700 font-bold">{formatOtpTime(otpSecondsLeft)}</strong>
            </span>
          ) : (
            <span className="text-rose-600 font-bold">Code Expired (15 min limit)</span>
          )}
        </div>

        {otpCodeToShow && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-center text-xs font-mono">
            <strong>Development Mock OTP:</strong> <span className="text-base font-bold text-amber-900 tracking-widest">{otpCodeToShow}</span>
          </div>
        )}

        {otpSecondsLeft <= 0 && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>This OTP code has expired. Please click <strong>Resend OTP Code</strong> below to receive a fresh verification code.</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-start gap-2 text-[11px] font-medium leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <input
              type="text"
              required
              maxLength={6}
              disabled={otpSecondsLeft <= 0}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full text-center text-2xl font-bold tracking-[0.5em] font-mono py-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all shadow-sm disabled:bg-slate-100 disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length !== 6 || otpSecondsLeft <= 0}
            className="w-full py-3.5 rounded-xl gradient-brand text-white font-display font-bold text-xs shadow-md hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'VERIFY & CONTINUE'
            )}
          </button>
        </form>

        <div className="space-y-2 text-center">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleSendOtp}
            className="text-xs text-brand-600 hover:text-brand-700 font-semibold transition-colors cursor-pointer"
          >
            Resend OTP Code
          </button>
          <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto">
            OTP is strictly valid for 15 minutes. For privacy and security, expired codes are permanently deleted after 16 minutes.
          </p>
        </div>
      </div>
    );
  }

  // Step 3: Select Buyer Type (GST vs Non-GST) - Per Doc Section 4
  if (step === 'buyer_type') {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-bold font-display text-slate-900">Are you a GST Registered Buyer?</h2>
          <p className="text-xs text-slate-500">Select your B2B account category to complete registration</p>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          <button
            type="button"
            onClick={() => {
              setBuyerType('GST');
              setStep('gst_form');
            }}
            className="p-5 rounded-2xl border-2 border-slate-200 hover:border-brand-500 hover:bg-brand-50/20 text-left transition-all group flex items-start gap-4 shadow-sm"
          >
            <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl text-brand-600 group-hover:scale-105 transition-transform shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm group-hover:text-brand-600 flex items-center gap-2">
                Yes – GST Buyer
                <span className="text-[10px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-semibold">Auto-Fill & ITC</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Automated validation via GSTIN API. Auto-fills legal business name and registered address.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setBuyerType('NON_GST');
              setStep('nongst_form');
            }}
            className="p-5 rounded-2xl border-2 border-slate-200 hover:border-brand-500 hover:bg-brand-50/20 text-left transition-all group flex items-start gap-4 shadow-sm"
          >
            <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 group-hover:scale-105 transition-transform shrink-0">
              <User2 className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm group-hover:text-brand-600">
                No – Non-GST Buyer
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                For small retailers, local contractors, and businesses operating under the GST exemption threshold.
              </p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Step 4a: GST Form (Per Doc Section 5 & 6)
  if (step === 'gst_form') {
    return (
      <div className="space-y-5 animate-fadeIn">
        <button 
          onClick={() => setStep('buyer_type')}
          className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Change Buyer Type
        </button>

        <div className="space-y-1">
          <h2 className="text-lg font-bold font-display text-slate-900">GST Buyer Registration</h2>
          <p className="text-xs text-slate-500">Enter your 15-digit GSTIN for instant verification & auto-fill</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-start gap-2 text-[11px] font-medium leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">GSTIN</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase().slice(0, 15))}
                placeholder="e.g. 27AAAAA1111A1Z1"
                className="flex-1 px-3.5 h-11 rounded-xl border border-slate-200 bg-white text-slate-900 uppercase font-mono tracking-wider text-xs focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all shadow-sm font-semibold"
              />
              <button
                type="button"
                disabled={isLoading || gstin.length !== 15}
                onClick={handleVerifyGstin}
                className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all text-xs disabled:opacity-50 shrink-0 shadow-sm flex items-center justify-center min-w-[90px]"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : 'Verify'}
              </button>
            </div>
          </div>

          {gstVerified && (
            <div className="space-y-3.5 pt-3.5 border-t border-slate-100 animate-fadeIn">
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl flex items-start gap-2.5 leading-normal">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">GSTIN Lookup Successful</div>
                  <div className="text-[10px] text-emerald-600 font-medium">Business details retrieved from tax registry.</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Firm / Legal Name</label>
                <input
                  type="text"
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  required
                  placeholder="Firm Legal Name"
                  className="w-full px-3.5 h-11 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all shadow-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Business Constitution</label>
                <input
                  type="text"
                  value={businessConstitution}
                  onChange={(e) => setBusinessConstitution(e.target.value)}
                  placeholder="Proprietorship, Partnership, Ltd."
                  className="w-full px-3.5 h-11 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all shadow-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Owner Name</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    required
                    placeholder="Owner Name"
                    className="w-full px-3.5 h-11 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all shadow-sm font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="email@example.com"
                    className="w-full px-3.5 h-11 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all shadow-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Registered Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="Street Address, City, State..."
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all shadow-sm min-h-[50px] resize-none"
                />
              </div>

              {/* Postal PIN Code with Autofill */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Pincode *</label>
                  {pincodeLoading && (
                    <span className="text-[10px] text-brand-600 flex items-center gap-1 font-medium">
                      <span className="w-2.5 h-2.5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></span>
                      Looking up...
                    </span>
                  )}
                  {pincodeMsg && (
                    <span className={`text-[10px] font-medium ${pincodeMsg.success ? 'text-emerald-600 font-semibold' : 'text-amber-600'}`}>
                      {pincodeMsg.success ? `✓ ${pincodeMsg.text}` : pincodeMsg.text}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  required
                  placeholder="e.g. 400059"
                  maxLength={6}
                  className="w-full px-3 h-11 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono text-center text-xs focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all shadow-sm font-semibold tracking-wider"
                />
              </div>

              {/* City, State & Country (Autofilled & Disabled) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px] flex items-center justify-between">
                    <span>City / District *</span>
                    <span className="text-[8px] text-slate-400 font-normal lowercase">auto-filled</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    readOnly
                    disabled
                    placeholder="Auto-filled from PIN"
                    className="w-full px-3 h-11 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 text-xs cursor-not-allowed outline-none shadow-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px] flex items-center justify-between">
                    <span>State *</span>
                    <span className="text-[8px] text-slate-400 font-normal lowercase">auto-filled</span>
                  </label>
                  <input
                    type="text"
                    value={state}
                    readOnly
                    disabled
                    placeholder="Auto-filled from PIN"
                    className="w-full px-3 h-11 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 text-xs cursor-not-allowed outline-none shadow-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Country</label>
                  <div className="w-full px-3 h-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs flex items-center gap-1.5 font-medium select-none">
                    <span>🇮🇳</span>
                    <span>India</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl gradient-brand text-white font-display font-bold text-xs shadow-md hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Complete B2B Registration <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    );
  }

  // Step 4b: Non-GST Form (Per Doc Section 7)
  if (step === 'nongst_form') {
    return (
      <div className="space-y-5 animate-fadeIn">
        <button 
          onClick={() => setStep('buyer_type')}
          className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Change Buyer Type
        </button>

        <div className="space-y-1">
          <h2 className="text-lg font-bold font-display text-slate-900">Non-GST Buyer Registration</h2>
          <p className="text-xs text-slate-500">Provide business and owner details to request TradeLogix B2B approval</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-3.5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-start gap-2 text-[11px] font-medium leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Business / Trade Name *</label>
            <input
              type="text"
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
              required
              placeholder="e.g. Ramesh Hardware & Tools"
              className="w-full px-3.5 h-11 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all shadow-sm font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Owner / Proprietor Name *</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
                placeholder="Full Name"
                className="w-full px-3.5 h-11 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all shadow-sm font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
                className="w-full px-3.5 h-11 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Full Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder="Flat/House, Street, Area name..."
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all shadow-sm min-h-[50px] resize-none"
            />
          </div>

          {/* Postal PIN Code with Autofill */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Pincode *</label>
              {pincodeLoading && (
                <span className="text-[10px] text-brand-600 flex items-center gap-1 font-medium">
                  <span className="w-2.5 h-2.5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></span>
                  Looking up...
                </span>
              )}
              {pincodeMsg && (
                <span className={`text-[10px] font-medium ${pincodeMsg.success ? 'text-emerald-600 font-semibold' : 'text-amber-600'}`}>
                  {pincodeMsg.success ? `✓ ${pincodeMsg.text}` : pincodeMsg.text}
                </span>
              )}
            </div>
            <input
              type="text"
              value={pincode}
              onChange={(e) => handlePincodeChange(e.target.value)}
              required
              placeholder="e.g. 400059"
              maxLength={6}
              className="w-full px-3 h-11 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono text-center text-xs focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all shadow-sm font-semibold tracking-wider"
            />
          </div>

          {/* City, State & Country (Autofilled & Disabled) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px] flex items-center justify-between">
                <span>City / District *</span>
                <span className="text-[8px] text-slate-400 font-normal lowercase">auto-filled</span>
              </label>
              <input
                type="text"
                value={city}
                readOnly
                disabled
                placeholder="Auto-filled from PIN"
                className="w-full px-3 h-11 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 text-xs cursor-not-allowed outline-none shadow-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px] flex items-center justify-between">
                <span>State *</span>
                <span className="text-[8px] text-slate-400 font-normal lowercase">auto-filled</span>
              </label>
              <input
                type="text"
                value={state}
                readOnly
                disabled
                placeholder="Auto-filled from PIN"
                className="w-full px-3 h-11 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 text-xs cursor-not-allowed outline-none shadow-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Country</label>
              <div className="w-full px-3 h-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs flex items-center gap-1.5 font-medium select-none">
                <span>🇮🇳</span>
                <span>India</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl gradient-brand text-white font-display font-bold text-xs shadow-md hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Register & Submit <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  // Step 5: Pending Approval Notice (Per Doc Section 8)
  if (step === 'pending_approval') {
    return (
      <div className="space-y-6 text-center animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto text-amber-600 shadow-sm">
          <Info className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold font-display text-slate-900">Account Under Review</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {pendingStatusMsg || 'Your B2B customer account has been submitted and is currently pending administrator approval.'}
          </p>
        </div>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 text-xs">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Approval & Pricing Access:
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            TradeLogix verifies business credentials to assign your customer price group and warehouse depot. Once approved, you will gain full access to wholesale slab pricing and purchase orders.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            logoutUser();
            setStep('mobile');
          }}
          className="w-full py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
        >
          Sign in with another mobile number
        </button>
      </div>
    );
  }

  // Step 6: Registration Success
  if (step === 'success') {
    return (
      <div className="space-y-6 text-center animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold font-display text-slate-900">Registration Received!</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Thank you for applying for a TradeLogix B2B wholesale account. Your submission is under review.
          </p>
        </div>
        <a
          href="/"
          className="inline-flex w-full py-3.5 rounded-xl gradient-brand text-white font-display font-bold text-xs shadow-md hover:scale-[1.02] active:scale-[0.99] items-center justify-center gap-2 transition-all"
        >
          Return to Storefront
        </a>
      </div>
    );
  }

  return null;
}
