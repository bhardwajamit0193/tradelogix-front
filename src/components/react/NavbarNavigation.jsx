import React, { useState, useEffect } from 'react';
import { fetchPublicPagesApi, DEFAULT_PAGES } from '../../services/pagesService.js';

export default function NavbarNavigation() {
  const [pages, setPages] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }

    const loadNavPages = async () => {
      try {
        const list = await fetchPublicPagesApi();
        if (Array.isArray(list) && list.length > 0) {
          setPages(list.filter((p) => p.isPublished && p.slug !== 'home'));
        }
      } catch (err) {
        console.warn('Could not load dynamic navigation pages:', err);
      }
    };

    loadNavPages();
  }, []);

  const getHref = (slug) => {
    if (!slug || slug === 'home') return '/';
    if (slug === 'shop') return '/shop';
    return `/${slug}`;
  };

  const isActive = (path) => {
    if (path === '/') return currentPath === '/' || currentPath === '';
    return currentPath.startsWith(path);
  };

  return (
    <nav className="flex items-center gap-1">
      {/* Desktop Navigation Links */}
      <div className="hidden lg:flex items-center gap-1">
        <a
          href="/shop"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
            isActive('/shop')
              ? 'text-brand-600 bg-brand-50 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">storefront</span>
          <span>Shop</span>
        </a>

        <a
          href="/about"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            isActive('/about')
              ? 'text-brand-600 bg-brand-50 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          About Us
        </a>

        <a
          href="/contact"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            isActive('/contact')
              ? 'text-brand-600 bg-brand-50 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          Contact
        </a>

        {/* Other custom published pages */}
        {pages
          .filter((p) => !['home', 'shop', 'about', 'contact', 'privacy-policy', 'terms-of-sale', 'refund-policy', 'shipping-policy'].includes(p.slug))
          .map((item) => {
            const href = getHref(item.slug);
            const active = isActive(href);
            return (
              <a
                key={item.id || item.slug}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  active
                    ? 'text-brand-600 bg-brand-50 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {item.title}
              </a>
            );
          })}
      </div>

      {/* Mobile Menu Hamburger Button */}
      <div className="lg:hidden relative">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <span className="material-symbols-outlined text-[22px]">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1 z-50 animate-in fade-in zoom-in-95">
            <a
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/') && currentPath === '/'
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">home</span>
              <span>Home</span>
            </a>

            <a
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/shop')
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">storefront</span>
              <span>Shop Catalog</span>
            </a>

            <a
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/about')
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>About Us</span>
            </a>

            <a
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/contact')
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Contact Us</span>
            </a>

            {pages
              .filter((p) => !['home', 'shop', 'about', 'contact'].includes(p.slug))
              .map((item) => {
                const href = getHref(item.slug);
                const active = isActive(href);
                return (
                  <a
                    key={item.id || item.slug}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      active ? 'text-brand-600 bg-brand-50 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.title}</span>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>}
                  </a>
                );
              })}
          </div>
        )}
      </div>
    </nav>
  );
}
