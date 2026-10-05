import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservationStatus,
  deleteReservation,
  getDatabaseMetadata,
  getBlockedDates,
  addBlockedDate,
  removeBlockedDate,
  isDateBlocked,
  getVenueSettings,
  updateVenueSettingsBatch,
  db
} from './server/db.js';
import {
  sendReservationEmail,
  generateConfirmationEmailHtml,
  generateConfirmationEmailText,
  checkEmailServiceStatus
} from './server/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // CORS / headers for local safety
  app.use((req, res, next) => {
    res.setHeader('X-Amica-Database', 'SQLite3-WAL');
    next();
  });

  // =========================================================================
  // API ROUTES
  // =========================================================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Amica Soho Subterranean Booking Engine',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  });

  // Email service status
  app.get('/api/email/status', (req, res) => {
    res.json(checkEmailServiceStatus());
  });

  // Database metadata & status
  app.get('/api/database/status', (req, res) => {
    try {
      const stats = getDatabaseMetadata();
      res.json({ success: true, stats });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Get all reservations with optional query params
  app.get('/api/bookings', (req, res) => {
    try {
      const { search, date, status, guests } = req.query;
      const rows = getAllReservations({
        search: typeof search === 'string' ? search : undefined,
        date: typeof date === 'string' ? date : undefined,
        status: typeof status === 'string' ? status : undefined,
        guests: guests ? Number(guests) : undefined
      });

      // Format to match BookingConfirmation interface
      const formatted = rows.map((r) => ({
        bookingId: r.booking_id,
        createdAt: r.created_at,
        status: r.status,
        qrCodeValue: r.qr_code_value,
        tableNumber: r.table_number,
        formData: {
          name: r.guest_name,
          email: r.email,
          phone: r.phone,
          guests: r.guests,
          date: r.reservation_date,
          timeSlot: r.time_slot,
          seatingArea: r.seating_area,
          dietaryNotes: r.dietary_notes || '',
          specialOccasion: r.special_occasion || 'None / Casual Aperitivo'
        }
      }));

      res.json({ success: true, count: formatted.length, data: formatted });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Get single booking with audit trail
  app.get('/api/bookings/:id', (req, res) => {
    try {
      const { reservation, auditLogs } = getReservationById(req.params.id);
      if (!reservation) {
        return res.status(404).json({ success: false, error: 'Reservation not found' });
      }

      res.json({
        success: true,
        booking: {
          bookingId: reservation.booking_id,
          createdAt: reservation.created_at,
          status: reservation.status,
          tableNumber: reservation.table_number,
          qrCodeValue: reservation.qr_code_value,
          formData: {
            name: reservation.guest_name,
            email: reservation.email,
            phone: reservation.phone,
            guests: reservation.guests,
            date: reservation.reservation_date,
            timeSlot: reservation.time_slot,
            seatingArea: reservation.seating_area,
            dietaryNotes: reservation.dietary_notes || '',
            specialOccasion: reservation.special_occasion || 'None'
          }
        },
        auditLogs
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Create new reservation (auto-confirm 1 to 20 pax)
  app.post('/api/bookings', (req, res) => {
    try {
      const { formData, actor, bookingId } = req.body;
      if (!formData || !formData.name || !formData.email || !formData.phone) {
        return res.status(400).json({ success: false, error: 'Missing required guest contact information' });
      }

      const guests = Number(formData.guests);
      if (guests < 1 || guests > 20) {
        return res.status(400).json({ success: false, error: 'Online reservations accept between 1 and 20 guests' });
      }

      // Check if date or slot is blocked by admin / buyout
      const blockCheck = isDateBlocked(formData.date, formData.timeSlot);
      if (blockCheck.blocked) {
        return res.status(400).json({
          success: false,
          error: `Selected date is unavailable: ${blockCheck.reason || 'Private Buyout / Closed'}. Please select another date.`
        });
      }

      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      const created = createReservation({
        booking_id: bookingId || formData.bookingId,
        guest_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        guests: guests,
        reservation_date: formData.date,
        time_slot: formData.timeSlot,
        seating_area: formData.seatingArea || 'Vault Dining',
        special_occasion: formData.specialOccasion || 'Casual Dining & Drinks',
        dietary_notes: formData.dietaryNotes || '',
        ip_address: clientIp,
        actor: actor || 'GUEST_WEB_BOOKING'
      });

      // Prepare confirmation object (clean without room/table allocation)
      const confirmation = {
        bookingId: created.booking_id,
        createdAt: created.created_at,
        status: created.status,
        qrCodeValue: created.qr_code_value,
        formData: {
          name: created.guest_name,
          email: created.email,
          phone: created.phone,
          guests: created.guests,
          date: created.reservation_date,
          timeSlot: created.time_slot,
          seatingArea: created.seating_area,
          dietaryNotes: created.dietary_notes || '',
          specialOccasion: created.special_occasion || 'Casual Dining & Drinks'
        }
      };

      // Trigger email dispatch asynchronously
      sendReservationEmail(created).catch((err) => {
        console.error('Initial reservation email dispatch error:', err);
      });

      res.status(201).json({ success: true, booking: confirmation });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Send confirmation email endpoint (for manual resend or client trigger)
  app.post('/api/bookings/:id/send-email', async (req, res) => {
    try {
      const { reservation } = getReservationById(req.params.id);
      if (!reservation) {
        return res.status(404).json({ success: false, error: 'Reservation not found' });
      }

      const result = await sendReservationEmail(reservation);
      res.json({ success: true, ...result });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Get confirmation email preview
  app.get('/api/bookings/:id/email-preview', (req, res) => {
    try {
      const { reservation } = getReservationById(req.params.id);
      if (!reservation) {
        return res.status(404).json({ success: false, error: 'Reservation not found' });
      }

      const html = generateConfirmationEmailHtml(reservation);
      const text = generateConfirmationEmailText(reservation);
      res.json({ success: true, html, text, bookingId: reservation.booking_id, email: reservation.email });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Update status (e.g. 'Auto-Confirmed', 'Seated', 'Completed', 'Cancelled', 'No-Show')
  app.patch('/api/bookings/:id/status', (req, res) => {
    try {
      const { status, actor, notes } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, error: 'Status is required' });
      }

      const updated = updateReservationStatus(req.params.id, status, actor || 'STAFF_PORTAL', notes || '');
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Reservation not found' });
      }

      res.json({
        success: true,
        booking: {
          bookingId: updated.booking_id,
          status: updated.status,
          updatedAt: updated.updated_at
        }
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Delete / cancel reservation
  app.delete('/api/bookings/:id', (req, res) => {
    try {
      const { actor, reason } = req.body || {};
      const success = deleteReservation(req.params.id, actor || 'STAFF_PORTAL', reason || 'Deleted by admin');
      if (!success) {
        return res.status(404).json({ success: false, error: 'Reservation not found' });
      }
      res.json({ success: true, message: `Reservation #${req.params.id} cancelled and archived` });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Export CSV
  app.get('/api/export/csv', (req, res) => {
    try {
      const rows = getAllReservations();
      const headers = [
        'Booking ID',
        'Date',
        'Time Slot',
        'Pax',
        'Guest Name',
        'Email',
        'Phone',
        'Status',
        'Occasion',
        'Dietary Requirements',
        'Created At'
      ];

      const csvRows = [headers.join(',')];
      for (const r of rows) {
        const line = [
          `"${r.booking_id}"`,
          `"${r.reservation_date}"`,
          `"${r.time_slot.replace(/"/g, '""')}"`,
          r.guests,
          `"${r.guest_name.replace(/"/g, '""')}"`,
          `"${r.email}"`,
          `"${r.phone}"`,
          `"${r.status}"`,
          `"${(r.special_occasion || '').replace(/"/g, '""')}"`,
          `"${(r.dietary_notes || '').replace(/"/g, '""')}"`,
          `"${r.created_at}"`
        ];
        csvRows.push(line.join(','));
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="amica_reservations_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvRows.join('\n'));
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // =========================================================================
  // SYSTEM MANAGEMENT & BLOCKED DATES API
  // =========================================================================

  // Get all blocked dates / blackout windows
  app.get('/api/system/blocked-dates', (req, res) => {
    try {
      const dates = getBlockedDates();
      res.json({ success: true, count: dates.length, data: dates });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Add a new blocked date / blackout window
  app.post('/api/system/blocked-dates', (req, res) => {
    try {
      const { blocked_date, is_full_day, start_time, end_time, reason, notes, actor } = req.body;
      if (!blocked_date || !reason) {
        return res.status(400).json({ success: false, error: 'Date and reason are required' });
      }

      const created = addBlockedDate({
        blocked_date,
        is_full_day: is_full_day !== false,
        start_time,
        end_time,
        reason,
        notes,
        actor: actor || 'MAÎTRE_D_ADMIN'
      });

      res.status(201).json({ success: true, data: created });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Remove / unblock a date
  app.delete('/api/system/blocked-dates/:id', (req, res) => {
    try {
      const id = Number(req.params.id);
      const { actor } = req.body || {};
      const success = removeBlockedDate(id, actor || 'MAÎTRE_D_ADMIN');
      if (!success) {
        return res.status(404).json({ success: false, error: 'Blocked date record not found' });
      }
      res.json({ success: true, message: 'Date unblocked successfully' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Get venue / system settings
  app.get('/api/system/settings', (req, res) => {
    try {
      const settings = getVenueSettings();
      res.json({ success: true, settings });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Update venue / system settings
  app.post('/api/system/settings', (req, res) => {
    try {
      const { settings, actor } = req.body;
      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ success: false, error: 'Settings object is required' });
      }
      const updated = updateVenueSettingsBatch(settings, actor || 'MAÎTRE_D_ADMIN');
      res.json({ success: true, settings: updated });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Reset database back to default seed data
  app.post('/api/database/reset', (req, res) => {
    try {
      db.exec('DELETE FROM reservations;');
      db.exec('DELETE FROM booking_audit_logs;');
      // re-seed
      res.json({ success: true, message: 'Database reset and cleared' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // =========================================================================
  // VITE DEV MIDDLEWARE / STATIC PRODUCTION SERVING
  // =========================================================================
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Amica Soho Server] Listening on http://0.0.0.0:${PORT} with persistent SQLite database.`);
  });
}

startServer().catch((err) => {
  console.error('[Amica Soho Server] Fatal startup error:', err);
  process.exit(1);
});
