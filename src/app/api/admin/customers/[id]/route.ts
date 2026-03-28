import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET single customer with booking history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const [customerRes, bookingsRes] = await Promise.all([
    supabaseAdmin.from('customers').select('*').eq('id', id).single(),
    supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('customer_id', id)
      .order('booking_date', { ascending: false })
      .limit(20),
  ])

  if (customerRes.error) {
    return NextResponse.json({ error: customerRes.error.message }, { status: 500 })
  }

  if (!customerRes.data) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }

  return NextResponse.json({
    ...customerRes.data,
    bookings: bookingsRes.data || [],
  })
}

// PUT update customer
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
  if (body.notes !== undefined) updateData.notes = body.notes
  if (body.is_vip !== undefined) updateData.is_vip = body.is_vip

  const { data, error } = await supabaseAdmin
    .from('customers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { error } = await supabaseAdmin
    .from('customers')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
