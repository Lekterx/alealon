import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Star, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function EventsAdminPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const loadEvents = () => {
    setLoading(true);
    const params = filter ? `?status=${filter}` : '';
    api.get(`/events/admin/all${params}&limit=100`)
      .then(res => setEvents(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEvents(); }, [filter]);

  const deleteEvent = async (id) => {
    if (!confirm('Supprimer cet événement ?')) return;
    await api.delete(`/events/${id}`);
    loadEvents();
  };

  const toggleFeatured = async (event) => {
    await api.put(`/events/${event.id}`, { featured: !event.featured });
    loadEvents();
  };

  const statusColors = {
    published: '#27AE60',
    draft: '#ABB2B9',
    pending: '#E67E22',
    archived: '#5D6D7E',
    cancelled: '#E74C3C',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Événements</h1>
        <Link to="/admin/events/new" className="bg-accent text-white font-semibold text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-accent-900 transition-colors">
          <Plus size={16} />
          Nouveau
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['', 'published', 'draft', 'pending', 'archived', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${filter === s ? 'bg-primary text-white' : 'bg-surface-alt text-text-secondary hover:bg-border'}`}
          >
            {s || 'Tous'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-text-secondary">Chargement...</div>
      ) : (
        <div className="bg-white border border-border rounded-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-alt text-text-secondary text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Événement</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Source</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.map(event => {
                const mainCat = event.categories?.[0]?.id ? event.categories[0] : null;
                return (
                  <tr key={event.id} className="hover:bg-surface-alt/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-primary">{event.title}</div>
                      {mainCat && <span className="text-xs text-text-secondary">{mainCat.icon} {mainCat.name}</span>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-text-secondary">{formatDate(event.date_start)}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-text-secondary capitalize">{event.source}</td>
                    <td className="px-4 py-3">
                      <Badge color={statusColors[event.status]}>{event.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toggleFeatured(event)} title={event.featured ? 'Retirer de la une' : 'Mettre à la une'} className={`p-1.5 rounded-lg hover:bg-surface-alt ${event.featured ? 'text-accent' : 'text-text-light'}`}>
                          <Star size={16} fill={event.featured ? 'currentColor' : 'none'} />
                        </button>
                        <Link to={`/evenement/${event.slug}`} className="p-1.5 rounded-lg hover:bg-surface-alt text-text-light">
                          <Eye size={16} />
                        </Link>
                        <Link to={`/admin/events/${event.id}/edit`} className="p-1.5 rounded-lg hover:bg-surface-alt text-primary-light">
                          <Edit2 size={16} />
                        </Link>
                        <button onClick={() => deleteEvent(event.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {events.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-text-secondary">Aucun événement</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
