import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET all blocked times
export async function GET(request: NextRequest) {
  const shopSlug = process.env.NEXT_PUBLIC_SHOP_SLUG || 'good-look-barber'
  const url = new URL(request.url)
  const barberId = url.searchParams.get('barber_id')
  const startDate = url.searchParams.get('start_date')
  const endDate = url.searchParams.get('end_date')

  const { data: shop } = await supabaseAdmin
    .from('shops')
    .select('id')
    .eq('slug', shopSlug)
    .single()

  if (!shop) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
  }

  let query = supabaseAdmin
    .from('blocked_times')
    .select('*')
    .eq('shop_id', shop.id)
    .order('start_datetime', { ascending: true })

  if (barberId) {
    query = query.eq('barber_id', barberId)
  }

  if (startDate) {
    query = query.gte('start_datetime', startDate)
  }

  if (endDate) {
    query = query.lte('end_datetime', endDate)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST create blocked time
export async function POST(request: NextRequest) {
  const shopSlug = process.env.NEXT_PUBLIC_SHOP_SLUG || 'good-look-barber'

  const { data: shop } = await supabaseAdmin
    .from('shops')
    .select('id')
    .eq('slug', shopSlug)
    .single()

  if (!shop) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
  }

  const body = await request.json()

  const newBlockedTime = {
    shop_id: shop.id,
    barber_id: body.barber_id || null, // null = all barbers
    start_datetime: body.start_datetime,
    end_datetime: body.end_datetime,
    reason: body.reason || null,
    is_recurring: body.is_recurring || false,
    recurrence_pattern: body.recurrence_pattern || null,
  }

  const { data, error } = await supabaseAdmin
    .from('blocked_times')
    .insert(newBlockedTime)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
