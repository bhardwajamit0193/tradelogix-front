import React, { useState } from 'react';
import { X, Plus, Image as ImageIcon, Save, Check } from 'lucide-react';

export default function ProductModal({ isOpen, onClose, onSave, initialProduct = null }) {
  const [formData, setFormData] = useState(
    initialProduct || {
      name: '',
      category: 'Audio',
      price: 199.99,
      originalPrice: 249.99,
      stockCount: 25,
      badge: 'New Arrival',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      description: 'High performance audio gear with premium build quality.',
    }
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: initialProduct?.id || 'prod-' + Date.now(),
      slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      rating: initialProduct?.rating || 4.9,
      reviewCount: initialProduct?.reviewCount || 1,
      inStock: formData.stockCount > 0,
      variants: ['Standard Edition'],
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative glass-panel bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl z-10 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h3 className="font-display text-xl font-bold text-slate-900">
            {initialProduct ? 'Edit Product Item' : 'Create New Product'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-700 font-semibold">Product Title</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g. AeroPulse ANC Wireless Headphones"
              className="w-full p-3 glass-input bg-slate-50 border-slate-300 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 glass-input bg-slate-50 border-slate-300 text-slate-900 cursor-pointer"
              >
                <option value="Audio" className="bg-white text-slate-900">Audio</option>
                <option value="Displays" className="bg-white text-slate-900">Displays</option>
                <option value="Peripherals" className="bg-white text-slate-900">Peripherals</option>
                <option value="Wearables" className="bg-white text-slate-900">Wearables</option>
                <option value="Home & Office" className="bg-white text-slate-900">Home & Office</option>
                <option value="Storage" className="bg-white text-slate-900">Storage</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Badge Tag</label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g. Best Seller, Sale"
                className="w-full p-3 glass-input bg-slate-50 border-slate-300 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-slate-700 font-semibold">Price (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full mt-1 p-3 glass-input bg-slate-50 border-slate-300 text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold">Original Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                className="w-full mt-1 p-3 glass-input bg-slate-50 border-slate-300 text-slate-900 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Stock Inventory</label>
              <input
                type="number"
                value={formData.stockCount}
                onChange={(e) => setFormData({ ...formData, stockCount: Number(e.target.value) })}
                required
                className="w-full p-3 glass-input bg-slate-50 border-slate-300 text-slate-900"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 font-semibold">Image URL</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              required
              className="w-full p-3 glass-input bg-slate-50 border-slate-300 text-slate-900 font-mono text-[11px]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 font-semibold">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 glass-input bg-slate-50 border-slate-300 text-slate-900"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2 shadow-md transition-all ${
                savedSuccess ? 'bg-emerald-600' : 'gradient-brand hover:opacity-90'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
