import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for complete offline caching
registerSW({
  immediate: true,
  onNeedRefresh() {
    // New content is available; auto-reload or prompt handled
  },
  onOfflineReady() {
    console.log('StudySphere is ready to operate completely offline.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
