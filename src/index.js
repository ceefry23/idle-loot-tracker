import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Import the CharactersProvider from your new features location
import { CharactersProvider } from './features/character/CharacterContext';

// If you have other providers (e.g., Auth), import and nest as needed

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CharactersProvider>
      <App />
    </CharactersProvider>
  </React.StrictMode>
);
