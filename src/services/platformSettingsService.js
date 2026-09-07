const API_URL = import.meta.env.PUBLIC_API_URL || (typeof window !== 'undefined' && window.__PUBLIC_API_URL__) || 'http://localhost:6543';

export const DEFAULT_PLATFORM_SETTINGS = {
  companyName: 'TradeLogix Solutions Private Limited',
  companyLogo: 'http://localhost:6543/uploads/1788592719273-logo.jpeg',
  favicon: '/favicon.svg',
  companyAddress: '804, Prime Corporate Park, Marol, Andheri East, Mumbai, Maharashtra - 400059',
  companyPhone: '+91 98201 45892',
  companyEmail: 'accounts@tradelogix.in',
  gstin: '27AAACT9921M1ZT',
  panNumber: 'AAACT9921M',
  cinNumber: 'U72900MH2024PTC123456',
  warehouseLocation: 'Mumbai Central Fulfillment Hub (WH-01)',
  supportEmail: 'support@tradelogix.in',
  websiteUrl: 'https://tradelogix.in',
  currencySymbol: '₹',
};

export const DEFAULT_SMTP_SETTINGS = {
  host: 'smtp.mailgun.org',
  port: 587,
  secure: false,
  username: 'postmaster@tradelogix.in',
  password: '',
  fromEmail: 'no-reply@tradelogix.in',
  fromName: 'TradeLogix Wholesale',
  encryptionType: 'TLS',
  adminNotificationEmails: 'admin@tradelogix.in, orders@tradelogix.in',
  adminAlertNewOrder: true,
  adminAlertPaymentReceived: true,
  adminAlertLowStock: true,
  adminAlertCustomerSignup: false,
  customerOrderInvoiceAttached: true,
};

