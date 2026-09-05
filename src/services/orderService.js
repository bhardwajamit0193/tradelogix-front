const STORAGE_KEY = 'tradelogix_orders_master_v2';
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

const loadOrdersFromStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load orders from storage', e);
    }
  }
  return [];
};

const saveOrdersToStorage = (orders) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to storage', e);
    }
  }
};

let ordersState = loadOrdersFromStorage();

export function getOrders() {
  ordersState = loadOrdersFromStorage();
  return ordersState;
}

export function getOrderById(orderId) {
  const allOrders = getOrders();
  return allOrders.find((ord) => ord.id === orderId || ord.id === `TLX-${orderId}` || ord.id.replace('TLX-', '') === orderId);
}

export async function fetchOrderByIdApi(orderId, explicitToken) {
  if (!orderId) return null;
  const token = explicitToken || getStoredToken();
  const cleanId = String(orderId).trim();

  const endpoints = [
    `${API_URL}/api/admin/orders/${encodeURIComponent(cleanId)}`,
    `${API_URL}/api/orders/${encodeURIComponent(cleanId)}`,
    `${API_URL}/orders/${encodeURIComponent(cleanId)}`,
    `${API_URL}/admin/orders/${encodeURIComponent(cleanId)}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          data.total = parseFloat(data.totalAmount || data.total || 0);
          data.subtotal = parseFloat(data.subtotal || 0);
          data.taxAmount = parseFloat(data.taxAmount || 0);
          return data;
        }
      }
    } catch (e) {}
  }

  // Fallback: fetch all orders and search by ID
  try {
    const all = await fetchOrdersApi(token);
    const possible = [
      cleanId,
      cleanId.replace('TLX-', ''),
      cleanId.replace('TLX-ORD-', ''),
      `TLX-${cleanId}`,
      `TLX-ORD-${cleanId}`,
    ];
    const found = all.find((o) => possible.some((p) => o.id === p || o.id.replace('TLX-ORD-', '') === p.replace('TLX-ORD-', '')));
    if (found) {
      found.total = parseFloat(found.totalAmount || found.total || 0);
      found.subtotal = parseFloat(found.subtotal || 0);
      found.taxAmount = parseFloat(found.taxAmount || 0);
      return found;
    }
  } catch (err) {}

  return getOrderById(cleanId);
}

export async function fetchOrdersApi(explicitToken) {
  const token = explicitToken || getStoredToken();
  const endpoints = [
    `${API_URL}/api/admin/orders`,
    `${API_URL}/api/orders`,
    `${API_URL}/orders`,
    `${API_URL}/admin/orders`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : (data.data || []);
        const list = rawList.map((ord) => ({
          ...ord,
          total: parseFloat(ord.totalAmount || ord.total || 0),
          subtotal: parseFloat(ord.subtotal || 0),
          taxAmount: parseFloat(ord.taxAmount || 0),
        }));
        saveOrdersToStorage(list);
        ordersState = list;
        return list;
      }
    } catch (e) {}
  }
  return getOrders();
}

export async function createOrder({
  customerName,
  customerEmail,
  customerMobile,
  companyName,
  gstin,
  shippingAddress,
  billingAddress,
  isBillingSameAsShipping = false,
  orderRemarks = '',
  paymentMethod = 'COD',
  paymentStatus = 'Pending',
  offlineUtrNumber = '',
  partialOnlineAmount = 0,
  partialCodAmount = 0,
  razorpayPaymentId = null,
  razorpayOrderId = null,
  couponCode = null,
  discountAmount = 0,
  items = [],
  subtotal = 0,
  taxAmount = 0,
  shippingCharge = 0,
  total = 0,
  token = null,
}) {
  const authToken = token || getStoredToken();
  const currentOrders = getOrders();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const localOrderId = `TLX-ORD-${randomSuffix}`;

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const localOrder = {
    id: localOrderId,
    customerName: customerName || shippingAddress?.name || 'Customer',
    customerEmail: customerEmail || shippingAddress?.email || '',
    customerMobile: customerMobile || shippingAddress?.phone || '',
    companyName: companyName || '',
    gstin: gstin || '',
    date: dateStr,
    createdAt: now.toISOString(),
    subtotal: subtotal || (total ? total * 0.847 : 0),
    taxAmount: taxAmount || (total ? total * 0.153 : 0),
    shippingCharge: shippingCharge || 0,
    total: total,
    couponCode: couponCode || null,
    discountAmount: parseFloat(discountAmount) || 0,
    status: paymentMethod === 'Razorpay' && paymentStatus === 'Paid' ? 'Processing' : 'Pending',
    fulfillmentStatus: paymentMethod === 'Razorpay' && paymentStatus === 'Paid' ? 'Processing' : 'Pending',
    paymentMethod,
    paymentStatus,
    razorpayOrderId,
    razorpayPaymentId,
    offlineUtrNumber: offlineUtrNumber || null,
    isOfflineVerified: false,
    offlineVerifiedAt: null,
    partialOnlineAmount: partialOnlineAmount || 0,
    partialCodAmount: partialCodAmount || 0,
    isPartialBalanceCollected: false,
    partialBalanceCollectedAt: null,
    orderRemarks: orderRemarks || null,
    shippingAddress: shippingAddress || null,
    billingAddress: isBillingSameAsShipping ? shippingAddress : billingAddress,
    isBillingSameAsShipping,
    itemsCount: items.reduce((acc, i) => acc + (i.quantity || i.qty || 1), 0),
    items: items.map((i, idx) => ({
      id: i.id || `item-gen-${idx}`,
      name: i.name || i.title || 'Product Item',
      sku: i.sku || `SKU-${idx + 1}`,
      qty: i.quantity || i.qty || 1,
      price: i.price || 0,
    })),
  };

  // Attempt to save to PostgreSQL database
  try {
    const payload = {
      paymentMethod,
      shippingAddress: localOrder.shippingAddress,
      billingAddress: localOrder.billingAddress,
      isBillingSameAsShipping: localOrder.isBillingSameAsShipping,
      orderRemarks: localOrder.orderRemarks,
      offlineUtrNumber: localOrder.offlineUtrNumber,
      partialOnlineAmount: localOrder.partialOnlineAmount,
      partialCodAmount: localOrder.partialCodAmount,
      couponCode: localOrder.couponCode,
      discountAmount: localOrder.discountAmount,
      items: items.map((it) => ({
        productId: it.id,
        quantity: it.quantity || it.qty || 1,
        unitPrice: it.price || 0,
      })),
    };

    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const dbOrder = await res.json();
      const finalOrder = {
        ...localOrder,
        id: dbOrder.id || localOrder.id,
        total: parseFloat(dbOrder.totalAmount) || localOrder.total,
        subtotal: parseFloat(dbOrder.subtotal) || localOrder.subtotal,
        taxAmount: parseFloat(dbOrder.taxAmount) || localOrder.taxAmount,
        couponCode: dbOrder.couponCode || localOrder.couponCode,
        discountAmount: parseFloat(dbOrder.discountAmount) || localOrder.discountAmount,
        status: dbOrder.status || localOrder.status,
        fulfillmentStatus: dbOrder.fulfillmentStatus || localOrder.fulfillmentStatus,
      };

      const updated = [finalOrder, ...currentOrders.filter((o) => o.id !== finalOrder.id)];
      ordersState = updated;
      saveOrdersToStorage(updated);
      return finalOrder;
    }
  } catch (e) {
    console.warn('Backend DB order save fallback to local state', e);
  }

  // Fallback to local
  const updatedOrders = [localOrder, ...currentOrders];
  ordersState = updatedOrders;
  saveOrdersToStorage(updatedOrders);
  return localOrder;
}

export async function updateOrderStatus(orderId, newStatus) {
  const token = getStoredToken();
  const currentOrders = getOrders();
  const updated = currentOrders.map((ord) =>
    ord.id === orderId ? { ...ord, status: newStatus, fulfillmentStatus: newStatus, updatedAt: new Date().toISOString() } : ord
  );
  ordersState = updated;
  saveOrdersToStorage(updated);

  try {
    await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status: newStatus }),
    });
  } catch (e) {
    console.warn('Status API update failed', e);
  }
  return updated;
}

export async function verifyOfflinePayment(orderId, adminNotes = '') {
  const token = getStoredToken();
  const currentOrders = getOrders();
  const now = new Date();
  const updated = currentOrders.map((ord) => {
    if (ord.id === orderId) {
      return {
        ...ord,
        paymentStatus: 'Paid (Verified NEFT)',
        isOfflineVerified: true,
        offlineVerifiedAt: now.toISOString(),
        status: ord.status === 'Pending' ? 'Processing' : ord.status,
        fulfillmentStatus: ord.fulfillmentStatus === 'Pending' ? 'Processing' : ord.fulfillmentStatus,
        adminNotes: adminNotes || ord.adminNotes,
        updatedAt: now.toISOString(),
      };
    }
    return ord;
  });
  ordersState = updated;
  saveOrdersToStorage(updated);

  try {
    await fetch(`${API_URL}/orders/${orderId}/verify-offline`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ adminNotes }),
    });
  } catch (e) {
    console.warn('Offline verify API update failed', e);
  }
  return updated;
}

export async function collectPartialBalance(orderId, notes = '') {
  const token = getStoredToken();
  const currentOrders = getOrders();
  const now = new Date();
  const updated = currentOrders.map((ord) => {
    if (ord.id === orderId) {
      return {
        ...ord,
        paymentStatus: 'Fully Paid (COD Cleared)',
        isPartialBalanceCollected: true,
        partialBalanceCollectedAt: now.toISOString(),
        adminNotes: notes || ord.adminNotes,
        updatedAt: now.toISOString(),
      };
    }
    return ord;
  });
  ordersState = updated;
  saveOrdersToStorage(updated);

  try {
    await fetch(`${API_URL}/orders/${orderId}/collect-partial-balance`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ notes }),
    });
  } catch (e) {
    console.warn('Collect partial balance API update failed', e);
  }
  return updated;
}
