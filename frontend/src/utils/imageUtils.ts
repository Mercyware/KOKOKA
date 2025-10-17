/**
 * Image utilities for handling different types of image URLs
 */

/**
 * Resolves an image URL to ensure it's properly accessible
 * Handles S3 URLs, API proxy URLs, and relative paths
 * 
 * @param imageUrl - The image URL from the database or API
 * @param fallbackUrl - Optional fallback URL if the image is not accessible
 * @returns Resolved image URL that should work in the browser
 */
export const resolveImageUrl = (imageUrl: string | null | undefined, fallbackUrl?: string): string | null => {
  if (!imageUrl) {
    return fallbackUrl || null;
  }

  // If it's already a full URL (http/https), check if it's an S3 URL that might need proxying
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // Check if it's an S3 URL that might have access issues
    if (imageUrl.includes('kokoka-students.s3.') && imageUrl.includes('amazonaws.com')) {
      // Extract the S3 key from the URL and use the proxy
      const urlParts = imageUrl.split('/');
      const bucketIndex = urlParts.findIndex(part => part.includes('kokoka-students.s3.'));
      if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
        const s3Key = urlParts.slice(bucketIndex + 1).join('/');
        // Use relative URL that will be proxied by Vite dev server
        return `/api/images/s3/${s3Key}`;
      }
    }
    return imageUrl;
  }

  // If it's already an API proxy URL, return as-is (Vite will proxy it)
  if (imageUrl.startsWith('/api/')) {
    return imageUrl;
  }

  // If it's a relative path, construct the API URL
  if (imageUrl.startsWith('/')) {
    return `/api${imageUrl}`;
  }

  // If none of the above, treat as relative and prepend /api/
  return `/api/${imageUrl}`;
};

/**
 * Checks if an image URL is accessible by attempting to load it
 * This is useful for validation and fallback handling
 * 
 * @param imageUrl - The image URL to test
 * @returns Promise that resolves to true if image is accessible
 */
export const isImageAccessible = (imageUrl: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imageUrl;
    
    // Timeout after 5 seconds
    setTimeout(() => resolve(false), 5000);
  });
};

/**
 * Generates initials from a name for use as avatar fallback
 * 
 * @param name - Full name to generate initials from
 * @returns Initials (max 2 characters)
 */
export const getInitials = (name: string): string => {
  if (!name) return '??';
  
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Validates if a file is a valid image type
 * 
 * @param file - File to validate
 * @returns true if file is a valid image
 */
export const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(file.type);
};

/**
 * Validates image file size
 * 
 * @param file - File to validate
 * @param maxSizeInMB - Maximum size in megabytes (default: 5MB)
 * @returns true if file size is valid
 */
export const isValidImageSize = (file: File, maxSizeInMB: number = 5): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

/**
 * Gets the file size in a human-readable format
 * 
 * @param sizeInBytes - File size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (sizeInBytes: number): string => {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  } else if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};