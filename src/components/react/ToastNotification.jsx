import React from 'react';
import { useStore } from '@nanostores/react';
import { cartNotification } from '../../store/cartStore.js';
import { CheckCircle2 } from 'lucide-react';

export default function ToastNotification() {
  const message = useStore(cartNotification);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div className="glass-panel px-4 py-3 rounded-2xl border border-brand-300 shadow-xl flex items-center gap-3 text-sm font-medium text-slate-900 bg-white/95">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  );
}
