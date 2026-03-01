import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, AlertCircle, BarChart3, Megaphone, Database } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [eventStats, setEventStats] = useState([]);
  const [submissionStats, setSubmissionStats] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/events/admin/stats'),
      api.get('/submissions/stats'),
    ]).then(([evtRes, subRes]) => {
      setEventStats(evtRes.data);
      setSubmissionStats(subRes.data);
    }).catch(() => {});
  }, []);

  const getCount = (arr, status) => arr.find(s => s.status === status)?.count || 0;
  const totalEvents = eventStats.reduce((sum, s) => sum + s.count, 0);
  const pendingSubmissions = getCount(submissionStats, 'pending');

  const cards = [
    { label: 'Événements publiés', value: getCount(eventStats, 'published'), icon: Calendar, color: 'text-secondary' },
    { label: 'Total événements', value: totalEvents, icon: BarChart3, color: 'text-primary-light' },
    { label: 'Soumissions en attente', value: pendingSubmissions, icon: AlertCircle, color: pendingSubmissions > 0 ? 'text-accent' : 'text-ink-light' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary">Tableau de bord</h1>
          <p className="text-sm text-ink-secondary">Bienvenue, {user?.name}</p>
        </div>
        <button onClick={logout} className="text-sm text-ink-secondary hover:text-red-600 transition-colors">
          Déconnexion
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map((card, i) => (
          <div key={i} className="bg-white border border-line rounded-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <card.icon size={24} className={card.color} />
              <div>
                <p className="text-2xl font-bold text-ink-primary">{card.value}</p>
                <p className="text-xs text-ink-secondary">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <h2 className="text-lg font-bold text-ink-primary mb-4">Accès rapide</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/admin/events" className="bg-white border border-line rounded-card p-5 shadow-sm hover:shadow-md transition-shadow">
          <Calendar size={20} className="text-primary-light mb-2" />
          <h3 className="font-semibold text-ink-primary">Gestion des événements</h3>
          <p className="text-xs text-ink-secondary mt-1">Créer, modifier, supprimer des événements</p>
        </Link>
        <Link to="/admin/submissions" className="bg-white border border-line rounded-card p-5 shadow-sm hover:shadow-md transition-shadow">
          <Users size={20} className="text-accent mb-2" />
          <h3 className="font-semibold text-ink-primary">Modération</h3>
          <p className="text-xs text-ink-secondary mt-1">{pendingSubmissions} soumission{pendingSubmissions > 1 ? 's' : ''} en attente</p>
        </Link>
        <Link to="/admin/scraping" className="bg-white border border-line rounded-card p-5 shadow-sm hover:shadow-md transition-shadow">
          <Database size={20} className="text-secondary mb-2" />
          <h3 className="font-semibold text-ink-primary">Sources de scraping</h3>
          <p className="text-xs text-ink-secondary mt-1">Configurer les sources automatiques</p>
        </Link>
        <Link to="/admin/ads" className="bg-white border border-line rounded-card p-5 shadow-sm hover:shadow-md transition-shadow">
          <Megaphone size={20} className="text-warm mb-2" />
          <h3 className="font-semibold text-ink-primary">Publicité</h3>
          <p className="text-xs text-ink-secondary mt-1">Campagnes et mises en avant</p>
        </Link>
      </div>
    </div>
  );
}
