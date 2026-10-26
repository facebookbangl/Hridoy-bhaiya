/**
 * Centralized WhatsApp helper utilities for ZERO POINT FF
 * Ensures Bangladesh WhatsApp numbers (+880) are properly formatted
 * and guards against any dummy/placeholder numbers.
 */

export const OFFICIAL_WHATSAPP_NUMBER = '01722782496';

/**
 * Generates a clean, valid wa.me URL with Bangladesh country code (+880)
 * Handles inputs like '01722782496', '8801722782496', '+8801722782496'
 * Falls back to OFFICIAL_WHATSAPP_NUMBER if phone is invalid or placeholder.
 */
export function formatWhatsAppUrl(phone: string | undefined | null, message: string = ''): string {
  let cleaned = String(phone || '').replace(/[^0-9]/g, '');

  // Detect and replace dummy/placeholder numbers
  if (!cleaned || cleaned.includes('1700000000') || cleaned === '8801700000000' || cleaned === '0000000000') {
    cleaned = '8801722782496';
  }

  // Prepend Bangladesh country code (88) if missing
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    cleaned = '88' + cleaned;
  } else if (cleaned.startsWith('1') && cleaned.length === 10) {
    cleaned = '880' + cleaned;
  }

  const encodedMsg = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${cleaned}${encodedMsg}`;
}

/**
 * Returns a displayable clean phone number (e.g. '01722782496')
 */
export function getDisplayPhoneNumber(phone: string | undefined | null): string {
  let cleaned = String(phone || '').replace(/[^0-9]/g, '');
  if (!cleaned || cleaned.includes('1700000000') || cleaned === '8801700000000') {
    return OFFICIAL_WHATSAPP_NUMBER;
  }
  if (cleaned.startsWith('8801') && cleaned.length === 13) {
    return cleaned.substring(2);
  }
  return cleaned;
}
