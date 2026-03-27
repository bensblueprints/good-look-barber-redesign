'use client'

import { motion } from 'framer-motion'
import { Award, Users, Clock, Star } from 'lucide-react'

interface AboutProps {
  shopName: string
}

export default function About({ shopName }: AboutProps) {
  const features = [
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Expert Barbers',
      description: 'Our team of skilled professionals brings years of experience and passion to every cut.',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Personalized Service',
      description: 'We take the time to understand your style preferences and deliver exactly what you want.',
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Flexible Scheduling',
      description: 'Book online 24/7 or walk in during business hours. We work around your schedule.',
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'Premium Products',
      description: 'We use only the finest grooming products to ensure the best results for your hair and skin.',
    },
  ]

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#02537E] font-semibold tracking-wider uppercase text-sm">
              About Us
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#161616] mt-2 mb-6">
              More Than Just a Barbershop
            </h2>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              At {shopName}, we believe that a great haircut is more than just a service it is an experience. Our expert barbers combine traditional techniques with modern styles to create looks that are uniquely you.
            </p>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Since opening our doors, we have been dedicated to providing exceptional grooming services in a welcoming atmosphere. Whether you are coming in for a quick trim or our signature VIP package, you will leave looking and feeling your best.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { value: '15+', label: 'Years' },
                { value: '5K+', label: 'Clients' },
                { value: '4.9', label: 'Rating' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center p-4 bg-white rounded-lg shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-3xl font-bold text-[#02537E]">{stat.value}</div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            className="grid sm:grid-cols-2 gap-6"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="w-14 h-14 bg-[#02537E]/10 rounded-lg flex items-center justify-center text-[#02537E] mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-[#161616] mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
