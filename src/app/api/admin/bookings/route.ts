import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET all bookings
export async function GET(request: NextRequest) {
  const shopSlug = process.env.NEXT_PUBLIC_SHOP_SLUG || 'good-look-barber'
  const url = new URL(request.url)

  // Optional filters
  const status = url.searchParams.get('status')
  const barberId = url.searchParams.get('barber_id')
  const startDate = url.searchParams.get('start_date')
  const endDate = url.searchParams.get('end_date')
  const limit = parseInt(url.searchParams.get('limit') || '100')

  const { data: shop } = await supabaseAdmin
    .from('shops')
    .select('id')
    .eq('slug', shopSlug)
    .single()

  if (!shop) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
  }

  let query = supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('shop_id', shop.id)
    .order('booking_date', { ascending: false })
    .order('start_time', { ascending: false })
    .limit(limit)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (barberId) {
    query = query.eq('barber_id', barberId)
  }

  if (startDate) {
    query = query.gte('booking_date', startDate)
  }

  if (endDate) {
    query = query.lte('booking_date', endDate)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST create new booking (manual)
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

  // Get service to calculate end time
  const { data: service } = await supabaseAdmin
    .from('services')
    .select('duration, price')
    .eq('id', body.service_id)
    .single()

  if (!service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }

  // Calculate end time
  const [hours, minutes] = body.start_time.split(':').map(Number)
  const startMinutes = hours * 60 + minutes
  const endMinutes = startMinutes + service.duration
  const endHours = Math.floor(endMinutes / 60)
  const endMins = endMinutes % 60
  const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`

  const newBooking = {
    shop_id: shop.id,
    barber_id: body.barber_id,
    service_id: body.service_id,
    customer_name: body.customer_name,
    customer_email: body.customer_email,
    customer_phone: body.customer_phone,
    booking_date: body.booking_date,
    start_time: body.start_time,
    end_time: endTime,
    price: body.price_override || service.price,
    status: body.status || 'confirmed',
    customer_notes: body.customer_notes || null,
    source: 'admin',
  }

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .insert(newBooking)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
