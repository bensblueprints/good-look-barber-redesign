import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET!
const REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/calendar/google/callback`
  : 'http://localhost:3000/api/admin/calendar/google/callback'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const barberId = url.searchParams.get('state') // barber_id passed through state
  const error = url.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/admin?tab=barbers&calendar_error=${error}`, request.url)
    )
  }

  if (!code || !barberId) {
    return NextResponse.redirect(
      new URL('/admin?tab=barbers&calendar_error=missing_params', request.url)
    )
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    })

    const tokens = await tokenResponse.json()

    if (tokens.error) {
      console.error('Token exchange error:', tokens)
      return NextResponse.redirect(
        new URL(`/admin?tab=barbers&calendar_error=${tokens.error}`, request.url)
      )
    }

    // Get the user's primary calendar info
    let calendarName = 'Primary Calendar'
    let calendarId = 'primary'

    try {
      const calendarResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary',
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }
      )

      if (calendarResponse.ok) {
        const calendarData = await calendarResponse.json()
        calendarName = calendarData.summary || 'Primary Calendar'
        calendarId = calendarData.id || 'primary'
      }
    } catch {
      // Use defaults if we can't fetch calendar info
    }

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

    // Check if connection already exists
    const { data: existingConnection } = await supabaseAdmin
      .from('calendar_connections')
      .select('id')
      .eq('barber_id', barberId)
      .eq('provider', 'google')
      .eq('provider_calendar_id', calendarId)
      .single()

    // Save tokens to calendar_connections table
    const { error: dbError } = await supabaseAdmin
      .from('calendar_connections')
      .upsert({
        id: existingConnection?.id, // Use existing ID if updating
        barber_id: barberId,
        provider: 'google',
        provider_calendar_id: calendarId,
        provider_calendar_name: calendarName,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt.toISOString(),
        sync_direction: 'both',
        is_primary: true,
        is_active: true,
        last_sync_status: 'pending',
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.redirect(
        new URL('/admin?tab=barbers&calendar_error=db_error', request.url)
      )
    }

    // Set this as primary and unset others
    await supabaseAdmin
      .from('calendar_connections')
      .update({ is_primary: false })
      .eq('barber_id', barberId)
      .neq('provider_calendar_id', calendarId)

    return NextResponse.redirect(
      new URL('/admin?tab=barbers&calendar_connected=true', request.url)
    )
  } catch (err) {
    console.error('OAuth callback error:', err)
    return NextResponse.redirect(
      new URL('/admin?tab=barbers&calendar_error=server_error', request.url)
    )
  }
}
