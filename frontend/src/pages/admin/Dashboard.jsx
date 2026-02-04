import { useQuery } from '@tanstack/react-query'
import { Users, Activity, Package, TrendingUp } from 'lucide-react'
import StatsCard from '../../components/admin/StatsCard'
import apiClient from '../../services/apiClient'

function Dashboard() {
  // Fetch dashboard statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // For now, returning mock data. Replace with actual API call
      const usersResponse = await apiClient.get('/users')
      const assetsResponse = await apiClient.get('/assets')
      
      return {
        totalUsers: usersResponse.data?.data?.length || 0,
        activeUsers: usersResponse.data?.data?.filter(u => u.is_active)?.length || 0,
        totalAssets: assetsResponse.data?.data?.length || 0,
        recentActivities: 42 // Replace with actual audit log count
      }
    },
  })

  // Fetch recent activities
  const { data: activities } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      // Mock data for now
      return [
        { id: 1, user: 'John Doe', action: 'Created new asset', time: '2 minutes ago', type: 'create' },
        { id: 2, user: 'Jane Smith', action: 'Updated user profile', time: '15 minutes ago', type: 'update' },
        { id: 3, user: 'Mike Johnson', action: 'Deleted old vendor', time: '1 hour ago', type: 'delete' },
        { id: 4, user: 'Sarah Williams', action: 'Added new employee', time: '2 hours ago', type: 'create' },
        { id: 5, user: 'Admin', action: 'Changed system settings', time: '3 hours ago', type: 'update' },
      ]
    },
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome to the Administrator Dashboard</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={isLoading ? '...' : stats?.totalUsers || 0}
          icon={Users}
          color="blue"
          trend="up"
          trendValue="+12%"
        />
        <StatsCard
          title="Active Users"
          value={isLoading ? '...' : stats?.activeUsers || 0}
          icon={Activity}
          color="green"
          trend="up"
          trendValue="+8%"
        />
        <StatsCard
          title="Total Assets"
          value={isLoading ? '...' : stats?.totalAssets || 0}
          icon={Package}
          color="orange"
          trend="up"
          trendValue="+23%"
        />
        <StatsCard
          title="Recent Activities"
          value={isLoading ? '...' : stats?.recentActivities || 0}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Recent System Activity</h2>
          <p className="text-sm text-slate-600 mt-1">Latest actions performed in the system</p>
        </div>
        <div className="divide-y divide-slate-100">
          {activities?.map((activity) => (
            <div key={activity.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'create' ? 'bg-green-500' :
                      activity.type === 'update' ? 'bg-blue-500' :
                      'bg-red-500'
                    }`} />
                    <p className="font-semibold text-slate-900">{activity.user}</p>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{activity.action}</p>
                </div>
                <span className="text-xs text-slate-500">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <h3 className="text-lg font-bold mb-2">User Management</h3>
          <p className="text-indigo-100 text-sm mb-4">Manage user accounts and permissions</p>
          <button 
            onClick={() => window.location.href = '/administrator/users'}
            className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
          >
            Manage Users
          </button>
        </div>
        <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl p-6 text-white shadow-lg">
          <h3 className="text-lg font-bold mb-2">Audit Logs</h3>
          <p className="text-slate-100 text-sm mb-4">View system activity and audit trail</p>
          <button 
            onClick={() => window.location.href = '/administrator/audit-logs'}
            className="bg-white text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
          >
            View Logs
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
