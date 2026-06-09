import { MapPin, Navigation } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import type { invitation } from '../data/invitation';

type WhereProps = {
  venue: typeof invitation.venue;
};

export function Where({ venue }: WhereProps) {
  return (
    <section className="section where">
      <SectionHeader eyebrow="Where" title="오시는 길" />
      <div className="where__place">
        <MapPin size={24} aria-hidden="true" />
        <div>
          <h3>{venue.name}</h3>
          <p>{venue.hall}</p>
          <address>{venue.address}</address>
        </div>
      </div>
      <div className="map-links" aria-label="지도 앱 링크">
        {venue.mapLinks.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            aria-label={link.ariaLabel}
          >
            <Navigation size={16} aria-hidden="true" />
            <span>{link.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
