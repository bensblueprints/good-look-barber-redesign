import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET all services
export async function GET(request: NextRequest) {
  const shopSlug = process.env.NEXT_PUBLIC_SHOP_SLUG || 'good-look-barber'

  // Get shop ID first
  const { data: shop } = await supabaseAdmin
    .from('shops')
    .select('id')
    .eq('slug', shopSlug)
    .single()

  if (!shop) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
  }

  const { data, error } = await supabaseAdmin
    .from('services')
    .select('*, category:service_categories(*)')
    .eq('shop_id', shop.id)
    .order('sort_order')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST create new service
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

  // Get max sort_order
  const { data: maxSort } = await supabaseAdmin
    .from('services')
    .select('sort_order')
    .eq('shop_id', shop.id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const newService = {
    shop_id: shop.id,
    name: body.name,
    description: body.description || '',
    price: body.price,
    duration: body.duration,
    category_id: body.category_id || null,
    is_active: body.is_active !== undefined ? body.is_active : true,
    sort_order: (maxSort?.sort_order || 0) + 1,
  }

  const { data, error } = await supabaseAdmin
    .from('services')
    .insert(newService)
    .select('*, category:service_categories(*)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
