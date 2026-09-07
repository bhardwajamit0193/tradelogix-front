import React, { useState, useEffect } from 'react';
import {
  Building2,
  Mail,
  Phone,
  FileText,
  Sliders,
  Save,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  ShieldCheck,
  Server,
  Key,
  Globe,
  MapPin,
  RefreshCw,
  Sparkles,
  Lock,
  Layers,
  HelpCircle,
  Eye,
  EyeOff,
  FolderOpen,
  Link as LinkIcon,
  Trash2,
  ExternalLink,
  Receipt,
  Check,
  Send,
  Info,
  Hash,
  Coins,
  Warehouse,
  ShieldAlert,
  ArrowUpRight,
  Bell,
  Users,
  Code2,
  FileCode2,
  Monitor,
  Smartphone,
  RotateCcw,
  Sparkle,
  Copy,
  CheckCheck,
  ChevronRight,
  SlidersHorizontal,
  FileCheck,
  Tag,
  Plus,
  Trash,
  Compass,
  LayoutTemplate,
} from 'lucide-react';
import PhoneInputField from './PhoneInputField.jsx';
import MediaLibraryModal from './MediaLibraryModal.jsx';
import { userStore } from '../../store/authStore.js';
import {
  fetchPlatformSettingsApi,
  savePlatformSettingsApi,
  fetchFooterSettingsApi,
  saveFooterSettingsApi,
  fetchSmtpSettingsApi,
  saveSmtpSettingsApi,
  sendTestSmtpEmailApi,
  fetchEmailTemplatesApi,
  saveEmailTemplateApi,
  resetEmailTemplateApi,
  DEFAULT_PLATFORM_SETTINGS,
  DEFAULT_FOOTER_SETTINGS,
  DEFAULT_SMTP_SETTINGS,
  DEFAULT_EMAIL_TEMPLATES,
} from '../../services/platformSettingsService.js';

