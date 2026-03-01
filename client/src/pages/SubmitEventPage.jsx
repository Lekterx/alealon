import { useState, useEffect } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import api from '../services/api';
import Button from '../components/ui/Button';

export default function SubmitEventPage() {
  const [categories, setCategories] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    category_ids: [],
    date_start: '',
    date_end: '',
    address: '',
    commune_id: '',
    external_link: '',
    price: '',
    organizer: '',
    contact_email: '',
    submitter_email: '',
  });
  const [image, setImage] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/communes'),
    ]).then(([catRes, comRes]) => {
      setCategories(catRes.data);
      setCommunes(comRes.data);
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (id) => {
    setForm(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(id)
        ? prev.category_ids.filter(c => c !== id)
        : [...prev.category_ids, id],
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
        } else if (value) {
          formData.append(key, value);
        }
      });
      if (image) formData.append('image', image);

      await api.post('/submissions', formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const communesByRegion = communes.reduce((acc, c) => {
    if (!acc[c.micro_region]) acc[c.micro_region] = [];
    acc[c.micro_region].push(c);
    return acc;
  }, {});

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <CheckCircle size={56} className="text-secondary mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text-primary mb-2">Merci pour votre proposition !</h1>
        <p className="text-text-secondary">Votre événement sera examiné avant publication. Vous recevrez un email pour vous informer du résultat.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Proposer un événement</h1>
      <p className="text-text-secondary mb-6 text-sm">Remplissez le formulaire ci-dessous. Votre événement sera vérifié avant publication.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Titre de l'événement *</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} required className="w-full border border-border rounded-lg px-3 py-2.5 text-sm" placeholder="Ex: Sakifo Musik Festival 2026" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Description *</label>
          <textarea name="description" value={form.description} onChange={handleChange} required rows={4} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm resize-y" placeholder="Décrivez l'événement..." />
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Catégorie(s) *</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                type="button"
                key={cat.id}
                onClick={() => handleCategoryToggle(cat.id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  backgroundColor: form.category_ids.includes(cat.id) ? cat.color : '#FFFFFF',
                  color: form.category_ids.includes(cat.id) ? '#FFF' : '#1C2833',
                  border: `2px solid ${form.category_ids.includes(cat.id) ? cat.color : '#E5E8EB'}`,
                }}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
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

        {/* Address & Commune */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Adresse *</label>
          <input type="text" name="address" value={form.address} onChange={handleChange} required className="w-full border border-border rounded-lg px-3 py-2.5 text-sm" placeholder="Adresse du lieu" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Commune *</label>
          <select name="commune_id" value={form.commune_id} onChange={handleChange} required className="w-full border border-border rounded-lg px-3 py-2.5 text-sm">
            <option value="">Sélectionner une commune</option>
            {Object.entries(communesByRegion).map(([region, coms]) => (
              <optgroup key={region} label={region}>
                {coms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Image / Affiche</label>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="w-full text-sm" />
        </div>

        {/* Optional fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Tarif</label>
            <input type="text" name="price" value={form.price} onChange={handleChange} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm" placeholder="Gratuit / 15€..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Organisateur</label>
            <input type="text" name="organizer" value={form.organizer} onChange={handleChange} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Lien externe</label>
          <input type="url" name="external_link" value={form.external_link} onChange={handleChange} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm" placeholder="https://..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Email de contact</label>
            <input type="email" name="contact_email" value={form.contact_email} onChange={handleChange} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Votre email</label>
            <input type="email" name="submitter_email" value={form.submitter_email} onChange={handleChange} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm" placeholder="Pour être notifié" />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2">
          <Send size={16} />
          {loading ? 'Envoi...' : 'Soumettre l\'événement'}
        </Button>
      </form>
    </div>
  );
}
