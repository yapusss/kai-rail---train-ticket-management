
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Swal from 'sweetalert2';

const rootElement = document.getElementById('root');
if (!rootElement) {
  Swal.fire({
    icon: 'error',
    title: 'Kesalahan Aplikasi',
    text: 'Tidak dapat menemukan elemen root untuk mounting aplikasi.',
    confirmButtonText: 'Baik'
  });
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
