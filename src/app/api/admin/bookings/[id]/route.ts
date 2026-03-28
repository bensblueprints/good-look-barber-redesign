import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET single booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

// PUT update booking
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const updateData: Record<string, unknown> = {}

  if (body.barber_id !== undefined) updateData.barber_id = body.barber_id
  if (body.service_id !== undefined) updateData.service_id = body.service_id
  if (body.customer_name !== undefined) updateData.customer_name = body.customer_name
  if (body.customer_email !== undefined) updateData.customer_email = body.customer_email
  if (body.customer_phone !== undefined) updateData.customer_phone = body.customer_phone
  if (body.booking_date !== undefined) updateData.booking_date = body.booking_date
  if (body.start_time !== undefined) updateData.start_time = body.start_time
  if (body.end_time !== undefined) updateData.end_time = body.end_time
  if (body.price !== undefined) updateData.price = body.price
  if (body.status !== undefined) updateData.status = body.status
  if (body.customer_notes !== undefined) updateData.customer_notes = body.customer_notes

  // Recalculate end time if start_time or service changed
  if (body.start_time && body.service_id) {
    const { data: service } = await supabaseAdmin
      .from('services')
      .select('duration')
      .eq('id', body.service_id)
      .single()

    if (service) {
      const [hours, minutes] = body.start_time.split(':').map(Number)
      const startMinutes = hours * 60 + minutes
      const endMinutes = startMinutes + service.duration
      const endHours = Math.floor(endMinutes / 60)
      const endMins = endMinutes % 60
      updateData.end_time = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`
    }
  }

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { error } = await supabaseAdmin
    .from('bookings')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
