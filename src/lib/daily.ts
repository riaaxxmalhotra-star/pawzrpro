const DAILY_API_URL = 'https://api.daily.co/v1'

interface DailyRoom {
  id: string
  name: string
  url: string
  created_at: string
  config: {
    exp?: number
    nbf?: number
    max_participants?: number
  }
}

interface CreateRoomOptions {
  name?: string
  expiresInMinutes?: number
  maxParticipants?: number
}

export async function createDailyRoom(options: CreateRoomOptions = {}): Promise<DailyRoom | null> {
  const apiKey = process.env.DAILY_API_KEY

  if (!apiKey) {
    console.error('DAILY_API_KEY is not set')
    return null
  }

  const { name, expiresInMinutes = 60, maxParticipants = 2 } = options

  const expirationTime = Math.floor(Date.now() / 1000) + expiresInMinutes * 60

  try {
    const response = await fetch(`${DAILY_API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        name: name || `pawzr-${Date.now()}`,
        properties: {
          exp: expirationTime,
          max_participants: maxParticipants,
          enable_chat: true,
          enable_screenshare: false,
          start_video_off: false,
          start_audio_off: false,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Failed to create Daily room:', error)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating Daily room:', error)
    return null
  }
}

export async function getDailyRoom(roomName: string): Promise<DailyRoom | null> {
  const apiKey = process.env.DAILY_API_KEY

  if (!apiKey) {
    console.error('DAILY_API_KEY is not set')
    return null
  }

  try {
    const response = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      const error = await response.json()
      console.error('Failed to get Daily room:', error)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting Daily room:', error)
    return null
  }
}

export async function deleteDailyRoom(roomName: string): Promise<boolean> {
  const apiKey = process.env.DAILY_API_KEY

  if (!apiKey) {
    return false
  }

  try {
    const response = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    return response.ok
  } catch (error) {
    console.error('Error deleting Daily room:', error)
    return false
  }
}
