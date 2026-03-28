import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET - Get barber's weekly schedule and timezone
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const barberId = url.searchParams.get('barber_id')

  if (!barberId) {
    return NextResponse.json({ error: 'Barber ID required' }, { status: 400 })
  }

  // Get barber info including timezone
  const { data: barber, error: barberError } = await supabaseAdmin
    .from('barbers')
    .select('id, name, timezone, shop_id')
    .eq('id', barberId)
    .single()

  if (barberError) {
    return NextResponse.json({ error: barberError.message }, { status: 500 })
  }

  // Get shop timezone as fallback
  const { data: shop } = await supabaseAdmin
    .from('shops')
    .select('timezone')
    .eq('id', barber.shop_id)
    .single()

  // Get weekly schedule
  const { data: schedule, error: scheduleError } = await supabaseAdmin
    .from('barber_schedules')
    .select('*')
    .eq('barber_id', barberId)
    .order('day_of_week')

  if (scheduleError) {
    return NextResponse.json({ error: scheduleError.message }, { status: 500 })
  }

  return NextResponse.json({
    barber: {
      id: barber.id,
      name: barber.name,
      timezone: barber.timezone || shop?.timezone || 'America/New_York',
      shop_timezone: shop?.timezone || 'America/New_York',
    },
    schedule: schedule || [],
  })
}

// POST - Create/update barber's weekly schedule
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { barber_id, timezone, schedule } = body

  if (!barber_id) {
    return NextResponse.json({ error: 'Barber ID required' }, { status: 400 })
  }

  // Update barber's timezone if provided
  if (timezone) {
    const { error: tzError } = await supabaseAdmin
      .from('barbers')
      .update({ timezone })
      .eq('id', barber_id)

    if (tzError) {
      return NextResponse.json({ error: tzError.message }, { status: 500 })
    }
  }

  // Update schedule if provided
  if (schedule && Array.isArray(schedule)) {
    for (const day of schedule) {
      const { error } = await supabaseAdmin
        .from('barber_schedules')
        .upsert({
          barber_id,
          day_of_week: day.day_of_week,
          is_working: day.is_working ?? true,
          start_time: day.start_time,
          end_time: day.end_time,
          break_start: day.break_start || null,
          break_end: day.break_end || null,
        }, {
          onConflict: 'barber_id,day_of_week',
        })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ success: true })
}

// PUT - Update a single day's schedule
export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { barber_id, day_of_week, is_working, start_time, end_time, break_start, break_end } = body

  if (!barber_id || day_of_week === undefined) {
    return NextResponse.json({ error: 'Barber ID and day_of_week required' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('barber_schedules')
    .upsert({
      barber_id,
      day_of_week,
      is_working: is_working ?? true,
      start_time: start_time || '09:00',
      end_time: end_time || '17:00',
      break_start: break_start || null,
      break_end: break_end || null,
    }, {
      onConflict: 'barber_id,day_of_week',
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
