import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { randomBytes } from 'crypto'

// GET iCal settings for a barber
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const barberId = url.searchParams.get('barber_id')

  if (!barberId) {
    return NextResponse.json({ error: 'Barber ID required' }, { status: 400 })
  }

  const { data: barber, error } = await supabaseAdmin
    .from('barbers')
    .select('id, name, ical_token, ical_enabled')
    .eq('id', barberId)
    .single()

  if (error || !barber) {
    return NextResponse.json({ error: 'Barber not found' }, { status: 404 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://good-look-barber-site.netlify.app'

  return NextResponse.json({
    enabled: barber.ical_enabled || false,
    token: barber.ical_token || null,
    feedUrl: barber.ical_token ? `${baseUrl}/api/calendar/ical/${barber.ical_token}` : null,
  })
}

// POST - Enable/generate iCal feed
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { barber_id, enabled } = body

  if (!barber_id) {
    return NextResponse.json({ error: 'Barber ID required' }, { status: 400 })
  }

  const updateData: Record<string, unknown> = {
    ical_enabled: enabled !== false,
    updated_at: new Date().toISOString(),
  }

  // Generate a new token if enabling and none exists
  if (enabled !== false) {
    const { data: existing } = await supabaseAdmin
      .from('barbers')
      .select('ical_token')
      .eq('id', barber_id)
      .single()

    if (!existing?.ical_token) {
      updateData.ical_token = randomBytes(32).toString('hex')
    }
  }

  const { data, error } = await supabaseAdmin
    .from('barbers')
    .update(updateData)
    .eq('id', barber_id)
    .select('id, name, ical_token, ical_enabled')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://good-look-barber-site.netlify.app'

  return NextResponse.json({
    enabled: data.ical_enabled,
    token: data.ical_token,
    feedUrl: data.ical_token ? `${baseUrl}/api/calendar/ical/${data.ical_token}` : null,
  })
}

// DELETE - Regenerate iCal token (invalidates old URLs)
export async function DELETE(request: NextRequest) {
  const url = new URL(request.url)
  const barberId = url.searchParams.get('barber_id')

  if (!barberId) {
    return NextResponse.json({ error: 'Barber ID required' }, { status: 400 })
  }

  const newToken = randomBytes(32).toString('hex')

  const { data, error } = await supabaseAdmin
    .from('barbers')
    .update({
      ical_token: newToken,
      updated_at: new Date().toISOString(),
    })
    .eq('id', barberId)
    .select('id, name, ical_token, ical_enabled')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://good-look-barber-site.netlify.app'

  return NextResponse.json({
    enabled: data.ical_enabled,
    token: data.ical_token,
    feedUrl: `${baseUrl}/api/calendar/ical/${data.ical_token}`,
    message: 'Token regenerated. Old URLs will no longer work.',
  })
}
