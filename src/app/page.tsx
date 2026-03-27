import { getShop, getShopHours, getServices } from '@/lib/supabase'
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import About from '@/components/About'
import Hours from '@/components/Hours'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default async function Home() {
  const shopSlug = process.env.NEXT_PUBLIC_SHOP_SLUG || 'good-look-barber'

  const shop = await getShop(shopSlug)

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Shop not found</p>
      </div>
    )
  }

  const [hours, services] = await Promise.all([
    getShopHours(shop.id),
    getServices(shop.id),
  ])

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
      <About shopName={shop.name} />
      <Hours hours={hours} phone={shop.phone} />
      <Contact shop={shop} />
      <Footer shop={shop} />
    </main>
  )
}
