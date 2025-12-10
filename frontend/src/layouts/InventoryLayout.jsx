import { Outlet } from 'react-router-dom'
import { Typography } from '@material-tailwind/react'

function InventoryLayout() {
  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <Typography className="text-sm font-medium text-blue-800">
          Inventory module
        </Typography>
        <Typography className="text-xs text-blue-700">
          Manage stock, SKUs, and related workflows here.
        </Typography>
      </div>
      <Outlet />
    </section>
  )
}

export default InventoryLayout
