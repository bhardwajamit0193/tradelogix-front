/**
 * Pincode Lookup Service for Indian Postal Codes
 * API: https://api.postalpincode.in/pincode/{PINCODE}
 */

// In-memory cache for fetched pincodes to avoid repeated network hits
const pincodeCache = new Map();

// Standard list of 28 Indian States + 8 Union Territories
export const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

/**
 * Normalizes state name to match standard Indian state names if slight variation exists
 */
function normalizeStateName(stateName) {
  if (!stateName) return '';
  const trimmed = stateName.trim();
  const match = INDIAN_STATES.find(s => s.toLowerCase() === trimmed.toLowerCase());
  return match || trimmed;
}

/**
 * Look up location details by 6-digit Indian PIN code.
 * @param {string} pincode - 6-digit PIN code
 * @returns {Promise<{ success: boolean, city?: string, state?: string, country: string, postOffices?: string[], message?: string }>}
 */
export async function lookupPincode(pincode) {
  const cleanPin = String(pincode || '').replace(/\D/g, '').slice(0, 6);
  if (cleanPin.length !== 6) {
    return { success: false, country: 'India', message: 'Enter a valid 6-digit PIN code' };
  }

  if (pincodeCache.has(cleanPin)) {
    return pincodeCache.get(cleanPin);
  }

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
    if (!res.ok) {
      throw new Error(`Postal API error (HTTP ${res.status})`);
    }

    const data = await res.json();
    if (
      Array.isArray(data) &&
      data[0]?.Status === 'Success' &&
      Array.isArray(data[0]?.PostOffice) &&
      data[0].PostOffice.length > 0
    ) {
      const postOffices = data[0].PostOffice;
      const primary = postOffices[0];

      // District represents city/revenue district in India postal data
      const city = primary.District || primary.Block || primary.Name || '';
      const state = normalizeStateName(primary.State || '');
      const postOfficeNames = postOffices.map(po => po.Name).filter(Boolean);

      const result = {
        success: true,
        city,
        state,
        country: 'India',
        postOffices: postOfficeNames
      };

      pincodeCache.set(cleanPin, result);
      return result;
    }

    const failResult = {
      success: false,
      country: 'India',
      message: data?.[0]?.Message || 'No records found for this PIN code'
    };
    return failResult;
  } catch (err) {
    console.warn('[Pincode Lookup] Service error:', err);
    return {
      success: false,
      country: 'India',
      message: 'Unable to verify PIN code automatically'
    };
  }
}
