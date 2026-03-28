/**
 * Calendar Sync Service
 * Handles two-way synchronization between the barber booking system and external calendars.
 *
 * Features:
 * - Import: Fetch events from external calendar and block time in booking system
 * - Export: Push bookings to external calendar
 * - Incremental sync using sync tokens
 * - Webhook support for real-time updates
 */

import { supabaseAdmin } from './supabase-admin'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET!

interface GoogleToken {
  access_token: string
  expires_in?: number
  refresh_token?: string
}

interface GoogleCalendarEvent {
  id: string
  summary?: string
  description?: string
  start: { dateTime?: string; date?: string; timeZone?: string }
  end: { dateTime?: string; date?: string; timeZone?: string }
  status: string
  recurrence?: string[]
}

interface CalendarConnection {
  id: string
  barber_id: string
  provider: 'google' | 'apple' | 'outlook' | 'ical_import'
  provider_calendar_id: string
  access_token: string
  refresh_token: string
  token_expires_at: string
  sync_token: string | null
  sync_direction: 'import' | 'export' | 'both'
}

interface SyncResult {
  success: boolean
  events_imported: number
  events_exported: number
  events_updated: number
  events_deleted: number
  error?: string
}

// ============================================================
// TOKEN MANAGEMENT
// ============================================================

export async function refreshGoogleToken(refreshToken: string): Promise<GoogleToken | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      console.error('Failed to refresh token:', await response.text())
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error refreshing token:', error)
    return null
  }
}

async function getValidAccessToken(connection: CalendarConnection): Promise<string | null> {
  const tokenExpiry = new Date(connection.token_expires_at)
  const now = new Date()

  // If token is still valid (with 5 minute buffer), return it
  if (tokenExpiry.getTime() - now.getTime() > 5 * 60 * 1000) {
    return connection.access_token
  }

  // Refresh the token
  const newToken = await refreshGoogleToken(connection.refresh_token)
  if (!newToken) {
    return null
  }

  // Update the token in the database
  const expiresAt = new Date(Date.now() + (newToken.expires_in || 3600) * 1000)
  await supabaseAdmin
    .from('calendar_connections')
    .update({
      access_token: newToken.access_token,
      token_expires_at: expiresAt.toISOString(),
    })
    .eq('id', connection.id)

  return newToken.access_token
}

// ============================================================
// IMPORT: Fetch events from external calendar
// ============================================================

