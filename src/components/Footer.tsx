'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin } from 'lucide-react'
import type { Shop } from '@/lib/supabase'

interface FooterProps {
  shop: Shop
}

// Custom social icons
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

export default function Footer({ shop }: FooterProps) {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    {
      title: 'Navigation',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Services', href: '#services' },
        { label: 'Gallery', href: '#gallery' },
        { label: 'Reviews', href: '#reviews' },
        { label: 'Contact', href: '#contact' },
      ],
    },
    {
      title: 'Services',
      links: [
        { label: 'Haircuts', href: '#services' },
        { label: 'Beard Grooming', href: '#services' },
        { label: 'Hot Shave', href: '#services' },
        { label: 'VIP Packages', href: '#services' },
        { label: 'Kids Cuts', href: '#services' },
      ],
    },
  ]

  return (
    <footer className="bg-[var(--charcoal-dark)] text-[var(--cream)]">
      {/* Top Gold Line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent" />

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <Image
              src="/logo.png"
              alt={shop.name}
              width={160}
              height={60}
              className="h-12 w-auto mb-6"
            />
            <p className="font-[var(--font-elegant)] text-[var(--cream)]/60 mb-8 italic">
              {shop.tagline}
            </p>
            <div className="flex gap-3">
              {[FacebookIcon, InstagramIcon, XIcon].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  className="w-10 h-10 bg-[var(--charcoal)] border border-[var(--gold)]/20 flex items-center justify-center text-[var(--cream)]/60 hover:bg-[var(--gold)] hover:text-[var(--charcoal-dark)] hover:border-[var(--gold)] transition-all duration-300"
                  whileHover={{ y: -3 }}
                >
                  <Icon />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Link Columns */}
          {footerLinks.map((column, columnIndex) => (
            <motion.div
              key={column.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: columnIndex * 0.1 }}
            >
              <h4 className="font-[var(--font-display)] text-lg text-[var(--cream)] mb-6">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[var(--cream)]/50 hover:text-[var(--gold)] transition-colors duration-300 text-sm tracking-wider"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Contact Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-[var(--font-display)] text-lg text-[var(--cream)] mb-6">Contact</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href={`tel:${shop.phone.replace(/[^0-9]/g, '')}`}
                  className="flex items-center gap-3 text-[var(--cream)]/50 hover:text-[var(--gold)] transition-colors group"
                >
                  <Phone size={16} className="text-[var(--gold)]" />
                  <span className="text-sm tracking-wider">{shop.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${shop.email}`}
                  className="flex items-center gap-3 text-[var(--cream)]/50 hover:text-[var(--gold)] transition-colors group"
                >
                  <Mail size={16} className="text-[var(--gold)]" />
                  <span className="text-sm tracking-wider">{shop.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-[var(--cream)]/50">
                <MapPin size={16} className="text-[var(--gold)] flex-shrink-0 mt-0.5" />
                <span className="text-sm tracking-wider leading-relaxed">
                  {shop.address_street}<br />
                  {shop.address_city}, {shop.address_state} {shop.address_zip}
                </span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[var(--gold)]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[var(--cream)]/30 text-xs tracking-wider">
              &copy; {currentYear} {shop.name}. All rights reserved.
            </p>
            <div className="flex gap-8 text-[var(--cream)]/30 text-xs tracking-wider">
              <Link href="/privacy" className="hover:text-[var(--gold)] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-[var(--gold)] transition-colors">
                Terms of Service
              </Link>
              <Link href="/admin" className="hover:text-[var(--gold)] transition-colors">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