export const DEFAULT_EMAIL_TEMPLATES = [
  {
    templateKey: 'order_confirmation',
    name: 'Order Confirmation & Tax Invoice (Pending)',
    description: 'Dispatched to customer upon placing wholesale order with attached GST Tax Invoice PDF.',
    category: 'customer',
    subject: 'Order Confirmation: #{orderId} - {companyName}',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <div style="border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px;">
    <h2 style="color: #0f172a; margin: 0; font-size: 20px;">Order Confirmation (Pending Processing)</h2>
    <span style="color: #64748b; font-size: 13px;">Official GST Commercial Tax Document Attached</span>
  </div>
  <p style="font-size: 14px; color: #334155;">Dear <strong>{customerName}</strong>,</p>
  <p style="font-size: 14px; color: #334155;">Thank you for your order! We have received your wholesale order <strong>#{orderId}</strong> placed on {orderDate}.</p>
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
    <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Invoice No:</strong> <span style="font-family: monospace; color: #0f172a;">{invoiceNumber}</span></p>
    <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Payment Method:</strong> {paymentMethod}</p>
    <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Total Payable:</strong> <span style="font-weight: bold; color: #2563eb;">{totalAmount}</span></p>
    <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Delivery Location:</strong> {shippingState}</p>
  </div>
  <p style="font-size: 13px; color: #475569;">Your order is currently in <strong>Pending</strong> status while our fulfillment team verifies the inventory and prepares it for processing.</p>
  <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 12px;">
    <p style="margin: 0;">Warm regards,<br><strong>{companyName}</strong> Fulfillment & Billing Desk</p>
  </div>
</div>`,
    variables: ['orderId', 'customerName', 'invoiceNumber', 'orderDate', 'totalAmount', 'paymentMethod', 'shippingState', 'companyName'],
    enabled: true,
  },
  {
    templateKey: 'order_processing',
    name: 'Order In Processing & Fulfillment',
    description: 'Dispatched when order is confirmed and warehouse team begins picking, packing, and quality check.',
    category: 'customer',
    subject: 'Your Wholesale Order #{orderId} is Now Processing - {companyName}',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 20px;">
    <h2 style="color: #1d4ed8; margin: 0; font-size: 20px;">Order in Processing & Warehouse Packing</h2>
    <span style="color: #64748b; font-size: 13px;">Fulfillment & Quality Inspection Active</span>
  </div>
  <p style="font-size: 14px; color: #334155;">Dear <strong>{customerName}</strong>,</p>
  <p style="font-size: 14px; color: #334155;">Great news! Your wholesale order <strong>#{orderId}</strong> has been confirmed and has moved to the <strong>Processing</strong> stage.</p>
  <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 20px 0;">
    <p style="margin: 4px 0; font-size: 13px; color: #1e40af;"><strong>Status:</strong> <span style="font-weight: bold; color: #1d4ed8;">Under Fulfillment & Quality Check</span></p>
    <p style="margin: 4px 0; font-size: 13px; color: #1e40af;"><strong>Order Value:</strong> {totalAmount}</p>
    <p style="margin: 4px 0; font-size: 13px; color: #1e40af;"><strong>Target Dispatch Date:</strong> {estimatedDispatch}</p>
    <p style="margin: 4px 0; font-size: 13px; color: #1e40af;"><strong>Destination City:</strong> {shippingCity}</p>
  </div>
  <p style="font-size: 13px; color: #475569;">Our central logistics hub is currently picking, palletizing, and barcode-scanning your items. You will receive tracking details once the courier carrier picks up the consignment.</p>
  <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 12px;">
    <p style="margin: 0;">Best regards,<br><strong>{companyName}</strong> Warehouse Operations</p>
  </div>
</div>`,
    variables: ['orderId', 'customerName', 'totalAmount', 'orderDate', 'estimatedDispatch', 'shippingCity', 'companyName'],
    enabled: true,
  },
  {
    templateKey: 'payment_verified',
    name: 'Offline Bank Transfer (NEFT/RTGS) Verified',
    description: 'Sent to customer when offline payment receipt/UTR number is verified by the accounts team.',
    category: 'customer',
    subject: 'Payment Verified for Order #{orderId} - {companyName}',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <div style="border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 20px;">
    <h2 style="color: #059669; margin: 0; font-size: 20px;">Payment Verified & Cleared</h2>
    <span style="color: #64748b; font-size: 13px;">Electronic Bank Settlement Confirmation</span>
  </div>
  <p style="font-size: 14px; color: #334155;">Dear <strong>{customerName}</strong>,</p>
  <p style="font-size: 14px; color: #334155;">We are pleased to inform you that your offline bank transfer of <strong>{totalAmount}</strong> for Order <strong>#{orderId}</strong> (UTR Reference: <code style="font-weight: bold; color: #0f172a;">{utrNumber}</code>) has been successfully verified.</p>
  <p style="font-size: 14px; color: #334155;">Your order has now moved to fulfillment and is being prepped for dispatch.</p>
  <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 12px;">
    <p style="margin: 0;">Regards,<br><strong>{companyName}</strong> Finance & Accounts</p>
  </div>
</div>`,
    variables: ['orderId', 'customerName', 'totalAmount', 'utrNumber', 'companyName'],
    enabled: true,
  },
  {
    templateKey: 'order_dispatched',
    name: 'Order Dispatched & Tracking Details',
    description: 'Sent to customer when logistics carrier and airway bill tracking number are generated.',
    category: 'customer',
    subject: 'Your Wholesale Order #{orderId} Has Been Dispatched! - {companyName}',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <div style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px;">
    <h2 style="color: #2563eb; margin: 0; font-size: 20px;">Your Shipment is En Route</h2>
    <span style="color: #64748b; font-size: 13px;">Logistics & Airway Bill Dispatch Details</span>
  </div>
  <p style="font-size: 14px; color: #334155;">Dear <strong>{customerName}</strong>,</p>
  <p style="font-size: 14px; color: #334155;">Your wholesale order <strong>#{orderId}</strong> has departed our central warehouse hub and is with our logistics courier partner.</p>
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
    <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Carrier:</strong> {carrierName}</p>
    <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Tracking AWB:</strong> <span style="font-family: monospace; font-weight: bold; color: #0f172a;">{trackingNumber}</span></p>
    <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Destination:</strong> {shippingCity}, {shippingState}</p>
  </div>
  <p style="font-size: 13px; color: #475569;">You can track the live movement of your consignments directly via the courier tracking portal.</p>
  <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 12px;">
    <p style="margin: 0;">Best regards,<br><strong>{companyName}</strong> Logistics Team</p>
  </div>
</div>`,
    variables: ['orderId', 'customerName', 'carrierName', 'trackingNumber', 'shippingCity', 'shippingState', 'companyName'],
    enabled: true,
  },
  {
    templateKey: 'order_delivered',
    name: 'Order Delivered & Handover Confirmation',
    description: 'Dispatched to customer upon successful delivery of consignment at customer address.',
    category: 'customer',
    subject: 'Order #{orderId} Delivered Successfully - {companyName}',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <div style="border-bottom: 2px solid #10b981; padding-bottom: 16px; margin-bottom: 20px;">
    <h2 style="color: #047857; margin: 0; font-size: 20px;">Consignment Delivered Successfully</h2>
    <span style="color: #64748b; font-size: 13px;">Proof of Delivery & Handover Complete</span>
  </div>
  <p style="font-size: 14px; color: #334155;">Dear <strong>{customerName}</strong>,</p>
  <p style="font-size: 14px; color: #334155;">We are pleased to inform you that your wholesale consignment for Order <strong>#{orderId}</strong> was delivered on {deliveredDate}.</p>
  <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
    <p style="margin: 4px 0; font-size: 13px; color: #065f46;"><strong>Order Reference:</strong> #{orderId}</p>
    <p style="margin: 4px 0; font-size: 13px; color: #065f46;"><strong>Tax Invoice No:</strong> {invoiceNumber}</p>
    <p style="margin: 4px 0; font-size: 13px; color: #065f46;"><strong>Delivered At:</strong> {shippingAddress}</p>
  </div>
  <p style="font-size: 13px; color: #475569;">Please inspect the delivered stock. For any carton transit damage or quantity discrepancy, kindly report within 48 hours to our support desk at <a href="mailto:{supportEmail}" style="color: #2563eb; font-weight: bold;">{supportEmail}</a>.</p>
  <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 12px;">
    <p style="margin: 0;">Thank you for partnering with us,<br><strong>{companyName}</strong> Account Operations</p>
  </div>
</div>`,
    variables: ['orderId', 'customerName', 'deliveredDate', 'shippingAddress', 'invoiceNumber', 'supportEmail', 'companyName'],
    enabled: true,
  },
  {
    templateKey: 'order_cancelled',
    name: 'Order Cancelled & Refund Information',
    description: 'Sent to customer when an order is cancelled, explaining the reason and refund settlement details.',
    category: 'customer',
    subject: 'Order #{orderId} Has Been Cancelled - {companyName}',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <div style="border-bottom: 2px solid #ef4444; padding-bottom: 16px; margin-bottom: 20px;">
    <h2 style="color: #b91c1c; margin: 0; font-size: 20px;">Order Cancellation Notice</h2>
    <span style="color: #64748b; font-size: 13px;">Commercial Order Status Update</span>
  </div>
  <p style="font-size: 14px; color: #334155;">Dear <strong>{customerName}</strong>,</p>
  <p style="font-size: 14px; color: #334155;">This email is to notify you that your wholesale order <strong>#{orderId}</strong> has been cancelled.</p>
  <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
    <p style="margin: 4px 0; font-size: 13px; color: #991b1b;"><strong>Reason for Cancellation:</strong> {cancelReason}</p>
    <p style="margin: 4px 0; font-size: 13px; color: #991b1b;"><strong>Order Value:</strong> {totalAmount}</p>
  </div>
  <p style="font-size: 13px; color: #475569;">If any advance payment was deducted, the refund has been initiated to your original payment method or credited to your wholesale account balance. For any questions, contact us at <a href="mailto:{supportEmail}" style="color: #2563eb; font-weight: bold;">{supportEmail}</a>.</p>
  <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 12px;">
    <p style="margin: 0;">Sincerely,<br><strong>{companyName}</strong> Customer Care Desk</p>
  </div>
</div>`,
    variables: ['orderId', 'customerName', 'cancelReason', 'totalAmount', 'supportEmail', 'companyName'],
    enabled: true,
  },
  {
    templateKey: 'admin_new_order',
    name: 'Admin New High-Value Order Alert',
    description: 'Dispatched to admin notification recipients whenever a new wholesale order is received.',
    category: 'admin',
    subject: '[ALERT] New Wholesale Order #{orderId} - {totalAmount}',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <div style="border-bottom: 2px solid #d97706; padding-bottom: 16px; margin-bottom: 20px;">
    <h2 style="color: #d97706; margin: 0; font-size: 20px;">Admin Alert: New Wholesale Order</h2>
    <span style="color: #64748b; font-size: 13px;">Storefront B2B Purchase Notification</span>
  </div>
  <p style="font-size: 14px; color: #334155;">A new order <strong>#{orderId}</strong> has just been placed.</p>
  <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 16px; margin: 20px 0;">
    <p style="margin: 4px 0; font-size: 13px; color: #92400e;"><strong>Buyer Entity:</strong> {customerName}</p>
    <p style="margin: 4px 0; font-size: 13px; color: #92400e;"><strong>Order Total:</strong> <span style="font-weight: bold;">{totalAmount}</span></p>
    <p style="margin: 4px 0; font-size: 13px; color: #92400e;"><strong>Payment Method:</strong> {paymentMethod}</p>
    <p style="margin: 4px 0; font-size: 13px; color: #92400e;"><strong>GSTIN:</strong> {gstin}</p>
  </div>
  <div style="margin-top: 24px;">
    <a href="{adminOrderUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">Open Order in Admin Panel</a>
  </div>
</div>`,
    variables: ['orderId', 'customerName', 'totalAmount', 'paymentMethod', 'gstin', 'adminOrderUrl', 'companyName'],
    enabled: true,
  },
  {
    templateKey: 'admin_low_stock',
    name: 'Admin Alert: Low Inventory Stock Buffer',
    description: 'Dispatched to warehouse and procurement managers when SKU inventory drops below safety threshold.',
    category: 'admin',
    subject: '[STOCK WARNING] Low Inventory for SKU: {productSku} - {companyName}',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <div style="border-bottom: 2px solid #ea580c; padding-bottom: 16px; margin-bottom: 20px;">
    <h2 style="color: #c2410c; margin: 0; font-size: 20px;">Low Inventory Warning Alert</h2>
    <span style="color: #64748b; font-size: 13px;">Warehouse Stock Buffer Trigger</span>
  </div>
  <p style="font-size: 14px; color: #334155;">SKU <strong>{productSku}</strong> ({productName}) has reached low stock threshold.</p>
  <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; margin: 20px 0;">
    <p style="margin: 4px 0; font-size: 13px; color: #9a3412;"><strong>Product:</strong> {productName}</p>
    <p style="margin: 4px 0; font-size: 13px; color: #9a3412;"><strong>SKU:</strong> {productSku}</p>
    <p style="margin: 4px 0; font-size: 13px; color: #9a3412;"><strong>Current Available Units:</strong> <span style="font-weight: bold; color: #dc2626;">{currentStock} units</span></p>
    <p style="margin: 4px 0; font-size: 13px; color: #9a3412;"><strong>Reorder Threshold:</strong> {threshold} units</p>
  </div>
  <div style="margin-top: 24px;">
    <a href="{inventoryUrl}" style="display: inline-block; background: #ea580c; color: #ffffff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">View SKU in Inventory Desk</a>
  </div>
</div>`,
    variables: ['productName', 'productSku', 'currentStock', 'threshold', 'inventoryUrl', 'companyName'],
    enabled: true,
  },
  {
    templateKey: 'auth_otp',
    name: 'OTP Authentication & Security Code',
    description: 'Sent for customer verification, login authentication, and critical security actions.',
    category: 'auth',
    subject: '{otpCode} is your {companyName} verification code',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 540px; margin: auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff; text-align: center;">
  <h2 style="color: #0f172a; margin-top: 0; font-size: 22px;">Security Authentication Code</h2>
  <p style="color: #475569; font-size: 14px;">Use the verification code below to verify your session on <strong>{companyName}</strong>:</p>
  <div style="background: #f1f5f9; border: 1px dashed #cbd5e1; padding: 18px; border-radius: 12px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #2563eb; margin: 24px 0; font-family: monospace;">
    {otpCode}
  </div>
  <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">This code will expire in 10 minutes. Never share your verification code with anyone.</p>
</div>`,
    variables: ['otpCode', 'customerName', 'companyName'],
    enabled: true,
  },
];

/**
 * Fetch Platform / Company Settings from Backend API
 */
export async function fetchPlatformSettingsApi() {
  try {
    const res = await fetch(`${API_URL}/api/admin/settings/platform`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      return { ...DEFAULT_PLATFORM_SETTINGS, ...(data.data || data) };
    }
  } catch (err) {
    console.warn('Failed to fetch platform settings from API, using fallback:', err);
  }
  return { ...DEFAULT_PLATFORM_SETTINGS };
}

/**
 * Save Platform / Company Settings to Backend Database
 */
export async function savePlatformSettingsApi(payload) {
  try {
    const res = await fetch(`${API_URL}/api/admin/settings/platform`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, data: data.data || data };
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to save platform settings');
  } catch (err) {
    console.error('Error in savePlatformSettingsApi:', err);
    throw err;
  }
}

/**
 * Fetch SMTP Settings from Backend API
 */
export async function fetchSmtpSettingsApi() {
  try {
    const res = await fetch(`${API_URL}/api/admin/settings/smtp`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      return { ...DEFAULT_SMTP_SETTINGS, ...(data.data || data) };
    }
  } catch (err) {
    console.warn('Failed to fetch SMTP settings from API, using fallback:', err);
  }
  return { ...DEFAULT_SMTP_SETTINGS };
}

/**
 * Save SMTP Settings to Backend Database
 */
export async function saveSmtpSettingsApi(payload) {
  try {
    const res = await fetch(`${API_URL}/api/admin/settings/smtp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, data: data.data || data };
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to save SMTP settings');
  } catch (err) {
    console.error('Error in saveSmtpSettingsApi:', err);
    throw err;
  }
}

