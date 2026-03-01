import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white/70 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md flex items-center justify-center font-black text-xs bg-accent text-white">AA</div>
              <span className="text-white font-bold text-lg">Alé Alon</span>
            </div>
            <p className="text-sm">
              Découvrez ce qui se passe autour de vous à La Réunion.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Accueil</Link></li>
              <li><Link to="/recherche" className="hover:text-white transition-colors">Rechercher</Link></li>
              <li><Link to="/proposer" className="hover:text-white transition-colors">Proposer un événement</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Informations</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
              <li><Link to="/politique-confidentialite" className="hover:text-white transition-colors">Politique de confidentialité</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex items-center justify-between text-xs text-white/40">
          <span>© {new Date().getFullYear()} Alé Alon — Agenda événementiel de La Réunion</span>
          <Link to="/admin" className="hover:text-white transition-colors">Administration</Link>
        </div>
      </div>
    </footer>
  );
}
