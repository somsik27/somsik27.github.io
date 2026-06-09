import { Play } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import type { invitation } from '../data/invitation';

type FilmProps = {
  film: typeof invitation.film;
};

function getYoutubeEmbedUrl(videoUrl: string) {
  if (!videoUrl) {
    return null;
  }

  try {
    const url = new URL(videoUrl);
    const host = url.hostname.replace('www.', '');

    if (host === 'youtu.be') {
      return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (url.pathname.startsWith('/embed/')) {
        return videoUrl;
      }

      if (url.pathname.startsWith('/shorts/')) {
        return `https://www.youtube.com/embed/${url.pathname.split('/')[2]}`;
      }

      const videoId = url.searchParams.get('v');

      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

export function Film({ film }: FilmProps) {
  const embedUrl = getYoutubeEmbedUrl(film.videoUrl);

  return (
    <section className="section film">
      <SectionHeader eyebrow="Film" title={film.title} />
      {embedUrl ? (
        <div className="film__frame">
          <iframe
            src={embedUrl}
            title="결혼 영상"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        <a
          className={`film__thumbnail ${film.videoUrl ? '' : 'is-disabled'}`}
          href={film.videoUrl || undefined}
          target={film.videoUrl ? '_blank' : undefined}
          rel={film.videoUrl ? 'noreferrer' : undefined}
          aria-label={film.videoUrl ? '결혼 영상 열기' : '결혼 영상 준비 중'}
        >
          <img
            src={film.thumbnailSrc}
            alt={film.thumbnailAlt}
            loading="lazy"
            decoding="async"
          />
          <span className="film__play" aria-hidden="true">
            <Play size={24} fill="currentColor" />
          </span>
          {!film.videoUrl ? <span className="film__ready">영상 준비 중</span> : null}
        </a>
      )}
    </section>
  );
}
