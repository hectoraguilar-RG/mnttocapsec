import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registrar Service Worker para instalar la app como PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log(
          'Service Worker registrado correctamente:',
          registration.scope
        );
      })
      .catch((error) => {
        console.error(
          'Error al registrar Service Worker:',
          error
        );
      });
  });
}
