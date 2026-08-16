import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App.tsx';
import { ErrorBoundary } from './src/components/ErrorBoundary.tsx';
import './index.css';

const isQuickCapture = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'quick-capture';
const QuickCaptureOverlay = React.lazy(() => import('./src/components/modals/QuickCaptureOverlay.tsx').then(m => ({ default: m.QuickCaptureOverlay })));

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        {isQuickCapture ? (
          <Suspense fallback={null}>
            <QuickCaptureOverlay onAddTask={() => {}} />
          </Suspense>
        ) : (
          <App />
        )}
      </ErrorBoundary>
    </React.StrictMode>
  );
}
