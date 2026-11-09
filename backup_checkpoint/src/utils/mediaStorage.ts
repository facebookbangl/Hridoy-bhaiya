/**
 * Media Storage and Processing Utilities for ZERO POINT FF
 * Supports multiple high-resolution photos, compression, video handling, and YouTube parsing.
 */

// Extract YouTube ID from various URL formats
export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Pattern matches:
  // - youtube.com/watch?v=ID
  // - youtu.be/ID
  // - youtube.com/shorts/ID
  // - youtube.com/embed/ID
  // - m.youtube.com/watch?v=ID
  const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);
  return match && match[1] ? match[1] : null;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
}

export interface YouTubeDetails {
  id: string;
  title: string;
  thumbnailUrl: string;
  author?: string;
}

export function getYouTubeThumbnail(urlOrId: string, quality: 'hq' | 'max' = 'hq'): string {
  const id = extractYouTubeId(urlOrId) || urlOrId;
  return quality === 'max'
    ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
    : `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export async function fetchYouTubeDetails(url: string): Promise<YouTubeDetails | null> {
  const id = extractYouTubeId(url);
  if (!id) return null;

  const defaultThumb = getYouTubeThumbnail(id, 'hq');
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    if (res.ok) {
      const data = await res.json();
      return {
        id,
        title: data.title || `Free Fire ID - YouTube Video`,
        thumbnailUrl: data.thumbnail_url || defaultThumb,
        author: data.author_name,
      };
    }
  } catch (err) {
    console.warn('oEmbed fetch error, fallback to direct thumbnail:', err);
  }

  return {
    id,
    title: `Free Fire ID [${id}] - Gameplay & Collection`,
    thumbnailUrl: defaultThumb,
  };
}

// Compress and read image file to optimized Web-ready data URL
export function processImageFile(
  file: File, 
  maxWidth = 1600, 
  maxHeight = 1600, 
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate type
    if (!file.type.startsWith('image/')) {
      return reject(new Error('অননুমোদিত ফাইল ফরম্যাট। শুধুমাত্র ছবি (JPG, PNG, WebP) নির্বাচন করুন।'));
    }

    // Validate size (max 20MB per photo before compression)
    if (file.size > 20 * 1024 * 1024) {
      return reject(new Error(`"${file.name}" ছবির সাইজ অনেক বড় (সর্বোচ্চ ২০ মেগাবাইট অনুমোদিত)।`));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ছবি পড়তে সমস্যা হয়েছে।'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('ছবি লোড করা যায়নি।'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target?.result as string);
        }

        // Draw image on canvas
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to webp or jpeg
        const outputFormat = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputFormat, quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Process Video file
export function processVideoFile(file: File, maxSizeMB = 45): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('video/')) {
      return reject(new Error('অননুমোদিত ভিডিও ফরম্যাট। শুধুমাত্র MP4, WebM বা MKV নির্বাচন করুন।'));
    }

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return reject(
        new Error(
          `ভিডিও ফাইল সাইজ (${(file.size / (1024 * 1024)).toFixed(1)}MB) অনেক বড়। সরাসরি ভিডিওর জন্য সর্বোচ্চ ${maxSizeMB}MB অনুমোদিত। বড় ভিডিওর ক্ষেত্রে YouTube লিংক ব্যবহার করুন।`
        )
      );
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ভিডিও ফাইল পড়তে ব্যর্থ হয়েছে।'));
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  });
}

// Native Web Share API helper with rich fallback
export interface SharePayload {
  title: string;
  text: string;
  url: string;
}

export async function shareAccountPost(payload: SharePayload): Promise<{ shared: boolean; method: 'native' | 'copied' | 'none' }> {
  // Try Android / Mobile Web Share API first
  if (navigator.share && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        url: payload.url,
      });
      return { shared: true, method: 'native' };
    } catch (err: any) {
      // User cancelled share dialog or dismissed, which is fine
      if (err.name === 'AbortError') {
        return { shared: false, method: 'none' };
      }
      // If native share fails for another reason, fallback to copy
    }
  }

  // Fallback to Clipboard copy
  try {
    await navigator.clipboard.writeText(`${payload.title}\n${payload.text}\n${payload.url}`);
    return { shared: true, method: 'copied' };
  } catch {
    return { shared: false, method: 'none' };
  }
}
