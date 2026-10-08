// Reservation dates identify the evening service; 00:00–04:59 is the following morning.
export function serviceInstant(date: string, slot: string): number {
  const [hour,minute]=slot.split(':').map(Number);
  const wall = Date.parse(date+'T00:00:00Z') + ((hour<5?hour+24:hour)*60+minute)*60000;
  let instant=wall;
  const formatter=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  for(let i=0;i<2;i++) {
    const values=Object.fromEntries(formatter.formatToParts(new Date(instant)).map(p=>[p.type,p.value]));
    const asUtc=Date.UTC(+values.year,+values.month-1,+values.day,+values.hour,+values.minute,+values.second);
    instant=wall-(asUtc-instant);
  }
  return instant;
}
export function londonDate(): string { return new Date().toLocaleDateString('en-CA',{timeZone:'Europe/London'}); }
export function nextDefaultServiceDate(): string {
  const day=new Date(londonDate()+'T12:00:00Z');
  while(![3,4,5,6].includes(day.getUTCDay()) || serviceInstant(day.toISOString().slice(0,10),'19:00') < Date.now()+3600000) day.setUTCDate(day.getUTCDate()+1);
  return day.toISOString().slice(0,10);
}
