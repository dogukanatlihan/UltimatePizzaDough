import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeAnalytics } from './utils/analytics'

const rootElement = document.getElementById('root');

// Initialize Google Analytics
initializeAnalytics();
// Track initial page view: gtag('config') in index.html already sends it (GA4 default
// send_page_view), so calling trackPageView here would count every visit twice.

if (rootElement) {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (error) {
    console.error('Error rendering App:', error);
    // Fallback content if App fails to render
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif;">
        <h1>Error Loading App</h1>
        <p>There was an error loading the app. Please check the console for details.</p>
        <pre>${error instanceof Error ? error.message : String(error)}</pre>
      </div>
    `;
  }
} else {
  console.error('Root element not found');
}
