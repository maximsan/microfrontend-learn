import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Lets the cart widget report whether it got the same React as the shell.
globalThis.__SHELL_USE_STATE__ = useState;
createRoot(document.getElementById('root')).render(<App />);
