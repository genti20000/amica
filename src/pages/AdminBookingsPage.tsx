import React, { useState, useMemo, useEffect } from 'react';
import { PageId, BookingConfirmation, BookingFormData } from '../types';
import {
  getStoredBookings,
  saveBooking,
  updateBookingStatus,
  deleteBooking,
  resetBookings
} from '../data/bookingStorage';
import {
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  Download,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  Share2,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Phone,
  Mail,
  Wine,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ChevronDown
} from 'lucide-react';

interface AdminBookingsPageProps {
  onNavigate: (page: PageId) => void;
}

export const AdminBookingsPage: React.FC<AdminBookingsPageProps> = ({ onNavigate }) => {
  const [bookings, setBookings] = useState<BookingConfirmation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'upcoming'>('all');
  const [serviceFilter, setServiceFilter] = useState<'all' | 'aperitivo' | 'dinner' | 'late-night'>('all');
  const [paxFilter, setPaxFilter] = useState<'all' | 'small' | 'medium' | 'large' | 'feasting'>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingConfirmation | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => new Date(Date.now() + 86400000).toISOString().split('T')[0], []);

  // New manual booking form state
  const [newBooking, setNewBooking] = useState<BookingFormData>({
    date: todayStr,
    timeSlot: '19:00 – Prime Vault Dining & Drinks',
    guests: 4,
    seatingArea: 'Arched Wine Vault Booth',
    name: '',
    email: '',
    phone: '',
    dietaryNotes: '',
    specialOccasion: 'None / Casual Aperitivo'
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    setBookings(getStoredBookings());
  }, []);

  const handleCopyAdminLink = () => {
    const url = `${window.location.origin}/?admin=true`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      showToast('Admin link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    }).catch(() => {
      showToast(`Admin link: ${url}`);
    });
  };

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    const updated = updateBookingStatus(bookingId, newStatus);
    setBookings(updated);
    if (selectedBooking && selectedBooking.bookingId === bookingId) {
      setSelectedBooking({ ...selectedBooking, status: newStatus });
    }
    showToast(`Reservation #${bookingId} status updated to ${newStatus}`);
  };

  const handleDelete = (bookingId: string) => {
    if (window.confirm(`Are you sure you want to cancel reservation #${bookingId}?`)) {
      const updated = deleteBooking(bookingId);
      setBookings(updated);
      if (selectedBooking?.bookingId === bookingId) setSelectedBooking(null);
      showToast(`Reservation #${bookingId} cancelled`);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all reservations to sample Soho bookings?')) {
      const updated = resetBookings();
      setBookings(updated);
      showToast('Reservations reset to default schedule');
    }
  };

  const handleCreateManualBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.name || !newBooking.phone) return;

    const bookingId = 'AMICA-' + Math.floor(100000 + Math.random() * 900000);
    const created: BookingConfirmation = {
      bookingId,
      formData: {
        ...newBooking,
        email: newBooking.email || 'guest@amicasoho.com'
      },
      createdAt: new Date().toISOString(),
      qrCodeValue: `AMICA-SOHO-${bookingId}-${newBooking.date}-${newBooking.guests}PAX`,
      status: 'Auto-Confirmed'
    };

    saveBooking(created);
    setBookings(getStoredBookings());
    setIsAddModalOpen(false);
    showToast(`Reservation #${bookingId} created & auto-confirmed!`);
    
    // Reset form
    setNewBooking({
      date: todayStr,
      timeSlot: '19:00 – Prime Vault Dining & Drinks',
      guests: 4,
      seatingArea: 'Arched Wine Vault Booth',
      name: '',
      email: '',
      phone: '',
      dietaryNotes: '',
      specialOccasion: 'None / Casual Aperitivo'
    });
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Booking ID', 'Status', 'Date', 'Time', 'Guests (Pax)', 'Guest Name', 'Email', 'Phone', 'Seating Area', 'Occasion', 'Dietary Notes', 'Created At'];
    const rows = filteredBookings.map((b) => [
      b.bookingId,
      b.status || 'Auto-Confirmed',
      b.formData.date,
      b.formData.timeSlot,
      b.formData.guests,
      `"${b.formData.name}"`,
      b.formData.email,
      b.formData.phone,
      `"${b.formData.seatingArea}"`,
      `"${b.formData.specialOccasion}"`,
      `"${b.formData.dietaryNotes || 'None'}"`,
      b.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AMICA_SOHO_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Bookings exported to CSV');
  };

  // Filtered list
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        b.bookingId.toLowerCase().includes(q) ||
        b.formData.name.toLowerCase().includes(q) ||
        b.formData.phone.toLowerCase().includes(q) ||
        b.formData.email.toLowerCase().includes(q) ||
        b.formData.seatingArea.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // Date Filter
      if (dateFilter === 'today' && b.formData.date !== todayStr) return false;
      if (dateFilter === 'tomorrow' && b.formData.date !== tomorrowStr) return false;
      if (dateFilter === 'upcoming' && b.formData.date < todayStr) return false;

      // Service Window Filter (Aperitivo 17-19, Dinner 19-23, Late Night 23-03)
      if (serviceFilter !== 'all') {
        const timeMatch = b.formData.timeSlot.match(/(\d{2}):(\d{2})/);
        const hour = timeMatch ? parseInt(timeMatch[1], 10) : 19;
        if (serviceFilter === 'aperitivo' && (hour < 17 || hour >= 19)) return false;
        if (serviceFilter === 'dinner' && (hour < 19 || hour >= 23)) return false;
        if (serviceFilter === 'late-night' && (hour >= 3 && hour < 23)) return false;
      }

      // Pax Filter (small 1-2, medium 3-6, large 7-12, feasting 13-20)
      if (paxFilter === 'small' && b.formData.guests > 2) return false;
      if (paxFilter === 'medium' && (b.formData.guests < 3 || b.formData.guests > 6)) return false;
      if (paxFilter === 'large' && (b.formData.guests < 7 || b.formData.guests > 12)) return false;
      if (paxFilter === 'feasting' && b.formData.guests < 13) return false;

      return true;
    });
  }, [bookings, searchQuery, dateFilter, serviceFilter, paxFilter, todayStr, tomorrowStr]);

  // Statistics
  const stats = useMemo(() => {
    const total = bookings.length;
    const totalCovers = bookings.reduce((acc, b) => acc + (b.formData.guests || 0), 0);
    const todayCovers = bookings
      .filter((b) => b.formData.date === todayStr)
      .reduce((acc, b) => acc + (b.formData.guests || 0), 0);
    const largeParties = bookings.filter((b) => b.formData.guests >= 8).length;
    return { total, totalCovers, todayCovers, largeParties };
  }, [bookings, todayStr]);

  return (
    <div className="min-h-screen bg-[#000000] text-[#FDFBF7] font-sans py-8 px-4 sm:px-6 lg:px-10 space-y-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A0509] border border-[#DFBE7B] text-[#FFEAA7] px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-sans tracking-wide animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[#DFBE7B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar with Branding & Navigation */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DFBE7B]/20 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-['Cinzel',serif] text-2xl sm:text-3xl tracking-[0.24em] text-[#E8CCA0] uppercase font-light">
              AMICA SOHO
            </span>
            <span className="px-2.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 font-sans text-[10px] tracking-widest uppercase font-bold">
              MAÎTRE D’ ADMIN
            </span>
          </div>
          <p className="text-xs text-[#DFBE7B]/80 font-sans mt-1">
            23 Frith Street, Soho · Reservations System (1 to 20 Pax · 5:00 PM – 3:00 AM · 7 Days a Week)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCopyAdminLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-[#1A0509] hover:bg-[#2A080F] border border-[#DFBE7B]/40 hover:border-[#DFBE7B] text-[#DFBE7B] text-xs font-sans tracking-wider uppercase transition-colors cursor-pointer shadow-sm"
            title="Copy direct link to this admin bookings page"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied' : 'Copy Admin Link'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-[#1A0509] hover:bg-[#2A080F] border border-[#DFBE7B]/40 hover:border-[#DFBE7B] text-[#DFBE7B] text-xs font-sans tracking-wider uppercase transition-colors cursor-pointer shadow-sm"
            title="Export reservation sheet as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-gradient-to-r from-[#C5A059] to-[#DFBE7B] hover:from-[#DFBE7B] hover:to-[#FFEAA7] text-[#120205] text-xs font-sans font-bold tracking-wider uppercase transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Reservation</span>
          </button>

          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-[#200A0E] hover:bg-[#321118] border border-[#DFBE7B]/30 hover:border-[#DFBE7B] text-[#DFBE7B] text-xs font-sans tracking-wider uppercase transition-colors cursor-pointer"
          >
            <span>Exit Admin</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-b from-[#180307] to-[#120205] border border-[#DFBE7B]/30 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-[#DFBE7B]/70 mb-1">
            <span className="text-[10px] font-sans uppercase tracking-wider font-semibold">Total Bookings</span>
            <Calendar className="w-4 h-4 text-[#DFBE7B]" />
          </div>
          <p className="font-['Cinzel',serif] text-2xl sm:text-3xl text-[#FFEAA7] font-semibold">
            {stats.total}
          </p>
          <span className="text-[10px] text-emerald-400 font-sans mt-0.5 block">
            100% Auto-Confirmed
          </span>
        </div>

        <div className="bg-gradient-to-b from-[#180307] to-[#120205] border border-[#DFBE7B]/30 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-[#DFBE7B]/70 mb-1">
            <span className="text-[10px] font-sans uppercase tracking-wider font-semibold">Total Covers (Pax)</span>
            <Users className="w-4 h-4 text-[#DFBE7B]" />
          </div>
          <p className="font-['Cinzel',serif] text-2xl sm:text-3xl text-[#FFEAA7] font-semibold">
            {stats.totalCovers}
          </p>
          <span className="text-[10px] text-[#DFBE7B]/70 font-sans mt-0.5 block">
            Across 1 to 20 pax groups
          </span>
        </div>

        <div className="bg-gradient-to-b from-[#180307] to-[#120205] border border-[#DFBE7B]/30 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-[#DFBE7B]/70 mb-1">
            <span className="text-[10px] font-sans uppercase tracking-wider font-semibold">Tonight’s Covers</span>
            <Clock className="w-4 h-4 text-[#DFBE7B]" />
          </div>
          <p className="font-['Cinzel',serif] text-2xl sm:text-3xl text-emerald-400 font-semibold">
            {stats.todayCovers}
          </p>
          <span className="text-[10px] text-[#DFBE7B]/70 font-sans mt-0.5 block">
            5:00 PM – 3:00 AM Service
          </span>
        </div>

        <div className="bg-gradient-to-b from-[#180307] to-[#120205] border border-[#DFBE7B]/30 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-[#DFBE7B]/70 mb-1">
            <span className="text-[10px] font-sans uppercase tracking-wider font-semibold">Large Parties (8–20)</span>
            <Wine className="w-4 h-4 text-[#DFBE7B]" />
          </div>
          <p className="font-['Cinzel',serif] text-2xl sm:text-3xl text-[#FFEAA7] font-semibold">
            {stats.largeParties}
          </p>
          <span className="text-[10px] text-[#DFBE7B]/70 font-sans mt-0.5 block">
            Vault Lounge / Feasting Tables
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="max-w-7xl mx-auto bg-[#140306] border border-[#DFBE7B]/25 rounded-xl p-4 space-y-3.5 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#DFBE7B]/60" />
            <input
              type="text"
              placeholder="Search by Guest Name, Phone, Email, or Booking #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0A0103] border border-[#DFBE7B]/30 rounded-lg text-xs text-[#FDFBF7] placeholder-[#DFBE7B]/40 focus:outline-none focus:border-[#DFBE7B] font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#DFBE7B]/60 hover:text-[#DFBE7B]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date Quick Filter */}
          <div className="md:col-span-3 flex items-center gap-1 text-[10px] uppercase font-sans">
            {[
              { id: 'all', label: 'All Dates' },
              { id: 'today', label: 'Today' },
              { id: 'tomorrow', label: 'Tomorrow' },
              { id: 'upcoming', label: 'Upcoming' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDateFilter(tab.id as any)}
                className={`flex-1 py-2 px-2 text-center rounded transition-colors cursor-pointer ${
                  dateFilter === tab.id
                    ? 'bg-[#DFBE7B] text-[#120205] font-bold'
                    : 'bg-[#1E050A] text-[#DFBE7B]/70 hover:text-[#DFBE7B] hover:bg-[#2A080F]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Service Window Filter */}
          <div className="md:col-span-3 flex items-center gap-1 text-[10px] uppercase font-sans">
            {[
              { id: 'all', label: 'All Services' },
              { id: 'aperitivo', label: 'Aperitivo (5-7)' },
              { id: 'dinner', label: 'Dinner (7-11)' },
              { id: 'late-night', label: 'Late (11-3)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setServiceFilter(tab.id as any)}
                className={`flex-1 py-2 px-2 text-center rounded transition-colors cursor-pointer ${
                  serviceFilter === tab.id
                    ? 'bg-[#DFBE7B] text-[#120205] font-bold'
                    : 'bg-[#1E050A] text-[#DFBE7B]/70 hover:text-[#DFBE7B] hover:bg-[#2A080F]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Pax Filter */}
          <div className="md:col-span-2">
            <select
              value={paxFilter}
              onChange={(e) => setPaxFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-[#0A0103] border border-[#DFBE7B]/30 rounded-lg text-xs text-[#DFBE7B] focus:outline-none focus:border-[#DFBE7B] font-sans cursor-pointer"
            >
              <option value="all">All Party Sizes (1–20)</option>
              <option value="small">1–2 Pax (Intimate/Bar)</option>
              <option value="medium">3–6 Pax (Booths)</option>
              <option value="large">7–12 Pax (Feasting)</option>
              <option value="feasting">13–20 Pax (Vault Lounge)</option>
            </select>
          </div>

        </div>

        {/* Active Filter Summary Bar */}
        <div className="flex items-center justify-between text-[11px] text-[#DFBE7B]/70 font-sans border-t border-[#DFBE7B]/15 pt-2">
          <span>
            Showing <strong>{filteredBookings.length}</strong> of {bookings.length} reservations
          </span>
          <button
            onClick={handleResetData}
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#DFBE7B]/50 hover:text-[#DFBE7B] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Bookings Table View */}
      <div className="max-w-7xl mx-auto bg-gradient-to-b from-[#180307] to-[#100204] border border-[#DFBE7B]/30 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#24070D] text-[#DFBE7B] uppercase tracking-wider text-[10px] border-b border-[#DFBE7B]/20">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Ref & Status</th>
                <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                <th className="py-3.5 px-4 font-semibold">Party (Pax)</th>
                <th className="py-3.5 px-4 font-semibold">Lead Guest</th>
                <th className="py-3.5 px-4 font-semibold">Seating Area</th>
                <th className="py-3.5 px-4 font-semibold">Occasion & Notes</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFBE7B]/10">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-[#DFBE7B]/60 font-sans">
                    No reservations matching current filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const status = b.status || 'Auto-Confirmed';
                  const isLargeGroup = b.formData.guests >= 8;
                  const isToday = b.formData.date === todayStr;

                  return (
                    <tr
                      key={b.bookingId}
                      className="hover:bg-[#200A0E]/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedBooking(b)}
                    >
                      {/* Booking ID & Auto-Confirm Badge */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-bold text-[#FFEAA7]">
                          {b.bookingId}
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-sans uppercase tracking-wider font-semibold mt-1 ${
                          status === 'Auto-Confirmed'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                            : status === 'Seated'
                            ? 'bg-blue-950/80 text-blue-400 border border-blue-500/40'
                            : status === 'Completed'
                            ? 'bg-zinc-800 text-zinc-300'
                            : 'bg-red-950/80 text-red-400 border border-red-500/40'
                        }`}>
                          <Zap className="w-2.5 h-2.5" />
                          {status}
                        </span>
                      </td>

                      {/* Date & Time Slot */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-[#FDFBF7]">
                          <Calendar className="w-3.5 h-3.5 text-[#DFBE7B]" />
                          <span>{b.formData.date}</span>
                          {isToday && (
                            <span className="px-1.5 py-0.2 bg-[#C5A059] text-[#120205] text-[9px] font-bold rounded uppercase">
                              Tonight
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#DFBE7B] mt-0.5">
                          <Clock className="w-3 h-3 text-[#DFBE7B]/70" />
                          <span>{b.formData.timeSlot.split('–')[0]}</span>
                        </div>
                      </td>

                      {/* Guests / Pax Count */}
                      <td className="py-3.5 px-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-bold text-xs ${
                          isLargeGroup
                            ? 'bg-gradient-to-r from-[#DFBE7B] to-[#FFEAA7] text-[#120205] shadow-sm'
                            : 'bg-[#200A0E] text-[#FFEAA7] border border-[#DFBE7B]/30'
                        }`}>
                          <Users className="w-3.5 h-3.5" />
                          <span>{b.formData.guests} Pax</span>
                        </div>
                        {b.formData.guests >= 13 && (
                          <span className="text-[9px] text-[#DFBE7B] block mt-0.5 uppercase tracking-wider font-semibold">
                            Vault Lounge
                          </span>
                        )}
                      </td>

                      {/* Guest Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#FDFBF7]">
                          {b.formData.name}
                        </div>
                        <div className="text-[11px] text-[#DFBE7B]/70 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#DFBE7B]/50" />
                            {b.formData.phone}
                          </span>
                        </div>
                      </td>

                      {/* Seating Area */}
                      <td className="py-3.5 px-4 text-[#DFBE7B]">
                        <span className="font-medium text-xs block text-[#E8CCA0]">
                          {b.formData.seatingArea}
                        </span>
                        <span className="text-[10px] text-[#DFBE7B]/60 font-sans">
                          23 Frith St Subterranean
                        </span>
                      </td>

                      {/* Special Occasion & Notes */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="text-[11px] text-[#FFEAA7] font-medium block">
                          {b.formData.specialOccasion}
                        </span>
                        {b.formData.dietaryNotes && (
                          <span className="text-[10px] text-[#DFBE7B]/70 truncate block mt-0.5" title={b.formData.dietaryNotes}>
                            Note: {b.formData.dietaryNotes}
                          </span>
                        )}
                      </td>

                      {/* Action Dropdown & Details Button */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            value={status}
                            onChange={(e) => handleStatusChange(b.bookingId, e.target.value)}
                            className="bg-[#0D0204] border border-[#DFBE7B]/30 rounded text-[10px] py-1 px-1.5 text-[#DFBE7B] focus:outline-none focus:border-[#DFBE7B] cursor-pointer"
                          >
                            <option value="Auto-Confirmed">Auto-Confirmed</option>
                            <option value="Seated">Seated</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="No-show">No-show</option>
                          </select>

                          <button
                            onClick={() => handleDelete(b.bookingId)}
                            className="p-1.5 rounded hover:bg-red-950/60 text-red-400 hover:text-red-300 transition-colors"
                            title="Cancel Reservation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          BOOKING DETAILS MODAL
         ========================================================================= */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-[#180307] via-[#120205] to-[#0A0103] border-2 border-[#DFBE7B] rounded-xl p-6 sm:p-8 text-[#FDFBF7] shadow-2xl">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 text-[#DFBE7B]/60 hover:text-[#DFBE7B] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <span className="text-[10px] uppercase font-sans tracking-widest text-emerald-400 font-bold block mb-1">
                ✓ AUTO-CONFIRMED RESTAURANT RESERVATION
              </span>
              <h2 className="font-['Cinzel',serif] text-2xl text-[#E8CCA0]">
                Reservation #{selectedBooking.bookingId}
              </h2>
              <p className="text-xs text-[#DFBE7B]/80 font-sans mt-0.5">
                Created: {new Date(selectedBooking.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="bg-[#140306] border border-[#DFBE7B]/30 rounded-lg p-5 space-y-3.5 mb-6 text-xs">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#DFBE7B]/20">
                <div>
                  <span className="text-[10px] text-[#DFBE7B]/70 uppercase block">Party Size</span>
                  <p className="text-sm font-bold text-[#FFEAA7] mt-0.5">
                    {selectedBooking.formData.guests} Guests (Pax)
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-[#DFBE7B]/70 uppercase block">Date & Time</span>
                  <p className="text-xs font-semibold text-[#FDFBF7] mt-0.5">
                    {selectedBooking.formData.date} · {selectedBooking.formData.timeSlot.split('–')[0]}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-[#DFBE7B]/70 uppercase block">Lead Guest</span>
                <p className="text-sm font-semibold text-[#FDFBF7] mt-0.5">
                  {selectedBooking.formData.name}
                </p>
                <p className="text-xs text-[#DFBE7B]/80">{selectedBooking.formData.email}</p>
                <p className="text-xs text-[#DFBE7B]/80">{selectedBooking.formData.phone}</p>
              </div>

              <div>
                <span className="text-[10px] text-[#DFBE7B]/70 uppercase block">Seating Area</span>
                <p className="text-xs font-medium text-[#FFEAA7] mt-0.5">
                  {selectedBooking.formData.seatingArea}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-[#DFBE7B]/70 uppercase block">Occasion & Dietary Notes</span>
                <p className="text-xs text-[#FDFBF7] mt-0.5">
                  <strong>Occasion:</strong> {selectedBooking.formData.specialOccasion}
                </p>
                <p className="text-xs text-[#DFBE7B] mt-0.5">
                  <strong>Dietary:</strong> {selectedBooking.formData.dietaryNotes || 'None specified'}
                </p>
              </div>
            </div>

            {/* Quick Status Toggles */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#DFBE7B] uppercase font-sans font-semibold">Update Status:</span>
                <div className="flex items-center gap-1.5 flex-1">
                  {['Auto-Confirmed', 'Seated', 'Completed', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedBooking.bookingId, st)}
                      className={`flex-1 py-1.5 px-2 rounded text-[10px] font-sans uppercase font-bold transition-all cursor-pointer ${
                        selectedBooking.status === st
                          ? 'bg-[#DFBE7B] text-[#120205]'
                          : 'bg-[#200A0E] text-[#DFBE7B]/70 hover:text-[#DFBE7B]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full py-2.5 rounded bg-[#200A0E] hover:bg-[#321118] border border-[#DFBE7B]/40 text-[#DFBE7B] text-xs font-sans uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          NEW MANUAL RESERVATION MODAL
         ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-[#180307] via-[#120205] to-[#0A0103] border-2 border-[#DFBE7B] rounded-xl p-6 sm:p-8 text-[#FDFBF7] shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-[#DFBE7B]/60 hover:text-[#DFBE7B] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <span className="text-[10px] uppercase font-sans tracking-widest text-[#DFBE7B] font-bold block mb-1">
                MAÎTRE D’ MANUAL BOOKING ENTRY
              </span>
              <h2 className="font-['Cinzel',serif] text-2xl text-[#E8CCA0]">
                Create Walk-In / Phone Reservation
              </h2>
              <p className="text-xs text-[#DFBE7B]/80 font-sans mt-0.5">
                Automatically confirmed for 1 to 20 pax (5:00 PM – 3:00 AM)
              </p>
            </div>

            <form onSubmit={handleCreateManualBooking} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-[#DFBE7B] mb-1 font-semibold">Guests (Pax): {newBooking.guests}</label>
                  <select
                    value={newBooking.guests}
                    onChange={(e) => {
                      const g = parseInt(e.target.value, 10);
                      let area = newBooking.seatingArea;
                      if (g >= 15) area = 'Exclusive Vault Lounge Section';
                      else if (g >= 8) area = 'Semi-Private Feasting Vault';
                      setNewBooking({ ...newBooking, guests: g, seatingArea: area });
                    }}
                    className="w-full py-2 px-3 bg-[#0A0103] border border-[#DFBE7B]/40 rounded text-xs text-[#FDFBF7]"
                  >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-[#DFBE7B] mb-1 font-semibold">Date</label>
                  <input
                    type="date"
                    required
                    value={newBooking.date}
                    onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                    className="w-full py-2 px-3 bg-[#0A0103] border border-[#DFBE7B]/40 rounded text-xs text-[#FDFBF7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#DFBE7B] mb-1 font-semibold">Time Slot (5pm to 3am)</label>
                <select
                  value={newBooking.timeSlot}
                  onChange={(e) => setNewBooking({ ...newBooking, timeSlot: e.target.value })}
                  className="w-full py-2 px-3 bg-[#0A0103] border border-[#DFBE7B]/40 rounded text-xs text-[#FDFBF7]"
                >
                  <option value="17:00 – Golden Hour Opening">17:00 – 5:00 PM (Opening)</option>
                  <option value="17:30 – Spritz & Early Aperitivo">17:30 – 5:30 PM (Aperitivo)</option>
                  <option value="18:00 – Aperitivo & Cicchetti">18:00 – 6:00 PM</option>
                  <option value="19:00 – Prime Vault Dining & Drinks">19:00 – 7:00 PM (Prime Dinner)</option>
                  <option value="20:00 – Prime Dinner & Cocktails">20:00 – 8:00 PM (Dinner)</option>
                  <option value="20:30 – Vinyl Jazz & Dining">20:30 – 8:30 PM (Vinyl Beats)</option>
                  <option value="21:30 – Late Evening Banquette">21:30 – 9:30 PM</option>
                  <option value="22:30 – Late Night Speakeasy">22:30 – 10:30 PM</option>
                  <option value="23:30 – Vault Beats & Cocktails">23:30 – 11:30 PM (Midnight Drinks)</option>
                  <option value="00:30 – Late Night Selectors">00:30 – 12:30 AM</option>
                  <option value="01:30 – Late Night Pour">01:30 – 1:30 AM (Till 3am)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#DFBE7B] mb-1 font-semibold">Seating Area Allocation</label>
                <select
                  value={newBooking.seatingArea}
                  onChange={(e) => setNewBooking({ ...newBooking, seatingArea: e.target.value })}
                  className="w-full py-2 px-3 bg-[#0A0103] border border-[#DFBE7B]/40 rounded text-xs text-[#FDFBF7]"
                >
                  <option value="Arched Wine Vault Booth">Arched Wine Vault Booth (2–8 Pax)</option>
                  <option value="Brass Cocktail Counter & High Bar">Brass Cocktail Counter & High Bar (1–4 Pax)</option>
                  <option value="Plush Velvet Banquette">Plush Velvet Banquette (2–6 Pax)</option>
                  <option value="Semi-Private Feasting Vault">Semi-Private Feasting Vault (7–14 Pax)</option>
                  <option value="Exclusive Vault Lounge Section">Exclusive Vault Lounge Section (12–20 Pax)</option>
                  <option value="First Available Table">First Available Table (1–20 Pax)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-[#DFBE7B] mb-1 font-semibold">Guest Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Guest name"
                    value={newBooking.name}
                    onChange={(e) => setNewBooking({ ...newBooking, name: e.target.value })}
                    className="w-full py-2 px-3 bg-[#0A0103] border border-[#DFBE7B]/40 rounded text-xs text-[#FDFBF7]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[#DFBE7B] mb-1 font-semibold">Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+44 7..."
                    value={newBooking.phone}
                    onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
                    className="w-full py-2 px-3 bg-[#0A0103] border border-[#DFBE7B]/40 rounded text-xs text-[#FDFBF7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#DFBE7B] mb-1 font-semibold">Special Occasion</label>
                <select
                  value={newBooking.specialOccasion}
                  onChange={(e) => setNewBooking({ ...newBooking, specialOccasion: e.target.value })}
                  className="w-full py-2 px-3 bg-[#0A0103] border border-[#DFBE7B]/40 rounded text-xs text-[#FDFBF7]"
                >
                  <option value="None / Casual Aperitivo">None / Casual Aperitivo</option>
                  <option value="Birthday Celebration">Birthday Celebration</option>
                  <option value="Anniversary / Date Night">Anniversary / Date Night</option>
                  <option value="Group Celebration (Feasting)">Group Celebration (Feasting)</option>
                  <option value="Corporate / Client Entertaining">Corporate / Client Entertaining</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#DFBE7B] mb-1 font-semibold">Dietary Notes / Requests</label>
                <input
                  type="text"
                  placeholder="e.g. Allergies, special wine request..."
                  value={newBooking.dietaryNotes}
                  onChange={(e) => setNewBooking({ ...newBooking, dietaryNotes: e.target.value })}
                  className="w-full py-2 px-3 bg-[#0A0103] border border-[#DFBE7B]/40 rounded text-xs text-[#FDFBF7]"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded bg-gradient-to-r from-[#C5A059] to-[#DFBE7B] text-[#120205] font-sans font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Save & Auto-Confirm Reservation
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-3 px-4 rounded bg-[#200A0E] text-[#DFBE7B] text-xs font-sans uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