/**
 * Send Live Diagnostic SMTP Test Email
 */
export async function sendTestSmtpEmailApi(targetEmail, smtpConfig = {}) {
  try {
    const res = await fetch(`${API_URL}/api/admin/settings/smtp/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetEmail, ...smtpConfig }),
    });
    const data = await res.json();
    if (res.ok && data.success !== false) {
      return { success: true, message: data.message || `Test email sent successfully to ${targetEmail}!` };
    }
    throw new Error(data.message || 'SMTP Connection Test Failed');
  } catch (err) {
    console.error('Error in sendTestSmtpEmailApi:', err);
    throw err;
  }
}

/**
 * Upload Company Logo Image
 */
export async function uploadCompanyLogoApi(file) {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await fetch(`${API_URL}/api/media/upload`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      const url = data.url || data.filePath || (data.data && data.data.url) || `${API_URL}/uploads/${data.filename || file.name}`;
      return url;
    }
    throw new Error('Upload failed');
  } catch (err) {
    console.error('Logo upload error:', err);
    throw err;
  }
}

/**
 * Fetch all email templates
 */
export async function fetchEmailTemplatesApi() {
  try {
    const res = await fetch(`${API_URL}/api/admin/settings/email-templates`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : (data.data || DEFAULT_EMAIL_TEMPLATES);
    }
  } catch (err) {
    console.warn('Failed to fetch email templates from API:', err);
  }
  return DEFAULT_EMAIL_TEMPLATES;
}

/**
 * Save an email template
 */
export async function saveEmailTemplateApi(templateKey, payload) {
  try {
    const res = await fetch(`${API_URL}/api/admin/settings/email-templates/${encodeURIComponent(templateKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, data: data.data || data };
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to save email template');
  } catch (err) {
    console.error(`Error saving email template ${templateKey}:`, err);
    throw err;
  }
}

/**
 * Reset an email template to default
 */
export async function resetEmailTemplateApi(templateKey) {
  try {
    const res = await fetch(`${API_URL}/api/admin/settings/email-templates/${encodeURIComponent(templateKey)}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, data: data.data || data };
    }
  } catch (err) {
    console.error(`Error resetting email template ${templateKey}:`, err);
    throw err;
  }
}

export const DEFAULT_FOOTER_SETTINGS = {
  brandName: 'TradeLogix Wholesale',
  brandLogo: 'http://localhost:6543/uploads/1788592719273-logo.jpeg',
  brandDescription: 'Empowering global B2B & retail commerce with scalable hardware solutions and verified OEM partnerships.',
  supportEmail: 'sales@tradelogix.in',
  supportPhone: '+91 98201 45892',
  supportAddress: '804, Prime Corporate Park, Marol, Andheri East, Mumbai, Maharashtra - 400059',
  workingHours: 'Mon - Sat: 9:30 AM - 6:30 PM IST',
  copyrightText: '© 2026 TradeLogix Wholesale Commerce. All rights reserved.',
  bottomNotice: 'ISO 9001:2015 Certified Wholesale Distributor • GST Registered Entity • 256-bit SSL Encrypted',
  facebookUrl: 'https://facebook.com',
  twitterUrl: 'https://twitter.com',
  instagramUrl: 'https://instagram.com',
  linkedinUrl: 'https://linkedin.com',
  youtubeUrl: 'https://youtube.com',
  columns: [
    {
      title: 'Quick Links',
      links: [
        { label: 'Bulk Hardware Catalog', url: '/shop' },
        { label: 'About TradeLogix', url: '/about' },
        { label: 'Contact Sales Desk', url: '/contact' },
        { label: 'B2B Buyer Registration', url: '/login' },
      ],
    },
    {
      title: 'Categories',
      links: [
        { label: 'Audio & Sound', url: '/shop?category=Audio' },
        { label: 'Monitors & Displays', url: '/shop?category=Displays' },
        { label: 'Keyboards & Peripherals', url: '/shop?category=Peripherals' },
        { label: 'Smart Wearables', url: '/shop?category=Wearables' },
      ],
    },
    {
      title: 'Support & Policies',
      links: [
        { label: 'Privacy Policy', url: '/privacy-policy' },
        { label: 'Terms & Conditions of Sale', url: '/terms' },
        { label: 'Refund & Return Policy', url: '/refund-policy' },
        { label: 'Shipping & Freight Logistics', url: '/shipping-policy' },
      ],
    },
  ],
  showNewsletter: true,
  newsletterHeading: 'Subscribe to Wholesale Trade Alerts',
  newsletterSubheading: 'Get weekly price drops, factory surplus alerts, and B2B volume discount circulars.',
};

/**
 * Fetch footer settings from API
 */
export async function fetchFooterSettingsApi() {
  try {
    const res = await fetch(`${API_URL}/api/settings/footer`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      const data = (json && json.data) ? json.data : json;
      return data || DEFAULT_FOOTER_SETTINGS;
    }
  } catch (err) {
    console.warn('Failed to fetch footer settings from API:', err);
  }
  return DEFAULT_FOOTER_SETTINGS;
}

/**
 * Save footer settings to API
 */
export async function saveFooterSettingsApi(payload) {
  try {
    const res = await fetch(`${API_URL}/api/admin/settings/footer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to save footer settings');
  } catch (err) {
    console.error('Error saving footer settings:', err);
    throw err;
  }
}


