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
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative glass-panel rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-white/10 shadow-2xl z-10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="font-display text-xl font-bold text-white">
            {initialProduct ? 'Edit Product Item' : 'Create New Product'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Product Title</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g. AeroPulse ANC Wireless Headphones"
              className="w-full p-3 glass-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-gray-300 font-semibold">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 glass-input bg-gray-900 cursor-pointer"
              >
                <option value="Audio">Audio</option>
                <option value="Displays">Displays</option>
                <option value="Peripherals">Peripherals</option>
                <option value="Wearables">Wearables</option>
                <option value="Home & Office">Home & Office</option>
                <option value="Storage">Storage</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-gray-300 font-semibold">Badge Tag</label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g. Best Seller, Sale"
                className="w-full p-3 glass-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-gray-300 font-semibold">Price (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full mt-1 p-3 glass-input text-xs"
              />
            </div>

            <div>
              <label className="text-gray-300 font-semibold">Original Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                className="w-full mt-1 p-3 glass-input text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-300 font-semibold">Stock Inventory</label>
              <input
                type="number"
                value={formData.stockCount}
                onChange={(e) => setFormData({ ...formData, stockCount: Number(e.target.value) })}
                required
                className="w-full p-3 glass-input"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Image URL</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              required
              className="w-full p-3 glass-input font-mono text-[11px]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 glass-input"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gray-900 text-gray-300 hover:text-white border border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2 shadow-glow-primary transition-all ${
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
