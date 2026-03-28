'use client'

import { motion } from 'framer-motion'
import { Clock, Phone, Calendar } from 'lucide-react'
import Link from 'next/link'
import type { ShopHours } from '@/lib/supabase'

interface HoursProps {
  hours: ShopHours[]
  phone: string
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function formatTime(time: string | null): string {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const formattedHour = hour % 12 || 12
  return `${formattedHour}:${minutes} ${ampm}`
}

export default function Hours({ hours, phone }: HoursProps) {
  const today = new Date().getDay()

  return (
    <section className="py-24 bg-[var(--cream)] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Hours Table */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-[var(--charcoal)] flex items-center justify-center text-[var(--gold)]">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[var(--gold)] font-[var(--font-elegant)] tracking-[0.2em] uppercase text-xs block">Schedule</span>
                <h2 className="font-[var(--font-display)] text-3xl text-[var(--charcoal)]">Business Hours</h2>
              </div>
            </div>

            <div className="space-y-2">
              {hours.map((day, index) => (
                <motion.div
                  key={day.day_of_week}
                  className={`flex justify-between items-center p-4 border transition-all duration-300 ${
                    day.day_of_week === today
                      ? 'bg-[var(--charcoal)] text-[var(--cream)] border-[var(--gold)]'
                      : 'bg-white text-[var(--charcoal)] border-[var(--charcoal)]/10 hover:border-[var(--gold)]/30'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <span className="font-[var(--font-body)] font-medium tracking-wider">
                    {dayNames[day.day_of_week]}
                    {day.day_of_week === today && (
                      <span className="ml-3 text-xs bg-[var(--gold)] text-[var(--charcoal-dark)] px-2 py-0.5 tracking-widest uppercase">
                        Today
                      </span>
                    )}
                  </span>
                  <span className={`font-[var(--font-elegant)] italic ${day.day_of_week === today ? 'text-[var(--gold)]' : 'text-[var(--charcoal)]/70'}`}>
                    {day.is_closed
                      ? 'Closed'
                      : day.by_appointment
                      ? 'By Appointment'
                      : `${formatTime(day.open_time)} - ${formatTime(day.close_time)}`}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="bg-[var(--charcoal)] p-10 border border-[var(--gold)]/20">
              <h3 className="font-[var(--font-display)] text-3xl text-[var(--cream)] mb-4">
                Ready to <span className="text-gold-gradient">Book</span>?
              </h3>

              {/* Elegant Divider */}
              <div className="w-12 h-px bg-[var(--gold)] mb-6" />

              <p className="font-[var(--font-elegant)] text-[var(--cream)]/70 mb-8 italic">
                Schedule your appointment online or give us a call. We will make sure you get the perfect time slot.
              </p>

              <div className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link href="/book" className="btn-luxury-filled w-full flex items-center justify-center gap-3">
                    <Calendar size={18} />
                    Reserve Online
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <a
                    href={`tel:${phone.replace(/[^0-9]/g, '')}`}
                    className="btn-luxury w-full flex items-center justify-center gap-3 text-[var(--cream)] border-[var(--cream)]/30 hover:border-[var(--gold)] hover:text-[var(--gold)]"
                  >
                    <Phone size={18} />
                    Call {phone}
                  </a>
                </motion.div>
              </div>
            </div>

            <div className="bg-[var(--cream-dark)] p-6 border border-[var(--gold)]/20">
              <p className="text-[var(--charcoal)]/80 text-sm leading-relaxed">
                <span className="text-[var(--gold)] font-semibold">Cancellation Policy:</span> Please cancel at least 8 hours before your appointment. Late cancellations may be subject to a fee.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
