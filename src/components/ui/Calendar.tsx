'use client'

import { useState } from 'react'

interface CalendarEvent {
  id: string
  title: string
  date: Date
  time: string
  status: string
  type?: string
  clientName?: string
  petName?: string
}

interface CalendarProps {
  events: CalendarEvent[]
  onDateClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function Calendar({ events, onDateClick, onEventClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startingDay = firstDayOfMonth.getDay()
  const totalDays = lastDayOfMonth.getDate()

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    )
  }

  const getEventsForDay = (day: number) => {
    const date = new Date(year, month, day)
    return events.filter(event => isSameDay(new Date(event.date), date))
  }

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day)
    setSelectedDate(date)
    onDateClick?.(date)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'accepted':
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled':
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Build calendar grid
  const calendarDays = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= totalDays; day++) {
    calendarDays.push(day)
  }

  // Get selected day events
  const selectedDayEvents = selectedDate
    ? events.filter(event => isSameDay(new Date(event.date), selectedDate))
    : []

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {MONTHS[month]} {year}
          </h2>
          <button
            onClick={goToToday}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            Today
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="min-h-24" />
            }

            const dayEvents = getEventsForDay(day)
            const isSelected = selectedDate && isSameDay(selectedDate, new Date(year, month, day))

            return (
              <div
                key={day}
                onClick={() => handleDateClick(day)}
                className={`min-h-24 p-1 border rounded-lg cursor-pointer transition-colors ${
                  isToday(day)
                    ? 'bg-orange-50 border-orange-200'
                    : isSelected
                    ? 'bg-blue-50 border-blue-200'
                    : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday(day) ? 'text-orange-600' : 'text-gray-700'
                }`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick?.(event)
                      }}
                      className={`text-xs px-1.5 py-0.5 rounded truncate border ${getStatusColor(event.status)}`}
                    >
                      {event.time} - {event.clientName || event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500 px-1">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDate && (
        <div className="border-t border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
          {selectedDayEvents.length === 0 ? (
            <p className="text-gray-500 text-sm">No bookings scheduled for this day</p>
          ) : (
            <div className="space-y-2">
              {selectedDayEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => onEventClick?.(event)}
                  className={`p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow ${getStatusColor(event.status)}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{event.time}</span>
                    <span className="text-xs uppercase">{event.status}</span>
                  </div>
                  <div className="text-sm">
                    {event.clientName && <span>{event.clientName}</span>}
                    {event.petName && <span className="text-gray-600"> - {event.petName}</span>}
                  </div>
                  {event.title && (
                    <div className="text-sm text-gray-600 mt-1">{event.title}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
