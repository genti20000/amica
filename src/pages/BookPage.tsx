import React, { useState } from 'react';
import { PageId, BookingFormData, BookingConfirmation } from '../types';
import { Calendar as CalendarIcon, Clock, Users, Wine, Sparkles, Check, Info, ShieldCheck } from 'lucide-react';

interface BookPageProps {
  onNavigate: (page: PageId) => void;
  onBookingComplete: (confirmation: BookingConfirmation) => void;
  savedPairingsCount: number;
}

export const BookPage: React.FC<BookPageProps> = ({ onNavigate, onBookingComplete, savedPairingsCount }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<BookingFormData>({
    date: todayStr,
    timeSlot: '17:00 – Golden Hour Aperitivo',
    guests: 2,
    seatingArea: 'Vault Booth',
    name: '',
    email: '',
    phone: '',
    dietaryNotes: '',
    specialOccasion: 'None / Casual Aperitivo'
  });

  const timeSlots = [
    { slot: '16:30 – Soho Golden Hour', status: 'Complimentary Cicchetti' },
    { slot: '17:00 – Golden Hour Aperitivo', status: 'Complimentary Cicchetti' },
    { slot: '18:00 – Prime Evening Session', status: 'High Demand' },
    { slot: '19:00 – Cocktails & Vault Bites', status: 'Limited Vault Booths' },
    { slot: '20:15 – Late Cocktails & Digestivi', status: 'Available' },
    { slot: '21:30 – Late Night Cellar Lounge', status: 'Available' },
  ];

  const seatingAreas = [
    {
      id: 'Vault Booth',
      title: 'Arched Wine Vault Booth',
      desc: 'Atmospheric subterranean brick alcoves for 2-6 guests.'
    },
    {
      id: 'High Bar',
      title: 'Brass Cocktail Counter',
      desc: 'Interactive bar seats facing our mixologists & sommelier.'
    },
    {
      id: 'Lounge Banquette',
      title: 'Plush Leather Lounge',
      desc: 'Comfortable banquettes near the vinyl acoustic setup.'
    },
    {
      id: 'No Preference',
      title: 'First Available Table',
      desc: 'We will seat you in the best available spot on arrival.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) return;

    const bookingId = '23S-' + Math.floor(100000 + Math.random() * 900000);
    const confirmation: BookingConfirmation = {
      bookingId,
      formData,
      createdAt: new Date().toISOString(),
      qrCodeValue: `23SOHO-BOOKING-${bookingId}-${formData.date}`
    };

    onBookingComplete(confirmation);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title Header */}
      <div className="text-center space-y-4">
        <span className="text-[#DFBE7B] text-xs font-display uppercase tracking-widest block">
          ONLINE TABLE RESERVATION · 23 FRITH STREET SOHO
        </span>
        <h1 className="font-display text-4xl sm:text-6xl font-bold text-[#FDFBF7] tracking-wide">
          Reserve Your Table at AMICA SOHO
        </h1>
        <p className="text-xs sm:text-sm text-[#DFBE7B]/80 max-w-xl mx-auto leading-relaxed font-sans">
          Bookings available for 1 to 8 guests. Instant digital reservation confirmation pass generated upon completion.
        </p>

        {savedPairingsCount > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A22] border border-[#C5A059] text-[#DFBE7B] text-xs rounded-full">
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
            <span>You have {savedPairingsCount} saved menu pairing{savedPairingsCount > 1 ? 's' : ''} attached to your session!</span>
          </div>
        )}
      </div>

      {/* Main Reservation Form Card */}
      <form onSubmit={handleSubmit} className="bg-[#121215] border border-[#C5A059]/40 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8">
        
        {/* Step 1: Party & Date */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#C5A059]/20 pb-2">
            <span className="w-6 h-6 rounded-full bg-[#C5A059] text-[#0B0B0C] text-xs font-bold font-display flex items-center justify-center">1</span>
            <h3 className="font-display text-xl font-bold text-[#FDFBF7]">Party Size & Date</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-display text-[#DFBE7B] uppercase tracking-wider mb-2">Number of Guests</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5, 6, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData({ ...formData, guests: num })}
                    className={`flex-1 py-2.5 rounded font-display text-sm font-bold border transition-all cursor-pointer ${
                      formData.guests === num
                        ? 'bg-[#C5A059] text-[#0B0B0C] border-[#C5A059]'
                        : 'bg-[#181820] text-[#FDFBF7] border-[#C5A059]/30 hover:border-[#C5A059]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-display text-[#DFBE7B] uppercase tracking-wider mb-2">Reservation Date</label>
              <input
                type="date"
                min={todayStr}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#181820] border border-[#C5A059]/40 rounded text-xs text-[#FDFBF7] focus:outline-none focus:border-[#C5A059] font-sans"
                required
              />
            </div>
          </div>
        </div>

        {/* Step 2: Time Slot Selector */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#C5A059]/20 pb-2">
            <span className="w-6 h-6 rounded-full bg-[#C5A059] text-[#0B0B0C] text-xs font-bold font-display flex items-center justify-center">2</span>
            <h3 className="font-display text-xl font-bold text-[#FDFBF7]">Select Time Slot</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {timeSlots.map((ts) => {
              const isSelected = formData.timeSlot === ts.slot;
              return (
                <button
                  key={ts.slot}
                  type="button"
                  onClick={() => setFormData({ ...formData, timeSlot: ts.slot })}
                  className={`p-3.5 rounded border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1C1C26] border-[#C5A059] shadow-lg ring-1 ring-[#C5A059]'
                      : 'bg-[#181820] border-[#C5A059]/20 hover:border-[#C5A059]/50'
                  }`}
                >
                  <span className="block font-display text-sm font-bold text-[#FDFBF7]">{ts.slot}</span>
                  <span className="block text-[10px] font-display text-[#DFBE7B] mt-1 tracking-wider">{ts.status}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Seating Preference */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#C5A059]/20 pb-2">
            <span className="w-6 h-6 rounded-full bg-[#C5A059] text-[#0B0B0C] text-xs font-bold font-display flex items-center justify-center">3</span>
            <h3 className="font-display text-xl font-bold text-[#FDFBF7]">Seating Area Preference</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {seatingAreas.map((area) => {
              const isSelected = formData.seatingArea === area.id;
              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, seatingArea: area.id as any })}
                  className={`p-4 rounded border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1C1C26] border-[#C5A059] shadow-lg ring-1 ring-[#C5A059]'
                      : 'bg-[#181820] border-[#C5A059]/20 hover:border-[#C5A059]/50'
                  }`}
                >
                  <span className="block font-display text-base font-bold text-[#DFBE7B]">{area.title}</span>
                  <span className="block text-xs text-[#FDFBF7]/70 mt-1 font-sans">{area.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Contact Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#C5A059]/20 pb-2">
            <span className="w-6 h-6 rounded-full bg-[#C5A059] text-[#0B0B0C] text-xs font-bold font-display flex items-center justify-center">4</span>
            <h3 className="font-display text-xl font-bold text-[#FDFBF7]">Guest Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-display text-[#DFBE7B] uppercase tracking-wider mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sofia Loren"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#181820] border border-[#C5A059]/30 rounded text-xs text-[#FDFBF7] focus:outline-none focus:border-[#C5A059] font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-display text-[#DFBE7B] uppercase tracking-wider mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="sofia@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#181820] border border-[#C5A059]/30 rounded text-xs text-[#FDFBF7] focus:outline-none focus:border-[#C5A059] font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-display text-[#DFBE7B] uppercase tracking-wider mb-1">Mobile Phone *</label>
              <input
                type="tel"
                required
                placeholder="+44 7987 654321"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#181820] border border-[#C5A059]/30 rounded text-xs text-[#FDFBF7] focus:outline-none focus:border-[#C5A059] font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-display text-[#DFBE7B] uppercase tracking-wider mb-1">Special Occasion</label>
              <select
                value={formData.specialOccasion}
                onChange={(e) => setFormData({ ...formData, specialOccasion: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#181820] border border-[#C5A059]/30 rounded text-xs text-[#FDFBF7] focus:outline-none focus:border-[#C5A059] font-sans"
              >
                <option value="None / Casual Aperitivo">None / Casual Drinks</option>
                <option value="Birthday">Birthday Celebration</option>
                <option value="Anniversary">Anniversary / Date Night</option>
                <option value="Business Drinks">Business Drinks</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-display text-[#DFBE7B] uppercase tracking-wider mb-1">Dietary Requirements / Allergies</label>
            <input
              type="text"
              placeholder="e.g. 1 Vegan, 1 Gluten-Free, Nut Allergy..."
              value={formData.dietaryNotes}
              onChange={(e) => setFormData({ ...formData, dietaryNotes: e.target.value })}
              className="w-full px-3 py-2.5 bg-[#181820] border border-[#C5A059]/30 rounded text-xs text-[#FDFBF7] focus:outline-none focus:border-[#C5A059] font-sans"
            />
          </div>
        </div>

        {/* Submit CTA */}
        <div className="pt-4 border-t border-[#C5A059]/20 space-y-3">
          <button
            type="submit"
            className="w-full py-4 btn-brass text-xs tracking-widest uppercase rounded flex items-center justify-center gap-2 cursor-pointer"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Confirm Reservation & Generate Digital Pass</span>
          </button>

          <p className="text-[10px] text-center text-[#DFBE7B]/60 flex items-center justify-center gap-1 font-sans">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>No booking fee or deposit required. Free instant cancellation up to 2 hours prior.</span>
          </p>
        </div>

      </form>
    </div>
  );
};
