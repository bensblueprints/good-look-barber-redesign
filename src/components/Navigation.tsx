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
      <div className="bg-[#02537E] text-white py-2 px-4 text-sm hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href={`tel:${phone.replace(/[^0-9]/g, '')}`} className="flex items-center gap-2 hover:text-white/80 transition-colors">
              <Phone size={14} />
              <span>{phone}</span>
            </a>
            <span className="flex items-center gap-2">
              <MapPin size={14} />
              <span>{address}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>Tue-Sat: 10AM - 6PM</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <motion.nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#161616]/95 backdrop-blur-md shadow-lg' : 'bg-[#161616]'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                link.isButton ? (
                  <motion.div key={link.href} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href={link.href}
                      className="bg-[#02537E] text-white px-6 py-3 rounded-md font-semibold hover:bg-[#02537E]/90 transition-colors"
                    >
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
                      className="text-white/90 hover:text-white font-medium transition-colors relative group"
                    >
                      {link.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#02537E] transition-all group-hover:w-full" />
                    </Link>
                  </motion.div>
                )
              ))}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden text-white p-2"
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
              className="md:hidden bg-[#161616] border-t border-white/10"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 py-6 space-y-4">
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
                      className={`block py-3 text-lg ${
                        link.isButton
                          ? 'bg-[#02537E] text-white text-center rounded-md font-semibold'
                          : 'text-white/90 hover:text-white border-b border-white/10'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile Contact Info */}
                <div className="pt-4 space-y-3 text-white/70">
                  <a href={`tel:${phone.replace(/[^0-9]/g, '')}`} className="flex items-center gap-3">
                    <Phone size={18} />
                    <span>{phone}</span>
                  </a>
                  <div className="flex items-center gap-3">
                    <MapPin size={18} />
                    <span>{address}</span>
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
