import React, { useState, useEffect } from 'react';
import {
  fetchFooterSettingsApi,
  DEFAULT_FOOTER_SETTINGS,
} from '../../services/platformSettingsService.js';

const API_URL = import.meta.env.PUBLIC_API_URL || (typeof window !== 'undefined' && window.__PUBLIC_API_URL__) || 'http://localhost:6543';

export default function FooterView({ initialData = null }) {
  const unwrappedInitial = (initialData && initialData.data) ? initialData.data : initialData;
  const [footer, setFooter] = useState(unwrappedInitial || DEFAULT_FOOTER_SETTINGS);
  const [apiCategories, setApiCategories] = useState([]);
  const [loaded, setLoaded] = useState(Boolean(unwrappedInitial));

  useEffect(() => {
    async function loadFooter() {
      try {
        const json = await fetchFooterSettingsApi();
        const data = (json && json.data) ? json.data : json;
        if (data && typeof data === 'object') {
          // Parse columns if stringified JSON
          let parsedCols = data.columns;
          if (typeof parsedCols === 'string') {
            try {
              parsedCols = JSON.parse(parsedCols);
            } catch (e) {
              parsedCols = [];
            }
          }
          setFooter({
            ...data,
            columns: Array.isArray(parsedCols) ? parsedCols : (DEFAULT_FOOTER_SETTINGS.columns || []),
          });
        }
      } catch (err) {
        console.warn('Error loading footer in frontend:', err);
      } finally {
        setLoaded(true);
      }
    }

    async function loadCategories() {
      try {
        const res = await fetch(`${API_URL}/api/all-categories`);
        if (res.ok) {
          const json = await res.json();
          const items = json?.data || json || [];
          if (Array.isArray(items) && items.length > 0) {
            setApiCategories(items);
          }
        }
      } catch (err) {
        console.warn('Failed to load categories for footer:', err);
      }
    }

    loadFooter();
    loadCategories();
  }, []);

  const currentYear = new Date().getFullYear();

  // Parse raw columns safely
  let rawColumns = footer?.columns;
  if (typeof rawColumns === 'string') {
    try {
      rawColumns = JSON.parse(rawColumns);
    } catch (e) {
      rawColumns = [];
    }
  }
  if (!Array.isArray(rawColumns)) {
    rawColumns = DEFAULT_FOOTER_SETTINGS.columns || [];
  }

  // Filter valid navigation columns that have a title or active links
  const validColumns = (rawColumns || [])
    .map((col) => {
      const isCategoriesCol = (col?.title || '').trim().toLowerCase() === 'categories';
      
      let links = Array.isArray(col?.links)
        ? col.links.filter((l) => l && l.label && String(l.label).trim() !== '')
        : [];

      // If it is the Categories column and live categories are available, dynamically load them
      if (isCategoriesCol && apiCategories.length > 0) {
        links = apiCategories.map((c) => ({
          label: c.name,
          url: `/shop?category=${encodeURIComponent(c.name)}`,
        }));
      }

      return {
        title: col?.title?.trim() || '',
        links,
      };
    })
    .filter((col) => col.title !== '' || col.links.length > 0);

  // Check if any social media link is provided
  const hasSocialLinks = Boolean(
    (footer?.facebookUrl && footer.facebookUrl.trim() !== '') ||
    (footer?.twitterUrl && footer.twitterUrl.trim() !== '') ||
    (footer?.instagramUrl && footer.instagramUrl.trim() !== '') ||
    (footer?.linkedinUrl && footer.linkedinUrl.trim() !== '') ||
    (footer?.youtubeUrl && footer.youtubeUrl.trim() !== '')
  );

  // Check if any contact / helpdesk info is provided
  const hasContactInfo = Boolean(
    (footer?.supportEmail && footer.supportEmail.trim() !== '') ||
    (footer?.supportPhone && footer.supportPhone.trim() !== '') ||
    (footer?.supportAddress && footer.supportAddress.trim() !== '') ||
    (footer?.workingHours && footer.workingHours.trim() !== '')
  );

  const hasBrandBio = Boolean(footer?.brandDescription && footer.brandDescription.trim() !== '');
  const hasBrandLogo = Boolean(footer?.brandLogo && footer.brandLogo.trim() !== '');
  const hasBrandName = Boolean(footer?.brandName && footer.brandName.trim() !== '');
  const hasBottomNotice = Boolean(footer?.bottomNotice && footer.bottomNotice.trim() !== '');
  const hasCopyright = Boolean(footer?.copyrightText && footer.copyrightText.trim() !== '');

  // If literally everything is empty and not loaded, don't show empty void
  const hasAnyContent = hasBrandLogo || hasBrandName || hasBrandBio || hasSocialLinks || validColumns.length > 0 || hasContactInfo || hasCopyright || hasBottomNotice;

  const formatLogoUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/uploads/')) return `${API_URL}${url}`;
    if (url.startsWith('uploads/')) return `${API_URL}/${url}`;
    return url;
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 w-full py-14 sm:py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Dynamic Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Column 1: Brand & Bio Column (if brand logo, name, bio, or socials exist) */}
          {(hasBrandLogo || hasBrandName || hasBrandBio || hasSocialLinks) && (
            <div className="space-y-4 pr-0 lg:pr-2">
              {(hasBrandLogo || hasBrandName) && (
                <a className="font-display font-bold text-2xl text-white flex items-center gap-3 inline-flex" href="/">
                  {hasBrandLogo ? (
                    <img
                      src={formatLogoUrl(footer.brandLogo)}
                      alt={footer.brandName || 'Store Logo'}
                      className="h-12 w-auto object-contain rounded-lg brightness-110"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : hasBrandName ? (
                    <span className="text-xl font-black text-white tracking-tight">{footer.brandName}</span>
                  ) : null}
                </a>
              )}

              {hasBrandBio && (
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                  {footer.brandDescription}
                </p>
              )}

              {/* Social Links (only non-empty links are rendered) */}
              {hasSocialLinks && (
                <div className="flex items-center gap-2.5 pt-2 flex-wrap">
                  {footer.facebookUrl && footer.facebookUrl.trim() !== '' && (
                    <a
                      href={footer.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-sm"
                      title="Facebook"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                  )}
                  {footer.twitterUrl && footer.twitterUrl.trim() !== '' && (
                    <a
                      href={footer.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-sm"
                      title="X / Twitter"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                  )}
                  {footer.instagramUrl && footer.instagramUrl.trim() !== '' && (
                    <a
                      href={footer.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-sm"
                      title="Instagram"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </a>
                  )}
                  {footer.linkedinUrl && footer.linkedinUrl.trim() !== '' && (
                    <a
                      href={footer.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-sm"
                      title="LinkedIn"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                  )}
                  {footer.youtubeUrl && footer.youtubeUrl.trim() !== '' && (
                    <a
                      href={footer.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-sm"
                      title="YouTube"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Dynamic Navigation Columns (Only render valid non-empty columns) */}
          {validColumns.map((col, cIdx) => (
            <div key={cIdx} className="space-y-3.5">
              {col.title && (
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{col.title}</h4>
              )}
              {col.links && col.links.length > 0 && (
                <ul className="space-y-2 text-xs text-slate-400">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <a className="hover:text-brand-400 transition-colors inline-block" href={link.url || '#'}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* Contact & Helpdesk Column (Only rendered if at least one contact detail is provided) */}
          {hasContactInfo && (
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Helpdesk & Support</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                {footer.supportEmail && footer.supportEmail.trim() !== '' && (
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-brand-400 shrink-0 mt-0.5">mail</span>
                    <a href={`mailto:${footer.supportEmail}`} className="hover:text-brand-400 transition-colors break-all">
                      {footer.supportEmail}
                    </a>
                  </li>
                )}
                {footer.supportPhone && footer.supportPhone.trim() !== '' && (
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-brand-400 shrink-0 mt-0.5">phone</span>
                    <a href={`tel:${footer.supportPhone}`} className="hover:text-brand-400 transition-colors">
                      {footer.supportPhone}
                    </a>
                  </li>
                )}
                {footer.supportAddress && footer.supportAddress.trim() !== '' && (
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-brand-400 shrink-0 mt-0.5">location_on</span>
                    <span className="leading-relaxed">{footer.supportAddress}</span>
                  </li>
                )}
                {footer.workingHours && footer.workingHours.trim() !== '' && (
                  <li className="flex items-start gap-2 text-[11px] text-slate-500 pt-1">
                    <span className="material-symbols-outlined text-[15px] text-slate-500 shrink-0 mt-0.5">schedule</span>
                    <span>{footer.workingHours}</span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom Notice & Copyright Bar (Only rendered if copyright or bottom notice is present) */}
        {(hasCopyright || hasBottomNotice) && (
          <div
            className={`pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center gap-4 text-xs text-slate-500 ${
              hasBottomNotice
                ? 'justify-between text-center md:text-left'
                : 'justify-center text-center w-full'
            }`}
          >
            {hasCopyright && (
              <div className={!hasBottomNotice ? 'text-center w-full' : ''}>
                {footer.copyrightText.replace('{year}', String(currentYear))}
              </div>
            )}

            {hasBottomNotice && (
              <div className="text-[11px] text-slate-400">
                {footer.bottomNotice}
              </div>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
