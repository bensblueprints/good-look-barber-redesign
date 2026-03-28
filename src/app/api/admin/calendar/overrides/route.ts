import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET - Get schedule overrides for a barber
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const barberId = url.searchParams.get('barber_id')
  const startDate = url.searchParams.get('start_date')
  const endDate = url.searchParams.get('end_date')

  if (!barberId) {
    return NextResponse.json({ error: 'Barber ID required' }, { status: 400 })
  }

  let query = supabaseAdmin
    .from('barber_schedule_overrides')
    .select('*')
    .eq('barber_id', barberId)
    .order('override_date')

  if (startDate) {
    query = query.gte('override_date', startDate)
  }
  if (endDate) {
    query = query.lte('override_date', endDate)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

// POST - Create a schedule override
export async function POST(request: NextRequest) {
  const body = await request.json()
  const {
    barber_id,
    override_date,
    is_working,
    start_time,
    end_time,
    break_start,
    break_end,
    reason
  } = body

  if (!barber_id || !override_date) {
    return NextResponse.json({ error: 'Barber ID and override_date required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('barber_schedule_overrides')
    .upsert({
      barber_id,
      override_date,
      is_working: is_working ?? false,
      start_time: is_working ? (start_time || '09:00') : null,
      end_time: is_working ? (end_time || '17:00') : null,
      break_start: is_working ? (break_start || null) : null,
      break_end: is_working ? (break_end || null) : null,
      reason: reason || null,
    }, {
      onConflict: 'barber_id,override_date',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE - Remove a schedule override
export async function DELETE(request: NextRequest) {
  const url = new URL(request.url)
  const overrideId = url.searchParams.get('id')
  const barberId = url.searchParams.get('barber_id')
  const overrideDate = url.searchParams.get('override_date')

  if (overrideId) {
    const { error } = await supabaseAdmin
      .from('barber_schedule_overrides')
      .delete()
      .eq('id', overrideId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else if (barberId && overrideDate) {
    const { error } = await supabaseAdmin
      .from('barber_schedule_overrides')
      .delete()
      .eq('barber_id', barberId)
      .eq('override_date', overrideDate)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else {
    return NextResponse.json({ error: 'Either id or (barber_id + override_date) required' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
