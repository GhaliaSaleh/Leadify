import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App.jsx';
import './index.css';
import theme from './theme.js'; 

// نستدعي createRoot مرة واحدة فقط
const root = ReactDOM.createRoot(document.getElementById('root'));

// ونستدعي render مرة واحدة فقط، مع تغليف كل المزودين بالترتيب الصحيح
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
      <ChakraProvider theme={theme}>
          <App />
        </ChakraProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);