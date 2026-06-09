import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import type { GalleryImage } from '../data/invitation';

type GalleryProps = {
  images: GalleryImage[];
};

export function Gallery({ images }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedImage =
    selectedIndex === null ? null : images[selectedIndex] ?? null;

  useEffect(() => {
    if (!selectedImage) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedIndex(null);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('is-modal-open');

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('is-modal-open');
    };
  }, [selectedImage]);

  return (
    <section className="section gallery">
      <SectionHeader eyebrow="Gallery" title="사진" />
      <div className="gallery__grid">
        {images.map((image, index) => (
          <button
            key={image.src}
            className="gallery__thumb"
            type="button"
            onClick={() => setSelectedIndex(index)}
            aria-label={`${image.alt} 크게 보기`}
          >
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              decoding="async"
            />
          </button>
        ))}
      </div>

      {selectedImage ? (
        <div
          className="gallery-modal"
          role="dialog"
          aria-modal="true"
          aria-label="확대된 갤러리 이미지"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedIndex(null);
            }
          }}
        >
          <button
            className="gallery-modal__close"
            type="button"
            onClick={() => setSelectedIndex(null)}
            aria-label="확대 이미지 닫기"
          >
            <X size={22} aria-hidden="true" />
          </button>
          <img
            src={selectedImage.src}
            alt={selectedImage.alt}
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : null}
    </section>
  );
}
