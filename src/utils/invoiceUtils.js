/**
 * Invoice & Asset URL Resolution Utility for TradeLogix
 *
 * Ensures invoice PDF URLs dynamically point to the correct backend host or current domain,
 * avoiding hardcoded 'http://localhost:6543' which fails on custom domains, production, or network IPs.
 */

export function getFullInvoiceUrl(url) {
    if (!url || typeof url !== 'string') return '';

    // Already absolute or data URL
    if (
        url.startsWith('http://') ||
        url.startsWith('https://') ||
        url.startsWith('data:') ||
        url.startsWith('blob:')
    ) {
        return url;
    }

    const normalizedPath = url.startsWith('/') ? url : `/${url}`;

    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const isClientLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

        // 1. Check window.__PUBLIC_API_URL__ (injected at runtime)
        // 2. Check import.meta.env.PUBLIC_API_URL (baked at build/dev time)
        const envApi = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.PUBLIC_API_URL : null;
        const windowApi = window.__PUBLIC_API_URL__;
        const configuredApi = (windowApi || envApi || '').trim();

        if (configuredApi) {
            const isConfigLocalhost = configuredApi.includes('localhost') || configuredApi.includes('127.0.0.1');

            // If accessing via remote domain/IP (e.g. production, staging, ngrok, LAN)
            // but configured API still points to 'localhost', do not direct client to localhost!
            // Use current domain origin so the reverse proxy or web server can route it.
            if (!isClientLocalhost && isConfigLocalhost) {
                return `${window.location.origin.replace(/\/$/, '')}${normalizedPath}`;
            }

            return `${configuredApi.replace(/\/$/, '')}${normalizedPath}`;
        }

        // No API configured: if on remote domain, use current origin
        if (!isClientLocalhost) {
            return `${window.location.origin.replace(/\/$/, '')}${normalizedPath}`;
        }
    }

    // Fallback for local development
    const localFallback = (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_API_URL) || 'http://localhost:6543';
    return `${localFallback.replace(/\/$/, '')}${normalizedPath}`;
}
