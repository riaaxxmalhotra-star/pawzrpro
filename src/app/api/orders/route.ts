import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculatePlatformFee } from '@/lib/utils'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = session.user.role

    // Different queries based on role
    const whereClause = role === 'SUPPLIER'
      ? { supplierId: session.user.id }
      : { buyerId: session.user.id }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        buyer: {
          select: { id: true, name: true, avatar: true },
        },
        supplier: {
          select: {
            id: true,
            name: true,
            supplierProfile: {
              select: { storeName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { items, shippingAddress, shippingCity, shippingZip } = body

    if (!items || items.length === 0 || !shippingAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Group items by supplier
    interface OrderItem {
      productId: string
      quantity: number
      price: number
    }
    const itemsBySupplier: Record<string, OrderItem[]> = {}

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { supplierId: true, price: true, inventory: true },
      })

      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 })
      }

      if (product.inventory < item.quantity) {
        return NextResponse.json({ error: `Insufficient inventory for product ${item.productId}` }, { status: 400 })
      }

      if (!itemsBySupplier[product.supplierId]) {
        itemsBySupplier[product.supplierId] = []
      }

      itemsBySupplier[product.supplierId].push({
        ...item,
        price: product.price,
      })
    }

    // Create an order for each supplier
    const orders = []

    for (const [supplierId, supplierItems] of Object.entries(itemsBySupplier)) {
      const subtotal = supplierItems.reduce((sum: number, item: OrderItem) => sum + item.price * item.quantity, 0)
      const platformFee = calculatePlatformFee(subtotal)
      const total = subtotal

      const order = await prisma.order.create({
        data: {
          buyerId: session.user.id,
          supplierId,
          subtotal,
          platformFee,
          total,
          shippingAddress,
          shippingCity,
          shippingZip,
          status: 'PENDING',
          items: {
            create: supplierItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: true,
        },
      })

      // Update product inventory
      for (const item of supplierItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { inventory: { decrement: item.quantity } },
        })
      }

      // Notify supplier
      await prisma.notification.create({
        data: {
          userId: supplierId,
          type: 'order_placed',
          title: 'New Order Received',
          message: `You have a new order from ${session.user.name}`,
          link: '/dashboard/supplier/orders',
        },
      })

      orders.push(order)
    }

    return NextResponse.json(orders, { status: 201 })
  } catch (error) {
    console.error('Failed to create order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
