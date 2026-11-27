// Service date is the evening date; midnight belongs to the following morning.
export const isFullDay = (block) => Number(block.is_full_day) === 1;
export const appliesToKaraoke = (block) => block.scope !== 'main';
export const serviceMinutes = (value) => {
  if (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value)) return NaN;
  const [h,m] = value.split(':').map(Number);
  return (h < 5 ? h + 24 : h) * 60 + m;
};
export const validWindow = (start,end) => {
  const a=serviceMinutes(start), b=serviceMinutes(end);
  return Number.isFinite(a) && Number.isFinite(b) && a >= 17*60 && b <= 27*60 && a < b;
};
// Half-open intervals: a booking can end at the start of a closure or start at its end.
export const tableBlockClashes = (block,slot,durationMinutes=120) => {
  if (isFullDay(block)) return true;
  if (!validWindow(block.start_time,block.end_time)) return false;
  const start=serviceMinutes(slot);
  return start < serviceMinutes(block.end_time) && start+durationMinutes > serviceMinutes(block.start_time);
};
export const findTableBlock = (blocks,date,slot,durationMinutes=120) =>
  blocks.find(b => b.blocked_date===date && tableBlockClashes(b,slot,durationMinutes));
