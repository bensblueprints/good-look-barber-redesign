'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Calendar,
  Clock,
  Globe,
  Save,
  Plus,
  Trash2,
  Coffee,
  CalendarOff,
  CalendarCheck,
  Link2,
  Unlink,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react'

// Timezone options (common ones)
const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Toronto',
  'America/Vancouver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
]

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface ScheduleDay {
  id?: string
  barber_id: string
  day_of_week: number
  is_working: boolean
  start_time: string
  end_time: string
  break_start: string | null
  break_end: string | null
}

interface ScheduleOverride {
  id: string
  barber_id: string
  override_date: string
  is_working: boolean
  start_time: string | null
  end_time: string | null
  break_start: string | null
  break_end: string | null
  reason: string | null
}

interface CalendarConnection {
  id: string
  provider: 'google' | 'apple' | 'outlook' | 'ical_import'
  provider_calendar_name: string | null
  sync_direction: 'import' | 'export' | 'both'
  last_sync_at: string | null
  last_sync_status: 'success' | 'error' | 'pending' | null
  is_primary: boolean
  is_active: boolean
}

interface Props {
  barberId: string
  barberName: string
  onClose?: () => void
}

export default function BarberCalendarSettings({ barberId, barberName, onClose }: Props) {
  const [activeSection, setActiveSection] = useState<'schedule' | 'overrides' | 'sync'>('schedule')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Schedule state
  const [timezone, setTimezone] = useState('America/New_York')
  const [shopTimezone, setShopTimezone] = useState('America/New_York')
  const [schedule, setSchedule] = useState<ScheduleDay[]>([])

  // Overrides state
  const [overrides, setOverrides] = useState<ScheduleOverride[]>([])
  const [showAddOverride, setShowAddOverride] = useState(false)
  const [newOverride, setNewOverride] = useState({
    override_date: '',
    is_working: false,
    start_time: '09:00',
    end_time: '17:00',
    reason: '',
  })

  // Calendar connections state
  const [connections, setConnections] = useState<CalendarConnection[]>([])

  // Load data on mount
  useEffect(() => {
    loadSchedule()
    loadOverrides()
    loadConnections()
  }, [barberId])

  const loadSchedule = async () => {
    try {
      const res = await fetch(`/api/admin/calendar/schedule?barber_id=${barberId}`)
      const data = await res.json()

      if (data.error) throw new Error(data.error)

      setTimezone(data.barber.timezone)
      setShopTimezone(data.barber.shop_timezone)

      // Initialize schedule for all 7 days
      const fullSchedule: ScheduleDay[] = DAY_NAMES.map((_, index) => {
        const existing = data.schedule.find((s: ScheduleDay) => s.day_of_week === index)
        return existing || {
          barber_id: barberId,
          day_of_week: index,
          is_working: index !== 0, // Sunday off by default
          start_time: '09:00',
          end_time: '17:00',
          break_start: null,
          break_end: null,
        }
      })

      setSchedule(fullSchedule)
    } catch {
      toast.error('Failed to load schedule')
    } finally {
      setLoading(false)
    }
  }

  const loadOverrides = async () => {
    try {
      const res = await fetch(`/api/admin/calendar/overrides?barber_id=${barberId}`)
      const data = await res.json()
      if (!data.error) setOverrides(data)
    } catch {
      console.error('Failed to load overrides')
    }
  }

  const loadConnections = async () => {
    try {
      const res = await fetch(`/api/admin/calendar/connections?barber_id=${barberId}`)
      const data = await res.json()
      if (!data.error) setConnections(data)
    } catch {
      console.error('Failed to load connections')
    }
  }

  const saveSchedule = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/calendar/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barber_id: barberId,
          timezone,
          schedule,
        }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      toast.success('Schedule saved successfully')
    } catch {
      toast.error('Failed to save schedule')
    } finally {
      setSaving(false)
    }
  }

  const updateScheduleDay = (dayIndex: number, updates: Partial<ScheduleDay>) => {
    setSchedule(prev =>
      prev.map(day =>
        day.day_of_week === dayIndex
          ? { ...day, ...updates }
          : day
      )
    )
  }

  const addOverride = async () => {
    if (!newOverride.override_date) {
      toast.error('Please select a date')
      return
    }

    try {
      const res = await fetch('/api/admin/calendar/overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barber_id: barberId,
          ...newOverride,
        }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setOverrides(prev => [...prev, data])
      setShowAddOverride(false)
      setNewOverride({
        override_date: '',
        is_working: false,
        start_time: '09:00',
        end_time: '17:00',
        reason: '',
      })
      toast.success('Override added')
    } catch {
      toast.error('Failed to add override')
    }
  }

  const deleteOverride = async (overrideId: string) => {
    try {
      const res = await fetch(`/api/admin/calendar/overrides?id=${overrideId}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setOverrides(prev => prev.filter(o => o.id !== overrideId))
      toast.success('Override removed')
    } catch {
      toast.error('Failed to remove override')
    }
  }

  const connectGoogleCalendar = async () => {
    try {
      const res = await fetch(`/api/admin/calendar/google/auth?barber_id=${barberId}`)
      const data = await res.json()

      if (data.authUrl) {
        window.open(data.authUrl, '_blank', 'width=600,height=700')
      } else {
        toast.error('Failed to get authorization URL')
      }
    } catch {
      toast.error('Failed to connect Google Calendar')
    }
  }

  const disconnectCalendar = async (connectionId: string) => {
    try {
      const res = await fetch(`/api/admin/calendar/connections?id=${connectionId}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setConnections(prev => prev.filter(c => c.id !== connectionId))
      toast.success('Calendar disconnected')
    } catch {
      toast.error('Failed to disconnect calendar')
    }
  }

  const syncCalendar = async (connectionId: string) => {
    try {
      toast.info('Syncing calendar...')
      const res = await fetch('/api/admin/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barber_id: barberId }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      toast.success(`Synced ${data.synced?.length || 0} bookings`)
      loadConnections()
    } catch {
      toast.error('Failed to sync calendar')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-lg font-semibold text-white">Calendar Settings</h2>
              <p className="text-indigo-200 text-sm">{barberName}</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'schedule', label: 'Weekly Schedule', icon: Clock },
          { id: 'overrides', label: 'Special Days', icon: CalendarOff },
          { id: 'sync', label: 'Calendar Sync', icon: Link2 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as typeof activeSection)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeSection === tab.id
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeSection === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Timezone Selection */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Globe className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={e => setTimezone(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Use shop default ({shopTimezone})</option>
                    {TIMEZONES.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Weekly Schedule */}
              <div className="space-y-3">
                {schedule.map(day => (
                  <div
                    key={day.day_of_week}
                    className={`border rounded-lg p-4 transition-colors ${
                      day.is_working ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={day.is_working}
                          onChange={e => updateScheduleDay(day.day_of_week, { is_working: e.target.checked })}
                          className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className={`font-medium ${day.is_working ? 'text-gray-900' : 'text-gray-400'}`}>
                          {DAY_NAMES[day.day_of_week]}
                        </span>
                      </div>
                      {day.is_working && (
                        <span className="text-sm text-gray-500">
                          {day.start_time} - {day.end_time}
                        </span>
                      )}
                    </div>

                    {day.is_working && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pl-8">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Start</label>
                          <input
                            type="time"
                            value={day.start_time}
                            onChange={e => updateScheduleDay(day.day_of_week, { start_time: e.target.value })}
                            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">End</label>
                          <input
                            type="time"
                            value={day.end_time}
                            onChange={e => updateScheduleDay(day.day_of_week, { end_time: e.target.value })}
                            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <Coffee className="w-3 h-3" />
                            Break Start
                          </label>
                          <input
                            type="time"
                            value={day.break_start || ''}
                            onChange={e => updateScheduleDay(day.day_of_week, {
                              break_start: e.target.value || null
                            })}
                            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Break End</label>
                          <input
                            type="time"
                            value={day.break_end || ''}
                            onChange={e => updateScheduleDay(day.day_of_week, {
                              break_end: e.target.value || null
                            })}
                            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Save Button */}
              <button
                onClick={saveSchedule}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Save Schedule
              </button>
            </motion.div>
          )}

          {activeSection === 'overrides' && (
            <motion.div
              key="overrides"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Add special days like holidays, vacation, or modified hours.
                </p>
                <button
                  onClick={() => setShowAddOverride(!showAddOverride)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Day
                </button>
              </div>

              {/* Add Override Form */}
              <AnimatePresence>
                {showAddOverride && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border border-indigo-200 bg-indigo-50 rounded-lg p-4 space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={newOverride.override_date}
                          onChange={e => setNewOverride({ ...newOverride, override_date: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                        <input
                          type="text"
                          placeholder="e.g., Holiday, Vacation"
                          value={newOverride.reason}
                          onChange={e => setNewOverride({ ...newOverride, reason: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="override_working"
                        checked={newOverride.is_working}
                        onChange={e => setNewOverride({ ...newOverride, is_working: e.target.checked })}
                        className="rounded border-gray-300 text-indigo-600"
                      />
                      <label htmlFor="override_working" className="text-sm text-gray-700">
                        Working this day (with custom hours)
                      </label>
                    </div>

                    {newOverride.is_working && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                          <input
                            type="time"
                            value={newOverride.start_time}
                            onChange={e => setNewOverride({ ...newOverride, start_time: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">End Time</label>
                          <input
                            type="time"
                            value={newOverride.end_time}
                            onChange={e => setNewOverride({ ...newOverride, end_time: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowAddOverride(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addOverride}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Add Override
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Overrides List */}
              <div className="space-y-2">
                {overrides.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarOff className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No special days scheduled</p>
                  </div>
                ) : (
                  overrides.map(override => (
                    <div
                      key={override.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        override.is_working
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {override.is_working ? (
                          <CalendarCheck className="w-5 h-5 text-green-600" />
                        ) : (
                          <CalendarOff className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">
                            {new Date(override.override_date + 'T12:00:00').toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {override.is_working
                              ? `${override.start_time} - ${override.end_time}`
                              : 'Day Off'
                            }
                            {override.reason && ` • ${override.reason}`}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteOverride(override.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeSection === 'sync' && (
            <motion.div
              key="sync"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <p className="text-sm text-gray-600">
                Connect external calendars to automatically sync bookings and block busy times.
              </p>

              {/* Connected Calendars */}
              {connections.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">Connected Calendars</h3>
                  {connections.map(connection => (
                    <div
                      key={connection.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                          {connection.provider === 'google' && (
                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 capitalize">
                            {connection.provider} Calendar
                          </div>
                          <div className="text-sm text-gray-500">
                            {connection.provider_calendar_name || 'Primary Calendar'}
                            <span className="mx-2">•</span>
                            <span className={`${
                              connection.last_sync_status === 'success'
                                ? 'text-green-600'
                                : connection.last_sync_status === 'error'
                                ? 'text-red-600'
                                : 'text-gray-500'
                            }`}>
                              {connection.last_sync_at
                                ? `Last synced ${new Date(connection.last_sync_at).toLocaleString()}`
                                : 'Never synced'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => syncCalendar(connection.id)}
                          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Sync now"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => disconnectCalendar(connection.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Disconnect"
                        >
                          <Unlink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Calendar Buttons */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">
                  {connections.length > 0 ? 'Add Another Calendar' : 'Connect a Calendar'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={connectGoogleCalendar}
                    className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors group"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="font-medium text-gray-700 group-hover:text-indigo-700">
                      Google Calendar
                    </span>
                  </button>

                  <button
                    onClick={() => toast.info('Apple Calendar integration coming soon!')}
                    className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-300 transition-colors opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <span className="font-medium text-gray-500">Apple Calendar</span>
                  </button>

                  <button
                    onClick={() => toast.info('Outlook Calendar integration coming soon!')}
                    className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-300 transition-colors opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#0078D4">
                      <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V12zm-6-8.25v3h3v-3zm0 4.5v3h3v-3zm0 4.5v1.83l3.05-1.83zm-5.25-9v3h3.75v-3zm0 4.5v3h3.75v-3zm0 4.5v2.03l2.41 1.5 1.34-.81z"/>
                    </svg>
                    <span className="font-medium text-gray-500">Outlook</span>
                  </button>
                </div>
              </div>

              {/* Sync Settings Info */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">How calendar sync works:</p>
                    <ul className="list-disc list-inside space-y-1 text-amber-700">
                      <li>Bookings are automatically added to your connected calendar</li>
                      <li>Busy times from your calendar will block booking slots</li>
                      <li>Changes sync every 15 minutes or manually when you click refresh</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
