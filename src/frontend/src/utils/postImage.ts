/**
 * Converts a post image Uint8Array to a displayable URL
 * @param imageData - The binary image data from the backend
 * @returns A blob URL that can be used in img src, or null if no image
 */
export function convertPostImageToUrl(imageData: Uint8Array | undefined | null): string | null {
  if (!imageData || imageData.length === 0) {
    return null;
  }

  try {
    // Create a new Uint8Array with a proper ArrayBuffer to satisfy TypeScript
    const properArray = new Uint8Array(imageData);
    const blob = new Blob([properArray], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Failed to convert image data to URL:', error);
    return null;
  }
}

/**
 * Revokes a blob URL to free memory
 * @param url - The blob URL to revoke
 */
export function revokeImageUrl(url: string | null) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Converts a File to Uint8Array for backend upload
 * @param file - The file to convert
 * @returns Promise resolving to Uint8Array
 */
export async function fileToUint8Array(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      resolve(new Uint8Array(arrayBuffer));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}
