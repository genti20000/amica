import React,{useEffect,useState} from 'react';
import {nextDefaultServiceDate,serviceInstant} from '../lib/serviceTime';
import {BookingConfirmation} from '../types';
export function KaraokeRoomCalendar({onSelect}:{onSelect:(b:BookingConfirmation)=>void}){
 const [date,select]=useState(nextDefaultServiceDate),[revision,refresh]=useState(0);
 const [snapshot,set]=useState<{date:string; bookings:BookingConfirmation[];slots:string[]}|null>(null),[error,fail]=useState(false);
 useEffect(()=>{if(!date)return; const controller=new AbortController();let sequence=0;
 async function update(){const seq=++sequence;try{
 const read=async(url:string)=>{const r=await fetch(url,{signal:controller.signal,cache:'no-store'});if(!r.ok)throw Error();return r.json()};
 const [b,a]=await Promise.all([read('/api/bookings?date='+date),read('/api/karaoke/availability?hours=2&date='+date)]);
 if(!b.success||!Array.isArray(b.data)||!Array.isArray(a.slots))throw Error();
 if(!controller.signal.aborted && seq===sequence){set({date,slots:a.slots,bookings:(b.data as BookingConfirmation[]).filter(x=>x.formData.seatingArea==='Karaoke Room').sort((x,y)=>serviceInstant(date,x.formData.timeSlot)-serviceInstant(date,y.formData.timeSlot))});fail(false)}
 }catch{if(!controller.signal.aborted && seq===sequence){set(null);fail(true)}}}
 fail(false);set(null);void update();const timer=setInterval(update,30000);window.addEventListener('focus',update);return()=>{controller.abort();clearInterval(timer);window.removeEventListener('focus',update)};
 },[date,revision]);
 const shown=snapshot?.date===date?snapshot:null;
 return <section className="space-y-4 rounded-xl border p-4"><h2 className="text-xl font-semibold">Private karaoke room</h2>
 <div className="flex flex-wrap items-center gap-3"><label>Service date <input type="date" className="min-h-11 rounded border px-2" value={date} onChange={e=>{if(e.target.value)select(e.target.value)}}/></label><button type="button" onClick={()=>refresh(x=>x+1)} className="min-h-11 underline">Refresh</button></div>
 {error?<p role="alert">Could not load the room calendar. Refresh to retry.</p>:!shown?<p role="status">Loading room calendar…</p>:<>
 <h3 className="font-semibold">Room reservations</h3>{shown.bookings.length===0?<p>No room reservations recorded for this service date.</p>:shown.bookings.map(b=><button key={b.bookingId} type="button" className="block w-full border-b py-3 text-left" onClick={()=>onSelect(b)}>{b.formData.timeSlot} · {b.formData.durationHours??2}h · {b.formData.name} · {b.formData.guests} guests · {b.status}</button>)}
 <h3 className="font-semibold">Available two-hour starts</h3><p>{shown.slots.length?shown.slots.join(' · '):'No bookable two-hour starts on this service date.'}</p></>}</section>;
}