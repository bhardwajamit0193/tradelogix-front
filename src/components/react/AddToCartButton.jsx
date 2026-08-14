import React, { useState } from 'react';
import { addToCart } from '../../store/cartStore.js';
import { ShoppingCart, Check, Plus, Minus } from 'lucide-react';

export default function AddToCartButton({ product, showVariantSelector = false, compact = false }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || 'Default');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, quantity, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

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
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  selectedVariant === v
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
          className={`flex-1 py-3 px-6 rounded-xl font-display font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md ${
            added
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
