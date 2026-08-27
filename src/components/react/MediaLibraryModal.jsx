import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Uppy from '@uppy/core';
import Dashboard from '@uppy/react/dashboard';
import XHRUpload from '@uppy/xhr-upload';
import { X, Upload, Image as ImageIcon, Search, CheckCircle2, RefreshCw, Loader2, FileImage } from 'lucide-react';
import { userStore, fetchWithAuth } from '../../store/authStore.js';

// Uppy CSS
import '@uppy/core/css/style.min.css';
import '@uppy/dashboard/css/style.min.css';
import '../../styles/uppy-overrides.css';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000';

/**
 * MediaLibraryModal — WordPress-style media upload & selection modal.
 *
 * Props:
 * - isOpen (boolean): controls visibility
 * - onClose (() => void): close callback
 * - onSelect ((media: { id, url, filename }) => void): called on "Insert Image"
 * - multiple (boolean): allow multi-select (default: false)
 * - authToken (string): JWT for admin API calls
 */
export default function MediaLibraryModal({ isOpen, onClose, onSelect, multiple = false, authToken = '' }) {
  const effectiveToken = authToken || userStore.get()?.accessToken || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('tradelogix_user') || '{}')?.accessToken : '') || '';
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'library'
  const [library, setLibrary]     = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState(null);
  const [selected, setSelected]   = useState([]); // array of { id, url, filename }
  const [search, setSearch]       = useState('');

  // ── Uppy instance ────────────────────────────────────────────────────────
  const uppy = useMemo(() => {
    const instance = new Uppy({
      id: 'media-library-uppy',
      restrictions: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedFileTypes: ['image/*', '.pdf'],
      },
      autoProceed: true,
    });

    instance.use(XHRUpload, {
      endpoint: `${API_URL}/media/upload`,
      fieldName: 'file',
      headers: effectiveToken ? { Authorization: `Bearer ${effectiveToken}` } : {},
      formData: true,
    });

    return instance;
  }, [effectiveToken]);

  // Clean up Uppy on unmount
  useEffect(() => {
    return () => {
      uppy.cancelAll();
    };
  }, [uppy]);

  // When upload succeeds, switch to library tab and auto-select the file
  useEffect(() => {
    const handleSuccess = (file, response) => {
      const body = response.body;
      // Our API wraps in { success, data: { id, url, filename, ... } }
      const mediaData = body?.data?.data || body?.data || body;
      if (mediaData?.id && mediaData?.url) {
        const newMedia = {
          id: mediaData.id,
          url: mediaData.url,
          filename: mediaData.filename || file.name,
        };
        setSelected([newMedia]);
        // Refresh library and switch tab
        fetchLibrary();
        setActiveTab('library');
      }
    };

    uppy.on('upload-success', handleSuccess);
    return () => {
      uppy.off('upload-success', handleSuccess);
    };
  }, [uppy]);

  // ── Library fetch ────────────────────────────────────────────────────────
  const fetchLibrary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth(`${API_URL}/media?limit=100`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // API returns { success, data: { items, total, ... } }
      const items = json?.data?.items || json?.items || [];
      setLibrary(items);
    } catch (err) {
      setError(err.message);
      setLibrary([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch library when tab switches to 'library' or modal opens
  useEffect(() => {
    if (isOpen && activeTab === 'library') {
      fetchLibrary();
    }
  }, [isOpen, activeTab, fetchLibrary]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelected([]);
      setSearch('');
      setActiveTab('upload');
      uppy.cancelAll();
    }
  }, [isOpen, uppy]);

  // ── Selection handlers ───────────────────────────────────────────────────
  const toggleSelect = (item) => {
    if (multiple) {
      setSelected(prev => {
        const exists = prev.find(s => s.id === item.id);
        return exists ? prev.filter(s => s.id !== item.id) : [...prev, item];
      });
    } else {
      setSelected([item]);
    }
  };

  const isSelected = (id) => selected.some(s => s.id === id);

  const handleInsert = () => {
    if (selected.length === 0) return;
    if (multiple) {
      onSelect(selected);
    } else {
      onSelect(selected[0]);
    }
    onClose();
  };

  // ── Filtered library ─────────────────────────────────────────────────────
  const filtered = library.filter(item =>
    !search || item.filename?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Render ───────────────────────────────────────────────────────────────
  if (!isOpen) return null;

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden"
        style={{ animation: 'mediaModalIn 0.2s ease' }}
      >

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileImage className="w-5 h-5 text-brand-600" /> Media Library
            </h2>

            {/* Tab switcher */}
            <div className="flex bg-slate-200/60 rounded-lg p-0.5">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-3.5 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'upload'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Upload Files
              </button>
              <button
                onClick={() => setActiveTab('library')}
                className={`px-3.5 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'library'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" /> Media Library
              </button>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto min-h-0">

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="p-6">
              <Dashboard
                uppy={uppy}
                width="100%"
                height={350}
                proudlyDisplayPoweredByUppy={false}
                showProgressDetails={true}
                note="Images & PDFs up to 10 MB"
                theme="light"
              />
            </div>
          )}

          {/* Library Tab */}
          {activeTab === 'library' && (
            <div className="p-5 space-y-4">

              {/* Toolbar */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by filename…"
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 transition-all"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {filtered.length} file{filtered.length !== 1 ? 's' : ''}
                  </span>
                  <button onClick={fetchLibrary} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all" title="Refresh">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  Failed to load media: {error}
                </div>
              )}

              {/* Loading */}
              {isLoading ? (
                <div className="flex items-center justify-center py-16 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span className="text-xs font-semibold">Loading media…</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                  <span className="text-xs font-semibold">
                    {library.length === 0 ? 'No media uploaded yet.' : 'No results match your search.'}
                  </span>
                </div>
              ) : (
                /* Image grid */
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {filtered.map(item => {
                    const sel = isSelected(item.id);
                    const isImage = item.mimeType?.startsWith('image/');
                    const fullUrl = item.url?.startsWith('http') ? item.url : `${API_URL}${item.url}`;
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleSelect({ id: item.id, url: item.url, filename: item.filename })}
                        className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          sel
                            ? 'border-brand-500 ring-2 ring-brand-200 shadow-md'
                            : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        {isImage ? (
                          <img
                            src={fullUrl}
                            alt={item.filename}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center">
                            <FileImage className="w-8 h-8 text-slate-400" />
                            <span className="text-[9px] text-slate-400 mt-1 px-1 truncate max-w-full">{item.filename}</span>
                          </div>
                        )}

                        {/* Selection checkmark */}
                        {sel && (
                          <div className="absolute top-1.5 right-1.5 bg-brand-600 rounded-full p-0.5 shadow-lg">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                        )}

                        {/* Hover overlay with filename */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="text-[9px] text-white font-semibold truncate">{item.filename}</div>
                          <div className="text-[8px] text-white/70">{formatFileSize(item.fileSize)}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/60 shrink-0">
          <div className="text-[11px] text-slate-500">
            {selected.length > 0
              ? `${selected.length} file${selected.length > 1 ? 's' : ''} selected`
              : 'Select a file to insert'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              disabled={selected.length === 0}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selected.length > 0
                  ? 'bg-brand-600 text-white hover:opacity-90 shadow-sm'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Insert {multiple ? 'Images' : 'Image'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes mediaModalIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to   { opacity: 1; transform: scale(1)   translateY(0);     }
        }
      `}</style>
    </div>
  );
}
