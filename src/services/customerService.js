import { fetchWithAuth, userStore } from '../store/authStore.js';

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

/**
 * Fetch Customer Profile
 */
export async function fetchCustomerProfileApi(explicitToken) {
  const currentUser = userStore.get();
  const token = explicitToken || currentUser?.accessToken || getStoredToken();
  if (!token || !currentUser?.isLoggedIn) return null;

  const endpoints = [
    `${API_URL}/api/dashboard/profile`,
    `${API_URL}/api/customers/profile`,
    `${API_URL}/customers/profile`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetchWithAuth(url);
      if (res.ok) {
        const data = await res.json();
        return data.data || data;
      }
    } catch (e) {}
  }
  return null;
}

/**
 * Update Customer Profile
 */
export async function updateCustomerProfileApi(explicitToken, payload) {
  const currentUser = userStore.get();
  const token = explicitToken || currentUser?.accessToken || getStoredToken();
  if (!token || !currentUser?.isLoggedIn) return null;

  const endpoints = [
    `${API_URL}/api/dashboard/profile`,
    `${API_URL}/api/customers/profile`,
    `${API_URL}/customers/profile`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetchWithAuth(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return data.data || data;
      }
    } catch (e) {}
  }
  return null;
}

/**
 * Fetch Customer Addresses
 */
export async function fetchCustomerAddressesApi(explicitToken) {
  const currentUser = userStore.get();
  const token = explicitToken || currentUser?.accessToken || getStoredToken();
  if (!token || !currentUser?.isLoggedIn) return [];

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
        return Array.isArray(data) ? data : (data.data || []);
      }
    } catch (e) {}
  }
  return [];
}

/**
 * Save/Upsert Customer Address
 */
export async function saveCustomerAddressApi(explicitToken, addressData) {
  const currentUser = userStore.get();
  const token = explicitToken || currentUser?.accessToken || getStoredToken();
  if (!token || !currentUser?.isLoggedIn) return null;

  const endpoints = [
    `${API_URL}/api/dashboard/addresses`,
    `${API_URL}/api/customers/addresses`,
    `${API_URL}/customers/addresses`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetchWithAuth(url, {
        method: 'POST',
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
          isDefault: true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.data || data;
      }
    } catch (e) {}
  }
  return null;
}

/**
 * Fetch Customer Orders
 */
export async function fetchCustomerOrdersApi(explicitToken) {
  const currentUser = userStore.get();
  const token = explicitToken || currentUser?.accessToken || getStoredToken();
  if (!token || !currentUser?.isLoggedIn) return [];

  const endpoints = [
    `${API_URL}/api/dashboard/orders`,
    `${API_URL}/api/orders`,
    `${API_URL}/orders`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetchWithAuth(url);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.data || []);
        return list;
      }
    } catch (e) {}
  }
  return [];
}

/**
 * Fetch Customer Single Order Details
 */
export async function fetchCustomerOrderDetailApi(explicitToken, orderId) {
  const currentUser = userStore.get();
  const token = explicitToken || currentUser?.accessToken || getStoredToken();
  if (!token || !currentUser?.isLoggedIn || !orderId) return null;

  const endpoints = [
    `${API_URL}/api/dashboard/orders/${encodeURIComponent(orderId)}`,
    `${API_URL}/api/orders/${encodeURIComponent(orderId)}`,
    `${API_URL}/orders/${encodeURIComponent(orderId)}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetchWithAuth(url);
      if (res.ok) {
        const data = await res.json();
        return data.data || data;
      }
    } catch (e) {}
  }
  return null;
}

/**
 * Send OTP to New Mobile Number (with uniqueness validation)
 */
export async function sendPhoneChangeOtpApi(mobileNumber) {
  const cleanNumber = mobileNumber.replace(/\D/g, '').slice(-10);
  const endpoints = [
    `${API_URL}/api/dashboard/change-phone/send-otp`,
    `${API_URL}/api/customers/change-phone/send-otp`,
    `${API_URL}/customers/change-phone/send-otp`,
    `${API_URL}/api/auth/otp/send`,
    `${API_URL}/auth/otp/send`,
  ];
  for (const url of endpoints) {
    try {
      const res = await fetchWithAuth(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newMobileNumber: cleanNumber, mobileNumber: cleanNumber }),
      });
      const json = await res.json();
      if (res.ok) {
        return json.data || json;
      } else {
        throw new Error(json.message || 'Failed to send verification OTP');
      }
    } catch (e) {
      if (e.message && e.message !== 'Failed to fetch') throw e;
    }
  }
  throw new Error('Could not connect to OTP service');
}

/**
 * Verify OTP & Update Customer Mobile Number
 */
export async function verifyAndUpdatePhoneApi(explicitToken, newMobileNumber, otpCode) {
  const currentUser = userStore.get();
  const token = explicitToken || currentUser?.accessToken || getStoredToken();
  if (!token) throw new Error('Authentication required');

  const cleanNumber = newMobileNumber.replace(/\D/g, '').slice(-10);
  const endpoints = [
    `${API_URL}/api/dashboard/change-phone`,
    `${API_URL}/api/customers/change-phone`,
    `${API_URL}/customers/change-phone`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetchWithAuth(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newMobileNumber: cleanNumber,
          otpCode: otpCode.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to update mobile number');
      }

      // Update local auth store state with the new verified mobile number
      if (currentUser) {
        userStore.set({
          ...currentUser,
          mobileNumber: cleanNumber,
          mobile: cleanNumber,
        });
      }

      return json.data || json;
    } catch (e) {
      if (e.message && e.message !== 'Failed to fetch') throw e;
    }
  }
  throw new Error('Failed to update mobile number');
}
