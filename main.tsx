import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App.tsx';
import { ErrorBoundary } from './src/components/ErrorBoundary.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
