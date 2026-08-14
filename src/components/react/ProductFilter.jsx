import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Grid, List, Star, ArrowUpDown, RotateCcw } from 'lucide-react';
import AddToCartButton from './AddToCartButton.jsx';
import ProductCard from './ProductCard.jsx';

const getBadgeStyle = (badge) => {
  switch (badge) {
    case 'Best Seller':
      return 'bg-amber-500 text-gray-950 border-amber-300 font-black shadow-md';
    case 'Pro Choice':
      return 'bg-brand-600 text-white border-brand-400 font-black shadow-md';
    case 'Hot Item':
      return 'bg-rose-500 text-white border-rose-300 font-black shadow-md';
    case 'New Arrival':
      return 'bg-emerald-500 text-gray-950 border-emerald-300 font-black shadow-md';
    default:
      return 'bg-gray-950/90 text-amber-400 border-amber-500/40 font-black shadow-md backdrop-blur-md';
  }
};

export default function ProductFilter({ initialProducts, categories, initialCategory = 'All' }) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(2000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    if (selectedCategory !== 'All') {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    result = result.filter((p) => p.price <= maxPrice);

    if (inStockOnly) {
      result = result.filter((p) => p.inStock && p.stockCount > 0);
    }

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    return result;
  }, [initialProducts, selectedCategory, searchQuery, maxPrice, inStockOnly, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setMaxPrice(2000);
    setInStockOnly(false);
    setSortBy('featured');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Left Sidebar Filter Column */}
      <aside className="w-full lg:w-72 glass-panel p-6 rounded-3xl border border-white/10 space-y-6 shrink-0 lg:sticky lg:top-24">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-brand-400" /> Filter Hardware
          </h3>
          <button
            onClick={handleResetFilters}
            className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        {/* Search Filter */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Search Keywords</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Headphones, OLED, SSD..."
              className="w-full pl-10 pr-3 py-2.5 glass-input text-xs"
            />
          </div>
        </div>

        {/* Categories Vertical Filter List */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Categories</label>
          <div className="space-y-1">
            {categories.map((cat) => {
              const count =
                cat === 'All'
                  ? initialProducts.length
                  : initialProducts.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-brand-500/20 text-white font-semibold border border-brand-500/30 shadow-glow-primary'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isSelected ? 'bg-brand-500 text-white' : 'bg-gray-900 text-gray-400 border border-white/5'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Slider */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between text-xs font-bold text-gray-300">
            <span>Max Price</span>
            <span className="text-brand-400 font-display">₹{maxPrice}</span>
          </div>
          <input
            type="range"
            min="50"
            max="2000"
            step="25"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-brand-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-medium">
            <span>₹50</span>
            <span>₹2,000</span>
          </div>
        </div>

        {/* Stock Filter Checkbox */}
        <div className="pt-2 border-t border-white/10">
          <label className="flex items-center gap-2.5 text-xs text-gray-300 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded accent-brand-500 w-4 h-4 bg-gray-900 border-white/10 cursor-pointer"
            />
            <span>In Stock Items Only</span>
          </label>
        </div>
      </aside>

      {/* Right Product Grid Stream */}
      <div className="flex-1 min-w-0 space-y-6 w-full">
        {/* Sorting & Results Count Header */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10">
          <div className="text-xs text-gray-400">
            Showing <span className="font-bold text-white">{filteredProducts.length}</span> products
            {selectedCategory !== 'All' && (
              <span> in <strong className="text-brand-400">{selectedCategory}</strong></span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="glass-input py-1.5 px-3 text-xs bg-gray-900 cursor-pointer font-medium"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-brand-500/30 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-brand-500/30 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Items Display */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl space-y-3 border border-white/10">
            <p className="text-lg font-semibold text-white">No hardware products match your criteria</p>
            <p className="text-xs text-gray-400">Try loosening your search terms or adjusting the price slider.</p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-brand-500/20 text-brand-400 text-xs font-semibold border border-brand-500/30 hover:bg-brand-500/30 transition-all inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="glass-panel glass-panel-hover rounded-3xl p-4 flex flex-col sm:flex-row items-center gap-6 border border-white/10"
              >
                <a href={`/shop/${product.slug}`} className="shrink-0 w-full sm:w-48 h-40 rounded-2xl overflow-hidden bg-gray-950 relative block">
                  {product.badge && (
                    <span className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[10px] tracking-wider border ${getBadgeStyle(product.badge)}`}>
                      {product.badge}
                    </span>
                  )}
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </a>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">{product.category}</span>
                    <span className="text-gray-600">•</span>
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{product.rating}</span>
                    </div>
                  </div>

                  <a href={`/shop/${product.slug}`}>
                    <h3 className="font-display font-bold text-lg text-white hover:text-brand-400 transition-colors">
                      {product.name}
                    </h3>
                  </a>
                  <p className="text-xs text-gray-400 line-clamp-2">{product.description}</p>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-2xl font-extrabold font-display text-white">₹{product.price.toFixed(2)}</span>
                  </div>
                  <AddToCartButton product={product} compact={false} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
