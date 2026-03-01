import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Filter, X } from 'lucide-react';
import api from '../services/api';
import EventCard from '../components/ui/EventCard';
import CategoryChip from '../components/ui/CategoryChip';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [q, setQ] = useState(searchParams.get('q') || '');
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedCommune, setSelectedCommune] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [freeOnly, setFreeOnly] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/communes'),
    ]).then(([catRes, comRes]) => {
      setCategories(catRes.data);
      setCommunes(comRes.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    doSearch();
  }, []);

  const doSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (selectedCategories.size > 0) params.set('categories', [...selectedCategories].join(','));
      if (selectedCommune) params.set('commune_id', selectedCommune);
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      if (freeOnly) params.set('free', 'true');
      params.set('limit', '40');

      const res = await api.get(`/events/search?${params.toString()}`);
      setEvents(res.data);
      setSearchParams(params);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (id) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    setQ('');
    setSelectedCategories(new Set());
    setSelectedCommune('');
    setDateFrom('');
    setDateTo('');
    setFreeOnly(false);
  };

  const communesByRegion = communes.reduce((acc, c) => {
    if (!acc[c.micro_region]) acc[c.micro_region] = [];
    acc[c.micro_region].push(c);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-ink-primary mb-6">Rechercher des événements</h1>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-white border border-line rounded-xl px-4 py-3">
          <Search size={18} className="text-ink-light flex-shrink-0" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && doSearch()}
            className="flex-1 text-sm outline-none text-ink-primary placeholder:text-ink-light"
          />
        </div>
        <button onClick={doSearch} className="bg-accent text-white font-semibold text-sm px-5 py-3 rounded-xl hover:bg-accent-900 transition-colors">
          Rechercher
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1 px-4 py-3 rounded-xl text-sm font-medium border transition-colors ${showFilters ? 'bg-primary text-white border-primary' : 'bg-white text-ink-secondary border-line hover:border-primary'}`}
        >
          <Filter size={16} />
          <span className="hidden sm:inline">Filtres</span>
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white border border-line rounded-card p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-ink-primary">Filtres</h3>
            <button onClick={clearFilters} className="text-xs text-primary-light hover:underline flex items-center gap-1">
              <X size={14} /> Réinitialiser
            </button>
          </div>

          {/* Categories */}
          <div className="mb-4">
            <label className="text-sm font-medium text-ink-secondary mb-2 block">Catégories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <CategoryChip
                  key={cat.id}
                  category={cat}
                  selected={selectedCategories.has(cat.id)}
                  onClick={() => toggleCategory(cat.id)}
                  size="sm"
                />
              ))}
            </div>
          </div>

          {/* Commune */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-ink-secondary mb-1 block">Commune</label>
              <select
                value={selectedCommune}
                onChange={(e) => setSelectedCommune(e.target.value)}
                className="w-full border border-line rounded-lg px-3 py-2 text-sm text-ink-primary"
              >
                <option value="">Toutes les communes</option>
                {Object.entries(communesByRegion).map(([region, coms]) => (
                  <optgroup key={region} label={region}>
                    {coms.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-ink-secondary mb-1 block">Du</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full border border-line rounded-lg px-3 py-2 text-sm text-ink-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink-secondary mb-1 block">Au</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full border border-line rounded-lg px-3 py-2 text-sm text-ink-primary" />
            </div>
          </div>

          {/* Free only */}
          <label className="flex items-center gap-2 text-sm text-ink-secondary cursor-pointer">
            <input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} className="rounded" />
            Gratuit uniquement
          </label>

          <button onClick={doSearch} className="mt-4 bg-accent text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-accent-900 transition-colors">
            Appliquer les filtres
          </button>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-ink-secondary">Chargement...</div>
      ) : events.length > 0 ? (
        <>
          <p className="text-sm text-ink-secondary mb-4">{events.length} événement{events.length > 1 ? 's' : ''} trouvé{events.length > 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-ink-secondary">
          <p className="text-lg mb-2">Aucun événement trouvé</p>
          <p className="text-sm">Essayez de modifier vos critères de recherche.</p>
        </div>
      )}
    </div>
  );
}
