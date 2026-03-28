import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// DELETE blocked time
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { error } = await supabaseAdmin
    .from('blocked_times')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// PUT update blocked time
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const updateData: Record<string, unknown> = {}

  if (body.barber_id !== undefined) updateData.barber_id = body.barber_id
  if (body.start_datetime !== undefined) updateData.start_datetime = body.start_datetime
  if (body.end_datetime !== undefined) updateData.end_datetime = body.end_datetime
  if (body.reason !== undefined) updateData.reason = body.reason
  if (body.is_recurring !== undefined) updateData.is_recurring = body.is_recurring
  if (body.recurrence_pattern !== undefined) updateData.recurrence_pattern = body.recurrence_pattern

  const { data, error } = await supabaseAdmin
    .from('blocked_times')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
