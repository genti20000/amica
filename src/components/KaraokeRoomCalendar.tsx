import React,{useEffect,useState} from 'react';
import {nextDefaultServiceDate,serviceInstant} from '../lib/serviceTime';
import {saveAdminBooking} from '../data/bookingStorage';
import {BookingConfirmation} from '../types';
export function KaraokeRoomCalendar({onSelect,onSaved}:{onSelect:(b:BookingConfirmation)=>void;onSaved:()=>void}){
 const [date,select]=useState(nextDefaultServiceDate),[revision,refresh]=useState(0);
 const [hours,setHours]=useState(2),[start,choose]=useState(''),[busy,saving]=useState(false),[message,say]=useState('');
 const [entry,edit]=useState({name:'',phone:'',email:'',guests:8,dietaryNotes:''});
 const [snapshot,set]=useState<{date:string;hours:number; bookings:BookingConfirmation[];slots:string[]}|null>(null),[error,fail]=useState(false);
 useEffect(()=>{if(!date)return; const controller=new AbortController();let sequence=0;
 async function update(){const seq=++sequence;try{
 const read=async(url:string)=>{const r=await fetch(url,{signal:controller.signal,cache:'no-store'});if(!r.ok)throw Error();return r.json()};
 const [b,a]=await Promise.all([read('/api/bookings?date='+date),read('/api/admin/karaoke/availability?hours='+hours+'&date='+date)]);
 if(!b.success||!Array.isArray(b.data)||!Array.isArray(a.slots))throw Error();
 if(!controller.signal.aborted && seq===sequence){set({date,hours,slots:a.slots,bookings:(b.data as BookingConfirmation[]).filter(x=>x.formData.seatingArea==='Karaoke Room').sort((x,y)=>serviceInstant(date,x.formData.timeSlot)-serviceInstant(date,y.formData.timeSlot))});fail(false)}
 }catch{if(!controller.signal.aborted && seq===sequence){set(null);fail(true)}}}
 fail(false);set(null);void update();const timer=setInterval(update,30000);window.addEventListener('focus',update);return()=>{controller.abort();clearInterval(timer);window.removeEventListener('focus',update)};
 },[date,revision,hours]);
 const shown=snapshot?.date===date && snapshot.hours===hours?snapshot:null;
 async function submit(e:React.FormEvent){e.preventDefault();if(busy||!shown?.slots.includes(start))return;saving(true);say('');
 try{const id='AMICA-'+crypto.randomUUID();const row=await saveAdminBooking({bookingId:id,qrCodeValue:'AMICA-SOHO-'+id,createdAt:new Date().toISOString(),formData:{...entry,date,timeSlot:start,durationHours:hours,seatingArea:'Karaoke Room',specialOccasion:'Private Karaoke Room'}});
 say('Room reserved for '+row.formData.name+' at '+start+'.');choose('');edit({name:'',phone:'',email:'',guests:8,dietaryNotes:''});onSaved();
 }catch(e){say(e instanceof Error?e.message:'Could not save this reservation.');}finally{saving(false);refresh(x=>x+1)}}
 return <section className="space-y-4 rounded-xl border p-4"><h2 className="text-xl font-semibold">Private karaoke room</h2>
 <div className="flex flex-wrap items-center gap-3"><label>Service date <input disabled={busy} type="date" className="min-h-11 rounded border px-2" value={date} onChange={e=>{if(e.target.value){select(e.target.value);choose('');say('')}}}/></label><button type="button" onClick={()=>refresh(x=>x+1)} className="min-h-11 underline">Refresh</button></div>
 <label className="block">Session length <select disabled={busy} className="min-h-11 rounded border px-2" value={hours} onChange={e=>{setHours(Number(e.target.value));choose('');say('')}}>{Array.from({length:9},(_,i)=>i+2).map(h=><option key={h} value={h}>{h} hours</option>)}</select></label>
 {message && <p role="status">{message}</p>}
 {error?<p role="alert">Could not load the room calendar. Refresh to retry.</p>:!shown?<p role="status">Loading room calendar…</p>:<>
 <h3 className="font-semibold">Room reservations</h3>{shown.bookings.length===0?<p>No room reservations recorded for this service date.</p>:shown.bookings.map(b=><button key={b.bookingId} type="button" className="block w-full border-b py-3 text-left" onClick={()=>onSelect(b)}>{b.formData.timeSlot} · {b.formData.durationHours??2}h · {b.formData.name} · {b.formData.guests} guests · {b.status}</button>)}
 <h3 className="font-semibold">Book the private room manually</h3>
 <p>Choose an available start for {hours} hours.</p>
 <div className="flex flex-wrap gap-2">{shown.slots.map(slot=><button key={slot} type="button" disabled={busy} aria-pressed={start===slot} onClick={()=>{choose(slot);say('')}} className={'min-h-11 rounded border px-3 '+(start===slot?'bg-white text-black':'')}>{slot}</button>)}</div>
 {!shown.slots.length && <p>No available starts for this session length.</p>}</>}
 {start && <form className="space-y-3" onSubmit={submit}><h3>Private room · {date} · {start} · {hours}h</h3>
 <fieldset disabled={busy} className="grid gap-3 sm:grid-cols-2">{(['name','phone','email','dietaryNotes'] as const).map((key,i)=><label key={key}>{['Guest name','Phone','Email (optional)','Notes (optional)'][i]}<input className="block min-h-11 w-full rounded border px-2" type={key==='email'?'email':key==='phone'?'tel':'text'} required={i<2} maxLength={[100,30,128,2000][i]} value={entry[key]} onChange={e=>edit({...entry,[key]:e.target.value})}/></label>)}
 <label>Guests<select className="block min-h-11 rounded border px-2" value={entry.guests} onChange={e=>edit({...entry,guests:Number(e.target.value)})}>{Array.from({length:8},(_,i)=>i+8).map(n=><option key={n}>{n}</option>)}</select></label></fieldset>
 <p>Room total £{entry.guests*15+(hours-2)*90}. Saving reserves the room without collecting payment.</p>
 {shown && !shown.slots.includes(start) && <p role="alert">This start is no longer available. Please choose another.</p>}
 <button disabled={busy||!shown?.slots.includes(start)} className="min-h-11 rounded border px-4" type="submit">{busy?'Saving…':'Confirm room reservation'}</button> <button disabled={busy} type="button" onClick={()=>choose('')}>Cancel</button></form>}</section>;
}