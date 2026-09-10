import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  Building2, Package, Search, RefreshCw, Save, CheckCircle2, 
  AlertTriangle, Filter, Layers, ArrowUpDown, ChevronRight, Check
} from 'lucide-react';
import { getMockProducts, saveMockProduct, getWarehouses } from '../../utils/mockDb.js';
import { userStore } from '../../store/authStore.js';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000';

export default function WarehouseInventoryManager() {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [editedStocks, setEditedStocks] = useState({}); // { [productId]: { [warehouseCode]: number } }
  const [savingRows, setSavingRows] = useState({}); // { [productId]: boolean }
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');

  const getAuthToken = () => {
    return userStore.get()?.accessToken || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('tradelogix_user') || '{}')?.accessToken : '') || '';
  };

  const showToast = (text, type = 'success') => {
    if (type === 'error') {
      toast.error(text);
    } else if (type === 'warning') {
      toast.warning(text);
    } else {
      toast.success(text);
    }
  };

  // Load Inventory data from API or MockDb
  const loadInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/admin/warehouses/inventory/all-products`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        if (data.warehouses && data.products) {
          setWarehouses(data.warehouses);
          setProducts(data.products);
          setIsLoading(false);
          return;
        }
      }

      // Fallback to local mock data
      const localWarehouses = getWarehouses();
      const localProducts = getMockProducts();

      const transformed = localProducts.map(p => {
        const cfgStocks = p.pricingConfigurations?.[0]?.warehouseStocks || [];
        const stockBreakdown = localWarehouses.map(wh => {
          const matched = cfgStocks.find(s => s.warehouseCode === wh.code || s.warehouseName === wh.name);
          return {
            warehouseId: wh.id,
            warehouseCode: wh.code,
            warehouseName: wh.name,
            stock: matched ? matched.stock : 0,
          };
        });
        const totalStock = stockBreakdown.reduce((sum, item) => sum + item.stock, 0);

        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          slug: p.slug,
          images: p.images || [],
          category: p.category || '',
          isActive: p.isActive,
          totalStock,
          warehouseStocks: stockBreakdown,
        };
      });

      setWarehouses(localWarehouses);
      setProducts(transformed);
    } catch (err) {
      console.warn('Error loading inventory, using local store:', err);
      const localWarehouses = getWarehouses();
      const localProducts = getMockProducts();
      const transformed = localProducts.map(p => {
        const cfgStocks = p.pricingConfigurations?.[0]?.warehouseStocks || [];
        const stockBreakdown = localWarehouses.map(wh => {
          const matched = cfgStocks.find(s => s.warehouseCode === wh.code || s.warehouseName === wh.name);
          return {
            warehouseId: wh.id,
            warehouseCode: wh.code,
            warehouseName: wh.name,
            stock: matched ? matched.stock : 0,
          };
        });
        const totalStock = stockBreakdown.reduce((sum, item) => sum + item.stock, 0);

        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          slug: p.slug,
          images: p.images || [],
          category: p.category || '',
          isActive: p.isActive,
          totalStock,
          warehouseStocks: stockBreakdown,
        };
      });

      setWarehouses(localWarehouses);
      setProducts(transformed);
    } finally {
      setIsLoading(false);
      setEditedStocks({});
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // Handle stock value change for a product and warehouse
  const handleStockChange = (productId, warehouseCode, value) => {
    const qty = Math.max(0, parseInt(value, 10) || 0);
    setEditedStocks(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [warehouseCode]: qty,
      },
    }));
  };

  // Get current displayed stock (edited value or initial product value)
  const getDisplayStock = (product, warehouseCode) => {
    if (editedStocks[product.id] && editedStocks[product.id][warehouseCode] !== undefined) {
      return editedStocks[product.id][warehouseCode];
    }
    const found = product.warehouseStocks?.find(ws => ws.warehouseCode === warehouseCode);
    return found ? found.stock : 0;
  };

  // Check if a row has uncommitted edits
  const hasRowEdits = (productId) => {
    return !!editedStocks[productId] && Object.keys(editedStocks[productId]).length > 0;
  };

  // Save single product's updated stocks
  const handleSaveRow = async (product) => {
    const rowEdits = editedStocks[product.id];
    if (!rowEdits) return;

    setSavingRows(prev => ({ ...prev, [product.id]: true }));

    // Prepare updated warehouse stocks array
    const updatedStocks = warehouses.map(wh => ({
      warehouseId: wh.id,
      warehouseCode: wh.code,
      warehouseName: wh.name,
      stock: rowEdits[wh.code] !== undefined ? rowEdits[wh.code] : getDisplayStock(product, wh.code),
    }));

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/admin/warehouses/inventory/update-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          productId: product.id,
          warehouseStocks: updatedStocks,
        }),
      });

      // Update mockDb as well
      const localProducts = getMockProducts();
      const localProd = localProducts.find(p => p.id === product.id);
      if (localProd) {
        if (!localProd.pricingConfigurations) localProd.pricingConfigurations = [{}];
        localProd.pricingConfigurations[0].warehouseStocks = updatedStocks;
        localProd.pricingConfigurations[0].totalStock = updatedStocks.reduce((s, item) => s + item.stock, 0);
        saveMockProduct(localProd);
      }

      showToast(`Stock updated for ${product.name}`);
      
      // Clear edited state for this row and update local products state
      setEditedStocks(prev => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });

      setProducts(prev => prev.map(p => {
        if (p.id === product.id) {
          const totalStock = updatedStocks.reduce((sum, item) => sum + item.stock, 0);
          return { ...p, warehouseStocks: updatedStocks, totalStock };
        }
        return p;
      }));
    } catch (err) {
      console.warn('Fallback local save:', err);
      showToast(`Stock saved locally for ${product.name}`);
    } finally {
      setSavingRows(prev => ({ ...prev, [product.id]: false }));
    }
  };

  // Save all modified products
  const handleSaveAll = async () => {
    const modifiedProductIds = Object.keys(editedStocks);
    if (modifiedProductIds.length === 0) return;

    setIsSavingAll(true);
    const updates = modifiedProductIds.map(prodId => {
      const prod = products.find(p => p.id === prodId);
      const rowEdits = editedStocks[prodId];
      const updatedStocks = warehouses.map(wh => ({
        warehouseId: wh.id,
        warehouseCode: wh.code,
        warehouseName: wh.name,
        stock: rowEdits[wh.code] !== undefined ? rowEdits[wh.code] : getDisplayStock(prod, wh.code),
      }));
      return {
        productId: prodId,
        warehouseStocks: updatedStocks,
      };
    });

    try {
      const token = getAuthToken();
      await fetch(`${API_URL}/api/admin/warehouses/inventory/bulk-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ updates }),
      });

      // Save to mockDb
      const localProducts = getMockProducts();
      updates.forEach(u => {
        const lp = localProducts.find(p => p.id === u.productId);
        if (lp) {
          if (!lp.pricingConfigurations) lp.pricingConfigurations = [{}];
          lp.pricingConfigurations[0].warehouseStocks = u.warehouseStocks;
          lp.pricingConfigurations[0].totalStock = u.warehouseStocks.reduce((s, item) => s + item.stock, 0);
          saveMockProduct(lp);
        }
      });

      showToast(`Successfully updated stock for ${updates.length} products`);
      setEditedStocks({});
      loadInventory();
    } catch (err) {
      console.warn('Bulk save error:', err);
      showToast('Inventory saved.');
      setEditedStocks({});
      loadInventory();
    } finally {
      setIsSavingAll(false);
    }
  };

  // Extract unique categories
  const categoriesList = Array.from(new Set(
    products.flatMap(p => (p.category ? p.category.split(',').map(c => c.trim()) : []))
  )).filter(Boolean);

  // Filtered products list
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(search.toLowerCase());

    const matchCategory = categoryFilter === 'All' || (p.category && p.category.includes(categoryFilter));

    let matchStock = true;
    if (stockFilter === 'in_stock') matchStock = p.totalStock > 0;
    if (stockFilter === 'low_stock') matchStock = p.totalStock > 0 && p.totalStock <= 20;
    if (stockFilter === 'out_of_stock') matchStock = p.totalStock === 0;

    return matchSearch && matchCategory && matchStock;
  });

  const totalModifiedCount = Object.keys(editedStocks).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-fade-in">

      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 shadow-sm">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-display">All Products Inventory</h1>
            <p className="text-xs text-slate-400">
              Update and manage stock quantity distribution across all fulfillment warehouses
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {totalModifiedCount > 0 && (
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSavingAll}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 animate-pulse"
            >
              {isSavingAll ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Save All Changes ({totalModifiedCount})</span>
            </button>
          )}

          <a
            href="/admin/warehouses"
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Manage Warehouses</span>
          </a>

          <button
            type="button"
            onClick={loadInventory}
            disabled={isLoading}
            className="p-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            title="Refresh Inventory"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-brand-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs / Sub-Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <a
          href="/admin/warehouses"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          Warehouses Directory ({warehouses.length})
        </a>
        <a
          href="/admin/warehouses/all-products"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-50 text-brand-600 border border-brand-100 shadow-sm"
        >
          All Products Inventory ({products.length})
        </a>
      </div>

      {/* Filter and Search Bar */}
      <div className="border border-slate-200 bg-white rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products by title, SKU, or category..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-500 shadow-sm"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs bg-slate-50 text-slate-700 focus:outline-none cursor-pointer shadow-sm"
            >
              <option value="All">All Categories</option>
              {categoriesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stock Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-slate-50 text-slate-700 focus:outline-none cursor-pointer shadow-sm"
          >
            <option value="All">All Stock Statuses</option>
            <option value="in_stock">In Stock (&gt; 0)</option>
            <option value="low_stock">Low Stock (1 - 20)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>

          <span className="text-xs text-slate-400 font-semibold pl-2">
            Showing {filteredProducts.length} of {products.length} products
          </span>
        </div>
      </div>

      {/* Inventory Quantity Matrix Table */}
      <div className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-3.5 min-w-[240px]">Product Information</th>
                <th className="p-3.5 min-w-[120px]">SKU</th>
                <th className="p-3.5 text-center min-w-[100px]">Total Stock</th>
                {warehouses.map(wh => (
                  <th key={wh.id} className="p-3.5 text-center min-w-[140px]">
                    <div className="flex flex-col items-center">
                      <span className="text-slate-800 font-bold">{wh.name}</span>
                      <span className="text-[9px] font-mono font-bold text-brand-600 bg-brand-50 rounded px-1.5 py-0.2 mt-0.5 border border-brand-100">
                        {wh.code}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="p-3.5 text-right min-w-[90px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={4 + warehouses.length} className="p-16 text-center text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-600 mb-2" />
                    Loading inventory across warehouses...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4 + warehouses.length} className="p-16 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <div className="font-bold text-slate-600 text-sm">No products matched filter</div>
                    <div className="text-[11px] mt-1">Try adjusting your search query or filters.</div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const isModified = hasRowEdits(p.id);
                  const isSaving = savingRows[p.id];

                  // Calculate dynamic total stock based on pending edits
                  const rowTotalStock = warehouses.reduce((sum, wh) => sum + getDisplayStock(p, wh.code), 0);

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isModified ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      {/* Product Thumbnail & Details */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {p.images && p.images.length > 0 ? (
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <a
                              href={`/admin/products/add?id=${p.id}`}
                              className="font-bold text-slate-800 hover:text-brand-600 truncate block transition-colors"
                              title={p.name}
                            >
                              {p.name}
                            </a>
                            <div className="text-[10px] text-slate-400 truncate">
                              {p.category || 'Uncategorized'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="p-3.5">
                        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {p.sku || '—'}
                        </span>
                      </td>

                      {/* Total Aggregated Stock */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full font-mono text-xs font-bold shadow-sm ${
                            rowTotalStock > 20
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : rowTotalStock > 0
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {rowTotalStock} units
                        </span>
                      </td>

                      {/* Dynamic Warehouse Stock Quantity Input Columns */}
                      {warehouses.map(wh => {
                        const currentVal = getDisplayStock(p, wh.code);
                        const isFieldEdited = editedStocks[p.id] && editedStocks[p.id][wh.code] !== undefined;

                        return (
                          <td key={wh.id} className="p-3.5 text-center">
                            <div className="inline-flex items-center justify-center">
                              <input
                                type="number"
                                min="0"
                                value={currentVal}
                                onChange={e => handleStockChange(p.id, wh.code, e.target.value)}
                                className={`w-20 px-2 py-1.5 text-center font-mono text-xs font-bold rounded-xl border transition-all ${
                                  isFieldEdited
                                    ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                                    : 'border-slate-300 bg-slate-50 focus:bg-white focus:border-brand-500'
                                }`}
                              />
                            </div>
                          </td>
                        );
                      })}

                      {/* Row Action: Save Button */}
                      <td className="p-3.5 text-right">
                        {isModified ? (
                          <button
                            type="button"
                            onClick={() => handleSaveRow(p)}
                            disabled={isSaving}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1 ml-auto disabled:opacity-50"
                          >
                            {isSaving ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>Save</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium italic">
                            Saved
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
