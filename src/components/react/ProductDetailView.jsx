import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { userStore } from '../../store/authStore.js';
import { addToCart, cartItems, getAvailableStock } from '../../store/cartStore.js';
import ProductCard from './ProductCard.jsx';
import { formatPrice } from '../../utils/formatters.js';
import { 
  ShoppingCart, Check, Plus, Minus, Star, ShieldCheck, 
  Truck, ArrowRight, Package, Warehouse, Layers, Tag, RotateCcw, Sliders
} from 'lucide-react';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000';

export default function ProductDetailView({ initialSlug, initialData = null }) {
  const user = useStore(userStore);
  const cart = useStore(cartItems);
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
          } catch (e) {}
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
      setIsLoading(true);
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
          } catch (e) {}
        }

        if (isMounted) {
          setProduct(mergedData);
          const defaultImg = mergedData.featuredImage || mergedData.image || (mergedData.images && mergedData.images[0]) || null;
          setSelectedImage(defaultImg);
        }
      } catch (err) {
        if (isMounted) {
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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 w-48 bg-slate-200 rounded" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Gallery Skeleton */}
          <div className="space-y-4">
            <div className="w-full h-[450px] bg-slate-200 rounded-3xl" />
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-slate-200 rounded-xl" />
              <div className="w-20 h-20 bg-slate-200 rounded-xl" />
              <div className="w-20 h-20 bg-slate-200 rounded-xl" />
            </div>
          </div>

          {/* Details Skeleton */}
          <div className="space-y-6">
            <div className="h-4 w-24 bg-slate-200 rounded-full" />
            <div className="h-9 w-3/4 bg-slate-200 rounded" />
            <div className="h-4 w-40 bg-slate-200 rounded" />
            <div className="h-20 w-full bg-slate-200 rounded-2xl" />
            <div className="h-12 w-48 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
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

  const fallbackImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';
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
    } catch (e) {}
  }
  customSpecs = customSpecs.filter(
    (item) => item && (item.key?.toString().trim() || item.value?.toString().trim())
  );

  // Calculate live volume pricing based on quantity using customer's assigned tiers
  const customerTiers = product.pricing?.tiers || [];
  let currentUnitPrice = product.price || 0;
  if (customerTiers.length > 0) {
    const sortedTiers = [...customerTiers].sort((a, b) => b.minQuantity - a.minQuantity);
    const matchedTier = sortedTiers.find((t) => quantity >= t.minQuantity);
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
      basePrice: product.pricing?.basePrice ? parseFloat(product.pricing.basePrice) : product.price,
      tiers: customerTiers,
      pricing: product.pricing,
      price: product.price,
      image: currentImage,
      category: product.category,
    }, addQty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const primaryCategory = (Array.isArray(product.categories) && product.categories.length > 0)
    ? (product.categories[0].name || product.categories[0])
    : product.category || 'Hardware';

  const relatedList = Array.isArray(product.relatedProducts) ? product.relatedProducts : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <a href="/" className="hover:text-slate-900 transition-colors">Home</a>
        <span>/</span>
        <a href="/shop" className="hover:text-slate-900 transition-colors">Shop</a>
        <span>/</span>
        <a href={`/shop?category=${encodeURIComponent(primaryCategory)}`} className="hover:text-slate-900 transition-colors">
          {primaryCategory}
        </a>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Column: Gallery Showcase */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="glass-panel p-4 rounded-3xl border border-slate-200/80 overflow-hidden bg-white shadow-sm">
            <img
              src={currentImage}
              alt={product.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackImage;
              }}
              className="w-full h-[380px] sm:h-[460px] object-cover rounded-2xl transition-all duration-300"
            />
          </div>

          {/* Thumbnails list */}
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {galleryImages.map((imgUrl, idx) => {
                const isActive = (selectedImage === imgUrl);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden glass-panel border shrink-0 transition-all bg-white p-1 ${
                      isActive ? 'border-brand-600 ring-2 ring-brand-500/20 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Details & Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider border border-brand-200">
                {primaryCategory}
              </span>
              {product.sku && (
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-mono font-semibold">
                  SKU: {product.sku}
                </span>
              )}
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight">
              {product.name}
            </h1>

            {/* Ratings & Stock Status */}
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 flex-wrap">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-500" />
                <span>4.9</span>
                <span className="text-slate-400 font-normal">(Verified OEM)</span>
              </div>
              <span>•</span>
              {isOutOfStock ? (
                <span className="font-bold text-rose-600">Out of Stock</span>
              ) : maxStock <= 5 ? (
                <span className="font-bold text-amber-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Only {maxStock} left in stock!
                  {inCartQty > 0 && <span className="text-slate-500 font-normal">({inCartQty} in cart)</span>}
                </span>
              ) : (
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  In Stock ({maxStock} Available)
                  {inCartQty > 0 && <span className="text-slate-500 font-normal">({inCartQty} in cart)</span>}
                </span>
              )}
            </div>
          </div>

          {/* Product Description (Rich HTML from Editor) */}
          {product.description ? (
            <div
              className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed space-y-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>p]:mb-2 [&>strong]:text-slate-900 [&>strong]:font-bold [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-xs [&>h1]:font-bold [&>h2]:font-bold [&>h3]:font-bold"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          ) : (
            <p className="text-slate-600 text-sm leading-relaxed">
              Enterprise-grade hardware designed for maximum reliability and high-throughput workflows.
            </p>
          )}

          {/* Pricing & Add to Cart Section */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            {isLoggedIn ? (
              <>
                {/* Price Display Box */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white/90 shadow-sm flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display font-extrabold text-3xl text-slate-900">
                        {formatPrice(currentUnitPrice)}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">/ pc (per unit)</span>
                      {product.originalPrice && product.originalPrice > currentUnitPrice && (
                        <span className="text-sm text-slate-400 line-through ml-2">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    {quantity > 1 && (
                      <div className="text-xs font-semibold text-brand-600 mt-1">
                        Total for {quantity} units: <strong className="font-display text-sm">{formatPrice(currentUnitPrice * quantity)}</strong>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Excl. applicable GST</span>
                </div>

                {/* Wholesale Quantity Breaks Table for this customer's price tier */}
                {customerTiers.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-brand-600" /> Wholesale Quantity Slabs
                      </label>
                      <span className="text-[11px] text-slate-500 font-medium">(Price per piece / unit)</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(1, Math.max(1, availableToAdd)))}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          quantity < (customerTiers[0]?.minQuantity || 999)
                            ? 'bg-brand-50 border-brand-300 ring-2 ring-brand-500/20'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-[11px] text-slate-500 font-medium">1+ Units</div>
                        <div className="text-xs font-bold text-slate-900">{formatPrice(product.price)} <span className="text-[10px] font-normal text-slate-500">/ pc</span></div>
                      </button>
                      {customerTiers.map((tier, idx) => {
                        const isTierActive = quantity >= tier.minQuantity;
                        const exceedsStock = tier.minQuantity > maxStock;
                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={exceedsStock || availableToAdd <= 0}
                            onClick={() => {
                              if (!exceedsStock) {
                                setQuantity(Math.min(tier.minQuantity, availableToAdd));
                              }
                            }}
                            className={`p-2.5 rounded-xl border text-center transition-all ${
                              exceedsStock
                                ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed'
                                : isTierActive
                                ? 'bg-brand-50 border-brand-300 ring-2 ring-brand-500/20'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                            title={exceedsStock ? `Required ${tier.minQuantity} units exceeds total available stock (${maxStock})` : ''}
                          >
                            <div className="text-[11px] text-slate-500 font-medium">
                              {tier.minQuantity}+ Units {exceedsStock && <span className="text-rose-500 text-[9px] block">Max {maxStock}</span>}
                            </div>
                            <div className="text-xs font-bold text-brand-700">{formatPrice(tier.price)} <span className="text-[10px] font-normal text-slate-500">/ pc</span></div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity Selector & Action Button */}
                <div className="space-y-2 pt-2">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="flex items-center justify-between sm:justify-start bg-slate-100 border border-slate-200 rounded-2xl p-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={quantity <= 1 || availableToAdd <= 0}
                        title="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-display font-bold text-sm text-slate-900">
                        {availableToAdd <= 0 ? 0 : quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(availableToAdd, quantity + 1))}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={quantity >= availableToAdd || availableToAdd <= 0}
                        title={quantity >= availableToAdd ? `Cannot add more. Only ${availableToAdd} available to add` : 'Increase quantity'}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={!canAddToCart}
                      className="flex-1 py-3.5 px-6 rounded-2xl gradient-brand text-white font-display font-bold text-sm transition-all shadow-md hover:opacity-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {added ? (
                        <>
                          <Check className="w-5 h-5 text-emerald-200" /> Added to Cart!
                        </>
                      ) : isOutOfStock ? (
                        'Out of Stock'
                      ) : isMaxInCart ? (
                        `Max Stock in Cart (${inCartQty} / ${maxStock})`
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5" /> Add {quantity > 1 ? `${quantity} Units` : 'to Cart'}
                        </>
                      )}
                    </button>
                  </div>

                  {inCartQty > 0 && availableToAdd > 0 && (
                    <p className="text-[11px] text-slate-500 font-medium">
                      You currently have <strong>{inCartQty}</strong> in your cart. You can add up to <strong>{availableToAdd}</strong> more.
                    </p>
                  )}
                  {isMaxInCart && (
                    <p className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                      ⚠️ All {maxStock} available units are already in your cart.
                    </p>
                  )}
                </div>
              </>
            ) : (
              /* Signed Out State */
              <div className="space-y-4">
                <div className="p-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center space-y-2">
                  <h4 className="text-sm font-bold text-slate-800">Wholesale B2B Pricing Locked</h4>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-md mx-auto">
                    Please sign in with your verified customer account to unlock bulk wholesale prices, volume quantity discounts, and inventory dispatch.
                  </p>
                </div>
                <a
                  href={typeof window !== 'undefined' ? `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}` : (product.slug ? `/login?redirect=${encodeURIComponent(`/shop/${product.slug}`)}` : '/login')}
                  className="w-full py-3.5 px-6 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-display font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  Sign In to View Price & Purchase
                </a>
              </div>
            )}
          </div>

          {/* Warehouse Availability Breakdown */}
          {product.warehouseStocks && product.warehouseStocks.length > 0 && (
            <div className="pt-6 border-t border-slate-200 space-y-3">
              <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-brand-600" /> Regional Warehouse Inventory
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.warehouseStocks.map((ws) => (
                  <div key={ws.warehouseId} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-700">{ws.warehouseName}</span>
                    <span className="font-bold text-emerald-600">{ws.stock} Units</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Specifications */}
          {(product.sku || product.productWeight || product.countryOfOrigin || product.hsCode || customSpecs.length > 0) && (
            <div className="pt-6 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-brand-600" />
                  Technical Specifications
                </h3>
                {customSpecs.length > 0 && (
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {customSpecs.length + (product.sku ? 1 : 0) + (product.productWeight ? 1 : 0) + (product.countryOfOrigin ? 1 : 0) + (product.hsCode ? 1 : 0)} Specs
                  </span>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs divide-y divide-slate-100 text-xs">
                {product.sku && (
                  <div className="grid grid-cols-2 p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <span className="text-slate-500 font-medium">SKU / Model</span>
                    <span className="text-slate-900 font-semibold font-mono text-right">{product.sku}</span>
                  </div>
                )}
                {product.productWeight && (
                  <div className="grid grid-cols-2 p-3 hover:bg-slate-50 transition-colors">
                    <span className="text-slate-500 font-medium">Weight</span>
                    <span className="text-slate-900 font-semibold text-right">{product.productWeight} kg</span>
                  </div>
                )}
                {product.countryOfOrigin && (
                  <div className="grid grid-cols-2 p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <span className="text-slate-500 font-medium">Country of Origin</span>
                    <span className="text-slate-900 font-semibold text-right">{product.countryOfOrigin}</span>
                  </div>
                )}
                {product.hsCode && (
                  <div className="grid grid-cols-2 p-3 hover:bg-slate-50 transition-colors">
                    <span className="text-slate-500 font-medium">HS Tariff Code</span>
                    <span className="text-slate-900 font-semibold font-mono text-right">{product.hsCode}</span>
                  </div>
                )}
                {customSpecs.map((spec, idx) => {
                  const baseCount = (product.sku ? 1 : 0) + (product.productWeight ? 1 : 0) + (product.countryOfOrigin ? 1 : 0) + (product.hsCode ? 1 : 0);
                  const isEven = (idx + baseCount) % 2 === 0;
                  return (
                    <div
                      key={idx}
                      className={`grid grid-cols-2 p-3 transition-colors ${isEven ? 'bg-slate-50/50' : 'bg-white'} hover:bg-brand-50/30`}
                    >
                      <span className="text-slate-600 font-medium pr-2">{spec.key}</span>
                      <span className="text-slate-900 font-semibold text-right break-words">{spec.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Related Products Section ────────────────────────────────────────── */}
      {relatedList.length > 0 && (
        <div className="pt-16 border-t border-slate-200 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-2xl text-slate-900">Related Hardware</h2>
              <p className="text-xs text-slate-500 mt-1">Recommended products in {primaryCategory} & compatible categories</p>
            </div>
            <a
              href={`/shop?category=${encodeURIComponent(primaryCategory)}`}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedList.map((rel) => (
              <ProductCard key={rel.id || rel.slug} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
