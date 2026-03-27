'use client'

import { useState, useEffect } from 'react'
import { getShop, getShopHours, getServices, type Shop, type ShopHours, type Service } from '@/lib/supabase'
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import Gallery from '@/components/Gallery'
import Reviews from '@/components/Reviews'
import About from '@/components/About'
import Hours from '@/components/Hours'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function Home() {
  const [shop, setShop] = useState<Shop | null>(null)
  const [hours, setHours] = useState<ShopHours[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const shopSlug = process.env.NEXT_PUBLIC_SHOP_SLUG || 'good-look-barber'
        const shopData = await getShop(shopSlug)

        if (!shopData) {
          setError('Shop not found')
          setLoading(false)
          return
        }

        setShop(shopData)

        const [hoursData, servicesData] = await Promise.all([
          getShopHours(shopData.id),
          getServices(shopData.id),
        ])

        setHours(hoursData)
        setServices(servicesData)
        setLoading(false)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load shop data')
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#02537E] to-[#161616]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">{error || 'Shop not found'}</p>
      </div>
    )
  }

  const fullAddress = `${shop.address_street}, ${shop.address_city}, ${shop.address_state}`

  return (
    <main className="min-h-screen">
      <Navigation
        shopName={shop.name}
        phone={shop.phone}
        address={fullAddress}
      />
      <Hero
        shopName={shop.name}
        tagline={shop.tagline}
        heroUrl="/hero.jpg"
      />
      <Services services={services} />
      <Gallery />
      <Reviews />
      <About shopName={shop.name} />
      <Hours hours={hours} phone={shop.phone} />
      <Contact shop={shop} />
      <Footer shop={shop} />
    </main>
  )
}
