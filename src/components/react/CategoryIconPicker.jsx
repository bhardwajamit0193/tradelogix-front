import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Sparkles,
  Check,
  ChevronDown,
} from 'lucide-react';
import {
  CATEGORY_ICONS_MAP,
  CATEGORY_ICONS_GROUPS,
  resolveCategoryIcon,
} from '../../utils/categoryIcons.js';

export default function CategoryIconPicker({
  value = '',
  onChange,
  categoryName = '',
  label = 'Category Icon',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');

  const CurrentIcon = resolveCategoryIcon(value, categoryName);

  // Filter icons based on search query and selected group
  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();

    return CATEGORY_ICONS_GROUPS.map((grp) => {
      if (selectedGroup !== 'All' && grp.group !== selectedGroup) {
        return null;
      }

      const matchedIcons = grp.icons.filter((item) => {
        if (!q) return true;
        return (
          item.id.toLowerCase().includes(q) ||
          item.label.toLowerCase().includes(q) ||
          grp.group.toLowerCase().includes(q)
        );
      });

      if (matchedIcons.length === 0) return null;

      return {
        ...grp,
        icons: matchedIcons,
      };
    }).filter(Boolean);
  }, [search, selectedGroup]);

  const handleSelect = (iconId) => {
    if (onChange) {
      onChange(iconId);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    if (onChange) {
      onChange('');
    }
    setIsOpen(false);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
          <span>{label}</span>
          {value ? (
            <span className="text-[10px] text-brand-600 font-semibold bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200/50">
              Custom: {value}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-normal">
              Auto-detected
            </span>
          )}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-300 hover:border-brand-400 rounded-xl text-xs transition-all text-left group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform shrink-0">
            <CurrentIcon className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="font-bold text-slate-800 truncate">
              {value ? value : (categoryName ? `Auto: based on "${categoryName}"` : 'Select an Icon')}
            </div>
            <div className="text-[10px] text-slate-400">
              {value ? 'Custom icon chosen for storefront' : 'Click to customize category icon'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-brand-600 shrink-0 ml-2">
          <span className="text-[11px] font-semibold">Choose</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </button>

      {/* Icon Picker Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Select Category Icon</h3>
                  <p className="text-[11px] text-slate-500">
                    This icon will display in the Category Bar and storefront menus.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search and Filters Bar */}
            <div className="p-4 border-b border-slate-100 space-y-3 bg-white shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search icons by name (e.g. headphones, screen, cpu, tool, zap)..."
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200 transition-all"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Group Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                {['All', ...CATEGORY_ICONS_GROUPS.map((g) => g.group)].map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setSelectedGroup(grp)}
                    className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                      selectedGroup === grp
                        ? 'bg-brand-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {grp}
                  </button>
                ))}
              </div>
            </div>

            {/* Icons Grid Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {filteredGroups.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    No icons match "{search}"
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setSelectedGroup('All');
                    }}
                    className="text-xs text-brand-600 font-bold hover:underline"
                  >
                    Clear search filter
                  </button>
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <div key={group.group} className="space-y-2">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                      {group.group}
                    </h4>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {group.icons.map((item) => {
                        const IconComponent = item.icon;
                        const isSelected = value === item.id;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelect(item.id)}
                            className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border transition-all relative group/icon ${
                              isSelected
                                ? 'bg-brand-50 border-brand-500 text-brand-600 ring-2 ring-brand-200/60 shadow-2xs font-bold'
                                : 'bg-white border-slate-200/80 hover:border-brand-300 hover:bg-slate-50 text-slate-700 hover:text-brand-600'
                            }`}
                          >
                            {isSelected && (
                              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-brand-600 text-white rounded-full flex items-center justify-center">
                                <Check className="w-2.5 h-2.5" />
                              </span>
                            )}
                            <IconComponent className="w-5 h-5 group-hover/icon:scale-110 transition-transform" />
                            <span className="text-[10px] leading-tight text-center truncate w-full">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline"
              >
                Reset to Auto-Detect
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
