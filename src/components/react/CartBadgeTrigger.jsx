import React from 'react';
import { useStore } from '@nanostores/react';
import { cartItemCount, toggleCart } from '../../store/cartStore.js';
import { ShoppingCart } from 'lucide-react';

export default function CartBadgeTrigger() {
  const count = useStore(cartItemCount);

  return (
    <button
      onClick={() => toggleCart(true)}
      className="relative p-2.5 rounded-full text-gray-300 hover:text-white hover:bg-white/5 transition-all focus:outline-none group"
      aria-label="Open Shopping Cart"
    >
      <ShoppingCart className="w-5 h-5 text-gray-300 group-hover:text-brand-400 transition-colors" />
      
      {/* Glowing Blue Dot Indicator matching user screenshot & docs/home.html */}
      {count > 0 && (
        <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-brand-500 text-white text-[9px] font-extrabold items-center justify-center shadow-glow-primary border border-[#0b0f19]">
            {count}
          </span>
        </span>
      )}
    </button>
  );
}
