import { Building2, UserCog } from 'lucide-react'

export const TRANSITION_MODES = {
  BRANCH: 'branch',
  EMPLOYEE: 'employee',
}

export const TRANSITION_MODE_CONFIG = {
  [TRANSITION_MODES.BRANCH]: {
    title: 'Branch Transition',
    description: 'Move employees between branches/positions - assets do not move',
    color: 'teal',
    icon: Building2,
    features: [
      {
        label: 'Exchange Detection',
        desc: 'Automatically suggests swaps when positions are occupied',
      },
      {
        label: 'Circular Rotations',
        desc: 'Supports 3-way, 4-way, and complex rotation chains',
      },
      {
        label: 'Workstation Assets',
        desc: 'Fixed equipment stays at desk, portable items follow employees',
      },
    ],
    infoBannerTitle: 'How Branch Transition Works',
    infoBannerDescriptionText: 'Change the Destination Branch or Destination Position for any employee. When multiple employees swap positions, they\'ll be automatically detected as exchanges and marked with purple badges. Assets do NOT move - they stay at their original location.',
    headerSubtitle: 'Modify employees below, exchanges detected automatically',
  },
  [TRANSITION_MODES.EMPLOYEE]: {
    title: 'Employee Transition',
    description: 'Move employees freely without restrictions - assets do not move',
    color: 'blue',
    icon: UserCog,
    features: [
      {
        label: 'No Restrictions',
        desc: 'Move employees freely without exchange validation',
      },
      {
        label: 'Quick Reassignments',
        desc: 'Perfect for promotions, transfers, and role changes',
      },
      {
        label: 'Workstation Assets',
        desc: 'Fixed equipment stays at desk, portable items follow employees',
      },
    ],
    infoBannerTitle: 'How Employee Transition Works',
    infoBannerDescriptionText: 'Change the Destination Branch or Destination Position for any employee. No validation or exchange requirements - perfect for promotions, transfers, or reassignments. Assets do NOT move - they stay at their original location.',
    headerSubtitle: 'Modify employees freely without restrictions',
  },
}

export const PAGE_SIZES = [10, 20, 30, 50, 100]

export const TABLE_COLUMNS = [
  {
    id: 'employee',
    header: 'Employee',
    accessorFn: row => row.fullname ?? '',
    enableSorting: true,
  },
  {
    id: 'currentBranch',
    header: 'Current Branch',
    accessorFn: row => row.branch?.branch_name ?? '',
    enableSorting: true,
  },
  {
    id: 'currentPosition',
    header: 'Current Position',
    accessorFn: row => row.position?.title ?? '',
    enableSorting: true,
  },
  {
    id: 'destBranch',
    header: 'Destination Branch',
    enableSorting: false,
  },
  {
    id: 'destPosition',
    header: 'Destination Position',
    enableSorting: false,
  },
  {
    id: 'status',
    header: 'Status',
    enableSorting: false,
  },
  {
    id: 'action',
    header: 'Action',
    enableSorting: false,
  },
]
