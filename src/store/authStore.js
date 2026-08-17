import { atom } from 'nanostores';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000';

const getInitialUser = () => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('tradelogix_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load user state', e);
    }
  }
  // Default to guest state so the login page is shown
  return {
    isLoggedIn: false,
    id: null,
    name: 'Guest',
    email: '',
    role: 'guest',
    avatar: null,
  };
};

export const userStore = atom(getInitialUser());

if (typeof window !== 'undefined') {
  userStore.subscribe((user) => {
    try {
      if (user) {
        localStorage.setItem('tradelogix_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('tradelogix_user');
      }
    } catch (e) {
      console.error('Failed to save user session', e);
    }
  });
}

// Set active session from authenticated response
export const setSession = (session) => {
  const userPayload = {
    isLoggedIn: true,
    id: session.userId,
    name: session.email ? session.email.split('@')[0].replace('.', ' ').toUpperCase() : 'B2B BUYER',
    email: session.email || '',
    role: session.role || 'Customer',
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  };
  userStore.set(userPayload);
  return userPayload;
};

// API Helpers
export const signInApi = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Invalid email or password');
  }
  const json = await res.json();
  return json.data;
};

export const sendOtpApi = async (mobileNumber) => {
  const res = await fetch(`${API_URL}/auth/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobileNumber }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to send OTP');
  }
  const json = await res.json();
  return json.data;
};

export const verifyOtpApi = async (mobileNumber, code) => {
  const res = await fetch(`${API_URL}/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobileNumber, code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to verify OTP');
  }
  const json = await res.json();
  return json.data;
};

export const verifyGstApi = async (gstin) => {
  const res = await fetch(`${API_URL}/auth/gst/verify/${gstin}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to verify GSTIN');
  }
  const json = await res.json();
  return json.data;
};

export const registerB2bCustomerApi = async (formData) => {
  const res = await fetch(`${API_URL}/auth/b2b/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to register customer');
  }
  const json = await res.json();
  return json.data;
};

export const loginUser = (email, password, role = 'customer') => {
  const newUser = {
    isLoggedIn: true,
    id: 'usr_cust_' + Math.floor(Math.random() * 1000),
    name: email.split('@')[0].replace('.', ' ').toUpperCase(),
    email,
    role,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  };
  userStore.set(newUser);
  return newUser;
};

export const logoutUser = () => {
  userStore.set({
    isLoggedIn: false,
    id: null,
    name: 'Guest',
    email: '',
    role: 'guest',
    avatar: null,
  });
};

let refreshPromise = null;

export const refreshAccessToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const currentUser = userStore.get();
      if (!currentUser || !currentUser.refreshToken || !currentUser.id) {
        throw new Error('No refresh token available');
      }

      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          refreshToken: currentUser.refreshToken,
        }),
      });

      if (!res.ok) {
        logoutUser();
        throw new Error('Session expired. Please log in again.');
      }

      const json = await res.json();
      const tokens = json.data;

      const updatedUser = {
        ...currentUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
      userStore.set(updatedUser);

      return tokens.accessToken;
    } catch (e) {
      logoutUser();
      throw e;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const getCustomersApi = async (token, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${API_URL}/customers${query ? '?' + query : ''}`;
  const activeToken = token || userStore.get()?.accessToken;

  let res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${activeToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (res.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error('Auto refresh failed on getCustomersApi', err);
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch B2B customers');
  }
  const json = await res.json();
  return json.data;
};

export const updateCustomerStatusApi = async (token, customerId, statusPayload) => {
  const url = `${API_URL}/customers/${customerId}/status`;
  const activeToken = token || userStore.get()?.accessToken;

  let res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${activeToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(statusPayload)
  });

  if (res.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(statusPayload)
      });
    } catch (err) {
      console.error('Auto refresh failed on updateCustomerStatusApi', err);
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update customer status');
  }
  const json = await res.json();
  return json.data;
};

export const deleteCustomerApi = async (token, customerId) => {
  const url = `${API_URL}/customers/${customerId}`;
  const activeToken = token || userStore.get()?.accessToken;

  let res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${activeToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (res.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error('Auto refresh failed on deleteCustomerApi', err);
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete customer');
  }
  const json = await res.json();
  return json.data;
};

export const getCustomerByIdApi = async (token, customerId) => {
  const url = `${API_URL}/customers/${customerId}`;
  const activeToken = token || userStore.get()?.accessToken;

  let res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${activeToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (res.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error('Auto refresh failed on getCustomerByIdApi', err);
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch customer profile');
  }
  const json = await res.json();
  return json.data;
};


