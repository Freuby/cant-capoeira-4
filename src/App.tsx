import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SongProvider } from './context/SongContext';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { SongForm } from './pages/SongForm';
import { Prompter } from './pages/Prompter';
import { Settings } from './pages/Settings';
import { SongView } from './pages/SongView';

const AppContent = () => {
  const location = useLocation();
  const hideNavigation = location.pathname === '/prompter';

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<SongForm />} />
        <Route path="/edit/:id" element={<SongForm />} />
        <Route path="/prompter" element={<Prompter />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/song/:id" element={<SongView />} />
      </Routes>
      {!hideNavigation && <Navigation />}
    </div>
  );
};

export default function App() {
  return (
    <SongProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </SongProvider>
  );
}