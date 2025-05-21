import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { CharactersProvider } from './context/CharacterContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CharactersProvider>
      <App />
    </CharactersProvider>
  </React.StrictMode>
);