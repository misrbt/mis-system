import { Card, CardBody, Typography } from '@material-tailwind/react'

function HelpdeskHomePage() {
  return (
    <div className="space-y-4">
      <Typography variant="h3" className="text-slate-900">
        Helpdesk
      </Typography>
      <Card shadow={false} className="border border-slate-200 bg-white">
        <CardBody className="space-y-2">
          <Typography className="text-sm text-slate-600">
            This is a placeholder for the helpdesk module. Add ticket lists, detail panes, and
            workflows here.
          </Typography>
        </CardBody>
      </Card>
    </div>
  )
}

export default HelpdeskHomePage
