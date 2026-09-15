import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { userStore } from '../../store/authStore.js';
import { addToCart, cartItems, cartItemCount, toggleCart, getAvailableStock } from '../../store/cartStore.js';
import ProductCard from './ProductCard.jsx';
import Image from './common/Image.jsx';
import { formatPrice } from '../../utils/formatters.js';
import {
  ShoppingCart, Check, Plus, Minus, ShieldCheck,
  Truck, ArrowRight, Package, Warehouse, Layers, Tag, RotateCcw, Sliders
} from 'lucide-react';

const API_URL = import.meta.env.PUBLIC_API_URL || (typeof window !== 'undefined' && window.__PUBLIC_API_URL__) || 'http://localhost:6543';

export default function ProductDetailView({ initialSlug, initialData = null }) {
  const user = useStore(userStore);
  const cart = useStore(cartItems);
  const totalCartCount = useStore(cartItemCount);
  const isLoggedIn = user?.isLoggedIn;

  const [product, setProduct] = useState(() => {
    if (initialData) {
      if (!initialData.specifications || initialData.specifications.length === 0) {
        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem('tradelogix_products_v4');
            if (raw) {
              const list = JSON.parse(raw);
              const found = list.find(p => p.slug === initialSlug || p.id === initialData.id);
              if (found && Array.isArray(found.specifications) && found.specifications.length > 0) {
                return { ...initialData, specifications: found.specifications };
              }
            }
          } catch (e) { }
        }
      }
      return initialData;
    }
    return null;
  });
  const [selectedImage, setSelectedImage] = useState(
    initialData?.featuredImage || initialData?.image || initialData?.images?.[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  // Fetch live product details from backend API (with auth token for customer B2B tier pricing)
  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      if (!initialSlug) return;
      // If complete initialData was provided via SSR and there is no user token for custom tier pricing, skip duplicate fetch
      if (initialData && !user?.accessToken) {
        setIsLoading(false);
        return;
      }
      // Only show full skeleton loader if we don't already have product data rendered
      if (!product && !initialData) {
        setIsLoading(true);
      }
      setError(null);
      try {
        const token = user?.accessToken;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch(`${API_URL}/api/shop/products/${initialSlug}`, { headers });
        if (!res.ok) {
          throw new Error(`Product not found (HTTP ${res.status})`);
        }
        const json = await res.json();
        const data = json?.data || json;

        let mergedData = { ...data };
        if (!mergedData.specifications || mergedData.specifications.length === 0) {
          try {
            const raw = localStorage.getItem('tradelogix_products_v4');
            if (raw) {
              const list = JSON.parse(raw);
              const found = list.find(p => p.slug === initialSlug || p.id === data.id);
              if (found && Array.isArray(found.specifications) && found.specifications.length > 0) {
                mergedData.specifications = found.specifications;
              }
            }
          } catch (e) { }
        }

        if (isMounted) {
          setProduct(mergedData);
          setSelectedImage(prev => prev || mergedData.featuredImage || mergedData.image || (mergedData.images && mergedData.images[0]) || null);
        }
      } catch (err) {
        if (isMounted && !product && !initialData) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadProduct();
    return () => { isMounted = false; };
  }, [initialSlug, user?.accessToken]);

  // Calculate available stock and units already in cart (must be before any early return)
  const maxStock = getAvailableStock(product);
  const cartItem = cart.find((i) => String(i.id) === String(product?.id));
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const availableToAdd = Math.max(0, maxStock - inCartQty);
  const isOutOfStock = maxStock <= 0 || !product?.inStock;
  const isMaxInCart = inCartQty >= maxStock && maxStock > 0;
  const canAddToCart = !isOutOfStock && !isMaxInCart && availableToAdd > 0;

  // Auto-clamp quantity to availableToAdd if exceeded (hook called unconditionally)
  useEffect(() => {
    if (availableToAdd > 0 && quantity > availableToAdd) {
      setQuantity(availableToAdd);
    } else if (availableToAdd <= 0 && quantity !== 1) {
      setQuantity(1);
    }
  }, [availableToAdd]);

  if (isLoading && !product) {
    return (
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 sm:py-6 lg:py-10 space-y-5 sm:space-y-8 animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="h-3.5 w-44 bg-slate-200 rounded-md" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8 lg:gap-12 items-start">
          {/* Gallery Skeleton */}
          <div className="space-y-3">
            <div className="w-full aspect-square sm:aspect-4/3 lg:aspect-auto sm:h-[380px] lg:h-[460px] bg-slate-200/80 rounded-2xl sm:rounded-3xl" />
            <div className="flex gap-2 sm:gap-3">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-slate-200 rounded-xl" />
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-slate-200 rounded-xl" />
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-slate-200 rounded-xl" />
            </div>
          </div>

          {/* Details Skeleton */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-5 w-20 bg-slate-200 rounded-full" />
              <div className="h-5 w-24 bg-slate-200 rounded-md" />
            </div>
            <div className="h-8 w-4/5 bg-slate-200 rounded-xl" />
            <div className="h-4 w-36 bg-slate-200 rounded" />

            {/* Price Box Placeholder */}
            <div className="h-28 w-full bg-slate-200/70 rounded-2xl" />

            {/* Action Buttons Placeholder */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-12 w-28 bg-slate-200/70 rounded-xl sm:rounded-2xl" />
              <div className="h-12 flex-1 bg-slate-200/90 rounded-xl sm:rounded-2xl" />
            </div>

            {/* Trust Badges Placeholder */}
            <div className="h-16 w-full bg-slate-200/60 rounded-2xl" />

            {/* Description Lines Placeholder */}
            <div className="space-y-2 pt-2">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-full bg-slate-200/70 rounded" />
              <div className="h-3 w-5/6 bg-slate-200/70 rounded" />
              <div className="h-3 w-2/3 bg-slate-200/70 rounded" />
            </div>

            {/* Technical Specifications Placeholder */}
            <div className="h-36 w-full bg-slate-200/60 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="max-w-3xl mx-auto my-20 p-10 text-center glass-panel rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
        <Package className="w-16 h-16 text-slate-300 mx-auto" />
        <h2 className="text-2xl font-bold font-display text-slate-900">Product Not Found</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          The hardware item you are looking for might have been moved or is currently unavailable in our catalog.
        </p>
        <div className="pt-4">
          <a
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-md"
          >
            Explore Hardware Catalog <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  const galleryImages = product.gallery && product.gallery.length > 0
    ? product.gallery
    : (product.images && product.images.length > 0 ? product.images : [selectedImage].filter(Boolean));

  const fallbackImage = '/placeholder-product.svg';
  const currentImage = selectedImage || fallbackImage;

  // Process and normalize custom technical specifications
  const rawSpecs = product?.specifications;
  let customSpecs = [];
  if (Array.isArray(rawSpecs)) {
    customSpecs = rawSpecs;
  } else if (typeof rawSpecs === 'object' && rawSpecs !== null) {
    customSpecs = Object.entries(rawSpecs).map(([key, value]) => ({ key, value: String(value) }));
  } else if (typeof rawSpecs === 'string') {
    try {
      const parsed = JSON.parse(rawSpecs);
      if (Array.isArray(parsed)) customSpecs = parsed;
      else if (typeof parsed === 'object' && parsed !== null) {
        customSpecs = Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) }));
      }
    } catch (e) { }
  }
  customSpecs = customSpecs.filter(
    (item) => item && (item.key?.toString().trim() || item.value?.toString().trim())
  );

  // Calculate live volume pricing based on quantity using customer's assigned tiers
  const customerTiers = product.pricing?.tiers || product.tiers || [];
  let currentUnitPrice = product.price || 0;
  if (customerTiers.length > 0) {
    const sortedTiers = [...customerTiers].sort((a, b) => Number(b.minQuantity) - Number(a.minQuantity));
    const matchedTier = sortedTiers.find((t) => Number(quantity) >= Number(t.minQuantity));
    if (matchedTier) {
      currentUnitPrice = parseFloat(matchedTier.price);
    }
  }

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    const addQty = Math.min(quantity, availableToAdd);
    if (addQty <= 0) return;

    addToCart({
      ...product,
      stockCount: maxStock,
      inStock: maxStock > 0,
      basePrice: product.pricing?.basePrice ? parseFloat(product.pricing.basePrice) : (product.basePrice ? parseFloat(product.basePrice) : product.price),
      tiers: customerTiers,
      pricing: product.pricing,
      price: product.price,
      image: currentImage,
      category: product.category,
    }, addQty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const resolveCategoryName = (cat) => {
    if (!cat) return '';
    if (typeof cat === 'string') return cat;
    if (typeof cat === 'object') {
      return typeof cat.name === 'string' ? cat.name : (typeof cat.title === 'string' ? cat.title : (typeof cat.slug === 'string' ? cat.slug : ''));
    }
    return '';
  };

  const primaryCategory = (Array.isArray(product?.categories) && product.categories.length > 0)
    ? (resolveCategoryName(product.categories[0]) || 'Hardware')
    : (typeof product?.category === 'string' ? product.category.split(',')[0].trim() : resolveCategoryName(product?.category)) || 'Hardware';

  const resolvedTags = React.useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.tagsList) && product.tagsList.length > 0) {
      return product.tagsList.map(t => (typeof t === 'object' && t ? (t.name || t.slug) : String(t))).filter(Boolean);
    }
    if (Array.isArray(product.tags) && product.tags.length > 0) {
      return product.tags.map(t => (typeof t === 'object' && t ? (t.name || t.slug) : String(t))).filter(Boolean);
    }
    if (typeof product.tags === 'string' && product.tags.trim()) {
      return product.tags.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  }, [product]);

  const relatedList = (Array.isArray(product?.relatedProducts) ? product.relatedProducts : [])
    .filter((rel) => rel && typeof rel === 'object' && (rel.name || rel.title || rel.slug || rel.id));

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 sm:py-6 lg:py-10 space-y-5 sm:space-y-8 lg:space-y-12 pb-24 lg:pb-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 overflow-x-auto whitespace-nowrap pb-0.5 scrollbar-none">
        <a href="/" className="hover:text-slate-900 transition-colors shrink-0">Home</a>
        <span className="text-slate-300 shrink-0">/</span>
        <a href="/shop" className="hover:text-slate-900 transition-colors shrink-0">Shop</a>
        <span className="text-slate-300 shrink-0">/</span>
        <a href={`/shop?category=${encodeURIComponent(primaryCategory)}`} className="hover:text-slate-900 transition-colors shrink-0">
          {primaryCategory}
        </a>
        <span className="text-slate-300 shrink-0">/</span>
        <span className="text-slate-900 font-semibold truncate max-w-[150px] sm:max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8 lg:gap-12 items-start">
        {/* Left Column: Gallery Showcase */}
        <div className="space-y-3 sm:space-y-4 lg:sticky lg:top-24">
          <div className="glass-panel p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200/80 overflow-hidden bg-white shadow-xs">
            <div className="relative w-full aspect-square sm:aspect-4/3 lg:aspect-auto sm:h-[380px] lg:h-[460px] flex items-center justify-center bg-slate-50/60 rounded-xl sm:rounded-2xl overflow-hidden">
              {/* Badges Overlay */}
              <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-brand-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-brand-200 shadow-xs">
                  {primaryCategory}
                </span>
              </div>
              <div className="absolute top-2.5 right-2.5 z-10">
                {isOutOfStock ? (
                  <span className="px-2.5 py-1 rounded-full bg-rose-50/95 backdrop-blur-xs text-rose-700 text-[10px] sm:text-xs font-bold border border-rose-200 shadow-xs">
                    Out of Stock
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50/95 backdrop-blur-xs text-emerald-700 text-[10px] sm:text-xs font-bold border border-emerald-200 shadow-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    In Stock
                  </span>
                )}
              </div>

              <Image
                src={currentImage}
                alt={product.name}
                fallback={fallbackImage}
                className="w-full h-full object-contain p-3 sm:p-6 transition-all duration-300"
              />
            </div>
          </div>

          {/* Thumbnails list */}
          {galleryImages.length > 1 && (
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-none">
              {galleryImages.map((imgUrl, idx) => {
                const isActive = (selectedImage === imgUrl);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden glass-panel border shrink-0 transition-all bg-white p-1 ${isActive ? 'border-brand-600 ring-2 ring-brand-500/20 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <Image
                      src={imgUrl}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      fallback={fallbackImage}
                      className="w-full h-full object-contain rounded-lg sm:rounded-xl"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Details & Primary Actions */}
        <div className="space-y-4 sm:space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {product.sku && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] sm:text-[11px] font-mono font-semibold">
                  SKU: {product.sku}
                </span>
              )}
              {resolvedTags.map((t, idx) => (
                <a
                  key={idx}
                  href={`/shop?tag=${encodeURIComponent(t)}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-50 hover:bg-brand-100 border border-brand-200/70 text-brand-700 text-[10px] sm:text-[11px] font-medium transition-colors"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {t}
                </a>
              ))}
            </div>

            <h1 className="font-display font-extrabold text-xl sm:text-2xl lg:text-3xl text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Stock Status Line */}
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
              {isOutOfStock ? (
                <span className="font-bold text-rose-600">Out of Stock</span>
              ) : maxStock <= 5 ? (
                <span className="font-bold text-amber-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Only {maxStock} left in stock!
                  {inCartQty > 0 && <span className="text-slate-500 font-normal">({inCartQty} in cart)</span>}
                </span>
              ) : (
                <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  In Stock ({maxStock} Units Available)
                  {inCartQty > 0 && <span className="text-slate-500 font-normal">({inCartQty} in cart)</span>}
                </span>
              )}
            </div>
          </div>

          {/* Pricing & Add to Cart Section (The Buy Box - Placed prominently) */}
          <div className="space-y-3 sm:space-y-4">
            {isLoggedIn ? (
              <>
                {/* Price Display Box */}
                <div className="glass-panel p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
                        {formatPrice(currentUnitPrice)}
                      </span>
                      <span className="text-[11px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider">/ pc</span>
                      {product.originalPrice && product.originalPrice > currentUnitPrice && (
                        <>
                          <span className="text-xs sm:text-sm text-slate-400 line-through ml-1">
                            {formatPrice(product.originalPrice)}
                          </span>
                          <span className="text-[10px] sm:text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md">
                            {Math.round(((product.originalPrice - currentUnitPrice) / product.originalPrice) * 100)}% OFF
                          </span>
                        </>
                      )}
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-[10px] sm:text-xs font-medium text-slate-600">
                      Excl. GST
                    </span>
                  </div>

                  {quantity > 1 && (
                    <div className="text-xs font-semibold text-brand-600 mt-1.5 pt-1.5 border-t border-slate-100">
                      Subtotal for {quantity} units: <strong className="font-display text-sm text-brand-700">{formatPrice(currentUnitPrice * quantity)}</strong>
                    </div>
                  )}
                </div>

                {/* Wholesale Quantity Breaks Table for this customer's price tier */}
                {customerTiers.length > 0 && (
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-brand-600" /> Wholesale Volume Slabs
                      </label>
                      <span className="text-[10px] text-slate-500 font-medium">(Price per piece)</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(1, Math.max(1, availableToAdd)))}
                        className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all ${quantity < (customerTiers[0]?.minQuantity || 999)
                            ? 'bg-brand-50 border-brand-300 ring-2 ring-brand-500/20'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                      >
                        <div className="text-[10px] text-slate-500 font-medium">1+ Units</div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900">{formatPrice(product.price)}</div>
                      </button>
                      {customerTiers.map((tier, idx) => {
                        const isTierActive = Number(quantity) >= Number(tier.minQuantity);
                        const exceedsStock = Number(tier.minQuantity) > maxStock;
                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={exceedsStock || availableToAdd <= 0}
                            onClick={() => {
                              if (!exceedsStock) {
                                setQuantity(Math.min(Number(tier.minQuantity), availableToAdd));
                              }
                            }}
                            className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all ${exceedsStock
                                ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed'
                                : isTierActive
                                  ? 'bg-brand-50 border-brand-300 ring-2 ring-brand-500/20'
                                  : 'bg-white border-slate-200 hover:bg-slate-50'
                              }`}
                            title={exceedsStock ? `Required ${tier.minQuantity} units exceeds total available stock (${maxStock})` : ''}
                          >
                            <div className="text-[10px] text-slate-500 font-medium">
                              {tier.minQuantity}+ Units {exceedsStock && <span className="text-rose-500 text-[9px] block">Max {maxStock}</span>}
                            </div>
                            <div className="text-xs sm:text-sm font-bold text-brand-700">{formatPrice(tier.price)}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity Selector & Action Controls */}
                <div className="pt-1">
                  {inCartQty === 0 ? (
                    /* STATE 1: Product NOT in Cart - Compact Stepper + Full-Width Add to Cart */
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl sm:rounded-2xl p-1 sm:p-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg sm:rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={quantity <= 1 || availableToAdd <= 0}
                          title="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <span className="w-8 sm:w-12 text-center font-display font-bold text-xs sm:text-sm text-slate-900">
                          {availableToAdd <= 0 ? 0 : quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.min(availableToAdd, quantity + 1))}
                          className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg sm:rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={quantity >= availableToAdd || availableToAdd <= 0}
                          title={quantity >= availableToAdd ? `Cannot add more. Only ${availableToAdd} available to add` : 'Increase quantity'}
                        >
                          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={!canAddToCart}
                        className="flex-1 py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl sm:rounded-2xl gradient-brand text-white font-display font-bold text-xs sm:text-sm transition-all shadow-md hover:opacity-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 active:scale-98 cursor-pointer"
                      >
                        {added ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-200" /> Added to Cart!
                          </>
                        ) : isOutOfStock ? (
                          'Out of Stock'
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Add to Cart</span>
                            {quantity > 1 && <span className="text-[11px] opacity-90">({quantity})</span>}
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    /* STATE 2: Product IS in Cart - High Clarity Mobile Cart Controls */
                    <div className="space-y-2 sm:space-y-3">
                      {/* Active In-Cart Indicator */}
                      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] sm:text-xs font-semibold">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                          </span>
                          <span>
                            <strong>{inCartQty} unit{inCartQty > 1 ? 's' : ''}</strong> currently in cart
                          </span>
                        </div>
                        {availableToAdd > 0 ? (
                          <span className="text-[10px] sm:text-[11px] text-emerald-700 font-medium">
                            {availableToAdd} more available
                          </span>
                        ) : (
                          <span className="text-[10px] sm:text-[11px] text-amber-700 font-semibold">
                            Max stock reached
                          </span>
                        )}
                      </div>

                      {/* Action Controls */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                        {/* Sub-row: Stepper + Add More */}
                        {availableToAdd > 0 && (
                          <div className="flex items-center gap-2 sm:gap-2.5">
                            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl sm:rounded-2xl p-1 sm:p-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg sm:rounded-xl transition-colors disabled:opacity-30"
                                disabled={quantity <= 1 || availableToAdd <= 0}
                                title="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                              <span className="w-8 sm:w-10 text-center font-display font-bold text-xs sm:text-sm text-slate-900">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => setQuantity(Math.min(availableToAdd, quantity + 1))}
                                className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg sm:rounded-xl transition-colors disabled:opacity-30"
                                disabled={quantity >= availableToAdd || availableToAdd <= 0}
                                title="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={handleAddToCart}
                              disabled={!canAddToCart}
                              className="flex-1 sm:flex-initial py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-xl sm:rounded-2xl border-2 border-slate-200 hover:border-brand-500 bg-white hover:bg-slate-50 text-slate-800 hover:text-brand-600 font-display font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                            >
                              {added ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Added!
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5 text-brand-600" />
                                  <span>Add More</span>
                                  <span className="text-[11px] opacity-75">({quantity})</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {/* Prominent View in Cart Button */}
                        <button
                          type="button"
                          onClick={() => toggleCart(true)}
                          className="w-full sm:flex-1 py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl sm:rounded-2xl gradient-brand text-white font-display font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg hover:opacity-95 flex items-center justify-center gap-2 active:scale-98 cursor-pointer group"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>View in Cart</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-white/20 text-white border border-white/25">
                            {inCartQty}
                          </span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Signed Out State */
              <div className="space-y-3">
                <div className="p-3.5 sm:p-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center space-y-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800">Wholesale B2B Pricing Locked</h4>
                  <p className="text-slate-500 text-[11px] sm:text-xs leading-relaxed max-w-md mx-auto">
                    Sign in with your verified customer account to unlock bulk wholesale prices, quantity breaks, and direct ordering.
                  </p>
                </div>
                <a
                  href={typeof window !== 'undefined' ? `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}` : (product.slug ? `/login?redirect=${encodeURIComponent(`/shop/${product.slug}`)}` : '/login')}
                  className="w-full py-3 sm:py-3.5 px-5 sm:px-6 rounded-xl sm:rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-display font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md text-center"
                >
                  Sign In to View Price & Purchase
                </a>
              </div>
            )}
          </div>

          {/* B2B Enterprise Assurance Badges */}
          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
            <div className="flex flex-col items-center justify-center p-1">
              <Truck className="w-4 h-4 text-brand-600 mb-1" />
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-800">Pan-India</span>
              <span className="text-[9px] text-slate-500">Fast Dispatch</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 border-x border-slate-200/80">
              <Tag className="w-4 h-4 text-brand-600 mb-1" />
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-800">GST Invoice</span>
              <span className="text-[9px] text-slate-500">Input Tax Credit</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1">
              <ShieldCheck className="w-4 h-4 text-brand-600 mb-1" />
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-800">100% Genuine</span>
              <span className="text-[9px] text-slate-500">OEM Warranty</span>
            </div>
          </div>

          {/* Product Description (Moved here below Buy Box for best mobile UX) */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <h3 className="font-display font-bold text-sm sm:text-base text-slate-900">
              Product Overview
            </h3>
            {product.description ? (
              <div
                className="prose prose-slate max-w-none text-slate-600 text-xs sm:text-sm leading-relaxed space-y-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>p]:mb-1.5 [&>strong]:text-slate-900 [&>strong]:font-bold [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-xs [&>h1]:font-bold [&>h2]:font-bold [&>h3]:font-bold"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Enterprise-grade hardware designed for maximum reliability and high-throughput workflows.
              </p>
            )}

            {/* Product Tags list below overview */}
            {resolvedTags.length > 0 && (
              <div className="pt-2 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-brand-600" />
                  Tags:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {resolvedTags.map((t, idx) => (
                    <a
                      key={idx}
                      href={`/shop?tag=${encodeURIComponent(t)}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-slate-200 text-slate-700 text-xs font-medium transition-all"
                    >
                      #{t}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Technical Specifications */}
          {(product.sku || product.productWeight || product.countryOfOrigin || product.hsCode || customSpecs.length > 0) && (
            <div className="pt-3 sm:pt-4 border-t border-slate-200 space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600" />
                  Technical Specifications
                </h3>
                {customSpecs.length > 0 && (
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {customSpecs.length + (product.sku ? 1 : 0) + (product.productWeight ? 1 : 0) + (product.countryOfOrigin ? 1 : 0) + (product.hsCode ? 1 : 0)} Specs
                  </span>
                )}
              </div>

              <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs divide-y divide-slate-100 text-[11px] sm:text-xs">
                {product.sku && (
                  <div className="grid grid-cols-12 items-center py-2.5 px-3 sm:p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <span className="col-span-5 text-slate-500 font-medium">SKU / Model</span>
                    <span className="col-span-7 text-slate-900 font-semibold font-mono text-right truncate">{product.sku}</span>
                  </div>
                )}
                {product.productWeight && (
                  <div className="grid grid-cols-12 items-center py-2.5 px-3 sm:p-3 hover:bg-slate-50 transition-colors">
                    <span className="col-span-5 text-slate-500 font-medium">Weight</span>
                    <span className="col-span-7 text-slate-900 font-semibold text-right">{product.productWeight} kg</span>
                  </div>
                )}
                {product.countryOfOrigin && (
                  <div className="grid grid-cols-12 items-center py-2.5 px-3 sm:p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <span className="col-span-5 text-slate-500 font-medium">Country of Origin</span>
                    <span className="col-span-7 text-slate-900 font-semibold text-right">{product.countryOfOrigin}</span>
                  </div>
                )}
                {product.hsCode && (
                  <div className="grid grid-cols-12 items-center py-2.5 px-3 sm:p-3 hover:bg-slate-50 transition-colors">
                    <span className="col-span-5 text-slate-500 font-medium">HS Tariff Code</span>
                    <span className="col-span-7 text-slate-900 font-semibold font-mono text-right">{product.hsCode}</span>
                  </div>
                )}
                {customSpecs.map((spec, idx) => {
                  const baseCount = (product.sku ? 1 : 0) + (product.productWeight ? 1 : 0) + (product.countryOfOrigin ? 1 : 0) + (product.hsCode ? 1 : 0);
                  const isEven = (idx + baseCount) % 2 === 0;
                  return (
                    <div
                      key={idx}
                      className={`grid grid-cols-12 items-start py-2.5 px-3 sm:p-3 transition-colors ${isEven ? 'bg-slate-50/50' : 'bg-white'} hover:bg-brand-50/30`}
                    >
                      <span className="col-span-5 text-slate-600 font-medium pr-2 break-words">{spec.key}</span>
                      <span className="col-span-7 text-slate-900 font-semibold text-right break-words">{spec.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Warehouse Availability Breakdown */}
          {product.warehouseStocks && product.warehouseStocks.length > 0 && (
            <div className="pt-3 sm:pt-4 border-t border-slate-200 space-y-2 sm:space-y-2.5">
              <h3 className="font-display font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                <Warehouse className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600" /> Regional Warehouse Stock
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.warehouseStocks.map((ws) => (
                  <div key={ws.warehouseId} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-700">{ws.warehouseName}</span>
                    <span className="font-bold text-emerald-600">{ws.stock} Units</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Related Products Section ────────────────────────────────────────── */}
      {relatedList.length > 0 && (
        <div className="pt-6 sm:pt-12 border-t border-slate-200 space-y-3 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-base sm:text-2xl text-slate-900">Related Hardware</h2>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Recommended products in {primaryCategory}</p>
            </div>
            <a
              href={`/shop?category=${encodeURIComponent(primaryCategory)}`}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 shrink-0"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {relatedList.map((rel, idx) => (
              <ProductCard key={rel.id || rel.slug || idx} product={rel} />
            ))}
          </div>
        </div>
      )}

      {/* ─── Sticky Mobile Purchase Bar (Docked at bottom on phone screens) ──── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3.5 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] text-slate-500 font-medium truncate">{product.name}</div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-extrabold text-base text-slate-900">
              {formatPrice(currentUnitPrice)}
            </span>
            <span className="text-[9px] text-slate-500 uppercase">/ unit</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isLoggedIn ? (
            inCartQty === 0 ? (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="py-2.5 px-4 rounded-xl gradient-brand text-white font-display font-bold text-xs shadow-sm flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => toggleCart(true)}
                className="py-2.5 px-4 rounded-xl gradient-brand text-white font-display font-bold text-xs shadow-sm flex items-center gap-1.5 active:scale-95 group"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>View Cart</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-white/25 text-white">
                  {inCartQty}
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )
          ) : (
            <a
              href={typeof window !== 'undefined' ? `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}` : '/login'}
              className="py-2 px-3.5 rounded-xl bg-brand-600 text-white font-semibold text-xs shadow-sm"
            >
              Sign In
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
