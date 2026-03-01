import { useState, useEffect } from 'react';
import { Database, RefreshCw, Play } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';

export default function ScrapingAdminPage() {
  const [sources, setSources] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState(null);
  const [runResult, setRunResult] = useState(null);

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

  const runSource = async (source) => {
    setRunningId(source.id);
    setRunResult(null);
    try {
      const res = await api.post(`/scraping/sources/${source.id}/run`);
      setRunResult({ sourceId: source.id, status: 'success', data: res.data });
      load();
    } catch (err) {
      setRunResult({
        sourceId: source.id,
        status: 'error',
        message: err.response?.data?.error || err.message,
      });
    } finally {
      setRunningId(null);
    }
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-6 text-center text-ink-secondary">Chargement...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-ink-primary mb-6">Sources de scraping</h1>

      <div className="space-y-3 mb-8">
        {sources.map(src => (
          <div key={src.id} className="bg-white border border-line rounded-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Database size={16} className="text-primary-light" />
                  <h3 className="font-semibold text-ink-primary">{src.name}</h3>
                  <Badge color={src.active ? '#27AE60' : '#ABB2B9'}>{src.active ? 'Active' : 'Inactive'}</Badge>
                  <Badge color="#3498DB">Tier {src.tier}</Badge>
                </div>
                <p className="text-xs text-ink-secondary mt-1">{src.url}</p>
                <div className="flex gap-4 mt-0.5">
                  <p className="text-xs text-ink-light">Fréquence : {src.frequency}</p>
                  {src.last_run_at && (
                    <p className="text-xs text-ink-light">
                      Dernier lancement : {new Date(src.last_run_at).toLocaleString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => runSource(src)}
                  disabled={runningId !== null || !src.active}
                  className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    runningId === src.id
                      ? 'bg-blue-100 text-blue-500 cursor-wait'
                      : !src.active
                        ? 'bg-surface-alt text-ink-light cursor-not-allowed'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  } ${runningId !== null && runningId !== src.id ? 'opacity-50' : ''}`}
                >
                  {runningId === src.id ? (
                    <><RefreshCw size={12} className="animate-spin" /> En cours...</>
                  ) : (
                    <><Play size={12} /> Lancer</>
                  )}
                </button>
                <button
                  onClick={() => toggleActive(src)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    src.active
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-green-50 text-secondary hover:bg-green-100'
                  }`}
                >
                  {src.active ? 'Désactiver' : 'Activer'}
                </button>
              </div>
            </div>

            {runResult && runResult.sourceId === src.id && (
              <div className={`mt-3 text-xs p-2.5 rounded-lg ${
                runResult.status === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {runResult.status === 'success'
                  ? `Scraping terminé — ${runResult.data.events_found || 0} trouvés, ${runResult.data.events_created || 0} créés, ${runResult.data.events_duplicated || 0} doublons`
                  : `Erreur : ${runResult.message}`}
              </div>
            )}
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
                  <td className="px-4 py-3 text-ink-primary">{sources.find(s => s.id === log.source_id)?.name || `#${log.source_id}`}</td>
                  <td className="px-4 py-3">
                    <Badge color={log.status === 'success' ? '#27AE60' : log.status === 'partial' ? '#E67E22' : '#E74C3C'}>
                      {log.status}
                    </Badge>
                  </td>
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
