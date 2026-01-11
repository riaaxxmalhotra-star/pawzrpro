import Pusher from 'pusher'
import PusherClient from 'pusher-js'

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.PUSHER_CLUSTER || 'us2',
  useTLS: true,
})

// Client-side Pusher instance (singleton)
let pusherClientInstance: PusherClient | null = null

export const getPusherClient = () => {
  if (typeof window === 'undefined') {
    return null
  }

  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY || '',
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
      }
    )
  }

  return pusherClientInstance
}

// Channel naming conventions
export const getConversationChannel = (conversationId: string) =>
  `conversation-${conversationId}`

export const getUserChannel = (userId: string) =>
  `user-${userId}`

export const getNotificationChannel = (userId: string) =>
  `notifications-${userId}`

// Event types
export const PUSHER_EVENTS = {
  NEW_MESSAGE: 'new-message',
  MESSAGE_READ: 'message-read',
  NEW_NOTIFICATION: 'new-notification',
  BOOKING_UPDATE: 'booking-update',
  TYPING_START: 'typing-start',
  TYPING_STOP: 'typing-stop',
} as const
