import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { cartItems, cartSubtotal, clearCart } from '../../store/cartStore.js';
import { createOrder } from '../../services/orderService.js';
import { CheckCircle2, ShieldCheck, CreditCard, Truck, ArrowRight, Lock, Sparkles } from 'lucide-react';

export default function CheckoutStepper() {
  const items = useStore(cartItems);
  const subtotal = useStore(cartSubtotal);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: 'Alex Mercer',
    email: 'alex.mercer@tradelogix.io',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    zip: '97477',
    country: 'United States',
    cardNumber: '4242 •••• •••• 4242',
    cardExp: '12/28',
    cardCvc: '888',
    paymentMethod: 'card',
  });

  const [createdOrder, setCreatedOrder] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      // Complete order processing
      const order = createOrder({
        customerName: formData.fullName,
        customerEmail: formData.email,
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.zip}`,
        items: items,
        total: subtotal,
      });

      setCreatedOrder(order);
      clearCart();
      setStep(3);
    }
  };

  if (items.length === 0 && step !== 3) {
    return (
      <div className="glass-panel p-12 rounded-3xl text-center space-y-4 max-w-md mx-auto bg-white border border-slate-200 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 border border-slate-200">
          <Truck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-xs text-slate-500">Add items to your cart before proceeding to checkout.</p>
        <a
          href="/shop"
          className="inline-block px-6 py-2.5 rounded-xl gradient-brand text-white text-xs font-semibold shadow-md hover:opacity-90"
        >
          Return to Storefront
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Step Indicators */}
      <div className="flex items-center justify-between relative px-4">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-10" />
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
          step >= 1 ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 border border-slate-200'
        }`}>
          <Truck className="w-4 h-4" /> Step 1: Shipping
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
          step >= 2 ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 border border-slate-200'
        }`}>
          <CreditCard className="w-4 h-4" /> Step 2: Payment
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
          step === 3 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 border border-slate-200'
        }`}>
          <CheckCircle2 className="w-4 h-4" /> Step 3: Confirmation
        </div>
      </div>

      {/* Main Container */}
      {step === 3 && createdOrder ? (
        /* Step 3: Success Confirmation */
        <div className="glass-panel p-8 sm:p-12 rounded-3xl text-center space-y-6 bg-white border border-emerald-200 shadow-lg">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200">
              Order Confirmed
            </span>
            <h2 className="font-display text-3xl font-extrabold text-slate-900">Thank You for Your Order!</h2>
            <p className="text-slate-500 text-xs">
              Order ID: <span className="text-brand-600 font-mono font-bold">{createdOrder.id}</span> • A receipt has been sent to <span className="text-slate-900 font-semibold">{createdOrder.customerEmail}</span>
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl max-w-md mx-auto text-left space-y-3 text-xs border border-slate-200 bg-slate-50">
            <div className="flex justify-between font-bold text-slate-900 pb-2 border-b border-slate-200">
              <span>Order Summary ({createdOrder.itemsCount} items)</span>
              <span className="text-brand-600 font-display text-base">₹{createdOrder.total.toFixed(2)}</span>
            </div>
            {createdOrder.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-slate-700">
                <span>{item.name} (x{item.qty})</span>
                <span>₹{(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-200 text-slate-500">
              <strong>Shipping to:</strong> {createdOrder.shippingAddress}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="/admin/orders"
              className="px-6 py-3 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all"
            >
              Track in Admin Panel
            </a>
            <a
              href="/shop"
              className="px-6 py-3 rounded-xl gradient-brand text-white text-xs font-semibold shadow-md hover:opacity-90 transition-all flex items-center gap-2"
            >
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      ) : (
        /* Steps 1 & 2 Form */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleNextStep} className="lg:col-span-2 space-y-6">
            {step === 1 ? (
              /* Step 1: Shipping Form */
              <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 border border-slate-200 bg-white shadow-sm">
                <h3 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-brand-600" /> Shipping & Delivery Address
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 glass-input bg-slate-50 border-slate-300 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 glass-input bg-slate-50 border-slate-300 text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-slate-700 font-medium">Street Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 glass-input bg-slate-50 border-slate-300 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 glass-input bg-slate-50 border-slate-300 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium">Postal Code</label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 glass-input bg-slate-50 border-slate-300 text-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl gradient-brand text-white font-semibold text-xs shadow-md hover:opacity-90 transition-all flex items-center gap-2"
                  >
                    Proceed to Payment <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: Payment Form */
              <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-brand-600" /> Payment Details
                  </h3>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <Lock className="w-3 h-3" /> 256-Bit SSL Encrypted
                  </span>
                </div>

                {/* Mock Card UI */}
                <div className="gradient-brand p-6 rounded-2xl text-white shadow-xl relative overflow-hidden space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-display font-extrabold text-lg tracking-wider">TradeLogix Pay</span>
                    <Sparkles className="w-5 h-5 opacity-80" />
                  </div>
                  <div className="text-lg font-mono tracking-widest pt-2">
                    {formData.cardNumber}
                  </div>
                  <div className="flex justify-between text-xs font-medium pt-2">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-indigo-100">Cardholder</div>
                      <div>{formData.fullName}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-indigo-100">Expires</div>
                      <div>{formData.cardExp}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-slate-700 font-medium">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 glass-input bg-slate-50 border-slate-300 text-slate-900 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium">Expiration Date</label>
                    <input
                      type="text"
                      name="cardExp"
                      value={formData.cardExp}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 glass-input bg-slate-50 border-slate-300 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium">Security CVC</label>
                    <input
                      type="text"
                      name="cardCvc"
                      value={formData.cardCvc}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 glass-input bg-slate-50 border-slate-300 text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 border border-slate-200"
                  >
                    Back to Shipping
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3.5 rounded-xl gradient-brand text-white font-semibold text-xs shadow-md hover:opacity-90 transition-all flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" /> Place Order - ₹{subtotal.toFixed(2)}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Right Sidebar: Order Summary */}
          <div className="glass-panel p-6 rounded-3xl h-fit space-y-4 border border-slate-200 bg-white shadow-sm">
            <h4 className="font-display text-base font-bold text-slate-900 border-b border-slate-200 pb-3">
              Order Summary
            </h4>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-slate-800">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs text-slate-500 pt-3 border-t border-slate-200">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-800 font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Express Shipping</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Due</span>
                <span className="text-brand-600 font-display">₹{subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
