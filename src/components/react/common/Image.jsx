import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.PUBLIC_API_URL || (typeof window !== 'undefined' && window.__PUBLIC_API_URL__) || 'http://localhost:6543';
const DEFAULT_FALLBACK = '/placeholder-product.svg';

/**
 * Universal optimized React Image component
 * Drop-in replacement for <img /> in React islands:
 * - Automatically resolves /uploads/ to backend API URL
 * - Graceful fallback handling (prevents broken image icons and infinite error loops)
 * - Modern web performance: lazy loading, async decoding, and fetchPriority
 */
export default function Image({
  src,
  alt = '',
  className = '',
  width,
  height,
  loading = 'lazy',
  priority = false,
  fallback = DEFAULT_FALLBACK,
  onError,
  onLoad,
  ...props
}) {
  const resolve = (url) => {
    if (!url) return fallback;
    if (typeof url === 'string' && url.startsWith('/uploads/')) {
      return `${API_URL}${url}`;
    }
    return url;
  };

  const [imgSrc, setImgSrc] = useState(() => resolve(src));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(resolve(src));
    setHasError(false);
  }, [src, fallback]);

  const handleError = (e) => {
    if (!hasError && imgSrc !== fallback) {
      setHasError(true);
      setImgSrc(fallback);
    }
    if (onError) onError(e);
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : loading}
      decoding="async"
      fetchpriority={priority ? 'high' : undefined}
      onError={handleError}
      onLoad={onLoad}
      className={className}
      {...props}
    />
  );
}

export { Image };
