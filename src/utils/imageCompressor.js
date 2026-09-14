import imageCompression from 'browser-image-compression';

/**
 * Default compression configuration for WebP conversion
 */
export const DEFAULT_COMPRESSION_OPTIONS = {
  maxSizeMB: 1.5,             // Max output size in MB
  maxWidthOrHeight: 1920,      // Max width/height to avoid massive dimensional overhead
  useWebWorker: true,          // Perform compression off the main UI thread
  fileType: 'image/webp',      // Automatically convert all raster images to modern WebP
  initialQuality: 0.85,        // High-fidelity visual quality
  alwaysKeepResolution: false,
};

/**
 * Checks if a given file or MIME type is a raster image eligible for WebP conversion.
 * Excludes SVG (vector) and PDF (documents).
 */
export function isCompressibleImage(file) {
  if (!file) return false;
  const mimeType = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();

  // Exclude vector graphics and documents
  if (mimeType.includes('svg') || name.endsWith('.svg')) return false;
  if (mimeType.includes('pdf') || name.endsWith('.pdf')) return false;
  if (mimeType.includes('gif') || name.endsWith('.gif')) return false; // Preserve potential animations

  return (
    mimeType.startsWith('image/') ||
    /\.(jpe?g|png|webp|bmp|tiff?)$/i.test(name)
  );
}

/**
 * Generates a clean filename ending in .webp
 */
export function getWebpFilename(originalName = 'image.webp') {
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  return `${baseName}.webp`;
}

/**
 * Compresses an image file and converts it to WebP format.
 *
 * @param {File|Blob} file - The original image file
 * @param {Object} customOptions - Overrides for imageCompression
 * @returns {Promise<File>} The compressed WebP File
 */
export async function compressImageToWebP(file, customOptions = {}) {
  // If not a compressible image, return as-is
  if (!isCompressibleImage(file)) {
    return file;
  }

  const options = {
    ...DEFAULT_COMPRESSION_OPTIONS,
    ...customOptions,
  };

  const originalSize = file.size;
  const originalName = file.name || 'image.webp';

  try {
    const compressedBlob = await imageCompression(file, options);
    const newFilename = getWebpFilename(originalName);

    // Create a new File object with the .webp extension and image/webp MIME type
    const webpFile = new File([compressedBlob], newFilename, {
      type: 'image/webp',
      lastModified: Date.now(),
    });

    const savedKb = Math.round((originalSize - webpFile.size) / 1024);
    const percent = Math.round(((originalSize - webpFile.size) / originalSize) * 100);

    if (savedKb > 0) {
      console.log(
        `[ImageCompressor] ${originalName} -> ${newFilename} (${Math.round(originalSize / 1024)}KB -> ${Math.round(webpFile.size / 1024)}KB, -${percent}%)`
      );
    }

    return webpFile;
  } catch (err) {
    console.warn(`[ImageCompressor] Fallback: Failed to compress ${originalName}, using original.`, err);
    return file;
  }
}

/**
 * Pre-processor hook for Uppy instances.
 * Automatically iterates over all files queued in Uppy and compresses raster images to WebP.
 *
 * @param {import('@uppy/core').Uppy} uppy - The Uppy instance
 * @param {Object} options - Optional compression overrides
 */
export function attachUppyImageCompressor(uppy, options = {}) {
  uppy.addPreProcessor(async (fileIDs) => {
    for (const fileID of fileIDs) {
      const uppyFile = uppy.getFile(fileID);
      if (!uppyFile || !uppyFile.data) continue;

      const fileData = uppyFile.data;

      if (isCompressibleImage(fileData)) {
        try {
          uppy.emit('preprocess-progress', uppyFile, {
            mode: 'indeterminate',
            message: 'Converting to WebP & compressing...',
          });

          const webpFile = await compressImageToWebP(fileData, options);

          uppy.setFileState(fileID, {
            data: webpFile,
            size: webpFile.size,
            name: webpFile.name,
            type: 'image/webp',
            extension: 'webp',
          });

          uppy.emit('preprocess-complete', uppyFile);
        } catch (err) {
          console.warn(`[ImageCompressor] Error preprocessing file ${uppyFile.name}:`, err);
        }
      }
    }
  });
}
