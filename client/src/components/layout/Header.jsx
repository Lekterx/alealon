import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-primary shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm bg-accent text-white">
            AA
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-white font-bold text-xl tracking-tight">Alé Alon</span>
            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-white/15 text-white/80">
              .re
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-white' : 'text-white/70 hover:text-white'}`}
          >
            Explorer
          </Link>
          <Link
            to="/recherche"
            className={`text-sm font-medium transition-colors ${isActive('/recherche') ? 'text-white' : 'text-white/70 hover:text-white'}`}
          >
            Rechercher
          </Link>
          <span className="text-white/30">|</span>
          <Link
            to="/proposer"
            className="text-sm font-medium text-accent-light hover:text-accent-50 transition-colors"
          >
            Proposer un événement
          </Link>
          {user && (
            <Link
              to="/admin"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Mobile burger */}
        <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-primary-dark border-t border-white/10 px-4 py-4 space-y-3">
          <Link to="/" className="block text-white text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>Explorer</Link>
          <Link to="/recherche" className="block text-white text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>Rechercher</Link>
          <Link to="/proposer" className="block text-accent-light text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>Proposer un événement</Link>
          {user && <Link to="/admin" className="block text-white/70 text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>Admin</Link>}
        </div>
      )}
    </header>
  );
}
