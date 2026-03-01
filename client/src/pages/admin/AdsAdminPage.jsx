import { useState, useEffect } from 'react';
import { Plus, Megaphone, BarChart3 } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdsAdminPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [boosts, setBoosts] = useState([]);
  const [tab, setTab] = useState('campaigns');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/ads/campaigns'),
      api.get('/ads/boosts'),
    ]).then(([campRes, boostRes]) => {
      setCampaigns(campRes.data);
      setBoosts(boostRes.data);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusColors = {
    draft: '#ABB2B9',
    scheduled: '#3498DB',
    active: '#27AE60',
    ended: '#5D6D7E',
    suspended: '#E74C3C',
    pending: '#E67E22',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Publicité & Mises en avant</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('campaigns')} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'campaigns' ? 'bg-primary text-white' : 'bg-surface-alt text-text-secondary hover:bg-border'}`}>
          <Megaphone size={16} /> Campagnes
        </button>
        <button onClick={() => setTab('boosts')} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'boosts' ? 'bg-primary text-white' : 'bg-surface-alt text-text-secondary hover:bg-border'}`}>
          <BarChart3 size={16} /> Mises en avant
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-text-secondary">Chargement...</div>
      ) : tab === 'campaigns' ? (
        <div>
          {campaigns.length === 0 ? (
            <div className="text-center py-12 bg-white border border-border rounded-card">
              <Megaphone size={40} className="text-text-light mx-auto mb-3" />
              <p className="text-text-secondary">Aucune campagne publicitaire</p>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface-alt text-text-secondary text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Campagne</th>
                    <th className="px-4 py-3 text-left">Annonceur</th>
                    <th className="px-4 py-3 text-left">Période</th>
                    <th className="px-4 py-3 text-left">Statut</th>
                    <th className="px-4 py-3 text-left">Priorité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {campaigns.map(c => (
                    <tr key={c.id} className="hover:bg-surface-alt/50">
                      <td className="px-4 py-3 font-medium text-text-primary">{c.name}</td>
                      <td className="px-4 py-3 text-text-secondary">{c.advertiser}</td>
                      <td className="px-4 py-3 text-text-secondary text-xs">{formatDate(c.date_start)} — {formatDate(c.date_end)}</td>
                      <td className="px-4 py-3"><Badge color={statusColors[c.status]}>{c.status}</Badge></td>
                      <td className="px-4 py-3 text-text-secondary capitalize">{c.priority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div>
          {boosts.length === 0 ? (
            <div className="text-center py-12 bg-white border border-border rounded-card">
              <BarChart3 size={40} className="text-text-light mx-auto mb-3" />
              <p className="text-text-secondary">Aucune mise en avant</p>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface-alt text-text-secondary text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Événement</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Période</th>
                    <th className="px-4 py-3 text-left">Montant</th>
                    <th className="px-4 py-3 text-left">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {boosts.map(b => (
                    <tr key={b.id} className="hover:bg-surface-alt/50">
                      <td className="px-4 py-3 font-medium text-text-primary">{b.event_title || `#${b.event_id}`}</td>
                      <td className="px-4 py-3 text-text-secondary capitalize">{b.boost_type}</td>
                      <td className="px-4 py-3 text-text-secondary text-xs">{formatDate(b.date_start)} — {formatDate(b.date_end)}</td>
                      <td className="px-4 py-3 text-text-secondary">{b.amount ? `${b.amount} €` : '—'}</td>
                      <td className="px-4 py-3"><Badge color={statusColors[b.status]}>{b.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
