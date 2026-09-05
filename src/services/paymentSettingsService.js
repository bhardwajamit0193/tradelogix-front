const SETTINGS_STORAGE_KEY = 'tradelogix_payment_settings_v1';
const API_URL = import.meta.env.PUBLIC_API_URL || (typeof window !== 'undefined' && window.__PUBLIC_API_URL__) || 'http://localhost:6543';

export const DEFAULT_PAYMENT_SETTINGS = {
  razorpayEnabled: true,
  razorpayKeyId: '',
  razorpayKeySecret: '',
  offlineTransferEnabled: true,
  bankBeneficiaryName: '',
  bankAccountNumber: '',
  bankIfscCode: '',
  bankName: '',
  bankBranch: '',
  bankAccountType: '',
  codEnabled: false,
  codMaxLimit: 50000,
  partialCodEnabled: true,
  partialCodPercentage: 10,
};

export function normalizeSettings(data) {
  if (!data || typeof data !== 'object') return { ...DEFAULT_PAYMENT_SETTINGS };
  const raw = data.data && typeof data.data === 'object' ? data.data : data;
  return {
    razorpayEnabled: raw.razorpayEnabled !== undefined ? Boolean(raw.razorpayEnabled) : true,
    razorpayKeyId: raw.razorpayKeyId ?? '',
    razorpayKeySecret: raw.razorpayKeySecret ?? '',
    offlineTransferEnabled: raw.offlineTransferEnabled !== undefined ? Boolean(raw.offlineTransferEnabled) : true,
    bankBeneficiaryName: raw.bankBeneficiaryName ?? '',
    bankAccountNumber: raw.bankAccountNumber ?? '',
    bankIfscCode: raw.bankIfscCode ?? '',
    bankName: raw.bankName ?? '',
    bankBranch: raw.bankBranch ?? '',
    bankAccountType: raw.bankAccountType ?? '',
    codEnabled: raw.codEnabled !== undefined ? Boolean(raw.codEnabled) : false,
    codMaxLimit: parseFloat(raw.codMaxLimit) || 50000,
    partialCodEnabled: raw.partialCodEnabled !== undefined ? Boolean(raw.partialCodEnabled) : true,
    partialCodPercentage: parseFloat(raw.partialCodPercentage) || 10,
  };
}

export function getPaymentSettings() {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return normalizeSettings(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to read payment settings', e);
    }
  }
  return { ...DEFAULT_PAYMENT_SETTINGS };
}

export function savePaymentSettings(newSettings) {
  const merged = normalizeSettings(newSettings);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent('tradelogix_payment_settings_updated', { detail: merged }));
    } catch (e) {
      console.error('Failed to save payment settings', e);
    }
  }
  return merged;
}

/**
 * Public Storefront Payment Options (Checkout Page)
 * Uses public endpoint which never returns the secret key.
 */
export async function fetchPaymentSettingsApi() {
  try {
    const endpoints = [
      `${API_URL}/api/payment-options`,
      `${API_URL}/api/settings/payments`,
      `${API_URL}/settings/payments`,
      `/api/settings/payments`,
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            return savePaymentSettings(data);
          }
        }
      } catch (err) {}
    }
  } catch (e) {
    console.warn('Storefront payment options fetch fallback to local cache', e);
  }
  return getPaymentSettings();
}

/**
 * Admin Payment Settings (Admin Settings Dashboard)
 */
export async function fetchAdminPaymentSettingsApi(token) {
  try {
    const endpoints = [
      `${API_URL}/api/admin/settings/payments`,
      `${API_URL}/admin/settings/payments`,
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (data) {
            return savePaymentSettings(data);
          }
        }
      } catch (err) {}
    }
  } catch (e) {
    console.warn('Admin settings fetch unavailable, using local cache', e);
  }
  return getPaymentSettings();
}

export async function updatePaymentSettingsApi(token, settingsPayload) {
  const saved = savePaymentSettings(settingsPayload);
  try {
    const endpoints = [
      `${API_URL}/api/admin/settings/payments`,
      `${API_URL}/admin/settings/payments`,
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(settingsPayload),
        });
        if (res.ok) {
          const data = await res.json();
          if (data) {
            return savePaymentSettings(data);
          }
        }
      } catch (err) {}
    }
  } catch (e) {
    console.warn('Backend update failed, saved locally', e);
  }
  return saved;
}
