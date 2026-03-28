'use client'

import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO, startOfWeek, addDays, isSameDay } from 'date-fns'
import { Toaster, toast } from 'sonner'
import {
  Calendar,
  Clock,
  Users,
  Scissors,
  Settings,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  User,
  DollarSign,
  BarChart3,
  CalendarDays,
  AlertCircle,
  Search,
  RefreshCw,
  Lock,
  CalendarOff,
  UserPlus,
  ClipboardList,
  Tv,
  Armchair,
  Link,
  ExternalLink,
  Copy,
} from 'lucide-react'
import type { Shop, Service, Barber, Booking } from '@/lib/supabase'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
})

type Tab = 'dashboard' | 'bookings' | 'calendar' | 'services' | 'barbers' | 'customers' | 'blocked-times' | 'waitlist' | 'queue' | 'settings'

interface DashboardStats {
  todayBookings: number
  weekBookings: number
  monthRevenue: number
  pendingBookings: number
}

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  notes: string | null
  is_vip: boolean
  created_at: string
}

interface BlockedTime {
  id: string
  barber_id: string | null
  start_datetime: string
  end_datetime: string
  reason: string | null
  is_recurring: boolean
}

// API fetch functions
const fetchServices = async (): Promise<Service[]> => {
  const res = await fetch('/api/admin/services')
  if (!res.ok) throw new Error('Failed to fetch services')
  return res.json()
}

const fetchBarbers = async (): Promise<Barber[]> => {
  const res = await fetch('/api/admin/barbers')
  if (!res.ok) throw new Error('Failed to fetch barbers')
  return res.json()
}

const fetchBookings = async (): Promise<Booking[]> => {
  const res = await fetch('/api/admin/bookings')
  if (!res.ok) throw new Error('Failed to fetch bookings')
  return res.json()
}

const fetchSettings = async (): Promise<Shop> => {
  const res = await fetch('/api/admin/settings')
  if (!res.ok) throw new Error('Failed to fetch settings')
  return res.json()
}

const fetchCustomers = async (): Promise<Customer[]> => {
  const res = await fetch('/api/admin/customers')
  if (!res.ok) throw new Error('Failed to fetch customers')
  return res.json()
}

const fetchBlockedTimes = async (): Promise<BlockedTime[]> => {
  const res = await fetch('/api/admin/blocked-times')
  if (!res.ok) throw new Error('Failed to fetch blocked times')
  return res.json()
}

