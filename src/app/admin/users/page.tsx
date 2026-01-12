'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/Loading'
import { Badge } from '@/components/ui/Badge'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  avatar: string | null
  phone: string | null
  verified: boolean
  suspended: boolean
  aadhaarNumber: string | null
  aadhaarImage: string | null
  aadhaarVerified: boolean
  createdAt: string
}

function AdminUsersContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterParam = searchParams.get('filter')

  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [verificationFilter, setVerificationFilter] = useState<string>(filterParam || 'all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (roleFilter !== 'all') params.set('role', roleFilter)
      if (verificationFilter !== 'all') params.set('verification', verificationFilter)

      const response = await fetch(`/api/admin/users?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setIsLoading(false)
    }
  }, [search, roleFilter, verificationFilter])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUsers()
    }
  }, [status, fetchUsers])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin-login')
    }
  }, [status, router])

  const handleVerifyUser = async (userId: string, type: 'profile' | 'aadhaar') => {
    setActionLoading(`verify-${type}-${userId}`)
    try {
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })

      if (response.ok) {
        fetchUsers()
        if (selectedUser?.id === userId) {
          const updated = await response.json()
          setSelectedUser(updated.user)
        }
      }
    } catch (error) {
      console.error('Failed to verify user:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSuspendUser = async (userId: string, suspend: boolean) => {
    setActionLoading(`suspend-${userId}`)
    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspend }),
      })

      if (response.ok) {
        fetchUsers()
        if (selectedUser?.id === userId) {
          setSelectedUser(prev => prev ? { ...prev, suspended: suspend } : null)
        }
      }
    } catch (error) {
      console.error('Failed to update user:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectAadhaar = async (userId: string) => {
    setActionLoading(`reject-aadhaar-${userId}`)
    try {
      const response = await fetch(`/api/admin/users/${userId}/reject-aadhaar`, {
        method: 'PUT',
      })

      if (response.ok) {
        fetchUsers()
        if (selectedUser?.id === userId) {
          setSelectedUser(prev => prev ? { ...prev, aadhaarImage: null, aadhaarNumber: null } : null)
        }
      }
    } catch (error) {
      console.error('Failed to reject Aadhaar:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      OWNER: 'default',
      LOVER: 'info',
      VET: 'success',
      GROOMER: 'warning',
      SUPPLIER: 'danger',
      ADMIN: 'danger',
    }
    return colors[role] || 'default'
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="text-orange-600 hover:text-orange-700 text-sm">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">User Management</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* User List */}
          <div className="lg:col-span-2">
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 min-w-[200px]"
                  />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Roles</option>
                    <option value="OWNER">Pet Owners</option>
                    <option value="LOVER">Pet Lovers</option>
                    <option value="VET">Veterinarians</option>
                    <option value="GROOMER">Groomers</option>
                    <option value="SUPPLIER">Suppliers</option>
                  </select>
                  <select
                    value={verificationFilter}
                    onChange={(e) => setVerificationFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending Verification</option>
                    <option value="pending-aadhaar">Pending Aadhaar</option>
                    <option value="verified">Verified</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                {/* User List */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {users.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No users found</p>
                  ) : (
                    users.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedUser?.id === user.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                              {user.avatar ? (
                                <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                user.name?.[0]?.toUpperCase() || '?'
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name || 'No name'}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                            {user.suspended && <Badge variant="danger">Suspended</Badge>}
                            {user.aadhaarVerified && <Badge variant="success">KYC</Badge>}
                            {user.aadhaarImage && !user.aadhaarVerified && (
                              <Badge variant="warning">Pending KYC</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Detail */}
          <div>
            {selectedUser ? (
              <Card variant="bordered" className="sticky top-4">
                <CardHeader>
                  <CardTitle>User Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gray-200 flex items-center justify-center text-3xl mb-3">
                      {selectedUser.avatar ? (
                        <img src={selectedUser.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        selectedUser.name?.[0]?.toUpperCase() || '?'
                      )}
                    </div>
                    <h3 className="font-semibold text-lg">{selectedUser.name || 'No name'}</h3>
                    <p className="text-gray-500 text-sm">{selectedUser.email}</p>
                    <Badge variant={getRoleBadgeColor(selectedUser.role)} className="mt-2">
                      {selectedUser.role}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Contact Info</h4>
                      <p className="text-sm text-gray-600">
                        Phone: {selectedUser.phone || 'Not provided'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Verification Status */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Verification Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Profile Verified</span>
                          {selectedUser.verified ? (
                            <Badge variant="success">Verified</Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleVerifyUser(selectedUser.id, 'profile')}
                              isLoading={actionLoading === `verify-profile-${selectedUser.id}`}
                            >
                              Verify
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Aadhaar KYC</span>
                          {selectedUser.aadhaarVerified ? (
                            <Badge variant="success">Verified</Badge>
                          ) : selectedUser.aadhaarImage ? (
                            <Badge variant="warning">Pending</Badge>
                          ) : (
                            <Badge variant="default">Not Submitted</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Aadhaar Details */}
                    {selectedUser.aadhaarImage && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Aadhaar Details</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Number: {selectedUser.aadhaarNumber || 'Not provided'}
                        </p>
                        <div className="border rounded-lg overflow-hidden mb-3">
                          <img
                            src={selectedUser.aadhaarImage}
                            alt="Aadhaar Card"
                            className="w-full h-auto"
                          />
                        </div>
                        {!selectedUser.aadhaarVerified && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleVerifyUser(selectedUser.id, 'aadhaar')}
                              isLoading={actionLoading === `verify-aadhaar-${selectedUser.id}`}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleRejectAadhaar(selectedUser.id)}
                              isLoading={actionLoading === `reject-aadhaar-${selectedUser.id}`}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="border-t pt-4 space-y-2">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Actions</h4>
                      {selectedUser.suspended ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleSuspendUser(selectedUser.id, false)}
                          isLoading={actionLoading === `suspend-${selectedUser.id}`}
                        >
                          Unsuspend User
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => handleSuspendUser(selectedUser.id, true)}
                          isLoading={actionLoading === `suspend-${selectedUser.id}`}
                        >
                          Suspend User
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card variant="bordered">
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">Select a user to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <AdminUsersContent />
    </Suspense>
  )
}
