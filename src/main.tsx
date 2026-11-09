import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Handle Stale Chunk / Dynamic Import Deployment Mismatches
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    try {
      const lastReload = window.sessionStorage.getItem('zp_chunk_reload');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 12000) {
        window.sessionStorage.setItem('zp_chunk_reload', String(now));
        window.location.reload();
      }
    } catch {
      window.location.reload();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const msg = String(event.reason?.message || event.reason || '');
    if (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Importing a module script failed') ||
      msg.includes('error loading dynamically imported module')
    ) {
      event.preventDefault();
      try {
        const lastReload = window.sessionStorage.getItem('zp_chunk_reload');
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload, 10) > 12000) {
          window.sessionStorage.setItem('zp_chunk_reload', String(now));
          window.location.reload();
        }
      } catch {
        window.location.reload();
      }
    }
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  } catch (err) {
    console.error('Fatal: Failed to render ZERO POINT FF React app:', err);
    // Display emergency fallback instead of blank white screen
    rootElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #07020d; color: #ffffff; text-align: center; padding: 20px; font-family: sans-serif;">
        <div style="font-size: 24px; font-weight: 900; margin-bottom: 8px;">ZERO POINT <span style="color: #ff2a85;">FF</span></div>
        <div style="font-size: 14px; color: #d8b4d8; margin-bottom: 20px;">পেজ লোড করতে সাময়িক সমস্যা হয়েছে। রিলোড বাটনে চাপ দিন।</div>
        <button onclick="window.location.reload()" style="padding: 10px 24px; border-radius: 12px; background: #ff2a85; color: #ffffff; font-weight: 700; border: none; cursor: pointer; font-size: 14px;">
          পেজ রিলোড করুন
        </button>
      </div>
    `;
  }
} else {
  console.error('Fatal: Failed to find #root element to mount ZERO POINT FF app');
}
