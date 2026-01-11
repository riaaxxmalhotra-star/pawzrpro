// Role types (SQLite doesn't support enums, so we use string types)
export type Role = 'OWNER' | 'LOVER' | 'VET' | 'GROOMER' | 'SUPPLIER' | 'ADMIN'

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    id: string
    role: string
  }

  interface Session {
    user: {
      id: string
      role: string
      email: string
      name?: string | null
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Filter options for browsing
export interface ProviderFilters {
  serviceType?: string
  minRating?: number
  maxPrice?: number
  city?: string
  available?: boolean
}

export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  supplierId?: string
}

// Cart types
export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  photo?: string
  supplierId: string
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  platformFee: number
  total: number
}

// Dashboard stats
export interface OwnerStats {
  petsCount: number
  upcomingBookings: number
  completedBookings: number
  totalSpent: number
}

export interface ProviderStats {
  pendingRequests: number
  upcomingBookings: number
  completedBookings: number
  totalEarnings: number
  averageRating: number
  reviewCount: number
}

export interface SupplierStats {
  productCount: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  platformFees: number
  netEarnings: number
}

export interface AdminStats {
  totalUsers: number
  usersByRole: Record<string, number>
  totalBookings: number
  totalOrders: number
  platformRevenue: number
  pendingVerifications: number
}

// Notification types
export type NotificationType =
  | 'booking_request'
  | 'booking_accepted'
  | 'booking_declined'
  | 'booking_cancelled'
  | 'booking_completed'
  | 'new_message'
  | 'new_review'
  | 'order_placed'
  | 'order_shipped'
  | 'order_delivered'
  | 'account_verified'
  | 'account_suspended'
  | 'event_reminder'

// Form types
export interface PetFormData {
  name: string
  species: string
  breed?: string
  age?: number
  weight?: number
  photo?: string
  medicalNotes?: string
  behaviorNotes?: string
  vaccinated: boolean
  neutered: boolean
}

export interface ServiceFormData {
  type: 'WALKING' | 'SITTING' | 'BOARDING'
  name: string
  description?: string
  price: number
  duration: number
  availability?: string
}

export interface ProductFormData {
  name: string
  description?: string
  price: number
  category: string
  inventory: number
  photos?: string[]
}

export interface BookingFormData {
  providerId: string
  providerType: 'LOVER' | 'VET' | 'GROOMER'
  petId?: string
  serviceId?: string
  date: string
  time: string
  duration: number
  notes?: string
}

// Message types for real-time chat
export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  createdAt: string
  read: boolean
}

export interface ConversationPreview {
  id: string
  participantId: string
  participantName: string
  participantAvatar?: string
  lastMessage?: string
  lastMessageAt?: string
  unreadCount: number
}
