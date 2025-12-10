import { Outlet } from 'react-router-dom'
import { Typography } from '@material-tailwind/react'

function HelpdeskLayout() {
  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
        <Typography className="text-sm font-medium text-amber-800">
          Helpdesk module
        </Typography>
        <Typography className="text-xs text-amber-700">
          Organize tickets, workflows, and service operations here.
        </Typography>
      </div>
      <Outlet />
    </section>
  )
}

export default HelpdeskLayout
