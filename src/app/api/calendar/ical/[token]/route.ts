import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Generate iCal format date
function formatICalDate(date: string, time: string): string {
  const dt = new Date(`${date}T${time}`)
  return dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

// Escape special characters for iCal
function escapeICalText(text: string | null): string {
  if (!text) return ''
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n')
}

// GET iCal feed for a barber
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  // Find barber by iCal token
  const { data: barber, error: barberError } = await supabaseAdmin
    .from('barbers')
    .select('id, name, shop_id, ical_enabled')
    .eq('ical_token', token)
    .single()

  if (barberError || !barber) {
    return new NextResponse('Calendar not found', { status: 404 })
  }

  if (!barber.ical_enabled) {
    return new NextResponse('Calendar feed is disabled', { status: 403 })
  }

  // Get shop info
  const { data: shop } = await supabaseAdmin
    .from('shops')
    .select('name, timezone')
    .eq('id', barber.shop_id)
    .single()

  // Get bookings for this barber (next 90 days)
  const today = new Date()
  const futureDate = new Date()
  futureDate.setDate(today.getDate() + 90)

  const { data: bookings } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      service:services(name)
    `)
    .eq('barber_id', barber.id)
    .gte('booking_date', today.toISOString().split('T')[0])
    .lte('booking_date', futureDate.toISOString().split('T')[0])
    .in('status', ['pending', 'confirmed'])
    .order('booking_date', { ascending: true })

  // Get blocked times
  const { data: blockedTimes } = await supabaseAdmin
    .from('blocked_times')
    .select('*')
    .or(`barber_id.eq.${barber.id},barber_id.is.null`)
    .gte('start_datetime', today.toISOString())

  // Build iCal content
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${shop?.name || 'Barber Shop'}//Booking Calendar//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${barber.name} - Appointments`,
    `X-WR-TIMEZONE:${shop?.timezone || 'America/New_York'}`,
  ]

  // Add bookings as events
  for (const booking of bookings || []) {
    const uid = `booking-${booking.id}@${shop?.name?.replace(/\s/g, '') || 'barbershop'}.com`
    const dtstart = formatICalDate(booking.booking_date, booking.start_time)
    const dtend = formatICalDate(booking.booking_date, booking.end_time)
    const created = new Date(booking.created_at).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${uid}`)
    lines.push(`DTSTAMP:${created}`)
    lines.push(`DTSTART:${dtstart}`)
    lines.push(`DTEND:${dtend}`)
    lines.push(`SUMMARY:${escapeICalText(booking.customer_name)} - ${escapeICalText(booking.service?.name || 'Appointment')}`)
    lines.push(`DESCRIPTION:Customer: ${escapeICalText(booking.customer_name)}\\nPhone: ${escapeICalText(booking.customer_phone)}\\nEmail: ${escapeICalText(booking.customer_email)}${booking.customer_notes ? `\\nNotes: ${escapeICalText(booking.customer_notes)}` : ''}`)
    lines.push(`STATUS:${booking.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE'}`)
    lines.push('END:VEVENT')
  }

  // Add blocked times as events
  for (const blocked of blockedTimes || []) {
    const uid = `blocked-${blocked.id}@${shop?.name?.replace(/\s/g, '') || 'barbershop'}.com`
    const startDt = new Date(blocked.start_datetime)
    const endDt = new Date(blocked.end_datetime)
    const dtstart = startDt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    const dtend = endDt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${uid}`)
    lines.push(`DTSTAMP:${dtstart}`)
    lines.push(`DTSTART:${dtstart}`)
    lines.push(`DTEND:${dtend}`)
    lines.push(`SUMMARY:${escapeICalText(blocked.reason || 'Blocked Time')}`)
    lines.push('STATUS:CONFIRMED')
    lines.push('TRANSP:OPAQUE')
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')

  const icalContent = lines.join('\r\n')

  return new NextResponse(icalContent, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${barber.name.replace(/\s/g, '_')}_calendar.ics"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
