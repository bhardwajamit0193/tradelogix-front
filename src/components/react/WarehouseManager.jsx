import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, Plus, Trash2, Search, RefreshCw, X, Pencil, 
  MapPin, CheckCircle2, AlertTriangle, Hash, Layers, Package
} from 'lucide-react';
import { CountrySelect, StateSelect, CitySelect } from 'react-country-state-city';
import { getWarehouses, saveWarehouse, deleteWarehouse } from '../../utils/mockDb.js';
import { userStore } from '../../store/authStore.js';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000';

const EMPTY_FORM = { name: '', code: '', city: '', state: 'Maharashtra', country: 'India' };

export default function WarehouseManager() {
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formCountryId, setFormCountryId] = useState(101);
  const [formStateId, setFormStateId] = useState(0);
  const [editCountryId, setEditCountryId] = useState(101);
  const [editStateId, setEditStateId] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);

  // Edit modal state
  const [editModal, setEditModal] = useState(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const getAuthToken = () => {
    return userStore.get()?.accessToken || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('tradelogix_user') || '{}')?.accessToken : '') || '';
  };

  const showToast = (text, type = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Load warehouses from API with mock fallback
  const loadWarehouses = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/admin/warehouses`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        if (Array.isArray(data)) {
          setWarehouses(data);
          // Sync local cache
          if (typeof window !== 'undefined') {
            localStorage.setItem('tradelogix_warehouses_v1', JSON.stringify(data));
          }
          setIsLoading(false);
          return;
        }
      }
      // Fallback
      setWarehouses(getWarehouses());
    } catch (err) {
      console.warn('API error, falling back to local store:', err);
      setWarehouses(getWarehouses());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWarehouses();
  }, [loadWarehouses]);

  // Form handlers
  const handleInputChange = (field, val) => {
    setForm(prev => ({
      ...prev,
      [field]: field === 'code' ? val.toUpperCase().replace(/\s+/g, '-') : val,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Warehouse name is required.', 'error');
      return;
    }
    if (!form.code.trim()) {
      showToast('Warehouse code is required.', 'error');
      return;
    }
    if (!form.city.trim()) {
      showToast('City is required.', 'error');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      city: form.city.trim(),
      state: form.state.trim(),
    };

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/admin/warehouses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        showToast(`Warehouse '${payload.name}' added successfully.`);
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to save warehouse to backend');
      }
    } catch (err) {
      console.warn('Saving locally:', err);
      saveWarehouse(payload);
      showToast(`Warehouse '${payload.name}' saved.`);
    } finally {
      setIsSubmitting(false);
      setForm(EMPTY_FORM);
      loadWarehouses();
    }
  };

  // Edit handlers
  const handleOpenEdit = (wh) => {
    setEditModal({
      id: wh.id,
      name: wh.name,
      code: wh.code,
      city: wh.city,
      state: wh.state || 'Maharashtra',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editModal.name.trim() || !editModal.code.trim() || !editModal.city.trim()) {
      showToast('Name, code, and city are required.', 'error');
      return;
    }

    setIsEditSubmitting(true);
    const payload = {
      name: editModal.name.trim(),
      code: editModal.code.trim().toUpperCase(),
      city: editModal.city.trim(),
      state: editModal.state.trim(),
    };

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/admin/warehouses/${editModal.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast('Warehouse updated successfully.');
      } else {
        saveWarehouse({ id: editModal.id, ...payload });
        showToast('Warehouse updated.');
      }
    } catch {
      saveWarehouse({ id: editModal.id, ...payload });
      showToast('Warehouse updated.');
    } finally {
      setIsEditSubmitting(false);
      setEditModal(null);
      loadWarehouses();
    }
  };

  // Delete handlers
  const handleDelete = async (whId, whName) => {
    if (!window.confirm(`Are you sure you want to delete warehouse "${whName}"? This cannot be undone.`)) return;

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/admin/warehouses/${whId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        showToast(`Warehouse '${whName}' deleted.`);
      } else {
        deleteWarehouse(whId);
        showToast(`Warehouse '${whName}' deleted.`);
      }
    } catch {
      deleteWarehouse(whId);
      showToast(`Warehouse '${whName}' deleted.`);
    } finally {
      setSelected(prev => prev.filter(id => id !== whId));
      loadWarehouses();
    }
  };

  const handleBulkDelete = async () => {
    if (!selected.length) return;
    if (!window.confirm(`Delete ${selected.length} selected warehouse(s)?`)) return;

    for (const id of selected) {
      try {
        const token = getAuthToken();
        await fetch(`${API_URL}/api/admin/warehouses/${id}`, {
          method: 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      } catch {
        deleteWarehouse(id);
      }
    }
    showToast(`Deleted ${selected.length} warehouse(s).`);
    setSelected([]);
    loadWarehouses();
  };

  // Table selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(filtered.map(w => w.id));
    } else {
      setSelected([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filtered = warehouses.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.code.toLowerCase().includes(search.toLowerCase()) ||
    w.city.toLowerCase().includes(search.toLowerCase()) ||
    (w.state || '').toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-fade-in">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 text-white text-xs font-semibold rounded-2xl shadow-2xl animate-fade-in ${
            toastMsg.type === 'error' ? 'bg-rose-900' : 'bg-slate-900'
          }`}
        >
          {toastMsg.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-display">Warehouses</h1>
            <p className="text-xs text-slate-400">
              Manage distribution centers, fulfillment hubs, and regional inventory locations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href="/admin/warehouses/all-products"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Update Products Stock</span>
          </a>

          <button
            type="button"
            onClick={loadWarehouses}
            disabled={isLoading}
            className="p-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-brand-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Tabs / Sub-Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <a
          href="/admin/warehouses"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-50 text-brand-600 border border-brand-100 shadow-sm"
        >
          Warehouses Directory ({warehouses.length})
        </a>
        <a
          href="/admin/warehouses/all-products"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          All Products Inventory
        </a>
      </div>

      {/* Split Layout: Left Form + Right Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ─── LEFT COLUMN: ADD NEW WAREHOUSE FORM ─── */}
        <div className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-bold text-slate-800">Add New Warehouse</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Warehouse Name */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Warehouse Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => handleInputChange('name', e.target.value)}
                placeholder="e.g. Mumbai Central Hub"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-500 transition-colors shadow-sm"
              />
              <p className="text-[10px] text-slate-400">The full operational name for this depot.</p>
            </div>

            {/* Warehouse Code */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Warehouse Code <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.code}
                  onChange={e => handleInputChange('code', e.target.value)}
                  placeholder="e.g. MUM-01"
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-500 font-mono font-bold transition-colors shadow-sm"
                />
                <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[10px] text-slate-400">Unique alphanumeric identifier (e.g. DEL-01, BLR-01).</p>
            </div>

            {/* Country with react-country-state-city */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Country <span className="text-rose-500">*</span>
              </label>
              <CountrySelect
                defaultValue={{ id: 101, name: form.country || 'India' }}
                onChange={(val) => {
                  setFormCountryId(val.id);
                  handleInputChange('country', val.name);
                }}
                placeHolder="Select Country"
              />
            </div>

            {/* State with react-country-state-city */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                State <span className="text-rose-500">*</span>
              </label>
              <StateSelect
                countryid={formCountryId}
                defaultValue={form.state ? { name: form.state } : undefined}
                onChange={(val) => {
                  setFormStateId(val.id);
                  handleInputChange('state', val.name);
                }}
                placeHolder={form.state || 'Select State'}
              />
            </div>

            {/* City with react-country-state-city */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                City <span className="text-rose-500">*</span>
              </label>
              <CitySelect
                countryid={formCountryId}
                stateid={formStateId}
                defaultValue={form.city ? { name: form.city } : undefined}
                onChange={(val) => {
                  handleInputChange('city', val.name);
                }}
                placeHolder={form.city || 'Select City'}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Adding Warehouse...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Add Warehouse
                </>
              )}
            </button>
          </form>
        </div>

        {/* ─── RIGHT COLUMN: WAREHOUSES TABLE ─── */}
        <div className="lg:col-span-2 border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {/* Table Toolbar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selected.length})
                </button>
              )}
              <span className="text-xs text-slate-500 font-semibold">
                {filtered.length} {filtered.length === 1 ? 'warehouse' : 'warehouses'}
              </span>
            </div>

            {/* Search input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search warehouses..."
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:border-brand-500 shadow-sm"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selected.length > 0 && selected.length === filtered.length}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5">Name & Code</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Created Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-600 mb-2" />
                      Loading warehouses...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400">
                      <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <div className="font-bold text-slate-600">No warehouses found</div>
                      <div className="text-[11px]">Add a new warehouse using the form on the left.</div>
                    </td>
                  </tr>
                ) : (
                  filtered.map(w => {
                    const isSelected = selected.includes(w.id);
                    return (
                      <tr
                        key={w.id}
                        className={`group hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-brand-50/30' : ''}`}
                      >
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(w.id)}
                            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                          />
                        </td>

                        {/* Name & Code Badge */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{w.name}</span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px] font-bold">
                              {w.code}
                            </span>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="p-3.5 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{w.city}, {w.state}</span>
                          </div>
                        </td>

                        {/* Created At */}
                        <td className="p-3.5 text-slate-400 text-[11px] font-mono">
                          {formatDate(w.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(w)}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
                              title="Edit Warehouse"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(w.id, w.name)}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-rose-600 transition-colors shadow-sm"
                              title="Delete Warehouse"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* ─── EDIT WAREHOUSE MODAL ─── */}
      {editModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-slate-800 text-sm">Edit Warehouse</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Warehouse Name *</label>
                <input
                  type="text"
                  value={editModal.name}
                  onChange={e => setEditModal({ ...editModal, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-500 shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Warehouse Code *</label>
                <input
                  type="text"
                  value={editModal.code}
                  onChange={e => setEditModal({ ...editModal, code: e.target.value.toUpperCase().replace(/\s+/g, '-') })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-500 font-mono font-bold shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Country *</label>
                <CountrySelect
                  defaultValue={{ id: 101, name: editModal.country || 'India' }}
                  onChange={(val) => {
                    setEditCountryId(val.id);
                    setEditModal({ ...editModal, country: val.name });
                  }}
                  placeHolder="Select Country"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">State *</label>
                <StateSelect
                  countryid={editCountryId}
                  defaultValue={editModal.state ? { name: editModal.state } : undefined}
                  onChange={(val) => {
                    setEditStateId(val.id);
                    setEditModal({ ...editModal, state: val.name });
                  }}
                  placeHolder={editModal.state || 'Select State'}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">City *</label>
                <CitySelect
                  countryid={editCountryId}
                  stateid={editStateId}
                  defaultValue={editModal.city ? { name: editModal.city } : undefined}
                  onChange={(val) => {
                    setEditModal({ ...editModal, city: val.name });
                  }}
                  placeHolder={editModal.city || 'Select City'}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModal(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditSubmitting}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-sm disabled:opacity-50"
                >
                  {isEditSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
