'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

const galleryImages = [
  {
    src: '/gallery/cut-1.webp',
    alt: 'Modern textured fade with styled top',
    title: 'Textured Fade',
    category: 'Signature Cut'
  },
  {
    src: '/gallery/cut-2.webp',
    alt: 'Clean low fade with precise line-up',
    title: 'Low Fade',
    category: 'Classic Cut'
  },
  {
    src: '/gallery/cut-3.webp',
    alt: 'Sharp taper fade with beard trim',
    title: 'Taper & Beard',
    category: 'Premium Service'
  },
  {
    src: '/gallery/cut-4.webp',
    alt: 'High skin fade with textured top',
    title: 'High Fade',
    category: 'Signature Cut'
  },
  {
    src: '/gallery/cut-5.webp',
    alt: 'Mid fade with natural texture',
    title: 'Natural Texture',
    category: 'Classic Cut'
  },
  {
    src: '/gallery/cut-6.webp',
    alt: 'Crisp line-up with shadow fade',
    title: 'Shadow Fade',
    category: 'Signature Cut'
  },
  {
    src: '/gallery/portrait-1.webp',
    alt: 'Executive business cut styling',
    title: 'Executive Style',
    category: 'VIP Package'
  },
  {
    src: '/gallery/portrait-2.webp',
    alt: 'Modern pompadour with clean sides',
    title: 'Modern Pompadour',
    category: 'Premium Service'
  },
  {
    src: '/gallery/style-1.webp',
    alt: 'Trendy messy top with fade',
    title: 'Messy Top Fade',
    category: 'Signature Cut'
  },
  {
    src: '/gallery/style-2.webp',
    alt: 'Classic side part gentleman cut',
    title: 'Gentleman Cut',
    category: 'Classic Cut'
  },
  {
    src: '/gallery/square-1.webp',
    alt: 'Precision beard sculpting',
    title: 'Beard Sculpt',
    category: 'Premium Service'
  },
  {
    src: '/gallery/square-2.webp',
    alt: 'Full grooming transformation',
    title: 'Full Transformation',
    category: 'VIP Package'
  },
]

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  }

  const openLightbox = (index: number) => setSelectedImage(index)
  const closeLightbox = () => setSelectedImage(null)
  const nextImage = () => setSelectedImage((prev) => prev !== null ? (prev + 1) % galleryImages.length : null)
  const prevImage = () => setSelectedImage((prev) => prev !== null ? (prev - 1 + galleryImages.length) % galleryImages.length : null)

  return (
    <>
      <section id="gallery" className="py-24 bg-[var(--charcoal)] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--gold) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Decorative Lines */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent" />

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
              Portfolio
            </motion.span>

            <motion.h2
              className="font-[var(--font-display)] text-4xl md:text-5xl lg:text-6xl text-[var(--cream)] mt-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Our <span className="text-gold-gradient">Work</span>
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
              Witness the artistry. Every cut tells a story of precision and style.
            </motion.p>
          </motion.div>

          {/* Gallery Grid */}
          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {galleryImages.map((image, index) => (
              <motion.div
                key={image.src}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  {/* Frame Border */}
                  <div className="absolute inset-0 border border-[var(--gold)]/20 group-hover:border-[var(--gold)]/50 transition-colors duration-500 z-10 pointer-events-none" />

                  {/* Corner Accents */}
                  <div className="absolute top-2 left-2 w-8 h-8 border-t border-l border-[var(--gold)]/40 z-10" />
                  <div className="absolute top-2 right-2 w-8 h-8 border-t border-r border-[var(--gold)]/40 z-10" />
                  <div className="absolute bottom-2 left-2 w-8 h-8 border-b border-l border-[var(--gold)]/40 z-10" />
                  <div className="absolute bottom-2 right-2 w-8 h-8 border-b border-r border-[var(--gold)]/40 z-10" />

                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--charcoal-dark)] via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-[var(--gold)] text-xs tracking-[0.2em] uppercase block mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      {image.category}
                    </span>
                    <h3 className="font-[var(--font-display)] text-2xl text-[var(--cream)]">
                      {image.title}
                    </h3>
                    <div className="w-8 h-px bg-[var(--gold)] mt-3 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-200 origin-left" />
                  </div>

                  {/* View indicator */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-[var(--gold)] flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-500">
                    <span className="text-[var(--gold)] text-xs tracking-wider uppercase">View</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[var(--charcoal-dark)]/95 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center text-[var(--cream)] hover:text-[var(--gold)] transition-colors"
            onClick={closeLightbox}
          >
            <X size={28} />
          </button>

          {/* Navigation */}
          <button
            className="absolute left-4 md:left-8 w-12 h-12 flex items-center justify-center text-[var(--cream)] hover:text-[var(--gold)] transition-colors"
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
          >
            <ChevronLeft size={32} />
          </button>

          <button
            className="absolute right-4 md:right-8 w-12 h-12 flex items-center justify-center text-[var(--cream)] hover:text-[var(--gold)] transition-colors"
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
          >
            <ChevronRight size={32} />
          </button>

          {/* Image */}
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-4xl w-full aspect-[4/5] max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={galleryImages[selectedImage].src}
              alt={galleryImages[selectedImage].alt}
              fill
              className="object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[var(--charcoal-dark)] to-transparent">
              <h3 className="font-[var(--font-display)] text-2xl text-[var(--cream)] text-center">
                {galleryImages[selectedImage].title}
              </h3>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}
