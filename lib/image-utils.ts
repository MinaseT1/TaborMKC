// Image utility functions for handling

/**
 * Creates a preview URL for an image file
 * @param file - The image file
 * @returns string - The preview URL
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Validates if a file is a valid image
 * @param file - The file to validate
 * @returns boolean - True if valid image
 */
export function isValidImage(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
}

/**
 * Gets file size in MB
 * @param file - The file
 * @returns number - Size in MB
 */
export function getFileSizeInMB(file: File): number {
  return file.size / (1024 * 1024);
}