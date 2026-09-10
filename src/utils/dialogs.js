import Swal from 'sweetalert2';

/**
 * Custom styled SweetAlert2 confirmation dialog matching TradeLogix design system.
 * 
 * @param {Object} options
 * @param {string} [options.title='Are you sure?']
 * @param {string} [options.text='This action cannot be undone.']
 * @param {string} [options.icon='warning'] - 'warning' | 'error' | 'success' | 'info' | 'question'
 * @param {string} [options.confirmButtonText='Yes, Proceed']
 * @param {string} [options.cancelButtonText='Cancel']
 * @param {string} [options.confirmButtonColor='#dc2626']
 * @param {string} [options.cancelButtonColor='#64748b']
 * @returns {Promise<boolean>} Resolves to true if confirmed, false otherwise
 */
export async function confirmDialog({
  title = 'Are you sure?',
  text = 'This action cannot be undone.',
  icon = 'warning',
  confirmButtonText = 'Yes, Proceed',
  cancelButtonText = 'Cancel',
  confirmButtonColor = '#dc2626',
  cancelButtonColor = '#64748b',
} = {}) {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor,
    cancelButtonColor,
    reverseButtons: true,
    focusCancel: true,
    buttonsStyling: true,
    customClass: {
      popup: 'rounded-3xl p-6 font-sans text-slate-800 shadow-2xl border border-slate-100',
      title: 'text-lg font-black font-display text-slate-900 tracking-tight',
      htmlContainer: 'text-xs text-slate-600 leading-relaxed mt-2',
      confirmButton: 'rounded-xl px-5 py-2.5 font-bold text-xs shadow-md mx-1',
      cancelButton: 'rounded-xl px-5 py-2.5 font-bold text-xs mx-1',
    },
  });

  return Boolean(result.isConfirmed);
}

export { Swal };
export default confirmDialog;
