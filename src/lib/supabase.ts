import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Shop {
  id: string
  name: string
  slug: string
  email: string
  phone: string
  address_street: string
  address_city: string
  address_state: string
  address_zip: string
  address_country: string
  timezone: string
  tagline: string
  logo_url: string
  hero_url: string
  primary_color: string
  secondary_color: string
  settings: {
    booking_buffer_minutes: number
    advance_booking_days: number
    cancellation_policy_hours: number
    require_deposit: boolean
    deposit_amount: number
  }
}

export interface ShopHours {
  id: string
  shop_id: string
  day_of_week: number
  open_time: string | null
  close_time: string | null
  is_closed: boolean
  by_appointment: boolean
}

export interface ServiceCategory {
  id: string
  shop_id: string
  name: string
  description: string
  sort_order: number
}

export interface Service {
  id: string
  shop_id: string
  category_id: string
  name: string
  description: string
  price: number
  duration: number
  is_active: boolean
  sort_order: number
  category?: ServiceCategory
}

export interface Barber {
  id: string
  shop_id: string
  name: string
  email: string | null
  phone: string | null
  photo_url: string | null
  bio: string
  is_active: boolean
  accepts_online_booking: boolean
  premium_pricing: {
    friday_saturday_extra?: number
    sunday_monday_extra?: number
  }
}

export interface BarberSchedule {
  id: string
  barber_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
}

export interface Booking {
  id: string
  shop_id: string
  barber_id: string
  customer_id: string | null
  service_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  booking_date: string
  start_time: string
  end_time: string
  price: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  customer_notes: string | null
  source: string
}

// Fetch functions
export async function getShop(slug: string): Promise<Shop | null> {
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching shop:', error)
    return null
  }
  return data
}

export async function getShopHours(shopId: string): Promise<ShopHours[]> {
  const { data, error } = await supabase
    .from('shop_hours')
    .select('*')
    .eq('shop_id', shopId)
    .order('day_of_week')

  if (error) {
    console.error('Error fetching hours:', error)
    return []
  }
  return data
}

export async function getServices(shopId: string): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      category:service_categories(*)
    `)
    .eq('shop_id', shopId)
    .eq('is_active', true)
    .order('sort_order')

  if (error) {
    console.error('Error fetching services:', error)
    return []
  }
  return data
}

export async function getBarbers(shopId: string): Promise<Barber[]> {
  const { data, error } = await supabase
    .from('barbers')
    .select('*')
    .eq('shop_id', shopId)
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching barbers:', error)
    return []
  }
  return data
}

export async function getBarberSchedules(barberId: string): Promise<BarberSchedule[]> {
  const { data, error } = await supabase
    .from('barber_schedules')
    .select('*')
    .eq('barber_id', barberId)
    .order('day_of_week')

  if (error) {
    console.error('Error fetching schedules:', error)
    return []
  }
  return data
}

export async function createBooking(booking: Omit<Booking, 'id'>): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single()

  if (error) {
    console.error('Error creating booking:', error)
    return null
  }
  return data
}

export async function getAvailableSlots(barberId: string, date: string, duration: number): Promise<string[]> {
  const { data, error } = await supabase
    .rpc('get_available_slots', {
      p_barber_id: barberId,
      p_date: date,
      p_duration: duration
    })

  if (error) {
    console.error('Error fetching slots:', error)
    return []
  }
  return data.map((row: { slot_time: string }) => row.slot_time)
}
