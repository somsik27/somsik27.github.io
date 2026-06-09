import type { ReactNode } from 'react';
import { Bus, Car, Route } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import type { TransportationItem } from '../data/invitation';

type TransportationProps = {
  transportation: {
    parking: TransportationItem;
    publicTransit: TransportationItem;
    shuttle: TransportationItem | null;
  };
};

function TransportationBlock({
  item,
  icon,
}: {
  item: TransportationItem;
  icon: ReactNode;
}) {
  return (
    <article className="transportation-item">
      <div className="transportation-item__icon">{icon}</div>
      <div>
        <h3>{item.title}</h3>
        {item.lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </article>
  );
}

export function Transportation({ transportation }: TransportationProps) {
  return (
    <section className="section transportation">
      <SectionHeader eyebrow="Transportation" title="교통 안내" />
      <div className="transportation__list">
        <TransportationBlock
          item={transportation.parking}
          icon={<Car size={20} aria-hidden="true" />}
        />
        <TransportationBlock
          item={transportation.publicTransit}
          icon={<Bus size={20} aria-hidden="true" />}
        />
        {transportation.shuttle ? (
          <TransportationBlock
            item={transportation.shuttle}
            icon={<Route size={20} aria-hidden="true" />}
          />
        ) : null}
      </div>
    </section>
  );
}
