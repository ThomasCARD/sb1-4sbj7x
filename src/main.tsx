import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeFirebase } from './lib/initializeData';

// Initialize Firebase and create admin user
initializeFirebase().catch(console.error);

// Initialize the root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

// Create and render the app
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);