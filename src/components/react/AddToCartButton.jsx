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
        className="p-2.5 rounded-xl gradient-brand text-white hover:opacity-90 transition-all shadow-glow-primary flex items-center justify-center"
        title="Add to Cart"
      >
        {added ? <Check className="w-4 h-4 text-emerald-300" /> : <ShoppingCart className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {showVariantSelector && product.variants && product.variants.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Select Variant: <span className="text-white">{selectedVariant}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setSelectedVariant(v)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  selectedVariant === v
                    ? 'bg-brand-500/20 border-brand-500 text-white shadow-glow-primary'
                    : 'bg-gray-900 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
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
        <div className="flex items-center bg-gray-900 border border-white/10 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center text-sm font-bold text-white">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleAdd}
          className={`flex-1 py-3 px-6 rounded-xl font-display font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-glow-primary ${
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
