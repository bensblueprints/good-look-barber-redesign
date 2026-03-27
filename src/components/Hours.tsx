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
    <section className="py-16 bg-[#161616]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Hours Table */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-8 h-8 text-[#02537E]" />
              <h2 className="text-3xl font-bold text-white">Business Hours</h2>
            </div>

            <div className="space-y-3">
              {hours.map((day) => (
                <motion.div
                  key={day.day_of_week}
                  className={`flex justify-between items-center p-4 rounded-lg ${
                    day.day_of_week === today
                      ? 'bg-[#02537E] text-white'
                      : 'bg-white/5 text-white/80'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: day.day_of_week * 0.05 }}
                >
                  <span className="font-medium">
                    {dayNames[day.day_of_week]}
                    {day.day_of_week === today && (
                      <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                        Today
                      </span>
                    )}
                  </span>
                  <span>
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
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="bg-white/5 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Book?</h3>
              <p className="text-white/70 mb-6">
                Schedule your appointment online or give us a call. We will make sure you get the perfect time slot.
              </p>

              <div className="space-y-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/book"
                    className="flex items-center justify-center gap-3 w-full bg-[#02537E] text-white py-4 rounded-lg font-semibold hover:bg-[#02537E]/90 transition-colors"
                  >
                    <Calendar size={20} />
                    Book Online
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <a
                    href={`tel:${phone.replace(/[^0-9]/g, '')}`}
                    className="flex items-center justify-center gap-3 w-full bg-white/10 text-white py-4 rounded-lg font-semibold hover:bg-white/20 transition-colors"
                  >
                    <Phone size={20} />
                    Call {phone}
                  </a>
                </motion.div>
              </div>
            </div>

            <div className="bg-[#02537E]/20 rounded-xl p-6 border border-[#02537E]/30">
              <p className="text-white/90 text-sm">
                <strong className="text-[#02537E]">Cancellation Policy:</strong> Please cancel at least 8 hours before your appointment. Late cancellations may be subject to a fee.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
