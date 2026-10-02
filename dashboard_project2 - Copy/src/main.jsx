import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import './index.css'
import App from './App.jsx'

const backupConsoleError = console.error;

console.error = function (...args) {
  if (typeof args[0] === 'string') {
    if (
      args[0].includes('React does not recognize the') ||
      args[0].includes('cannot be a child of') ||
      args[0].includes('validateDOMNesting') ||
      args[0].includes('non-boolean attribute') ||
      args[0].includes('cannot contain a nested')
    ) {
      return;
    }
  }
  backupConsoleError.apply(console, args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
