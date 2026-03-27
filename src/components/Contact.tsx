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
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[#02537E] font-semibold tracking-wider uppercase text-sm">
            Get In Touch
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#161616] mt-2 mb-4">
            Visit Us Today
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            We are conveniently located in Marietta, GA. Stop by or reach out we would love to hear from you!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Address Card */}
            <motion.div
              className="bg-gray-50 rounded-xl p-6 flex items-start gap-4"
              whileHover={{ y: -5, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
            >
              <div className="w-12 h-12 bg-[#02537E] rounded-lg flex items-center justify-center text-white flex-shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-[#161616] text-lg mb-1">Address</h3>
                <p className="text-gray-600">{shop.address_street}</p>
                <p className="text-gray-600">
                  {shop.address_city}, {shop.address_state} {shop.address_zip}
                </p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#02537E] font-medium mt-2 hover:underline"
                >
                  Get Directions <ExternalLink size={14} />
                </a>
              </div>
            </motion.div>

            {/* Phone Card */}
            <motion.div
              className="bg-gray-50 rounded-xl p-6 flex items-start gap-4"
              whileHover={{ y: -5, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
            >
              <div className="w-12 h-12 bg-[#02537E] rounded-lg flex items-center justify-center text-white flex-shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-[#161616] text-lg mb-1">Phone</h3>
                <a
                  href={`tel:${shop.phone.replace(/[^0-9]/g, '')}`}
                  className="text-gray-600 hover:text-[#02537E] transition-colors text-lg"
                >
                  {shop.phone}
                </a>
                <p className="text-gray-500 text-sm mt-1">Call for appointments or inquiries</p>
              </div>
            </motion.div>

            {/* Email Card */}
            <motion.div
              className="bg-gray-50 rounded-xl p-6 flex items-start gap-4"
              whileHover={{ y: -5, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
            >
              <div className="w-12 h-12 bg-[#02537E] rounded-lg flex items-center justify-center text-white flex-shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-[#161616] text-lg mb-1">Email</h3>
                <a
                  href={`mailto:${shop.email}`}
                  className="text-gray-600 hover:text-[#02537E] transition-colors"
                >
                  {shop.email}
                </a>
                <p className="text-gray-500 text-sm mt-1">We will respond within 24 hours</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="h-[400px] lg:h-full min-h-[400px] rounded-xl overflow-hidden shadow-lg"
          >
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(fullAddress)}`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
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
