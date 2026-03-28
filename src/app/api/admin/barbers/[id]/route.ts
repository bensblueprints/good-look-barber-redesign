import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET single barber with schedule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const [barberRes, scheduleRes] = await Promise.all([
    supabaseAdmin.from('barbers').select('*').eq('id', id).single(),
    supabaseAdmin.from('barber_schedules').select('*').eq('barber_id', id).order('day_of_week'),
  ])

  if (barberRes.error) {
    return NextResponse.json({ error: barberRes.error.message }, { status: 500 })
  }

  if (!barberRes.data) {
    return NextResponse.json({ error: 'Barber not found' }, { status: 404 })
  }

  return NextResponse.json({
    ...barberRes.data,
    schedules: scheduleRes.data || [],
  })
}

// PUT update barber
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const updateData: Record<string, unknown> = {}

  if (body.name !== undefined) updateData.name = body.name
  if (body.email !== undefined) updateData.email = body.email
  if (body.phone !== undefined) updateData.phone = body.phone
  if (body.bio !== undefined) updateData.bio = body.bio
  if (body.photo_url !== undefined) updateData.photo_url = body.photo_url
  if (body.is_active !== undefined) updateData.is_active = body.is_active
  if (body.accepts_online_booking !== undefined) updateData.accepts_online_booking = body.accepts_online_booking
  if (body.premium_pricing !== undefined) updateData.premium_pricing = body.premium_pricing

  const { data, error } = await supabaseAdmin
    .from('barbers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update schedules if provided
  if (body.schedules && Array.isArray(body.schedules)) {
    for (const schedule of body.schedules) {
      await supabaseAdmin
        .from('barber_schedules')
        .update({
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          is_available: schedule.is_available,
        })
        .eq('id', schedule.id)
    }
  }

  return NextResponse.json(data)
}

// DELETE barber (soft delete - mark inactive)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const url = new URL(request.url)
  const hardDelete = url.searchParams.get('hard') === 'true'

  if (hardDelete) {
    // Hard delete - remove completely
    await supabaseAdmin.from('barber_schedules').delete().eq('barber_id', id)
    const { error } = await supabaseAdmin.from('barbers').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else {
    // Soft delete - mark inactive
    const { error } = await supabaseAdmin
      .from('barbers')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
