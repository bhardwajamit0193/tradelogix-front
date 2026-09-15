import React from 'react';
import AddToCartButton from './AddToCartButton.jsx';
import { formatPrice } from '../../utils/formatters.js';
import { useStore } from '@nanostores/react';
import { userStore } from '../../store/authStore.js';
import Image from './common/Image.jsx';

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

export const ProductCardSkeleton = () => {
  return (
    <div className="glass-panel rounded-3xl p-4 flex flex-col justify-between border border-slate-200/80 bg-white/90 shadow-sm animate-pulse">
      <div>
        {/* Skeleton Image */}
        <div className="w-full h-52 rounded-2xl bg-slate-200/70 mb-4" />
        
        {/* Skeleton Category */}
        <div className="flex items-center justify-between mb-2">
          <div className="h-3 w-20 bg-slate-200 rounded" />
        </div>

        {/* Skeleton Title */}
        <div className="space-y-2 mb-4">
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="h-4 w-3/4 bg-slate-200 rounded" />
        </div>
      </div>

      {/* Skeleton Price & Button */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
        <div className="h-6 w-24 bg-slate-200 rounded" />
        <div className="h-9 w-24 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
};

class CardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.warn('ProductCard failed to render:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

function ProductCardInner({ product }) {
  if (!product || typeof product !== 'object') {
    return null;
  }

  const defaultFallbackImage = '/placeholder-product.svg';
  const user = useStore(userStore);
  const isLoggedIn = user?.isLoggedIn;

  const displayImage = product.featuredImage || product.image || (Array.isArray(product.images) && product.images[0]) || defaultFallbackImage;

  const resolveCategory = (cat) => {
    if (!cat) return '';
    if (typeof cat === 'string') return cat;
    if (typeof cat === 'object') {
      return typeof cat.name === 'string' ? cat.name : (typeof cat.title === 'string' ? cat.title : (typeof cat.slug === 'string' ? cat.slug : ''));
    }
    return '';
  };

  const rawCategory = (Array.isArray(product.categories) && product.categories.length > 0)
    ? resolveCategory(product.categories[0])
    : (typeof product.category === 'string' ? product.category.split(',')[0].trim() : resolveCategory(product.category));
  const displayCategory = rawCategory || 'Hardware';

  const displayName = typeof product.name === 'string'
    ? product.name
    : (typeof product.title === 'string' ? product.title : (typeof product.name?.name === 'string' ? product.name.name : 'Hardware Unit'));

  const displaySlug = product.slug || product.id || '';
  const displayBadge = typeof product.badge === 'string' ? product.badge : (typeof product.badge?.name === 'string' ? product.badge.name : null);
  const numPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
  const numOriginalPrice = typeof product.originalPrice === 'number'
    ? product.originalPrice
    : (product.originalPrice ? parseFloat(product.originalPrice) : null);
  const discountPercent = numOriginalPrice && numOriginalPrice > numPrice
    ? Math.round(((numOriginalPrice - numPrice) / numOriginalPrice) * 100)
    : 0;

  const loginRedirect = typeof window !== 'undefined'
    ? (window.location.pathname + window.location.search)
    : (displaySlug ? `/shop/${displaySlug}` : '/login');

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col justify-between group border border-slate-200/80 bg-white/90 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
      <div>
        {/* Product Image Container with High-Contrast Badge & Discount Badge */}
        <a
          href={`/shop/${displaySlug}`}
          className="block relative overflow-hidden rounded-xl sm:rounded-2xl mb-2.5 sm:mb-4 bg-slate-50 group"
        >
          {displayBadge && (
            <span
              className={`absolute top-2 left-2 sm:top-3 sm:left-3 z-10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] uppercase tracking-wider border ${getBadgeStyle(
                displayBadge
              )}`}
            >
              {displayBadge}
            </span>
          )}
          {discountPercent > 0 && (
            <span
              className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-sm border border-rose-500"
            >
              {discountPercent}% OFF
            </span>
          )}
          <Image
            src={displayImage}
            alt={displayName}
            fallback={defaultFallbackImage}
            className="w-full h-36 sm:h-52 object-contain sm:object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </a>

        {/* Product Category */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-semibold text-brand-600 uppercase tracking-wider text-[9px] sm:text-[10px] truncate max-w-[150px]">
            {displayCategory}
          </span>
        </div>

        {/* Product Title */}
        <a href={`/shop/${displaySlug}`} className="block group-hover:text-brand-600 transition-colors">
          <h3 className="font-display font-semibold text-xs sm:text-base text-slate-900 line-clamp-2 sm:line-clamp-1 mb-1.5 sm:mb-2 leading-snug">
            {displayName}
          </h3>
        </a>
      </div>

      {/* Product Price & Add to Cart Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 pt-2.5 sm:pt-4 border-t border-slate-100 mt-2 w-full">
        {isLoggedIn ? (
          <>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-lg font-extrabold font-display text-slate-900">{formatPrice(product.price ?? 0)}</span>
              {product.originalPrice != null && product.originalPrice !== product.price && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <AddToCartButton
              product={{
                ...product,
                name: displayName,
                slug: displaySlug,
                image: displayImage,
                category: displayCategory,
                pricing: product.pricing || null,
                tiers: product.tiers || product.pricing?.tiers || [],
                basePrice: product.basePrice !== undefined ? product.basePrice : (product.pricing?.basePrice ? parseFloat(product.pricing.basePrice) : product.price),
              }}
              compact={true}
            />
          </>
        ) : (
          <a
            href={`/login?redirect=${encodeURIComponent(loginRedirect)}`}
            className="w-full text-center py-2 px-2.5 rounded-xl border border-brand-200 text-brand-600 bg-brand-50 hover:bg-brand-100 font-semibold text-[11px] sm:text-xs transition-colors truncate"
          >
            Sign In to View Price
          </a>
        )}
      </div>
    </div>
  );
}

export default function ProductCard(props) {
  return (
    <CardErrorBoundary>
      <ProductCardInner {...props} />
    </CardErrorBoundary>
  );
}
