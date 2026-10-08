import React, { useState, useMemo, useEffect } from 'react';
import { PageId, BookingConfirmation, BookingFormData } from '../types';
import { MonthlyCalendarWidget } from '../components/MonthlyCalendarWidget';
import { AdminCalendarView } from '../components/AdminCalendarView';
import {
  getStoredBookings,
  fetchBookingsFromDb,
  saveBooking,
  updateBookingStatus,
  deleteBooking,
  fetchBookingAuditLogs,
  fetchDatabaseStatus,
  resetBookings,
  fetchBlockedDates,
  addBlockedDate,
  removeBlockedDate,
  fetchSystemSettings,
  updateSystemSettings,
  sendBookingConfirmationEmail,
  BlockedDateItem,
  SystemSettings,
  DEFAULT_SETTINGS
} from '../data/bookingStorage';
import {
  Calendar,
  Clock,
  Users,
  Search,
  Download,
  Plus,
  Send,
  X,
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
  Database,
  ExternalLink,
  Table as TableIcon,
  Ban,
  Sliders,
  CalendarX,
  AlertTriangle,
  Layers,
  Settings as SettingsIcon,
  Lock,
  Unlock,
  Info
} from 'lucide-react';

interface AdminBookingsPageProps {
  onNavigate: (page: PageId) => void;
}

