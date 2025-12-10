import { Card, CardBody, Typography } from '@material-tailwind/react'

function InventoryPage() {
  return (
    <div className="space-y-4">
      <Typography variant="h3" className="text-slate-900">
        Inventory
      </Typography>
      <Card shadow={false} className="border border-slate-200 bg-white">
        <CardBody className="space-y-2">
          <Typography className="text-sm text-slate-600">
            This is a placeholder for the inventory module. Add listings, filters, and detail
            views here.
          </Typography>
        </CardBody>
      </Card>
    </div>
  )
}

export default InventoryPage
