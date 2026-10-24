import { Account, Review, SiteSettings } from '../types';

import storeLogoImg from '../assets/images/zero_point_logo.png';
import accountOneImg from '../assets/images/ff_evo_account_one_1792782424554.jpg';
import accountTwoImg from '../assets/images/ff_evo_account_two_1792782424253.jpg';
import accountThreeImg from '../assets/images/ff_evo_account_three_1792782424554.jpg';

export const initialSiteSettings: SiteSettings = {
  storeName: "ZERO POINT FF",
  whatsappNumber: "8801700000000",
  logoUrl: storeLogoImg,
  bkash: "01312452160",
  bkashType: "Personal",
  bkashMethod: "Send Money",
  nagad: "01869910404",
  nagadType: "Personal",
  nagadMethod: "Send Money",
  rocket: "019XXXXXXXX",
  rocketType: "Personal",
  rocketStatus: "Coming Soon",
  paymentInstructions: [
    "উপলব্ধ পেমেন্ট মেথড (bKash অথবা Nagad) সিলেক্ট করুন।",
    "প্রদর্শিত নম্বরের পাশের 'Copy Number' বাটনে চাপ দিয়ে নম্বরটি কপি করুন।",
    "আপনার bKash বা Nagad মোবাইল ফিন্যান্সিয়াল সার্ভিস অ্যাপ ওপেন করুন।",
    "Send Money অপশন ব্যবহার করে নির্ধারিত পরিমাণ টাকা ওই নম্বরে পাঠান।",
    "টাকা পাঠানোর পর প্রাপ্ত ট্রানজেকশন আইডি (TrxID) ফর্মে সঠিকভাবে লিখুন।",
    "সব তথ্য যাচাই করে 'অর্ডার কনফার্ম করুন' বাটনে চাপ দিয়ে সাবমিট সম্পন্ন করুন।"
  ],
  noticeText: "📌 নির্দেশনা: আইডি কেনার আগে নিয়মগুলো ভালোভাবে পড়ে নিন। পেমেন্ট শুধুমাত্র Send Money প্রযোজ্য। অর্ডার কনফার্মের পর সাথে সাথে হোয়াটসঅ্যাপে মেসেজ পাঠান।"
};

export const initialAccounts: Account[] = [
  {
    id: "ff_1",
    code: "FF-101",
    title: "71 Level High EVO Gun Loaded Account",
    level: 71,
    evo: 5,
    emotes: 45,
    price: 2800,
    image: accountOneImg,
    images: [accountOneImg, accountTwoImg, accountThreeImg],
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    videoType: "youtube",
    sold: false,
    loginMethod: "Gmail",
    server: "BD / South Asia",
    description: "MP40 Cobra Level 4, AK Blue Flame Draco Level 5, XM8 Destiny Guardian, 15 Elite Passes, 45+ Legendary Emotes, 100% Fresh Gmail Login.",
    featured: true
  },
  {
    id: "ff_2",
    code: "FF-102",
    title: "68 Level Old Season Bundles & Cobra MP40",
    level: 68,
    evo: 3,
    emotes: 52,
    price: 2150,
    image: accountTwoImg,
    images: [accountTwoImg, accountThreeImg, accountOneImg],
    sold: false,
    loginMethod: "Facebook",
    server: "BD / South Asia",
    description: "Old Season 7-12 rare bundles, Cobra MP40, M1014 Green Flame Draco, 52 Emotes including Lol & Push-up emote.",
    featured: true
  },
  {
    id: "ff_3",
    code: "FF-103",
    title: "74 Level Master Tier Max Evo AK & SCAR",
    level: 74,
    evo: 7,
    emotes: 60,
    price: 4500,
    image: accountThreeImg,
    images: [accountThreeImg, accountOneImg, accountTwoImg],
    sold: true,
    loginMethod: "Gmail (2-Step Off)",
    server: "BD / South Asia",
    description: "Dragon AK Max, Megalodon Alpha Scar Max, 7 Evo Guns, Master Rank badge, 60+ Emotes, Super VIP collection.",
    featured: true
  },
  {
    id: "ff_4",
    code: "FF-104",
    title: "65 Level Budget Friendly MP40 & Shotgun King",
    level: 65,
    evo: 2,
    emotes: 38,
    price: 1550,
    image: accountTwoImg,
    sold: false,
    loginMethod: "Gmail",
    server: "BD / South Asia",
    description: "M1887 Rapper Underworld, MP40 Poker Yellow, Level 65, Clean profile, instant delivery.",
    featured: false
  },
  {
    id: "ff_5",
    code: "FF-105",
    title: "70 Level Criminal Bundle & Katana Skins",
    level: 70,
    evo: 4,
    emotes: 48,
    price: 3200,
    image: accountOneImg,
    sold: false,
    loginMethod: "Gmail",
    server: "BD / South Asia",
    description: "Red Criminal Outfit, 4 Evo Guns, Katana legendary effects, high K/D ratio in Ranked BR & CS.",
    featured: false
  }
];

