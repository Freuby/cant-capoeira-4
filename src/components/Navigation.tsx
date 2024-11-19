import React from 'react';
import { Home, Plus, Play } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="flex justify-around items-center h-16">
        <Link
          to="/"
          className={`flex flex-col items-center space-y-1 ${
            isActive('/') ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <Home size={24} />
          <span className="text-xs">Accueil</span>
        </Link>
        <Link
          to="/add"
          className={`flex flex-col items-center space-y-1 ${
            isActive('/add') ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <Plus size={24} />
          <span className="text-xs">Ajouter</span>
        </Link>
        <Link
          to="/prompter"
          className={`flex flex-col items-center space-y-1 ${
            isActive('/prompter') ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <Play size={24} />
          <span className="text-xs">Prompteur</span>
        </Link>
      </div>
    </nav>
  );
};