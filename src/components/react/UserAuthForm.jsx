import React, { useState } from 'react';
import { sendOtpApi, verifyOtpApi, verifyGstApi, registerB2bCustomerApi, setSession } from '../../store/authStore.js';
import { ArrowRight, Smartphone, Lock, CheckCircle, ChevronLeft, Building2, User2, AlertCircle, Info } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { CountrySelect, StateSelect, CitySelect } from 'react-country-state-city';
import 'react-country-state-city/dist/react-country-state-city.css';

const PhoneInputComponent = PhoneInput.default || PhoneInput;

export default function UserAuthForm() {
  const [step, setStep] = useState('mobile'); // 'mobile', 'otp', 'buyer_type', 'gst_form', 'nongst_form', 'pending_approval', 'success'
  const [mobileNumber, setMobileNumber] = useState('');
  const [code, setCode] = useState('');
  const [buyerType, setBuyerType] = useState('GST'); // 'GST', 'NON_GST'
  
  // Registration Form Fields
  const [gstin, setGstin] = useState('');
  const [firmName, setFirmName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [businessConstitution, setBusinessConstitution] = useState('');
  const [email, setEmail] = useState('');
  
  const [countryId, setCountryId] = useState(101); // Default to India (101)
  const [stateId, setStateId] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otpCodeToShow, setOtpCodeToShow] = useState(null);
  const [gstVerified, setGstVerified] = useState(false);
  const [pendingStatusMsg, setPendingStatusMsg] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // OTP Sending Handlers
  const handleSendOtp = async (e) => {
    e.preventDefault();
    // Verify phone number has a reasonable length (includes country code now, e.g. 919876543210 is 12 chars)
    if (!mobileNumber || mobileNumber.length < 10) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await sendOtpApi(mobileNumber);
      setOtpCodeToShow(data.otpCode); // returned in response for easy testing
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
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
      const data = await verifyOtpApi(mobileNumber, code);
      if (data.isRegistered) {
        if (data.isApproved) {
          // Logged in! Save session and redirect
          setSession(data);
          window.location.href = '/shop';
        } else {
          // Account exists but is not approved
          setPendingStatusMsg(`Your B2B account status is "${data.status}". Access to wholesale pricing is granted only after admin approval.`);
          setStep('pending_approval');
        }
      } else {
        // New user! Go to selection
        setStep('buyer_type');
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  // GSTIN Validation
  const handleVerifyGstin = async () => {
    if (!gstin || gstin.length !== 15) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await verifyGstApi(gstin);
      setFirmName(data.firmName || '');
      setOwnerName(data.ownerName || '');
      setBusinessConstitution(data.businessConstitution || '');
      setAddress(data.address || '');
      setCity(data.city || '');
      setState(data.state || '');
      setPincode(data.pincode || '');
      setGstVerified(true);
    } catch (err) {
      setError(err.message || 'GSTIN verification failed. Please check the number.');
    } finally {
      setIsLoading(false);
    }
  };

  // Onboarding Registration Handlers
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        mobileNumber,
        buyerType: buyerType === 'GST' ? 'GST' : 'NON_GST',
        email,
        ownerName,
        firmName,
        address,
        city,
        state,
        pincode,
        businessConstitution: buyerType === 'GST' ? businessConstitution : 'N/A',
        gstin: buyerType === 'GST' ? gstin : null,
      };
      
      await registerB2bCustomerApi(payload);
      setStep('success');
    } catch (err) {
      setError(err.message || 'Failed to complete registration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Mobile number input
  if (step === 'mobile') {
    return (
      <div className="space-y-6">
        <h2 className="text-slate-850 font-bold text-3xl font-display text-center mb-6">Welcome</h2>
        <form onSubmit={handleSendOtp} className="space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-start gap-2 text-[11px] font-medium leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="relative !w-full">
            <span className="absolute -top-2 left-4 bg-white px-1.5 text-[11px] text-slate-400 font-bold z-10 flex items-center">
              Mobile <span className="text-rose-500 ml-0.5">*</span>
            </span>
            <PhoneInputComponent
              country={'in'}
              value={mobileNumber}
              onChange={(phone) => setMobileNumber(phone)}
              inputProps={{
                required: true,
                name: 'mobile',
                placeholder: 'Enter mobile number',
              }}
              containerClass="!w-full"
              inputClass="!w-full !p-3.5 !pl-20 !h-14 !rounded-xl !border-slate-200 !bg-white text-slate-850 text-base focus:!border-brand-500 focus:!outline-none transition-all shadow-sm"
              buttonClass="!bg-transparent !border-r !border-slate-200 !rounded-l-xl hover:!bg-slate-50"
              dropdownClass="!bg-white !rounded-xl !border-slate-200 !text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || mobileNumber.length < 10 || !termsAccepted}
            className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold tracking-wider hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4 text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand-500/10"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'GET OTP'
            )}
          </button>

          <div className="flex items-start gap-2.5 pt-2 text-[11px] text-slate-500 font-medium leading-relaxed">
            <input
              type="checkbox"
              id="terms_accept"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-350 mt-0.5 cursor-pointer"
            />
            <label htmlFor="terms_accept" className="cursor-pointer select-none">
              By continuing, I agree to the{' '}
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

  // Step 2: Verification of OTP
  if (step === 'otp') {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => setStep('mobile')}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-850 text-[11px] font-bold transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Mobile
        </button>
        <div className="space-y-1.5 text-center">
          <h2 className="text-slate-800 font-extrabold text-lg font-display">Verify Identity</h2>
          <p className="text-[11px] text-slate-500 leading-normal px-2">We sent a verification code to <strong className="text-slate-700 font-bold">+{mobileNumber}</strong></p>
        </div>
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-start gap-2 text-[11px] font-medium leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {otpCodeToShow && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-start gap-2.5 text-[11px] leading-relaxed">
              <Info className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <span className="font-bold">Mock OTP Code:</span> <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-800">{otpCodeToShow}</code> (use this to test)
              </div>
            </div>
          )}
          <div className="relative !w-full mt-4">
            <span className="absolute -top-2 left-4 bg-white px-1.5 text-[11px] text-slate-400 font-bold z-10 flex items-center">
              OTP Code <span className="text-rose-500 ml-0.5">*</span>
            </span>
            <div className="relative">
              <Lock className="absolute left-3.5 top-4.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                pattern="[0-9]{6}"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                placeholder="000000"
                className="w-full pl-10 pr-3 py-4 rounded-xl border border-slate-200 bg-white text-slate-855 font-mono font-bold text-lg tracking-[0.4em] text-center focus:!border-brand-500 focus:!outline-none transition-all shadow-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold tracking-wider hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4 text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand-500/10"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'VERIFY OTP'
            )}
          </button>
        </form>
      </div>
    );
  }

  // Step 2.5: Admin Pending Approval Screen
  if (step === 'pending_approval') {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto w-12 h-12 bg-amber-50 border border-amber-100 text-amber-500 rounded-full flex items-center justify-center shadow-sm">
          <Info className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-slate-800 font-extrabold text-lg font-display">Account Review Required</h2>
          <p className="text-[11px] text-slate-500 px-4 leading-relaxed font-medium">
            {pendingStatusMsg || 'Your profile has been created and is awaiting approval by our administration team. Once approved, you will gain full access to wholesale B2B pricing.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setStep('mobile');
            setCode('');
            setError(null);
          }}
          className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2 mt-4 shadow-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Step 3: Selection of Buyer Type (GST vs Non-GST)
  if (step === 'buyer_type') {
    return (
      <div className="space-y-5">
        <div className="space-y-1.5 text-center">
          <h2 className="text-slate-800 font-extrabold text-lg font-display">Register Business Account</h2>
          <p className="text-[11px] text-slate-500 leading-relaxed px-4">Choose your business registration category to set up wholesale purchasing.</p>
        </div>
        <div className="space-y-3 pt-1">
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setBuyerType('GST');
                setStep('gst_form');
                setError(null);
              }}
              className="p-4 rounded-2xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/10 text-left transition-all duration-200 flex items-start gap-4 group shadow-sm bg-white hover:shadow"
            >
              <div className="p-3 bg-brand-50 border border-brand-100 text-brand-600 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                <Building2 className="w-5 h-5 animate-float" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  GST Registered Business
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-bold">Auto-Fill</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">Fastest verification. Auto-fills billing and firm details using your GSTIN lookup.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setBuyerType('NON_GST');
                setStep('nongst_form');
                setError(null);
              }}
              className="p-4 rounded-2xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/10 text-left transition-all duration-200 flex items-start gap-4 group shadow-sm bg-white hover:shadow"
            >
              <div className="p-3 bg-slate-50 border border-slate-100 text-slate-500 group-hover:text-brand-600 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                <User2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-800 text-xs">Non-GST Business / Proprietor</div>
                <p className="text-[10px] text-slate-400 leading-normal">Requires manual entry. Verification may take longer without standard tax credentials.</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 4a: GST Form
  if (step === 'gst_form') {
    return (
      <div className="space-y-5 text-xs">
        <button
          type="button"
          onClick={() => setStep('buyer_type')}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-[11px] font-bold transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back
        </button>
        <div className="space-y-1 text-center">
          <h2 className="text-slate-800 font-extrabold text-lg font-display">GSTIN Registration</h2>
          <p className="text-[11px] text-slate-500 leading-normal">Enter your business tax credentials to fetch details.</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-3.5">
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
                className="flex-1 px-3.5 h-11 rounded-xl border border-slate-200 bg-white text-slate-900 uppercase font-mono tracking-wider text-xs focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all shadow-sm"
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
                  className="w-full px-3.5 h-11 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all shadow-sm"
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
                    className="w-full px-3.5 h-11 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all shadow-sm"
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
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all shadow-sm min-h-[60px] resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    placeholder="City"
                    className="w-full px-3.5 h-11 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    placeholder="State"
                    className="w-full px-3.5 h-11 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    required
                    placeholder="Pincode"
                    className="w-full px-3 h-11 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono text-center text-xs focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4 text-xs disabled:opacity-50 animate-float"
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

  // Step 4b: Non-GST Form
  if (step === 'nongst_form') {
    return (
      <div className="space-y-5 text-xs">
        <button
          type="button"
          onClick={() => setStep('buyer_type')}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-[11px] font-bold transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back
        </button>
        <div className="space-y-1 text-center">
          <h2 className="text-slate-800 font-extrabold text-lg font-display">Business Details</h2>
          <p className="text-[11px] text-slate-500 leading-normal">Enter details manually for verification.</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-3.5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-start gap-2 text-[11px] font-medium leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Business / Firm Name</label>
            <input
              type="text"
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
              required
              placeholder="Firm legal or trade name"
              className="w-full px-3.5 h-11 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all shadow-sm font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Owner / Full Name</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
                placeholder="Owner's Name"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Country</label>
              <CountrySelect
                onChange={(val) => {
                  setCountryId(val.id);
                }}
                defaultValue={{ id: 101, name: 'India' }}
                placeHolder="Select Country"
                inputClassName="!w-full !p-3.5 !h-11 !rounded-xl !border-slate-200 !bg-white text-slate-900 text-xs focus:!border-brand-500 focus:!ring-4 focus:!ring-brand-500/10 focus:!outline-none !shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
                placeholder="Pincode"
                className="w-full px-3 h-11 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono text-center text-xs focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">State</label>
              <StateSelect
                countryid={countryId}
                onChange={(val) => {
                  setStateId(val.id);
                  setState(val.name);
                }}
                placeHolder="Select State"
                inputClassName="!w-full !p-3.5 !h-11 !rounded-xl !border-slate-200 !bg-white text-slate-900 text-xs focus:!border-brand-500 focus:!ring-4 focus:!ring-brand-500/10 focus:!outline-none !shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">City</label>
              <CitySelect
                countryid={countryId}
                stateid={stateId}
                onChange={(val) => {
                  setCity(val.name);
                }}
                placeHolder="Select City"
                inputClassName="!w-full !p-3.5 !h-11 !rounded-xl !border-slate-200 !bg-white text-slate-900 text-xs focus:!border-brand-500 focus:!ring-4 focus:!ring-brand-500/10 focus:!outline-none !shadow-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4 text-xs disabled:opacity-50"
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

  // Step 5: Onboarding Completed / Success
  if (step === 'success') {
    return (
      <div className="space-y-5 text-center animate-fadeIn">
        <div className="mx-auto w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-500 rounded-full flex items-center justify-center shadow-sm animate-bounce">
          <CheckCircle className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-slate-800 font-extrabold text-lg font-display">Registration Submitted</h2>
          <p className="text-[11px] text-slate-500 px-4 leading-relaxed font-medium">
            Thank you for registering with TradeLogix. Your details have been submitted. Our admin team will verify and approve your account shortly.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setStep('mobile');
            setCode('');
            setMobileNumber('');
            setGstin('');
            setFirmName('');
            setOwnerName('');
            setAddress('');
            setCity('');
            setState('');
            setPincode('');
            setBusinessConstitution('');
            setEmail('');
            setGstVerified(false);
            setError(null);
          }}
          className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 hover:scale-[1.01]"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return null;
}

