import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.PUBLIC_API_URL || (typeof window !== 'undefined' && window.__PUBLIC_API_URL__) || 'http://localhost:6543';

export default function NavbarSearch() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Sync initial value from current URL query
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      const search = params.get('search');
      if (cat) setSelectedCategory(cat);
      if (search) setSearchTerm(search);
    }

    // Fetch dynamic categories from API
    async function loadCategories() {
      try {
        const res = await fetch(`${API_URL}/api/all-categories`);
        if (res.ok) {
          const json = await res.json();
          const items = json?.data || json || [];
          if (Array.isArray(items)) {
            setCategories(items);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch navbar search categories from API:', err);
      }
    }
    loadCategories();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
    
    const query = params.toString();
    window.location.href = `/shop${query ? `?${query}` : ''}`;
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-xl mx-4 hidden md:block">
      <div className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-[20px] pointer-events-none">
          search
        </span>
        <input
          type="text"
          name="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search bulk hardware, audio gear, displays..."
          className="w-full h-11 pl-11 pr-36 rounded-xl border border-slate-200 bg-white/80 focus:bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-2xs"
        />
        <div className="absolute right-1 top-1 bottom-1 flex items-center border-l border-slate-200 px-2 bg-slate-100/90 rounded-r-lg">
          <select
            name="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent border-none text-[11px] font-semibold text-slate-700 focus:ring-0 cursor-pointer pr-4 outline-none"
          >
            <option value="All" className="bg-white text-slate-900">
              All Categories
            </option>
            {categories.map((cat) => (
              <option key={cat.id || cat.name} value={cat.name} className="bg-white text-slate-900">
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </form>
  );
}
