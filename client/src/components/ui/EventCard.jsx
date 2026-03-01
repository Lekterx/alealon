import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import Badge from './Badge';

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function EventCard({ event }) {
  const mainCategory = event.categories?.[0] && event.categories[0].id ? event.categories[0] : null;

  return (
    <Link to={`/evenement/${event.slug}`} className="block">
      <div className="bg-white rounded-card border border-line shadow-sm hover:shadow-md transition-all overflow-hidden">
        {mainCategory && (
          <div className="h-1" style={{ backgroundColor: mainCategory.color }} />
        )}
        {event.image_url && (
          <div className="h-40 overflow-hidden">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {mainCategory && (
              <Badge color={mainCategory.color}>
                {mainCategory.icon} {mainCategory.name}
              </Badge>
            )}
            {event.featured && (
              <Badge color="#E67E22">
                ⭐ À la une
              </Badge>
            )}
          </div>
          <h3 className="font-bold text-base text-ink-primary mb-1 line-clamp-2">
            {event.title}
          </h3>
          <div className="flex items-center gap-1 text-sm text-ink-secondary mb-1">
            <Calendar size={14} />
            <span>{formatDate(event.date_start)}</span>
          </div>
          {(event.commune_name || event.address) && (
            <div className="flex items-center gap-1 text-sm text-ink-secondary">
              <MapPin size={14} />
              <span className="truncate">{event.commune_name || event.address}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
