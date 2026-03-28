'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { Star, ChevronDown } from 'lucide-react'

interface HeroProps {
  shopName: string
  tagline: string
  heroUrl: string
}

export default function Hero({ shopName, tagline, heroUrl }: HeroProps) {
  const { scrollY } = useScroll()
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--charcoal-dark)]">
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroUrl})`,
          y: backgroundY
        }}
      >
        {/* Elegant Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--charcoal-dark)]/80 via-[var(--charcoal)]/70 to-[var(--charcoal-dark)]" />

        {/* Grain Texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 400 400%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]" />
      </motion.div>

      {/* Art Deco Corner Elements */}
      <div className="art-deco-corner top-left" />
      <div className="art-deco-corner top-right" />
      <div className="art-deco-corner bottom-left" />
      <div className="art-deco-corner bottom-right" />

      {/* Floating Decorative Lines */}
      <motion.div
        className="absolute top-1/4 left-8 w-px h-32 bg-gradient-to-b from-transparent via-[var(--gold)] to-transparent"
        animate={{ opacity: [0.3, 0.6, 0.3], y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 right-12 w-px h-24 bg-gradient-to-b from-transparent via-[var(--gold)] to-transparent"
        animate={{ opacity: [0.2, 0.5, 0.2], y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Main Content */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center"
        style={{ opacity }}
      >
        {/* Rating Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 bg-[var(--charcoal)]/60 backdrop-blur-sm border border-[var(--gold)]/30 rounded-full px-4 py-2 mb-8"
        >
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={`${i < 4 ? 'fill-[var(--gold)] text-[var(--gold)]' : 'fill-[var(--gold)]/60 text-[var(--gold)]/60'}`}
              />
            ))}
          </div>
          <span className="text-[var(--gold)] text-sm font-medium">4.6</span>
          <span className="text-[var(--cream)]/60 text-sm">from 316+ reviews</span>
        </motion.div>

        {/* Elegant Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-6"
        >
          <span className="text-[var(--gold)] font-[var(--font-elegant)] text-lg md:text-xl tracking-[0.3em] uppercase">
            Est. 2008 - Marietta, Georgia
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="font-[var(--font-display)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-[var(--cream)] mb-6 leading-[1.1]"
        >
          <span className="block">{shopName.split(' ').slice(0, 2).join(' ')}</span>
          <span className="text-gold-gradient">{shopName.split(' ').slice(2).join(' ') || 'Barber Shop'}</span>
        </motion.h1>

        {/* Elegant Divider */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 80 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent mx-auto mb-6"
        />

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="font-[var(--font-elegant)] text-xl md:text-2xl lg:text-3xl text-[var(--cream)]/80 mb-12 max-w-2xl mx-auto italic"
        >
          {tagline || "Where tradition meets precision"}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link href="/book" className="btn-luxury-filled">
              Reserve Your Chair
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link href="#services" className="btn-luxury">
              Explore Services
            </Link>
          </motion.div>
        </motion.div>

        {/* Experience Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          {[
            { value: '17+', label: 'Years of Excellence' },
            { value: '10K+', label: 'Satisfied Clients' },
            { value: '5', label: 'Master Barbers' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + index * 0.15, type: "spring", stiffness: 200 }}
              className="text-center"
            >
              <div className="font-[var(--font-display)] text-3xl md:text-4xl text-[var(--gold)] mb-2">
                {stat.value}
              </div>
              <div className="text-[var(--cream)]/50 text-xs md:text-sm tracking-wider uppercase">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="text-[var(--cream)]/40 text-xs tracking-[0.2em] uppercase">Scroll</span>
          <ChevronDown className="w-5 h-5 text-[var(--gold)]" />
        </motion.div>
      </motion.div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--cream)] to-transparent" />
    </section>
  )
}
