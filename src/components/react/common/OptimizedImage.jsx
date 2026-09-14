import React, { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.PUBLIC_API_URL || (typeof window !== 'undefined' && window.__PUBLIC_API_URL__) || 'http://localhost:6543';
const DEFAULT_FALLBACK = '/placeholder-product.svg';

/**
 * OptimizedImage
 * High-performance, visible, CLS-free image component for Astro React islands.
 */
export default function OptimizedImage({
  src,
  alt = '',
  aspectRatio = 'aspect-square',
  width,
  height,
  className = '',
  imgClassName = 'object-cover',
  fallbackSrc = DEFAULT_FALLBACK,
  loading = 'lazy',
  priority = false,
  sizes,
  onClick,
}) {
  const imgRef = useRef(null);

  const resolve = (val) => {
    if (!val) return fallbackSrc;
    if (val.startsWith('/uploads/')) return `${API_URL}${val}`;
    return val;
  };

  const [currentSrc, setCurrentSrc] = useState(() => resolve(src));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(resolve(src));
    setHasError(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasError && currentSrc !== fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-slate-100 ${aspectRatio} ${className}`}
      style={width && height ? { maxWidth: width, maxHeight: height } : undefined}
      onClick={onClick}
    >
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        decoding="async"
        fetchpriority={priority ? 'high' : undefined}
        sizes={sizes}
        onError={handleError}
        className={`w-full h-full block ${imgClassName}`}
      />
    </div>
  );
}
