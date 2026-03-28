import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { syncCalendar, syncAllCalendarsForBarber } from '@/lib/calendar-sync'

// GET - Get sync status/history for a barber
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const barberId = url.searchParams.get('barber_id')
  const connectionId = url.searchParams.get('connection_id')
  const limit = parseInt(url.searchParams.get('limit') || '10')

  if (!barberId && !connectionId) {
    return NextResponse.json({ error: 'barber_id or connection_id required' }, { status: 400 })
  }

  // Get sync history
  let query = supabaseAdmin
    .from('calendar_sync_log')
    .select(`
      id,
      sync_type,
      sync_direction,
      events_imported,
      events_exported,
      events_updated,
      events_deleted,
      status,
      error_message,
      started_at,
      completed_at
    `)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (barberId) {
    query = query.eq('barber_id', barberId)
  }
  if (connectionId) {
    query = query.eq('calendar_connection_id', connectionId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

// POST - Trigger a calendar sync
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { barber_id, connection_id, sync_type = 'incremental' } = body

  // Validate sync_type
  if (!['full', 'incremental', 'manual'].includes(sync_type)) {
    return NextResponse.json({ error: 'Invalid sync_type' }, { status: 400 })
  }

  try {
    if (connection_id) {
      // Sync a specific connection
      const result = await syncCalendar(connection_id, sync_type)

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        synced: result.events_exported,
        imported: result.events_imported,
        updated: result.events_updated,
        deleted: result.events_deleted,
      })
    } else if (barber_id) {
      // Sync all connections for a barber
      const results = await syncAllCalendarsForBarber(barber_id)

      const totals = results.reduce(
        (acc, r) => ({
          synced: acc.synced + r.events_exported,
          imported: acc.imported + r.events_imported,
          updated: acc.updated + r.events_updated,
          deleted: acc.deleted + r.events_deleted,
          errors: acc.errors + (r.success ? 0 : 1),
        }),
        { synced: 0, imported: 0, updated: 0, deleted: 0, errors: 0 }
      )

      return NextResponse.json({
        success: totals.errors === 0,
        connections_synced: results.length,
        ...totals,
      })
    } else {
      return NextResponse.json({ error: 'barber_id or connection_id required' }, { status: 400 })
    }
  } catch (err) {
    console.error('Sync error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Sync failed' },
      { status: 500 }
    )
  }
}

// DELETE - Clear sync data (for debugging/reset)
export async function DELETE(request: NextRequest) {
  const url = new URL(request.url)
  const barberId = url.searchParams.get('barber_id')
  const connectionId = url.searchParams.get('connection_id')
  const clearEvents = url.searchParams.get('clear_events') === 'true'

  if (!barberId && !connectionId) {
    return NextResponse.json({ error: 'barber_id or connection_id required' }, { status: 400 })
  }

  try {
    // Clear sync logs
    let logQuery = supabaseAdmin.from('calendar_sync_log').delete()

    if (barberId) {
      logQuery = logQuery.eq('barber_id', barberId)
    }
    if (connectionId) {
      logQuery = logQuery.eq('calendar_connection_id', connectionId)
    }

    await logQuery

    // Optionally clear synced events
    if (clearEvents) {
      let eventsQuery = supabaseAdmin
        .from('calendar_events')
        .delete()
        .eq('is_synced', true)

      if (barberId) {
        eventsQuery = eventsQuery.eq('barber_id', barberId)
      }
      if (connectionId) {
        eventsQuery = eventsQuery.eq('external_calendar_id', connectionId)
      }

      await eventsQuery
    }

    // Reset sync token if clearing a specific connection
    if (connectionId) {
      await supabaseAdmin
        .from('calendar_connections')
        .update({
          sync_token: null,
          last_sync_at: null,
          last_sync_status: null,
          last_sync_error: null,
        })
        .eq('id', connectionId)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to clear sync data' },
      { status: 500 }
    )
  }
}
