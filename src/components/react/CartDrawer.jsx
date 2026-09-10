import React from 'react';
import { useStore } from '@nanostores/react';
import {
  cartItems,
  isCartOpen,
  toggleCart,
  updateQuantity,
  removeFromCart,
  cartSubtotal,
  getAvailableStock,
} from '../../store/cartStore.js';
import { X, ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

export default function CartDrawer() {
  const isOpen = useStore(isCartOpen);
  const items = useStore(cartItems);
  const subtotal = useStore(cartSubtotal);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={() => toggleCart(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h2 className="font-display font-bold text-xl text-slate-900">Your Shopping Cart</h2>
            </div>
            <button
              onClick={() => toggleCart(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-base">Your cart is empty</h3>
                  <p className="text-slate-500 text-xs mt-1">Explore our product catalog to add tech gear.</p>
                </div>
                <a
                  href="/shop"
                  onClick={() => toggleCart(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white font-semibold text-xs shadow-md hover:opacity-90 transition-all"
                >
                  Browse Storefront
                </a>
              </div>
            ) : (
              items.map((item) => {
                const maxStock = getAvailableStock(item);
                const isMaxReached = item.quantity >= maxStock;

                return (
                  <div
                    key={`${item.id}-${item.variant}`}
                    className="glass-panel p-3.5 rounded-2xl flex items-center gap-3 border border-slate-200 bg-slate-50/80 hover:border-slate-300 transition-all"
                  >
                    <img
                      src={item.image || item.featuredImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';
                      }}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">{item.name}</h4>
                      <p className="text-[11px] text-slate-500">Variant: {item.variant}</p>
                      <p className="text-xs font-bold text-brand-600 mt-1">
                        ₹{typeof item.price === 'number' ? item.price.toLocaleString('en-IN') : item.price} <span className="text-[10px] text-slate-400 font-normal">/ unit</span>
                      </p>
                      {maxStock < 9999 && isMaxReached && (
                        <p className="text-[10px] text-amber-600 font-bold mt-0.5 flex items-center gap-1">
                          Max stock ({maxStock}) in cart
                        </p>
                      )}
                      {maxStock < 9999 && !isMaxReached && maxStock <= 5 && (
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                          Only {maxStock} left in stock
                        </p>
                      )}
                    </div>

                    {/* Quantity Modifiers */}
                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shrink-0">
                      <button
                        onClick={() => updateQuantity(item.id, item.variant, item.quantity - 1)}
                        className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.variant, item.quantity + 1)}
                        disabled={isMaxReached}
                        className={`p-1 rounded-lg transition-colors ${
                          isMaxReached
                            ? 'text-slate-300 bg-slate-50 cursor-not-allowed'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                        title={isMaxReached ? `Only ${maxStock} available in stock` : 'Increase quantity'}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id, item.variant)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-200 bg-white space-y-4">
              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-800 font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                  <span>Total</span>
                  <span className="text-brand-600 font-display text-base">₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="pt-2">
                <a
                  href="/checkout"
                  onClick={() => toggleCart(false)}
                  className="w-full py-3.5 text-center rounded-xl gradient-brand text-white text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
