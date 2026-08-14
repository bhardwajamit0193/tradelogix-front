import React from 'react';
import { useStore } from '@nanostores/react';
import { cartItemCount, toggleCart } from '../../store/cartStore.js';
import { ShoppingCart } from 'lucide-react';

export default function CartBadgeTrigger() {
  const count = useStore(cartItemCount);

  return (
    <button
      onClick={() => toggleCart(true)}
      className="relative p-2.5 rounded-full text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all focus:outline-none group"
      aria-label="Open Shopping Cart"
    >
      <ShoppingCart className="w-5 h-5 text-slate-700 group-hover:text-brand-600 transition-colors" />
      
      {/* Glowing Blue Dot Indicator */}
      {count > 0 && (
        <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-brand-600 text-white text-[9px] font-extrabold items-center justify-center border border-white">
            {count}
          </span>
        </span>
      )}
    </button>
  );
}
