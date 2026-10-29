import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { store } from './app/store';
import App from './App';
import './styles.css';
import './admin.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode><Provider store={store}><BrowserRouter><App /><Toaster position="top-right" richColors /></BrowserRouter></Provider></React.StrictMode>,
);
