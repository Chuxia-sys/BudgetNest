/**
 * Convert an image file to a compressed base64 string
 * This resizes and compresses the image to fit Firestore's 1MB document limit
 */

export interface ProcessedImageResult {
  success: boolean;
  base64?: string;
  error?: string;
}

export async function processImageForStorage(
  file: File,
  maxWidth: number = 500,
  maxHeight: number = 500,
  quality: number = 0.8
): Promise<ProcessedImageResult> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'File must be an image'
      };
    }

    // Validate file size (before processing)
    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: 'Image size must be less than 5MB'
      };
    }

    // Create an image element to load the file
    const img = new Image();
    const imageUrl = URL.createObjectURL(file);

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });

    // Calculate new dimensions (maintain aspect ratio)
    let { width, height } = img;
    const aspectRatio = width / height;

    if (width > maxWidth || height > maxHeight) {
      if (width > height) {
        width = maxWidth;
        height = maxWidth / aspectRatio;
      } else {
        height = maxHeight;
        width = maxHeight * aspectRatio;
      }
    }

    // Create a canvas to resize the image
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      URL.revokeObjectURL(imageUrl);
      return {
        success: false,
        error: 'Failed to create canvas context'
      };
    }

    // Draw the resized image
    ctx.drawImage(img, 0, 0, width, height);

    // Convert to base64 with compression
    let base64: string;
    let currentQuality = quality;

    // Try to get under 500KB to be safe (Firestore limit is 1MB)
    for (let attempt = 0; attempt < 5; attempt++) {
      base64 = canvas.toDataURL('image/jpeg', currentQuality);

      // Remove the data URL prefix to get just the base64 data
      const base64Data = base64.split(',')[1];
      const sizeInBytes = (base64Data.length * 3) / 4; // Approximate size

      if (sizeInBytes < 500 * 1024 || attempt === 4) {
        break;
      }

      // Reduce quality and try again
      currentQuality -= 0.15;
    }

    // Clean up
    URL.revokeObjectURL(imageUrl);

    return {
      success: true,
      base64
    };
  } catch (error) {
    console.error('Error processing image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process image'
    };
  }
}

/**
 * Convert file to base64 without resizing (for smaller files)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate base64 image string
 */
export function isValidBase64Image(base64: string): boolean {
  if (!base64 || typeof base64 !== 'string') {
    return false;
  }

  // Check if it starts with data:image/
  if (!base64.startsWith('data:image/')) {
    return false;
  }

  // Check if it contains base64 data
  const parts = base64.split(',');
  if (parts.length !== 2) {
    return false;
  }

  // Try to decode base64 to verify it's valid
  try {
    const base64Data = parts[1];
    if (!base64Data || base64Data.length === 0) {
      return false;
    }

    // Check if the string is valid base64
    const decoded = atob(base64Data);
    return decoded.length > 0;
  } catch (error) {
    return false;
  }
}
