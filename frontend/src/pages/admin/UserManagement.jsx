import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Edit, Trash2, UserCheck, UserX, Loader2 } from 'lucide-react'
import apiClient from '../../services/apiClient'
import Swal from 'sweetalert2'

function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const queryClient = useQueryClient()

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiClient.get('/users')
      return response.data?.data || []
    },
  })

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId) => {
      await apiClient.delete(`/users/${userId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      Swal.fire('Success', 'User deleted successfully', 'success')
    },
    onError: () => {
      Swal.fire('Error', 'Failed to delete user', 'error')
    },
  })

  const handleDelete = (userId, userName) => {
    Swal.fire({
      title: 'Delete User?',
      text: `Are you sure you want to delete ${userName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(userId)
      }
    })
  }

  // Filter users based on search
  const filteredUsers = users?.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600 mt-2">Manage system users and their permissions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 shadow-md transition-all font-semibold">
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none text-sm"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Created</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                    <p className="text-slate-600 mt-2">Loading users...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-600">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{user.name || 'N/A'}</p>
                          <p className="text-xs text-slate-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{user.email || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {user.role || 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id, user.name)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total Users</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{users?.length || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Active Users</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {users?.filter(u => u.is_active).length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Inactive Users</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {users?.filter(u => !u.is_active).length || 0}
          </p>
        </div>
      </div>
    </div>
  )
}

export default UserManagement
