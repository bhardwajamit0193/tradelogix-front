import React, { useEffect } from 'react';
import { Toaster, toast } from 'sonner';

/**
 * Global Sonner Toaster container configured for top-center placement
 * and branded theme styling across the TradeLogix platform.
 */
export default function SonnerToaster() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.toast = toast;
      window.toastMessage = (msg, type = 'success') => {
        const text = typeof msg === 'object' && msg !== null
          ? (msg.text || msg.message || JSON.stringify(msg))
          : String(msg || '');
        if (type === 'error') toast.error(text);
        else if (type === 'warning') toast.warning(text);
        else if (type === 'info') toast.info(text);
        else toast.success(text);
      };
    }
  }, []);

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
