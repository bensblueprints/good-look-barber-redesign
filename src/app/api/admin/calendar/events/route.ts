import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET - Get calendar events for a barber
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const barberId = url.searchParams.get('barber_id')
  const shopId = url.searchParams.get('shop_id')
  const startDate = url.searchParams.get('start_date')
  const endDate = url.searchParams.get('end_date')
  const eventType = url.searchParams.get('event_type')

  let query = supabaseAdmin
    .from('calendar_events')
    .select('*')
    .order('starts_at')

  if (barberId) {
    query = query.eq('barber_id', barberId)
  }
  if (shopId) {
    query = query.eq('shop_id', shopId)
  }
  if (startDate) {
    query = query.gte('starts_at', startDate)
  }
  if (endDate) {
    query = query.lte('ends_at', endDate)
  }
  if (eventType) {
    query = query.eq('event_type', eventType)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

// POST - Create a calendar event
export async function POST(request: NextRequest) {
  const body = await request.json()
  const {
    barber_id,
    shop_id,
    title,
    description,
    starts_at,
    ends_at,
    all_day,
    event_type,
    blocks_bookings,
    recurrence_rule,
    recurrence_end,
    color
  } = body

  if (!barber_id || !title || !starts_at || !ends_at) {
    return NextResponse.json({
      error: 'barber_id, title, starts_at, and ends_at are required'
    }, { status: 400 })
  }

  // Get shop_id from barber if not provided
  let effectiveShopId = shop_id
  if (!effectiveShopId) {
    const { data: barber } = await supabaseAdmin
      .from('barbers')
      .select('shop_id')
      .eq('id', barber_id)
      .single()
    effectiveShopId = barber?.shop_id
  }

  const { data, error } = await supabaseAdmin
    .from('calendar_events')
    .insert({
      barber_id,
      shop_id: effectiveShopId,
      title,
      description: description || null,
      starts_at,
      ends_at,
      all_day: all_day ?? false,
      event_type: event_type || 'block',
      blocks_bookings: blocks_bookings ?? true,
      recurrence_rule: recurrence_rule || null,
      recurrence_end: recurrence_end || null,
      color: color || '#6366f1',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// PUT - Update a calendar event
export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...updates } = body

  if (!id) {
    return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
  }

  // Only allow updating certain fields
  const allowedFields = [
    'title', 'description', 'starts_at', 'ends_at', 'all_day',
    'event_type', 'blocks_bookings', 'recurrence_rule', 'recurrence_end', 'color'
  ]

  const filteredUpdates: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (key in updates) {
      filteredUpdates[key] = updates[key]
    }
  }

  const { data, error } = await supabaseAdmin
    .from('calendar_events')
    .update(filteredUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE - Delete a calendar event
export async function DELETE(request: NextRequest) {
  const url = new URL(request.url)
  const eventId = url.searchParams.get('id')

  if (!eventId) {
    return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('calendar_events')
    .delete()
    .eq('id', eventId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
