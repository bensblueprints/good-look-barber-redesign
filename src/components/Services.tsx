'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Clock, DollarSign, ArrowRight, Scissors, Sparkles, Crown, Users } from 'lucide-react'
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
  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    const categoryName = service.category?.name || 'Other'
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(service)
    return acc
  }, {} as Record<string, Service[]>)

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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[#02537E] font-semibold tracking-wider uppercase text-sm">
            What We Offer
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#161616] mt-2 mb-4">
            Our Services
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Experience premium grooming services tailored to your style. From classic cuts to VIP packages, we have something for everyone.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {services.map((service) => (
            <motion.div
              key={service.id}
              variants={itemVariants}
              className="group bg-gray-50 rounded-xl p-6 hover:bg-[#02537E] transition-all duration-300 hover:shadow-xl hover:shadow-[#02537E]/20"
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-[#02537E] group-hover:bg-white rounded-lg flex items-center justify-center mb-4 text-white group-hover:text-[#02537E] transition-colors">
                {categoryIcons[service.category?.name || 'default'] || categoryIcons.default}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-[#161616] group-hover:text-white mb-2 transition-colors">
                {service.name}
              </h3>
              <p className="text-gray-600 group-hover:text-white/80 mb-4 text-sm transition-colors">
                {service.description}
              </p>

              {/* Price & Duration */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 group-hover:border-white/20 transition-colors">
                <div className="flex items-center gap-2 text-[#02537E] group-hover:text-white transition-colors">
                  <DollarSign size={18} />
                  <span className="text-2xl font-bold">{service.price.toFixed(0)}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 group-hover:text-white/70 text-sm transition-colors">
                  <Clock size={14} />
                  <span>{service.duration} min</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 bg-[#161616] text-white px-8 py-4 rounded-md font-semibold hover:bg-[#161616]/90 transition-colors"
            >
              Book Your Service
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
