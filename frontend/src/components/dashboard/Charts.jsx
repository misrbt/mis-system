import React from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { generateChartColors } from '../../utils/dashboardUtils'

/**
 * Custom tooltip component for charts
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-slate-200">
        <p className="text-xs font-semibold text-slate-700">{payload[0].name}</p>
        <p className="text-sm font-bold text-blue-600">{payload[0].value}</p>
      </div>
    )
  }
  return null
}

/**
 * Category Pie Chart Component
 */
export const CategoryPieChart = React.memo(({ data }) => {
  const colors = generateChartColors(data.length)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
})

CategoryPieChart.displayName = 'CategoryPieChart'

/**
 * Status Pie Chart Component
 */
export const StatusPieChart = React.memo(({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
})

StatusPieChart.displayName = 'StatusPieChart'

/**
 * Monthly Expenses Bar Chart Component
 */
export const MonthlyExpensesChart = React.memo(({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          stroke="#64748b"
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Bar dataKey="acquisition_cost" stackId="a" fill="#10b981" name="Acquisitions" />
        <Bar dataKey="repair_cost" stackId="a" fill="#f59e0b" name="Repairs" />
      </BarChart>
    </ResponsiveContainer>
  )
})

MonthlyExpensesChart.displayName = 'MonthlyExpensesChart'

/**
 * Yearly Comparison Bar Chart Component
 */
export const YearlyComparisonChart = React.memo(({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="#64748b" />
        <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Bar dataKey="acquisition_cost" fill="#3b82f6" name="Acquisitions" />
        <Bar dataKey="repair_cost" fill="#f59e0b" name="Repairs" />
      </BarChart>
    </ResponsiveContainer>
  )
})

YearlyComparisonChart.displayName = 'YearlyComparisonChart'

/**
 * Acquisitions Line Chart Component
 */
export const AcquisitionsLineChart = React.memo(({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748b" />
        <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: '#3b82f6' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
})

AcquisitionsLineChart.displayName = 'AcquisitionsLineChart'

/**
 * Branch Distribution Bar Chart Component
 */
export const BranchDistributionChart = React.memo(({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis type="number" tick={{ fontSize: 12 }} stroke="#64748b" />
        <YAxis dataKey="branch" type="category" tick={{ fontSize: 12 }} stroke="#64748b" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        />
        <Bar dataKey="count" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  )
})

BranchDistributionChart.displayName = 'BranchDistributionChart'
