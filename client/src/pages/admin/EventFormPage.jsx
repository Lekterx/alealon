import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/ui/Button';

export default function EventFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [image, setImage] = useState(null);

  const [form, setForm] = useState({
    title: '', description: '', category_ids: [], date_start: '', date_end: '',
    recurrence: 'unique', address: '', commune_id: '', external_link: '',
    price: '', organizer: '', contact_email: '', contact_phone: '',
    status: 'published', featured: false,
  });

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/communes'),
    ]).then(([catRes, comRes]) => {
      setCategories(catRes.data);
      setCommunes(comRes.data);
    }).catch(() => {});

    if (isEdit) {
      api.get(`/events/${id}`).then(res => {
        const e = res.data;
        setForm({
          title: e.title || '', description: e.description || '',
          category_ids: e.categories?.filter(c => c.id).map(c => c.id) || [],
          date_start: e.date_start ? new Date(e.date_start).toISOString().slice(0, 16) : '',
          date_end: e.date_end ? new Date(e.date_end).toISOString().slice(0, 16) : '',
          recurrence: e.recurrence || 'unique', address: e.address || '',
          commune_id: e.commune_id || '', external_link: e.external_link || '',
          price: e.price || '', organizer: e.organizer || '',
          contact_email: e.contact_email || '', contact_phone: e.contact_phone || '',
          status: e.status || 'published', featured: e.featured || false,
        });
      }).catch(() => {});
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCategoryToggle = (catId) => {
    setForm(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(catId)
        ? prev.category_ids.filter(c => c !== catId)
        : [...prev.category_ids, catId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'category_ids') {
          formData.append(key, JSON.stringify(value));
        } else if (value !== '' && value !== null) {
          formData.append(key, value);
        }
      });
      if (image) formData.append('image', image);

      if (isEdit) {
        await api.put(`/events/${id}`, formData);
      } else {
        await api.post('/events', formData);
      }
      navigate('/admin/events');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const communesByRegion = communes.reduce((acc, c) => {
    if (!acc[c.micro_region]) acc[c.micro_region] = [];
    acc[c.micro_region].push(c);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <button onClick={() => navigate('/admin/events')} className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary-light mb-4">
        <ArrowLeft size={16} /> Retour
      </button>

      <h1 className="text-2xl font-bold text-text-primary mb-6">
        {isEdit ? 'Modifier l\'événement' : 'Créer un événement'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Titre *</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} required className="w-full border border-border rounded-lg px-3 py-2.5 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Description *</label>
          <textarea name="description" value={form.description} onChange={handleChange} required rows={5} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm resize-y" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Catégories</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button type="button" key={cat.id} onClick={() => handleCategoryToggle(cat.id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  backgroundColor: form.category_ids.includes(cat.id) ? cat.color : '#FFF',
                  color: form.category_ids.includes(cat.id) ? '#FFF' : '#1C2833',
                  border: `2px solid ${form.category_ids.includes(cat.id) ? cat.color : '#E5E8EB'}`,
                }}>
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Date de début *</label>
            <input type="datetime-local" name="date_start" value={form.date_start} onChange={handleChange} required className="w-full border border-border rounded-lg px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Date de fin</label>
            <input type="datetime-local" name="date_end" value={form.date_end} onChange={handleChange} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Récurrence</label>
          <select name="recurrence" value={form.recurrence} onChange={handleChange} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm">
            <option value="unique">Unique</option>
            <option value="daily">Quotidien</option>
            <option value="weekly">Hebdomadaire</option>
            <option value="monthly">Mensuel</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Adresse *</label>
          <input type="text" name="address" value={form.address} onChange={handleChange} required className="w-full border border-border rounded-lg px-3 py-2.5 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Commune</label>
          <select name="commune_id" value={form.commune_id} onChange={handleChange} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm">
            <option value="">Sélectionner</option>
            {Object.entries(communesByRegion).map(([region, coms]) => (
              <optgroup key={region} label={region}>
                {coms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Image</label>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="w-full text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Tarif</label>
            <input type="text" name="price" value={form.price} onChange={handleChange} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Organisateur</label>
            <input type="text" name="organizer" value={form.organizer} onChange={handleChange} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Lien externe</label>
          <input type="url" name="external_link" value={form.external_link} onChange={handleChange} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Email contact</label>
            <input type="email" name="contact_email" value={form.contact_email} onChange={handleChange} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Téléphone</label>
            <input type="tel" name="contact_phone" value={form.contact_phone} onChange={handleChange} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Statut</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm">
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="pending">En attente</option>
              <option value="archived">Archivé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
              <span className="font-medium text-text-primary">À la une</span>
            </label>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2">
          <Save size={16} />
          {loading ? 'Sauvegarde...' : (isEdit ? 'Mettre à jour' : 'Créer l\'événement')}
        </Button>
      </form>
    </div>
  );
}