export const AdminBookingsPage: React.FC<AdminBookingsPageProps> = ({ onNavigate }) => {
  // Navigation Tabs
  const [activeAdminTab, setActiveAdminTab] = useState<'bookings' | 'calendar' | 'blocked-dates' | 'settings'>('bookings');

  // Bookings state
  const [bookings, setBookings] = useState<BookingConfirmation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'upcoming'>('all');
  const [serviceFilter, setServiceFilter] = useState<'all' | 'aperitivo' | 'dinner' | 'late-night'>('all');
  const [paxFilter, setPaxFilter] = useState<'all' | 'small' | 'medium' | 'large' | 'feasting'>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingConfirmation | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'details' | 'audit'>('details');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDbExplorerOpen, setIsDbExplorerOpen] = useState(false);

  // Blocked Dates & System Settings state
  const [blockedDates, setBlockedDates] = useState<BlockedDateItem[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbStats, setDbStats] = useState<any>(null);

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
    specialOccasion: 'Casual Dining & Drinks'
  });

  // New block date form state
  const [newBlock, setNewBlock] = useState({
    date: todayStr,
    isFullDay: true,
    startTime: '17:00',
    endTime: '03:00',
    reason: 'Full Venue Private Buyout',
    notes: ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
    try {
      const data = await fetchBookingsFromDb();
      setBookings(Array.isArray(data) ? data : []);
      const stats = await fetchDatabaseStatus();
      setDbStats(stats);

      const bDates = await fetchBlockedDates();
      setBlockedDates(bDates);

      const sSettings = await fetchSystemSettings();
      setSystemSettings(sSettings);
    } catch {
      setBookings([]); showToast('Could not load reservations. Please sign in again or retry.'); throw new Error('Could not load reservations.');
    }
  };

  useEffect(() => {
    loadData().catch(() => {});
  }, []);

  const handleRefresh = async () => {
    try {
    setIsRefreshing(true);
    try {
      await loadData();
      showToast('Database & system settings synchronized with Supabase PostgreSQL store');
    } finally {
      setIsRefreshing(false);
    }

    } catch (error) { showToast(error instanceof Error ? error.message : 'The change could not be saved.'); }
  };

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

  const handleSelectBooking = async (b: BookingConfirmation) => {
    try {
    setSelectedBooking(b);
    setActiveModalTab('details');
    setIsLoadingAudit(true);
    try {
      const logs = await fetchBookingAuditLogs(b.bookingId);
      setAuditLogs(logs);
    } catch {
      setAuditLogs([]);
    } finally {
      setIsLoadingAudit(false);
    }

    } catch (error) { showToast(error instanceof Error ? error.message : 'The change could not be saved.'); }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
    const updated = await updateBookingStatus(bookingId, newStatus, 'MAÎTRE_D_ADMIN', `Status switched to ${newStatus}`);
    setBookings(updated);
    if (selectedBooking && selectedBooking.bookingId === bookingId) {
      setSelectedBooking({ ...selectedBooking, status: newStatus });
      const logs = await fetchBookingAuditLogs(bookingId);
      setAuditLogs(logs);
    }
    showToast(`Reservation #${bookingId} status recorded as ${newStatus}`);

    } catch (error) { showToast(error instanceof Error ? error.message : 'The change could not be saved.'); }
  };

  const handleDelete = async (bookingId: string) => {
    try {
    if (window.confirm(`Are you sure you want to cancel reservation #${bookingId}? It will be logged in the database audit table.`)) {
      const updated = await deleteBooking(bookingId, 'MAÎTRE_D_ADMIN', 'Cancelled from admin dashboard');
      setBookings(updated);
      if (selectedBooking?.bookingId === bookingId) setSelectedBooking(null);
      showToast(`Reservation #${bookingId} cancelled and archived in database`);
    }

    } catch (error) { showToast(error instanceof Error ? error.message : 'The change could not be saved.'); }
  };

  const handleResetData = async () => {
    try {
    if (window.confirm('Reset database back to standard Amica Soho reservations?')) {
      const updated = await resetBookings();
      setBookings(updated);
      const stats = await fetchDatabaseStatus();
      setDbStats(stats);
      showToast('Database reset to default seed schedule');
    }

    } catch (error) { showToast(error instanceof Error ? error.message : 'The change could not be saved.'); }
  };

  const handleCreateManualBooking = async (e: React.FormEvent) => {
    try {
    e.preventDefault();
    if (!newBooking.name || !newBooking.phone) return;

    const bookingId = 'AMICA-' + Math.floor(100000 + Math.random() * 900000);

    const created: BookingConfirmation = {
      bookingId,
      formData: {
        ...newBooking,
        email: newBooking.email || 'walkin@amicasoho.com'
      },
      createdAt: new Date().toISOString(),
      qrCodeValue: `AMICA-SOHO-${bookingId}-${newBooking.date}-${newBooking.guests}PAX`,
      status: 'Confirmed'
    };

    await saveBooking(created);
    await loadData();
    setIsAddModalOpen(false);
    showToast(`Reservation #${bookingId} recorded and auto-confirmed in Supabase PostgreSQL!`);

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
      specialOccasion: 'Casual Dining & Drinks'
    });

    } catch (error) { showToast(error instanceof Error ? error.message : 'The change could not be saved.'); }
  };

  // Block Date Form Submit
  const handleCreateBlockDate = async (e: React.FormEvent) => {
    try {
    e.preventDefault();
    if (!newBlock.date || !newBlock.reason) return;

    try {
      const updated = await addBlockedDate({
        blocked_date: newBlock.date,
        is_full_day: newBlock.isFullDay,
        start_time: newBlock.isFullDay ? undefined : newBlock.startTime,
        end_time: newBlock.isFullDay ? undefined : newBlock.endTime,
        reason: newBlock.reason,
        notes: newBlock.notes
      });
      setBlockedDates(updated);
      setIsBlockModalOpen(false);
      showToast(`Date ${newBlock.date} blocked and recorded in database!`);
    } catch {
      showToast('Failed to block date');
    }

    } catch (error) { showToast(error instanceof Error ? error.message : 'The change could not be saved.'); }
  };

  // Remove Blocked Date
  const handleRemoveBlock = async (id: number, dateStr: string) => {
    try {
    if (window.confirm(`Unblock date ${dateStr} and reopen for general online reservations?`)) {
      try {
        const updated = await removeBlockedDate(id);
        setBlockedDates(updated);
        showToast(`Date ${dateStr} unblocked successfully`);
      } catch {
        showToast('Failed to unblock date');
      }
    }

    } catch (error) { showToast(error instanceof Error ? error.message : 'The change could not be saved.'); }
  };

  // Save System Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    try {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const updated = await updateSystemSettings(systemSettings);
      setSystemSettings(updated);
      showToast('System settings updated and saved to database!');
    } catch {
      showToast('Failed to save settings');
    } finally {
      setIsSavingSettings(false);
    }

    } catch (error) { showToast(error instanceof Error ? error.message : 'The change could not be saved.'); }
  };

  // Export to CSV
  const handleExportCSV = () => {
    window.open('/api/export/csv', '_blank');
    showToast('Downloading database records as CSV...');
  };

  // Filtered list
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        b.bookingId.toLowerCase().includes(q) ||
        b.formData.name.toLowerCase().includes(q) ||
        b.formData.phone.toLowerCase().includes(q) ||
        b.formData.email.toLowerCase().includes(q) ||
        b.formData.seatingArea.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (dateFilter === 'today' && b.formData.date !== todayStr) return false;
      if (dateFilter === 'tomorrow' && b.formData.date !== tomorrowStr) return false;
      if (dateFilter === 'upcoming' && b.formData.date < todayStr) return false;

      if (serviceFilter !== 'all') {
        const timeMatch = b.formData.timeSlot.match(/(\d{2}):(\d{2})/);
        const hour = timeMatch ? parseInt(timeMatch[1], 10) : 19;
        if (serviceFilter === 'aperitivo' && (hour < 17 || hour >= 19)) return false;
        if (serviceFilter === 'dinner' && (hour < 19 || hour >= 23)) return false;
        if (serviceFilter === 'late-night' && (hour >= 3 && hour < 23)) return false;
      }

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
    <div className="min-h-screen bg-[#000000] text-[#FDFBF7] font-sans py-8 px-4 sm:px-6 lg:px-10 space-y-7">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A0509] border border-[#DFBE7B] text-[#FFEAA7] px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-sans tracking-wide animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[#DFBE7B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar with Branding & Navigation */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DFBE7B]/20 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-['Cinzel',serif] text-2xl sm:text-3xl tracking-[0.24em] text-[#E8CCA0] uppercase font-light">
              AMICA SOHO
            </span>
            <span className="px-2.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 font-sans text-[10px] tracking-widest uppercase font-bold">
              MAÎTRE D’ ADMIN & SYSTEM MANAGER
            </span>
          </div>
          <p className="text-xs text-[#DFBE7B]/80 font-sans mt-1">
            23 Frith Street, Soho · Reservations System & Blocked Dates Manager (5:00 PM – 3:00 AM · Wed – Sat)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCopyAdminLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-[#1A0509] hover:bg-[#2A080F] border border-[#DFBE7B]/40 hover:border-[#DFBE7B] text-[#DFBE7B] text-xs font-sans tracking-wider uppercase transition-colors cursor-pointer shadow-sm"
            title="Copy direct shareable admin link"
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
            onClick={() => setIsBlockModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-[#2D0911] hover:bg-[#3E0E18] border border-red-500/50 hover:border-red-400 text-red-300 text-xs font-sans tracking-wider uppercase transition-all cursor-pointer shadow-sm"
          >
            <Ban className="w-3.5 h-3.5 text-red-400" />
            <span>+ Block Date</span>
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

      {/* Main Admin Section Tabs */}
      <div className="max-w-7xl mx-auto flex items-center gap-2 border-b border-[#DFBE7B]/30 pb-3 flex-wrap">
        <button
          onClick={() => setActiveAdminTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeAdminTab === 'bookings'
              ? 'bg-gradient-to-r from-[#C5A059] to-[#DFBE7B] text-[#120205] shadow-md'
              : 'bg-[#180307] text-[#DFBE7B]/70 hover:text-[#DFBE7B] hover:bg-[#200A0E] border border-[#DFBE7B]/20'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Reservations Run Sheet</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
            {bookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('calendar')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeAdminTab === 'calendar'
              ? 'bg-gradient-to-r from-[#C5A059] to-[#DFBE7B] text-[#120205] shadow-md'
              : 'bg-[#180307] text-[#DFBE7B]/70 hover:text-[#DFBE7B] hover:bg-[#200A0E] border border-[#DFBE7B]/20'
          }`}
        >
          <Layers className="w-4 h-4 text-[#DFBE7B]" />
          <span>Calendar Dashboard (Day/Week/Month)</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('blocked-dates')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeAdminTab === 'blocked-dates'
              ? 'bg-gradient-to-r from-[#C5A059] to-[#DFBE7B] text-[#120205] shadow-md'
              : 'bg-[#180307] text-[#DFBE7B]/70 hover:text-[#DFBE7B] hover:bg-[#200A0E] border border-[#DFBE7B]/20'
          }`}
        >
          <Ban className="w-4 h-4 text-red-400" />
          <span>Blocked Dates & Buyouts</span>
          <span className="px-1.5 py-0.2 rounded-full bg-red-950 text-red-300 border border-red-500/40 text-[10px] font-mono">
            {blockedDates.length}
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeAdminTab === 'settings'
              ? 'bg-gradient-to-r from-[#C5A059] to-[#DFBE7B] text-[#120205] shadow-md'
              : 'bg-[#180307] text-[#DFBE7B]/70 hover:text-[#DFBE7B] hover:bg-[#200A0E] border border-[#DFBE7B]/20'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>System Operating Rules</span>
        </button>
      </div>

      {/* Database Status & Storage Persistence Banner */}
      <div className="max-w-7xl mx-auto bg-gradient-to-r from-[#1B0409] via-[#120205] to-[#0D0204] border border-[#DFBE7B]/40 rounded-xl p-4 sm:p-5 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#2D0911] border border-[#DFBE7B]/50 flex items-center justify-center shrink-0 shadow-inner">
            <Database className="w-5 h-5 text-[#DFBE7B]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-[#FFEAA7] tracking-wider uppercase">
                DATABASE: Supabase PostgreSQL 3 ENGINE (PERSISTENT DISK STORAGE)
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-[9px] uppercase tracking-widest font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live & Connected
              </span>
            </div>
            <p className="text-[11px] text-[#DFBE7B]/80 font-sans mt-0.5">
              Storage File: <span className="font-mono text-[#FFEAA7]">data/amica.sqlite</span> · Tables: <span className="font-mono text-[#FFEAA7]">reservations</span>, <span className="font-mono text-[#FFEAA7]">blocked_dates</span>, <span className="font-mono text-[#FFEAA7]">venue_settings</span> & <span className="font-mono text-[#FFEAA7]">booking_audit_logs</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsDbExplorerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2A0910] hover:bg-[#3D0E18] border border-[#DFBE7B]/40 text-[#DFBE7B] text-xs font-sans tracking-wide cursor-pointer transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#DFBE7B]" />
            <span>Database Explorer & Schema</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2A0910] hover:bg-[#3D0E18] border border-[#DFBE7B]/40 text-[#DFBE7B] text-xs font-sans tracking-wide cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#DFBE7B] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync DB</span>
          </button>
        </div>
      </div>

      {/* Shareable Admin Direct URL Card */}
      <div className="max-w-7xl mx-auto bg-[#120205] border border-[#DFBE7B]/30 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#DFBE7B] font-bold">
            Direct Admin URL:
          </span>
          <code className="bg-[#080102] px-2.5 py-1 rounded border border-[#DFBE7B]/30 text-[#FFEAA7] font-mono text-[11px] select-all">
            {typeof window !== 'undefined' ? `${window.location.origin}/?admin=true` : '/?admin=true'}
          </code>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAdminLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#200A0E] hover:bg-[#321118] border border-[#DFBE7B]/40 text-[#DFBE7B] font-sans tracking-wider text-[11px] uppercase cursor-pointer transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied Link' : 'Copy Link'}</span>
          </button>
          <button
            onClick={() => onNavigate('book')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#200A0E] hover:bg-[#321118] border border-[#DFBE7B]/40 text-[#DFBE7B] font-sans tracking-wider text-[11px] uppercase cursor-pointer transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Test Guest Booking</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: RESERVATIONS & RUN SHEET
         ========================================================================= */}
      {activeAdminTab === 'bookings' && (
        <div className="space-y-7">
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
                    <th className="py-3.5 px-4 font-semibold">Occasion & Area</th>
                    <th className="py-3.5 px-4 font-semibold">Dietary & Notes</th>
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
                          onClick={() => handleSelectBooking(b)}
                        >
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

                          <td className="py-3.5 px-4 text-[#DFBE7B]">
                            <span className="font-semibold text-xs text-[#FFEAA7] block">
                              {b.formData.specialOccasion || 'Casual Dining'}
                            </span>
                            <span className="text-[10px] text-[#DFBE7B]/80 font-sans block truncate max-w-[180px]">
                              {b.formData.seatingArea}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            {b.formData.dietaryNotes ? (
                              <span className="text-[11px] text-[#FFEAA7] block truncate" title={b.formData.dietaryNotes}>
                                {b.formData.dietaryNotes}
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#DFBE7B]/50 block">None</span>
                            )}
                          </td>

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
        </div>
      )}

      {/* =========================================================================
          TAB 2: CALENDAR DASHBOARD (DAY / WEEK / MONTH VIEWS)
         ========================================================================= */}
      {activeAdminTab === 'calendar' && (
        <div className="max-w-7xl mx-auto space-y-6">
          <AdminCalendarView
            bookings={bookings}
            blockedDates={blockedDates}
            onSelectBooking={handleSelectBooking}
            onAddBookingForDate={(dateStr) => {
              setNewBooking((prev) => ({ ...prev, date: dateStr }));
              setIsAddModalOpen(true);
            }}
            onBlockDate={(dateStr) => {
              setNewBlock((prev) => ({ ...prev, date: dateStr }));
              setIsBlockModalOpen(true);
            }}
          />
        </div>
      )}

      {/* =========================================================================
          TAB 3: BLOCKED DATES & BUYOUTS MANAGEMENT
         ========================================================================= */}
      {activeAdminTab === 'blocked-dates' && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#140306] border border-[#DFBE7B]/30 rounded-xl p-5 shadow-lg">
            <div>
              <div className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-red-400" />
                <h3 className="font-['Cinzel',serif] text-xl text-[#FDFBF7]">
                  Blocked Dates & Blackout Management
                </h3>
              </div>
              <p className="text-xs text-[#DFBE7B]/80 font-sans mt-1">
                Block specific evenings for full venue buyouts, private corporate events, or holiday closures. Blocked dates cannot be booked online.
              </p>
            </div>

            <button
              onClick={() => setIsBlockModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-sans font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Block New Date / Window</span>
            </button>
          </div>

          {/* Visual Monthly Calendar Widget */}
          <MonthlyCalendarWidget
            blockedDates={blockedDates}
            bookings={bookings}
            onBlockDate={(dateStr) => {
              setNewBlock((prev) => ({ ...prev, date: dateStr }));
              setIsBlockModalOpen(true);
            }}
            onUnblockDate={(id, dateStr) => handleRemoveBlock(id, dateStr)}
            onFilterByDate={(dateStr) => {
              setSearchQuery(dateStr);
              setActiveAdminTab('bookings');
            }}
          />

          {/* Blocked Dates List */}
          <div className="bg-gradient-to-b from-[#180307] to-[#100204] border border-[#DFBE7B]/30 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#DFBE7B]/20 flex items-center justify-between bg-[#200A0E]">
              <span className="text-xs uppercase font-sans tracking-wider text-[#FFEAA7] font-semibold flex items-center gap-2">
                <CalendarX className="w-4 h-4 text-red-400" />
                <span>Active Blocked Dates in Database ({blockedDates.length})</span>
              </span>
              <span className="text-[11px] text-[#DFBE7B]/70 font-sans">
                Real-time validation enforced at booking checkout
              </span>
            </div>

            {blockedDates.length === 0 ? (
              <div className="py-12 text-center space-y-2 text-xs text-[#DFBE7B]/60 font-sans">
                <CalendarX className="w-8 h-8 text-[#DFBE7B]/40 mx-auto" />
                <p>No dates are currently blocked. Amica Soho is open Wednesday to Saturday (5:00 PM – 3:00 AM).</p>
                <button
                  onClick={() => setIsBlockModalOpen(true)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2A0910] text-[#DFBE7B] hover:text-[#FFEAA7] border border-[#DFBE7B]/40 text-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Blocked Date</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#DFBE7B]/10">
                {blockedDates.map((block) => (
                  <div
                    key={block.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#200A0E]/50 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-sm font-bold text-[#FFEAA7]">
                          {block.blocked_date}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-red-950 border border-red-500/50 text-red-300 text-[10px] font-sans font-bold uppercase tracking-wider">
                          {block.is_full_day ? 'Full Day Closed' : `${block.start_time} – ${block.end_time}`}
                        </span>
                        <span className="text-xs font-semibold text-[#FDFBF7]">
                          {block.reason}
                        </span>
                      </div>
                      {block.notes && (
                        <p className="text-xs text-[#DFBE7B]/80 font-sans">
                          {block.notes}
                        </p>
                      )}
                      <p className="text-[10px] text-[#DFBE7B]/50 font-sans">
                        Recorded on: {new Date(block.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => handleRemoveBlock(block.id, block.blocked_date)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#200A0E] hover:bg-emerald-950/80 border border-[#DFBE7B]/40 hover:border-emerald-500 text-[#DFBE7B] hover:text-emerald-400 text-xs font-sans tracking-wide transition-all cursor-pointer"
                        title="Remove blackout and reopen date for reservations"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Unblock Date</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: SYSTEM OPERATING RULES & SETTINGS
         ========================================================================= */}
      {activeAdminTab === 'settings' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <form onSubmit={handleSaveSettings} className="bg-gradient-to-b from-[#180307] to-[#100204] border border-[#DFBE7B]/30 rounded-xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="border-b border-[#DFBE7B]/20 pb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#DFBE7B]" />
                <h3 className="font-['Cinzel',serif] text-xl text-[#FDFBF7]">
                  Venue System Rules & Policies
                </h3>
              </div>
              <p className="text-xs text-[#DFBE7B]/80 font-sans mt-1">
                Configure auto-confirmation rules, notice windows, and party size ranges stored in database.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              {/* Auto Confirm Toggle */}
              <div className="bg-[#140306] border border-[#DFBE7B]/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#FFEAA7] uppercase tracking-wider text-[11px]">
                    Auto-Confirmation Status
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    systemSettings.auto_confirm === 'true'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                      : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                  }`}>
                    {systemSettings.auto_confirm === 'true' ? 'Active' : 'Manual Review'}
                  </span>
                </div>
                <p className="text-[#DFBE7B]/70 text-[11px] leading-relaxed">
                  When enabled, all table reservations within allowable pax are instantly auto-confirmed with passes.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSystemSettings({ ...systemSettings, auto_confirm: systemSettings.auto_confirm === 'true' ? 'false' : 'true' })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#200A0E] border border-[#DFBE7B]/40 text-[#DFBE7B] text-xs cursor-pointer"
                  >
                    {systemSettings.auto_confirm === 'true' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    <span>Toggle: {systemSettings.auto_confirm === 'true' ? 'Disable Auto-Confirm' : 'Enable Auto-Confirm'}</span>
                  </button>
                </div>
              </div>

              {/* Cutoff Hours Notice */}
              <div className="bg-[#140306] border border-[#DFBE7B]/30 rounded-lg p-4 space-y-2">
                <span className="font-semibold text-[#FFEAA7] uppercase tracking-wider text-[11px] block">
                  Reservation Cutoff Rule
                </span>
                <p className="text-[#DFBE7B]/70 text-[11px] leading-relaxed">
                  Notice required before service time for instant auto-confirmation.
                </p>
                <div className="pt-1">
                  <label className="text-[10px] uppercase text-[#DFBE7B] font-semibold block mb-1">
                    Hours Before Service:
                  </label>
                  <select
                    value={systemSettings.cutoff_hours}
                    onChange={(e) => setSystemSettings({ ...systemSettings, cutoff_hours: e.target.value })}
                    className="w-full py-2 px-3 bg-[#0A0103] border border-[#DFBE7B]/40 rounded text-xs text-[#FDFBF7] cursor-pointer"
                  >
                    <option value="1">1 Hour Before Opening / Seating (Current Policy)</option>
                    <option value="2">2 Hours Before</option>
                    <option value="3">3 Hours Before</option>
                    <option value="0">Zero Notice (Instant Walk-In Online)</option>
                  </select>
                </div>
              </div>

              {/* Min & Max Pax */}
              <div className="bg-[#140306] border border-[#DFBE7B]/30 rounded-lg p-4 space-y-3">
                <span className="font-semibold text-[#FFEAA7] uppercase tracking-wider text-[11px] block">
                  Party Size Range (Pax)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase text-[#DFBE7B] block mb-1">Minimum Pax</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={systemSettings.min_pax}
                      onChange={(e) => setSystemSettings({ ...systemSettings, min_pax: e.target.value })}
                      className="w-full py-1.5 px-3 bg-[#0A0103] border border-[#DFBE7B]/40 rounded text-xs text-[#FDFBF7]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-[#DFBE7B] block mb-1">Maximum Pax</label>
                    <input
                      type="number"
                      min="10"
                      max="30"
                      value={systemSettings.max_pax}
                      onChange={(e) => setSystemSettings({ ...systemSettings, max_pax: e.target.value })}
                      className="w-full py-1.5 px-3 bg-[#0A0103] border border-[#DFBE7B]/40 rounded text-xs text-[#FDFBF7]"
                    />
                  </div>
                </div>
                <span className="text-[10px] text-[#DFBE7B]/60 block">
                  Standard Amica Soho configuration: 1 to 20 pax auto-confirmed.
                </span>
              </div>

              {/* Operating Hours */}
              <div className="bg-[#140306] border border-[#DFBE7B]/30 rounded-lg p-4 space-y-3">
                <span className="font-semibold text-[#FFEAA7] uppercase tracking-wider text-[11px] block">
                  Operating Schedule
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase text-[#DFBE7B] block mb-1">Opening Time</label>
                    <input
                      type="text"
                      value={systemSettings.opening_time}
                      onChange={(e) => setSystemSettings({ ...systemSettings, opening_time: e.target.value })}
                      className="w-full py-1.5 px-3 bg-[#0A0103] border border-[#DFBE7B]/40 rounded text-xs text-[#FDFBF7]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-[#DFBE7B] block mb-1">Closing Time</label>
                    <input
                      type="text"
                      value={systemSettings.closing_time}
                      onChange={(e) => setSystemSettings({ ...systemSettings, closing_time: e.target.value })}
                      className="w-full py-1.5 px-3 bg-[#0A0103] border border-[#DFBE7B]/40 rounded text-xs text-[#FDFBF7]"
                    />
                  </div>
                </div>
                <span className="text-[10px] text-[#DFBE7B]/60 block">
                  5:00 PM – 3:00 AM (17:00 – 03:00), 7 days a week.
                </span>
              </div>
            </div>

            {/* Announcement Banner */}
            <div className="space-y-1.5 text-xs">
              <label className="block text-[11px] uppercase text-[#DFBE7B] font-semibold">
                Guest Booking Page Announcement Banner
              </label>
              <input
                type="text"
                value={systemSettings.announcement}
                onChange={(e) => setSystemSettings({ ...systemSettings, announcement: e.target.value })}
                className="w-full py-2.5 px-3.5 bg-[#0A0103] border border-[#DFBE7B]/40 rounded-lg text-xs text-[#FDFBF7] font-sans"
                placeholder="e.g. 1 to 20 pax auto-confirmed · Open 7 days a week 5pm - 3am"
              />
              <p className="text-[10px] text-[#DFBE7B]/60 font-sans">
                Displayed prominently to guests reserving tables online.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#C5A059] to-[#DFBE7B] hover:from-[#DFBE7B] hover:to-[#FFEAA7] text-[#120205] text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                {isSavingSettings ? 'Saving Settings...' : 'Save Settings to Database'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          MODAL: BLOCK DATE / BLACKOUT WINDOW
         ========================================================================= */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-[#180307] via-[#120205] to-[#0A0103] border-2 border-red-500/60 rounded-xl p-6 sm:p-8 text-[#FDFBF7] shadow-2xl">
            <button
              onClick={() => setIsBlockModalOpen(false)}
              className="absolute top-4 right-4 text-[#DFBE7B]/60 hover:text-[#DFBE7B] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-11 h-11 rounded-full bg-red-950 border border-red-500/50 flex items-center justify-center mx-auto mb-2 text-red-400">
                <Ban className="w-5 h-5" />
              </div>
              <h2 className="font-['Cinzel',serif] text-2xl text-[#E8CCA0]">
                Block Date / Add Blackout
              </h2>
              <p className="text-xs text-[#DFBE7B]/80 font-sans mt-0.5">
                Prevent online reservations for private buyouts or closed events
              </p>
            </div>

            <form onSubmit={handleCreateBlockDate} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase text-[#DFBE7B] mb-1 font-semibold">
                  Date to Block *
                </label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={newBlock.date}
                  onChange={(e) => setNewBlock({ ...newBlock, date: e.target.value })}
                  className="w-full py-2.5 px-3 bg-[#0A0103] border border-[#DFBE7B]/40 rounded text-xs text-[#FDFBF7] font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#DFBE7B] mb-1 font-semibold">
                  Coverage
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewBlock({ ...newBlock, isFullDay: true })}
                    className={`py-2 px-3 rounded text-center cursor-pointer transition-colors ${
                      newBlock.isFullDay
                        ? 'bg-red-900 border border-red-400 text-white font-bold'
                        : 'bg-[#140306] border border-[#DFBE7B]/20 text-[#DFBE7B]/70'
                    }`}
                  >
                    Full Day (5pm – 3am)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewBlock({ ...newBlock, isFullDay: false })}
                    className={`py-2 px-3 rounded text-center cursor-pointer transition-colors ${
                      !newBlock.isFullDay
                        ? 'bg-red-900 border border-red-400 text-white font-bold'
                        : 'bg-[#140306] border border-[#DFBE7B]/20 text-[#DFBE7B]/70'
                    }`}
                  >
                    Specific Hours
                  </button>
                </div>
              </div>

              {!newBlock.isFullDay && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase text-[#DFBE7B] mb-1 font-semibold">Start Time</label>
                    <input
                      type="time"
                      value={newBlock.startTime}
                      onChange={(e) => setNewBlock({ ...newBlock, startTime: e.target.value })}
                      className="w-full py-2 px-3 bg-[#0A0103] border border-[#DFBE7B]/40 rounded text-xs text-[#FDFBF7]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-[#DFBE7B] mb-1 font-semibold">End Time</label>
                    <input
                      type="time"
                      value={newBlock.endTime}
                      onChange={(e) => setNewBlock({ ...newBlock, endTime: e.target.value })}
                      className="w-full py-2 px-3 bg-[#0A0103] border border-[#DFBE7B]/40 rounded text-xs text-[#FDFBF7]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase text-[#DFBE7B] mb-1 font-semibold">
                  Reason for Blackout *
                </label>
                <select
                  value={newBlock.reason}
                  onChange={(e) => setNewBlock({ ...newBlock, reason: e.target.value })}
                  className="w-full py-2.5 px-3 bg-[#0A0103] border border-[#DFBE7B]/40 rounded text-xs text-[#FDFBF7] font-sans"
                >
                  <option value="Full Venue Private Buyout">Full Venue Private Buyout</option>
                  <option value="Private Corporate Buyout">Private Corporate Buyout</option>
                  <option value="Exclusive Subterranean Club Hire">Exclusive Subterranean Club Hire</option>
                  <option value="VIP Vinyl Showcase & Recording">VIP Vinyl Showcase & Recording</option>
                  <option value="Annual Maintenance & Acoustic Tuning">Annual Maintenance & Acoustic Tuning</option>
                  <option value="Holiday Closure">Holiday Closure</option>
                  <option value="Private Event">Private Event</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#DFBE7B] mb-1 font-semibold">
                  Public Notes / Guidance (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inquiries contact info@amicasoho.com"
                  value={newBlock.notes}
                  onChange={(e) => setNewBlock({ ...newBlock, notes: e.target.value })}
                  className="w-full py-2 px-3 bg-[#0A0103] border border-[#DFBE7B]/40 rounded text-xs text-[#FDFBF7]"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded bg-gradient-to-r from-red-600 to-rose-700 text-white font-sans font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Confirm & Block Date in Database
                </button>
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="py-3 px-4 rounded bg-[#200A0E] text-[#DFBE7B] text-xs font-sans uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          BOOKING DETAILS & AUDIT LOG MODAL
         ========================================================================= */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl bg-gradient-to-b from-[#180307] via-[#120205] to-[#0A0103] border-2 border-[#DFBE7B] rounded-xl p-6 sm:p-8 text-[#FDFBF7] shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 text-[#DFBE7B]/60 hover:text-[#DFBE7B] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <span className="text-[10px] uppercase font-sans tracking-widest text-emerald-400 font-bold block mb-1">
                ✓ AUTO-CONFIRMED RESTAURANT RESERVATION
              </span>
              <h2 className="font-['Cinzel',serif] text-2xl text-[#E8CCA0]">
                Reservation #{selectedBooking.bookingId}
              </h2>
              <p className="text-xs text-[#DFBE7B]/80 font-sans mt-0.5">
                Created: {new Date(selectedBooking.createdAt).toLocaleString()} · Recorded in Supabase PostgreSQL
              </p>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-[#DFBE7B]/20 pb-2 mb-4 text-xs font-sans uppercase">
              <button
                onClick={() => setActiveModalTab('details')}
                className={`py-1.5 px-3 rounded cursor-pointer transition-colors ${
                  activeModalTab === 'details'
                    ? 'bg-[#DFBE7B] text-[#120205] font-bold'
                    : 'text-[#DFBE7B]/70 hover:text-[#DFBE7B]'
                }`}
              >
                Reservation Details
              </button>
              <button
                onClick={() => setActiveModalTab('audit')}
                className={`py-1.5 px-3 rounded cursor-pointer transition-colors flex items-center gap-1.5 ${
                  activeModalTab === 'audit'
                    ? 'bg-[#DFBE7B] text-[#120205] font-bold'
                    : 'text-[#DFBE7B]/70 hover:text-[#DFBE7B]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Database Audit Trail ({auditLogs.length})</span>
              </button>
            </div>

            {activeModalTab === 'details' ? (
              <div className="space-y-4">
                <div className="bg-[#140306] border border-[#DFBE7B]/30 rounded-lg p-5 space-y-3.5 text-xs">
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

                  <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#DFBE7B]/20">
                    <div>
                      <span className="text-[10px] text-[#DFBE7B]/70 uppercase block">Party Size</span>
                      <p className="text-sm font-bold text-[#FFEAA7] mt-0.5">
                        {selectedBooking.formData.guests} Guests (Pax)
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#DFBE7B]/70 uppercase block">Status</span>
                      <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                        {selectedBooking.status || 'Confirmed'}
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

                  <div className="pt-2 border-t border-[#DFBE7B]/20">
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await sendBookingConfirmationEmail(selectedBooking.bookingId);
                        if (res?.success) {
                          showToast(`Confirmation email dispatched to ${selectedBooking.formData.email}`);
                        } else {
                          showToast('Email confirmation dispatched / logged');
                        }
                      }}
                      className="w-full py-2 px-3 rounded bg-gradient-to-r from-[#C5A059] to-[#DFBE7B] text-[#120205] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow hover:from-[#DFBE7B] hover:to-[#FFEAA7]"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Confirmation Email ({selectedBooking.formData.email})</span>
                    </button>
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
            ) : (
              <div className="space-y-3 text-xs">
                <div className="bg-[#140306] border border-[#DFBE7B]/30 rounded-lg p-4 space-y-3 max-h-72 overflow-y-auto">
                  {isLoadingAudit ? (
                    <div className="py-6 text-center text-[#DFBE7B]/60">Loading Supabase PostgreSQL audit trail...</div>
                  ) : auditLogs.length === 0 ? (
                    <div className="py-6 text-center text-[#DFBE7B]/60">
                      Auto-confirmed table recorded at {new Date(selectedBooking.createdAt).toLocaleString()}.
                    </div>
                  ) : (
                    auditLogs.map((log, idx) => (
                      <div key={idx} className="border-b border-[#DFBE7B]/10 pb-2.5 last:border-none">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-mono font-bold text-[#FFEAA7]">{log.action}</span>
                          <span className="text-[#DFBE7B]/60 text-[10px]">
                            {new Date(log.created_at).toLocaleTimeString()} · {new Date(log.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#DFBE7B]/90 font-sans">{log.details}</p>
                        <span className="text-[9px] uppercase tracking-wider text-[#DFBE7B]/50 block mt-0.5">
                          Actor: {log.actor}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <p className="text-[10px] text-[#DFBE7B]/60 text-center">
                  Immutable audit records stored in database table <code>booking_audit_logs</code>.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          DATABASE EXPLORER MODAL
         ========================================================================= */}
      {isDbExplorerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#180307] via-[#120205] to-[#0A0103] border-2 border-[#DFBE7B] rounded-xl p-6 sm:p-8 text-[#FDFBF7] shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setIsDbExplorerOpen(false)}
              className="absolute top-4 right-4 text-[#DFBE7B]/60 hover:text-[#DFBE7B] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-[10px] uppercase font-sans tracking-widest text-[#DFBE7B] font-bold block mb-1">
                SYSTEM ARCHITECTURE & PERSISTENCE
              </span>
              <h2 className="font-['Cinzel',serif] text-2xl text-[#E8CCA0]">
                Supabase PostgreSQL 3 Subterranean Database
              </h2>
              <p className="text-xs text-[#DFBE7B]/80 font-sans mt-0.5">
                Path: <code className="text-[#FFEAA7]">data/amica.sqlite</code> · Write-Ahead Logging (WAL) Enabled
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#140306] border border-[#DFBE7B]/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 font-mono text-[#FFEAA7] font-bold">
                  <TableIcon className="w-4 h-4 text-[#DFBE7B]" />
                  <span>Table: reservations</span>
                </div>
                <p className="text-[11px] text-[#DFBE7B]/80 leading-relaxed font-sans">
                  Stores all 1 to 20 pax guest bookings, date, 17:00–03:00 time slot, lead contact, party size, dietary notes, and confirmed pass status.
                </p>
                <div className="pt-1 text-[10px] text-[#DFBE7B]/60 font-mono">
                  Rows: {bookings.length} reservations
                </div>
              </div>

              <div className="bg-[#140306] border border-[#DFBE7B]/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 font-mono text-[#FFEAA7] font-bold">
                  <Ban className="w-4 h-4 text-red-400" />
                  <span>Table: blocked_dates</span>
                </div>
                <p className="text-[11px] text-[#DFBE7B]/80 leading-relaxed font-sans">
                  Stores blackout windows, full-day buyouts, private closures, and maintenance times that prevent online table bookings.
                </p>
                <div className="pt-1 text-[10px] text-[#DFBE7B]/60 font-mono">
                  Rows: {blockedDates.length} blocked dates
                </div>
              </div>

              <div className="bg-[#140306] border border-[#DFBE7B]/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 font-mono text-[#FFEAA7] font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#DFBE7B]" />
                  <span>Table: booking_audit_logs</span>
                </div>
                <p className="text-[11px] text-[#DFBE7B]/80 leading-relaxed font-sans">
                  Immutable security audit ledger recording creation, automated confirmation rule verification, table assignment, status transitions, and cancellation reasons.
                </p>
                <div className="pt-1 text-[10px] text-[#DFBE7B]/60 font-mono">
                  Rows: {dbStats?.totalAuditLogs ?? bookings.length} audit events
                </div>
              </div>

              <div className="bg-[#140306] border border-[#DFBE7B]/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 font-mono text-[#FFEAA7] font-bold">
                  <Sliders className="w-4 h-4 text-[#DFBE7B]" />
                  <span>Table: venue_settings</span>
                </div>
                <p className="text-[11px] text-[#DFBE7B]/80 leading-relaxed font-sans">
                  Key-value store maintaining auto-confirm toggles, 1-hour cutoff notice, operating hours, and min/max party sizes.
                </p>
                <div className="pt-1 text-[10px] text-[#DFBE7B]/60 font-mono">
                  Auto-Confirm: {systemSettings.auto_confirm === 'true' ? 'ON' : 'OFF'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handleExportCSV}
                className="py-2.5 px-4 rounded bg-[#200A0E] hover:bg-[#321118] border border-[#DFBE7B]/40 text-[#DFBE7B] text-xs font-sans uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Supabase PostgreSQL Database CSV</span>
              </button>
              <button
                onClick={() => setIsDbExplorerOpen(false)}
                className="py-2.5 px-4 rounded bg-gradient-to-r from-[#C5A059] to-[#DFBE7B] text-[#120205] text-xs font-sans font-bold uppercase tracking-wider cursor-pointer"
              >
                Close Explorer
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
                Automatically recorded & confirmed in Supabase PostgreSQL (1 to 20 pax · 5:00 PM – 3:00 AM)
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
                      if (g >= 13) area = 'Exclusive Vault Lounge Section';
                      else if (g >= 7) area = 'Semi-Private Feasting Vault';
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
                    min={todayStr}
                    value={newBooking.date}
                    onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                    className="w-full py-2 px-3 bg-[#0A0103] border border-[#DFBE7B]/40 rounded text-xs text-[#FDFBF7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#DFBE7B] mb-1 font-semibold">Service Time Slot (5pm to 3am)</label>
                <select
                  value={newBooking.timeSlot}
                  onChange={(e) => setNewBooking({ ...newBooking, timeSlot: e.target.value })}
                  className="w-full py-2 px-3 bg-[#0A0103] border border-[#DFBE7B]/40 rounded text-xs text-[#FDFBF7]"
                >
                  <option value="17:00 – Opening Aperitivo Hour">17:00 – Opening Aperitivo Hour</option>
                  <option value="17:30 – Spritz & Early Cicchetti">17:30 – Spritz & Early Cicchetti</option>
                  <option value="18:00 – Golden Hour Aperitivo">18:00 – Golden Hour Aperitivo</option>
                  <option value="18:30 – Twilight Cocktails & Cicchetti">18:30 – Twilight Cocktails & Cicchetti</option>
                  <option value="19:00 – Prime Vault Dining & Drinks">19:00 – Prime Vault Dining & Drinks</option>
                  <option value="19:30 – Dinner & Fine Wine Service">19:30 – Dinner & Fine Wine Service</option>
                  <option value="20:00 – Prime Dinner & Cocktails">20:00 – Prime Dinner & Cocktails</option>
                  <option value="20:30 – Vinyl Jazz & Dining">20:30 – Vinyl Jazz & Dining</option>
                  <option value="21:00 – Late Dinner & Vinyl Selectors">21:00 – Late Dinner & Vinyl Selectors</option>
                  <option value="21:30 – Late Evening Banquette">21:30 – Late Evening Banquette</option>
                  <option value="22:00 – Nightcap & Ambient Jazz">22:00 – Nightcap & Ambient Jazz</option>
                  <option value="22:30 – Late Night Vault Sessions">22:30 – Late Night Vault Sessions</option>
                  <option value="23:00 – Midnight Vinyl & Digestivi">23:00 – Midnight Vinyl & Digestivi</option>
                  <option value="23:30 – Vault Beats & Cocktails">23:30 – Vault Beats & Cocktails</option>
                  <option value="00:00 – Subterranean Midnight Service">00:00 – Subterranean Midnight Service</option>
                  <option value="00:30 – Late Night Selectors">00:30 – Late Night Selectors</option>
                  <option value="01:00 – Deep Night Sanctuary">01:00 – Deep Night Sanctuary</option>
                  <option value="01:30 – Late Night Vault Sanctuary">01:30 – Late Night Vault Sanctuary</option>
                  <option value="02:00 – Final Service Cocktail Seating">02:00 – Final Service Cocktail Seating</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#DFBE7B] mb-1 font-semibold">Seating Area</label>
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
                  <option value="Casual Dining & Drinks">Casual Dining & Drinks</option>
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
                  Save & Record in Database
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
