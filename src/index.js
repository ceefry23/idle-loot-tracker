// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Your existing characters context
import { CharactersProvider } from './context/CharacterContext';

// Add your new auth context
import { AuthProvider } from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>            {/* ← wraps everything so you can call useAuth() */}
      <CharactersProvider>    {/* ← your existing characters data */}
        <App />
      </CharactersProvider>
    </AuthProvider>
  </React.StrictMode>
);
