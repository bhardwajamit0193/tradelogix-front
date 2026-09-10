import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { cartItems, cartSubtotal, clearCart } from '../../store/cartStore.js';
import { userStore } from '../../store/authStore.js';
import { createOrder } from '../../services/orderService.js';
import { saveAddress, fetchCustomerAddressesApi } from '../../services/addressService.js';
import { getPaymentSettings, fetchPaymentSettingsApi } from '../../services/paymentSettingsService.js';
import { validateCouponApi, fetchAvailableCouponsApi } from '../../services/couponService.js';
import { formatPrice } from '../../utils/formatters.js';
import PhoneInputField from './PhoneInputField.jsx';
import { lookupPincode, INDIAN_STATES } from '../../services/pincodeService.js';
import {
  Truck,
  CreditCard,
  CheckCircle2,
  Building2,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  ShoppingBag,
  Tag,
  Lock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';

export default function CheckoutStepper() {
  const items = useStore(cartItems);
  const rawSubtotal = useStore(cartSubtotal);
  const user = useStore(userStore);

  // Mobile Order Summary Accordion State
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);
  const [couponSuccess, setCouponSuccess] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [isCouponsLoading, setIsCouponsLoading] = useState(false);
  const [showAvailableOffers, setShowAvailableOffers] = useState(true);

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
        setErrors(prev => ({
          ...prev,
          shipping_pincode: undefined,
          shipping_city: undefined,
          shipping_state: undefined
        }));
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
        setErrors(prev => ({
          ...prev,
          billing_pincode: undefined,
          billing_city: undefined,
          billing_state: undefined
        }));
      } else {
        setBillingPincodeMsg({ success: false, text: res?.message || 'PIN code not found' });
      }
    } else {
      setBillingPincodeMsg(null);
    }
  };

  // Payment Gateway Settings
  const [paymentSettings, setPaymentSettings] = useState(getPaymentSettings());
  const [isPartialCodAllowed, setIsPartialCodAllowed] = useState(true);

  // Client Hydration
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Stepper state: 1 = Shipping, 2 = Billing & Remarks, 3 = Payment, 4 = Success
  const [step, setStep] = useState(1);
  const [copiedField, setCopiedField] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [errors, setErrors] = useState({});

  // Shipping Address Form State
  const [shippingForm, setShippingForm] = useState({
    name: user?.name || '',
    phone: user?.mobileNumber || user?.phone || '',
    email: user?.email || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  // Billing Address Form State (Default: isBillingSame is true)
  const [isBillingSame, setIsBillingSame] = useState(true);
  const [billingForm, setBillingForm] = useState({
    name: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  // Synchronize billing form with shipping form when isBillingSame is true
  useEffect(() => {
    if (isBillingSame) {
      setBillingForm({
        name: shippingForm.name || '',
        phone: shippingForm.phone || '',
        email: shippingForm.email || '',
        addressLine1: shippingForm.addressLine1 || '',
        addressLine2: shippingForm.addressLine2 || '',
        city: shippingForm.city || '',
        state: shippingForm.state || '',
        pincode: shippingForm.pincode || '',
        country: 'India',
      });
    }
  }, [isBillingSame, shippingForm]);

  // Order Remarks State
  const [orderRemarks, setOrderRemarks] = useState('');

  // Payment Options State: 'Razorpay' | 'OfflineTransfer' | 'COD' | 'PartialCOD'
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [utrNumber, setUtrNumber] = useState('');

  // Calculations (18% GST standard B2B)
  const subtotal = rawSubtotal || 0;
  const discountAmount = appliedCoupon ? (appliedCoupon.discountAmount || 0) : 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const taxRate = 0.18;
  const taxAmount = discountedSubtotal * taxRate;
  const grandTotal = discountedSubtotal + taxAmount;

  // Fetch available coupons for current customer or guest
  useEffect(() => {
    let isMounted = true;
    const loadAvailableCoupons = async () => {
      setIsCouponsLoading(true);
      try {
        const activeEmail = user?.email || shippingForm.email;
        const activeId = user?.id;
        const list = await fetchAvailableCouponsApi(activeEmail, activeId);
        if (isMounted && Array.isArray(list)) {
          setAvailableCoupons(list);
        }
      } catch (err) {
        console.warn('Failed to load available coupons:', err);
      } finally {
        if (isMounted) setIsCouponsLoading(false);
      }
    };
    loadAvailableCoupons();
    return () => {
      isMounted = false;
    };
  }, [user?.email, user?.id, shippingForm.email]);

  const handleApplyCoupon = async (codeOrEvent) => {
    let codeToApply = couponInput.trim();
    if (typeof codeOrEvent === 'string') {
      codeToApply = codeOrEvent.trim();
      setCouponInput(codeToApply);
    } else if (codeOrEvent && codeOrEvent.preventDefault) {
      codeOrEvent.preventDefault();
    }
    if (!codeToApply) return;
    setCouponLoading(true);
    setCouponError(null);
    setCouponSuccess(null);
    try {
      const res = await validateCouponApi({
        code: codeToApply,
        subtotal: rawSubtotal || 0,
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity || 1,
          price: i.price,
          compareAtPrice: i.originalPrice || i.compareAtPrice,
          categoryId: i.category,
          isSale: Boolean(i.originalPrice && i.originalPrice > i.price),
        })),
        customerId: user?.id,
        customerEmail: user?.email || shippingForm.email,
      });
      setAppliedCoupon(res);
      setCouponSuccess(res.message || `Coupon "${res.code}" applied!`);
      setCouponInput('');
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess(null);
    setCouponError(null);
  };

  // Listen to payment settings updates
  useEffect(() => {
    const syncSettings = (current) => {
      const live = current || getPaymentSettings();
      setPaymentSettings(live);
      
      if (paymentMethod === 'Razorpay' && !live.razorpayEnabled) {
        if (live.offlineTransferEnabled) setPaymentMethod('OfflineTransfer');
        else if (live.codEnabled) setPaymentMethod('COD');
        else if (live.partialCodEnabled) setPaymentMethod('PartialCOD');
      } else if (paymentMethod === 'OfflineTransfer' && !live.offlineTransferEnabled) {
        if (live.razorpayEnabled) setPaymentMethod('Razorpay');
        else if (live.codEnabled) setPaymentMethod('COD');
        else if (live.partialCodEnabled) setPaymentMethod('PartialCOD');
      } else if (paymentMethod === 'COD' && !live.codEnabled) {
        if (live.razorpayEnabled) setPaymentMethod('Razorpay');
        else if (live.offlineTransferEnabled) setPaymentMethod('OfflineTransfer');
        else if (live.partialCodEnabled) setPaymentMethod('PartialCOD');
      } else if (paymentMethod === 'PartialCOD' && !live.partialCodEnabled) {
        if (live.razorpayEnabled) setPaymentMethod('Razorpay');
        else if (live.offlineTransferEnabled) setPaymentMethod('OfflineTransfer');
        else if (live.codEnabled) setPaymentMethod('COD');
      }
    };

    syncSettings();
    fetchPaymentSettingsApi().then((data) => {
      if (data) syncSettings(data);
    });

    const handleCustomEvent = (e) => syncSettings(e.detail);
    window.addEventListener('tradelogix_payment_settings_updated', handleCustomEvent);
    return () => window.removeEventListener('tradelogix_payment_settings_updated', handleCustomEvent);
  }, [paymentMethod]);

  // Auto-fill default addresses if available
  useEffect(() => {
    fetchCustomerAddressesApi(user?.accessToken).then((list) => {
      if (list && Array.isArray(list) && list.length > 0) {
        const shippingAddr = list.find((a) => (a.type || '').toLowerCase() === 'shipping') || list[0];
        const billingAddr = list.find((a) => (a.type || '').toLowerCase() === 'billing');

        if (shippingAddr) {
          setShippingForm((prev) => ({
            name: shippingAddr.name || prev.name || user?.name || '',
            phone: shippingAddr.phone || prev.phone || user?.mobile || '',
            email: shippingAddr.email || prev.email || user?.email || '',
            addressLine1: shippingAddr.addressLine1 || prev.addressLine1 || '',
            addressLine2: shippingAddr.addressLine2 || prev.addressLine2 || '',
            city: shippingAddr.city || prev.city || '',
            state: shippingAddr.state || prev.state || '',
            pincode: shippingAddr.pincode || prev.pincode || '',
            country: shippingAddr.country || 'India',
          }));
        }

        if (billingAddr) {
          setBillingForm((prev) => ({
            name: billingAddr.name || prev.name || '',
            phone: billingAddr.phone || prev.phone || '',
            email: billingAddr.email || prev.email || '',
            addressLine1: billingAddr.addressLine1 || prev.addressLine1 || '',
            addressLine2: billingAddr.addressLine2 || prev.addressLine2 || '',
            city: billingAddr.city || prev.city || '',
            state: billingAddr.state || prev.state || '',
            pincode: billingAddr.pincode || prev.pincode || '',
            country: billingAddr.country || 'India',
          }));
        }
      } else if (user) {
        setShippingForm((prev) => ({
          name: prev.name || user.name || user.firmName || '',
          phone: prev.phone || user.mobile || user.mobileNumber || '',
          email: prev.email || user.email || '',
          addressLine1: prev.addressLine1 || user.address || '',
          addressLine2: prev.addressLine2 || '',
          city: prev.city || user.city || '',
          state: prev.state || user.state || '',
          pincode: prev.pincode || user.pincode || '',
          country: 'India',
        }));
      }
    });
  }, [user]);

  const partialPercentage = paymentSettings.partialCodPercentage || 10;
  const partialOnlineAmount = parseFloat((grandTotal * (partialPercentage / 100)).toFixed(2));
  const partialCodAmount = parseFloat((grandTotal - partialOnlineAmount).toFixed(2));
  const maxCodLimit = paymentSettings.codMaxLimit || 50000;

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Validations
  const validateShipping = () => {
    const errs = {};
    if (!shippingForm.name.trim()) errs.shipping_name = 'Full name is required';
    if (!shippingForm.phone.trim() || shippingForm.phone.trim().length < 10) {
      errs.shipping_phone = 'Valid 10-digit phone number is required';
    }
    if (!shippingForm.email.trim() || !shippingForm.email.includes('@')) {
      errs.shipping_email = 'Valid email address is required';
    }
    if (!shippingForm.addressLine1.trim()) errs.shipping_address1 = 'Street address is required';
    if (!shippingForm.city.trim()) errs.shipping_city = 'City is required';
    if (!shippingForm.state.trim()) errs.shipping_state = 'State is required';
    if (!shippingForm.pincode.trim() || shippingForm.pincode.trim().length < 6) {
      errs.shipping_pincode = '6-digit pincode is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateBilling = () => {
    const errs = {};
    if (!isBillingSame) {
      if (!billingForm.name.trim()) errs.billing_name = 'Company / Invoicing name is required';
      if (!billingForm.phone.trim() || billingForm.phone.trim().length < 10) {
        errs.billing_phone = 'Valid 10-digit phone number is required';
      }
      if (!billingForm.email.trim() || !billingForm.email.includes('@')) {
        errs.billing_email = 'Valid billing email is required';
      }
      if (!billingForm.addressLine1.trim()) errs.billing_address1 = 'Address Line 1 is required';
      if (!billingForm.city.trim()) errs.billing_city = 'City is required';
      if (!billingForm.state.trim()) errs.billing_state = 'State is required';
      if (!billingForm.pincode.trim() || billingForm.pincode.trim().length < 6) {
        errs.billing_pincode = '6-digit pincode is required';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePayment = () => {
    const errs = {};
    // Offline Transfer UTR is completely optional
    if (paymentMethod === 'COD' && grandTotal > maxCodLimit) {
      errs.cod_limit = `Cash on Delivery is unavailable for orders above ₹${maxCodLimit.toLocaleString('en-IN')}.`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Razorpay Integration
  const triggerRazorpayCheckout = (amountInInr, isPartial = false, onComplete) => {
    setIsProcessingPayment(true);
    const scriptId = 'razorpay-checkout-script';
    let script = document.getElementById(scriptId);
    const keyId = paymentSettings.razorpayKeyId || 'rzp_test_tradelogixDemoKey';

    const launchModal = () => {
      if (window.Razorpay) {
        const options = {
          key: keyId,
          amount: Math.round(amountInInr * 100),
          currency: 'INR',
          name: 'TradeLogix',
          description: isPartial ? `Deposit payment (₹${amountInInr.toFixed(2)})` : `Order payment (₹${amountInInr.toFixed(2)})`,
          handler: function (response) {
            setIsProcessingPayment(false);
            onComplete({
              razorpayPaymentId: response.razorpay_payment_id || `pay_${Math.random().toString(36).substring(2, 12)}`,
              razorpayOrderId: response.razorpay_order_id || `order_${Math.random().toString(36).substring(2, 12)}`,
              razorpaySignature: response.razorpay_signature || 'mock_sig_' + Math.random().toString(36).substring(2, 8),
            });
          },
          prefill: {
            name: shippingForm.name,
            email: shippingForm.email,
            contact: shippingForm.phone,
          },
          theme: { color: '#4f46e5' },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false);
            },
          },
        };

        try {
          const rzp = new window.Razorpay(options);
          rzp.open();
        } catch (e) {
          fallbackSimulateModal(amountInInr, isPartial, onComplete);
        }
      } else {
        fallbackSimulateModal(amountInInr, isPartial, onComplete);
      }
    };

    const fallbackSimulateModal = (amount, isPartial, cb) => {
      setTimeout(() => {
        setIsProcessingPayment(false);
        cb({
          razorpayPaymentId: `pay_rzp_${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
          razorpayOrderId: `order_rzp_${Math.random().toString(36).substring(2, 10)}`,
          razorpaySignature: `sig_live_${Math.random().toString(36).substring(2, 14)}`,
        });
      }, 1000);
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => launchModal();
      script.onerror = () => fallbackSimulateModal(amountInInr, isPartial, onComplete);
      document.body.appendChild(script);
    } else {
      launchModal();
    }
  };

  // Final Order Placement
  const handleFinalOrderPlacement = async (e) => {
    e.preventDefault();
    if (!validatePayment()) return;

    saveAddress({
      type: 'Shipping',
      title: `${shippingForm.city || 'Primary'} Address`,
      name: shippingForm.name,
      phone: shippingForm.phone,
      email: shippingForm.email,
      addressLine1: shippingForm.addressLine1,
      addressLine2: shippingForm.addressLine2,
      city: shippingForm.city,
      state: shippingForm.state,
      pincode: shippingForm.pincode,
      country: shippingForm.country || 'India',
      isDefault: true,
    }, user?.accessToken);

    if (!isBillingSame && billingForm.addressLine1) {
      saveAddress({
        type: 'Billing',
        title: `${billingForm.city || 'Billing'} Entity`,
        name: billingForm.name,
        phone: billingForm.phone,
        email: billingForm.email,
        addressLine1: billingForm.addressLine1,
        addressLine2: billingForm.addressLine2,
        city: billingForm.city,
        state: billingForm.state,
        pincode: billingForm.pincode,
        country: billingForm.country || 'India',
        isDefault: false,
      }, user?.accessToken);
    }

    const effectiveItems = items.length > 0 ? items : [
      { id: 'demo-1', name: 'Standard Wholesale Item', sku: 'WHL-001', quantity: 1, price: subtotal || 5000 },
    ];

    if (paymentMethod === 'Razorpay') {
      triggerRazorpayCheckout(grandTotal, false, async (rzpData) => {
        setIsProcessingPayment(true);
        const order = await createOrder({
          customerName: shippingForm.name,
          customerEmail: shippingForm.email,
          customerMobile: shippingForm.phone,
          shippingAddress: shippingForm,
          billingAddress: isBillingSame ? shippingForm : billingForm,
          isBillingSameAsShipping: isBillingSame,
          orderRemarks: orderRemarks,
          paymentMethod: 'Razorpay',
          paymentStatus: 'Paid',
          razorpayOrderId: rzpData.razorpayOrderId,
          razorpayPaymentId: rzpData.razorpayPaymentId,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          discountAmount: discountAmount,
          items: effectiveItems,
          subtotal: subtotal,
          taxAmount: taxAmount,
          total: grandTotal,
          token: user?.accessToken,
        });
        setIsProcessingPayment(false);
        setCreatedOrder(order);
        clearCart();
        setStep(4);
      });
    } else if (paymentMethod === 'PartialCOD') {
      triggerRazorpayCheckout(partialOnlineAmount, true, async (rzpData) => {
        setIsProcessingPayment(true);
        const order = await createOrder({
          customerName: shippingForm.name,
          customerEmail: shippingForm.email,
          customerMobile: shippingForm.phone,
          shippingAddress: shippingForm,
          billingAddress: isBillingSame ? shippingForm : billingForm,
          isBillingSameAsShipping: isBillingSame,
          orderRemarks: orderRemarks,
          paymentMethod: 'PartialCOD',
          paymentStatus: 'Partial COD Confirmed',
          partialOnlineAmount: partialOnlineAmount,
          partialCodAmount: partialCodAmount,
          razorpayOrderId: rzpData.razorpayOrderId,
          razorpayPaymentId: rzpData.razorpayPaymentId,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          discountAmount: discountAmount,
          items: effectiveItems,
          subtotal: subtotal,
          taxAmount: taxAmount,
          total: grandTotal,
          token: user?.accessToken,
        });
        setIsProcessingPayment(false);
        setCreatedOrder(order);
        clearCart();
        setStep(4);
      });
    } else if (paymentMethod === 'OfflineTransfer') {
      setIsProcessingPayment(true);
      const order = await createOrder({
        customerName: shippingForm.name,
        customerEmail: shippingForm.email,
        customerMobile: shippingForm.phone,
        shippingAddress: shippingForm,
        billingAddress: isBillingSame ? shippingForm : billingForm,
        isBillingSameAsShipping: isBillingSame,
        orderRemarks: orderRemarks,
        paymentMethod: 'OfflineTransfer',
        paymentStatus: 'Pending NEFT Verification',
        offlineUtrNumber: utrNumber.trim() ? utrNumber.trim().toUpperCase() : null,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        discountAmount: discountAmount,
        items: effectiveItems,
        subtotal: subtotal,
        taxAmount: taxAmount,
        total: grandTotal,
        token: user?.accessToken,
      });
      setIsProcessingPayment(false);
      setCreatedOrder(order);
      clearCart();
      setStep(4);
    } else if (paymentMethod === 'COD') {
      setIsProcessingPayment(true);
      const order = await createOrder({
        customerName: shippingForm.name,
        customerEmail: shippingForm.email,
        customerMobile: shippingForm.phone,
        shippingAddress: shippingForm,
        billingAddress: isBillingSame ? shippingForm : billingForm,
        isBillingSameAsShipping: isBillingSame,
        orderRemarks: orderRemarks,
        paymentMethod: 'COD',
        paymentStatus: 'COD Confirmed',
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        discountAmount: discountAmount,
        items: effectiveItems,
        subtotal: subtotal,
        taxAmount: taxAmount,
        total: grandTotal,
        token: user?.accessToken,
      });
      setIsProcessingPayment(false);
      setCreatedOrder(order);
      clearCart();
      setStep(4);
    }
  };

  const renderAvailableOffers = () => {
    if (!availableCoupons || availableCoupons.length === 0) return null;

    return (
      <div className="pt-2 border-t border-slate-100/90 space-y-2">
        <button
          type="button"
          onClick={() => setShowAvailableOffers((prev) => !prev)}
          className="w-full flex items-center justify-between text-left group cursor-pointer py-1"
        >
          <div className="flex items-center gap-1.5">
            <span className="p-1 rounded-md bg-brand-50 text-brand-700 group-hover:bg-brand-100 transition-colors">
              <Tag className="w-3 h-3 text-brand-600" />
            </span>
            <span className="font-bold text-slate-800 text-[11px] group-hover:text-brand-700 transition-colors">
              Available Offers
            </span>
            <span className="px-1.5 py-0.2 bg-brand-50 text-brand-700 font-mono font-semibold text-[10px] rounded-full border border-brand-200/80">
              {availableCoupons.length}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-brand-600 flex items-center gap-0.5">
            {showAvailableOffers ? 'Hide' : 'View'}
            {showAvailableOffers ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </span>
        </button>

        {showAvailableOffers && (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5 pt-0.5">
            {availableCoupons.map((c) => {
              const isApplied = appliedCoupon && appliedCoupon.code?.toUpperCase() === c.code?.toUpperCase();
              const qualifies = !c.minimumSpend || subtotal >= c.minimumSpend;
              const discountText = c.discountType === 'percent'
                ? `${c.amount}% OFF`
                : `₹${c.amount} OFF`;

              return (
                <div
                  key={c.id || c.code}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isApplied
                      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400'
                      : 'bg-slate-50/80 hover:bg-slate-50 border-slate-200/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-1.5 py-0.5 bg-white border border-dashed border-brand-300 text-brand-700 font-mono font-bold text-[11px] rounded tracking-wide shadow-2xs">
                          {c.code}
                        </span>
                        <span className="text-[11px] font-bold text-slate-900">
                          {discountText}
                        </span>
                      </div>
                      {c.description && (
                        <p className="text-[10.5px] text-slate-600 leading-tight line-clamp-1">
                          {c.description}
                        </p>
                      )}
                      {c.minimumSpend && (
                        <p className="text-[10px]">
                          {qualifies ? (
                            <span className="text-slate-500">Min spend: {formatPrice(c.minimumSpend)}</span>
                          ) : (
                            <span className="text-amber-600 font-medium">
                              Add {formatPrice(c.minimumSpend - subtotal)} more to qualify
                            </span>
                          )}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 pt-0.5">
                      {isApplied ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold shadow-2xs">
                          <Check className="w-3 h-3 stroke-[3]" /> Applied
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon(c.code)}
                          disabled={couponLoading || !qualifies}
                          className="px-2.5 py-1 gradient-brand hover:opacity-95 disabled:opacity-40 text-white rounded-lg text-[10px] font-display font-bold transition-all shadow-2xs cursor-pointer disabled:cursor-not-allowed"
                        >
                          {couponLoading && couponInput === c.code ? '...' : 'Apply'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (!isHydrated) {
    return <div className="h-96 rounded-2xl bg-slate-100 animate-pulse" />;
  }

  if (items.length === 0 && step !== 4 && !createdOrder) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-500">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 font-display">Your Cart is Empty</h2>
          <p className="text-slate-500 text-xs">Add products to your cart to proceed with checkout.</p>
        </div>
        <a
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl gradient-brand text-white font-display font-bold text-xs shadow-md hover:scale-[1.02] transition-all"
        >
          Explore Shop <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ================= COMPACT SLEEK HEADER & STEPPER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div>
          <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-1">
            <a href="/" className="hover:text-slate-700 transition-colors">Home</a>
            <span>/</span>
            <a href="/shop" className="hover:text-slate-700 transition-colors">Shop</a>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Checkout</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Checkout
          </h1>
        </div>

        {/* Minimalist Linear Stepper Bar */}
        {step < 4 && (
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-slate-100/90 px-3 py-1.5 rounded-full border border-slate-200/80 self-start sm:self-auto overflow-x-auto max-w-full">
            {/* Step 1: Shipping */}
            <button
              type="button"
              onClick={() => step > 1 && setStep(1)}
              className={`flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap px-1.5 py-0.5 rounded-full transition-colors ${
                step === 1 ? 'text-brand-700 font-bold' : step > 1 ? 'text-emerald-700 hover:text-emerald-800' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step > 1 ? 'bg-emerald-600 text-white' : step === 1 ? 'gradient-brand text-white shadow-xs' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step > 1 ? <Check className="w-3 h-3 stroke-[3]" /> : '1'}
              </span>
              <span>Shipping</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

            {/* Step 2: Billing */}
            <button
              type="button"
              onClick={() => {
                if (validateShipping()) setStep(2);
              }}
              className={`flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap px-1.5 py-0.5 rounded-full transition-colors ${
                step === 2 ? 'text-brand-700 font-bold' : step > 2 ? 'text-emerald-700 hover:text-emerald-800' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step > 2 ? 'bg-emerald-600 text-white' : step === 2 ? 'gradient-brand text-white shadow-xs' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step > 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
              </span>
              <span>Billing</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

            {/* Step 3: Payment */}
            <button
              type="button"
              onClick={() => {
                if (validateShipping() && validateBilling()) setStep(3);
              }}
              className={`flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap px-1.5 py-0.5 rounded-full transition-colors ${
                step === 3 ? 'text-brand-700 font-bold' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === 3 ? 'gradient-brand text-white shadow-xs' : 'bg-slate-200 text-slate-500'
                }`}
              >
                3
              </span>
              <span>Payment</span>
            </button>
          </div>
        )}
      </div>

      {/* ================= MOBILE ORDER SUMMARY ACCORDION BANNER ================= */}
      {step < 4 && (
        <div className="lg:hidden bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <button
            type="button"
            onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
            className="w-full p-4 flex items-center justify-between text-xs font-semibold text-slate-800 bg-slate-50/70 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand-600" />
              <span>{isMobileSummaryOpen ? 'Hide order summary' : 'Show order summary'}</span>
              <span className="text-[11px] text-slate-400 font-normal">({items.length} items)</span>
              {isMobileSummaryOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </div>
            <span className="font-bold text-slate-900 font-mono text-sm">{formatPrice(grandTotal)}</span>
          </button>

          {isMobileSummaryOpen && (
            <div className="p-4 space-y-4 border-t border-slate-100 text-xs animate-fadeIn">
              {/* Items List */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-400">Qty: {item.quantity || 1} × {formatPrice(item.price)}</p>
                    </div>
                    <span className="font-bold text-slate-900 font-mono shrink-0">
                      {formatPrice((item.quantity || 1) * item.price)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                {!appliedCoupon ? (
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Promo Code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg uppercase placeholder:normal-case font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-4 py-2 gradient-brand hover:opacity-95 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shrink-0"
                      >
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-[11px] text-red-500 font-medium">{couponError}</p>}
                  </div>
                ) : (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-900 font-mono">{appliedCoupon.code}</span>
                      <p className="text-[10px] text-emerald-700">Saved {formatPrice(discountAmount)}</p>
                    </div>
                    <button type="button" onClick={handleRemoveCoupon} className="text-xs text-red-600 font-semibold">Remove</button>
                  </div>
                )}
                {renderAvailableOffers()}
              </div>

              {/* Breakdown */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-900">{formatPrice(subtotal)}</span>
                </div>
                {appliedCoupon && discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-mono">- {formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST 18%</span>
                  <span className="font-mono text-slate-900">{formatPrice(taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-bold uppercase text-[11px]">Free</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= STEP 4: ORDER CONFIRMATION ================= */}
      {step === 4 && createdOrder ? (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
          <div className="p-8 sm:p-10 text-center space-y-4 border-b border-slate-100 bg-slate-50/50">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">Order Confirmed!</h2>
              <p className="text-slate-500 text-xs sm:text-sm">
                Thank you for your order. We have received your order details and started processing.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800">
              <span>Order ID: {createdOrder.id}</span>
              <button
                type="button"
                onClick={() => handleCopy(createdOrder.id, 'order_id')}
                className="text-slate-400 hover:text-slate-700 p-0.5"
                title="Copy ID"
              >
                {copiedField === 'order_id' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6 text-xs">
            {/* Address Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Shipping Destination</span>
                <p className="font-bold text-slate-900">{createdOrder.shippingAddress?.name}</p>
                <p className="text-slate-600">{createdOrder.shippingAddress?.addressLine1}</p>
                <p className="text-slate-600">{createdOrder.shippingAddress?.city}, {createdOrder.shippingAddress?.state} - {createdOrder.shippingAddress?.pincode}</p>
                <p className="text-slate-500 pt-1">Phone: {createdOrder.shippingAddress?.phone}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Billing Entity</span>
                <p className="font-bold text-slate-900">{createdOrder.billingAddress?.name}</p>
                <p className="text-slate-600">{createdOrder.billingAddress?.addressLine1}</p>
                <p className="text-slate-600">{createdOrder.billingAddress?.city}, {createdOrder.billingAddress?.state} - {createdOrder.billingAddress?.pincode}</p>
                <p className="text-slate-500 pt-1">Email: {createdOrder.billingAddress?.email}</p>
              </div>
            </div>

            {/* Itemized Total */}
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              <div className="p-4 bg-slate-50 font-bold text-slate-800 flex justify-between">
                <span>Summary</span>
                <span>{formatPrice(createdOrder.total)}</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatPrice(createdOrder.subtotal)}</span>
                </div>
                {createdOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({createdOrder.couponCode || 'Coupon'})</span>
                    <span>- {formatPrice(createdOrder.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>GST 18%</span>
                  <span className="font-semibold text-slate-900">{formatPrice(createdOrder.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600 uppercase">FREE</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <a href="/shop" className="px-5 py-2.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold transition-colors">
                Continue Shopping
              </a>
              <a href="/orders" className="px-6 py-3 rounded-xl gradient-brand text-white font-display font-bold text-xs shadow-md hover:scale-[1.02] transition-all">
                View All Orders
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* ================= MAIN 2-COLUMN CHECKOUT LAYOUT ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Form Wizard Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">

            {/* ----------------- STEP 1: SHIPPING ----------------- */}
            {step === 1 && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-display">Shipping Details</h2>
                  <p className="text-xs text-slate-500">Enter where you'd like your order delivered.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Full Name */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      value={shippingForm.name}
                      onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                      placeholder="e.g. Aarav Sharma"
                      className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all ${
                        errors.shipping_name ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                      }`}
                    />
                    {errors.shipping_name && <p className="text-red-500 text-[11px]">{errors.shipping_name}</p>}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Phone Number *</label>
                    <PhoneInputField
                      country={'in'}
                      value={shippingForm.phone}
                      onChange={(phone) => setShippingForm({ ...shippingForm, phone })}
                      inputClass="!w-full !h-10 !text-xs !bg-white !rounded-xl !border-slate-300"
                      buttonClass="!bg-white !border-slate-300 !rounded-l-xl"
                      containerClass="!w-full"
                    />
                    {errors.shipping_phone && <p className="text-red-500 text-[11px]">{errors.shipping_phone}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      value={shippingForm.email}
                      onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                      placeholder="aarav.sharma@example.com"
                      className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all ${
                        errors.shipping_email ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                      }`}
                    />
                    {errors.shipping_email && <p className="text-red-500 text-[11px]">{errors.shipping_email}</p>}
                  </div>

                  {/* Address Line 1 */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-700">Address Line 1 *</label>
                    <input
                      type="text"
                      value={shippingForm.addressLine1}
                      onChange={(e) => setShippingForm({ ...shippingForm, addressLine1: e.target.value })}
                      placeholder="Flat, building, street, or plot number"
                      className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all ${
                        errors.shipping_address1 ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                      }`}
                    />
                    {errors.shipping_address1 && <p className="text-red-500 text-[11px]">{errors.shipping_address1}</p>}
                  </div>

                  {/* Address Line 2 */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-700">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      value={shippingForm.addressLine2}
                      onChange={(e) => setShippingForm({ ...shippingForm, addressLine2: e.target.value })}
                      placeholder="Landmark, suite, or area"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    />
                  </div>

                  {/* Postal PIN Code with Autofill */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-700">Postal PIN Code *</label>
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
                      placeholder="e.g. 560100"
                      maxLength={6}
                      className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all font-mono font-bold tracking-wider ${
                        errors.shipping_pincode ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                      }`}
                    />
                    {errors.shipping_pincode && <p className="text-red-500 text-[11px]">{errors.shipping_pincode}</p>}
                  </div>

                  {/* City / District (Autofilled from PIN Code, disabled) */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 flex items-center justify-between">
                      <span>City / District *</span>
                      <span className="text-[10px] text-slate-400 font-normal">Auto-filled from PIN</span>
                    </label>
                    <input
                      type="text"
                      value={shippingForm.city}
                      readOnly
                      disabled
                      placeholder="Auto-filled from PIN code"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 cursor-not-allowed outline-none font-medium text-sm"
                    />
                    {errors.shipping_city && <p className="text-red-500 text-[11px]">{errors.shipping_city}</p>}
                  </div>

                  {/* State (Autofilled from PIN Code, disabled) */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 flex items-center justify-between">
                      <span>State *</span>
                      <span className="text-[10px] text-slate-400 font-normal">Auto-filled from PIN</span>
                    </label>
                    <input
                      type="text"
                      value={shippingForm.state}
                      readOnly
                      disabled
                      placeholder="Auto-filled from PIN code"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 cursor-not-allowed outline-none font-medium text-sm"
                    />
                    {errors.shipping_state && <p className="text-red-500 text-[11px]">{errors.shipping_state}</p>}
                  </div>

                  {/* Country (India Only) */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Country</label>
                    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium text-sm select-none">
                      <span className="text-lg">🇮🇳</span>
                      <span>India</span>
                      <span className="ml-auto text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        Pan-India Delivery
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (validateShipping()) setStep(2);
                    }}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl gradient-brand text-white font-display font-bold text-xs shadow-md hover:scale-[1.01] hover:opacity-95 transition-all flex items-center justify-center gap-2"
                  >
                    Continue to Billing <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ----------------- STEP 2: BILLING & REMARKS ----------------- */}
            {step === 2 && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-display">Billing Address & Notes</h2>
                  <p className="text-xs text-slate-500">Configure your invoicing entity and any special order remarks.</p>
                </div>

                {/* Same as Shipping Address Selection (YES / NO Buttons) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/80">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-800 text-xs sm:text-sm">Same as shipping address?</span>
                    <p className="text-[11px] text-slate-500">
                      {isBillingSame
                        ? 'Yes — Billing details match shipping address (fields below are locked).'
                        : 'No — Specify a different billing entity or registered address below.'}
                    </p>
                  </div>

                  {/* YES / NO Button Group */}
                  <div className="inline-flex rounded-xl bg-slate-200/80 p-1 border border-slate-300/60 shrink-0 gap-1 select-none">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isBillingSame) {
                          setIsBillingSame(true);
                          setBillingForm({
                            name: shippingForm.name || '',
                            phone: shippingForm.phone || '',
                            email: shippingForm.email || '',
                            addressLine1: shippingForm.addressLine1 || '',
                            addressLine2: shippingForm.addressLine2 || '',
                            city: shippingForm.city || '',
                            state: shippingForm.state || '',
                            pincode: shippingForm.pincode || '',
                            country: 'India',
                          });
                          setErrors((prev) => {
                            const next = { ...prev };
                            Object.keys(next).forEach((k) => {
                              if (k.startsWith('billing_')) delete next[k];
                            });
                            return next;
                          });
                        }
                      }}
                      className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center min-w-[60px] ${
                        isBillingSame
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (isBillingSame) {
                          setIsBillingSame(false);
                        }
                      }}
                      className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center min-w-[60px] ${
                        !isBillingSame
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* Billing Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-700 text-xs">Customer / Company Name *</label>
                    <input
                      type="text"
                      disabled={isBillingSame}
                      readOnly={isBillingSame}
                      value={billingForm.name}
                      onChange={(e) => setBillingForm({ ...billingForm, name: e.target.value })}
                      placeholder="e.g. Apex Logistics Solutions Pvt Ltd"
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium text-xs sm:text-sm transition-all ${
                        isBillingSame
                          ? 'bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed select-none'
                          : 'bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500'
                      }`}
                    />
                    {errors.billing_name && <p className="text-red-500 text-[11px]">{errors.billing_name}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 text-xs">Billing Phone *</label>
                    <PhoneInputField
                      country={'in'}
                      disabled={isBillingSame}
                      value={billingForm.phone}
                      onChange={(phone) => setBillingForm({ ...billingForm, phone })}
                      inputClass={`!w-full !h-10 !text-xs !rounded-xl transition-all ${
                        isBillingSame
                          ? '!bg-slate-100/90 !text-slate-500 !border-slate-200 !cursor-not-allowed'
                          : '!bg-white !text-slate-900 !border-slate-300'
                      }`}
                      buttonClass={`!rounded-l-xl ${isBillingSame ? '!bg-slate-100/90 !border-slate-200' : '!bg-white !border-slate-300'}`}
                      containerClass="!w-full"
                    />
                    {errors.billing_phone && <p className="text-red-500 text-[11px]">{errors.billing_phone}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 text-xs">Billing Email *</label>
                    <input
                      type="email"
                      disabled={isBillingSame}
                      readOnly={isBillingSame}
                      value={billingForm.email}
                      onChange={(e) => setBillingForm({ ...billingForm, email: e.target.value })}
                      placeholder="billing@apexlogistics.in"
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium text-xs sm:text-sm transition-all ${
                        isBillingSame
                          ? 'bg-slate-100/90 text-slate-500 border-slate-200 cursor-not-allowed select-none'
                          : 'bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500'
                      }`}
                    />
                    {errors.billing_email && <p className="text-red-500 text-[11px]">{errors.billing_email}</p>}
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-700 text-xs">Address Line 1 *</label>
                    <input
                      type="text"
                      disabled={isBillingSame}
                      readOnly={isBillingSame}
                      value={billingForm.addressLine1}
                      onChange={(e) => setBillingForm({ ...billingForm, addressLine1: e.target.value })}
                      placeholder="Registered corporate address"
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium text-xs sm:text-sm transition-all ${
                        isBillingSame
                          ? 'bg-slate-100/90 text-slate-500 border-slate-200 cursor-not-allowed select-none'
                          : 'bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500'
                      }`}
                    />
                    {errors.billing_address1 && <p className="text-red-500 text-[11px]">{errors.billing_address1}</p>}
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-700 text-xs">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      disabled={isBillingSame}
                      readOnly={isBillingSame}
                      value={billingForm.addressLine2}
                      onChange={(e) => setBillingForm({ ...billingForm, addressLine2: e.target.value })}
                      placeholder="Area, landmark (Optional)"
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium text-xs sm:text-sm transition-all ${
                        isBillingSame
                          ? 'bg-slate-100/90 text-slate-500 border-slate-200 cursor-not-allowed select-none'
                          : 'bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500'
                      }`}
                    />
                  </div>

                  {/* Postal PIN Code */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-700 text-xs">Postal PIN Code *</label>
                      {!isBillingSame && billingPincodeLoading && (
                        <span className="text-[11px] text-brand-600 flex items-center gap-1 font-medium">
                          <span className="w-3 h-3 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></span>
                          Fetching...
                        </span>
                      )}
                      {!isBillingSame && billingPincodeMsg && (
                        <span className={`text-[11px] font-medium ${billingPincodeMsg.success ? 'text-emerald-600 font-semibold' : 'text-amber-600'}`}>
                          {billingPincodeMsg.success ? `✓ ${billingPincodeMsg.text}` : billingPincodeMsg.text}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      disabled={isBillingSame}
                      readOnly={isBillingSame}
                      value={billingForm.pincode}
                      onChange={(e) => handleBillingPincodeChange(e.target.value)}
                      placeholder="e.g. 560038"
                      maxLength={6}
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none transition-all font-mono font-bold tracking-wider text-xs sm:text-sm ${
                        isBillingSame
                          ? 'bg-slate-100/90 text-slate-500 border-slate-200 cursor-not-allowed select-none'
                          : errors.billing_pincode 
                            ? 'border-red-400 bg-red-50/20 text-slate-900' 
                            : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500'
                      }`}
                    />
                    {errors.billing_pincode && <p className="text-red-500 text-[11px]">{errors.billing_pincode}</p>}
                  </div>

                  {/* City / District * */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 text-xs flex items-center justify-between">
                      <span>City / District *</span>
                      <span className="text-[10px] text-slate-400 font-normal">Auto-filled</span>
                    </label>
                    <input
                      type="text"
                      value={billingForm.city}
                      readOnly
                      disabled
                      placeholder="Auto-filled from PIN"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100/90 text-slate-500 cursor-not-allowed outline-none font-medium text-xs sm:text-sm"
                    />
                    {errors.billing_city && <p className="text-red-500 text-[11px]">{errors.billing_city}</p>}
                  </div>

                  {/* State * */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 text-xs flex items-center justify-between">
                      <span>State *</span>
                      <span className="text-[10px] text-slate-400 font-normal">Auto-filled</span>
                    </label>
                    <input
                      type="text"
                      value={billingForm.state}
                      readOnly
                      disabled
                      placeholder="Auto-filled from PIN"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100/90 text-slate-500 cursor-not-allowed outline-none font-medium text-xs sm:text-sm"
                    />
                    {errors.billing_state && <p className="text-red-500 text-[11px]">{errors.billing_state}</p>}
                  </div>

                  {/* Country (India Only) */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 text-xs">Country</label>
                    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm select-none">
                      <span className="text-lg">🇮🇳</span>
                      <span>India</span>
                      <span className="ml-auto text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        Pan-India Delivery
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Remarks */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700">Order Notes / Warehouse Remarks (Optional)</label>
                    <span className="text-[11px] text-slate-400">{orderRemarks.length}/500</span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={orderRemarks}
                    onChange={(e) => setOrderRemarks(e.target.value)}
                    placeholder="Gate entry instructions, warehouse dock number, or packing preferences..."
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Form Action Buttons with proper spacing and alignment */}
                <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Shipping
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (validateBilling()) setStep(3);
                    }}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl gradient-brand text-white font-display font-bold text-xs shadow-md hover:scale-[1.01] hover:opacity-95 transition-all flex items-center justify-center gap-2"
                  >
                    Continue to Payment <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ----------------- STEP 3: PAYMENT ENGINE ----------------- */}
            {step === 3 && (
              <form onSubmit={handleFinalOrderPlacement} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-display">Payment Method</h2>
                  <p className="text-xs text-slate-500">Select how you want to pay for your order.</p>
                </div>

                <div className="space-y-3">
                  {/* Option A: Razorpay */}
                  {paymentSettings.razorpayEnabled && (
                    <label
                      className={`block p-4 rounded-xl border transition-all cursor-pointer ${
                        paymentMethod === 'Razorpay'
                          ? 'border-brand-600 bg-brand-50/20 ring-1 ring-brand-600 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="payment_method"
                          value="Razorpay"
                          checked={paymentMethod === 'Razorpay'}
                          onChange={() => setPaymentMethod('Razorpay')}
                          className="mt-0.5 text-brand-600 focus:ring-brand-500"
                        />
                        <div className="flex-1 text-xs space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">Online Payment (UPI, Cards, NetBanking)</span>
                            <span className="font-semibold text-brand-600 font-mono">{formatPrice(grandTotal)}</span>
                          </div>
                          <p className="text-slate-500 text-[11px]">Instant clearance via Razorpay gateway.</p>
                        </div>
                      </div>
                    </label>
                  )}

                  {/* Option B: Offline Bank Transfer */}
                  {paymentSettings.offlineTransferEnabled && (
                    <div
                      className={`rounded-xl border transition-all overflow-hidden ${
                        paymentMethod === 'OfflineTransfer'
                          ? 'border-amber-600 bg-amber-50/10 ring-1 ring-amber-600 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <label className="block p-4 cursor-pointer">
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="payment_method"
                            value="OfflineTransfer"
                            checked={paymentMethod === 'OfflineTransfer'}
                            onChange={() => setPaymentMethod('OfflineTransfer')}
                            className="mt-0.5 text-amber-600 focus:ring-amber-500"
                          />
                          <div className="flex-1 text-xs space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">Bank Transfer (NEFT / RTGS / IMPS)</span>
                              <span className="font-semibold text-slate-900 font-mono">{formatPrice(grandTotal)}</span>
                            </div>
                            <p className="text-slate-500 text-[11px]">Direct transfer to official corporate account.</p>
                          </div>
                        </div>
                      </label>

                      {paymentMethod === 'OfflineTransfer' && (
                        <div className="p-4 border-t border-amber-200 bg-amber-50/40 space-y-3 text-xs animate-fadeIn">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-amber-200 text-[11px]">
                            <div>
                              <span className="text-slate-400">Beneficiary:</span>
                              <div className="font-bold text-slate-900">{paymentSettings.bankBeneficiaryName}</div>
                            </div>
                            <div>
                              <span className="text-slate-400">Account Type:</span>
                              <div className="font-bold text-slate-900">{paymentSettings.bankAccountType}</div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-slate-400">Account No:</span>
                                <div className="font-mono font-bold text-slate-900">{paymentSettings.bankAccountNumber}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy(paymentSettings.bankAccountNumber, 'acc')}
                                className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 text-[10px] font-semibold"
                              >
                                {copiedField === 'acc' ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-slate-400">IFSC Code:</span>
                                <div className="font-mono font-bold text-slate-900">{paymentSettings.bankIfscCode}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy(paymentSettings.bankIfscCode, 'ifsc')}
                                className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 text-[10px] font-semibold"
                              >
                                {copiedField === 'ifsc' ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between">
                              <label className="font-semibold text-slate-800 text-xs">
                                Bank UTR / Transaction Reference ID
                              </label>
                              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                                Optional
                              </span>
                            </div>
                            <input
                              type="text"
                              value={utrNumber}
                              onChange={(e) => setUtrNumber(e.target.value.toUpperCase())}
                              placeholder="e.g. UTR-HDFC-98213876 (optional)"
                              className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white text-slate-900 font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              You can provide your bank reference number now or add it later from your Order History after wiring the funds.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Option C: COD */}
                  {paymentSettings.codEnabled && (
                    <label
                      className={`block p-4 rounded-xl border transition-all ${
                        grandTotal > maxCodLimit
                          ? 'border-slate-200 bg-slate-100/60 opacity-60 cursor-not-allowed'
                          : paymentMethod === 'COD'
                          ? 'border-sky-600 bg-sky-50/20 ring-1 ring-sky-600 cursor-pointer shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="payment_method"
                          value="COD"
                          disabled={grandTotal > maxCodLimit}
                          checked={paymentMethod === 'COD'}
                          onChange={() => setPaymentMethod('COD')}
                          className="mt-0.5 text-sky-600 focus:ring-sky-500"
                        />
                        <div className="flex-1 text-xs space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">Cash on Delivery (COD)</span>
                            <span className="font-semibold text-slate-900 font-mono">{formatPrice(grandTotal)}</span>
                          </div>
                          <p className="text-slate-500 text-[11px]">Pay cash or UPI upon delivery.</p>
                          {grandTotal > maxCodLimit && (
                            <p className="text-red-500 text-[11px] font-semibold pt-1">
                              Max COD limit is ₹{maxCodLimit.toLocaleString('en-IN')}. Please choose another payment method.
                            </p>
                          )}
                        </div>
                      </div>
                    </label>
                  )}

                  {/* Option D: Partial COD */}
                  {paymentSettings.partialCodEnabled && isPartialCodAllowed && (
                    <div
                      className={`rounded-xl border transition-all overflow-hidden ${
                        paymentMethod === 'PartialCOD'
                          ? 'border-indigo-600 bg-indigo-50/20 ring-1 ring-indigo-600 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <label className="block p-4 cursor-pointer">
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="payment_method"
                            value="PartialCOD"
                            checked={paymentMethod === 'PartialCOD'}
                            onChange={() => setPaymentMethod('PartialCOD')}
                            className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="flex-1 text-xs space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">Partial COD ({partialPercentage}% Online + {100 - partialPercentage}% COD)</span>
                              <span className="font-semibold text-indigo-600 font-mono">Pay ₹{partialOnlineAmount.toFixed(2)} now</span>
                            </div>
                            <p className="text-slate-500 text-[11px]">
                              Pay {partialPercentage}% deposit online now, balance on delivery.
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Form Action Buttons with proper spacing */}
                <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Notes
                  </button>

                  <button
                    type="submit"
                    disabled={isProcessingPayment || (paymentMethod === 'COD' && grandTotal > maxCodLimit)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl gradient-brand text-white font-display font-bold text-xs shadow-md hover:scale-[1.01] hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : paymentMethod === 'Razorpay' ? (
                      <>Pay {formatPrice(grandTotal)} <ArrowRight className="w-4 h-4" /></>
                    ) : paymentMethod === 'PartialCOD' ? (
                      <>Pay Deposit (₹{partialOnlineAmount.toFixed(2)}) <ArrowRight className="w-4 h-4" /></>
                    ) : paymentMethod === 'OfflineTransfer' ? (
                      <>Submit Bank Transfer Order <ArrowRight className="w-4 h-4" /></>
                    ) : (
                      <>Confirm COD Order <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Desktop Summary Column (5 Cols) - Hidden on mobile, shown on lg+ */}
          <div className="hidden lg:block lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm font-display">Order Summary</h3>
                <span className="text-xs text-slate-500 font-medium">{items.length} items</span>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1 text-xs">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-400">Qty: {item.quantity || 1} × {formatPrice(item.price)}</p>
                    </div>
                    <span className="font-bold text-slate-900 font-mono shrink-0">
                      {formatPrice((item.quantity || 1) * item.price)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                {!appliedCoupon ? (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Promo Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg uppercase placeholder:normal-case focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-4 py-2 gradient-brand hover:opacity-95 disabled:opacity-50 text-white rounded-lg text-xs font-display font-bold transition-all shadow-xs shrink-0"
                      >
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-[11px] text-red-500 font-medium">{couponError}</p>}
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-emerald-900 font-mono">{appliedCoupon.code}</span>
                      <p className="text-[11px] text-emerald-700">Saved {formatPrice(discountAmount)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs text-red-600 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {renderAvailableOffers()}
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900 font-mono">{formatPrice(subtotal)}</span>
                </div>

                {appliedCoupon && discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon Discount</span>
                    <span className="font-mono">- {formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>GST 18%</span>
                  <span className="font-medium text-slate-900 font-mono">{formatPrice(taxAmount)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600 uppercase text-[11px]">Free</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-slate-900">
                  <span>Total</span>
                  <span className="text-base text-slate-900 font-bold font-mono">{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
