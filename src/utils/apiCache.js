/**
 * apiCache.js
 * Universal Request Deduplication and Response Caching Engine.
 *
 * Solves the duplicate API call problem across the entire TradeLogix application:
 * 1. IN-FLIGHT COALESCING: Multiple components requesting the same GET endpoint
 *    at the same time (e.g. NavbarSearch, CategoriesBar, ProductFilter, FooterView all requesting /api/all-categories)
 *    share the EXACT SAME physical HTTP network request.
 * 2. SHORT-LIVED IN-MEMORY CACHING: Caches successful GET responses in memory for
 *    a configurable TTL (30s default, 60s for static resources), serving subsequent calls in 0ms.
 * 3. COMPATIBLE RESPONSE CLONING: Returns standard Fetch `Response` instances with identical
 *    status, statusText, headers, and full stream capabilities (res.ok, res.json(), res.text()).
 * 4. AUTOMATIC CACHE INVALIDATION: Any mutating request (POST, PUT, PATCH, DELETE)
 *    automatically invalidates related cached GET entries.
 */

const inFlightMap = new Map();
const cacheMap = new Map();

// Default cache TTL in milliseconds
export const DEFAULT_TTL = 30 * 1000; // 30 seconds

// Endpoints with longer TTL (rarely changing global metadata)
const LONG_TTL_ENDPOINTS = [
  '/api/all-categories',
  '/api/settings/footer',
  '/api/admin/settings/footer',
  '/api/admin/settings/platform',
  '/api/pages',
];

function getTtlForUrl(url, requestedTtl) {
  if (typeof requestedTtl === 'number' && requestedTtl >= 0) {
    return requestedTtl;
  }
  const urlStr = String(url || '');
  for (const ep of LONG_TTL_ENDPOINTS) {
    if (urlStr.includes(ep)) {
      return 60 * 1000; // 60 seconds for static metadata
    }
  }
  return DEFAULT_TTL;
}

function buildCacheKey(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const urlStr = typeof url === 'string' ? url : (url.url || url.toString());
  
  // Distinguish authenticated user requests if Authorization header is set
  let authSuffix = '';
  if (options.headers) {
    let authHeader = '';
    if (typeof options.headers.get === 'function') {
      authHeader = options.headers.get('Authorization') || options.headers.get('authorization') || '';
    } else if (typeof options.headers === 'object') {
      authHeader = options.headers.Authorization || options.headers.authorization || '';
    }
    if (authHeader) {
      // Use short signature of auth token
      authSuffix = `:${authHeader.slice(-16)}`;
    }
  }

  return `${method}:${urlStr}${authSuffix}`;
}

/**
 * Smart Fetch wrapper that handles request deduplication and response caching.
 */
export async function smartFetch(url, options = {}, ttlMs) {
  const nativeFetch = (typeof window !== 'undefined' && window.__nativeFetch__) 
    ? window.__nativeFetch__ 
    : globalThis.fetch;

  if (!nativeFetch) {
    throw new Error('fetch is not available in current environment');
  }

  const method = (options.method || 'GET').toUpperCase();

  // 1. Mutations (POST, PUT, PATCH, DELETE): Bypass caching and invalidate related entries
  if (method !== 'GET' && method !== 'HEAD') {
    const urlStr = typeof url === 'string' ? url : (url.url || url.toString());
    invalidateCacheByUrl(urlStr);
    return nativeFetch(url, options);
  }

  // 2. Explicit cache bypass opt-out
  if (options.cache === 'no-store' || options.cache === 'reload' || options.headers?.['x-no-cache']) {
    return nativeFetch(url, options);
  }

  const cacheKey = buildCacheKey(url, options);
  const effectiveTtl = getTtlForUrl(url, ttlMs);

  // 3. Return from fresh cache if available
  const cached = cacheMap.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < effectiveTtl)) {
    return new Response(cached.bodyText, {
      status: cached.status,
      statusText: cached.statusText,
      headers: new Headers(cached.headers),
    });
  }

  // 4. Coalesce onto existing in-flight request if one is currently active
  if (inFlightMap.has(cacheKey)) {
    const snapshot = await inFlightMap.get(cacheKey);
    return new Response(snapshot.bodyText, {
      status: snapshot.status,
      statusText: snapshot.statusText,
      headers: new Headers(snapshot.headers),
    });
  }

  // 5. Initiate physical network request
  const requestPromise = (async () => {
    const res = await nativeFetch(url, options);
    
    // Read and buffer response text so it can be re-served to multiple callers
    const bodyText = await res.text();
    const headersObj = {};
    if (res.headers && typeof res.headers.forEach === 'function') {
      res.headers.forEach((val, key) => {
        headersObj[key] = val;
      });
    }

    const snapshot = {
      bodyText,
      status: res.status,
      statusText: res.statusText,
      headers: headersObj,
      timestamp: Date.now(),
    };

    // Cache successful GET responses
    if (res.ok && res.status >= 200 && res.status < 300) {
      cacheMap.set(cacheKey, snapshot);
    }

    return snapshot;
  })();

  inFlightMap.set(cacheKey, requestPromise);

  try {
    const snapshot = await requestPromise;
    return new Response(snapshot.bodyText, {
      status: snapshot.status,
      statusText: snapshot.statusText,
      headers: new Headers(snapshot.headers),
    });
  } finally {
    inFlightMap.delete(cacheKey);
  }
}

/**
 * Invalidate a specific URL or prefix from cache
 */
export function invalidateCacheByUrl(urlStr) {
  if (!urlStr) return;
  const cleanPath = urlStr.split('?')[0];
  for (const key of cacheMap.keys()) {
    if (key.includes(cleanPath)) {
      cacheMap.delete(key);
    }
  }
}

/**
 * Clear all cache and in-flight maps
 */
export function clearAllApiCache() {
  cacheMap.clear();
  inFlightMap.clear();
}

/**
 * Auto-installer: Patches window.fetch globally in browser environments
 */
export function installGlobalFetchInterceptor() {
  if (typeof window === 'undefined') return;
  if (window.__tradelogix_fetch_intercepted__) return;

  const originalFetch = window.fetch;
  window.__nativeFetch__ = originalFetch;

  window.fetch = function (input, init) {
    return smartFetch(input, init);
  };

  window.__tradelogix_fetch_intercepted__ = true;
  window.__clearApiCache__ = clearAllApiCache;
  window.__apiCache__ = cacheMap;
}

// Automatically install if loaded in client window
if (typeof window !== 'undefined') {
  installGlobalFetchInterceptor();
}

// Backward compatibility export
export const deduplicatedFetch = smartFetch;
export const invalidateCache = invalidateCacheByUrl;
export const invalidateCacheByPrefix = invalidateCacheByUrl;
