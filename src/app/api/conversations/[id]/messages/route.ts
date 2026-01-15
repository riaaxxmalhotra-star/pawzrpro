import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId } = await params

    // Verify user is a participant in this conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: session.user.id,
      },
    })

    if (!participant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        senderId: true,
        content: true,
        createdAt: true,
        read: true,
      },
    })

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: session.user.id },
        read: false,
      },
      data: { read: true },
    })

    // Update lastReadAt for participant
    await prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { lastReadAt: new Date() },
    })

    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      senderId: msg.senderId,
      content: msg.content,
      createdAt: msg.createdAt.toISOString(),
      read: msg.read,
    }))

    return NextResponse.json(formattedMessages)
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId } = await params
    const { content } = await req.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 })
    }

    // Verify user is a participant in this conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: session.user.id,
      },
    })

    if (!participant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        content: content.trim(),
      },
      select: {
        id: true,
        senderId: true,
        content: true,
        createdAt: true,
        read: true,
      },
    })

    // Update conversation's updatedAt timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({
      id: message.id,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      read: message.read,
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to send message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
