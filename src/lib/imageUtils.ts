/**
 * Converts an image file to WebP format
 * @param file - The original image file
 * @param quality - WebP quality (0-1, default: 0.8)
 * @returns Promise<File> - The converted WebP file
 */
export const convertToWebP = (file: File, quality: number = 0.92): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Check if the file is already webp
    if (file.type === 'image/webp') {
      resolve(file);
      return;
    }

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image on canvas
      ctx?.drawImage(img, 0, 0);

      // Convert to WebP blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create new File object with webp extension
            const originalName = file.name.split('.').slice(0, -1).join('.');
            const webpFile = new File([blob], `${originalName}.webp`, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(webpFile);
          } else {
            reject(new Error('Failed to convert image to WebP'));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Create object URL and load image
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    // Clean up object URL after image loads
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image on canvas
      ctx?.drawImage(img, 0, 0);

      // Convert to WebP blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create new File object with webp extension
            const originalName = file.name.split('.').slice(0, -1).join('.');
            const webpFile = new File([blob], `${originalName}.webp`, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(webpFile);
          } else {
            reject(new Error('Failed to convert image to WebP'));
          }
        },
        'image/webp',
        quality
      );
    };
  });
};

/**
 * Resizes and converts an image to WebP format
 * @param file - The original image file
 * @param maxWidth - Maximum width (optional)
 * @param maxHeight - Maximum height (optional)
 * @param quality - WebP quality (0-1, default: 0.8)
 * @returns Promise<File> - The resized and converted WebP file
 */
export const resizeAndConvertToWebP = (
  file: File,
  maxWidth?: number,
  maxHeight?: number,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions if max dimensions are provided
      if (maxWidth && width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (maxHeight && height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw resized image on canvas
      ctx?.drawImage(img, 0, 0, width, height);

      // Convert to WebP blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create new File object with webp extension
            const originalName = file.name.split('.').slice(0, -1).join('.');
            const webpFile = new File([blob], `${originalName}.webp`, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(webpFile);
          } else {
            reject(new Error('Failed to convert image to WebP'));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Create object URL and load image
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    // Clean up object URL after image loads
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      let { width, height } = img;

      // Calculate new dimensions if max dimensions are provided
      if (maxWidth && width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (maxHeight && height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw resized image on canvas
      ctx?.drawImage(img, 0, 0, width, height);

      // Convert to WebP blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create new File object with webp extension
            const originalName = file.name.split('.').slice(0, -1).join('.');
            const webpFile = new File([blob], `${originalName}.webp`, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(webpFile);
          } else {
            reject(new Error('Failed to convert image to WebP'));
          }
        },
        'image/webp',
        quality
      );
    };
  });
};