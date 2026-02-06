import { useState, useEffect } from 'react';
import type { ExternalBlob } from '../backend';

interface UsePostImageSrcResult {
  src: string | null;
  isLoading: boolean;
  error: boolean;
}

/**
 * React hook that safely converts an ExternalBlob to a displayable image src.
 * Validates getDirectURL() output and falls back to bytes->Blob URL if needed.
 * Automatically revokes created object URLs on unmount or when image changes.
 */
export function usePostImageSrc(image: ExternalBlob | undefined | null): UsePostImageSrcResult {
  const [src, setSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!image) {
      setSrc(null);
      setIsLoading(false);
      setError(false);
      return;
    }

    let objectUrl: string | null = null;
    let mounted = true;

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setError(false);

        // Try getDirectURL first and validate it's a proper URL
        const directUrl = image.getDirectURL();
        
        // Strict validation: must be a valid URL scheme and not contain binary/EXIF garbage
        const isValidUrl = directUrl && 
          (directUrl.startsWith('http://') || directUrl.startsWith('https://') || directUrl.startsWith('blob:')) &&
          !directUrl.includes('Exif') && 
          !directUrl.includes('xmlns:') &&
          directUrl.length < 2000; // Reasonable URL length check

        if (isValidUrl) {
          if (mounted) {
            setSrc(directUrl);
            setIsLoading(false);
          }
          return;
        }

        // Fallback: convert bytes to Blob URL
        const bytes = await image.getBytes();
        if (!mounted) return;

        if (!bytes || bytes.length === 0) {
          throw new Error('No image data available');
        }

        // Create a proper Uint8Array and Blob URL with inferred MIME type
        const properArray = new Uint8Array(bytes);
        
        // Infer MIME type from magic bytes (first few bytes of the file)
        let mimeType = 'image/jpeg'; // default
        if (properArray.length >= 4) {
          // PNG: 89 50 4E 47
          if (properArray[0] === 0x89 && properArray[1] === 0x50 && properArray[2] === 0x4E && properArray[3] === 0x47) {
            mimeType = 'image/png';
          }
          // JPEG: FF D8 FF
          else if (properArray[0] === 0xFF && properArray[1] === 0xD8 && properArray[2] === 0xFF) {
            mimeType = 'image/jpeg';
          }
          // GIF: 47 49 46
          else if (properArray[0] === 0x47 && properArray[1] === 0x49 && properArray[2] === 0x46) {
            mimeType = 'image/gif';
          }
          // WebP: 52 49 46 46 ... 57 45 42 50
          else if (properArray[0] === 0x52 && properArray[1] === 0x49 && properArray[2] === 0x46 && properArray[3] === 0x46) {
            mimeType = 'image/webp';
          }
        }

        const blob = new Blob([properArray], { type: mimeType });
        objectUrl = URL.createObjectURL(blob);

        if (mounted) {
          setSrc(objectUrl);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load post image:', err);
        if (mounted) {
          setError(true);
          setSrc(null);
          setIsLoading(false);
        }
      }
    };

    loadImage();

    // Cleanup: revoke any created object URL
    return () => {
      mounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [image]);

  return { src, isLoading, error };
}
