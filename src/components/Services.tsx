'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Clock, Scissors, Sparkles, Crown, Users } from 'lucide-react'
import type { Service } from '@/lib/supabase'

interface ServicesProps {
  services: Service[]
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Haircuts': <Scissors className="w-6 h-6" />,
  'Premium': <Sparkles className="w-6 h-6" />,
  'VIP': <Crown className="w-6 h-6" />,
  'Kids': <Users className="w-6 h-6" />,
  'default': <Scissors className="w-6 h-6" />,
}

export default function Services({ services }: ServicesProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <section id="services" className="py-24 bg-[var(--cream)] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent" />

      {/* Floating Gold Accents */}
      <motion.div
        className="absolute top-20 right-20 w-32 h-32 rounded-full border border-[var(--gold)]/10"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-40 left-10 w-48 h-48 rounded-full border border-[var(--gold)]/5"
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
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
            The Art of Grooming
          </motion.span>

          <motion.h2
            className="font-[var(--font-display)] text-4xl md:text-5xl lg:text-6xl text-[var(--charcoal)] mt-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Our <span className="text-gold-gradient">Services</span>
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
            className="font-[var(--font-elegant)] text-[var(--charcoal)]/70 max-w-2xl mx-auto text-lg md:text-xl italic"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Experience premium grooming services tailored to your style.
            From classic cuts to VIP packages, we craft excellence.
          </motion.p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group relative bg-white rounded-none border border-[var(--charcoal)]/10 hover:border-[var(--gold)] transition-all duration-500 overflow-hidden"
            >
              {/* Top Gold Accent Line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold)] to-[var(--gold-light)] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

              {/* Service Number */}
              <div className="absolute top-6 right-6 font-[var(--font-display)] text-6xl text-[var(--charcoal)]/5 group-hover:text-[var(--gold)]/10 transition-colors duration-500">
                {String(index + 1).padStart(2, '0')}
              </div>

              <div className="p-8">
                {/* Icon */}
                <div className="w-14 h-14 bg-[var(--charcoal)] group-hover:bg-[var(--gold)] rounded-none flex items-center justify-center mb-6 text-[var(--gold)] group-hover:text-[var(--charcoal-dark)] transition-all duration-500">
                  {categoryIcons[service.category?.name || 'default'] || categoryIcons.default}
                </div>

                {/* Content */}
                <h3 className="font-[var(--font-display)] text-2xl text-[var(--charcoal)] group-hover:text-[var(--charcoal-dark)] mb-3 transition-colors">
                  {service.name}
                </h3>

                <p className="font-[var(--font-body)] text-[var(--charcoal)]/60 mb-6 text-sm leading-relaxed">
                  {service.description}
                </p>

                {/* Price & Duration */}
                <div className="flex items-end justify-between pt-6 border-t border-[var(--charcoal)]/10 group-hover:border-[var(--gold)]/30 transition-colors">
                  <div>
                    <span className="text-xs text-[var(--charcoal)]/40 uppercase tracking-wider block mb-1">Starting at</span>
                    <span className="font-[var(--font-display)] text-3xl text-[var(--gold)]">
                      ${service.price.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--charcoal)]/50 text-sm">
                    <Clock size={14} />
                    <span>{service.duration} min</span>
                  </div>
                </div>

                {/* Book Now Button */}
                <motion.div
                  className="mt-6"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link href="/book" className="btn-luxury-small w-full text-center">
                    Book Now
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link href="/book" className="btn-luxury-filled inline-block">
              Reserve Your Experience
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
