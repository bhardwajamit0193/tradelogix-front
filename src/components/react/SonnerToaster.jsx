import React from 'react';
import { Toaster } from 'sonner';

/**
 * Global Sonner Toaster container configured for top-center placement
 * and branded theme styling across the TradeLogix platform.
 */
export default function SonnerToaster() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      expand={true}
      duration={3500}
      toastOptions={{
        className: 'font-sans text-xs font-semibold shadow-xl rounded-2xl border border-slate-200/80',
        style: {
          padding: '12px 16px',
        },
      }}
    />
  );
}
