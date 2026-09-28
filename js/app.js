/* ==========================================================================
   MAIN APPLICATION ENTRY POINT (GUARANTEED READY-STATE BOOTSTRAP)
   ========================================================================== */

import { handleRoute } from './router.js';

window.addEventListener('error', (e) => {
  console.error('Global Error caught:', e);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled Promise Rejection:', e.reason);
});

const boot = async () => {
  try {
    await handleRoute();
  } catch (err) {
    console.error('Error during route handling:', err);
    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; padding: 2rem; text-align: center;">
          <div style="max-width: 500px; background: #1e293b; padding: 2rem; border-radius: 16px; border: 1px solid #ef4444;">
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">⚠️</div>
            <h2 style="margin: 0 0 0.5rem 0; color: #ef4444;">Application Error</h2>
            <p style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 1.5rem;">An unexpected error occurred while loading this view.</p>
            <button onclick="window.location.hash='#'; window.location.reload();" style="background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer;">Return to Home</button>
          </div>
        </div>
      `;
    }
  }
};

// Guaranteed instant route initialization regardless of DOM readyState timing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

// Global Hash Change Listener
window.addEventListener('hashchange', boot);

