import { CalendarDays } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import type { invitation } from '../data/invitation';

type WhenProps = {
  event: typeof invitation.event;
};

const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

function parseKoreanDate(isoDateTime: string) {
  const [datePart] = isoDateTime.split('T');
  const [year, month, day] = datePart.split('-').map(Number);

  return { year, month, day };
}

function getCalendarCells(isoDateTime: string) {
  const { year, month, day } = parseKoreanDate(isoDateTime);
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const blanks = Array.from({ length: firstWeekday }, () => null);
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  return {
    monthLabel: `${year}.${String(month).padStart(2, '0')}`,
    selectedDay: day,
    cells: [...blanks, ...days],
  };
}

export function When({ event }: WhenProps) {
  const calendar = getCalendarCells(event.isoDateTime);

  return (
    <section className="section when">
      <SectionHeader eyebrow="When" title="날짜와 시간" />
      <div className="when__summary">
        <CalendarDays size={22} aria-hidden="true" />
        <div>
          <time dateTime={event.isoDateTime}>{event.displayDate}</time>
          <p>{event.displayTime}</p>
        </div>
      </div>
      <div className="calendar-card" aria-label={`${calendar.monthLabel} 달력`}>
        <div className="calendar-card__month">{calendar.monthLabel}</div>
        <div className="calendar-card__weekdays" aria-hidden="true">
          {weekdays.map((weekday) => (
            <span key={weekday}>{weekday}</span>
          ))}
        </div>
        <div className="calendar-card__grid">
          {calendar.cells.map((cell, index) =>
            cell ? (
              <span
                key={`${cell}-${index}`}
                className={cell === calendar.selectedDay ? 'is-selected' : ''}
                aria-current={cell === calendar.selectedDay ? 'date' : undefined}
              >
                {cell}
              </span>
            ) : (
              <span key={`blank-${index}`} aria-hidden="true" />
            ),
          )}
        </div>
      </div>
    </section>
  );
}