export default function AdminSettingsView({ initialSection = 'platform' }) {
  // Active Section State: 'platform' | 'footer' | 'smtp' | 'templates'
  const [activeSection, setActiveSection] = useState(initialSection);

  // Platform Form State
  const [platformData, setPlatformData] = useState(DEFAULT_PLATFORM_SETTINGS);
  const [logoPreviewError, setLogoPreviewError] = useState(false);
  const [faviconPreviewError, setFaviconPreviewError] = useState(false);
  const [mediaModalTarget, setMediaModalTarget] = useState('logo'); // 'logo' | 'favicon'
  const [showMediaModal, setShowMediaModal] = useState(false);

  // Footer Form State
  const [footerData, setFooterData] = useState(DEFAULT_FOOTER_SETTINGS);
  const [showFooterMediaModal, setShowFooterMediaModal] = useState(false);

  // SMTP Form State
  const [smtpData, setSmtpData] = useState(DEFAULT_SMTP_SETTINGS);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState('admin@tradelogix.in');
  const [testEmailResult, setTestEmailResult] = useState(null);

  // Email Templates State
  const [templates, setTemplates] = useState(DEFAULT_EMAIL_TEMPLATES);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('order_confirmation');
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateFilter, setTemplateFilter] = useState('all'); // 'all' | 'customer' | 'admin' | 'auth'
  const [previewMode, setPreviewMode] = useState('desktop'); // 'desktop' | 'mobile' | 'code'
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [copiedVar, setCopiedVar] = useState(null);

  // Global State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  // Detect section from URL query or path
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.includes('/smtp')) {
        setActiveSection('smtp');
      } else if (pathname.includes('/templates') || pathname.includes('/email-templates')) {
        setActiveSection('templates');
      } else if (pathname.includes('/footer')) {
        setActiveSection('footer');
      } else if (pathname.includes('/platform')) {
        setActiveSection('platform');
      }
    }
  }, []);

  // Sync tab switch with browser history
  const switchSection = (section) => {
    setActiveSection(section);
    if (typeof window !== 'undefined') {
      let targetUrl = '/admin/settings/platform';
      if (section === 'footer') targetUrl = '/admin/settings/footer';
      if (section === 'smtp') targetUrl = '/admin/settings/smtp';
      if (section === 'templates') targetUrl = '/admin/settings/templates';
      window.history.pushState(null, '', targetUrl);
    }
  };

  // Load initial settings from Database API
  useEffect(() => {
    async function loadAllSettings() {
      setLoading(true);
      try {
        const [platformRes, footerRes, smtpRes, templatesRes] = await Promise.all([
          fetchPlatformSettingsApi(),
          fetchFooterSettingsApi(),
          fetchSmtpSettingsApi(),
          fetchEmailTemplatesApi(),
        ]);
        if (platformRes) setPlatformData(platformRes.data || platformRes);
        if (footerRes) {
          const unwrapped = footerRes.data || footerRes;
          let parsedCols = unwrapped.columns;
          if (typeof parsedCols === 'string') {
            try { parsedCols = JSON.parse(parsedCols); } catch (e) { parsedCols = []; }
          }
          setFooterData({
            ...unwrapped,
            columns: Array.isArray(parsedCols) ? parsedCols : (DEFAULT_FOOTER_SETTINGS.columns || []),
          });
        }
        if (smtpRes) setSmtpData(smtpRes.data || smtpRes);
        if (templatesRes && templatesRes.length > 0) {
          setTemplates(templatesRes);
          const initial = templatesRes.find((t) => t.templateKey === selectedTemplateKey) || templatesRes[0];
          if (initial) setEditingTemplate({ ...initial });
        }
      } catch (err) {
        console.error('Error loading settings from DB', err);
      } finally {
        setLoading(false);
      }
    }
    loadAllSettings();
  }, []);

  // When selectedTemplateKey changes, update editingTemplate
  useEffect(() => {
    const found = templates.find((t) => t.templateKey === selectedTemplateKey);
    if (found) {
      setEditingTemplate({ ...found });
    }
  }, [selectedTemplateKey, templates]);

  // Toast notification trigger
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Handle Platform Form Submit
  const handleSavePlatform = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await savePlatformSettingsApi(platformData);
      showToast('success', 'Platform & Company Profile settings saved to database! Invoices and documents will now use these updated details.');
    } catch (err) {
      showToast('error', err.message || 'Failed to save platform settings.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Footer Form Submit
  const handleSaveFooter = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await saveFooterSettingsApi(footerData);
      showToast('success', 'Footer settings & navigation links saved to database! The storefront footer is now updated.');
    } catch (err) {
      showToast('error', err.message || 'Failed to save footer settings.');
    } finally {
      setSaving(false);
    }
  };

  // Footer Column & Link Helpers
  const handleAddFooterColumn = () => {
    setFooterData((prev) => ({
      ...prev,
      columns: [...(prev.columns || []), { title: 'New Column', links: [{ label: 'New Link', url: '/shop' }] }],
    }));
  };

  const handleDeleteFooterColumn = (colIdx) => {
    setFooterData((prev) => ({
      ...prev,
      columns: (prev.columns || []).filter((_, idx) => idx !== colIdx),
    }));
  };

  const handleUpdateFooterColumnTitle = (colIdx, title) => {
    setFooterData((prev) => {
      const updated = [...(prev.columns || [])];
      updated[colIdx] = { ...updated[colIdx], title };
      return { ...prev, columns: updated };
    });
  };

  const handleAddFooterLink = (colIdx) => {
    setFooterData((prev) => {
      const updated = [...(prev.columns || [])];
      const links = [...(updated[colIdx].links || []), { label: 'New Link', url: '/shop' }];
      updated[colIdx] = { ...updated[colIdx], links };
      return { ...prev, columns: updated };
    });
  };

  const handleDeleteFooterLink = (colIdx, linkIdx) => {
    setFooterData((prev) => {
      const updated = [...(prev.columns || [])];
      const links = updated[colIdx].links.filter((_, idx) => idx !== linkIdx);
      updated[colIdx] = { ...updated[colIdx], links };
      return { ...prev, columns: updated };
    });
  };

  const handleUpdateFooterLink = (colIdx, linkIdx, field, val) => {
    setFooterData((prev) => {
      const updated = [...(prev.columns || [])];
      const links = [...updated[colIdx].links];
      links[linkIdx] = { ...links[linkIdx], [field]: val };
      updated[colIdx] = { ...updated[colIdx], links };
      return { ...prev, columns: updated };
    });
  };

  const handleResetFooterDefaults = () => {
    if (window.confirm('Reset footer settings and navigation columns back to initial defaults?')) {
      setFooterData({ ...DEFAULT_FOOTER_SETTINGS });
      showToast('success', 'Reset footer settings to defaults. Click "Save Footer Settings" to apply.');
    }
  };

  // Handle SMTP Form Submit
  const handleSaveSmtp = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await saveSmtpSettingsApi(smtpData);
      showToast('success', 'SMTP Gateway & Admin Email routing settings saved to database successfully!');
    } catch (err) {
      showToast('error', err.message || 'Failed to save SMTP settings.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Email Template Save
  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    setSavingTemplate(true);
    try {
      await saveEmailTemplateApi(editingTemplate.templateKey, editingTemplate);
      setTemplates((prev) =>
        prev.map((t) => (t.templateKey === editingTemplate.templateKey ? { ...editingTemplate } : t))
      );
      showToast('success', `Email template "${editingTemplate.name}" saved successfully!`);
    } catch (err) {
      showToast('error', err.message || 'Failed to save email template.');
    } finally {
      setSavingTemplate(false);
    }
  };

  // Handle Template Reset to Default
  const handleResetTemplate = async (templateKey) => {
    if (!confirm('Are you sure you want to revert this template to default factory settings?')) return;
    try {
      await resetEmailTemplateApi(templateKey);
      const defaultTpl = DEFAULT_EMAIL_TEMPLATES.find((t) => t.templateKey === templateKey);
      if (defaultTpl) {
        setEditingTemplate({ ...defaultTpl });
        setTemplates((prev) =>
          prev.map((t) => (t.templateKey === templateKey ? { ...defaultTpl } : t))
        );
      }
      showToast('success', 'Template reverted to factory default.');
    } catch (err) {
      showToast('error', 'Failed to reset template.');
    }
  };

  // Handle Media selection from Media Library (Logo or Favicon)
  const handleMediaSelect = (media) => {
    const API_URL = import.meta.env.PUBLIC_API_URL || (typeof window !== 'undefined' && window.__PUBLIC_API_URL__) || 'http://localhost:6543';
    const fullUrl = media.url?.startsWith('http') ? media.url : `${API_URL}${media.url}`;
    if (mediaModalTarget === 'favicon') {
      setPlatformData((prev) => ({ ...prev, favicon: fullUrl }));
      setFaviconPreviewError(false);
      showToast('success', 'Favicon selected from Media Library. Remember to click "Save Changes"!');
    } else {
      setPlatformData((prev) => ({ ...prev, companyLogo: fullUrl }));
      setLogoPreviewError(false);
      showToast('success', 'Company logo selected from Media Library. Remember to click "Save Changes"!');
    }
    setShowMediaModal(false);
  };

  // Live Test SMTP connection & deliver test email
  const handleTestSmtpConnection = async (e) => {
    if (e) e.preventDefault();
    const target = (testEmailInput || '').trim();
    if (!target || !target.includes('@')) {
      showToast('error', 'Please enter a valid recipient email address for testing.');
      return;
    }
    if (!smtpData.host) {
      showToast('error', 'Please fill in SMTP Host before running diagnostic.');
      return;
    }
    setTestingSmtp(true);
    setTestEmailResult(null);
    try {
      const res = await sendTestSmtpEmailApi(target, smtpData);
      setTestEmailResult({
        success: true,
        message: res.message || `Test email dispatched successfully to ${target}!`,
      });
      showToast('success', `Test email sent to ${target}! Check your inbox.`);
    } catch (err) {
      setTestEmailResult({
        success: false,
        message: err.message || 'SMTP Connection / Authentication failed. Check host, port, and credentials.',
      });
      showToast('error', `SMTP Test Error: ${err.message}`);
    } finally {
      setTestingSmtp(false);
    }
  };

  // Copy variable tag to clipboard
  const copyVariableTag = (varName) => {
    const tag = `{${varName}}`;
    navigator.clipboard.writeText(tag);
    setCopiedVar(varName);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  // Insert variable into subject or body
  const insertVariableIntoTemplate = (varName) => {
    if (!editingTemplate) return;
    const tag = `{${varName}}`;
    setEditingTemplate((prev) => ({
      ...prev,
      bodyHtml: (prev.bodyHtml || '') + ` ${tag} `,
    }));
    showToast('success', `Inserted ${tag} into template body`);
  };

  // Generate Rendered HTML Preview with Sample Dummy Data
  const getRenderedPreviewHtml = (htmlContent) => {
    if (!htmlContent) return '<p>No content</p>';
    const dummyReplacements = {
      '{customerName}': 'TechVision Enterprises LLP',
      '{orderId}': 'TLX-ORD-2026-8941',
      '{invoiceNumber}': 'TLX-INV-20261',
      '{orderDate}': '05 Sep 2026',
      '{totalAmount}': '₹86,098.70',
      '{paymentMethod}': 'Offline Bank Transfer (NEFT)',
      '{shippingState}': 'Maharashtra (400710)',
      '{shippingCity}': 'Navi Mumbai',
      '{carrierName}': 'TradeLogix Express Air Cargo',
      '{trackingNumber}': 'TLX-EXP-98201948201',
      '{utrNumber}': 'CMS98201948201',
      '{gstin}': '27AABCT3518Q1ZK',
      '{adminOrderUrl}': 'http://localhost:4321/admin/orders',
      '{otpCode}': '849201',
      '{companyName}': platformData.companyName || 'TradeLogix Solutions Private Limited',
      '{estimatedDispatch}': '07 Sep 2026 (Within 48 Hours)',
      '{deliveredDate}': '08 Sep 2026, 03:45 PM',
      '{shippingAddress}': 'Plot C-14, TTC Industrial Area, MIDC Pawane, Navi Mumbai, Maharashtra 400705',
      '{cancelReason}': 'Requested by Buyer Desk due to project timeline rescheduling',
      '{refundStatus}': 'Refund Initiated (Settlement credited in 2-3 business days)',
      '{supportEmail}': platformData.supportEmail || 'support@tradelogix.in',
      '{productName}': 'Industrial Sensor Unit Pro V2',
      '{productSku}': 'TLX-SNS-001',
      '{currentStock}': '12',
      '{threshold}': '25',
      '{inventoryUrl}': 'http://localhost:4321/admin/inventory',
    };

    let rendered = htmlContent;
    Object.entries(dummyReplacements).forEach(([key, val]) => {
      rendered = rendered.replaceAll(key, val);
    });
    return rendered;
  };

  const filteredTemplates = templates.filter((t) => {
    if (templateFilter === 'all') return true;
    return t.category === templateFilter;
  });

  return (
    <div className="w-full space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Alert Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border transition-all animate-bounceIn ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-emerald-500/50 shadow-emerald-500/10'
              : 'bg-rose-950 text-white border-rose-500/50 shadow-rose-500/10'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Top Header & Tab Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200/70 w-full md:w-auto">
          <button
            type="button"
            onClick={() => switchSection('platform')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeSection === 'platform'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Building2 className={`w-4 h-4 ${activeSection === 'platform' ? 'text-brand-600' : 'text-slate-500'}`} />
            <span>Platform & Company</span>
          </button>

          <button
            type="button"
            onClick={() => switchSection('footer')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeSection === 'footer'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className={`w-4 h-4 ${activeSection === 'footer' ? 'text-brand-600' : 'text-slate-500'}`} />
            <span>Footer & Navigation</span>
          </button>

          <button
            type="button"
            onClick={() => switchSection('smtp')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeSection === 'smtp'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Server className={`w-4 h-4 ${activeSection === 'smtp' ? 'text-brand-600' : 'text-slate-500'}`} />
            <span>SMTP Relay & Admin Emails</span>
          </button>

          <button
            type="button"
            onClick={() => switchSection('templates')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeSection === 'templates'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Mail className={`w-4 h-4 ${activeSection === 'templates' ? 'text-brand-600' : 'text-slate-500'}`} />
            <span>Email Templates</span>
            <span className="ml-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
              {templates.length}
            </span>
          </button>
        </div>

        {/* Quick Links & Status Actions */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <a
            href="/admin/orders"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs"
            title="Open Orders to test live Invoice PDF generation"
          >
            <Receipt className="w-3.5 h-3.5 text-brand-600" />
            <span>View Invoices & Orders</span>
            <ArrowUpRight className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 lg:p-10 relative">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-3">
            <div className="w-9 h-9 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-semibold">Retrieving system configuration from database...</p>
          </div>
        ) : (
          <>
            {/* ========================================================================= */}
            {/* SECTION 1: PLATFORM & COMPANY SETTINGS                                    */}
            {/* ========================================================================= */}
            {activeSection === 'platform' && (
              <div className="space-y-8 animate-fadeIn">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-brand-50 border border-brand-200 text-brand-700">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight">
                        Platform & Company Settings
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 max-w-2xl">
                      Configure your company profile, legal entity parameters, official logo, registered address, GSTIN, and tax compliance details used across <strong>tax invoices, customer order receipts, and storefront documents</strong>.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live in Invoice PDF
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSavePlatform} className="space-y-8">
                  {/* CARD 1: OFFICIAL COMPANY LOGO & FAVICON */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 1A: Company Logo */}
                    <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-200 space-y-5 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <ImageIcon className="w-4 h-4 text-brand-600" /> Official Company Logo
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Rendered on GST Invoices, order slips & emails.
                            </p>
                          </div>

                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold self-start sm:self-auto">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Invoice Header
                          </span>
                        </div>

                        {/* Logo Preview Canvas Box */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center relative group min-h-[120px]">
                          {platformData.companyLogo && !logoPreviewError ? (
                            <div className="space-y-2 flex flex-col items-center justify-center w-full py-1">
                              <img
                                src={platformData.companyLogo}
                                alt="Company Logo Preview"
                                className="max-h-16 max-w-full object-contain drop-shadow-2xs rounded transition-all"
                                onError={() => setLogoPreviewError(true)}
                              />
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                Active Invoice Logo
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-400 space-y-1.5 py-3">
                              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                                <ImageIcon className="w-5 h-5 text-slate-400" />
                              </div>
                              <span className="text-xs font-bold text-slate-600">No Logo Selected</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action & Specifications */}
                      <div className="space-y-3 pt-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setMediaModalTarget('logo');
                              setShowMediaModal(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>{platformData.companyLogo ? 'Change Logo' : 'Select Logo'}</span>
                          </button>

                          {platformData.companyLogo && (
                            <button
                              type="button"
                              onClick={() => {
                                setPlatformData({ ...platformData, companyLogo: '' });
                                setLogoPreviewError(false);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                          <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 font-mono">PNG / SVG / JPEG</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 font-mono">Min 400×120px</span>
                        </div>
                      </div>
                    </div>

                    {/* 1B: Website Favicon */}
                    <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-200 space-y-5 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <Globe className="w-4 h-4 text-brand-600" /> Website Favicon & Tab Icon
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Browser tab icon, bookmark badge & search snippet icon.
                            </p>
                          </div>

                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold self-start sm:self-auto">
                            <Sparkles className="w-3 h-3 text-blue-500" />
                            Browser Tab Asset
                          </span>
                        </div>

                        {/* Favicon Preview & Simulated Browser Tab */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 min-h-[120px] flex flex-col justify-center">
                          {/* Chrome/Safari Browser Tab Simulation Mockup */}
                          <div className="bg-slate-100 rounded-xl p-2 border border-slate-200/80">
                            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-slate-200 shadow-2xs max-w-xs">
                              {platformData.favicon && !faviconPreviewError ? (
                                <img
                                  src={platformData.favicon}
                                  alt="Favicon"
                                  className="w-4 h-4 object-contain shrink-0"
                                  onError={() => setFaviconPreviewError(true)}
                                />
                              ) : (
                                <div className="w-4 h-4 rounded bg-brand-600 flex items-center justify-center text-[9px] text-white font-bold shrink-0">
                                  T
                                </div>
                              )}
                              <span className="text-[11px] font-semibold text-slate-700 truncate">
                                {platformData.companyName || 'TradeLogix'} — Wholesale Portal
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold ml-auto shrink-0">×</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-center gap-4 pt-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 font-medium">16×16:</span>
                              <div className="w-5 h-5 rounded border border-slate-200 p-0.5 bg-slate-50 flex items-center justify-center">
                                <img
                                  src={platformData.favicon || '/favicon.svg'}
                                  alt="16px"
                                  className="w-3.5 h-3.5 object-contain"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 font-medium">32×32:</span>
                              <div className="w-7 h-7 rounded border border-slate-200 p-0.5 bg-slate-50 flex items-center justify-center">
                                <img
                                  src={platformData.favicon || '/favicon.svg'}
                                  alt="32px"
                                  className="w-5 h-5 object-contain"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 font-medium">64×64:</span>
                              <div className="w-9 h-9 rounded border border-slate-200 p-1 bg-slate-50 flex items-center justify-center">
                                <img
                                  src={platformData.favicon || '/favicon.svg'}
                                  alt="64px"
                                  className="w-6 h-6 object-contain"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action & Specifications */}
                      <div className="space-y-3 pt-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setMediaModalTarget('favicon');
                              setShowMediaModal(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>{platformData.favicon && platformData.favicon !== '/favicon.svg' ? 'Change Favicon' : 'Select Favicon'}</span>
                          </button>

                          {platformData.favicon && platformData.favicon !== '/favicon.svg' && (
                            <button
                              type="button"
                              onClick={() => {
                                setPlatformData({ ...platformData, favicon: '/favicon.svg' });
                                setFaviconPreviewError(false);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-200/70 hover:bg-slate-300/80 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reset Default</span>
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                          <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 font-mono">Square 1:1 Aspect</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 font-mono">PNG / ICO / SVG</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 font-mono">32×32 or 64×64 px</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: LEGAL ENTITY IDENTITY & OFFICIAL CONTACT */}
                  <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-brand-600" /> Legal Entity & Official Contacts
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-400">Used as primary seller details</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Legal Company Name */}
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-brand-600" /> Registered Company Legal Entity Name
                        </label>
                        <input
                          type="text"
                          value={platformData.companyName || ''}
                          onChange={(e) => setPlatformData({ ...platformData, companyName: e.target.value })}
                          placeholder="TradeLogix Solutions Private Limited"
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-bold focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-2xs"
                        />
                        <p className="text-[11px] text-slate-400">
                          This legal name will appear on the title header of all tax invoices and contracts.
                        </p>
                      </div>

                      {/* Official Phone Number (Using react-phone-input-2) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-brand-600" /> Official Corporate Phone Number
                        </label>
                        <PhoneInputField
                          country={'in'}
                          value={platformData.companyPhone || ''}
                          placeholder="98201 45892"
                          onChange={(phone) => setPlatformData({ ...platformData, companyPhone: phone })}
                          inputClass="!w-full !h-10 !text-xs !bg-white !rounded-xl !border-slate-300 focus:!border-brand-500 font-semibold !text-slate-900 shadow-none"
                          buttonClass="!bg-slate-50 !border-slate-300 !rounded-l-xl"
                          containerClass="!w-full"
                        />
                        <p className="text-[11px] text-slate-400">Printed on invoice header for billing inquiries.</p>
                      </div>

                      {/* Official Billing Email */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-brand-600" /> Accounts & Billing Email Address
                        </label>
                        <input
                          type="email"
                          value={platformData.companyEmail || ''}
                          onChange={(e) => setPlatformData({ ...platformData, companyEmail: e.target.value })}
                          placeholder="accounts@tradelogix.in"
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-2xs"
                        />
                        <p className="text-[11px] text-slate-400">Receives billing notifications and inquiries.</p>
                      </div>

                      {/* Customer Support Email */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-brand-600" /> Customer Support Email
                        </label>
                        <input
                          type="email"
                          value={platformData.supportEmail || ''}
                          onChange={(e) => setPlatformData({ ...platformData, supportEmail: e.target.value })}
                          placeholder="support@tradelogix.in"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-2xs"
                        />
                      </div>

                      {/* Website URL */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-brand-600" /> Official Website URL
                        </label>
                        <input
                          type="url"
                          value={platformData.websiteUrl || ''}
                          onChange={(e) => setPlatformData({ ...platformData, websiteUrl: e.target.value })}
                          placeholder="https://tradelogix.in"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CARD 3: TAX & STATUTORY REGISTRATIONS (GSTIN, PAN, CIN) */}
                  <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-200 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <FileText className="w-4 h-4 text-brand-600" /> Tax Compliance & Statutory Registrations
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Required for 100% compliant Indian GST Input Tax Credit (ITC) invoices.
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 border border-brand-200 text-[10px] font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" /> GST Compliant
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {/* GST Number */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                          <span>GST Number (GSTIN)</span>
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={platformData.gstin || ''}
                          onChange={(e) => setPlatformData({ ...platformData, gstin: e.target.value.toUpperCase().trim() })}
                          placeholder="27AAACT9921M1ZT"
                          maxLength={15}
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-mono font-bold uppercase tracking-widest focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-2xs"
                        />
                        <p className="text-[10px] text-slate-400">15-digit alphanumeric GST registration</p>
                      </div>

                      {/* PAN Number */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                          <span>PAN Number</span>
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={platformData.panNumber || ''}
                          onChange={(e) => setPlatformData({ ...platformData, panNumber: e.target.value.toUpperCase().trim() })}
                          placeholder="AAACT9921M"
                          maxLength={10}
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-mono font-bold uppercase tracking-widest focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-2xs"
                        />
                        <p className="text-[10px] text-slate-400">10-digit Permanent Account Number</p>
                      </div>

                      {/* CIN Number */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          Corporate Identity (CIN)
                        </label>
                        <input
                          type="text"
                          value={platformData.cinNumber || ''}
                          onChange={(e) => setPlatformData({ ...platformData, cinNumber: e.target.value.toUpperCase().trim() })}
                          placeholder="U72900MH2024PTC123456"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-mono font-bold uppercase tracking-widest focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-2xs"
                        />
                        <p className="text-[10px] text-slate-400">Ministry of Corporate Affairs CIN</p>
                      </div>
                    </div>
                  </div>

                  {/* CARD 4: REGISTERED CORPORATE ADDRESS */}
                  <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-brand-600" /> Registered Corporate Address
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Official registered office address appearing on tax invoices, bill headers, and legal documentation.
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">Printed on invoice header</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-600" /> Complete Office Address (Line by Line)
                      </label>
                      <textarea
                        rows={4}
                        value={platformData.companyAddress || ''}
                        onChange={(e) => setPlatformData({ ...platformData, companyAddress: e.target.value })}
                        placeholder={"804, Prime Corporate Park,\nMarol, Andheri East,\nMumbai,\nMaharashtra - 400059"}
                        required
                        className="w-full p-4 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none leading-relaxed shadow-2xs font-sans"
                      />
                      <p className="text-[11px] text-slate-400">
                        Include Building No / Suite, Street / Industrial Area, City, and State with PIN Code.
                      </p>
                    </div>
                  </div>

                  {/* BOTTOM ACTION BAR */}
                  <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Changes take effect immediately across all live Invoices & PDF downloads.</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        type="submit"
                        disabled={saving}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-display font-bold text-xs shadow-md shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:ring-brand-500/30 outline-none"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save Platform Settings</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SECTION: FOOTER & NAVIGATION SETTINGS                                     */}
            {/* ========================================================================= */}
            {activeSection === 'footer' && (
              <div className="space-y-8 animate-fadeIn">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700">
                        <Layers className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight">
                        Storefront Footer & Dynamic Navigation
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 max-w-2xl">
                      Customize your storefront footer branding, navigation link columns, support channels, social media handles, and compliance copyright text displayed to all buyers.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active on Storefront
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSaveFooter} className="space-y-8">
                  {/* CARD 1: BRAND IDENTITY & DESCRIPTION */}
                  <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-600" /> Footer Brand & Description
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Brand name, footer logo, and introduction blurb shown in the left column.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          Footer Brand Display Name
                        </label>
                        <input
                          type="text"
                          value={footerData.brandName || ''}
                          onChange={(e) => setFooterData({ ...footerData, brandName: e.target.value })}
                          placeholder="TradeLogix Wholesale"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                            Footer Logo URL
                          </label>
                          {platformData.companyLogo && (
                            <button
                              type="button"
                              onClick={() => setFooterData({ ...footerData, brandLogo: platformData.companyLogo })}
                              className="text-[11px] font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 hover:underline cursor-pointer"
                              title="Set Footer Logo to the Official Company Logo from Platform Settings"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Use Official Company Logo</span>
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={footerData.brandLogo || ''}
                            onChange={(e) => setFooterData({ ...footerData, brandLogo: e.target.value })}
                            placeholder="/logo.jpeg or https://..."
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-mono focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={() => setShowFooterMediaModal(true)}
                            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all shrink-0 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
                            <span>Media</span>
                          </button>
                          {footerData.brandLogo && (
                            <button
                              type="button"
                              onClick={() => setFooterData({ ...footerData, brandLogo: '' })}
                              className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all shrink-0"
                              title="Clear Footer Logo (Shows text brand name instead)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        {footerData.brandLogo && (
                          <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                            <span className="text-slate-400">Preview:</span>
                            <img
                              src={footerData.brandLogo}
                              alt="Logo preview"
                              className="h-6 w-auto object-contain rounded bg-slate-800 p-0.5"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Brand Bio / Tagline Description
                      </label>
                      <textarea
                        rows={2}
                        value={footerData.brandDescription || ''}
                        onChange={(e) => setFooterData({ ...footerData, brandDescription: e.target.value })}
                        placeholder="Empowering global B2B & retail commerce with scalable hardware solutions and verified OEM partnerships."
                        className="w-full p-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* CARD 2: CONTACT INFORMATION & OPERATING HOURS */}
                  <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <Mail className="w-4 h-4 text-brand-600" /> Helpdesk & Support Channels
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Support email, helpline phone, physical office address, and working hours.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          Support & Inquiry Email
                        </label>
                        <input
                          type="email"
                          value={footerData.supportEmail || ''}
                          onChange={(e) => setFooterData({ ...footerData, supportEmail: e.target.value })}
                          placeholder="sales@tradelogix.in"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          Helpline Phone Number
                        </label>
                        <PhoneInputField
                          value={footerData.supportPhone || ''}
                          onChange={(val) => setFooterData({ ...footerData, supportPhone: val })}
                          placeholder="98201 45892"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          Registered Office / Dock Address
                        </label>
                        <input
                          type="text"
                          value={footerData.supportAddress || ''}
                          onChange={(e) => setFooterData({ ...footerData, supportAddress: e.target.value })}
                          placeholder="804, Prime Corporate Park, Marol, Andheri East, Mumbai - 400059"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          Operating & Support Working Hours
                        </label>
                        <input
                          type="text"
                          value={footerData.workingHours || ''}
                          onChange={(e) => setFooterData({ ...footerData, workingHours: e.target.value })}
                          placeholder="Mon - Sat: 9:30 AM - 6:30 PM IST"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CARD 3: NAVIGATION COLUMNS & QUICK LINKS BUILDER */}
                  <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <Compass className="w-4 h-4 text-indigo-600" /> Navigation Link Columns
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Organize footer links into categories, product shortcuts, company links, and legal policies.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddFooterColumn}
                        className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Column</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {(footerData.columns || []).map((col, colIdx) => (
                        <div
                          key={colIdx}
                          className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3.5 flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Column {colIdx + 1}
                              </span>
                              {(footerData.columns || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFooterColumn(colIdx)}
                                  className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded-lg transition-all"
                                  title="Delete this column"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                                Column Heading
                              </label>
                              <input
                                type="text"
                                value={col.title || ''}
                                onChange={(e) => handleUpdateFooterColumnTitle(colIdx, e.target.value)}
                                placeholder="Quick Links / Categories"
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-2xs"
                              />
                            </div>

                            {/* Links in this column */}
                            <div className="space-y-2 pt-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Links ({col.links?.length || 0})
                              </label>

                              {(col.links || []).map((link, linkIdx) => (
                                <div key={linkIdx} className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={link.label || ''}
                                    onChange={(e) => handleUpdateFooterLink(colIdx, linkIdx, 'label', e.target.value)}
                                    placeholder="Label"
                                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                                  />
                                  <input
                                    type="text"
                                    value={link.url || ''}
                                    onChange={(e) => handleUpdateFooterLink(colIdx, linkIdx, 'url', e.target.value)}
                                    placeholder="/shop or URL"
                                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteFooterLink(colIdx, linkIdx)}
                                    className="text-slate-400 hover:text-rose-600 p-1 hover:bg-slate-200 rounded-md transition-all shrink-0"
                                    title="Remove link"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddFooterLink(colIdx)}
                            className="w-full py-2 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200 hover:border-indigo-200 text-xs font-bold transition-all inline-flex items-center justify-center gap-1 shadow-2xs mt-2"
                          >
                            <Plus className="w-3 h-3" /> Add Link
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CARD 4: SOCIAL MEDIA HANDLES */}
                  <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <Globe className="w-4 h-4 text-sky-600" /> Social Media Profiles
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Links to official social channels displayed as icons under the footer brand logo.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          Facebook Profile / Page
                        </label>
                        <input
                          type="url"
                          value={footerData.facebookUrl || ''}
                          onChange={(e) => setFooterData({ ...footerData, facebookUrl: e.target.value })}
                          placeholder="https://facebook.com/tradelogix"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-mono focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          X (Twitter) Profile
                        </label>
                        <input
                          type="url"
                          value={footerData.twitterUrl || ''}
                          onChange={(e) => setFooterData({ ...footerData, twitterUrl: e.target.value })}
                          placeholder="https://twitter.com/tradelogix"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-mono focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          Instagram Profile
                        </label>
                        <input
                          type="url"
                          value={footerData.instagramUrl || ''}
                          onChange={(e) => setFooterData({ ...footerData, instagramUrl: e.target.value })}
                          placeholder="https://instagram.com/tradelogix"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-mono focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          LinkedIn Company Page
                        </label>
                        <input
                          type="url"
                          value={footerData.linkedinUrl || ''}
                          onChange={(e) => setFooterData({ ...footerData, linkedinUrl: e.target.value })}
                          placeholder="https://linkedin.com/company/tradelogix"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-mono focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          YouTube Channel
                        </label>
                        <input
                          type="url"
                          value={footerData.youtubeUrl || ''}
                          onChange={(e) => setFooterData({ ...footerData, youtubeUrl: e.target.value })}
                          placeholder="https://youtube.com/@tradelogix"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-mono focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CARD 5: COPYRIGHT & LEGAL NOTICES */}
                  <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-600" /> Copyright & Compliance Bar
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Bottom copyright notice and certification / trust highlights.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          Copyright Statement (Use <code className="font-mono text-brand-600">{`{year}`}</code> for auto-year)
                        </label>
                        <input
                          type="text"
                          value={footerData.copyrightText || ''}
                          onChange={(e) => setFooterData({ ...footerData, copyrightText: e.target.value })}
                          placeholder="© {year} TradeLogix Wholesale Commerce. All rights reserved."
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          Certifications / Trust Tagline
                        </label>
                        <input
                          type="text"
                          value={footerData.bottomNotice || ''}
                          onChange={(e) => setFooterData({ ...footerData, bottomNotice: e.target.value })}
                          placeholder="ISO 9001:2015 Certified • GST Registered • 256-bit SSL Encrypted"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CARD 6: LIVE INTERACTIVE FOOTER PREVIEW */}
                  <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Eye className="w-4 h-4 text-brand-600" /> Live Storefront Footer Preview
                      </h3>
                      <span className="text-[11px] font-bold text-slate-400">Updates live as you type (Empty fields are hidden)</span>
                    </div>

                    <div className="rounded-2xl bg-slate-900 text-slate-300 p-6 sm:p-8 space-y-8 border border-slate-800">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-xs">
                        {/* Brand Column */}
                        {(footerData.brandLogo || footerData.brandName || footerData.brandDescription || footerData.facebookUrl || footerData.twitterUrl || footerData.instagramUrl || footerData.linkedinUrl || footerData.youtubeUrl) && (
                          <div className="space-y-3 pr-2">
                            <div className="flex items-center gap-2">
                              {footerData.brandLogo && footerData.brandLogo.trim() !== '' ? (
                                <img
                                  src={
                                    footerData.brandLogo.startsWith('http')
                                      ? footerData.brandLogo
                                      : `http://localhost:6543${footerData.brandLogo.startsWith('/') ? '' : '/'}${footerData.brandLogo}`
                                  }
                                  alt="Logo"
                                  className="h-10 w-auto object-contain rounded-lg brightness-110"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              ) : footerData.brandName && footerData.brandName.trim() !== '' ? (
                                <span className="text-base font-bold text-white">{footerData.brandName}</span>
                              ) : null}
                            </div>
                            {footerData.brandDescription && footerData.brandDescription.trim() !== '' && (
                              <p className="text-[11px] text-slate-400 leading-relaxed">
                                {footerData.brandDescription}
                              </p>
                            )}

                            {/* Social Links Preview */}
                            {(footerData.facebookUrl || footerData.twitterUrl || footerData.instagramUrl || footerData.linkedinUrl || footerData.youtubeUrl) && (
                              <div className="flex items-center gap-2 pt-1 flex-wrap">
                                {footerData.facebookUrl && footerData.facebookUrl.trim() !== '' && (
                                  <span className="w-6 h-6 rounded bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">FB</span>
                                )}
                                {footerData.twitterUrl && footerData.twitterUrl.trim() !== '' && (
                                  <span className="w-6 h-6 rounded bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">X</span>
                                )}
                                {footerData.instagramUrl && footerData.instagramUrl.trim() !== '' && (
                                  <span className="w-6 h-6 rounded bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">IG</span>
                                )}
                                {footerData.linkedinUrl && footerData.linkedinUrl.trim() !== '' && (
                                  <span className="w-6 h-6 rounded bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">IN</span>
                                )}
                                {footerData.youtubeUrl && footerData.youtubeUrl.trim() !== '' && (
                                  <span className="w-6 h-6 rounded bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">YT</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Navigation Columns Preview */}
                        {(footerData.columns || [])
                          .filter((col) => (col.title && col.title.trim() !== '') || (col.links && col.links.some((l) => l.label && l.label.trim() !== '')))
                          .map((col, idx) => (
                            <div key={idx} className="space-y-2">
                              {col.title && col.title.trim() !== '' && (
                                <div className="font-bold text-white uppercase text-[11px] tracking-wider">{col.title}</div>
                              )}
                              <ul className="space-y-1.5 text-slate-400 text-[11px]">
                                {(col.links || [])
                                  .filter((link) => link.label && link.label.trim() !== '')
                                  .map((link, lIdx) => (
                                    <li key={lIdx} className="hover:text-brand-400 cursor-pointer">
                                      {link.label}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          ))}

                        {/* Helpdesk Column Preview */}
                        {(footerData.supportEmail || footerData.supportPhone || footerData.supportAddress || footerData.workingHours) && (
                          <div className="space-y-2">
                            <div className="font-bold text-white uppercase text-[11px] tracking-wider">Helpdesk & Support</div>
                            <ul className="space-y-1.5 text-slate-400 text-[11px]">
                              {footerData.supportEmail && footerData.supportEmail.trim() !== '' && <li>{footerData.supportEmail}</li>}
                              {footerData.supportPhone && footerData.supportPhone.trim() !== '' && <li>{footerData.supportPhone}</li>}
                              {footerData.supportAddress && footerData.supportAddress.trim() !== '' && <li>{footerData.supportAddress}</li>}
                              {footerData.workingHours && footerData.workingHours.trim() !== '' && <li className="text-slate-500">{footerData.workingHours}</li>}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Bottom Copyright Preview */}
                      {(footerData.copyrightText || footerData.bottomNotice) && (
                        <div
                          className={`pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center gap-2 ${
                            footerData.bottomNotice && footerData.bottomNotice.trim() !== ''
                              ? 'justify-between text-center sm:text-left'
                              : 'justify-center text-center w-full'
                          }`}
                        >
                          {footerData.copyrightText && footerData.copyrightText.trim() !== '' && (
                            <div className={!footerData.bottomNotice || footerData.bottomNotice.trim() === '' ? 'text-center w-full' : ''}>
                              {footerData.copyrightText.replace('{year}', String(new Date().getFullYear()))}
                            </div>
                          )}
                          {footerData.bottomNotice && footerData.bottomNotice.trim() !== '' && (
                            <div className="text-slate-400">{footerData.bottomNotice}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BOTTOM ACTION BAR */}
                  <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={handleResetFooterDefaults}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reset to Initial Defaults</span>
                    </button>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        type="submit"
                        disabled={saving}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-display font-bold text-xs shadow-md shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:ring-brand-500/30 outline-none"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save Footer Settings</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Media Picker Modal for Footer Logo */}
            <MediaLibraryModal
              isOpen={showFooterMediaModal}
              onClose={() => setShowFooterMediaModal(false)}
              onSelect={(item) => {
                const rawUrl = typeof item === 'string' ? item : item?.url || item?.src;
                if (rawUrl) {
                  const API_URL = import.meta.env.PUBLIC_API_URL || (typeof window !== 'undefined' && window.__PUBLIC_API_URL__) || 'http://localhost:6543';
                  const fullUrl = rawUrl.startsWith('http') ? rawUrl : `${API_URL}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
                  setFooterData({ ...footerData, brandLogo: fullUrl });
                }
                setShowFooterMediaModal(false);
              }}
              multiple={false}
              authToken={userStore.get()?.accessToken || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('tradelogix_user') || '{}')?.accessToken : '') || ''}
            />
            {activeSection === 'smtp' && (
              <div className="space-y-8 animate-fadeIn">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
                        <Server className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight">
                        SMTP Mail Gateway & Admin Notifications
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 max-w-2xl">
                      Configure outbound relay credentials, sender identities, and manage <strong>admin email recipient distribution lists</strong> for order alerts, wire transfer notifications, and low-inventory warnings.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                      <Server className="w-3.5 h-3.5" />
                      Outbound Mail Relay
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSaveSmtp} className="space-y-8">
                  {/* CARD 1: ADMIN NOTIFICATION EMAIL RECIPIENTS & GATEWAY TRIGGERS */}
                  <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-slate-50 border border-indigo-100 shadow-2xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-indigo-100/80">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <Bell className="w-4 h-4 text-indigo-600" /> Admin Email Notification Recipients
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Specify store managers, accounts officers, and operations teams who receive system notifications.
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold self-start sm:self-auto">
                        <Users className="w-3.5 h-3.5" /> Multi-Recipient Routing
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Admin Email List Input */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-indigo-600" /> Admin Recipient Emails (Comma-Separated)
                        </label>
                        <input
                          type="text"
                          value={smtpData.adminNotificationEmails || ''}
                          onChange={(e) => setSmtpData({ ...smtpData, adminNotificationEmails: e.target.value })}
                          placeholder="admin@tradelogix.in, orders@tradelogix.in, finance@tradelogix.in"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-2xs"
                        />
                        <p className="text-[11px] text-slate-400">
                          Separate multiple email addresses with a comma. All addresses will be dispatched notification alerts simultaneously.
                        </p>
                      </div>

                      {/* Recipient Chips Preview */}
                      {smtpData.adminNotificationEmails && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="text-[11px] font-bold text-slate-500">Active Recipients:</span>
                          {smtpData.adminNotificationEmails
                            .split(',')
                            .map((em) => em.trim())
                            .filter(Boolean)
                            .map((email, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-mono font-medium shadow-2xs"
                              >
                                <Mail className="w-3 h-3 text-indigo-500" />
                                <span>{email}</span>
                              </span>
                            ))}
                        </div>
                      )}

                      {/* Event Trigger Toggles */}
                      <div className="pt-3 border-t border-slate-200/60 space-y-3">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                          Automated Event Dispatch Rules
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {/* Trigger 1: New Order */}
                          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-slate-300 transition-all shadow-2xs">
                            <input
                              type="checkbox"
                              checked={smtpData.adminAlertNewOrder ?? true}
                              onChange={(e) => setSmtpData({ ...smtpData, adminAlertNewOrder: e.target.checked })}
                              className="mt-0.5 w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                            />
                            <div>
                              <span className="text-xs font-bold text-slate-900 block">New Order Alert (Admin)</span>
                              <span className="text-[11px] text-slate-500">Notify admins immediately when a new wholesale order is received.</span>
                            </div>
                          </label>

                          {/* Trigger 2: Offline Payment */}
                          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-slate-300 transition-all shadow-2xs">
                            <input
                              type="checkbox"
                              checked={smtpData.adminAlertPaymentReceived ?? true}
                              onChange={(e) => setSmtpData({ ...smtpData, adminAlertPaymentReceived: e.target.checked })}
                              className="mt-0.5 w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                            />
                            <div>
                              <span className="text-xs font-bold text-slate-900 block">Wire Transfer UTR Upload Alert</span>
                              <span className="text-[11px] text-slate-500">Alert accounts team when a customer submits NEFT/RTGS payment proof.</span>
                            </div>
                          </label>

                          {/* Trigger 3: Low Stock */}
                          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-slate-300 transition-all shadow-2xs">
                            <input
                              type="checkbox"
                              checked={smtpData.adminAlertLowStock ?? true}
                              onChange={(e) => setSmtpData({ ...smtpData, adminAlertLowStock: e.target.checked })}
                              className="mt-0.5 w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                            />
                            <div>
                              <span className="text-xs font-bold text-slate-900 block">Low Inventory Stock Warning</span>
                              <span className="text-[11px] text-slate-500">Send threshold alerts when SKU warehouse levels fall below safety buffer.</span>
                            </div>
                          </label>

                          {/* Trigger 4: PDF Invoice Attached to Customer */}
                          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-slate-300 transition-all shadow-2xs">
                            <input
                              type="checkbox"
                              checked={smtpData.customerOrderInvoiceAttached ?? true}
                              onChange={(e) => setSmtpData({ ...smtpData, customerOrderInvoiceAttached: e.target.checked })}
                              className="mt-0.5 w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                            />
                            <div>
                              <span className="text-xs font-bold text-slate-900 block">Attach PDF Invoice to Customer Emails</span>
                              <span className="text-[11px] text-slate-500">Automatically attach official GST Tax Invoice PDF to order receipts.</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: SMTP HOST & CONNECTION */}
                  <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-200 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Server className="w-4 h-4 text-brand-600" /> Mail Server Host & Port
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-400">Relay endpoint settings</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      {/* Host */}
                      <div className="md:col-span-7 space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Server className="w-3.5 h-3.5 text-brand-600" /> SMTP Server Hostname
                        </label>
                        <input
                          type="text"
                          value={smtpData.host || ''}
                          onChange={(e) => setSmtpData({ ...smtpData, host: e.target.value })}
                          placeholder="smtp.mailgun.org, smtp.sendgrid.net, or smtp.gmail.com"
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-mono font-bold focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-2xs"
                        />
                        <p className="text-[11px] text-slate-400">Domain or IP address of your outbound SMTP server.</p>
                      </div>

                      {/* Port */}
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          SMTP Port
                        </label>
                        <input
                          type="number"
                          value={smtpData.port || 587}
                          onChange={(e) => setSmtpData({ ...smtpData, port: parseInt(e.target.value, 10) || 587 })}
                          placeholder="587"
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-mono font-bold focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-2xs"
                        />
                        <p className="text-[11px] text-slate-400">Standard: 587 or 465</p>
                      </div>

                      {/* Encryption */}
                      <div className="md:col-span-3 space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          Encryption Protocol
                        </label>
                        <select
                          value={smtpData.encryptionType || 'TLS'}
                          onChange={(e) => setSmtpData({ ...smtpData, encryptionType: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-bold focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer shadow-2xs"
                        >
                          <option value="TLS">STARTTLS (Port 587)</option>
                          <option value="SSL">SSL / TLS (Port 465)</option>
                          <option value="NONE">None / Plain Text</option>
                        </select>
                        <p className="text-[11px] text-slate-400">TLS is recommended</p>
                      </div>
                    </div>
                  </div>

                  {/* CARD 3: AUTHENTICATION CREDENTIALS */}
                  <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Key className="w-4 h-4 text-brand-600" /> Authentication Credentials
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" /> Stored securely in database
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Username */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          SMTP Username / API User Email
                        </label>
                        <input
                          type="text"
                          value={smtpData.username || ''}
                          onChange={(e) => setSmtpData({ ...smtpData, username: e.target.value })}
                          placeholder="postmaster@tradelogix.in"
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-2xs"
                        />
                        <p className="text-[11px] text-slate-400">Your Mailgun, Sendgrid, or Gmail account username.</p>
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          SMTP Password / App Secret Key
                        </label>
                        <div className="relative">
                          <input
                            type={showSmtpPassword ? 'text' : 'password'}
                            value={smtpData.password || ''}
                            onChange={(e) => setSmtpData({ ...smtpData, password: e.target.value })}
                            placeholder="••••••••••••••••••••"
                            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-mono focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                            title={showSmtpPassword ? 'Hide password' : 'Show password'}
                          >
                            {showSmtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400">Leave blank to keep current stored secret.</p>
                      </div>
                    </div>
                  </div>

                  {/* CARD 4: SENDER IDENTITY & BRANDING */}
                  <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-200 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Mail className="w-4 h-4 text-brand-600" /> Outbound Sender Identity
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-400">Appears in customer email client</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* From Email */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          Sender &quot;From&quot; Email Address
                        </label>
                        <input
                          type="email"
                          value={smtpData.fromEmail || ''}
                          onChange={(e) => setSmtpData({ ...smtpData, fromEmail: e.target.value })}
                          placeholder="no-reply@tradelogix.in"
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-2xs"
                        />
                        <p className="text-[11px] text-slate-400">The verified sender address for outbound emails.</p>
                      </div>

                      {/* From Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          Sender &quot;From&quot; Display Name
                        </label>
                        <input
                          type="text"
                          value={smtpData.fromName || ''}
                          onChange={(e) => setSmtpData({ ...smtpData, fromName: e.target.value })}
                          placeholder="TradeLogix Wholesale Alerts"
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-2xs"
                        />
                        <p className="text-[11px] text-slate-400">The brand name shown in recipient mailboxes.</p>
                      </div>
                    </div>
                  </div>

                  {/* CARD 5: LIVE SMTP TEST & MAIL DELIVERY DIAGNOSTIC */}
                  <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/60 border border-indigo-200/90 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-indigo-100 flex-wrap gap-2">
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Send className="w-4 h-4 text-indigo-600" /> Test SMTP Mail Delivery & Connection
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                        Live Outbound Test
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Send a live diagnostic test email to any inbox to verify that your SMTP mail host, port, security protocol, and login credentials are working properly.
                    </p>

                    <div className="space-y-3 pt-1">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="relative flex-1">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="email"
                            value={testEmailInput}
                            onChange={(e) => setTestEmailInput(e.target.value)}
                            placeholder="Enter test recipient email address... (e.g. yourname@gmail.com)"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-indigo-200 bg-white text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none shadow-2xs"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleTestSmtpConnection}
                          disabled={testingSmtp || !testEmailInput}
                          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
                        >
                          {testingSmtp ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Sending Test Email...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Send Test Email</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Test Result Message Box */}
                      {testEmailResult && (
                        <div
                          className={`p-4 rounded-xl text-xs font-medium flex items-start gap-2.5 animate-fadeIn border ${
                            testEmailResult.success
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                              : 'bg-rose-50 border-rose-200 text-rose-950'
                          }`}
                        >
                          {testEmailResult.success ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-0.5">
                            <div className="font-bold text-xs">
                              {testEmailResult.success ? '✓ SMTP Diagnostic Test Succeeded' : '✗ SMTP Diagnostic Connection Failed'}
                            </div>
                            <p className="leading-relaxed">{testEmailResult.message}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BOTTOM ACTION BAR */}
                  <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-display font-bold text-xs shadow-md shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:ring-brand-500/30 outline-none"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving Settings...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save SMTP Settings</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SECTION 3: EMAIL TEMPLATES MANAGEMENT                                     */}
            {/* ========================================================================= */}
            {activeSection === 'templates' && (
              <div className="space-y-8 animate-fadeIn">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
                        <Mail className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight">
                        Email Notification Templates
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 max-w-2xl">
                      Customize transactional email subjects, customer dispatch templates, dynamic variable placeholders, and admin notification payloads.
                    </p>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'customer', label: 'Customer' },
                      { id: 'admin', label: 'Admin Alerts' },
                      { id: 'auth', label: 'Auth & OTP' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setTemplateFilter(f.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          templateFilter === f.id
                            ? 'bg-white text-slate-900 shadow-2xs font-bold'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2-Column Template Layout: Left Navigation + Right Editor/Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Template Cards List */}
                  <div className="lg:col-span-4 space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                      Available Templates ({filteredTemplates.length})
                    </span>

                    <div className="space-y-2.5">
                      {filteredTemplates.map((tpl) => {
                        const isSelected = tpl.templateKey === selectedTemplateKey;
                        const categoryBadge =
                          tpl.category === 'customer'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : tpl.category === 'admin'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200';

                        return (
                          <div
                            key={tpl.templateKey}
                            onClick={() => setSelectedTemplateKey(tpl.templateKey)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative ${
                              isSelected
                                ? 'bg-brand-50/50 border-brand-500 shadow-sm ring-2 ring-brand-500/10'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${categoryBadge}`}>
                                {tpl.category}
                              </span>
                              <span className={`w-2 h-2 rounded-full ${tpl.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            </div>

                            <h4 className={`text-xs font-bold leading-tight ${isSelected ? 'text-brand-900 font-extrabold' : 'text-slate-800'}`}>
                              {tpl.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {tpl.description}
                            </p>

                            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                              <span>key: {tpl.templateKey}</span>
                              <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-brand-600' : 'text-slate-300'}`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Interactive Template Customizer & Live Preview */}
                  {editingTemplate && (
                    <div className="lg:col-span-8 space-y-6">
                      {/* Active Template Control Banner */}
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-200 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900 text-base">{editingTemplate.name}</h3>
                              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px] font-bold">
                                {editingTemplate.templateKey}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{editingTemplate.description}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Enable/Disable Toggle */}
                            <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer shadow-2xs">
                              <input
                                type="checkbox"
                                checked={editingTemplate.enabled ?? true}
                                onChange={(e) => setEditingTemplate({ ...editingTemplate, enabled: e.target.checked })}
                                className="w-3.5 h-3.5 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                              />
                              <span>{editingTemplate.enabled ? 'Active' : 'Disabled'}</span>
                            </label>

                            {/* Reset to Default */}
                            <button
                              type="button"
                              onClick={() => handleResetTemplate(editingTemplate.templateKey)}
                              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all shadow-2xs"
                              title="Reset to Factory Default"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Subject Line Editor */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                            <span>Email Subject Line</span>
                            <span className="text-[10px] text-slate-400 font-normal">Supports dynamic tags</span>
                          </label>
                          <input
                            type="text"
                            value={editingTemplate.subject || ''}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                            placeholder="Order Confirmation: #{orderId} - TradeLogix"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-2xs font-mono"
                          />
                        </div>

                        {/* Dynamic Variable Chips */}
                        {editingTemplate.variables && editingTemplate.variables.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                              Click to Insert Placeholder Variables:
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {editingTemplate.variables.map((v) => (
                                <button
                                  key={v}
                                  type="button"
                                  onClick={() => insertVariableIntoTemplate(v)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-brand-50 text-slate-700 hover:text-brand-700 border border-slate-200 hover:border-brand-300 text-[11px] font-mono font-medium transition-all shadow-2xs"
                                  title={`Insert {${v}} into email content`}
                                >
                                  <Tag className="w-3 h-3 text-brand-600" />
                                  <span>{`{${v}}`}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Editor / Preview Toolbar */}
                      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Email Body Template (HTML / Visual Preview)
                          </span>

                          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-bold">
                            <button
                              type="button"
                              onClick={() => setPreviewMode('desktop')}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                                previewMode === 'desktop' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                              }`}
                            >
                              <Monitor className="w-3.5 h-3.5" /> Desktop Preview
                            </button>
                            <button
                              type="button"
                              onClick={() => setPreviewMode('mobile')}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                                previewMode === 'mobile' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                              }`}
                            >
                              <Smartphone className="w-3.5 h-3.5" /> Mobile Preview
                            </button>
                            <button
                              type="button"
                              onClick={() => setPreviewMode('code')}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                                previewMode === 'code' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                              }`}
                            >
                              <Code2 className="w-3.5 h-3.5" /> HTML Source
                            </button>
                          </div>
                        </div>

                        {/* Mode 1 & 2: Rendered Visual Email Preview */}
                        {(previewMode === 'desktop' || previewMode === 'mobile') && (
                          <div className="bg-slate-100 p-4 sm:p-6 rounded-2xl border border-slate-200 flex justify-center">
                            <div
                              className={`bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden transition-all ${
                                previewMode === 'mobile' ? 'max-w-xs w-full' : 'max-w-2xl w-full'
                              }`}
                            >
                              {/* Simulated Email Client Top Bar */}
                              <div className="bg-slate-900 text-white px-4 py-2.5 text-xs flex items-center justify-between border-b border-slate-800">
                                <div className="flex items-center gap-2 truncate">
                                  <Mail className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                                  <span className="font-mono font-bold truncate">
                                    Subject: {getRenderedPreviewHtml(editingTemplate.subject)}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 shrink-0">Live Simulation</span>
                              </div>

                              {/* Email Body Content */}
                              <div
                                className="p-4 sm:p-6 text-sm font-sans"
                                dangerouslySetInnerHTML={{
                                  __html: getRenderedPreviewHtml(editingTemplate.bodyHtml),
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Mode 3: Raw HTML Code Editor */}
                        {previewMode === 'code' && (
                          <div className="space-y-2">
                            <textarea
                              rows={14}
                              value={editingTemplate.bodyHtml || ''}
                              onChange={(e) => setEditingTemplate({ ...editingTemplate, bodyHtml: e.target.value })}
                              className="w-full p-4 rounded-xl border border-slate-300 bg-slate-950 text-emerald-400 text-xs font-mono focus:ring-2 focus:ring-brand-500 outline-none leading-relaxed shadow-inner"
                            />
                            <p className="text-[11px] text-slate-400">
                              Direct inline CSS is recommended for optimal cross-client email compatibility (Gmail, Outlook, Apple Mail).
                            </p>
                          </div>
                        )}

                        {/* Action Bar */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={handleSaveTemplate}
                            disabled={savingTemplate}
                            className="px-7 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-display font-bold text-xs shadow-md shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
                          >
                            {savingTemplate ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Saving Template...</span>
                              </>
                            ) : (
                              <>
                                <Save className="w-3.5 h-3.5" />
                                <span>Save Template Changes</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Media Library Modal (WordPress-Style Upload & Select) */}
      <MediaLibraryModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelect={handleMediaSelect}
        multiple={false}
        authToken={userStore.get()?.accessToken || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('tradelogix_user') || '{}')?.accessToken : '') || ''}
      />
    </div>
  );
}
