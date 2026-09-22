import { hydrateRoot } from 'react-dom/client';
import { App } from './App.jsx';

hydrateRoot(document, <App />, {
  onRecoverableError(error) {
    console.warn('[recoverable]', error.message);
  },
});
