import React from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { generateChartColors } from '../../utils/dashboardUtils'

/**
 * Custom tooltip for branch charts with currency formatting
 */
const BranchTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-slate-200">
        <p className="text-sm font-semibold text-slate-700 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-slate-600">{entry.name}:</span>
            <span className="text-sm font-bold text-slate-900">
              {entry.name.includes('Cost') || entry.name.includes('Value') || entry.name.includes('Book')
                ? `₱${entry.value.toLocaleString()}`
                : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

/**
 * Branch Comparison Bar Chart
 * Shows asset count breakdown by status per branch
 */
export const BranchComparisonChart = React.memo(({ data, statusBreakdown, statusColorMap }) => {
  if (!statusBreakdown || statusBreakdown.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-slate-500">
        <p>No branch data available</p>
      </div>
    )
  }

  // Sort statusBreakdown by brcode using data (branchSummary)
  let sortedStatusBreakdown = statusBreakdown
  if (data && Array.isArray(data)) {
    const branchCodeMap = {}
    data.forEach(branch => {
      branchCodeMap[branch.branch_name] = branch.brcode || ''
    })

    sortedStatusBreakdown = [...statusBreakdown].sort((a, b) => {
      const codeA = branchCodeMap[a.branch_name] || ''
      const codeB = branchCodeMap[b.branch_name] || ''
      return codeA.localeCompare(codeB)
    })
  }

  // Transform data for stacked bar chart
  const chartData = sortedStatusBreakdown.map((branch) => {
    const row = { branch: branch.branch_name }
    branch.statuses.forEach((status) => {
      row[status.status] = status.count
    })
    return row
  })

  // Get all unique status names
  const allStatuses = [
    ...new Set(statusBreakdown.flatMap((b) => b.statuses.map((s) => s.status))),
  ]

  // Default status color map if not provided
  const defaultColorMap = {
    'Available': '#10b981',
    'Assigned': '#3b82f6',
    'New': '#068e36',
    'Under Repair': '#cdd01b',
    'Retired': '#6b7280',
    'Lost': '#ef4444',
  }

  const colorMap = statusColorMap || defaultColorMap

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 60, bottom: 80 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="branch"
          tick={{ fontSize: 12 }}
          stroke="#64748b"
          angle={-45}
          textAnchor="end"
          height={100}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#64748b"
          label={{ value: 'Asset Count', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<BranchTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="rect"
          iconSize={14}
          formatter={(value) => <span style={{ marginLeft: '8px' }}>{value}</span>}
        />
        {allStatuses.map((status) => (
          <Bar
            key={status}
            dataKey={status}
            stackId="a"
            fill={colorMap[status] || '#64748b'}
            name={status}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
})

BranchComparisonChart.displayName = 'BranchComparisonChart'

/**
 * Branch Expense Trends Line Chart
 * Shows monthly expenses (acquisitions + repairs) per branch over time
 */
export const BranchExpenseTrendsChart = React.memo(({ data, selectedBranches, branchSummary }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-slate-500">
        <p>No expense trend data available</p>
      </div>
    )
  }

  // Transform data for Recharts
  const chartData = data.map((monthData) => {
    const row = { month: monthData.month }
    Object.entries(monthData.branches).forEach(([branchName, branchData]) => {
      if (!selectedBranches || selectedBranches.includes(branchName)) {
        row[branchName] = branchData.total_expense
      }
    })
    return row
  })

  // Get branch names for lines
  let branchNames = selectedBranches || Object.keys(data[0]?.branches || {})

  // Sort branch names by brcode if branchSummary is provided
  if (branchSummary && Array.isArray(branchSummary)) {
    const branchCodeMap = {}
    branchSummary.forEach(branch => {
      branchCodeMap[branch.branch_name] = branch.brcode || ''
    })

    branchNames = [...branchNames].sort((a, b) => {
      const codeA = branchCodeMap[a] || ''
      const codeB = branchCodeMap[b] || ''
      return codeA.localeCompare(codeB)
    })
  }

  const colors = generateChartColors(branchNames.length)

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11 }}
          stroke="#64748b"
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#64748b"
          label={{ value: 'Total Expenses (₱)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<BranchTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        {branchNames.map((branchName, index) => (
          <Line
            key={branchName}
            type="monotone"
            dataKey={branchName}
            stroke={colors[index]}
            strokeWidth={2}
            dot={{ fill: colors[index], r: 4 }}
            activeDot={{ r: 6 }}
            name={branchName}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
})

BranchExpenseTrendsChart.displayName = 'BranchExpenseTrendsChart'

/**
 * Branch Status Breakdown Stacked Bar Chart
 * Shows asset status distribution per branch
 */
export const BranchStatusBreakdownChart = React.memo(({ data, statusColorMap, branchSummary }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-slate-500">
        <p>No status breakdown data available</p>
      </div>
    )
  }

  // Sort data by brcode using branchSummary
  let sortedData = data
  if (branchSummary && Array.isArray(branchSummary)) {
    const branchCodeMap = {}
    branchSummary.forEach(branch => {
      branchCodeMap[branch.branch_name] = branch.brcode || ''
    })

    sortedData = [...data].sort((a, b) => {
      const codeA = branchCodeMap[a.branch_name] || ''
      const codeB = branchCodeMap[b.branch_name] || ''
      return codeA.localeCompare(codeB)
    })
  }

  // Transform data for stacked bar chart
  const chartData = sortedData.map((branch) => {
    const row = { branch: branch.branch_name }
    branch.statuses.forEach((status) => {
      row[status.status] = status.count
    })
    return row
  })

  // Get all unique status names
  const allStatuses = [
    ...new Set(data.flatMap((b) => b.statuses.map((s) => s.status))),
  ]

  // Enhanced status color map with more distinct, professional colors
  const defaultColorMap = {
    'Available': '#10b981',      // Emerald green
    'Assigned': '#3b82f6',       // Blue
    'New': '#06b6d4',            // Cyan
    'Functional': '#8b5cf6',     // Purple
    'Under Repair': '#f59e0b',   // Amber
    'Retired': '#6b7280',        // Gray
    'Lost': '#ef4444',           // Red
    'Defective': '#dc2626',      // Dark red
  }

  const colorMap = statusColorMap || defaultColorMap

  // Calculate dynamic height based on number of branches (minimum 500px, 70px per branch for better spacing)
  const dynamicHeight = Math.max(500, sortedData.length * 70)

  // Aggregate status data for pie chart
  const statusAggregation = {}
  data.forEach(branch => {
    branch.statuses.forEach(status => {
      if (!statusAggregation[status.status]) {
        statusAggregation[status.status] = 0
      }
      statusAggregation[status.status] += status.count
    })
  })

  const pieChartData = Object.entries(statusAggregation).map(([status, count]) => ({
    name: status,
    value: count,
    color: colorMap[status] || '#64748b'
  }))

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Branches</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{sortedData.length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Total Assets</p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">
            {chartData.reduce((sum, branch) => {
              return sum + Object.entries(branch).reduce((branchSum, [key, value]) => {
                return key !== 'branch' ? branchSum + (value || 0) : branchSum
              }, 0)
            }, 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Status Types</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{allStatuses.length}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Avg per Branch</p>
          <p className="text-2xl font-bold text-amber-900 mt-1">
            {Math.round(chartData.reduce((sum, branch) => {
              return sum + Object.entries(branch).reduce((branchSum, [key, value]) => {
                return key !== 'branch' ? branchSum + (value || 0) : branchSum
              }, 0)
            }, 0) / sortedData.length)}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Horizontal Bar Chart - Branch Breakdown (2/3 width) */}
        <div className="lg:col-span-2">
          <h4 className="text-sm font-semibold text-slate-700 mb-4">Status Distribution by Branch</h4>
          <ResponsiveContainer width="100%" height={dynamicHeight}>
            <BarChart
              data={chartData}
              layout="horizontal"
              margin={{ top: 20, right: 60, left: 180, bottom: 30 }}
              barSize={35}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 12, fontWeight: 500 }}
                stroke="#64748b"
                tickLine={{ stroke: '#cbd5e1' }}
                label={{
                  value: 'Number of Assets',
                  position: 'insideBottom',
                  offset: -15,
                  style: { fontSize: 13, fontWeight: 600, fill: '#475569' }
                }}
              />
              <YAxis
                dataKey="branch"
                type="category"
                tick={{ fontSize: 12, fontWeight: 500 }}
                stroke="#64748b"
                width={165}
                tickLine={{ stroke: '#cbd5e1' }}
              />
              <Tooltip
                content={<BranchTooltip />}
                cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: '25px',
                  paddingBottom: '10px'
                }}
                iconType="circle"
                iconSize={10}
                formatter={(value) => (
                  <span style={{
                    marginLeft: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#475569'
                  }}>
                    {value}
                  </span>
                )}
              />
              {allStatuses.map((status) => (
                <Bar
                  key={status}
                  dataKey={status}
                  stackId="a"
                  fill={colorMap[status] || '#64748b'}
                  name={status}
                  radius={[0, 4, 4, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Overall Status Distribution (1/3 width) */}
        <div className="flex flex-col">
          <h4 className="text-sm font-semibold text-slate-700 mb-4">Overall Status Distribution</h4>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={500}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value.toLocaleString(), name]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => (
                    <span style={{
                      marginLeft: '8px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#475569'
                    }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status Legend with Counts */}
          <div className="mt-6 space-y-2">
            {pieChartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})

BranchStatusBreakdownChart.displayName = 'BranchStatusBreakdownChart'

/**
 * Branch Contribution Progress Bars
 * Shows each branch's percentage contribution to total assets/value
 */
export const BranchContributionBars = React.memo(({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        <p>No contribution data available</p>
      </div>
    )
  }

  const totalAssets = data.reduce((sum, b) => sum + b.total_assets, 0)
  const colors = generateChartColors(data.length)

  // Sort branches by brcode
  const sortedData = [...data].sort((a, b) => {
    const codeA = a.brcode || '';
    const codeB = b.brcode || '';
    return codeA.localeCompare(codeB);
  })

  return (
    <div>
      {/* Assets Distribution */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-3">
          Asset Distribution
        </h4>
        <div className="space-y-3">
          {sortedData.map((branch, index) => {
            const percentage = totalAssets > 0
              ? ((branch.total_assets / totalAssets) * 100).toFixed(1)
              : 0

            return (
              <div key={branch.branch_id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-600">
                    {branch.branch_name}
                  </span>
                  <span className="text-xs font-semibold text-slate-900">
                    {branch.total_assets} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: colors[index % colors.length],
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
})

BranchContributionBars.displayName = 'BranchContributionBars'
