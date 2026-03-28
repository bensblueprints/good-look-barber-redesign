import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET - Get calendar connections for a barber
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const barberId = url.searchParams.get('barber_id')

  if (!barberId) {
    return NextResponse.json({ error: 'Barber ID required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('calendar_connections')
    .select(`
      id,
      provider,
      provider_calendar_id,
      provider_calendar_name,
      sync_direction,
      last_sync_at,
      last_sync_status,
      last_sync_error,
      is_primary,
      is_active,
      created_at
    `)
    .eq('barber_id', barberId)
    .order('created_at')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

// POST - Create a calendar connection (usually called after OAuth callback)
export async function POST(request: NextRequest) {
  const body = await request.json()
  const {
    barber_id,
    provider,
    provider_calendar_id,
    provider_calendar_name,
    access_token,
    refresh_token,
    token_expires_at,
    sync_direction,
    is_primary
  } = body

  if (!barber_id || !provider) {
    return NextResponse.json({ error: 'barber_id and provider required' }, { status: 400 })
  }

  // If setting as primary, unset any existing primary for this barber
  if (is_primary) {
    await supabaseAdmin
      .from('calendar_connections')
      .update({ is_primary: false })
      .eq('barber_id', barber_id)
  }

  const { data, error } = await supabaseAdmin
    .from('calendar_connections')
    .upsert({
      barber_id,
      provider,
      provider_calendar_id,
      provider_calendar_name,
      access_token,
      refresh_token,
      token_expires_at,
      sync_direction: sync_direction || 'both',
      is_primary: is_primary ?? false,
      is_active: true,
      last_sync_status: 'pending',
    }, {
      onConflict: 'barber_id,provider,provider_calendar_id',
      ignoreDuplicates: false,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// PUT - Update a calendar connection
export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, sync_direction, is_primary, is_active } = body

  if (!id) {
    return NextResponse.json({ error: 'Connection ID required' }, { status: 400 })
  }

  // Get connection to find barber_id if setting primary
  if (is_primary) {
    const { data: connection } = await supabaseAdmin
      .from('calendar_connections')
      .select('barber_id')
      .eq('id', id)
      .single()

    if (connection) {
      await supabaseAdmin
        .from('calendar_connections')
        .update({ is_primary: false })
        .eq('barber_id', connection.barber_id)
    }
  }

  const updates: Record<string, unknown> = {}
  if (sync_direction !== undefined) updates.sync_direction = sync_direction
  if (is_primary !== undefined) updates.is_primary = is_primary
  if (is_active !== undefined) updates.is_active = is_active

  const { data, error } = await supabaseAdmin
    .from('calendar_connections')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE - Remove a calendar connection
export async function DELETE(request: NextRequest) {
  const url = new URL(request.url)
  const connectionId = url.searchParams.get('id')

  if (!connectionId) {
    return NextResponse.json({ error: 'Connection ID required' }, { status: 400 })
  }

  // First, delete any synced events from this connection
  await supabaseAdmin
    .from('calendar_events')
    .delete()
    .eq('external_calendar_id', connectionId)

  // Then delete the connection
  const { error } = await supabaseAdmin
    .from('calendar_connections')
    .delete()
    .eq('id', connectionId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
