import { Button, Card, CardBody, Typography } from '@material-tailwind/react'
import StatusCard from '../components/status/StatusCard'

function HomePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography variant="h3" className="text-slate-900">
            Dashboard
          </Typography>
          <Typography className="text-slate-500">
            Quick overview of the system status and entry points.
          </Typography>
        </div>
        <Button color="blue" variant="gradient">
          New Action
        </Button>
      </div>

      <StatusCard />

      <Card shadow={false} className="border border-slate-200 bg-white/90 shadow-sm">
        <CardBody>
          <Typography variant="h6" className="text-slate-800">
            Getting started
          </Typography>
          <Typography className="mt-2 text-sm text-slate-600">
            Use the sidebar to jump into Inventory or Helpdesk modules. This dashboard will
            evolve with KPIs, charts, and shortcuts as features are added.
          </Typography>
        </CardBody>
      </Card>
    </div>
  )
}

export default HomePage
