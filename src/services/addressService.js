import { fetchWithAuth, userStore } from '../store/authStore.js';

const ADDRESS_STORAGE_KEY = 'tradelogix_saved_addresses_v1';
const API_URL = import.meta.env.PUBLIC_API_URL || (typeof window !== 'undefined' && window.__PUBLIC_API_URL__) || 'http://localhost:6543';

const getStoredToken = () => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('tradelogix_user');
      if (saved) {
        const u = JSON.parse(saved);
        return u.accessToken;
      }
    } catch (e) {}
  }
  return null;
};

export function getSavedAddresses() {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(ADDRESS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved addresses', e);
    }
  }
  return [];
}

export function saveAddress(newAddress, token = null) {
  const addresses = getSavedAddresses();
  const addressType = newAddress.type || 'Shipping';
  const id = newAddress.id || `addr-${addressType.toLowerCase()}`;
  const addressItem = { ...newAddress, id, type: addressType, isDefault: true };

  // Keep only 1 shipping and 1 billing address
  const otherAddresses = addresses.filter((a) => (a.type || 'Shipping').toLowerCase() !== addressType.toLowerCase());
  const updated = [addressItem, ...otherAddresses];

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist address', e);
    }
  }

  // Push to backend API if logged in
  const currentUser = userStore.get();
  if (currentUser?.isLoggedIn) {
    saveCustomerAddressApi(token || currentUser.accessToken, addressItem).catch((e) =>
      console.warn('Background address API sync error:', e)
    );
  }

  return updated;
}

export async function fetchCustomerAddressesApi(explicitToken) {
  const currentUser = userStore.get();
  const token = explicitToken || currentUser?.accessToken || getStoredToken();
  if (!token || !currentUser?.isLoggedIn) {
    return getSavedAddresses();
  }

  const endpoints = [
    `${API_URL}/api/dashboard/addresses`,
    `${API_URL}/api/customers/addresses`,
    `${API_URL}/customers/addresses`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetchWithAuth(url);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.data || []);
        if (typeof window !== 'undefined') {
          localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(list));
        }
        return list;
      }
    } catch (e) {}
  }
  return getSavedAddresses();
}

export async function saveCustomerAddressApi(token, addressData) {
  const currentUser = userStore.get();
  if (!currentUser?.isLoggedIn && !token) {
    return null;
  }

  try {
    const isEdit = addressData.id && !addressData.id.startsWith('addr-custom-') && !addressData.id.startsWith('addr-shipping') && !addressData.id.startsWith('addr-billing');
    const url = isEdit ? `${API_URL}/api/customers/addresses/${addressData.id}` : `${API_URL}/api/customers/addresses`;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetchWithAuth(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: addressData.type || 'Shipping',
        title: addressData.title || (addressData.type === 'Billing' ? 'Invoicing Address' : 'Shipping Address'),
        name: addressData.name,
        phone: addressData.phone,
        email: addressData.email,
        addressLine1: addressData.addressLine1,
        addressLine2: addressData.addressLine2 || '',
        city: addressData.city,
        state: addressData.state,
        pincode: addressData.pincode,
        isDefault: Boolean(addressData.isDefault),
      }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('saveCustomerAddressApi error:', e);
  }
  return null;
}
