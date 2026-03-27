'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { format, addDays, isSameDay, parseISO } from 'date-fns'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Check,
  Loader2,
  Scissors,
} from 'lucide-react'
import { supabase, type Service, type Barber, type Shop } from '@/lib/supabase'

type Step = 'service' | 'barber' | 'datetime' | 'details' | 'confirm'

interface BookingState {
  service: Service | null
  barber: Barber | null
  date: Date | null
  time: string | null
  name: string
  email: string
  phone: string
  notes: string
}

export default function BookingPage() {
  const [step, setStep] = useState<Step>('service')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [shop, setShop] = useState<Shop | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)

  const [booking, setBooking] = useState<BookingState>({
    service: null,
    barber: null,
    date: null,
    time: null,
    name: '',
    email: '',
    phone: '',
    notes: '',
  })

  // Load shop data
  useEffect(() => {
    async function loadData() {
      const shopSlug = process.env.NEXT_PUBLIC_SHOP_SLUG || 'good-look-barber'

      const { data: shopData } = await supabase
        .from('shops')
        .select('*')
        .eq('slug', shopSlug)
        .single()

      if (shopData) {
        setShop(shopData)

        const [servicesRes, barbersRes] = await Promise.all([
          supabase
            .from('services')
            .select('*, category:service_categories(*)')
            .eq('shop_id', shopData.id)
            .eq('is_active', true)
            .order('sort_order'),
          supabase
            .from('barbers')
            .select('*')
            .eq('shop_id', shopData.id)
            .eq('is_active', true),
        ])

        if (servicesRes.data) setServices(servicesRes.data)
        if (barbersRes.data) setBarbers(barbersRes.data)
      }

      setLoading(false)
    }

    loadData()
  }, [])

  // Load available slots when date/barber changes
  useEffect(() => {
    async function loadSlots() {
      if (!booking.barber || !booking.date || !booking.service) return

      setSlotsLoading(true)
      const dateStr = format(booking.date, 'yyyy-MM-dd')

      const { data } = await supabase.rpc('get_available_slots', {
        p_barber_id: booking.barber.id,
        p_date: dateStr,
        p_duration: booking.service.duration,
      })

      if (data) {
        setAvailableSlots(data.map((row: { slot_time: string }) => row.slot_time))
      }
      setSlotsLoading(false)
    }

    loadSlots()
  }, [booking.barber, booking.date, booking.service])

  // Submit booking
  async function handleSubmit() {
    if (!shop || !booking.service || !booking.barber || !booking.date || !booking.time) {
      return
    }

    setSubmitting(true)

    try {
      const endTime = new Date(`2000-01-01T${booking.time}`)
      endTime.setMinutes(endTime.getMinutes() + booking.service.duration)
      const endTimeStr = format(endTime, 'HH:mm:ss')

      const { error } = await supabase.from('bookings').insert({
        shop_id: shop.id,
        barber_id: booking.barber.id,
        service_id: booking.service.id,
        customer_name: booking.name,
        customer_email: booking.email,
        customer_phone: booking.phone,
        booking_date: format(booking.date, 'yyyy-MM-dd'),
        start_time: booking.time,
        end_time: endTimeStr,
        price: booking.service.price,
        customer_notes: booking.notes || null,
        status: 'pending',
        source: 'website',
      })

      if (error) throw error

      setStep('confirm')
    } catch (err) {
      console.error('Booking error:', err)
      alert('Failed to create booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const steps: Step[] = ['service', 'barber', 'datetime', 'details', 'confirm']
  const currentStepIndex = steps.indexOf(step)

  const nextDays = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#02537E]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#161616] py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
          <Image src="/logo.png" alt={shop?.name || ''} width={120} height={40} className="h-8 w-auto" />
        </div>
      </header>

      {/* Progress Steps */}
      {step !== 'confirm' && (
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {['Service', 'Barber', 'Date & Time', 'Your Details'].map((label, index) => (
                <div key={label} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index <= currentStepIndex
                        ? 'bg-[#02537E] text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < currentStepIndex ? <Check size={16} /> : index + 1}
                  </div>
                  <span
                    className={`ml-2 text-sm hidden sm:block ${
                      index <= currentStepIndex ? 'text-[#161616] font-medium' : 'text-gray-400'
                    }`}
                  >
                    {label}
                  </span>
                  {index < 3 && (
                    <div className={`w-12 h-0.5 mx-4 ${index < currentStepIndex ? 'bg-[#02537E]' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Select Service */}
          {step === 'service' && (
            <motion.div
              key="service"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h1 className="text-2xl font-bold text-[#161616] mb-6">Select a Service</h1>
              <div className="grid gap-4">
                {services.map((service) => (
                  <motion.button
                    key={service.id}
                    onClick={() => {
                      setBooking({ ...booking, service })
                      setStep('barber')
                    }}
                    className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
                      booking.service?.id === service.id
                        ? 'border-[#02537E] bg-[#02537E]/5'
                        : 'border-gray-200 bg-white hover:border-[#02537E]/50'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[#161616]">{service.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {service.duration} min
                          </span>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-[#02537E]">${service.price}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Barber */}
          {step === 'barber' && (
            <motion.div
              key="barber"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button
                onClick={() => setStep('service')}
                className="flex items-center gap-2 text-gray-600 hover:text-[#161616] mb-6"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <h1 className="text-2xl font-bold text-[#161616] mb-6">Choose Your Barber</h1>
              <div className="grid gap-4">
                {barbers.map((barber) => (
                  <motion.button
                    key={barber.id}
                    onClick={() => {
                      setBooking({ ...booking, barber })
                      setStep('datetime')
                    }}
                    className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
                      booking.barber?.id === barber.id
                        ? 'border-[#02537E] bg-[#02537E]/5'
                        : 'border-gray-200 bg-white hover:border-[#02537E]/50'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-[#02537E]/10 rounded-full flex items-center justify-center text-[#02537E]">
                        <Scissors size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#161616]">{barber.name}</h3>
                        <p className="text-gray-600 text-sm">{barber.bio}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Select Date & Time */}
          {step === 'datetime' && (
            <motion.div
              key="datetime"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button
                onClick={() => setStep('barber')}
                className="flex items-center gap-2 text-gray-600 hover:text-[#161616] mb-6"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <h1 className="text-2xl font-bold text-[#161616] mb-6">Select Date & Time</h1>

              {/* Date Selection */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-[#161616] mb-4 flex items-center gap-2">
                  <Calendar size={20} />
                  Choose a Date
                </h2>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {nextDays.map((date) => (
                    <motion.button
                      key={date.toISOString()}
                      onClick={() => setBooking({ ...booking, date, time: null })}
                      className={`flex-shrink-0 w-20 p-3 rounded-lg text-center transition-all ${
                        booking.date && isSameDay(booking.date, date)
                          ? 'bg-[#02537E] text-white'
                          : 'bg-white border border-gray-200 hover:border-[#02537E]'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-xs font-medium uppercase">
                        {format(date, 'EEE')}
                      </div>
                      <div className="text-2xl font-bold">{format(date, 'd')}</div>
                      <div className="text-xs">{format(date, 'MMM')}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {booking.date && (
                <div>
                  <h2 className="text-lg font-semibold text-[#161616] mb-4 flex items-center gap-2">
                    <Clock size={20} />
                    Available Times
                  </h2>
                  {slotsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-[#02537E]" />
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {availableSlots.map((slot) => {
                        const [hours, minutes] = slot.split(':')
                        const hour = parseInt(hours)
                        const ampm = hour >= 12 ? 'PM' : 'AM'
                        const displayHour = hour % 12 || 12
                        const displayTime = `${displayHour}:${minutes} ${ampm}`

                        return (
                          <motion.button
                            key={slot}
                            onClick={() => setBooking({ ...booking, time: slot })}
                            className={`p-3 rounded-lg text-sm font-medium transition-all ${
                              booking.time === slot
                                ? 'bg-[#02537E] text-white'
                                : 'bg-white border border-gray-200 hover:border-[#02537E]'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {displayTime}
                          </motion.button>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No available slots for this date. Please try another day.
                    </p>
                  )}
                </div>
              )}

              {booking.date && booking.time && (
                <motion.button
                  onClick={() => setStep('details')}
                  className="w-full mt-8 bg-[#02537E] text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#02537E]/90 transition-colors"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Continue
                  <ArrowRight size={20} />
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Step 4: Your Details */}
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button
                onClick={() => setStep('datetime')}
                className="flex items-center gap-2 text-gray-600 hover:text-[#161616] mb-6"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <h1 className="text-2xl font-bold text-[#161616] mb-6">Your Details</h1>

              <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
                <h2 className="font-semibold text-[#161616] mb-4">Booking Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{booking.service?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Barber:</span>
                    <span className="font-medium">{booking.barber?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {booking.date && format(booking.date, 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">
                      {booking.time && (() => {
                        const [hours, minutes] = booking.time.split(':')
                        const hour = parseInt(hours)
                        const ampm = hour >= 12 ? 'PM' : 'AM'
                        const displayHour = hour % 12 || 12
                        return `${displayHour}:${minutes} ${ampm}`
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold text-[#02537E] text-lg">${booking.service?.price}</span>
                  </div>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSubmit()
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      required
                      value={booking.name}
                      onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02537E] focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      required
                      value={booking.email}
                      onChange={(e) => setBooking({ ...booking, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02537E] focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="tel"
                      required
                      value={booking.phone}
                      onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02537E] focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={booking.notes}
                    onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02537E] focus:border-transparent"
                    placeholder="Any special requests or preferences?"
                    rows={3}
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#02537E] text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#02537E]/90 transition-colors disabled:opacity-50"
                  whileHover={{ scale: submitting ? 1 : 1.01 }}
                  whileTap={{ scale: submitting ? 1 : 0.99 }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      Confirm Booking
                      <Check size={20} />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* Step 5: Confirmation */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <motion.div
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Check className="w-10 h-10 text-green-600" />
              </motion.div>
              <h1 className="text-3xl font-bold text-[#161616] mb-4">Booking Confirmed!</h1>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Thank you for booking with {shop?.name}. We&apos;ve sent a confirmation email to {booking.email}.
              </p>

              <div className="bg-white rounded-xl p-6 border border-gray-200 max-w-md mx-auto mb-8">
                <h2 className="font-semibold text-[#161616] mb-4">Your Appointment</h2>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <Scissors className="text-[#02537E]" size={20} />
                    <div>
                      <div className="font-medium">{booking.service?.name}</div>
                      <div className="text-sm text-gray-500">with {booking.barber?.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="text-[#02537E]" size={20} />
                    <span>{booking.date && format(booking.date, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="text-[#02537E]" size={20} />
                    <span>
                      {booking.time && (() => {
                        const [hours, minutes] = booking.time.split(':')
                        const hour = parseInt(hours)
                        const ampm = hour >= 12 ? 'PM' : 'AM'
                        const displayHour = hour % 12 || 12
                        return `${displayHour}:${minutes} ${ampm}`
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-[#161616] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#161616]/90 transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Home
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
