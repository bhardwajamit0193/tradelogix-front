import React from 'react';
import { Star } from 'lucide-react';
import AddToCartButton from './AddToCartButton.jsx';
import { formatPrice } from '../../utils/formatters.js';

export const getBadgeStyle = (badge) => {
  switch (badge) {
    case 'Best Seller':
      return 'bg-amber-500 text-white border-amber-400 font-bold shadow-sm';
    case 'Pro Choice':
      return 'bg-brand-600 text-white border-brand-500 font-bold shadow-sm';
    case 'Hot Item':
      return 'bg-rose-500 text-white border-rose-400 font-bold shadow-sm';
    case 'New Arrival':
      return 'bg-emerald-600 text-white border-emerald-500 font-bold shadow-sm';
    default:
      return 'bg-amber-100 text-amber-900 border-amber-300 font-bold shadow-sm';
  }
};

export default function ProductCard({ product }) {
  const defaultFallbackImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="glass-panel glass-panel-hover rounded-3xl p-4 flex flex-col justify-between group border border-slate-200/80 bg-white/90 shadow-sm hover:shadow-xl hover:shadow-slate-200/50">
      <div>
        {/* Product Image Container with High-Contrast Badge */}
        <a
          href={`/shop/${product.slug}`}
          className="block relative overflow-hidden rounded-2xl mb-4 bg-slate-100 group"
        >
          {product.badge && (
            <span
              className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider border ${getBadgeStyle(
                product.badge
              )}`}
            >
              {product.badge}
            </span>
          )}
          <img
            src={product.image || defaultFallbackImage}
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultFallbackImage;
            }}
            className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </a>

        {/* Product Category & Rating */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span className="font-semibold text-brand-600 uppercase tracking-wider text-[10px]">
            {product.category}
          </span>
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-500" />
            <span>{product.rating}</span>
            <span className="text-slate-400 text-[10px]">({product.reviewCount})</span>
          </div>
        </div>

        {/* Product Title */}
        <a href={`/shop/${product.slug}`} className="block group-hover:text-brand-600 transition-colors">
          <h3 className="font-display font-semibold text-base text-slate-900 line-clamp-1 mb-2">
            {product.name}
          </h3>
        </a>
      </div>

      {/* Product Price & Add to Cart Action */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
        <div>
          <span className="text-lg font-extrabold font-display text-slate-900">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-slate-400 line-through ml-2">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        <AddToCartButton product={product} compact={true} />
      </div>
    </div>
  );
}
