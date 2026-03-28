'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone, Clock, MapPin } from 'lucide-react'

interface NavigationProps {
  shopName: string
  phone: string
  address: string
}

export default function Navigation({ shopName, phone, address }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '#services', label: 'Services' },
    { href: '#gallery', label: 'Gallery' },
    { href: '#reviews', label: 'Reviews' },
    { href: '#contact', label: 'Contact' },
    { href: '/book', label: 'Book Now', isButton: true },
  ]

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[var(--charcoal)] text-[var(--cream)]/80 py-2.5 px-4 text-sm hidden md:block border-b border-[var(--gold)]/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <a
              href={`tel:${phone.replace(/[^0-9]/g, '')}`}
              className="flex items-center gap-2 hover:text-[var(--gold)] transition-colors duration-300"
            >
              <Phone size={14} className="text-[var(--gold)]" />
              <span className="tracking-wider">{phone}</span>
            </a>
            <span className="flex items-center gap-2">
              <MapPin size={14} className="text-[var(--gold)]" />
              <span className="tracking-wider">{address}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[var(--gold)]" />
            <span className="tracking-wider">Tue-Sat: 10AM - 6PM</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <motion.nav
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[var(--charcoal-dark)]/98 backdrop-blur-md shadow-lg shadow-black/10'
            : 'bg-[var(--charcoal-dark)]'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Gold accent line */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Image
                  src="/logo.png"
                  alt={shopName}
                  width={160}
                  height={60}
                  className="h-14 w-auto"
                  priority
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                link.isButton ? (
                  <motion.div
                    key={link.href}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Link href={link.href} className="btn-luxury">
                      {link.label}
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    key={link.href}
                    whileHover={{ y: -2 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <Link
                      href={link.href}
                      className="text-[var(--cream)]/80 hover:text-[var(--gold)] font-[var(--font-body)] text-sm tracking-[0.1em] uppercase transition-colors duration-300 relative group"
                    >
                      {link.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-px bg-[var(--gold)] transition-all duration-300 group-hover:w-full" />
                    </Link>
                  </motion.div>
                )
              ))}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden text-[var(--cream)] p-2"
              onClick={() => setIsOpen(!isOpen)}
              whileTap={{ scale: 0.9 }}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden bg-[var(--charcoal-dark)] border-t border-[var(--gold)]/10"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 py-8 space-y-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block py-4 text-lg tracking-wider ${
                        link.isButton
                          ? 'btn-luxury text-center mt-4'
                          : 'text-[var(--cream)]/80 hover:text-[var(--gold)] border-b border-[var(--gold)]/10 font-[var(--font-body)]'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile Contact Info */}
                <div className="pt-6 mt-4 border-t border-[var(--gold)]/10 space-y-4 text-[var(--cream)]/60">
                  <a
                    href={`tel:${phone.replace(/[^0-9]/g, '')}`}
                    className="flex items-center gap-3 hover:text-[var(--gold)] transition-colors"
                  >
                    <Phone size={18} className="text-[var(--gold)]" />
                    <span className="tracking-wider">{phone}</span>
                  </a>
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-[var(--gold)]" />
                    <span className="tracking-wider">{address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-[var(--gold)]" />
                    <span className="tracking-wider">Tue-Sat: 10AM - 6PM</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  )
}
