import { useState, useEffect } from 'react';
import { Database, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';

export default function ScrapingAdminPage() {
  const [sources, setSources] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/scraping/sources'),
      api.get('/scraping/logs?limit=20'),
    ]).then(([srcRes, logRes]) => {
      setSources(srcRes.data);
      setLogs(logRes.data);
    }).catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (source) => {
    await api.put(`/scraping/sources/${source.id}`, { active: !source.active });
    load();
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-6 text-center text-ink-secondary">Chargement...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-ink-primary mb-6">Sources de scraping</h1>

      <div className="space-y-3 mb-8">
        {sources.map(src => (
          <div key={src.id} className="bg-white border border-line rounded-card p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Database size={16} className="text-primary-light" />
                <h3 className="font-semibold text-ink-primary">{src.name}</h3>
                <Badge color={src.active ? '#27AE60' : '#ABB2B9'}>{src.active ? 'Active' : 'Inactive'}</Badge>
                <Badge color="#3498DB">Tier {src.tier}</Badge>
              </div>
              <p className="text-xs text-ink-secondary mt-1">{src.url}</p>
              <p className="text-xs text-ink-light mt-0.5">Fréquence : {src.frequency}</p>
            </div>
            <button
              onClick={() => toggleActive(src)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${src.active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-secondary hover:bg-green-100'}`}
            >
              {src.active ? 'Désactiver' : 'Activer'}
            </button>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-bold text-ink-primary mb-4">Derniers logs</h2>
      {logs.length === 0 ? (
        <p className="text-ink-secondary text-sm">Aucun log de scraping</p>
      ) : (
        <div className="bg-white border border-line rounded-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-alt text-ink-secondary text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Source</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-right">Trouvés</th>
                <th className="px-4 py-3 text-right">Créés</th>
                <th className="px-4 py-3 text-right">Doublons</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {logs.map(log => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-ink-secondary">{new Date(log.started_at).toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-3 text-ink-primary">{log.source_id}</td>
                  <td className="px-4 py-3"><Badge color={log.status === 'success' ? '#27AE60' : '#E74C3C'}>{log.status}</Badge></td>
                  <td className="px-4 py-3 text-right">{log.events_found}</td>
                  <td className="px-4 py-3 text-right">{log.events_created}</td>
                  <td className="px-4 py-3 text-right">{log.events_duplicated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
