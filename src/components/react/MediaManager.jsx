import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Upload, Image as ImageIcon, Search, LayoutGrid, List, Trash2, 
  Copy, Download, X, Check, RefreshCw, 
  FileText, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  AlertTriangle, CheckCircle2, ArrowLeft
} from 'lucide-react';
import { userStore, fetchWithAuth } from '../../store/authStore.js';
import MediaLibraryModal from './MediaLibraryModal.jsx';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000';

export default function MediaManager() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active view: 'list' | 'grid' | 'edit'
  const [viewMode, setViewMode] = useState('list');

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'image' | 'pdf'
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalCount, setTotalCount] = useState(0);

  // Edit / Details State (Rendered as full page view)
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const getAuthToken = () => {
    return userStore.get()?.accessToken || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('tradelogix_user') || '{}')?.accessToken : '') || '';
  };

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Media Items with Auto-Refresh Auth
  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth(`${API_URL}/media?page=${page}&limit=${limit}`);

      if (res.status === 401) {
        throw new Error('Authentication required. Please sign in as an Admin.');
      }
      if (!res.ok) {
        throw new Error(`Failed to load media (HTTP ${res.status})`);
      }

      const json = await res.json();
      const data = json?.data || json;
      const mediaList = data?.items || [];
      setItems(mediaList);
      setTotalCount(data?.total || mediaList.length);
    } catch (err) {
      setError(err.message);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Filtered Media List
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const nameMatch = (item.filename || item.originalName || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (!nameMatch) return false;

      if (filterType === 'image') {
        return item.mimeType?.startsWith('image/');
      }
      if (filterType === 'pdf') {
        return item.mimeType?.includes('pdf');
      }
      return true;
    });
  }, [items, searchQuery, filterType]);

  // Bulk Actions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredItems.map(i => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleApplyBulkAction = async () => {
    if (!bulkAction) return;
    if (selectedIds.length === 0) {
      alert('Please select at least one media item.');
      return;
    }

    if (bulkAction === 'delete') {
      if (!confirm(`Are you sure you want to permanently delete ${selectedIds.length} item(s)?`)) {
        return;
      }
      try {
        const res = await fetchWithAuth(`${API_URL}/media/bulk-delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: selectedIds }),
        });

        if (!res.ok) throw new Error('Failed to delete media items.');
        showToast(`Successfully deleted ${selectedIds.length} items`);
        setSelectedIds([]);
        setBulkAction('');
        fetchMedia();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Single Delete
  const handleDeleteSingle = async (item) => {
    if (!confirm(`Are you sure you want to permanently delete "${item.filename || item.originalName}"?`)) {
      return;
    }

    try {
      const res = await fetchWithAuth(`${API_URL}/media/${item.id}/delete`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to delete item.');
      showToast('Media deleted permanently');
      if (editingItem?.id === item.id) {
        setEditingItem(null);
        setViewMode('list');
      }
      fetchMedia();
    } catch (err) {
      alert(err.message);
    }
  };

  // Open Full-Page Edit View
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditTitle(item.filename || item.originalName || '');
    setCopySuccess(false);
    setViewMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save Edit Details
  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setIsUpdating(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/media/${editingItem.id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ originalName: editTitle }),
      });

      if (!res.ok) throw new Error('Failed to update media details.');
      showToast('Media details updated successfully');
      // Update local state
      setEditingItem(prev => prev ? { ...prev, originalName: editTitle, filename: editTitle } : null);
      fetchMedia();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = (url) => {
    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopySuccess(true);
    showToast('Copied URL to clipboard');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── FULL PAGE EDIT VIEW (When an item is opened for editing) ──────────────
  // ═══════════════════════════════════════════════════════════════════════════
  if (viewMode === 'edit' && editingItem) {
    const fullUrl = editingItem.url?.startsWith('http') ? editingItem.url : `${API_URL}${editingItem.url}`;
    const isImage = editingItem.mimeType?.startsWith('image/');

    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-fade-in">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white text-xs font-semibold rounded-2xl shadow-2xl animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Top Header / Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setViewMode('list');
              }}
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors shadow-sm"
              title="Back to Media Library"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-2xl font-bold text-slate-800 font-display">Edit Media</h1>
            <a
              href="/admin/media/new"
              className="px-3 py-1.5 bg-white border border-brand-600 hover:bg-brand-50 text-brand-600 font-bold rounded-lg text-xs transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" /> Add Media File
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setViewMode('list');
              }}
              className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-all shadow-sm"
            >
              Back to Library
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={isUpdating}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {isUpdating ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>

        {/* ── Main Layout: 2 Cols on Left (Title & Big Image), 1 Col on Right (File Details) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Columns (2 Cols) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title Card */}
            <div className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Image or file title..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                />
              </div>

              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 pt-1">
                <span className="font-semibold text-slate-600">File URL:</span>
                <a
                  href={fullUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline font-mono text-[11px] break-all"
                >
                  {fullUrl}
                </a>
              </div>
            </div>

            {/* Big Preview Card */}
            <div className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Preview</div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 flex items-center justify-center min-h-[380px] max-h-[550px] overflow-hidden">
                {isImage ? (
                  <img
                    src={fullUrl}
                    alt={editingItem.filename}
                    className="max-h-[500px] w-auto max-w-full object-contain rounded-xl shadow-sm"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 text-slate-400 py-12">
                    <FileText className="w-20 h-20 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-600">{editingItem.originalName}</span>
                    <span className="text-xs text-slate-400">({editingItem.mimeType})</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): WordPress File Details Panel */}
          <div className="space-y-6">
            <div className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-5">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
                File Details
              </h3>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span><strong>Uploaded on:</strong> {formatDate(editingItem.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">A</div>
                  <span><strong>Uploaded by:</strong> Admin</span>
                </div>

                {/* File URL & Copy */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <label className="text-[11px] font-bold text-slate-700 block">File URL</label>
                  <input
                    type="text"
                    readOnly
                    value={fullUrl}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-600 select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(editingItem.url)}
                    className="w-full py-2 px-3 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copySuccess ? 'Copied!' : 'Copy URL to clipboard'}
                  </button>
                </div>

                {/* File Metadata */}
                <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px]">
                  <div><strong>File name:</strong> <span className="font-mono text-slate-600">{editingItem.originalName || editingItem.filename}</span></div>
                  <div><strong>File type:</strong> <span className="font-mono text-slate-600">{editingItem.mimeType}</span></div>
                  <div><strong>File size:</strong> {formatFileSize(editingItem.fileSize)}</div>
                  <div className="pt-1">
                    <a
                      href={fullUrl}
                      download
                      className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download file
                    </a>
                  </div>
                </div>
              </div>

              {/* Bottom Actions: Delete Permanently & Update Button */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDeleteSingle(editingItem)}
                  className="text-rose-600 hover:text-rose-800 text-xs font-bold hover:underline"
                >
                  Delete permanently
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isUpdating}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  {isUpdating ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Modal (if triggered while in edit mode) */}
        <MediaLibraryModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            fetchMedia();
          }}
          onSelect={(media) => {
            setIsUploadModalOpen(false);
            fetchMedia();
          }}
          authToken={getAuthToken()}
        />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── LIST / GRID VIEW (Main Media Library Page) ────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white text-xs font-semibold rounded-2xl shadow-2xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800 font-display">Media Library</h1>
          <a
            href="/admin/media/new"
            className="px-3 py-1.5 bg-white border border-brand-600 hover:bg-brand-50 text-brand-600 font-bold rounded-lg text-xs transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" /> Add Media File
          </a>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Media..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:border-brand-500 shadow-sm"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="button"
            onClick={() => {}}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm"
          >
            Search Media
          </button>
        </div>
      </div>

      {/* WordPress-style Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-slate-100 text-slate-800 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-slate-100 text-slate-800 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 shadow-sm focus:outline-none"
          >
            <option value="all">All media items</option>
            <option value="image">Images</option>
            <option value="pdf">Documents (PDF)</option>
          </select>

          {/* Bulk Actions */}
          <div className="flex items-center gap-1.5">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 shadow-sm focus:outline-none"
            >
              <option value="">Bulk actions</option>
              <option value="delete">Delete Permanently</option>
            </select>
            <button
              type="button"
              onClick={handleApplyBulkAction}
              disabled={!bulkAction || selectedIds.length === 0}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Top Pagination & Refresh */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">
            {totalCount} items
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(1)}
              className="p-1.5 bg-white border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50 text-slate-600"
              title="First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-1.5 bg-white border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50 text-slate-600"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="text-xs font-semibold px-2 text-slate-700">
              {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 bg-white border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50 text-slate-600"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              className="p-1.5 bg-white border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50 text-slate-600"
              title="Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={fetchMedia}
            className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-500 shadow-sm"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="p-20 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-3 shadow-sm text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-600" />
          <span className="text-xs font-semibold">Loading media library...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty state */
        <div className="p-16 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-3 shadow-sm text-center">
          <div className="p-4 rounded-full bg-slate-100 text-slate-400">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">No media files found</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            {searchQuery ? 'No results matched your search term.' : 'Upload photos and documents to easily manage your media assets.'}
          </p>
          <a
            href="/admin/media/new"
            className="mt-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" /> Upload Files
          </a>
        </div>
      ) : viewMode === 'list' ? (
        /* ─── LIST VIEW (WordPress Table) ─── */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredItems.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                </th>
                <th className="p-3.5">File</th>
                <th className="p-3.5">Author</th>
                <th className="p-3.5">File Type</th>
                <th className="p-3.5">Size</th>
                <th className="p-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredItems.map((item) => {
                const fullUrl = item.url?.startsWith('http') ? item.url : `${API_URL}${item.url}`;
                const isSelected = selectedIds.includes(item.id);
                const isImage = item.mimeType?.startsWith('image/');

                return (
                  <tr
                    key={item.id}
                    className={`group hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-brand-50/30' : ''}`}
                  >
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(item.id)}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                      />
                    </td>

                    {/* File Thumbnail & Name + Quick Actions */}
                    <td className="p-3.5">
                      <div className="flex items-start gap-3">
                        <div 
                          onClick={() => handleOpenEdit(item)}
                          className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center cursor-pointer hover:opacity-90"
                        >
                          {isImage ? (
                            <img
                              src={fullUrl}
                              alt={item.filename}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileText className="w-6 h-6 text-slate-400" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="font-bold text-blue-600 hover:text-blue-800 text-xs text-left line-clamp-1 block cursor-pointer"
                          >
                            {item.filename || item.originalName}
                          </button>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {item.originalName || item.filename}
                          </div>

                          {/* WordPress style quick action row */}
                          <div className="flex items-center gap-2 pt-0.5 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="text-blue-600 hover:underline font-semibold"
                            >
                              Edit
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteSingle(item)}
                              className="text-rose-600 hover:underline font-semibold"
                            >
                              Delete Permanently
                            </button>
                            <span className="text-slate-300">|</span>
                            <a
                              href={fullUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-600 hover:underline font-semibold"
                            >
                              View
                            </a>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(item.url)}
                              className="text-slate-600 hover:underline font-semibold"
                            >
                              Copy URL
                            </button>
                            <span className="text-slate-300">|</span>
                            <a
                              href={fullUrl}
                              download
                              className="text-slate-600 hover:underline font-semibold"
                            >
                              Download file
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-600 text-[11px]">
                      Admin
                    </td>

                    <td className="p-3.5 text-slate-600 text-[11px] uppercase font-mono">
                      {item.mimeType?.split('/')[1] || item.mimeType || 'FILE'}
                    </td>

                    <td className="p-3.5 text-slate-600 text-[11px]">
                      {formatFileSize(item.fileSize)}
                    </td>

                    <td className="p-3.5 text-slate-500 text-[11px]">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ─── GRID VIEW ─── */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredItems.map((item) => {
            const fullUrl = item.url?.startsWith('http') ? item.url : `${API_URL}${item.url}`;
            const isSelected = selectedIds.includes(item.id);
            const isImage = item.mimeType?.startsWith('image/');

            return (
              <div
                key={item.id}
                onClick={() => handleOpenEdit(item)}
                className={`relative group rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  isSelected ? 'border-brand-500 ring-2 ring-brand-400' : 'border-slate-200'
                }`}
              >
                <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                  {isImage ? (
                    <img
                      src={fullUrl}
                      alt={item.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <FileText className="w-10 h-10 text-slate-400" />
                  )}
                </div>

                {/* Selection Checkbox */}
                <div 
                  className="absolute top-2 left-2 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSelect(item.id);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer shadow"
                  />
                </div>

                <div className="p-2.5 bg-white border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {item.filename || item.originalName}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex justify-between">
                    <span>{formatFileSize(item.fileSize)}</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
