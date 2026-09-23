import React, { useState } from 'react';
import { PageId } from '../types';
import { PRIVATE_HIRE_PACKAGES } from '../data/venueData';
import { Users, Calendar, DollarSign, CheckCircle2, Sparkles, Send, Clock, Wine, Mail, Phone, Info } from 'lucide-react';
import { amicaOxbloodLounge, amicaArchBooth, amicaVaultBooth } from '../assets/images/photos';

interface PrivateHirePageProps {
  onNavigate: (page: PageId) => void;
}

export const PrivateHirePage: React.FC<PrivateHirePageProps> = ({ onNavigate }) => {
  const [selectedPackage, setSelectedPackage] = useState<string>('vault-alcove');
  const [guestsCount, setGuestsCount] = useState<number>(12);
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['spritz-welcome']);
  
  // Enquiry form state
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    eventType: 'Birthday / Celebration',
    specialRequests: ''
  });

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Estimator logic
  const calculateEstimate = () => {
    let baseMinSpend = 500;
    if (selectedPackage === 'full-basement-buyout') baseMinSpend = 2200;
    if (selectedPackage === 'masterclass-package') baseMinSpend = guestsCount * 55;

    let addonTotal = 0;
    if (selectedAddons.includes('spritz-welcome')) addonTotal += guestsCount * 12;
    if (selectedAddons.includes('charcuterie-board')) addonTotal += Math.ceil(guestsCount / 4) * 26;
    if (selectedAddons.includes('vermouth-tasting')) addonTotal += guestsCount * 18;

    return Math.max(baseMinSpend, addonTotal + baseMinSpend);
  };

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Title Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-[#9D7E54] text-xs font-display uppercase tracking-[0.25em] block">
          EXCLUSIVE EVENTS · 23 FRITH STREET SOHO
        </span>
        <h1 className="font-display text-4xl sm:text-6xl font-bold text-[#FDFBF7] tracking-wide">
          Private Hire & Subterranean Buyouts
        </h1>
        <p className="text-xs sm:text-sm text-[#DFBE7B]/80 leading-relaxed font-sans">
          From candlelit wine vault alcoves for 14 guests to full basement buyouts for up to 60, host your private celebration or corporate evening at AMICA SOHO in Frith Street's iconic subterranean cellar.
        </p>
      </div>

      {/* Hero Image Showcase */}
      <div className="relative rounded-2xl overflow-hidden border border-[#9D7E54]/40 shadow-2xl aspect-[21/9]">
        <img
          src={amicaOxbloodLounge}
          alt="Private hire lounge setup at AMICA SOHO Frith Street"
          className="w-full h-full object-cover filter brightness-[0.7]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080A] via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-6 left-6 right-6 p-4 sm:p-6 bg-[#121215]/90 border border-[#9D7E54]/40 backdrop-blur-md rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-display text-[#DFBE7B] uppercase tracking-wider block">AMICA SOHO Subterranean Buyout</span>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#FDFBF7]">
              Bespoke Cocktail Bars, Sommelier Tastings & Vinyl Acoustics
            </h3>
          </div>
          <span className="text-xs font-display text-[#DFBE7B] bg-[#181820] px-3 py-1.5 rounded border border-[#9D7E54]/40">
            Capacity: Up to 60 Guests
          </span>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[#9D7E54] text-xs font-display uppercase tracking-widest">Tailored Spaces</span>
          <h2 className="font-display text-3xl font-bold text-[#FDFBF7]">Hire Options & Spaces</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRIVATE_HIRE_PACKAGES.map((pkg) => {
            const isSelected = selectedPackage === pkg.id;
            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className={`cursor-pointer rounded-xl p-6 transition-all duration-300 flex flex-col justify-between border ${
                  isSelected
                    ? 'bg-[#181820] border-[#DFBE7B] shadow-2xl ring-1 ring-[#DFBE7B]'
                    : 'bg-[#121215] border-[#9D7E54]/30 hover:border-[#9D7E54]/60'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-display tracking-wider text-[#DFBE7B] uppercase">{pkg.capacity}</span>
                    {isSelected && (
                      <span className="px-2 py-0.5 text-[10px] bg-[#DFBE7B] text-[#08080A] font-bold rounded font-display tracking-wider">
                        SELECTED
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-xl font-bold text-[#FDFBF7]">{pkg.title}</h3>

                  <div className="p-2.5 bg-[#181820] rounded border border-[#9D7E54]/20 text-xs text-[#FFEAA7] font-display font-semibold">
                    {pkg.minimumSpend}
                  </div>

                  <p className="text-xs text-[#FDFBF7]/80 leading-relaxed font-sans">{pkg.description}</p>

                  <div className="space-y-2 pt-2 border-t border-[#9D7E54]/20">
                    <span className="text-[10px] font-display text-[#DFBE7B] uppercase tracking-wider block">Package Inclusions:</span>
                    <ul className="space-y-1.5 text-xs text-[#FDFBF7]/75 font-sans">
                      {pkg.includes.map((inc, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#9D7E54] shrink-0 mt-0.5" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-[#9D7E54]/20 text-center">
                  <span className="text-xs text-[#DFBE7B] font-display tracking-wider uppercase underline">
                    {isSelected ? 'Currently Selected' : 'Select This Space'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Estimator & Enquiry Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-[#121215] border border-[#9D7E54]/40 rounded-2xl p-6 sm:p-10 shadow-2xl">
        
        {/* Left Column: Interactive Estimator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-1 border-b border-[#9D7E54]/20 pb-3">
            <span className="text-[#DFBE7B] text-xs font-display uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#9D7E54]" />
              <span>Instant Event Estimator</span>
            </span>
            <h3 className="font-display text-2xl font-bold text-[#FDFBF7]">Customise Your Package</h3>
          </div>

          <div className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-[#DFBE7B] font-display uppercase tracking-wider mb-1">Expected Guests ({guestsCount})</label>
              <input
                type="range"
                min="6"
                max="60"
                value={guestsCount}
                onChange={(e) => setGuestsCount(parseInt(e.target.value))}
                className="w-full accent-[#DFBE7B] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#DFBE7B]/60 font-display mt-1">
                <span>6 Guests</span>
                <span>30 Guests</span>
                <span>60 Guests</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="block text-[#DFBE7B] font-display uppercase tracking-wider">Optional Hospitality Add-ons:</span>
              
              {[
                { id: 'spritz-welcome', name: 'Welcome Amica Soho Cocktail Round (£12 / guest)' },
                { id: 'charcuterie-board', name: 'Artisanal Cicchetti & Charcuterie Boards (£26 / board for 4 guests)' },
                { id: 'vermouth-tasting', name: 'Guided Sommelier Spirit & Vermouth Tasting (£18 / guest)' },
              ].map((addon) => (
                <label
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${
                    selectedAddons.includes(addon.id)
                      ? 'bg-[#1C1C26] border-[#DFBE7B] text-[#DFBE7B]'
                      : 'bg-[#181820] border-[#9D7E54]/20 text-[#FDFBF7]/70'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedAddons.includes(addon.id)}
                    onChange={() => {}}
                    className="accent-[#DFBE7B]"
                  />
                  <span>{addon.name}</span>
                </label>
              ))}
            </div>

            {/* Total Estimate Calculation Display */}
            <div className="p-5 bg-[#181820] border border-[#9D7E54] rounded-lg space-y-2">
              <span className="text-[10px] font-display text-[#DFBE7B] uppercase tracking-wider block">Estimated Event Spend</span>
              <div className="font-display text-3xl font-bold text-[#FFEAA7]">
                £{calculateEstimate().toLocaleString()}
              </div>
              <p className="text-[11px] text-[#FDFBF7]/60">
                Includes space hire, dedicated sommelier host, and selected F&B packages. Subject to VAT and discretionary service.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Enquiry Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-1 border-b border-[#9D7E54]/20 pb-3">
            <span className="text-[#DFBE7B] text-xs font-display uppercase tracking-widest block">Direct Inquiry</span>
            <h3 className="font-display text-2xl font-bold text-[#FDFBF7]">Submit Private Hire Request</h3>
          </div>

          {formSubmitted ? (
            <div className="p-8 bg-[#181820] border border-[#9D7E54] rounded-xl text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#DFBE7B] mx-auto" />
              <h4 className="font-display text-2xl font-bold text-[#FDFBF7]">Grazie! Request Received</h4>
              <p className="text-xs text-[#FDFBF7]/80 max-w-md mx-auto leading-relaxed font-sans">
                Our AMICA SOHO Events Director will review your date ({formData.eventDate || 'Requested Date'}) and respond within 24 hours with space confirmation and bespoke menus.
              </p>
              <button
                onClick={() => setFormSubmitted(false)}
                className="px-6 py-2.5 rounded bg-gradient-to-r from-[#DFBE7B] via-[#C5A059] to-[#9D7E54] text-[#08080A] font-display font-bold text-xs tracking-wider uppercase cursor-pointer"
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleEnquirySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-display text-[#DFBE7B] uppercase tracking-wider mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Matteo Rossi"
                    className="w-full px-3 py-2.5 bg-[#181820] border border-[#9D7E54]/30 rounded text-xs text-[#FDFBF7] focus:outline-none focus:border-[#DFBE7B] font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-display text-[#DFBE7B] uppercase tracking-wider mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="matteo@example.com"
                    className="w-full px-3 py-2.5 bg-[#181820] border border-[#9D7E54]/30 rounded text-xs text-[#FDFBF7] focus:outline-none focus:border-[#DFBE7B] font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-display text-[#DFBE7B] uppercase tracking-wider mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+44 20 7437 2323"
                    className="w-full px-3 py-2.5 bg-[#181820] border border-[#9D7E54]/30 rounded text-xs text-[#FDFBF7] focus:outline-none focus:border-[#DFBE7B] font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-display text-[#DFBE7B] uppercase tracking-wider mb-1">Preferred Event Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#181820] border border-[#9D7E54]/30 rounded text-xs text-[#FDFBF7] focus:outline-none focus:border-[#DFBE7B] font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-display text-[#DFBE7B] uppercase tracking-wider mb-1">Event Type</label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#181820] border border-[#9D7E54]/30 rounded text-xs text-[#FDFBF7] focus:outline-none focus:border-[#DFBE7B] font-sans"
                >
                  <option value="Birthday / Celebration">Birthday / Milestone Celebration</option>
                  <option value="Corporate Drinks">Corporate Evening / Product Launch</option>
                  <option value="Masterclass">Cocktail Masterclass Group Session</option>
                  <option value="Private Tasting">Private Sommelier Flight</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-display text-[#DFBE7B] uppercase tracking-wider mb-1">Special Requests / Branding Needs</label>
                <textarea
                  rows={3}
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  placeholder="Tell us about dietary needs, vinyl playlist preferences, custom cocktail branding..."
                  className="w-full px-3 py-2.5 bg-[#181820] border border-[#9D7E54]/30 rounded text-xs text-[#FDFBF7] focus:outline-none focus:border-[#DFBE7B] font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded bg-gradient-to-r from-[#DFBE7B] via-[#C5A059] to-[#9D7E54] text-[#08080A] font-display font-extrabold text-xs tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer hover:brightness-110 shadow-lg"
              >
                <Send className="w-4 h-4" />
                <span>Submit Private Hire Request</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
