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
  return (
    <section id="reviews" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#161616] mb-4">
            What Our Clients Say
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-semibold text-[#161616]">4.6</span>
            <span className="text-gray-500">from 316+ reviews</span>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Serving the Marietta community since 2008 with professional grooming services.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-2xl p-6 relative"
            >
              <Quote className="absolute top-6 right-6 text-[#02537E]/10 w-12 h-12" />
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 relative z-10">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#161616]">{review.name}</p>
                  <p className="text-sm text-gray-500">{review.date}</p>
                </div>
                <div className="w-10 h-10 bg-[#02537E] rounded-full flex items-center justify-center text-white font-bold">
                  {review.name.charAt(0)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <a
            href="https://www.yelp.com/biz/good-look-barber-shop-marietta"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#02537E] hover:text-[#023c5c] font-semibold transition-colors"
          >
            See all reviews on Yelp
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
