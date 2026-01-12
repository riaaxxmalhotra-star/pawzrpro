'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface SidebarProps {
  role: string
  isOpen: boolean
  onClose: () => void
}

const ownerNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard/owner',
    icon: <HomeIcon />,
  },
  {
    label: 'My Pets',
    href: '/dashboard/owner/pets',
    icon: <PetIcon />,
  },
  {
    label: 'Bookings',
    href: '/dashboard/owner/bookings',
    icon: <CalendarIcon />,
  },
  {
    label: 'Orders',
    href: '/dashboard/owner/orders',
    icon: <ShoppingBagIcon />,
  },
  {
    label: 'Find Services',
    href: '/browse/lovers',
    icon: <SearchIcon />,
  },
  {
    label: 'Shop',
    href: '/browse/products',
    icon: <StoreIcon />,
  },
  {
    label: 'Events',
    href: '/events',
    icon: <CalendarIcon />,
  },
  {
    label: 'Messages',
    href: '/messages',
    icon: <ChatIcon />,
  },
]

const loverNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard/lover',
    icon: <HomeIcon />,
  },
  {
    label: 'My Profile',
    href: '/dashboard/lover/profile',
    icon: <UserIcon />,
  },
  {
    label: 'My Services',
    href: '/dashboard/lover/services',
    icon: <ServicesIcon />,
  },
  {
    label: 'Requests',
    href: '/dashboard/lover/requests',
    icon: <InboxIcon />,
  },
  {
    label: 'Schedule',
    href: '/dashboard/lover/schedule',
    icon: <CalendarIcon />,
  },
  {
    label: 'Earnings',
    href: '/dashboard/lover/earnings',
    icon: <DollarIcon />,
  },
  {
    label: 'Events',
    href: '/events',
    icon: <CalendarIcon />,
  },
  {
    label: 'Messages',
    href: '/messages',
    icon: <ChatIcon />,
  },
]

const vetNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard/vet',
    icon: <HomeIcon />,
  },
  {
    label: 'Clinic Profile',
    href: '/dashboard/vet/profile',
    icon: <UserIcon />,
  },
  {
    label: 'Appointments',
    href: '/dashboard/vet/appointments',
    icon: <CalendarIcon />,
  },
  {
    label: 'Schedule',
    href: '/dashboard/vet/schedule',
    icon: <CalendarIcon />,
  },
  {
    label: 'Patients',
    href: '/dashboard/vet/patients',
    icon: <PetIcon />,
  },
  {
    label: 'Prescriptions',
    href: '/dashboard/vet/prescriptions',
    icon: <DocumentIcon />,
  },
  {
    label: 'Earnings',
    href: '/dashboard/vet/earnings',
    icon: <DollarIcon />,
  },
  {
    label: 'Messages',
    href: '/messages',
    icon: <ChatIcon />,
  },
]

const groomerNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard/groomer',
    icon: <HomeIcon />,
  },
  {
    label: 'Salon Profile',
    href: '/dashboard/groomer/profile',
    icon: <UserIcon />,
  },
  {
    label: 'Appointments',
    href: '/dashboard/groomer/appointments',
    icon: <CalendarIcon />,
  },
  {
    label: 'Schedule',
    href: '/dashboard/groomer/schedule',
    icon: <CalendarIcon />,
  },
  {
    label: 'Earnings',
    href: '/dashboard/groomer/earnings',
    icon: <DollarIcon />,
  },
  {
    label: 'Messages',
    href: '/messages',
    icon: <ChatIcon />,
  },
]

const supplierNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard/supplier',
    icon: <HomeIcon />,
  },
  {
    label: 'Store Profile',
    href: '/dashboard/supplier/profile',
    icon: <StoreIcon />,
  },
  {
    label: 'Products',
    href: '/dashboard/supplier/products',
    icon: <BoxIcon />,
  },
  {
    label: 'Orders',
    href: '/dashboard/supplier/orders',
    icon: <ShoppingBagIcon />,
  },
  {
    label: 'Earnings',
    href: '/dashboard/supplier/earnings',
    icon: <DollarIcon />,
  },
  {
    label: 'Messages',
    href: '/messages',
    icon: <ChatIcon />,
  },
]

const adminNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: <HomeIcon />,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: <UsersIcon />,
  },
  {
    label: 'Bookings',
    href: '/admin/bookings',
    icon: <CalendarIcon />,
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: <ShoppingBagIcon />,
  },
  {
    label: 'Events',
    href: '/admin/events',
    icon: <CalendarIcon />,
  },
  {
    label: 'Transactions',
    href: '/admin/transactions',
    icon: <DollarIcon />,
  },
  {
    label: 'Reports',
    href: '/admin/reports',
    icon: <FlagIcon />,
  },
]

const navItemsByRole: Record<string, NavItem[]> = {
  OWNER: ownerNavItems,
  LOVER: loverNavItems,
  VET: vetNavItems,
  GROOMER: groomerNavItems,
  SUPPLIER: supplierNavItems,
  ADMIN: adminNavItems,
}

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const navItems = navItemsByRole[role] || ownerNavItems

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full h-[100dvh] w-[75vw] max-w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 lg:static lg:z-0 lg:w-64 lg:max-w-none pt-safe',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link href="/" className="text-xl font-bold text-orange-600">
            🐾 Pawzr
          </Link>
          <button
            onClick={onClose}
            className="ml-auto lg:hidden text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <span className="w-5 h-5">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

// Icons
function HomeIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function PetIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function ShoppingBagIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function StoreIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function ServicesIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function InboxIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  )
}

function DollarIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function BoxIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function FlagIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  )
}
