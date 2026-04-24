import { lazy } from 'react'

const PublicHelpdeskLayout = lazy(() => import('../layouts/PublicHelpdeskLayout'))
const PublicHelpdeskHome = lazy(() => import('../pages/public-helpdesk/PublicHelpdeskHome'))
const PublicSubmitTicket = lazy(() => import('../pages/public-helpdesk/PublicSubmitTicket'))
const PublicTrackTicket = lazy(() => import('../pages/public-helpdesk/PublicTrackTicket'))
const PublicApprovalPage = lazy(() => import('../pages/public-helpdesk/PublicApprovalPage'))

const publicHelpdeskRoutes = {
  path: '/public-helpdesk',
  element: <PublicHelpdeskLayout />,
  children: [
    { index: true, element: <PublicHelpdeskHome /> },
    { path: 'submit', element: <PublicSubmitTicket /> },
    { path: 'track', element: <PublicTrackTicket /> },
    { path: 'approval/:token', element: <PublicApprovalPage /> },
  ],
}

export default publicHelpdeskRoutes
