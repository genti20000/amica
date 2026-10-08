import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitsBookingCapacity } from './bookingCapacity.js';

const row = (guests: number, time_slot = '19:00', reservation_date = '2099-10-08') => ({ guests, time_slot, reservation_date });
test('eighteenth table fits but nineteenth does not', () => {
  assert.equal(fitsBookingCapacity(row(1), Array.from({ length: 17 }, () => row(1))), true);
  assert.equal(fitsBookingCapacity(row(1), Array.from({ length: 18 }, () => row(1))), false);
});
test('larger groups conservatively reserve multiple tables', () => {
  assert.equal(fitsBookingCapacity(row(5), Array.from({ length: 16 }, () => row(1))), true);
  assert.equal(fitsBookingCapacity(row(5), Array.from({ length: 17 }, () => row(1))), false);
});
test('departure frees capacity exactly two hours later', () => {
  assert.equal(fitsBookingCapacity(row(1, '21:00'), Array.from({ length: 18 }, () => row(4))), true);
  assert.equal(fitsBookingCapacity(row(1, '20:30'), Array.from({ length: 18 }, () => row(4))), false);
});
test('checks peak occupancy rather than sum of all overlapping bookings', () => {
  const existing = [...Array.from({ length: 17 }, () => row(1, '17:30')), ...Array.from({ length: 17 }, () => row(1, '19:30'))];
  assert.equal(fitsBookingCapacity(row(1), existing), true);
});
test('midnight slots belong to the evening service and still overlap', () => {
  assert.equal(fitsBookingCapacity(row(1, '00:30'), Array.from({ length: 18 }, () => row(1, '23:30'))), false);
  assert.equal(fitsBookingCapacity(row(1, '01:30'), Array.from({ length: 18 }, () => row(1, '23:30'))), true);
});
test('other service dates do not consume capacity', () => {
  assert.equal(fitsBookingCapacity(row(1), Array.from({ length: 18 }, () => row(4, '19:00', '2099-10-09'))), true);
});
test('overall guest ceiling is enforced', () => {
  assert.equal(fitsBookingCapacity(row(81), []), false);
});
