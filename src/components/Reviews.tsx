'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const reviews = [
  {
    name: 'Marcus T.',
    rating: 5,
    text: 'Maurice is one of the best barbers I have ever had. He\'s very professional and his cutting skills are on point.',
    date: 'February 2026'
  },
  {
    name: 'David R.',
    rating: 5,
    text: 'Phenomenal Barbers in an extremely comfortable and welcoming shop! First time I visited and I couldn\'t have asked for a better experience! Look good, feel good and I\'ll be a regular for a long time coming.',
    date: 'January 2026'
  },
  {
    name: 'James K.',
    rating: 5,
    text: 'I spent months bouncing from barbershop to barbershop before finding Good Look. Great cuts and great staff - I won\'t be going anywhere else.',
    date: 'December 2025'
  },
  {
    name: 'Anthony M.',
    rating: 5,
    text: 'The talented barbers provided a flawless haircut and a personalized experience. The attention to detail and friendly atmosphere make this the best barber in Marietta.',
    date: 'November 2025'
  },
]

export default function Reviews() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  return (
    <section id="reviews" className="py-24 bg-[var(--cream)] relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 border border-[var(--gold)]/10 rounded-full" />
      <div className="absolute bottom-1/4 -left-20 w-60 h-60 border border-[var(--gold)]/10 rounded-full" />

      {/* Top Border */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            className="text-[var(--gold)] font-[var(--font-elegant)] tracking-[0.3em] uppercase text-sm"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Testimonials
          </motion.span>

          <motion.h2
            className="font-[var(--font-display)] text-4xl md:text-5xl lg:text-6xl text-[var(--charcoal)] mt-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Client <span className="text-gold-gradient">Experiences</span>
          </motion.h2>

          {/* Elegant Divider */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 60 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent mx-auto mb-6"
          />

          {/* Rating Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={`${i < 4 ? 'fill-[var(--gold)] text-[var(--gold)]' : 'fill-[var(--gold)]/60 text-[var(--gold)]/60'}`}
                />
              ))}
              <span className="ml-2 font-[var(--font-display)] text-2xl text-[var(--charcoal)]">4.6</span>
            </div>
            <p className="text-[var(--charcoal)]/50 text-sm tracking-wider">
              FROM 316+ VERIFIED REVIEWS
            </p>
            <p className="font-[var(--font-elegant)] text-[var(--charcoal)]/70 max-w-xl mx-auto text-lg italic mt-2">
              Serving the Marietta community with excellence since 2008
            </p>
          </motion.div>
        </motion.div>

        {/* Reviews Grid */}
        <motion.div
          className="grid md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {reviews.map((review, index) => (
            <motion.div
              key={review.name}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group relative bg-white p-8 border border-[var(--charcoal)]/5 hover:border-[var(--gold)]/30 transition-all duration-500"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-8 right-8 w-12 h-12 text-[var(--gold)]/10 group-hover:text-[var(--gold)]/20 transition-colors duration-500" />

              {/* Top Gold Line */}
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[var(--gold)] to-transparent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 300 }}
                  >
                    <Star size={16} className="fill-[var(--gold)] text-[var(--gold)]" />
                  </motion.div>
                ))}
              </div>

              {/* Review Text */}
              <p className="font-[var(--font-elegant)] text-[var(--charcoal)]/80 text-lg leading-relaxed mb-8 italic">
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center justify-between pt-6 border-t border-[var(--charcoal)]/5">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-[var(--charcoal)] flex items-center justify-center text-[var(--gold)] font-[var(--font-display)] text-lg">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-[var(--font-body)] font-semibold text-[var(--charcoal)]">
                      {review.name}
                    </p>
                    <p className="text-[var(--charcoal)]/40 text-sm">
                      Verified Client
                    </p>
                  </div>
                </div>
                <span className="text-[var(--charcoal)]/30 text-sm">
                  {review.date}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <motion.a
            href="https://www.yelp.com/biz/good-look-barber-shop-marietta"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-[var(--charcoal)]/60 hover:text-[var(--gold)] font-[var(--font-body)] tracking-wider uppercase text-sm transition-colors duration-300 group"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span>Read All Reviews on Yelp</span>
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