function AdminDashboard() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(true)

  // Modal states
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [showBarberModal, setShowBarberModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showBlockedTimeModal, setShowBlockedTimeModal] = useState(false)
  const [showCalendarSyncModal, setShowCalendarSyncModal] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [calendarSyncBarber, setCalendarSyncBarber] = useState<Barber | null>(null)
  const [icalSettings, setIcalSettings] = useState<{ enabled: boolean; feedUrl: string | null } | null>(null)

  // Calendar state
  const [calendarDate, setCalendarDate] = useState(new Date())

  // Filter state
  const [bookingFilter, setBookingFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Queries
  const { data: shop } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings, enabled: isAuthenticated })
  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: fetchServices, enabled: isAuthenticated })
  const { data: barbers = [] } = useQuery({ queryKey: ['barbers'], queryFn: fetchBarbers, enabled: isAuthenticated })
  const { data: bookings = [] } = useQuery({ queryKey: ['bookings'], queryFn: fetchBookings, enabled: isAuthenticated })
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: fetchCustomers, enabled: isAuthenticated })
  const { data: blockedTimes = [] } = useQuery({ queryKey: ['blockedTimes'], queryFn: fetchBlockedTimes, enabled: isAuthenticated })

  // Service Mutations
  const createServiceMutation = useMutation({
    mutationFn: async (service: Partial<Service>) => {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service),
      })
      if (!res.ok) throw new Error('Failed to create service')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('Service created successfully')
      setShowServiceModal(false)
      setIsCreating(false)
    },
    onError: () => toast.error('Failed to create service'),
  })

  const updateServiceMutation = useMutation({
    mutationFn: async (service: Partial<Service> & { id: string }) => {
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service),
      })
      if (!res.ok) throw new Error('Failed to update service')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('Service updated successfully')
      setShowServiceModal(false)
    },
    onError: () => toast.error('Failed to update service'),
  })

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete service')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('Service deleted successfully')
    },
    onError: () => toast.error('Failed to delete service'),
  })

  // Barber Mutations
  const createBarberMutation = useMutation({
    mutationFn: async (barber: Partial<Barber>) => {
      const res = await fetch('/api/admin/barbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(barber),
      })
      if (!res.ok) throw new Error('Failed to create barber')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barbers'] })
      toast.success('Barber added successfully')
      setShowBarberModal(false)
      setIsCreating(false)
    },
    onError: () => toast.error('Failed to add barber'),
  })

  const updateBarberMutation = useMutation({
    mutationFn: async (barber: Partial<Barber> & { id: string }) => {
      const res = await fetch(`/api/admin/barbers/${barber.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(barber),
      })
      if (!res.ok) throw new Error('Failed to update barber')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barbers'] })
      toast.success('Barber updated successfully')
      setShowBarberModal(false)
    },
    onError: () => toast.error('Failed to update barber'),
  })

  const deleteBarberMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/barbers/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete barber')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barbers'] })
      toast.success('Barber removed successfully')
    },
    onError: () => toast.error('Failed to remove barber'),
  })

  // Booking Mutations
  const createBookingMutation = useMutation({
    mutationFn: async (booking: Partial<Booking>) => {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      })
      if (!res.ok) throw new Error('Failed to create booking')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Booking created successfully')
      setShowBookingModal(false)
      setIsCreating(false)
    },
    onError: () => toast.error('Failed to create booking'),
  })

  const updateBookingMutation = useMutation({
    mutationFn: async (booking: Partial<Booking> & { id: string }) => {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      })
      if (!res.ok) throw new Error('Failed to update booking')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Booking updated successfully')
      setShowBookingModal(false)
    },
    onError: () => toast.error('Failed to update booking'),
  })

  const deleteBookingMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete booking')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Booking deleted successfully')
    },
    onError: () => toast.error('Failed to delete booking'),
  })

  // Customer Mutations
  const createCustomerMutation = useMutation({
    mutationFn: async (customer: Partial<Customer>) => {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      })
      if (!res.ok) throw new Error('Failed to create customer')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer added successfully')
      setShowCustomerModal(false)
      setIsCreating(false)
    },
    onError: () => toast.error('Failed to add customer'),
  })

  const updateCustomerMutation = useMutation({
    mutationFn: async (customer: Partial<Customer> & { id: string }) => {
      const res = await fetch(`/api/admin/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      })
      if (!res.ok) throw new Error('Failed to update customer')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer updated successfully')
      setShowCustomerModal(false)
    },
    onError: () => toast.error('Failed to update customer'),
  })

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/customers/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete customer')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer deleted successfully')
    },
    onError: () => toast.error('Failed to delete customer'),
  })

  // Blocked Time Mutations
  const createBlockedTimeMutation = useMutation({
    mutationFn: async (blockedTime: Partial<BlockedTime>) => {
      const res = await fetch('/api/admin/blocked-times', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blockedTime),
      })
      if (!res.ok) throw new Error('Failed to create blocked time')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedTimes'] })
      toast.success('Time blocked successfully')
      setShowBlockedTimeModal(false)
    },
    onError: () => toast.error('Failed to block time'),
  })

  const deleteBlockedTimeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/blocked-times/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete blocked time')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedTimes'] })
      toast.success('Blocked time removed')
    },
    onError: () => toast.error('Failed to remove blocked time'),
  })

  // Settings Mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<Shop>) => {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error('Failed to update settings')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Settings saved successfully')
    },
    onError: () => toast.error('Failed to save settings'),
  })

  // Check auth on load
  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth')
    if (auth === 'authenticated') {
      setIsAuthenticated(true)
    }
    setAuthLoading(false)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'GoodLook2024!') {
      sessionStorage.setItem('admin_auth', 'authenticated')
      setIsAuthenticated(true)
      setAuthError('')
    } else {
      setAuthError('Invalid password')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth')
    setIsAuthenticated(false)
  }

  // Calculate stats
  const stats: DashboardStats = (() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd')
    const monthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd')

    const todayBookings = bookings.filter(b => b.booking_date === today).length
    const weekBookings = bookings.filter(b => b.booking_date >= weekStart).length
    const monthRevenue = bookings
      .filter(b => b.booking_date >= monthStart && (b.status === 'completed' || b.status === 'confirmed'))
      .reduce((sum, b) => sum + b.price, 0)
    const pendingBookings = bookings.filter(b => b.status === 'pending').length

    return { todayBookings, weekBookings, monthRevenue, pendingBookings }
  })()

  const filteredBookings = bookings.filter(b => {
    if (bookingFilter !== 'all' && b.status !== bookingFilter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        b.customer_name.toLowerCase().includes(query) ||
        b.customer_email.toLowerCase().includes(query) ||
        b.customer_phone.includes(query)
      )
    }
    return true
  })

  const getBarberName = (barberId: string) => barbers.find(b => b.id === barberId)?.name || 'Unknown'
  const getServiceName = (serviceId: string) => services.find(s => s.id === serviceId)?.name || 'Unknown'

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-gray-100 text-gray-800',
  }

  // Login Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-[var(--gold)]" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--charcoal)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-[var(--charcoal-light)] border border-[var(--gold)]/20 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[var(--gold)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-[var(--gold)]" />
              </div>
              <h1 className="font-[var(--font-display)] text-2xl text-[var(--cream)]">Admin Access</h1>
              <p className="text-[var(--cream)]/60 text-sm mt-2">Enter your password to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 bg-[var(--charcoal)] border border-[var(--gold)]/30 text-[var(--cream)] placeholder-[var(--cream)]/40 focus:border-[var(--gold)] focus:outline-none"
                />
              </div>

              {authError && (
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {authError}
                </p>
              )}

              <button type="submit" className="w-full btn-luxury-filled py-3">
                Access Dashboard
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" richColors />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[var(--charcoal)] text-[var(--cream)] z-40 overflow-y-auto">
        <div className="p-6 border-b border-[var(--gold)]/20">
          <h1 className="font-[var(--font-display)] text-xl text-[var(--gold)]">{shop?.name || 'Loading...'}</h1>
          <p className="text-[var(--cream)]/60 text-sm">Admin Dashboard</p>
        </div>

        <nav className="p-4 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'bookings', label: 'Bookings', icon: CalendarDays, badge: stats.pendingBookings },
            { id: 'calendar', label: 'Calendar', icon: Calendar },
            { id: 'services', label: 'Services', icon: Scissors },
            { id: 'barbers', label: 'Barbers', icon: Users },
            { id: 'customers', label: 'Customers', icon: UserPlus },
            { id: 'blocked-times', label: 'Blocked Times', icon: CalendarOff },
            { id: 'waitlist', label: 'Waitlist', icon: ClipboardList },
            { id: 'queue', label: 'Walk-in Queue', icon: Tv },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-[var(--gold)] text-[var(--charcoal-dark)]'
                  : 'hover:bg-[var(--charcoal-light)] text-[var(--cream)]/80'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--gold)]/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-[var(--cream)]/60 hover:text-[var(--cream)] transition-colors"
          >
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <button
                onClick={() => queryClient.invalidateQueries()}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Today's Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.todayBookings}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CalendarDays className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">This Week</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.weekBookings}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Month Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.monthRevenue}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barber</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.slice(0, 5).map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{booking.customer_name}</p>
                            <p className="text-sm text-gray-500">{booking.customer_phone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{getServiceName(booking.service_id)}</td>
                        <td className="px-6 py-4 text-gray-600">{getBarberName(booking.barber_id)}</td>
                        <td className="px-6 py-4">
                          <p className="text-gray-900">{format(parseISO(booking.booking_date), 'MMM d, yyyy')}</p>
                          <p className="text-sm text-gray-500">{booking.start_time}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[booking.status]}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateBookingMutation.mutate({ id: booking.id, status: 'confirmed' })}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                  title="Confirm"
                                >
                                  <Check size={18} />
                                </button>
                                <button
                                  onClick={() => updateBookingMutation.mutate({ id: booking.id, status: 'cancelled' })}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Cancel"
                                >
                                  <X size={18} />
                                </button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => updateBookingMutation.mutate({ id: booking.id, status: 'completed' })}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Mark Complete"
                              >
                                <Check size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No bookings yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                  />
                </div>
                <select
                  value={bookingFilter}
                  onChange={(e) => setBookingFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={() => {
                    setSelectedBooking(null)
                    setIsCreating(true)
                    setShowBookingModal(true)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)] text-[var(--charcoal-dark)] rounded-lg font-medium"
                >
                  <Plus size={18} />
                  Add Booking
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barber</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{booking.customer_name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Phone size={12} /> {booking.customer_phone}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Mail size={12} /> {booking.customer_email}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{getServiceName(booking.service_id)}</td>
                        <td className="px-6 py-4 text-gray-600">{getBarberName(booking.barber_id)}</td>
                        <td className="px-6 py-4">
                          <p className="text-gray-900">{format(parseISO(booking.booking_date), 'MMM d, yyyy')}</p>
                          <p className="text-sm text-gray-500">{booking.start_time} - {booking.end_time}</p>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">${booking.price}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[booking.status]}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateBookingMutation.mutate({ id: booking.id, status: 'confirmed' })}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                  title="Confirm"
                                >
                                  <Check size={18} />
                                </button>
                                <button
                                  onClick={() => updateBookingMutation.mutate({ id: booking.id, status: 'cancelled' })}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Cancel"
                                >
                                  <X size={18} />
                                </button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => updateBookingMutation.mutate({ id: booking.id, status: 'completed' })}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Mark Complete"
                              >
                                <Check size={18} />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedBooking(booking)
                                setIsCreating(false)
                                setShowBookingModal(true)
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this booking?')) {
                                  deleteBookingMutation.mutate(booking.id)
                                }
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredBookings.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                          No bookings found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCalendarDate(addDays(calendarDate, -7))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="font-medium text-gray-900">
                  {format(startOfWeek(calendarDate), 'MMM d')} - {format(addDays(startOfWeek(calendarDate), 6), 'MMM d, yyyy')}
                </span>
                <button
                  onClick={() => setCalendarDate(addDays(calendarDate, 7))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight size={20} />
                </button>
                <button
                  onClick={() => setCalendarDate(new Date())}
                  className="px-4 py-2 bg-[var(--gold)] text-[var(--charcoal-dark)] rounded-lg font-medium"
                >
                  Today
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Week Header */}
              <div className="grid grid-cols-7 border-b border-gray-100">
                {Array.from({ length: 7 }).map((_, i) => {
                  const day = addDays(startOfWeek(calendarDate), i)
                  const isToday = isSameDay(day, new Date())
                  return (
                    <div
                      key={i}
                      className={`p-4 text-center border-r last:border-r-0 ${isToday ? 'bg-[var(--gold)]/10' : ''}`}
                    >
                      <p className="text-sm text-gray-500">{format(day, 'EEE')}</p>
                      <p className={`text-lg font-semibold ${isToday ? 'text-[var(--gold)]' : 'text-gray-900'}`}>
                        {format(day, 'd')}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Calendar Body */}
              <div className="grid grid-cols-7 min-h-[500px]">
                {Array.from({ length: 7 }).map((_, i) => {
                  const day = addDays(startOfWeek(calendarDate), i)
                  const dayStr = format(day, 'yyyy-MM-dd')
                  const dayBookings = bookings.filter(b => b.booking_date === dayStr)
                  const dayBlocked = blockedTimes.filter(bt => {
                    const startDate = bt.start_datetime.split('T')[0]
                    const endDate = bt.end_datetime.split('T')[0]
                    return dayStr >= startDate && dayStr <= endDate
                  })

                  return (
                    <div key={i} className="border-r last:border-r-0 p-2 space-y-1 min-h-[150px]">
                      {dayBlocked.map((bt) => (
                        <div
                          key={bt.id}
                          className="p-2 rounded text-xs bg-gray-200 text-gray-600 cursor-pointer"
                          onClick={() => {
                            if (confirm('Remove this blocked time?')) {
                              deleteBlockedTimeMutation.mutate(bt.id)
                            }
                          }}
                        >
                          <p className="font-medium">Blocked</p>
                          <p className="truncate opacity-75">{bt.reason || 'No reason'}</p>
                        </div>
                      ))}
                      {dayBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className={`p-2 rounded text-xs cursor-pointer ${
                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-600'
                          }`}
                          onClick={() => {
                            setSelectedBooking(booking)
                            setIsCreating(false)
                            setShowBookingModal(true)
                          }}
                        >
                          <p className="font-medium truncate">{booking.start_time}</p>
                          <p className="truncate">{booking.customer_name}</p>
                          <p className="truncate opacity-75">{getServiceName(booking.service_id)}</p>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Services</h2>
              <button
                onClick={() => {
                  setSelectedService(null)
                  setIsCreating(true)
                  setShowServiceModal(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)] text-[var(--charcoal-dark)] rounded-lg font-medium"
              >
                <Plus size={18} />
                Add Service
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      service.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Scissors size={20} />
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setSelectedService(service)
                          setIsCreating(false)
                          setShowServiceModal(true)
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this service?')) {
                            deleteServiceMutation.mutate(service.id)
                          }
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{service.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{service.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-2xl font-bold text-[var(--gold)]">${service.price}</span>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock size={14} />
                      {service.duration} min
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      service.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
              {services.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No services yet. Click "Add Service" to create one.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Barbers Tab */}
        {activeTab === 'barbers' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Barbers</h2>
              <button
                onClick={() => {
                  setSelectedBarber(null)
                  setIsCreating(true)
                  setShowBarberModal(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)] text-[var(--charcoal-dark)] rounded-lg font-medium"
              >
                <Plus size={18} />
                Add Barber
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {barbers.map((barber) => (
                <div key={barber.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      barber.is_active ? 'bg-[var(--gold)]/10 text-[var(--gold)]' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <User size={28} />
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setSelectedBarber(barber)
                          setIsCreating(false)
                          setShowBarberModal(true)
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to remove this barber?')) {
                            deleteBarberMutation.mutate(barber.id)
                          }
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{barber.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{barber.bio}</p>
                  {barber.email && (
                    <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                      <Mail size={14} /> {barber.email}
                    </p>
                  )}
                  {barber.phone && (
                    <p className="text-sm text-gray-600 flex items-center gap-2 mb-4">
                      <Phone size={14} /> {barber.phone}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      barber.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {barber.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {barber.accepts_online_booking && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        Online Booking
                      </span>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      setCalendarSyncBarber(barber)
                      // Fetch iCal settings
                      try {
                        const res = await fetch(`/api/admin/calendar/ical?barber_id=${barber.id}`)
                        const data = await res.json()
                        setIcalSettings(data)
                      } catch {
                        setIcalSettings(null)
                      }
                      setShowCalendarSyncModal(true)
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                  >
                    <CalendarDays size={16} />
                    Calendar Sync
                  </button>
                </div>
              ))}
              {barbers.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No barbers yet. Click "Add Barber" to add one.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
              <button
                onClick={() => {
                  setSelectedCustomer(null)
                  setIsCreating(true)
                  setShowCustomerModal(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)] text-[var(--charcoal-dark)] rounded-lg font-medium"
              >
                <Plus size={18} />
                Add Customer
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">VIP</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{customer.name}</td>
                        <td className="px-6 py-4 text-gray-600">{customer.email || '-'}</td>
                        <td className="px-6 py-4 text-gray-600">{customer.phone || '-'}</td>
                        <td className="px-6 py-4">
                          {customer.is_vip && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                              VIP
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {customer.notes || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedCustomer(customer)
                                setIsCreating(false)
                                setShowCustomerModal(true)
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this customer?')) {
                                  deleteCustomerMutation.mutate(customer.id)
                                }
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {customers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No customers yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Blocked Times Tab */}
        {activeTab === 'blocked-times' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Blocked Times / Time Off</h2>
              <button
                onClick={() => setShowBlockedTimeModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)] text-[var(--charcoal-dark)] rounded-lg font-medium"
              >
                <Plus size={18} />
                Block Time
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barber</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {blockedTimes.map((bt) => (
                      <tr key={bt.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {bt.barber_id ? getBarberName(bt.barber_id) : 'All Barbers'}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {format(parseISO(bt.start_datetime), 'MMM d, yyyy h:mm a')}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {format(parseISO(bt.end_datetime), 'MMM d, yyyy h:mm a')}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{bt.reason || '-'}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              if (confirm('Remove this blocked time?')) {
                                deleteBlockedTimeMutation.mutate(bt.id)
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {blockedTimes.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No blocked times yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Waitlist Tab */}
        {activeTab === 'waitlist' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Waitlist</h2>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Waitlist Coming Soon</h3>
              <p className="text-gray-500">This feature will allow customers to join a waitlist when no slots are available.</p>
            </div>
          </div>
        )}

        {/* Queue Tab */}
        {activeTab === 'queue' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Walk-in Queue</h2>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Tv className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Walk-in Queue Coming Soon</h3>
              <p className="text-gray-500">This feature will allow you to manage walk-in customers and display a queue on a TV screen.</p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && shop && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                updateSettingsMutation.mutate({
                  name: formData.get('name') as string,
                  tagline: formData.get('tagline') as string,
                  email: formData.get('email') as string,
                  phone: formData.get('phone') as string,
                  address_street: formData.get('address_street') as string,
                  address_city: formData.get('address_city') as string,
                  address_state: formData.get('address_state') as string,
                  address_zip: formData.get('address_zip') as string,
                  timezone: formData.get('timezone') as string,
                  settings: {
                    ...shop.settings,
                    advance_booking_days: parseInt(formData.get('advance_booking_days') as string) || 14,
                    booking_buffer_minutes: parseInt(formData.get('booking_buffer_minutes') as string) || 0,
                    cancellation_policy_hours: parseInt(formData.get('cancellation_policy_hours') as string) || 24,
                  },
                })
              }}
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Shop Information</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                    <input
                      name="name"
                      type="text"
                      defaultValue={shop.name}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                    <input
                      name="tagline"
                      type="text"
                      defaultValue={shop.tagline}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      name="email"
                      type="email"
                      defaultValue={shop.email}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      name="phone"
                      type="tel"
                      defaultValue={shop.phone}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <input
                      name="timezone"
                      type="text"
                      defaultValue={shop.timezone}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Address</h4>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <input
                        name="address_street"
                        type="text"
                        defaultValue={shop.address_street}
                        placeholder="Street"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <input
                        name="address_city"
                        type="text"
                        defaultValue={shop.address_city}
                        placeholder="City"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        name="address_state"
                        type="text"
                        defaultValue={shop.address_state}
                        placeholder="State"
                        className="w-20 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                      />
                      <input
                        name="address_zip"
                        type="text"
                        defaultValue={shop.address_zip}
                        placeholder="ZIP"
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Booking Settings</h3>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Advance Booking Days</label>
                    <input
                      name="advance_booking_days"
                      type="number"
                      defaultValue={shop.settings?.advance_booking_days || 14}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">How far in advance can customers book</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buffer Between Bookings (min)</label>
                    <input
                      name="booking_buffer_minutes"
                      type="number"
                      defaultValue={shop.settings?.booking_buffer_minutes || 0}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Time between appointments</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Policy (hours)</label>
                    <input
                      name="cancellation_policy_hours"
                      type="number"
                      defaultValue={shop.settings?.cancellation_policy_hours || 24}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Hours before appointment to cancel free</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={updateSettingsMutation.isPending}
                className="px-6 py-3 bg-[var(--gold)] text-[var(--charcoal-dark)] rounded-lg font-medium disabled:opacity-50"
              >
                {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Service Modal */}
      <AnimatePresence>
        {showServiceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowServiceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isCreating ? 'Add Service' : 'Edit Service'}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const data = {
                    name: formData.get('name') as string,
                    description: formData.get('description') as string,
                    price: parseFloat(formData.get('price') as string),
                    duration: parseInt(formData.get('duration') as string),
                    is_active: formData.get('is_active') === 'on',
                  }

                  if (isCreating) {
                    createServiceMutation.mutate(data)
                  } else if (selectedService) {
                    updateServiceMutation.mutate({ id: selectedService.id, ...data })
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={selectedService?.name || ''}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    defaultValue={selectedService?.description || ''}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      defaultValue={selectedService?.price || ''}
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                    <input
                      name="duration"
                      type="number"
                      defaultValue={selectedService?.duration || 30}
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    name="is_active"
                    type="checkbox"
                    defaultChecked={selectedService?.is_active ?? true}
                    className="w-4 h-4 text-[var(--gold)] border-gray-300 rounded focus:ring-[var(--gold)]"
                  />
                  <label className="text-sm text-gray-700">Active (visible to customers)</label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowServiceModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                    className="flex-1 px-4 py-2 bg-[var(--gold)] text-[var(--charcoal-dark)] rounded-lg font-medium disabled:opacity-50"
                  >
                    {isCreating ? 'Add Service' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barber Modal */}
      <AnimatePresence>
        {showBarberModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBarberModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isCreating ? 'Add Barber' : 'Edit Barber'}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const data = {
                    name: formData.get('name') as string,
                    bio: formData.get('bio') as string,
                    email: formData.get('email') as string || null,
                    phone: formData.get('phone') as string || null,
                    is_active: formData.get('is_active') === 'on',
                    accepts_online_booking: formData.get('accepts_online_booking') === 'on',
                  }

                  if (isCreating) {
                    createBarberMutation.mutate(data)
                  } else if (selectedBarber) {
                    updateBarberMutation.mutate({ id: selectedBarber.id, ...data })
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={selectedBarber?.name || ''}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    defaultValue={selectedBarber?.bio || ''}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={selectedBarber?.email || ''}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    name="phone"
                    type="tel"
                    defaultValue={selectedBarber?.phone || ''}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      name="is_active"
                      type="checkbox"
                      defaultChecked={selectedBarber?.is_active ?? true}
                      className="w-4 h-4 text-[var(--gold)] border-gray-300 rounded focus:ring-[var(--gold)]"
                    />
                    <label className="text-sm text-gray-700">Active (available for bookings)</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      name="accepts_online_booking"
                      type="checkbox"
                      defaultChecked={selectedBarber?.accepts_online_booking ?? true}
                      className="w-4 h-4 text-[var(--gold)] border-gray-300 rounded focus:ring-[var(--gold)]"
                    />
                    <label className="text-sm text-gray-700">Accepts online booking</label>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBarberModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createBarberMutation.isPending || updateBarberMutation.isPending}
                    className="flex-1 px-4 py-2 bg-[var(--gold)] text-[var(--charcoal-dark)] rounded-lg font-medium disabled:opacity-50"
                  >
                    {isCreating ? 'Add Barber' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isCreating ? 'Create Booking' : 'Edit Booking'}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const data = {
                    customer_name: formData.get('customer_name') as string,
                    customer_email: formData.get('customer_email') as string,
                    customer_phone: formData.get('customer_phone') as string,
                    service_id: formData.get('service_id') as string,
                    barber_id: formData.get('barber_id') as string,
                    booking_date: formData.get('booking_date') as string,
                    start_time: formData.get('start_time') as string,
                    status: formData.get('status') as Booking['status'],
                    customer_notes: formData.get('customer_notes') as string || null,
                  }

                  if (isCreating) {
                    createBookingMutation.mutate(data)
                  } else if (selectedBooking) {
                    updateBookingMutation.mutate({ id: selectedBooking.id, ...data })
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <input
                      name="customer_name"
                      type="text"
                      defaultValue={selectedBooking?.customer_name || ''}
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      name="customer_email"
                      type="email"
                      defaultValue={selectedBooking?.customer_email || ''}
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      name="customer_phone"
                      type="tel"
                      defaultValue={selectedBooking?.customer_phone || ''}
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                    <select
                      name="service_id"
                      defaultValue={selectedBooking?.service_id || ''}
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                    >
                      <option value="">Select service</option>
                      {services.filter(s => s.is_active).map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} - ${service.price}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Barber</label>
                    <select
                      name="barber_id"
                      defaultValue={selectedBooking?.barber_id || ''}
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                    >
                      <option value="">Select barber</option>
                      {barbers.filter(b => b.is_active).map((barber) => (
                        <option key={barber.id} value={barber.id}>
                          {barber.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      name="booking_date"
                      type="date"
                      defaultValue={selectedBooking?.booking_date || format(new Date(), 'yyyy-MM-dd')}
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      name="start_time"
                      type="time"
                      defaultValue={selectedBooking?.start_time?.slice(0, 5) || '09:00'}
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      defaultValue={selectedBooking?.status || 'confirmed'}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no_show">No Show</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="customer_notes"
                    defaultValue={selectedBooking?.customer_notes || ''}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                    placeholder="Special requests or notes..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createBookingMutation.isPending || updateBookingMutation.isPending}
                    className="flex-1 px-4 py-2 bg-[var(--gold)] text-[var(--charcoal-dark)] rounded-lg font-medium disabled:opacity-50"
                  >
                    {isCreating ? 'Create Booking' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customer Modal */}
      <AnimatePresence>
        {showCustomerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCustomerModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isCreating ? 'Add Customer' : 'Edit Customer'}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const data = {
                    name: formData.get('name') as string,
                    email: formData.get('email') as string || null,
                    phone: formData.get('phone') as string || null,
                    notes: formData.get('notes') as string || null,
                    is_vip: formData.get('is_vip') === 'on',
                  }

                  if (isCreating) {
                    createCustomerMutation.mutate(data)
                  } else if (selectedCustomer) {
                    updateCustomerMutation.mutate({ id: selectedCustomer.id, ...data })
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={selectedCustomer?.name || ''}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={selectedCustomer?.email || ''}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    name="phone"
                    type="tel"
                    defaultValue={selectedCustomer?.phone || ''}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    defaultValue={selectedCustomer?.notes || ''}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    name="is_vip"
                    type="checkbox"
                    defaultChecked={selectedCustomer?.is_vip || false}
                    className="w-4 h-4 text-[var(--gold)] border-gray-300 rounded focus:ring-[var(--gold)]"
                  />
                  <label className="text-sm text-gray-700">VIP Customer</label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCustomerModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
                    className="flex-1 px-4 py-2 bg-[var(--gold)] text-[var(--charcoal-dark)] rounded-lg font-medium disabled:opacity-50"
                  >
                    {isCreating ? 'Add Customer' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blocked Time Modal */}
      <AnimatePresence>
        {showBlockedTimeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBlockedTimeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Block Time</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const barberId = formData.get('barber_id') as string
                  createBlockedTimeMutation.mutate({
                    barber_id: barberId === 'all' ? null : barberId,
                    start_datetime: `${formData.get('start_date')}T${formData.get('start_time')}:00`,
                    end_datetime: `${formData.get('end_date')}T${formData.get('end_time')}:00`,
                    reason: formData.get('reason') as string || null,
                  })
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barber</label>
                  <select
                    name="barber_id"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                  >
                    <option value="all">All Barbers</option>
                    {barbers.map((barber) => (
                      <option key={barber.id} value={barber.id}>
                        {barber.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      name="start_date"
                      type="date"
                      defaultValue={format(new Date(), 'yyyy-MM-dd')}
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      name="start_time"
                      type="time"
                      defaultValue="09:00"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      name="end_date"
                      type="date"
                      defaultValue={format(new Date(), 'yyyy-MM-dd')}
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      name="end_time"
                      type="time"
                      defaultValue="18:00"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <input
                    name="reason"
                    type="text"
                    placeholder="Vacation, training, personal, etc."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBlockedTimeModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createBlockedTimeMutation.isPending}
                    className="flex-1 px-4 py-2 bg-[var(--gold)] text-[var(--charcoal-dark)] rounded-lg font-medium disabled:opacity-50"
                  >
                    Block Time
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar Sync Modal */}
      <AnimatePresence>
        {showCalendarSyncModal && calendarSyncBarber && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCalendarSyncModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Calendar Sync - {calendarSyncBarber.name}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Sync appointments with external calendars
              </p>

              {/* iCal Feed Section */}
              <div className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="text-gray-500" size={20} />
                    <span className="font-medium">iCal Feed</span>
                  </div>
                  <button
                    onClick={async () => {
                      const res = await fetch('/api/admin/calendar/ical', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          barber_id: calendarSyncBarber.id,
                          enabled: !icalSettings?.enabled,
                        }),
                      })
                      const data = await res.json()
                      setIcalSettings(data)
                      toast.success(data.enabled ? 'iCal feed enabled' : 'iCal feed disabled')
                    }}
                    className={`px-3 py-1 rounded-full text-sm ${
                      icalSettings?.enabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {icalSettings?.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  Subscribe to this URL in Apple Calendar, Google Calendar, or Outlook
                </p>
                {icalSettings?.feedUrl ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={icalSettings.feedUrl}
                      className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(icalSettings.feedUrl!)
                        toast.success('URL copied to clipboard')
                      }}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    Enable to generate feed URL
                  </p>
                )}
              </div>

              {/* Google Calendar Section */}
              <div className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-blue-500" size={20} />
                    <span className="font-medium">Google Calendar</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  Two-way sync with Google Calendar
                </p>
                <button
                  onClick={async () => {
                    const res = await fetch(`/api/admin/calendar/google/auth?barber_id=${calendarSyncBarber.id}`)
                    const data = await res.json()
                    if (data.authUrl) {
                      window.open(data.authUrl, '_blank')
                    } else {
                      toast.error(data.error || 'Failed to initiate Google Calendar connection')
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <ExternalLink size={16} />
                  Connect Google Calendar
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  Requires Google Calendar API credentials to be configured
                </p>
              </div>

              {/* Sync All Bookings Button */}
              <div className="border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Sync All Bookings</span>
                    <p className="text-sm text-gray-500">
                      Push all future bookings to connected calendars
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      toast.loading('Syncing bookings...')
                      const res = await fetch('/api/admin/calendar/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ barber_id: calendarSyncBarber.id }),
                      })
                      const data = await res.json()
                      toast.dismiss()
                      if (data.error) {
                        toast.error(data.error)
                      } else {
                        toast.success(`Synced ${data.synced?.length || 0} bookings`)
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <RefreshCw size={16} />
                    Sync Now
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowCalendarSyncModal(false)}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AdminPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminDashboard />
    </QueryClientProvider>
  )
}
