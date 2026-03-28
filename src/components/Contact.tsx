'use client'

import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react'
import type { Shop } from '@/lib/supabase'

interface ContactProps {
  shop: Shop
}

export default function Contact({ shop }: ContactProps) {
  const fullAddress = `${shop.address_street}, ${shop.address_city}, ${shop.address_state} ${shop.address_zip}`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`

  return (
    <section id="contact" className="py-24 bg-[var(--charcoal)] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.span
            className="text-[var(--gold)] font-[var(--font-elegant)] tracking-[0.3em] uppercase text-sm"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Location
          </motion.span>

          <motion.h2
            className="font-[var(--font-display)] text-4xl md:text-5xl lg:text-6xl text-[var(--cream)] mt-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Visit <span className="text-gold-gradient">Us</span>
          </motion.h2>

          {/* Elegant Divider */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 60 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent mx-auto mb-6"
          />

          <motion.p
            className="font-[var(--font-elegant)] text-[var(--cream)]/60 max-w-2xl mx-auto text-lg italic"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Conveniently located in Marietta, Georgia. We would love to see you.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {/* Address Card */}
            <motion.div
              className="group bg-[var(--charcoal-light)] p-8 border border-[var(--gold)]/10 hover:border-[var(--gold)]/30 transition-all duration-500"
              whileHover={{ y: -4 }}
            >
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-[var(--charcoal)] border border-[var(--gold)]/20 flex items-center justify-center text-[var(--gold)] flex-shrink-0 group-hover:bg-[var(--gold)] group-hover:text-[var(--charcoal-dark)] transition-all duration-500">
                  <MapPin size={22} />
                </div>
                <div>
                  <h3 className="font-[var(--font-display)] text-xl text-[var(--cream)] mb-2">Address</h3>
                  <p className="text-[var(--cream)]/60 leading-relaxed">{shop.address_street}</p>
                  <p className="text-[var(--cream)]/60 mb-4">
                    {shop.address_city}, {shop.address_state} {shop.address_zip}
                  </p>
                  <motion.a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[var(--gold)] text-sm tracking-wider uppercase hover:text-[var(--gold-light)] transition-colors"
                    whileHover={{ x: 3 }}
                  >
                    Get Directions <ExternalLink size={14} />
                  </motion.a>
                </div>
              </div>
            </motion.div>

            {/* Phone Card */}
            <motion.div
              className="group bg-[var(--charcoal-light)] p-8 border border-[var(--gold)]/10 hover:border-[var(--gold)]/30 transition-all duration-500"
              whileHover={{ y: -4 }}
            >
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-[var(--charcoal)] border border-[var(--gold)]/20 flex items-center justify-center text-[var(--gold)] flex-shrink-0 group-hover:bg-[var(--gold)] group-hover:text-[var(--charcoal-dark)] transition-all duration-500">
                  <Phone size={22} />
                </div>
                <div>
                  <h3 className="font-[var(--font-display)] text-xl text-[var(--cream)] mb-2">Phone</h3>
                  <a
                    href={`tel:${shop.phone.replace(/[^0-9]/g, '')}`}
                    className="text-[var(--cream)]/80 hover:text-[var(--gold)] transition-colors text-lg block mb-2"
                  >
                    {shop.phone}
                  </a>
                  <p className="text-[var(--cream)]/40 text-sm">Call for appointments or inquiries</p>
                </div>
              </div>
            </motion.div>

            {/* Email Card */}
            <motion.div
              className="group bg-[var(--charcoal-light)] p-8 border border-[var(--gold)]/10 hover:border-[var(--gold)]/30 transition-all duration-500"
              whileHover={{ y: -4 }}
            >
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-[var(--charcoal)] border border-[var(--gold)]/20 flex items-center justify-center text-[var(--gold)] flex-shrink-0 group-hover:bg-[var(--gold)] group-hover:text-[var(--charcoal-dark)] transition-all duration-500">
                  <Mail size={22} />
                </div>
                <div>
                  <h3 className="font-[var(--font-display)] text-xl text-[var(--cream)] mb-2">Email</h3>
                  <a
                    href={`mailto:${shop.email}`}
                    className="text-[var(--cream)]/80 hover:text-[var(--gold)] transition-colors block mb-2"
                  >
                    {shop.email}
                  </a>
                  <p className="text-[var(--cream)]/40 text-sm">We will respond within 24 hours</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="h-[400px] lg:h-full min-h-[400px] border border-[var(--gold)]/20 overflow-hidden"
          >
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(fullAddress)}`}
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(100%) contrast(1.1)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Shop Location"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
