export interface Account {
  id: string;
  code: string;
  title: string;
  level: number;
  evo: number;
  emotes: number;
  price: number;
  image: string;
  images?: string[];
  videoUrl?: string;
  videoType?: 'youtube' | 'direct' | 'uploaded';
  videoName?: string;
  sold: boolean;
  loginMethod?: string;
  server?: string;
  description?: string;
  featured?: boolean;
}

export interface Review {
  id: string;
  name: string;
  text: string;
  rating: number;
  approved: boolean;
  date?: string;
}

export interface PaymentSettings {
  bkash: string;
  bkashType: 'Personal';
  bkashMethod: 'Send Money';
  nagad: string;
  nagadType: 'Personal';
  nagadMethod: 'Send Money';
  rocket: string;
  rocketType: 'Personal';
  rocketStatus: 'Coming Soon' | 'Enabled' | 'Disabled';
  paymentInstructions: string[];
}

export interface SiteSettings {
  storeName: string;
  whatsappNumber: string;
  logoUrl: string;
  bkash: string;
  bkashType?: string;
  bkashMethod?: string;
  nagad: string;
  nagadType?: string;
  nagadMethod?: string;
  rocket: string;
  rocketType?: string;
  rocketStatus?: 'Coming Soon' | 'Enabled' | 'Disabled';
  paymentInstructions?: string[];
  noticeText: string;
  // Islamic Welcome Popup Settings
  welcomePopupEnabled?: boolean;
  welcomePopupBadge?: string;
  welcomePopupSubtitle?: string;
  welcomePopupDiscount?: string;
  welcomePopupNote?: string;
  welcomePopupButtonText?: string;
  welcomePopupTargetUrl?: string;
}

export interface Order {
  id: string;
  accountId: string;
  accountCode: string;
  price: number;
  customerName: string;
  senderNumber: string;
  method: 'bKash' | 'Nagad' | 'Rocket';
  trxId: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  timestamp: string;
}
