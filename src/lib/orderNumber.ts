/**
 * FIX #13: Unique Order Number Generation
 * Generates unique, human-readable order numbers
 */

/**
 * Generate a unique order number with prefix
 * Format: PREFIX-YYYYMMDD-XXXX (where XXXX is alphanumeric)
 */
export function generateOrderNumber(prefix: string = 'ORD'): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Generate random alphanumeric string for uniqueness
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
  
  return `${prefix}-${dateStr}-${random}${timestamp}`;
}

/**
 * Generate a POS sale number
 * Format: POS-XXXXXXXX (timestamp + random)
 */
export function generatePOSSaleNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `POS-${timestamp}${random}`;
}

/**
 * Generate a payment intent reference
 */
export function generatePaymentReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PAY-${timestamp}-${random}`;
}