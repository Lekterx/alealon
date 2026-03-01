import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function SubmissionsAdminPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/submissions?status=pending&limit=100')
      .then(res => setSubmissions(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    await api.post(`/submissions/${id}/approve`);
    load();
    setSelected(null);
  };

  const reject = async (id) => {
    await api.post(`/submissions/${id}/reject`, { reason: rejectReason });
    setShowReject(null);
    setRejectReason('');
    load();
    setSelected(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Modération des soumissions</h1>

      {loading ? (
        <div className="text-center py-8 text-text-secondary">Chargement...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12 bg-white border border-border rounded-card">
          <CheckCircle size={40} className="text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">Aucune soumission en attente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map(sub => (
            <div key={sub.id} className="bg-white border border-border rounded-card p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary">{sub.title}</h3>
                  <p className="text-sm text-text-secondary mt-1 line-clamp-2">{sub.description}</p>
                  <div className="flex gap-3 mt-2 text-xs text-text-light">
                    <span>Soumis le {formatDate(sub.created_at)}</span>
                    {sub.submitter_email && <span>Par {sub.submitter_email}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button onClick={() => setSelected(sub)} className="p-2 rounded-lg hover:bg-surface-alt text-text-light" title="Détails">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => approve(sub.id)} className="p-2 rounded-lg hover:bg-green-50 text-secondary" title="Approuver">
                    <CheckCircle size={16} />
                  </button>
                  <button onClick={() => setShowReject(sub.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-400" title="Rejeter">
                    <XCircle size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Détail de la soumission">
        {selected && (
          <div className="space-y-3 text-sm">
            <div><strong>Titre :</strong> {selected.title}</div>
            <div><strong>Description :</strong> <p className="mt-1 whitespace-pre-wrap">{selected.description}</p></div>
            <div><strong>Date :</strong> {formatDate(selected.date_start)}{selected.date_end ? ` — ${formatDate(selected.date_end)}` : ''}</div>
            <div><strong>Adresse :</strong> {selected.address}</div>
            {selected.price && <div><strong>Tarif :</strong> {selected.price}</div>}
            {selected.organizer && <div><strong>Organisateur :</strong> {selected.organizer}</div>}
            {selected.submitter_email && <div><strong>Email soumetteur :</strong> {selected.submitter_email}</div>}
            <div className="flex gap-2 pt-3">
              <button onClick={() => approve(selected.id)} className="bg-secondary text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1">
                <CheckCircle size={14} /> Approuver
              </button>
              <button onClick={() => { setShowReject(selected.id); }} className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1">
                <XCircle size={14} /> Rejeter
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject modal */}
      <Modal isOpen={!!showReject} onClose={() => setShowReject(null)} title="Rejeter la soumission">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-text-primary">Raison du rejet (optionnel)</label>
          <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm resize-y" placeholder="Expliquer la raison..." />
          <button onClick={() => reject(showReject)} className="bg-red-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl w-full">
            Confirmer le rejet
          </button>
        </div>
      </Modal>
    </div>
  );
}
