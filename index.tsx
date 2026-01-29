import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// WebView Polyfill: Sometimes native alert() crashes or is invisible in Android WebView
const originalAlert = window.alert;
window.alert = (message) => {
  try {
    originalAlert(message);
  } catch (e) {
    console.log("Native alert failed, using console fallback", message);
  }
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  // This helps debug white screens by writing directly to body if root is missing
  document.body.innerHTML = '<div style="color:red; padding:20px;">CRITICAL ERROR: Root element not found.</div>';
  throw new Error("Could not find root element to mount to");
}

// PWA Service Worker Registration
// Changed to relative path './' for APK compatibility
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        // SW often fails in file:// protocol (Android Studio Assets), we catch it here so app doesn't crash
        console.log('SW registration failed (expected in Development/File mode): ', registrationError);
      });
  });
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  // Catch React Render errors and show them on screen
  rootElement.innerHTML = `<div style="color:red; padding:20px;">
    <h3>Falha ao iniciar App</h3>
    <pre>${error instanceof Error ? error.message : JSON.stringify(error)}</pre>
  </div>`;
  console.error("React Mount Error:", error);
}