export const initialReviews: Review[] = [
  { id: "rev_1", name: "তানভীর হাসান", text: "পেমেন্ট করার মাত্র ৫ মিনিটের মধ্যে আইডি পেয়ে গেছি। ১০০% ট্রাস্টেড ভাই!", rating: 5, approved: true, date: "আজকে" },
  { id: "rev_2", name: "রাকিবুল ইসলাম", text: "অসাধারণ সার্ভিস। কোনো ঝামেলা ছাড়াই আইডি লগইন করতে পেরেছি।", rating: 5, approved: true, date: "গতকাল" },
  { id: "rev_3", name: "সাকিব আহমেদ", text: "জিরো পয়েন্ট এফএফ এর সার্ভিস সত্যি অনেক ফাস্ট। ধন্যবাদ ভাই!", rating: 5, approved: true, date: "২ দিন আগে" },
  { id: "rev_4", name: "মেহেদী হাসান", text: "প্রথমে একটু ভয় পাচ্ছিলাম, তবে আইডি পাওয়ার পর বিশ্বাস হয়ে গেলো।", rating: 5, approved: true, date: "৩ দিন আগে" },
  { id: "rev_5", name: "আরিফ হোসেন", text: "লেভেল ৭২ আইডি কিনলাম, যেমন দেখিয়েছে ঠিক তেমনই।", rating: 5, approved: true, date: "৪ দিন আগে" },
  { id: "rev_6", name: "ফাহিম মাহমুদ", text: "Send Money করার পরই হোয়াটসঅ্যাপে সাথে সাথে রেসপন্স পেয়েছি।", rating: 5, approved: true, date: "৫ দিন আগে" },
  { id: "rev_7", name: "রিফাত ইসলাম", text: "অনেক কম দামে ইভো গান ওয়ালা আইডি পাইলাম। সেরা শপ!", rating: 5, approved: true, date: "৬ দিন আগে" },
  { id: "rev_8", name: "নাঈম খান", text: "Trusted seller. Anyone can deal without any doubt.", rating: 5, approved: true, date: "১ সপ্তাহ আগে" },
  { id: "rev_9", name: "শামীম রেজা", text: "আমার দেখা সেরা ফ্রি ফায়ার আইডি সেলার। খুব ভালো ব্যবহার।", rating: 5, approved: true, date: "১ সপ্তাহ আগে" },
  { id: "rev_10", name: "হাসান আলী", text: "কোড দেওয়ার পর সাথে সাথে ফুল অ্যাক্সেস পেয়েছি।", rating: 5, approved: true, date: "১ সপ্তাহ আগে" },
  { id: "rev_11", name: "জুবায়ের আহমেদ", text: "কাস্টমার সাপোর্ট খুব হেল্পফুল, দ্রুত ডেলিভারি পেয়েছি।", rating: 5, approved: true, date: "১ সপ্তাহ আগে" },
  { id: "rev_12", name: "ইমরান খান", text: "নগদে পেমেন্ট করছিলাম, সাথে সাথে কনফার্মেশন পেয়ে গেলাম।", rating: 5, approved: true, date: "২ সপ্তাহ আগে" },
  { id: "rev_13", name: "সুমন সরকার", text: "আইডি ফুল ফ্রেশ। কোন টু-স্টেপ ইস্যু ছিল না।", rating: 5, approved: true, date: "২ সপ্তাহ আগে" },
  { id: "rev_14", name: "আল আমিন", text: "ভাইয়ের ব্যবহার এক কথায় অসাধারণ। নির্ভয়ে নিতে পারেন।", rating: 5, approved: true, date: "২ সপ্তাহ আগে" },
  { id: "rev_15", name: "শাহাদাত হোসেন", text: "ধন্যবাদ জিরো পয়েন্ট ভাই। ড্রাকো একে ম্যাক্স পাইলাম!", rating: 5, approved: true, date: "২ সপ্তাহ আগে" },
  { id: "rev_16", name: "কামরুল ইসলাম", text: "অর্ডার করার ১০ মিনিটের মাথায় হোয়াটসঅ্যাপে ডিটেইলস পাইছি।", rating: 5, approved: true, date: "২ সপ্তাহ আগে" },
  { id: "rev_17", name: "মাহমুদুল হক", text: "অনেক বিশ্বস্ত, বন্ধুদেরও এখান থেকে আইডি নিতে বলব।", rating: 5, approved: true, date: "৩ সপ্তাহ আগে" },
  { id: "rev_18", name: "সাদ্দাম হোসেন", text: "বিকাশ পেমেন্ট কনফার্ম হওয়া মাত্রই আইডি বুঝিয়ে দিয়েছে।", rating: 5, approved: true, date: "৩ সপ্তাহ আগে" },
  { id: "rev_19", name: "তৌহিদুর রহমান", text: "আইডি অনেক পছন্দ হইছে, প্রাইস অনুযায়ী একদম পারফেক্ট।", rating: 5, approved: true, date: "৩ সপ্তাহ আগে" },
  { id: "rev_20", name: "সোহেল রানা", text: "সরাসরি এডমিন ভাই ডিল হ্যান্ডেল করেছেন, কোনো রিস্ক নেই।", rating: 5, approved: true, date: "৩ সপ্তাহ আগে" },
  { id: "rev_21", name: "অপু চক্রবর্তী", text: "অনলাইনে এতো নিরাপদ সার্ভিস আশা করিনি। গ্রেট জব ভাই!", rating: 5, approved: true, date: "৩ সপ্তাহ আগে" },
  { id: "rev_22", name: "সায়মন আহমেদ", text: "সব ইমোট আর গান স্কিন ঠিকঠাক ছিল। ধন্যবাদ।", rating: 5, approved: true, date: "১ মাস আগে" },
  { id: "rev_23", name: "নাজমুল হোসেন", text: "প্রথমবার ডিল করলাম, সম্পূর্ণ সন্তুষ্ট।", rating: 5, approved: true, date: "১ মাস আগে" },
  { id: "rev_24", name: "আকাশ মাহমুদ", text: "সরাসরি ফোন করে পুরো গাইডলাইন বুঝিয়ে দিয়েছেন এডমিন।", rating: 5, approved: true, date: "১ মাস আগে" },
  { id: "rev_25", name: "হাবিবুর রহমান", text: "টাকা মার যাওয়ার কোনো ভয় নেই, ১০০% ভরসা রাখতে পারেন।", rating: 5, approved: true, date: "১ মাস আগে" },
  { id: "rev_26", name: "সাইফুল ইসলাম", text: "ফ্রি ফায়ারের বেস্ট আইডি শপ ইন বাংলাদেশ!", rating: 5, approved: true, date: "১ মাস আগে" },
  { id: "rev_27", name: "মোস্তফা কামাল", text: "ফাস্ট ডেলিভারি আর জেনুইন একাউন্ট। শুভকামনা রইল।", rating: 5, approved: true, date: "১ মাস আগে" },
  { id: "rev_28", name: "রবিউল আওয়াল", text: "আইডির পাসওয়ার্ড ও জিমেইল সফলভাবে পরিবর্তন করে নিয়েছি।", rating: 5, approved: true, date: "১ মাস আগে" },
  { id: "rev_29", name: "রেজাউল করিম", text: "রকেট পেমেন্ট করেছিলাম, ৩ মিনিটে ডিল ডান!", rating: 5, approved: true, date: "১ মাস আগে" },
  { id: "rev_30", name: "মিজানুর রহমান", text: "জিরো পয়েন্ট এফএফ থেকে একাউন্ট নিয়ে কখনোই ঠকবেন না।", rating: 5, approved: true, date: "১ মাস আগে" }
];
