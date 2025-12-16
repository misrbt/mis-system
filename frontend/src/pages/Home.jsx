import { Button, Card, CardBody, Typography } from '@material-tailwind/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import StatusCard from '../components/status/StatusCard'

const queryClient = new QueryClient()

function HomePage() {
  return (
    <QueryClientProvider client={queryClient}>
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
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </QueryClientProvider>
  )
}

export default HomePage
