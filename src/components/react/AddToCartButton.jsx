import React, { useState } from 'react';
import { addToCart } from '../../store/cartStore.js';
import { ShoppingCart, Check, Plus, Minus } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { userStore } from '../../store/authStore.js';

export default function AddToCartButton({ product, showVariantSelector = false, compact = false, showPriceBox = false }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || 'Default');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const user = useStore(userStore);
  const isLoggedIn = user?.isLoggedIn;

  const handleAdd = () => {
    addToCart(product, quantity, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!isLoggedIn) {
    if (compact) return null;

    return (
      <div className="space-y-4">
        {showPriceBox && (
          <div className="p-5 rounded-2xl border border-dashed border-slate-350 bg-slate-50 text-center space-y-2 mb-2">
            <h4 className="text-sm font-bold text-slate-800">Pricing Locked</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed max-w-sm mx-auto">
              Please sign in with your verified customer account to unlock bulk wholesale prices, volume quantity discounts, and inventory dispatch.
            </p>
          </div>
        )}
        <a
          href="/login"
          className="w-full py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-display font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.01]"
        >
          Sign In to View
        </a>
      </div>
    );
  }

  if (compact) {
    return (
      <button
        onClick={handleAdd}
        className="p-2.5 rounded-xl gradient-brand text-white hover:opacity-90 transition-all shadow-sm flex items-center justify-center"
        title="Add to Cart"
      >
        {added ? <Check className="w-4 h-4 text-emerald-200" /> : <ShoppingCart className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {showPriceBox && (
        <div className="glass-panel p-4 rounded-2xl flex items-baseline gap-3 border border-slate-200 bg-slate-50 mb-4">
          <span className="font-display font-extrabold text-3xl text-slate-900">₹{product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-base text-slate-400 line-through">₹{product.originalPrice.toFixed(2)}</span>
          )}
          {product.originalPrice && (
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              Save ₹{(product.originalPrice - product.price).toFixed(2)}
            </span>
          )}
        </div>
      )}
      {showVariantSelector && product.variants && product.variants.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Select Variant: <span className="text-slate-900 font-bold">{selectedVariant}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setSelectedVariant(v)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${selectedVariant === v
                    ? 'bg-brand-50 border-brand-300 text-brand-700 font-semibold shadow-sm'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Quantity selector */}
        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center text-sm font-bold text-slate-900">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleAdd}
          className={`flex-1 py-3 px-6 rounded-xl font-display font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md ${added
              ? 'bg-emerald-600 text-white'
              : 'gradient-brand text-white hover:opacity-90 hover:scale-[1.01]'
            }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" /> Added to Cart!
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" /> Add to Cart - ₹{(product.price * quantity).toFixed(2)}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
