import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET all barbers
export async function GET(request: NextRequest) {
  const shopSlug = process.env.NEXT_PUBLIC_SHOP_SLUG || 'good-look-barber'

  const { data: shop } = await supabaseAdmin
    .from('shops')
    .select('id')
    .eq('slug', shopSlug)
    .single()

  if (!shop) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
  }

  const { data, error } = await supabaseAdmin
    .from('barbers')
    .select('*')
    .eq('shop_id', shop.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST create new barber
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

  const newBarber = {
    shop_id: shop.id,
    name: body.name,
    email: body.email || null,
    phone: body.phone || null,
    bio: body.bio || '',
    photo_url: body.photo_url || null,
    is_active: body.is_active !== undefined ? body.is_active : true,
    accepts_online_booking: body.accepts_online_booking !== undefined ? body.accepts_online_booking : true,
    premium_pricing: body.premium_pricing || {},
  }

  const { data, error } = await supabaseAdmin
    .from('barbers')
    .insert(newBarber)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Create default schedule (Mon-Sat 9am-6pm)
  const defaultSchedule = [0, 1, 2, 3, 4, 5, 6].map(day => ({
    barber_id: data.id,
    day_of_week: day,
    start_time: day === 0 ? null : '09:00:00',
    end_time: day === 0 ? null : '18:00:00',
    is_available: day !== 0, // Sunday off by default
  }))

  await supabaseAdmin.from('barber_schedules').insert(defaultSchedule)

  return NextResponse.json(data, { status: 201 })
}
