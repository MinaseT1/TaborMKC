// ID utility functions for generating custom member IDs

/**
 * Generates a unique member ID with MKC prefix
 * Format: MKC + 6-digit number (e.g., MKC000001, MKC000002)
 * @param existingIds - Array of existing member IDs to ensure uniqueness
 * @returns string - The generated member ID
 */
export function generateMemberID(existingIds: string[] = []): string {
  // Extract numeric parts from existing MKC IDs
  const mkcIds = existingIds
    .filter(id => id.startsWith('MKC'))
    .map(id => {
      const numericPart = id.replace('MKC', '');
      return parseInt(numericPart, 10);
    })
    .filter(num => !isNaN(num));

  // Find the next available number
  let nextNumber = 1;
  if (mkcIds.length > 0) {
    nextNumber = Math.max(...mkcIds) + 1;
  }

  // Format as 6-digit number with leading zeros
  const formattedNumber = nextNumber.toString().padStart(6, '0');
  
  return `MKC${formattedNumber}`;
}

/**
 * Validates if an ID follows the MKC format
 * @param id - The ID to validate
 * @returns boolean - True if valid MKC format
 */
export function isValidMemberID(id: string): boolean {
  const mkcPattern = /^MKC\d{6}$/;
  return mkcPattern.test(id);
}

/**
 * Converts existing member IDs to MKC format
 * @param existingIds - Array of existing member IDs
 * @returns Record<string, string> - Mapping of old ID to new MKC ID
 */
export function convertToMKCFormat(existingIds: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  
  existingIds.forEach((id, index) => {
    if (!id.startsWith('MKC')) {
      const newId = `MKC${(index + 1).toString().padStart(6, '0')}`;
      mapping[id] = newId;
    }
  });
  
  return mapping;
}