import { useState } from 'react'
import {
  Monitor,
  Laptop,
  Printer,
  HardDrive,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Building2,
  Search,
  Download,
} from 'lucide-react'

function InventoryHome() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Dashboard stats
  const stats = [
    {
      label: 'Total Equipment',
      value: '1,234',
      change: '+12%',
      changeType: 'increase',
      icon: Package,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Active Devices',
      value: '987',
      change: '+8%',
      changeType: 'increase',
      icon: Monitor,
      color: 'from-emerald-500 to-emerald-600',
      iconColor: 'text-emerald-50',
    },
    {
      label: 'Under Maintenance',
      value: '45',
      change: '-5%',
      changeType: 'decrease',
      icon: AlertTriangle,
      color: 'from-amber-500 to-amber-600',
    },
    {
      label: 'Available',
      value: '202',
      change: '+15%',
      changeType: 'increase',
      icon: CheckCircle,
      color: 'from-purple-500 to-purple-600',
    },
  ]

  // Equipment categories
  const categories = [
    { name: 'Computers', count: 450, icon: Monitor, color: 'bg-blue-500' },
    { name: 'Laptops', count: 320, icon: Laptop, color: 'bg-emerald-500' },
    { name: 'Printers', count: 85, icon: Printer, color: 'bg-amber-500' },
    { name: 'Storage', count: 156, icon: HardDrive, color: 'bg-purple-500' },
  ]

  // Recent activities
  const recentActivities = [
    { action: 'New laptop added', item: 'Dell XPS 15', time: '2 hours ago', type: 'add' },
    { action: 'Equipment assigned', item: 'HP Monitor #234', time: '4 hours ago', type: 'assign' },
    { action: 'Maintenance completed', item: 'Printer #089', time: '6 hours ago', type: 'maintenance' },
    { action: 'Equipment returned', item: 'Lenovo ThinkPad', time: '8 hours ago', type: 'return' },
  ]

  // Sample inventory data
  const inventoryData = [
    { id: 1, name: 'Dell XPS 15 Laptop', serial: 'DXP-2024-001', category: 'Laptop', branch: 'Main Office', status: 'Active', assignedTo: 'John Doe' },
    { id: 2, name: 'HP Monitor 27"', serial: 'HPM-2024-234', category: 'Monitor', branch: 'Jasaan Branch', status: 'Active', assignedTo: 'Jane Smith' },
    { id: 3, name: 'Canon Printer LBP', serial: 'CNP-2024-089', category: 'Printer', branch: 'Salay Branch', status: 'For Repair', assignedTo: '-' },
    { id: 4, name: 'Lenovo ThinkPad', serial: 'LTP-2024-156', category: 'Laptop', branch: 'CDO Branch', status: 'Active', assignedTo: 'Mike Johnson' },
    { id: 5, name: 'Seagate HDD 2TB', serial: 'SHD-2024-445', category: 'Storage', branch: 'Main Office', status: 'Available', assignedTo: '-' },
  ]

  // Branch data
  const branchData = [
    { name: 'Main Office', count: 450, percentage: 36 },
    { name: 'Jasaan Branch', count: 320, percentage: 26 },
    { name: 'Salay Branch', count: 250, percentage: 20 },
    { name: 'CDO Branch', count: 214, percentage: 18 },
  ]

  return (
    <div className="sm:px-[4.75rem]">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">IT Inventory Dashboard</h1>
        <p className="text-slate-500 mt-1">Monitor and manage all IT assets across branches</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp
                      className={`w-4 h-4 ${
                        stat.changeType === 'increase' ? 'text-emerald-500' : 'text-red-500'
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        stat.changeType === 'increase' ? 'text-emerald-500' : 'text-red-500'
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-sm text-slate-400">from last month</span>
                  </div>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor || 'text-white'}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search inventory by name, serial number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="laptop">Laptops</option>
              <option value="monitor">Monitors</option>
              <option value="printer">Printers</option>
              <option value="storage">Storage</option>
            </select>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Branches</option>
              <option value="main">Main Office</option>
              <option value="jasaan">Jasaan Branch</option>
              <option value="salay">Salay Branch</option>
              <option value="cdo">CDO Branch</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="available">Available</option>
              <option value="repair">For Repair</option>
              <option value="retired">Retired</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Recent Inventory</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Serial No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Branch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {inventoryData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-mono">{item.serial}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.category}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.branch}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.status === 'Active' ? 'bg-green-100 text-green-700' :
                      item.status === 'Available' ? 'bg-blue-100 text-blue-700' :
                      item.status === 'For Repair' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.assignedTo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Branch Overview Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">Branch Inventory Overview</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {branchData.map((branch, index) => (
            <div key={index} className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl border border-slate-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800">{branch.name}</h3>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{branch.count}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-500/30" />
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${branch.percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 mt-2">{branch.percentage}% of total inventory</p>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Equipment Categories */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Equipment Categories</h2>
          <div className="space-y-4">
            {categories.map((category, index) => {
              const Icon = category.icon
              const percentage = Math.round((category.count / 1234) * 100)
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{category.name}</span>
                      <span className="text-sm text-slate-500">{category.count} items</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className={`${category.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'add'
                      ? 'bg-emerald-500'
                      : activity.type === 'assign'
                      ? 'bg-blue-500'
                      : activity.type === 'maintenance'
                      ? 'bg-amber-500'
                      : 'bg-purple-500'
                  }`}
                ></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{activity.action}</p>
                  <p className="text-sm text-slate-500">{activity.item}</p>
                </div>
                <span className="text-xs text-slate-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InventoryHome
