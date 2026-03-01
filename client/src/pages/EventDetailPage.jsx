import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, User, Mail, Phone, ExternalLink, Share2, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import Badge from '../components/ui/Badge';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function EventDetailPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/events/slug/${slug}`)
      .then(res => setEvent(res.data))
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: event.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-ink-secondary">Chargement...</div>;
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-lg text-ink-secondary mb-4">Événement introuvable</p>
        <Link to="/" className="text-primary-light hover:underline">Retour à l'accueil</Link>
      </div>
    );
  }

  const mainCategory = event.categories?.[0]?.id ? event.categories[0] : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Back link */}
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-ink-secondary hover:text-primary-light mb-4">
        <ArrowLeft size={16} />
        Retour
      </Link>

      {/* Image */}
      {event.image_url && (
        <div className="rounded-card overflow-hidden mb-6">
          <img src={event.image_url} alt={event.title} className="w-full h-64 md:h-80 object-cover" />
        </div>
      )}

      {/* Categories */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {event.categories?.filter(c => c.id).map(cat => (
          <Badge key={cat.id} color={cat.color}>
            {cat.icon} {cat.name}
          </Badge>
        ))}
        {event.featured && <Badge color="#E67E22">⭐ À la une</Badge>}
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-ink-primary mb-4">{event.title}</h1>

      {/* Meta info */}
      <div className="bg-surface-alt rounded-card p-4 mb-6 space-y-2">
        <div className="flex items-center gap-2 text-sm text-ink-secondary">
          <Calendar size={16} className="text-primary-light flex-shrink-0" />
          <span>{formatDate(event.date_start)}</span>
          {event.date_end && <span>— {formatDate(event.date_end)}</span>}
        </div>
        <div className="flex items-center gap-2 text-sm text-ink-secondary">
          <MapPin size={16} className="text-primary-light flex-shrink-0" />
          <span>{event.address}{event.commune_name ? `, ${event.commune_name}` : ''}</span>
        </div>
        {event.price && (
          <div className="text-sm text-ink-secondary">
            <span className="font-medium">Tarif :</span> {event.price}
          </div>
        )}
        {event.organizer && (
          <div className="flex items-center gap-2 text-sm text-ink-secondary">
            <User size={16} className="text-primary-light flex-shrink-0" />
            <span>{event.organizer}</span>
          </div>
        )}
        {event.contact_email && (
          <div className="flex items-center gap-2 text-sm text-ink-secondary">
            <Mail size={16} className="text-primary-light flex-shrink-0" />
            <a href={`mailto:${event.contact_email}`} className="text-primary-light hover:underline">{event.contact_email}</a>
          </div>
        )}
        {event.contact_phone && (
          <div className="flex items-center gap-2 text-sm text-ink-secondary">
            <Phone size={16} className="text-primary-light flex-shrink-0" />
            <a href={`tel:${event.contact_phone}`} className="text-primary-light hover:underline">{event.contact_phone}</a>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="prose prose-sm max-w-none mb-6 text-ink-primary leading-relaxed whitespace-pre-wrap">
        {event.description}
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        {event.external_link && (
          <a
            href={event.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent text-white font-semibold text-sm px-5 py-3 rounded-xl hover:bg-accent-900 transition-colors"
          >
            <ExternalLink size={16} />
            Plus d'infos
          </a>
        )}
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 bg-white border-2 border-primary text-primary font-semibold text-sm px-5 py-3 rounded-xl hover:bg-primary hover:text-white transition-colors"
        >
          <Share2 size={16} />
          Partager
        </button>
      </div>
    </div>
  );
}
