'use client'

import { motion } from 'framer-motion'
import { Award, Users, Clock, Star } from 'lucide-react'

interface AboutProps {
  shopName: string
}

export default function About({ shopName }: AboutProps) {
  const features = [
    {
      icon: <Award className="w-7 h-7" />,
      title: 'Master Craftsmen',
      description: 'Our team brings decades of expertise and artistry to every cut.',
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: 'Bespoke Service',
      description: 'Each visit is tailored to your unique style and preferences.',
    },
    {
      icon: <Clock className="w-7 h-7" />,
      title: 'Your Schedule',
      description: 'Book online anytime or walk in during business hours.',
    },
    {
      icon: <Star className="w-7 h-7" />,
      title: 'Premium Products',
      description: 'Only the finest grooming products touch your hair and skin.',
    },
  ]

  return (
    <section id="about" className="py-24 bg-[var(--charcoal)] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent" />
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 border border-[var(--gold)]/5 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
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
              Our Story
            </motion.span>

            <motion.h2
              className="font-[var(--font-display)] text-4xl md:text-5xl text-[var(--cream)] mt-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              More Than Just a <span className="text-gold-gradient">Barbershop</span>
            </motion.h2>

            {/* Elegant Divider */}
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 60 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-px bg-gradient-to-r from-[var(--gold)] to-transparent mb-8"
            />

            <motion.p
              className="font-[var(--font-elegant)] text-[var(--cream)]/70 text-lg mb-6 leading-relaxed italic"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              At {shopName}, we believe that a great haircut is more than just a service - it is an experience. Our expert barbers combine traditional techniques with modern styles to create looks that are uniquely you.
            </motion.p>

            <motion.p
              className="font-[var(--font-body)] text-[var(--cream)]/60 mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              Since opening our doors, we have been dedicated to providing exceptional grooming services in a welcoming atmosphere. Whether you are coming in for a quick trim or our signature VIP package, you will leave looking and feeling your best.
            </motion.p>

            {/* Stats Row */}
            <motion.div
              className="grid grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              {[
                { value: '17+', label: 'Years' },
                { value: '10K+', label: 'Clients' },
                { value: '4.6', label: 'Rating' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center p-5 bg-[var(--charcoal-light)] border border-[var(--gold)]/10"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ borderColor: 'var(--gold)', y: -2 }}
                >
                  <div className="font-[var(--font-display)] text-3xl text-[var(--gold)]">{stat.value}</div>
                  <div className="text-[var(--cream)]/40 text-sm uppercase tracking-wider mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            className="grid sm:grid-cols-2 gap-6"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group bg-[var(--charcoal-light)] p-6 border border-[var(--gold)]/10 hover:border-[var(--gold)]/30 transition-all duration-500"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -5 }}
              >
                {/* Top Gold Line */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[var(--gold)] to-transparent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                <div className="w-14 h-14 bg-[var(--charcoal)] border border-[var(--gold)]/20 flex items-center justify-center text-[var(--gold)] mb-5 group-hover:bg-[var(--gold)] group-hover:text-[var(--charcoal-dark)] transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="font-[var(--font-display)] text-xl text-[var(--cream)] mb-3">{feature.title}</h3>
                <p className="text-[var(--cream)]/50 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
