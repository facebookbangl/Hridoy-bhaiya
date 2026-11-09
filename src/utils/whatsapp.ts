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
 * Generates an automated, professional WhatsApp order inquiry text
 * containing actual account details, ID code, price, direct link, and customer intent.
 */
export function formatAccountWhatsAppOrderMessage(account: {
  code: string;
  title: string;
  price: number;
  level?: number;
  evo?: number;
}): string {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://zeropointff.com';
  const accountLink = `${currentOrigin}/#id=${account.code}`;

  return `আসসালামু আলাইকুম ZERO POINT FF,
আমি এই Free Fire Account-টি কিনতে আগ্রহী:

📌 আইডি কোড: ${account.code}
🎮 টাইটেল: ${account.title}
💰 নির্ধারিত মূল্য: ${account.price.toLocaleString('bn-BD')} ৳ (${account.price} BDT)
🔗 অ্যাকাউন্ট লিংক: ${accountLink}

আমি দ্রুত এই আইডিটি কেনার জন্য অর্ডার নিশ্চিত করতে চাই। অনুগ্রহ করে পেমেন্ট ভেরিফিকেশন ও হ্যান্ডওভার গাইডলাইন দিন। ধন্যবাদ!`;
}

