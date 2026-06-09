import type { invitation } from '../data/invitation';

type HeroProps = {
  couple: typeof invitation.couple;
  event: typeof invitation.event;
  hero: typeof invitation.hero;
};

export function Hero({ couple, event, hero }: HeroProps) {
  return (
    <section className="hero" aria-label="청첩장 대표 정보">
      <img
        className="hero__image"
        src={hero.imageSrc}
        alt={hero.imageAlt}
        loading="lazy"
        decoding="async"
      />
      <div className="hero__shade" aria-hidden="true" />
      <div className="hero__content">
        <p className="hero__eyebrow">Wedding Invitation</p>
        <h1>
          {couple.groom}
          <span aria-hidden="true"> · </span>
          {couple.bride}
        </h1>
        <time dateTime={event.isoDateTime}>{event.shortDate}</time>
      </div>
    </section>
  );
}
