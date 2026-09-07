import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Building2,
  FileText,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  Truck,
  Receipt,
  Users,
  Warehouse,
  Sparkles,
  ArrowRight,
  Send,
  HelpCircle,
} from 'lucide-react';

export default function ContactHubView({
  departmentConfig = null,
  platformSettings = null,
} = {}) {
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2500);
  };

  const salesConfig = departmentConfig?.sales || {};
  const onboardingConfig = departmentConfig?.onboarding || {};
  const accountsConfig = departmentConfig?.accounts || {};
  const logisticsConfig = departmentConfig?.logistics || {};

  const getTiming = (cfg) => {
    if (!cfg) return '';
    if (cfg.hours !== undefined) return cfg.hours;
    if (cfg.timing !== undefined) return cfg.timing;
    return '';
  };

  const departments = [
    {
      id: 'sales',
      title: salesConfig.title || 'Wholesale Sales & Procurement',
      tag: salesConfig.tag || 'Volume Orders',
      icon: Sparkles,
      color: 'from-brand-600 to-indigo-600',
      badgeBg: 'bg-brand-50 text-brand-700 border-brand-200',
      description: salesConfig.description || salesConfig.desc || 'Volume discount pricing, price slab negotiations, custom OEM contracts, and hardware stock reservations.',
      email: salesConfig.email || platformSettings?.supportEmail || 'sales@tradelogix.in',
      phone: salesConfig.phone || platformSettings?.companyPhone || '+91 98201 45892',
      timing: getTiming(salesConfig),
      actionLabel: 'Email Sales Desk',
      actionHref: `mailto:${salesConfig.email || 'sales@tradelogix.in'}?subject=B2B%20Wholesale%20Inquiry%20-%20TradeLogix`,
      whatsapp: salesConfig.whatsapp || '919820145892',
    },
    {
      id: 'onboarding',
      title: onboardingConfig.title || 'B2B Onboarding & GST Verification',
      tag: onboardingConfig.tag || 'Buyer Accounts',
      icon: Users,
      color: 'from-purple-600 to-indigo-600',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      description: onboardingConfig.description || onboardingConfig.desc || 'Assistance with Mobile OTP verification, automated GSTIN validation, dealer classification, and account approval.',
      email: onboardingConfig.email || platformSettings?.supportEmail || 'support@tradelogix.in',
      phone: onboardingConfig.phone || platformSettings?.companyPhone || '+91 98201 45892',
      timing: getTiming(onboardingConfig),
      actionLabel: 'Contact Onboarding',
      actionHref: `mailto:${onboardingConfig.email || 'support@tradelogix.in'}?subject=B2B%20Customer%20Onboarding%20Help`,
      whatsapp: onboardingConfig.whatsapp || '919820145892',
    },
    {
      id: 'accounts',
      title: accountsConfig.title || 'Billing, Invoicing & GST Credit',
      tag: accountsConfig.tag || 'Accounts Ledger',
      icon: Receipt,
      color: 'from-emerald-600 to-teal-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: accountsConfig.description || accountsConfig.desc || 'Official GST Tax Invoices for ITC input credit, NEFT / RTGS wire transfer UTR reconciliation, and Credit Notes.',
      email: accountsConfig.email || platformSettings?.companyEmail || 'accounts@tradelogix.in',
      phone: accountsConfig.phone || platformSettings?.companyPhone || '+91 98201 45892',
      timing: getTiming(accountsConfig),
      actionLabel: 'Email Accounts Desk',
      actionHref: `mailto:${accountsConfig.email || 'accounts@tradelogix.in'}?subject=GST%20Invoice%20%2F%20Payment%20Reconciliation`,
    },
    {
      id: 'logistics',
      title: logisticsConfig.title || 'Logistics & Dispatch Operations',
      tag: logisticsConfig.tag || 'Central Hub WH-01',
      icon: Truck,
      color: 'from-sky-600 to-blue-600',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
      description: logisticsConfig.description || logisticsConfig.desc || 'Express Air Cargo dispatch schedules, live AWB tracking status, e-way bill compliance, and dock self-pickups.',
      email: logisticsConfig.email || platformSettings?.supportEmail || 'support@tradelogix.in',
      phone: logisticsConfig.phone || platformSettings?.companyPhone || '+91 98201 45892',
      timing: getTiming(logisticsConfig),
      actionLabel: 'Track Shipment Desk',
      actionHref: `mailto:${logisticsConfig.email || 'support@tradelogix.in'}?subject=Logistics%20%26%20AWB%20Dispatch%20Query`,
    },
  ];

  const fullAddress = platformSettings?.companyAddress || '804, Prime Corporate Park, Marol, Andheri East, Mumbai, Maharashtra - 400059';
  const companyName = platformSettings?.companyName || 'TradeLogix Solutions Private Limited';
  const gstin = platformSettings?.gstin || '27AAACT9921M1ZT';
  const pan = platformSettings?.panNumber || 'AAACT9921M';
  const cin = platformSettings?.cinNumber || 'U72900MH2024PTC123456';
  const warehouse = platformSettings?.warehouseLocation || 'Mumbai Central Fulfillment Hub (WH-01)';

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* 4 Specialized Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {departments.map((dept) => {
          const IconComponent = dept.icon;
          return (
            <div
              key={dept.id}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-6 flex flex-col justify-between group hover:border-slate-300 relative overflow-hidden"
            >
              <div className="space-y-4">
                {/* Header with Icon & Tag */}
                <div className="flex items-center justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <IconComponent className="w-6 h-6 text-brand-300" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${dept.badgeBg}`}>
                    {dept.tag}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-1.5">
                  <h3 className="font-display font-bold text-xl text-slate-900 group-hover:text-brand-600 transition-colors">
                    {dept.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {dept.description}
                  </p>
                </div>

                {/* Contact Data Points */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
                  {/* Email */}
                  {dept.email && dept.email.trim() !== '' && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <Mail className="w-4 h-4 text-brand-600 shrink-0" />
                        <span>{dept.email}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(dept.email, `${dept.id}-email`)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                        title="Copy Email"
                      >
                        {copiedKey === `${dept.id}-email` ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Phone */}
                  {dept.phone && dept.phone.trim() !== '' && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{dept.phone}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(dept.phone, `${dept.id}-phone`)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                        title="Copy Phone"
                      >
                        {copiedKey === `${dept.id}-phone` ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Timing / Operating Hours / TAT */}
                  {dept.timing && dept.timing.trim() !== '' && (
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] px-1 pt-1">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{dept.timing}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <a
                  href={dept.actionHref}
                  className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-display font-bold text-xs shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{dept.actionLabel}</span>
                </a>

                {dept.whatsapp && (
                  <a
                    href={`https://wa.me/${dept.whatsapp}?text=Hello%20TradeLogix%20Wholesale%20Team%2C%20I%20have%20an%20inquiry.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all flex items-center justify-center shrink-0"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Central Headquarters & Multi-Warehouse Facility Feature Section */}
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-[11px] font-bold uppercase tracking-wider border border-brand-400/30">
              Registered Corporate Office & Central Dock
            </span>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-white">
              {companyName}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Operating our central logistics hub and corporate trading desk in Mumbai with verified interstate carrier connectivity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => copyToClipboard(fullAddress, 'full-address')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-2 border border-slate-700 cursor-pointer"
            >
              {copiedKey === 'full-address' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Address Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Full Address</span>
                </>
              )}
            </button>

            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-brand-500/20"
            >
              <span>View on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Corporate Credentials & Address Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 text-xs">
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
              <span>Office Coordinates</span>
            </div>
            <p className="text-slate-200 leading-relaxed font-medium">
              {fullAddress}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <Warehouse className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Central Logistics Hub</span>
            </div>
            <p className="text-slate-200 leading-relaxed font-medium">
              {warehouse}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Tax & Legal Identifiers</span>
            </div>
            <div className="font-mono text-emerald-300 font-bold">GSTIN: {gstin}</div>
            <div className="font-mono text-slate-300 text-[11px]">PAN: {pan}</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Corporate Reg No (CIN)</span>
            </div>
            <div className="font-mono text-purple-300 font-bold">{cin}</div>
            <div className="text-slate-400 text-[11px]">Ministry of Corporate Affairs</div>
          </div>
        </div>
      </div>

      {/* Support SLA & Turnaround Matrix Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-200 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              B2B Service Level Agreement (SLA) Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Guaranteed turnaround times for verified dealers and corporate accounts.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] self-start sm:self-auto">
            Live Escalations Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-400">Wholesale Volume Quotes</div>
            <div className="font-bold text-slate-900 text-base">&lt; 2 Business Hours</div>
            <p className="text-[11px] text-slate-500">Custom tiered pricing & stock allocation</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-400">GST Account Verification</div>
            <div className="font-bold text-slate-900 text-base">&lt; 4 Business Hours</div>
            <p className="text-[11px] text-slate-500">GSTIN validation & portal approval</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-400">Warehouse Dispatches</div>
            <div className="font-bold text-slate-900 text-base">24 to 48 Hours</div>
            <p className="text-[11px] text-slate-500">From Central Mumbai WH-01 Node</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-400">Invoice & UTR Settlement</div>
            <div className="font-bold text-slate-900 text-base">Instant / Same Day</div>
            <p className="text-[11px] text-slate-500">Automated GST Tax Invoice PDF</p>
          </div>
        </div>
      </div>
    </div>
  );
}
