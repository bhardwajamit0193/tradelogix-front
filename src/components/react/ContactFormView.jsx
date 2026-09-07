import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Building,
  FileText,
  MessageSquare,
  ShieldCheck,
  User,
} from 'lucide-react';
import PhoneInputField from './PhoneInputField.jsx';

export default function ContactFormView() {
  const [formData, setFormData] = useState({
    inquiryType: 'B2B Wholesale Procurement',
    fullName: '',
    firmName: '',
    gstin: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate reliable dispatch
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormData({
        inquiryType: 'B2B Wholesale Procurement',
        fullName: '',
        firmName: '',
        gstin: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    }, 900);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      {/* Left Column: Direct Support Channels & Corporate HQ */}
      <div className="lg:col-span-5 space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-[11px] font-bold uppercase tracking-wider border border-brand-400/30">
              Direct Desk Channels
            </span>
            <h3 className="font-display font-extrabold text-2xl text-white">
              Connect with TradeLogix Sales & Logistics
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our dedicated corporate desk handles bulk tier pricing, dealer onboarding, credit ledger assistance, and high-volume procurement requests.
            </p>
          </div>

          <div className="space-y-5 relative z-10 text-xs">
            {/* Email Channels */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Inquiry & Sales Email</div>
                <a href="mailto:sales@tradelogix.in" className="text-white font-semibold hover:text-brand-300 transition-colors block">
                  sales@tradelogix.in
                </a>
                <a href="mailto:support@tradelogix.in" className="text-slate-400 hover:text-white transition-colors block text-[11px]">
                  support@tradelogix.in
                </a>
              </div>
            </div>

            {/* Helpline Phone */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Direct Telephone & WhatsApp</div>
                <a href="tel:+919820145892" className="text-white font-semibold hover:text-brand-300 transition-colors block">
                  +91 98201 45892
                </a>
                <span className="text-[11px] text-slate-400">Wholesale Desk & Escalations</span>
              </div>
            </div>

            {/* Registered Address */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Registered Corporate Office</div>
                <div className="text-white font-medium leading-relaxed">
                  804, Prime Corporate Park, Marol, Andheri East, Mumbai, Maharashtra - 400059
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Trading & Support Hours</div>
                <div className="text-white font-medium">Monday - Saturday: 9:30 AM - 6:30 PM IST</div>
                <div className="text-[11px] text-slate-400">Sunday Closed (Emergency dispatch available)</div>
              </div>
            </div>
          </div>
        </div>

        {/* GST & Compliance Mini-Badge */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-800">GSTIN Registered Entity</div>
              <div className="text-[11px] font-mono text-slate-500">27AAACT9921M1ZT</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
            Verified
          </span>
        </div>
      </div>

      {/* Right Column: Interactive Commercial Inquiry Form */}
      <div className="lg:col-span-7">
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 space-y-1">
            <h3 className="font-display font-bold text-xl text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-600" />
              Send Commercial Inquiry
            </h3>
            <p className="text-xs text-slate-500">
              Submit your wholesale requirements. Our account manager will get back within 2-4 business hours with volume pricing and dispatch schedules.
            </p>
          </div>

          {submitted ? (
            <div className="py-12 px-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-xl text-emerald-950">Inquiry Received Successfully</h4>
                <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out to TradeLogix Wholesale. Your inquiry has been routed to our B2B account desk. We will contact you via email / phone shortly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Inquiry Type Radio / Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Inquiry Purpose
                </label>
                <select
                  value={formData.inquiryType}
                  onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand-500 outline-none shadow-2xs"
                >
                  <option value="B2B Wholesale Procurement">B2B Wholesale Procurement & Slabs</option>
                  <option value="Dealer & Retailer Onboarding">Dealer & Retailer Account Onboarding</option>
                  <option value="Corporate Bulk Purchase">Corporate & Enterprise Bulk Purchase</option>
                  <option value="OEM Brand Distribution Partnership">OEM Brand Distribution Partnership</option>
                  <option value="GST Invoicing & Billing Query">GST Invoicing & Accounts Ledger Help</option>
                  <option value="Logistics & Dispatch Inquiry">Logistics & AWB Dispatch Status</option>
                </select>
              </div>

              {/* Name & Firm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Vikram Mehta"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Business / Firm Name
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={formData.firmName}
                      onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                      placeholder="Mehta Electronics Pvt Ltd"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* GSTIN & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    GSTIN Number (Optional)
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                      placeholder="27AAACT9921M1ZT"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-brand-500 outline-none shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Mobile Number *
                  </label>
                  <PhoneInputField
                    value={formData.phone}
                    onChange={(val) => setFormData({ ...formData, phone: val })}
                    placeholder="98201 45892"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Official Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="procurement@mehta.in"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none shadow-2xs"
                  />
                </div>
              </div>

              {/* Message / Requirement Details */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Detailed Requirement / Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Specify product SKUs, estimated monthly purchase volume, target delivery city, and any custom requirements..."
                  className="w-full p-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none resize-none shadow-2xs"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-display font-bold text-xs shadow-md shadow-brand-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting Inquiry...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Commercial Inquiry</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
