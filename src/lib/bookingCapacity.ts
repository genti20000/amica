import { serviceInstant } from './serviceTime.js';

export const BOOKING_POLICY = { guests: 80, tables: 18, minutes: 120, minimumTableSeats: 4 } as const;
export const occupyingStatuses = ['Pending', 'Confirmed', 'Auto-Confirmed', 'Seated'];
type Occupancy = { guests: number; reservation_date: string; time_slot: string };

// Until the 4/6-seat table mix is recorded, reserve enough four-seat tables.
export function fitsBookingCapacity(candidate: Occupancy, existing: Occupancy[]): boolean {
  const start = serviceInstant(candidate.reservation_date, candidate.time_slot);
  const end = start + BOOKING_POLICY.minutes * 60000;
  const events: { time: number; guests: number; tables: number }[] = [];
  for (const row of existing) {
    const rowStart = serviceInstant(row.reservation_date, row.time_slot);
    const rowEnd = rowStart + BOOKING_POLICY.minutes * 60000;
    if (rowStart >= end || rowEnd <= start) continue;
    const tables = Math.ceil(row.guests / BOOKING_POLICY.minimumTableSeats);
    events.push({ time: Math.max(start, rowStart), guests: row.guests, tables });
    events.push({ time: Math.min(end, rowEnd), guests: -row.guests, tables: -tables });
  }
  // Departures release capacity before arrivals at the same instant.
  events.sort((a, b) => a.time - b.time || a.guests - b.guests);
  let guests = candidate.guests;
  let tables = Math.ceil(candidate.guests / BOOKING_POLICY.minimumTableSeats);
  if (guests > BOOKING_POLICY.guests || tables > BOOKING_POLICY.tables) return false;
  for (const event of events) {
    guests += event.guests;
    tables += event.tables;
    if (guests > BOOKING_POLICY.guests || tables > BOOKING_POLICY.tables) return false;
  }
  return true;
}
