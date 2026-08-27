import React, { useState, useEffect, useMemo } from 'react';
import Uppy from '@uppy/core';
import Dashboard from '@uppy/react/dashboard';
import XHRUpload from '@uppy/xhr-upload';
import { Upload, ArrowLeft, CheckCircle2, FileImage, ExternalLink } from 'lucide-react';
import { userStore } from '../../store/authStore.js';

// Uppy CSS
import '@uppy/core/css/style.min.css';
import '@uppy/dashboard/css/style.min.css';
import '../../styles/uppy-overrides.css';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000';

export default function MediaUploader() {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const getAuthToken = () => {
    return userStore.get()?.accessToken || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('tradelogix_user') || '{}')?.accessToken : '') || '';
  };

  const authToken = getAuthToken();

  // Uppy instance
  const uppy = useMemo(() => {
    const instance = new Uppy({
      id: 'media-page-uppy',
      restrictions: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedFileTypes: ['image/*', '.pdf'],
      },
      autoProceed: true,
    });

    instance.use(XHRUpload, {
      endpoint: `${API_URL}/media/upload`,
      fieldName: 'file',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      formData: true,
    });

    return instance;
  }, [authToken]);

  // Clean up Uppy
  useEffect(() => {
    return () => {
      uppy.cancelAll();
    };
  }, [uppy]);

  // Track uploaded files
  useEffect(() => {
    const handleSuccess = (file, response) => {
      const body = response.body;
      const mediaData = body?.data?.data || body?.data || body;
      if (mediaData) {
        const item = {
          id: mediaData.id,
          filename: mediaData.filename || file.name,
          url: mediaData.url?.startsWith('http') ? mediaData.url : `${API_URL}${mediaData.url}`,
          mimeType: mediaData.mimeType,
          fileSize: mediaData.fileSize,
        };
        setUploadedFiles(prev => [item, ...prev]);
      }
    };

    uppy.on('upload-success', handleSuccess);
    return () => {
      uppy.off('upload-success', handleSuccess);
    };
  }, [uppy]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <a
            href="/admin/media"
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors shadow-sm"
            title="Back to Media Library"
          >
            <ArrowLeft className="w-4 h-4" />
          </a>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-display">Upload New Media</h1>
            <p className="text-xs text-slate-400">Add media files to your library</p>
          </div>
        </div>

        <a
          href="/admin/media"
          className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
        >
          <FileImage className="w-3.5 h-3.5" /> View Media Library
        </a>
      </div>

      {/* Uploader Card */}
      <div className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <Dashboard
            uppy={uppy}
            width="100%"
            height={340}
            proudlyDisplayPoweredByUppy={false}
            showProgressDetails={true}
            note="Images & PDFs up to 10 MB"
            theme="light"
          />
        </div>

        {/* Uploaded items in current session */}
        {uploadedFiles.length > 0 && (
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Uploaded in this session ({uploadedFiles.length})</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {uploadedFiles.map((f, i) => (
                <div key={i} className="border border-slate-200 rounded-xl p-2.5 bg-slate-50 flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0">
                    <img src={f.url} alt={f.filename} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-800 truncate">{f.filename}</div>
                    <a
                      href="/admin/media"
                      className="text-[10px] text-blue-600 hover:underline font-semibold flex items-center gap-0.5"
                    >
                      View in library <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
