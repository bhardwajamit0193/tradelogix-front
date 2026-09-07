import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import {
  fetchPlatformSettingsApi,
  DEFAULT_PLATFORM_SETTINGS,
} from '../../services/platformSettingsService.js';

// Indian Numbering Format Amount in Words
function numberToWords(num) {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(num);
  if (n === 0) return 'Zero Rupees Only';

  function convertGroup(n) {
    let str = '';
    if (n > 99) {
      str += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
    } else if (n > 0) {
      str += a[n];
    }
    return str.trim();
  }

  let words = '';
  const crore = Math.floor(n / 10000000);
  let remainder = n % 10000000;
  const lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;
  const thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;
  const hundredAndRest = remainder;

  if (crore > 0) words += convertGroup(crore) + ' Crore ';
  if (lakh > 0) words += convertGroup(lakh) + ' Lakh ';
  if (thousand > 0) words += convertGroup(thousand) + ' Thousand ';
  if (hundredAndRest > 0) words += convertGroup(hundredAndRest) + ' ';

  return `Rupees ${words.trim()} Only`;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 22,
    fontSize: 7.5,
    fontFamily: 'Helvetica',
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 8,
    borderBottomWidth: 1.2,
    borderBottomColor: '#0f172a',
  },
  companyCol: {
    maxWidth: '58%',
    alignItems: 'flex-start',
  },
  logo: {
    height: 34,
    width: 130,
    marginBottom: 5,
    objectFit: 'contain',
    objectPosition: 'left',
    alignSelf: 'flex-start',
  },
  companyName: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 2,
    textAlign: 'left',
  },
  companyText: {
    fontSize: 7.5,
    color: '#475569',
    lineHeight: 1.3,
    textAlign: 'left',
  },
  metaCol: {
    maxWidth: '40%',
    alignItems: 'flex-end',
  },
  invoiceTitleBadge: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 3,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  invoiceSubtitle: {
    fontSize: 6.5,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metaBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 0.8,
    borderColor: '#e2e8f0',
    borderRadius: 3,
    padding: 5,
    width: 175,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  metaLabel: {
    fontSize: 7,
    color: '#64748b',
  },
  metaVal: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  addressesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 6,
  },
  addressBox: {
    width: '48.5%',
    backgroundColor: '#ffffff',
    borderWidth: 0.8,
    borderColor: '#dbeafe',
    borderRadius: 6,
    padding: 7,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.6,
    borderBottomColor: '#eff6ff',
    paddingBottom: 3,
    marginBottom: 3.5,
  },
  addressTitleBuyer: {
    fontSize: 7.2,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
    textTransform: 'uppercase',
  },
  addressTitleShipped: {
    fontSize: 7.2,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  addressBadgeBuyer: {
    fontSize: 6.2,
    fontFamily: 'Helvetica-Bold',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    paddingVertical: 1.5,
    paddingHorizontal: 5,
    borderRadius: 3,
  },
  addressBadgeShipped: {
    fontSize: 6.2,
    fontFamily: 'Helvetica-Bold',
    backgroundColor: '#ecfdf5',
    color: '#059669',
    paddingVertical: 1.5,
    paddingHorizontal: 5,
    borderRadius: 3,
  },
  entityName: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 2,
  },
  addressLine: {
    fontSize: 7.2,
    color: '#475569',
    lineHeight: 1.3,
  },
  addressMetaBox: {
    marginTop: 4,
    paddingTop: 3.5,
    borderTopWidth: 0.6,
    borderTopColor: '#f1f5f9',
  },
  metaTextRow: {
    fontSize: 6.8,
    color: '#475569',
    marginBottom: 1.2,
    lineHeight: 1.25,
  },
  metaLabelBold: {
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  tableContainer: {
    borderWidth: 0.8,
    borderColor: '#cbd5e1',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    paddingVertical: 4.5,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.6,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 4,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  thText: {
    color: '#ffffff',
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
  },
  tdText: {
    color: '#334155',
    fontSize: 7.5,
  },
  tdTextBold: {
    color: '#0f172a',
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
  },
  colSl: { width: '6%', textAlign: 'center' },
  colDesc: { width: '40%', paddingRight: 4 },
  colHsn: { width: '12%', textAlign: 'center' },
  colQty: { width: '8%', textAlign: 'center' },
  colRate: { width: '11%', textAlign: 'right' },
  colTaxable: { width: '11%', textAlign: 'right' },
  colGst: { width: '8%', textAlign: 'center' },
  colTotal: { width: '12%', textAlign: 'right' },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  totalsLeftCol: {
    width: '54%',
  },
  amountInWordsBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 0.8,
    borderColor: '#e2e8f0',
    borderRadius: 3,
    padding: 4.5,
    marginBottom: 4,
  },
  amountInWordsLabel: {
    fontSize: 6.2,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 1.5,
  },
  amountInWordsText: {
    fontSize: 7.2,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    lineHeight: 1.25,
  },
  bankBox: {
    borderWidth: 0.8,
    borderColor: '#cbd5e1',
    borderRadius: 3,
    padding: 4.5,
    marginBottom: 4,
    backgroundColor: '#ffffff',
  },
  bankTitle: {
    fontSize: 6.8,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 2,
    marginBottom: 2.5,
    textTransform: 'uppercase',
  },
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bankGridItem: {
    width: '50%',
    marginBottom: 2,
  },
  bankLabel: {
    fontSize: 6.2,
    color: '#64748b',
  },
  bankVal: {
    fontSize: 6.8,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  stampBox: {
    borderWidth: 1.2,
    borderRadius: 3,
    padding: 4.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalsRightCol: {
    width: '43%',
    backgroundColor: '#f8fafc',
    borderWidth: 0.8,
    borderColor: '#e2e8f0',
    borderRadius: 3,
    padding: 5.5,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2.5,
    fontSize: 7.2,
  },
  calcLabel: {
    fontSize: 7.2,
    color: '#475569',
  },
  calcVal: {
    fontSize: 7.2,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    paddingTop: 3.5,
    marginTop: 2.5,
  },
  grandTotalLabel: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  grandTotalVal: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
  },
  termsSection: {
    marginTop: 5,
    paddingTop: 4,
    borderTopWidth: 0.6,
    borderTopColor: '#e2e8f0',
  },
  termsTitle: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
    textTransform: 'uppercase',
    marginBottom: 1.5,
  },
  termsText: {
    fontSize: 6.2,
    color: '#64748b',
    lineHeight: 1.25,
  },
});

