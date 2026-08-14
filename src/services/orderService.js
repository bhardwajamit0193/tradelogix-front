export const INITIAL_ORDERS = [
  {
    id: 'ORD-9842',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@example.com',
    date: '2026-08-12',
    total: 388.99,
    status: 'Processing',
    itemsCount: 2,
    shippingAddress: '742 Evergreen Terrace, Springfield, OR',
    items: [
      { name: 'AeroPulse ANC Wireless Headphones', qty: 1, price: 299.99 },
      { name: 'LuminaDesk Ergonomic LED Lamp', qty: 1, price: 89.00 },
    ],
  },
  {
    id: 'ORD-9841',
    customerName: 'Marcus Vance',
    customerEmail: 'marcus.vance@techcorp.com',
    date: '2026-08-11',
    total: 1199.00,
    status: 'Shipped',
    itemsCount: 1,
    shippingAddress: '100 Market St, Suite 400, San Francisco, CA',
    items: [
      { name: 'OmniView 34" Curved OLED Monitor', qty: 1, price: 1199.00 },
    ],
  },
  {
    id: 'ORD-9840',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@designstudio.io',
    date: '2026-08-10',
    total: 408.50,
    status: 'Delivered',
    itemsCount: 2,
    shippingAddress: '450 Lexington Ave, New York, NY',
    items: [
      { name: 'CraftKey Pro Mechanical Keyboard', qty: 1, price: 189.50 },
      { name: 'HyperDrive NVMe Portable SSD 2TB', qty: 1, price: 219.00 },
    ],
  },
  {
    id: 'ORD-9839',
    customerName: 'David Kalu',
    customerEmail: 'david.kalu@gmail.com',
    date: '2026-08-09',
    total: 129.99,
    status: 'Delivered',
    itemsCount: 1,
    shippingAddress: '1200 Peachtree St, Atlanta, GA',
    items: [
      { name: 'Vortex Precision Wireless Gaming Mouse', qty: 1, price: 129.99 },
    ],
  },
  {
    id: 'ORD-9838',
    customerName: 'Chloe Bennett',
    customerEmail: 'chloe.b@startup.co',
    date: '2026-08-08',
    total: 428.99,
    status: 'Pending',
    itemsCount: 2,
    shippingAddress: '88 Eighth Ave, Seattle, WA',
    items: [
      { name: 'PulseBand Ultra Smart Watch', qty: 1, price: 349.00 },
      { name: 'NovaStation 7-in-1 USB-C Dock', qty: 1, price: 79.99 },
    ],
  },
];

let ordersState = [...INITIAL_ORDERS];

export function getOrders() {
  return ordersState;
}

export function updateOrderStatus(orderId, newStatus) {
  ordersState = ordersState.map((ord) =>
    ord.id === orderId ? { ...ord, status: newStatus } : ord
  );
  return ordersState;
}

export function createOrder({ customerName, customerEmail, shippingAddress, items, total }) {
  const newOrder = {
    id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
    customerName,
    customerEmail,
    date: new Date().toISOString().split('T')[0],
    total,
    status: 'Pending',
    itemsCount: items.reduce((acc, i) => acc + i.quantity, 0),
    shippingAddress,
    items: items.map((i) => ({ name: i.name, qty: i.quantity, price: i.price })),
  };
  ordersState = [newOrder, ...ordersState];
  return newOrder;
}
