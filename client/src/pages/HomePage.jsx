import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, ChevronRight } from 'lucide-react';
import api from '../services/api';
import EventCard from '../components/ui/EventCard';
import CategoryChip from '../components/ui/CategoryChip';

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/events?limit=12'),
      api.get('/categories'),
    ]).then(([eventsRes, categoriesRes]) => {
      setEvents(eventsRes.data);
      setCategories(categoriesRes.data);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleCategory = (id) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const featuredEvents = events.filter(e => e.featured);
  const upcomingEvents = events.filter(e => !e.featured);

  return (
    <div>
      {/* Hero */}
      <section className="bg-surface-alt px-4 py-10 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-ink-primary mb-2 tracking-tight">
            Que faire autour de vous ?
          </h1>
          <p className="text-ink-secondary mb-6 text-base md:text-lg">
            Découvrez les événements à La Réunion, maintenant.
          </p>

          {/* Search bar */}
          <div className="flex gap-2 max-w-xl mx-auto mb-6">
            <div className="flex-1 flex items-center gap-2 bg-white border border-line rounded-xl px-4 py-3">
              <MapPin size={18} className="text-ink-light flex-shrink-0" />
              <input
                type="text"
                placeholder="Rechercher un événement, un lieu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-sm outline-none text-ink-primary placeholder:text-ink-light"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    window.location.href = `/recherche?q=${encodeURIComponent(searchQuery)}`;
                  }
                }}
              />
            </div>
            <Link
              to={searchQuery ? `/recherche?q=${encodeURIComponent(searchQuery)}` : '/recherche'}
              className="bg-accent text-white font-semibold text-sm px-5 py-3 rounded-xl hover:bg-accent-900 transition-colors flex items-center gap-1"
            >
              <Search size={16} />
              <span className="hidden sm:inline">Rechercher</span>
            </Link>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.slice(0, 8).map(cat => (
              <CategoryChip
                key={cat.id}
                category={cat}
                selected={selectedCategories.has(cat.id)}
                onClick={() => toggleCategory(cat.id)}
                size="sm"
              />
            ))}
            {categories.length > 8 && (
              <Link to="/recherche" className="text-xs font-medium px-2.5 py-1.5 text-primary-light">
                +{categories.length - 8} autres
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured events */}
      {featuredEvents.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-ink-primary">À la une</h2>
            <Link to="/recherche" className="text-sm font-medium text-primary-light flex items-center gap-1 hover:underline">
              Voir tout <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming events */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-ink-primary">Événements à venir</h2>
          <Link to="/recherche" className="text-sm font-medium text-primary-light flex items-center gap-1 hover:underline">
            Voir tout <ChevronRight size={16} />
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-12 text-ink-secondary">Chargement...</div>
        ) : upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-ink-secondary">
            <p className="text-lg mb-2">Aucun événement pour le moment</p>
            <p className="text-sm">Revenez bientôt ou <Link to="/proposer" className="text-primary-light underline">proposez un événement</Link> !</p>
          </div>
        )}
      </section>
    </div>
  );
}
