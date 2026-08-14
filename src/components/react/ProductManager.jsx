import React, { useState } from 'react';
import { PRODUCTS } from '../../services/productService.js';
import ProductModal from './ProductModal.jsx';
import { Plus, Edit2, Trash2, Search, PackageCheck, AlertTriangle } from 'lucide-react';

export default function ProductManager() {
  const [productList, setProductList] = useState(PRODUCTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSaveProduct = (productData) => {
    if (editingProduct) {
      setProductList(
        productList.map((p) => (p.id === productData.id ? productData : p))
      );
    } else {
      setProductList([productData, ...productList]);
    }
  };

  const handleDeleteProduct = (id) => {
    if (confirm('Are you sure you want to delete this product item?')) {
      setProductList(productList.filter((p) => p.id !== id));
    }
  };

  const filtered = productList.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog products..."
            className="w-full pl-10 pr-4 py-2 glass-input text-xs"
          />
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl gradient-brand text-white font-semibold text-xs shadow-glow-primary hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Catalog Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-900/90 text-gray-400 font-semibold border-b border-white/10 uppercase tracking-wider">
              <tr>
                <th className="p-4 pl-6">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock Inventory</th>
                <th className="p-4">Rating</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 pl-6 flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/10 bg-gray-900 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate max-w-xs">{product.name}</div>
                      <div className="text-[11px] text-gray-400 font-mono">ID: {product.id}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-brand-500/10 text-brand-300 border border-brand-500/20">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4 font-display font-bold text-white text-sm">
                    ₹{product.price.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      product.stockCount < 20
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {product.stockCount < 20 ? <AlertTriangle className="w-3 h-3" /> : <PackageCheck className="w-3 h-3" />}
                      {product.stockCount} units
                    </span>
                  </td>
                  <td className="p-4 text-amber-400 font-bold">
                    ★ {product.rating} <span className="text-gray-500 text-[10px]">({product.reviewCount})</span>
                  </td>
                  <td className="p-4 pr-6 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-gray-900 border border-white/10 text-gray-300 hover:text-white hover:border-brand-500 transition-all"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-1.5 rounded-lg bg-gray-900 border border-white/10 text-rose-400 hover:bg-rose-500/10 transition-all"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Island */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
      />
    </div>
  );
}
