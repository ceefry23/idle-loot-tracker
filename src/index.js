// src/index.js or src/index.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { CharactersProvider } from './features/character/CharacterContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <CharactersProvider>
        <App />
      </CharactersProvider>
    </AuthProvider>
  </React.StrictMode>
);