export async function importGoogleCalendarEvents(
  connection: CalendarConnection,
  accessToken: string
): Promise<{ events: GoogleCalendarEvent[]; nextSyncToken: string | null }> {
  const calendarId = connection.provider_calendar_id || 'primary'
  let url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`

  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
  })

  // Use sync token for incremental sync, or fetch events from now onwards
  if (connection.sync_token) {
    params.set('syncToken', connection.sync_token)
  } else {
    // Full sync: get events from today onwards
    params.set('timeMin', new Date().toISOString())
    params.set('timeMax', new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()) // 90 days ahead
  }

  const response = await fetch(`${url}?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    // If sync token is invalid, do a full sync
    if (response.status === 410) {
      const fullParams = new URLSearchParams({
        singleEvents: 'true',
        orderBy: 'startTime',
        timeMin: new Date().toISOString(),
        timeMax: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      })
      const fullResponse = await fetch(`${url}?${fullParams}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!fullResponse.ok) {
        throw new Error(`Failed to fetch events: ${fullResponse.statusText}`)
      }
      const data = await fullResponse.json()
      return { events: data.items || [], nextSyncToken: data.nextSyncToken }
    }
    throw new Error(`Failed to fetch events: ${response.statusText}`)
  }

  const data = await response.json()
  return { events: data.items || [], nextSyncToken: data.nextSyncToken }
}

async function processImportedEvents(
  connection: CalendarConnection,
  events: GoogleCalendarEvent[]
): Promise<{ imported: number; updated: number; deleted: number }> {
  let imported = 0
  let updated = 0
  let deleted = 0

  // Get the shop_id for this barber
  const { data: barber } = await supabaseAdmin
    .from('barbers')
    .select('shop_id')
    .eq('id', connection.barber_id)
    .single()

  if (!barber) {
    throw new Error('Barber not found')
  }

  for (const event of events) {
    // Skip cancelled events (delete them if they exist)
    if (event.status === 'cancelled') {
      const { data: existing } = await supabaseAdmin
        .from('calendar_events')
        .delete()
        .eq('external_event_id', event.id)
        .eq('external_calendar_id', connection.id)

      if (existing) deleted++
      continue
    }

    // Parse event times
    const startsAt = event.start.dateTime || event.start.date
    const endsAt = event.end.dateTime || event.end.date
    const allDay = !event.start.dateTime

    if (!startsAt || !endsAt) continue

    // Check if event already exists
    const { data: existingEvent } = await supabaseAdmin
      .from('calendar_events')
      .select('id')
      .eq('external_event_id', event.id)
      .eq('external_calendar_id', connection.id)
      .single()

    const eventData = {
      barber_id: connection.barber_id,
      shop_id: barber.shop_id,
      title: event.summary || 'Busy',
      description: event.description || null,
      starts_at: startsAt,
      ends_at: endsAt,
      all_day: allDay,
      event_type: 'block' as const,
      blocks_bookings: true,
      external_event_id: event.id,
      external_calendar_id: connection.id,
      is_synced: true,
    }

    if (existingEvent) {
      // Update existing event
      await supabaseAdmin
        .from('calendar_events')
        .update(eventData)
        .eq('id', existingEvent.id)
      updated++
    } else {
      // Insert new event
      await supabaseAdmin
        .from('calendar_events')
        .insert(eventData)
      imported++
    }
  }

  return { imported, updated, deleted }
}

// ============================================================
// EXPORT: Push bookings to external calendar
// ============================================================

export async function exportBookingsToGoogle(
  connection: CalendarConnection,
  accessToken: string,
  bookingIds?: string[]
): Promise<{ exported: number; updated: number; failed: string[] }> {
  const calendarId = connection.provider_calendar_id || 'primary'
  let exported = 0
  let updated = 0
  const failed: string[] = []

  // Get barber's timezone
  const { data: barber } = await supabaseAdmin
    .from('barbers')
    .select('timezone, shop_id')
    .eq('id', connection.barber_id)
    .single()

  const { data: shop } = await supabaseAdmin
    .from('shops')
    .select('timezone')
    .eq('id', barber?.shop_id)
    .single()

  const timezone = barber?.timezone || shop?.timezone || 'America/New_York'

  // Build query for bookings to export
  let query = supabaseAdmin
    .from('bookings')
    .select(`
      id,
      customer_name,
      customer_email,
      customer_phone,
      booking_date,
      start_time,
      end_time,
      customer_notes,
      google_event_id,
      service:services(name)
    `)
    .eq('barber_id', connection.barber_id)
    .in('status', ['pending', 'confirmed'])

  if (bookingIds) {
    query = query.in('id', bookingIds)
  } else {
    // Export future bookings only
    query = query.gte('booking_date', new Date().toISOString().split('T')[0])
  }

  const { data: bookings, error } = await query

  if (error) {
    throw new Error(`Failed to fetch bookings: ${error.message}`)
  }

  for (const booking of bookings || []) {
    try {
      const startDateTime = `${booking.booking_date}T${booking.start_time}`
      const endDateTime = `${booking.booking_date}T${booking.end_time}`

      const serviceName = booking.service && typeof booking.service === 'object' && 'name' in booking.service
        ? (booking.service as { name: string }).name
        : 'Appointment'
      const event = {
        summary: `${booking.customer_name} - ${serviceName}`,
        description: `Customer: ${booking.customer_name}\nPhone: ${booking.customer_phone || 'N/A'}\nEmail: ${booking.customer_email || 'N/A'}\nNotes: ${booking.customer_notes || 'None'}`,
        start: {
          dateTime: startDateTime,
          timeZone: timezone,
        },
        end: {
          dateTime: endDateTime,
          timeZone: timezone,
        },
        reminders: {
          useDefault: false,
          overrides: [{ method: 'popup', minutes: 30 }],
        },
      }

      let response: Response
      let method: string

      if (booking.google_event_id) {
        // Update existing event
        response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${booking.google_event_id}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
          }
        )
        method = 'update'
      } else {
        // Create new event
        response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
          }
        )
        method = 'create'
      }

      if (response.ok) {
        const createdEvent = await response.json()

        // Save the Google event ID
        await supabaseAdmin
          .from('bookings')
          .update({ google_event_id: createdEvent.id })
          .eq('id', booking.id)

        if (method === 'create') {
          exported++
        } else {
          updated++
        }
      } else {
        console.error(`Failed to ${method} event:`, await response.text())
        failed.push(booking.id)
      }
    } catch (err) {
      console.error(`Error processing booking ${booking.id}:`, err)
      failed.push(booking.id)
    }
  }

  return { exported, updated, failed }
}

// ============================================================
// FULL SYNC
// ============================================================

export async function syncCalendar(
  connectionId: string,
  syncType: 'full' | 'incremental' | 'manual' = 'incremental'
): Promise<SyncResult> {
  // Get connection details
  const { data: connection, error: connError } = await supabaseAdmin
    .from('calendar_connections')
    .select('*')
    .eq('id', connectionId)
    .single()

  if (connError || !connection) {
    return {
      success: false,
      events_imported: 0,
      events_exported: 0,
      events_updated: 0,
      events_deleted: 0,
      error: 'Connection not found',
    }
  }

  // Create sync log entry
  const { data: syncLog } = await supabaseAdmin
    .from('calendar_sync_log')
    .insert({
      calendar_connection_id: connectionId,
      barber_id: connection.barber_id,
      sync_type: syncType,
      sync_direction: connection.sync_direction,
      status: 'started',
    })
    .select()
    .single()

  try {
    // Get valid access token
    const accessToken = await getValidAccessToken(connection)
    if (!accessToken) {
      throw new Error('Failed to get access token')
    }

    let result: SyncResult = {
      success: true,
      events_imported: 0,
      events_exported: 0,
      events_updated: 0,
      events_deleted: 0,
    }

    // Import events if sync direction is 'import' or 'both'
    if (connection.sync_direction === 'import' || connection.sync_direction === 'both') {
      if (syncType === 'full') {
        // Clear existing synced events for full sync
        await supabaseAdmin
          .from('calendar_events')
          .delete()
          .eq('external_calendar_id', connectionId)
      }

      const { events, nextSyncToken } = await importGoogleCalendarEvents(connection, accessToken)
      const importResult = await processImportedEvents(connection, events)

      result.events_imported = importResult.imported
      result.events_updated += importResult.updated
      result.events_deleted = importResult.deleted

      // Save sync token for next incremental sync
      if (nextSyncToken) {
        await supabaseAdmin
          .from('calendar_connections')
          .update({ sync_token: nextSyncToken })
          .eq('id', connectionId)
      }
    }

    // Export bookings if sync direction is 'export' or 'both'
    if (connection.sync_direction === 'export' || connection.sync_direction === 'both') {
      const exportResult = await exportBookingsToGoogle(connection, accessToken)
      result.events_exported = exportResult.exported
      result.events_updated += exportResult.updated
    }

    // Update connection with last sync info
    await supabaseAdmin
      .from('calendar_connections')
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: 'success',
        last_sync_error: null,
      })
      .eq('id', connectionId)

    // Update sync log
    if (syncLog) {
      await supabaseAdmin
        .from('calendar_sync_log')
        .update({
          status: 'success',
          events_imported: result.events_imported,
          events_exported: result.events_exported,
          events_updated: result.events_updated,
          events_deleted: result.events_deleted,
          completed_at: new Date().toISOString(),
        })
        .eq('id', syncLog.id)
    }

    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Update connection with error
    await supabaseAdmin
      .from('calendar_connections')
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: 'error',
        last_sync_error: errorMessage,
      })
      .eq('id', connectionId)

    // Update sync log
    if (syncLog) {
      await supabaseAdmin
        .from('calendar_sync_log')
        .update({
          status: 'error',
          error_message: errorMessage,
          completed_at: new Date().toISOString(),
        })
        .eq('id', syncLog.id)
    }

    return {
      success: false,
      events_imported: 0,
      events_exported: 0,
      events_updated: 0,
      events_deleted: 0,
      error: errorMessage,
    }
  }
}

// ============================================================
// SYNC ALL CONNECTIONS FOR A BARBER
// ============================================================

export async function syncAllCalendarsForBarber(barberId: string): Promise<SyncResult[]> {
  const { data: connections } = await supabaseAdmin
    .from('calendar_connections')
    .select('id')
    .eq('barber_id', barberId)
    .eq('is_active', true)

  if (!connections || connections.length === 0) {
    return []
  }

  const results: SyncResult[] = []
  for (const connection of connections) {
    const result = await syncCalendar(connection.id, 'incremental')
    results.push(result)
  }

  return results
}

// ============================================================
// DELETE EVENT FROM EXTERNAL CALENDAR
// ============================================================

export async function deleteGoogleCalendarEvent(
  connectionId: string,
  externalEventId: string
): Promise<boolean> {
  const { data: connection } = await supabaseAdmin
    .from('calendar_connections')
    .select('*')
    .eq('id', connectionId)
    .single()

  if (!connection) return false

  const accessToken = await getValidAccessToken(connection)
  if (!accessToken) return false

  const calendarId = connection.provider_calendar_id || 'primary'

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${externalEventId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    return response.ok || response.status === 404 // 404 means already deleted
  } catch {
    return false
  }
}
