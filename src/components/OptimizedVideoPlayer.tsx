import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, RotateCcw, AlertCircle, X, ExternalLink, Loader2 } from 'lucide-react';
import { extractYouTubeId } from '../utils/mediaStorage';

// Global playback coordinator: ensures only one video is active at any time
type VideoListener = (activeId: string | null) => void;
const listeners = new Set<VideoListener>();
let currentActiveVideoId: string | null = null;

export function setActiveVideo(id: string | null) {
  currentActiveVideoId = id;
  listeners.forEach((listener) => listener(id));
}

export function subscribeToActiveVideo(listener: VideoListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

interface OptimizedVideoPlayerProps {
  id: string; // Unique identifier (e.g. account code or code + context)
  videoUrl: string;
  posterUrl?: string;
  title?: string;
  autoPlayOnSelect?: boolean;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'auto';
  onClose?: () => void;
  showCloseButton?: boolean;
}

export const OptimizedVideoPlayer: React.FC<OptimizedVideoPlayerProps> = ({
  id,
  videoUrl,
  posterUrl,
  title = 'Gameplay Video',
  autoPlayOnSelect = false,
  className = '',
  aspectRatio = 'video',
  onClose,
  showCloseButton = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlayOnSelect);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const ytId = extractYouTubeId(videoUrl);
  const isDirectVideo = Boolean(!ytId && (videoUrl.includes('.mp4') || videoUrl.includes('.webm') || videoUrl.startsWith('data:') || videoUrl.startsWith('/')));

  // Subscribe to global video coordinator: if another video plays, pause this one
  useEffect(() => {
    const unsubscribe = subscribeToActiveVideo((activeId) => {
      if (activeId !== id && isPlaying) {
        setIsPlaying(false);
        if (videoRef.current) {
          videoRef.current.pause();
        }
      }
    });
    return unsubscribe;
  }, [id, isPlaying]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (currentActiveVideoId === id) {
        setActiveVideo(null);
      }
    };
  }, [id]);

  // Handle Play start
  const handleStartPlay = useCallback(() => {
    setHasError(false);
    setIsBuffering(true);
    setIsPlaying(true);
    setActiveVideo(id);
  }, [id]);

  // Handle Stop / Close
  const handleStop = useCallback(() => {
    setIsPlaying(false);
    setIsBuffering(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    if (currentActiveVideoId === id) {
      setActiveVideo(null);
    }
    if (onClose) {
      onClose();
    }
  }, [id, onClose]);

  // Handle Retry on Error
  const handleRetry = useCallback(() => {
    setHasError(false);
    setErrorMessage('');
    setRetryCount((prev) => prev + 1);
    setIsBuffering(true);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // Browser autoplay policy might block programmatic play
      });
    }
  }, []);

  const aspectClass = aspectRatio === 'video' ? 'aspect-video' : aspectRatio === 'square' ? 'aspect-square' : '';

  // Determine fallback poster
  const effectivePoster = posterUrl || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : '/zero_point_logo.png');

  // YOUTUBE EMBED
  if (isPlaying && ytId) {
    return (
      <div 
        ref={containerRef}
        className={`relative w-full ${aspectClass} bg-black overflow-hidden select-none ${className}`}
      >
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />

        {/* Top Overlay Controls */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-30">
          <a
            href={`https://youtu.be/${ytId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-black/80 hover:bg-black text-white/90 hover:text-white border border-white/20 transition-all text-xs flex items-center gap-1 shadow-md active:scale-95"
            title="YouTube অ্যাপে দেখুন"
            aria-label="YouTube অ্যাপে দেখুন"
          >
            <ExternalLink className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline text-[11px] font-medium">YouTube</span>
          </a>

          {showCloseButton && (
            <button
              type="button"
              onClick={handleStop}
              className="p-1.5 rounded-lg bg-black/80 hover:bg-red-600 text-white transition-all border border-white/20 cursor-pointer shadow-md active:scale-95"
              title="ভিডিও বন্ধ করুন"
              aria-label="ভিডিও বন্ধ করুন"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // DIRECT MP4/WEBM VIDEO
  if (isPlaying && isDirectVideo) {
    return (
      <div 
        ref={containerRef}
        className={`relative w-full ${aspectClass} bg-black overflow-hidden select-none flex items-center justify-center ${className}`}
      >
        <video
          key={`${videoUrl}-${retryCount}`}
          ref={videoRef}
          src={videoUrl}
          poster={effectivePoster}
          controls
          autoPlay
          playsInline
          // Cross-browser mobile attributes
          webkit-playsinline="true"
          x5-playsinline="true"
          x5-video-player-type="h5-page"
          preload="metadata"
          className="w-full h-full object-contain"
          onLoadStart={() => setIsBuffering(true)}
          onWaiting={() => setIsBuffering(true)}
          onCanPlay={() => setIsBuffering(false)}
          onPlaying={() => {
            setIsBuffering(false);
            setHasError(false);
          }}
          onError={(e) => {
            setIsBuffering(false);
            setHasError(true);
            const err = e.currentTarget.error;
            let msg = 'ভিডিও লোড হতে সমস্যা হয়েছে।';
            if (err?.code === 2) msg = 'নেটওয়ার্ক ড্রপ হয়েছে। সংযোগ পরীক্ষা করুন।';
            if (err?.code === 3) msg = 'ভিডিও ডিকোড হতে সমস্যা হয়েছে।';
            if (err?.code === 4) msg = 'ভিডিও ফরম্যাট এই ডিভাইসে সাপোর্ট করছে না।';
            setErrorMessage(msg);
          }}
        >
          আপনার ব্রাউজার সরাসরি এই ভিডিও সাপোর্ট করে না।
        </video>

        {/* Buffering Indicator */}
        {isBuffering && !hasError && (
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 pointer-events-none z-20 transition-opacity">
            <Loader2 className="w-8 h-8 text-[#ff2a85] animate-spin" />
            <span className="text-xs font-semibold text-white tracking-wide drop-shadow">
              ভিডিও বাফার হচ্ছে...
            </span>
          </div>
        )}

        {/* Error State with Retry Button */}
        {hasError && (
          <div className="absolute inset-0 bg-black/90 p-4 flex flex-col items-center justify-center gap-3 text-center z-25">
            <AlertCircle className="w-8 h-8 text-amber-400" />
            <p className="text-xs text-zinc-300 max-w-xs">{errorMessage || 'ভিডিও প্লে করতে ব্যর্থ হয়েছে।'}</p>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={handleRetry}
                className="px-3.5 py-1.5 rounded-lg bg-[#ff2a85] hover:bg-[#e01972] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>আবার চেষ্টা করুন</span>
              </button>
              <button
                type="button"
                onClick={handleStop}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold active:scale-95 cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        )}

        {/* In-player Close Button */}
        {showCloseButton && (
          <div className="absolute top-2 right-2 z-30">
            <button
              type="button"
              onClick={handleStop}
              className="p-1.5 rounded-lg bg-black/80 hover:bg-red-600 text-white transition-all border border-white/20 cursor-pointer shadow-md active:scale-95"
              title="ভিডিও বন্ধ করুন"
              aria-label="ভিডিও বন্ধ করুন"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // POSTER PREVIEW WITH PLAY BUTTON
  return (
    <div 
      className={`relative w-full ${aspectClass} bg-[#181120] overflow-hidden group/thumb cursor-pointer select-none ${className}`}
      onClick={handleStartPlay}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStartPlay();
        }
      }}
      aria-label={`প্লে করুন: ${title}`}
    >
      <img
        src={effectivePoster}
        alt={title}
        loading="lazy"
        decoding="async"
        width="480"
        height="270"
        className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
        onError={(e) => {
          const target = e.currentTarget;
          target.onerror = null;
          if (ytId && !target.src.includes('hqdefault.jpg')) {
            target.src = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
          } else {
            target.src = '/zero_point_logo.png';
          }
        }}
      />

      {/* Dark gradient vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

      {/* Central Play Trigger Button */}
      <div className="absolute inset-0 m-auto w-12 h-9 sm:w-14 sm:h-10 rounded-xl bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.7)] group-hover/thumb:shadow-[0_0_28px_rgba(239,68,68,0.95)] group-hover/thumb:scale-110 active:scale-95 transition-all duration-300 z-10 border border-white/20">
        <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white ml-0.5" />
      </div>

      {/* Video format badge on bottom left */}
      <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5">
        <span className="bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/15 shadow">
          {ytId ? 'YouTube HD' : 'ভিডিও'}
        </span>
      </div>
    </div>
  );
};
