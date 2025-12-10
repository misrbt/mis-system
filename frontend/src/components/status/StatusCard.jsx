import { Alert, Card, CardBody, Chip, Typography } from '@material-tailwind/react'
import usePing from '../../hooks/usePing'

function StatusCard() {
  const { data, error, isError, isFetching, isPending, refetch } = usePing()

  const status = isPending ? 'checking' : isError ? 'error' : 'online'
  const statusLabel =
    status === 'checking' ? 'Checking...' : status === 'error' ? 'Error' : 'Online'

  return (
    <Card shadow={false} className="border border-slate-200 bg-white/90 shadow-sm">
      <CardBody className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <Typography variant="h6" className="text-slate-800">
              API Status
            </Typography>
            <Typography className="text-sm text-slate-500">
              Live check of the backend ping endpoint using React Query.
            </Typography>
          </div>
          <Chip
            value={statusLabel}
            color={status === 'online' ? 'green' : status === 'checking' ? 'amber' : 'red'}
            className="font-semibold"
          />
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          {data ? (
            <pre className="whitespace-pre-wrap break-all font-mono text-sm text-slate-800">
              {JSON.stringify(data, null, 2)}
            </pre>
          ) : (
            <Typography className="text-sm text-slate-500">
              {isPending ? 'Loading...' : 'No response yet.'}
            </Typography>
          )}
        </div>

        {isError ? (
          <Alert color="red" className="text-sm">
            Error: {error instanceof Error ? error.message : 'Unknown error'}
          </Alert>
        ) : null}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isFetching ? 'Refreshing...' : 'Refetch now'}
          </button>
        </div>
      </CardBody>
    </Card>
  )
}

export default StatusCard