export default function InvoicePdfDocument({ invoiceData, platformSettings = null }) {
  if (!invoiceData) return null;

  const platform = platformSettings || DEFAULT_PLATFORM_SETTINGS;

  const rawItems = invoiceData.items && invoiceData.items.length > 0 ? invoiceData.items : [
    {
      id: 'item-1',
      name: 'Enterprise Hardware Line Item',
      sku: 'SKU-ENT-101',
      hsn: '84716000',
      qty: 1,
      price: parseFloat(invoiceData.totalAmount || invoiceData.total || 45000),
    }
  ];

  const itemsWithTaxes = rawItems.map((item, idx) => {
    const qty = parseInt(item.qty || item.quantity || 1, 10);
    const grossPrice = parseFloat(item.price || item.unitPrice || 0);
    const taxableUnitRate = Math.round((grossPrice / 1.18) * 100) / 100;
    const taxableAmount = taxableUnitRate * qty;
    const gstAmount = Math.round(taxableAmount * 0.18 * 100) / 100;
    const total = taxableAmount + gstAmount;

    return {
      slNo: idx + 1,
      name: item.name || 'B2B Product Unit',
      sku: item.sku || 'SKU-GENERAL',
      hsn: item.hsn || '84716060',
      qty,
      unit: item.unit || 'PCS',
      taxableUnitRate,
      taxableAmount,
      gstRate: '18%',
      cgstAmount: gstAmount / 2,
      sgstAmount: gstAmount / 2,
      total,
    };
  });

  const totalTaxableValue = itemsWithTaxes.reduce((sum, item) => sum + item.taxableAmount, 0);
  const totalCgst = itemsWithTaxes.reduce((sum, item) => sum + item.cgstAmount, 0);
  const totalSgst = itemsWithTaxes.reduce((sum, item) => sum + item.sgstAmount, 0);
  const totalGst = totalCgst + totalSgst;
  const discountAmount = parseFloat(invoiceData.discountAmount || 0);
  const shippingCharge = parseFloat(invoiceData.shippingCharge || 0);
  const grandTotal = Math.max(0, totalTaxableValue + totalGst - discountAmount + shippingCharge);

  const invoiceNumber = invoiceData.invoiceNumber || `TLX-INV-${(invoiceData.id || '').replace(/\D/g, '').slice(-5) || '20261'}`;
  const invoiceDate = invoiceData.createdAt ? new Date(invoiceData.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '05 Sep 2026';
  const placeOfSupply = invoiceData.shippingAddress?.state || invoiceData.billingAddress?.state || 'Maharashtra';

  const isOfflineBankPayment =
    (invoiceData.paymentMethod || '').toLowerCase() === 'offlinetransfer' ||
    (invoiceData.paymentMethod || '').toLowerCase().includes('offline') ||
    (invoiceData.paymentMethod || '').toLowerCase().includes('neft') ||
    (invoiceData.paymentMethod || '').toLowerCase().includes('wire');

  const pStatus = (invoiceData.paymentStatus || '').toLowerCase();
  const isPaid = pStatus.includes('paid') || (invoiceData.paymentMethod || '').toLowerCase() === 'razorpay';
  const isPartial = (invoiceData.paymentMethod || '').toLowerCase() === 'partialcod';

  const isCancelled =
    (invoiceData.status || '').toLowerCase().includes('cancel') ||
    (invoiceData.fulfillmentStatus || '').toLowerCase().includes('cancel');

  let stampLabel = 'CASH ON DELIVERY';
  let stampSub = 'Payable at Arrival';
  let stampColor = '#475569';
  let stampBg = '#f8fafc';

  if (isCancelled) {
    stampLabel = 'CANCELLED / VOID';
    stampSub = 'Order Cancelled by Desk';
    stampColor = '#b91c1c';
    stampBg = '#fef2f2';
  } else if (isPaid) {
    stampLabel = 'PAID & VERIFIED';
    stampSub = 'Full Payment Received';
    stampColor = '#059669';
    stampBg = '#ecfdf5';
  } else if (isOfflineBankPayment) {
    stampLabel = invoiceData.isOfflineVerified ? 'NEFT VERIFIED' : 'NEFT PENDING';
    stampSub = invoiceData.offlineUtrNumber ? `UTR: ${invoiceData.offlineUtrNumber}` : 'Wire Credit Awaited';
    stampColor = invoiceData.isOfflineVerified ? '#059669' : '#d97706';
    stampBg = invoiceData.isOfflineVerified ? '#ecfdf5' : '#fffbeb';
  } else if (isPartial) {
    stampLabel = invoiceData.isPartialBalanceCollected ? 'FULLY CLEARED' : '10% ADVANCE PAID';
    stampSub = invoiceData.isPartialBalanceCollected ? '90% COD Collected' : '90% Due at Delivery';
    stampColor = '#4f46e5';
    stampBg = '#eef2ff';
  }

  const formatINR = (amt) => `Rs. ${(amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Document title={`Invoice_${invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        {/* 1. HEADER */}
        <View style={styles.headerRow}>
          <View style={styles.companyCol}>
            {platform.companyLogo ? (
              <Image
                src={platform.companyLogo}
                style={styles.logo}
              />
            ) : null}
            <Text style={styles.companyName}>{platform.companyName || 'TradeLogix Solutions Private Limited'}</Text>
            <Text style={styles.companyText}>
              {platform.companyAddress || '804, Prime Corporate Park, Marol, Andheri East, Mumbai, Maharashtra - 400059'}
            </Text>
            <Text style={styles.companyText}>
              GSTIN: {platform.gstin || '27AAACT9921M1ZT'} | PAN: {platform.panNumber || 'AAACT9921M'} | Email: {platform.companyEmail || 'accounts@tradelogix.in'}
            </Text>
          </View>

          <View style={styles.metaCol}>
            <Text style={styles.invoiceTitleBadge}>TAX INVOICE</Text>
            <Text style={styles.invoiceSubtitle}>Original for Recipient</Text>

            <View style={styles.metaBox}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Invoice No:</Text>
                <Text style={styles.metaVal}>{invoiceNumber}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Invoice Date:</Text>
                <Text style={styles.metaVal}>{invoiceDate}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Order Ref:</Text>
                <Text style={styles.metaVal}>{invoiceData.id}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Place of Supply:</Text>
                <Text style={styles.metaVal}>{placeOfSupply}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* CANCELLED / VOID BANNER IN PDF */}
        {isCancelled ? (
          <View style={{ backgroundColor: '#fef2f2', borderWidth: 0.8, borderColor: '#fca5a5', borderRadius: 3, padding: 4.5, marginTop: 4, marginBottom: 2 }}>
            <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#991b1b', textTransform: 'uppercase' }}>
              COMMERCIAL TAX INVOICE STATUS: CANCELLED & VOID
            </Text>
            <Text style={{ fontSize: 6.8, color: '#7f1d1d', marginTop: 1.5 }}>
              Reason for Cancellation: {invoiceData.cancelReason || 'Order cancelled by administration'}
            </Text>
          </View>
        ) : null}

        {/* 2. ADDRESSES */}
        <View style={styles.addressesGrid}>
          {/* Billed To */}
          <View style={styles.addressBox}>
            <View style={styles.addressHeader}>
              <Text style={styles.addressTitleBuyer}>BILLED TO (BUYER)</Text>
              <Text style={styles.addressBadgeBuyer}>B2B Client</Text>
            </View>
            <Text style={styles.entityName}>{invoiceData.companyName || invoiceData.customerName}</Text>
            <Text style={styles.addressLine}>
              {invoiceData.billingAddress?.addressLine1 || invoiceData.shippingAddress?.addressLine1}
            </Text>
            {invoiceData.billingAddress?.addressLine2 ? (
              <Text style={styles.addressLine}>{invoiceData.billingAddress.addressLine2}</Text>
            ) : null}
            <Text style={styles.addressLine}>
              {invoiceData.billingAddress?.city || invoiceData.shippingAddress?.city},{' '}
              {invoiceData.billingAddress?.state || invoiceData.shippingAddress?.state} -{' '}
              {invoiceData.billingAddress?.pincode || invoiceData.shippingAddress?.pincode}
            </Text>
            <View style={styles.addressMetaBox}>
              <Text style={styles.metaTextRow}>
                <Text style={styles.metaLabelBold}>GSTIN / UIN: </Text>
                {invoiceData.gstin || '27AABCT3518Q1ZK'} (Verified)
              </Text>
              <Text style={styles.metaTextRow}>
                <Text style={styles.metaLabelBold}>Contact: </Text>
                {invoiceData.customerName} ({invoiceData.customerMobile || invoiceData.billingAddress?.phone || '919876543219'})
              </Text>
              <Text style={styles.metaTextRow}>
                <Text style={styles.metaLabelBold}>Email: </Text>
                {invoiceData.customerEmail || 'accounts@clientcorp.in'}
              </Text>
            </View>
          </View>

          {/* Shipped To */}
          <View style={styles.addressBox}>
            <View style={styles.addressHeader}>
              <Text style={styles.addressTitleShipped}>SHIPPED TO (CONSIGNEE)</Text>
              <Text style={styles.addressBadgeShipped}>Dispatch Dock</Text>
            </View>
            <Text style={styles.entityName}>{invoiceData.shippingAddress?.name || invoiceData.customerName}</Text>
            <Text style={styles.addressLine}>{invoiceData.shippingAddress?.addressLine1}</Text>
            {invoiceData.shippingAddress?.addressLine2 ? (
              <Text style={styles.addressLine}>{invoiceData.shippingAddress.addressLine2}</Text>
            ) : null}
            <Text style={styles.addressLine}>
              {invoiceData.shippingAddress?.city}, {invoiceData.shippingAddress?.state} - {invoiceData.shippingAddress?.pincode}
            </Text>
            <View style={styles.addressMetaBox}>
              <Text style={styles.metaTextRow}>
                <Text style={styles.metaLabelBold}>Assigned Logistics: </Text>
                TradeLogix Express Cargo (Air/Surface)
              </Text>
              <Text style={styles.metaTextRow}>
                <Text style={styles.metaLabelBold}>Warehouse Dock: </Text>
                {invoiceData.warehouse || 'Delhi Central Hub'}
              </Text>
              <Text style={styles.metaTextRow}>
                <Text style={styles.metaLabelBold}>Receiver Phone: </Text>
                {invoiceData.shippingAddress?.phone || invoiceData.customerMobile || '919876543219'}
              </Text>
            </View>
          </View>
        </View>

        {/* 3. ITEM TABLE */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colSl, styles.thText]}>#</Text>
            <Text style={[styles.colDesc, styles.thText]}>ITEM DESCRIPTION</Text>
            <Text style={[styles.colHsn, styles.thText]}>HSN/SAC</Text>
            <Text style={[styles.colQty, styles.thText]}>QTY</Text>
            <Text style={[styles.colRate, styles.thText]}>UNIT RATE (Rs.)</Text>
            <Text style={[styles.colTaxable, styles.thText]}>TAXABLE AMT (Rs.)</Text>
            <Text style={[styles.colGst, styles.thText]}>GST</Text>
            <Text style={[styles.colTotal, styles.thText]}>TOTAL (Rs.)</Text>
          </View>

          {itemsWithTaxes.map((item) => (
            <View key={item.slNo} style={styles.tableRow}>
              <Text style={[styles.colSl, styles.tdText]}>{item.slNo}</Text>
              <View style={styles.colDesc}>
                <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: '#0f172a' }}>{item.name}</Text>
                <Text style={{ fontSize: 6.5, color: '#64748b' }}>SKU: {item.sku}</Text>
              </View>
              <Text style={[styles.colHsn, styles.tdText]}>{item.hsn}</Text>
              <Text style={[styles.colQty, styles.tdText]}>{item.qty} {item.unit}</Text>
              <Text style={[styles.colRate, styles.tdText]}>{item.taxableUnitRate.toFixed(2)}</Text>
              <Text style={[styles.colTaxable, styles.tdText]}>{item.taxableAmount.toFixed(2)}</Text>
              <Text style={[styles.colGst, styles.tdText]}>18%</Text>
              <Text style={[styles.colTotal, styles.tdTextBold]}>{item.total.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* 4. TOTALS & DETAILS */}
        <View style={styles.totalsRow}>
          {/* Left Column */}
          <View style={styles.totalsLeftCol}>
            {/* Amount in Words */}
            <View style={styles.amountInWordsBox}>
              <Text style={styles.amountInWordsLabel}>Invoice Total Amount (in Words)</Text>
              <Text style={styles.amountInWordsText}>{numberToWords(grandTotal)}</Text>
            </View>

            {/* Remittance Box (Only for Offline Bank Transfer) */}
            {isOfflineBankPayment ? (
              <View style={styles.bankBox}>
                <Text style={styles.bankTitle}>Electronic Bank Settlement (NEFT / RTGS / IMPS)</Text>
                <View style={styles.bankGrid}>
                  <View style={styles.bankGridItem}>
                    <Text style={styles.bankLabel}>Bank Name:</Text>
                    <Text style={styles.bankVal}>HDFC Bank Limited</Text>
                  </View>
                  <View style={styles.bankGridItem}>
                    <Text style={styles.bankLabel}>Account Name:</Text>
                    <Text style={styles.bankVal}>TradeLogix Solutions Pvt Ltd</Text>
                  </View>
                  <View style={styles.bankGridItem}>
                    <Text style={styles.bankLabel}>A/C Number:</Text>
                    <Text style={styles.bankVal}>50200084920194</Text>
                  </View>
                  <View style={styles.bankGridItem}>
                    <Text style={styles.bankLabel}>IFSC Code:</Text>
                    <Text style={styles.bankVal}>HDFC0000240</Text>
                  </View>
                </View>
              </View>
            ) : null}

            {/* Status Stamp */}
            <View style={[styles.stampBox, { borderColor: stampColor, backgroundColor: stampBg }]}>
              <View>
                <Text style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: stampColor, textTransform: 'uppercase' }}>
                  Payment Audit Status
                </Text>
                <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: stampColor }}>
                  {stampLabel}
                </Text>
                <Text style={{ fontSize: 7, color: '#475569' }}>{stampSub}</Text>
              </View>
            </View>
          </View>

          {/* Right Column: Financial Calculations */}
          <View style={styles.totalsRightCol}>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Taxable Subtotal</Text>
              <Text style={styles.calcVal}>{formatINR(totalTaxableValue)}</Text>
            </View>
            {discountAmount > 0 ? (
              <View style={styles.calcRow}>
                <Text style={[styles.calcLabel, { color: '#059669' }]}>Trade Discount</Text>
                <Text style={[styles.calcVal, { color: '#059669' }]}>- {formatINR(discountAmount)}</Text>
              </View>
            ) : null}
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Central GST (CGST 9%)</Text>
              <Text style={styles.calcVal}>{formatINR(totalCgst)}</Text>
            </View>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>State GST (SGST 9%)</Text>
              <Text style={styles.calcVal}>{formatINR(totalSgst)}</Text>
            </View>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Freight & Handling</Text>
              <Text style={[styles.calcVal, { color: '#059669' }]}>
                {shippingCharge > 0 ? formatINR(shippingCharge) : 'FREE DISPATCH'}
              </Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalVal}>{formatINR(grandTotal)}</Text>
            </View>
          </View>
        </View>

        {/* 5. TERMS OF SALE */}
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Terms & Conditions of Wholesale Sale</Text>
          <Text style={styles.termsText}>
            1. Goods once sold are eligible for return under TradeLogix B2B RMA policy within 7 working days. 2. Delayed payments subject to 18% p.a. interest. 3. Disputes subject to Mumbai, Maharashtra jurisdiction. 4. Digitally certified tax invoice eligible for 100% GST Input Tax Credit (ITC).
          </Text>
        </View>
      </Page>
    </Document>
  );
}

/**
 * Direct 1-click function to generate and download the vector A4 Invoice PDF on the client
 */
export async function generateAndDownloadInvoicePdf(invoiceData, customPlatformSettings = null) {
  if (!invoiceData) return;
  try {
    let platform = customPlatformSettings;
    if (!platform) {
      try {
        platform = await fetchPlatformSettingsApi();
      } catch (e) {
        platform = DEFAULT_PLATFORM_SETTINGS;
      }
    }
    const { pdf } = await import('@react-pdf/renderer');
    const blob = await pdf(<InvoicePdfDocument invoiceData={invoiceData} platformSettings={platform} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const invoiceNumber = invoiceData.invoiceNumber || `TLX-INV-${(invoiceData.id || '').replace(/\D/g, '').slice(-5) || '20261'}`;
    link.download = `Invoice_${invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error generating PDF download:', err);
  }
}
