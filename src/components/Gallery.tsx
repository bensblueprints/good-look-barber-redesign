'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const galleryImages = [
  {
    src: '/gallery/haircut-1.jpg',
    alt: 'Professional fade haircut',
    title: 'Classic Fade'
  },
  {
    src: '/gallery/stock-1.jpg',
    alt: 'Barber styling client hair',
    title: 'Precision Styling'
  },
  {
    src: '/gallery/stock-2.jpg',
    alt: 'VIP grooming service',
    title: 'VIP Treatment'
  },
]

export default function Gallery() {
  return (
    <section id="gallery" className="py-20 bg-[#161616]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Our Work
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Check out some of our finest cuts and styles. Every client leaves looking sharp.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.src}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-xl aspect-[4/5]"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-xl font-semibold">{image.title}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
