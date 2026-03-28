import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET shop settings
export async function GET() {
  const shopSlug = process.env.NEXT_PUBLIC_SHOP_SLUG || 'good-look-barber'

  const { data: shop, error } = await supabaseAdmin
    .from('shops')
    .select('*')
    .eq('slug', shopSlug)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!shop) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
  }

  // Get shop hours
  const { data: hours } = await supabaseAdmin
    .from('shop_hours')
    .select('*')
    .eq('shop_id', shop.id)
    .order('day_of_week')

  return NextResponse.json({
    ...shop,
    hours: hours || [],
  })
}

// PUT update shop settings
export async function PUT(request: NextRequest) {
  const shopSlug = process.env.NEXT_PUBLIC_SHOP_SLUG || 'good-look-barber'
  const body = await request.json()

  const { data: shop } = await supabaseAdmin
    .from('shops')
    .select('id')
    .eq('slug', shopSlug)
    .single()

  if (!shop) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
  }

  const updateData: Record<string, unknown> = {}

  // Basic info
  if (body.name !== undefined) updateData.name = body.name
  if (body.tagline !== undefined) updateData.tagline = body.tagline
  if (body.email !== undefined) updateData.email = body.email
  if (body.phone !== undefined) updateData.phone = body.phone
  if (body.address_street !== undefined) updateData.address_street = body.address_street
  if (body.address_city !== undefined) updateData.address_city = body.address_city
  if (body.address_state !== undefined) updateData.address_state = body.address_state
  if (body.address_zip !== undefined) updateData.address_zip = body.address_zip
  if (body.timezone !== undefined) updateData.timezone = body.timezone
  if (body.logo_url !== undefined) updateData.logo_url = body.logo_url

  // Settings object
  if (body.settings !== undefined) {
    updateData.settings = body.settings
  }

  const { data, error } = await supabaseAdmin
    .from('shops')
    .update(updateData)
    .eq('id', shop.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update hours if provided
  if (body.hours && Array.isArray(body.hours)) {
    for (const hour of body.hours) {
      await supabaseAdmin
        .from('shop_hours')
        .update({
          open_time: hour.open_time,
          close_time: hour.close_time,
          is_closed: hour.is_closed,
          by_appointment: hour.by_appointment,
        })
        .eq('id', hour.id)
    }
  }

  return NextResponse.json(data)
}
