import { Building2, UserCog, LayoutGrid, GitBranch, Columns, Table2 } from 'lucide-react'

export const TRANSITION_MODES = {
  BRANCH: 'branch',
  EMPLOYEE: 'employee',
}

export const VIEW_TYPES = {
  VISUAL_GRID: 'visual_grid',
  FLOW_BUILDER: 'flow_builder',
  SPLIT_PANEL: 'split_panel',
  ENHANCED_TABLE: 'enhanced_table',
}

export const VIEW_TYPE_CONFIG = {
  [VIEW_TYPES.VISUAL_GRID]: {
    id: VIEW_TYPES.VISUAL_GRID,
    title: 'Visual Grid',
    description: 'Drag employees between workstations on a visual canvas',
    icon: LayoutGrid,
    shortcut: '1',
  },
  [VIEW_TYPES.FLOW_BUILDER]: {
    id: VIEW_TYPES.FLOW_BUILDER,
    title: 'Flow Builder',
    description: 'Step-by-step wizard for guided transitions',
    icon: GitBranch,
    shortcut: '2',
  },
  [VIEW_TYPES.SPLIT_PANEL]: {
    id: VIEW_TYPES.SPLIT_PANEL,
    title: 'Split Panel',
    description: 'Side-by-side before/after comparison view',
    icon: Columns,
    shortcut: '3',
  },
  [VIEW_TYPES.ENHANCED_TABLE]: {
    id: VIEW_TYPES.ENHANCED_TABLE,
    title: 'Table View',
    description: 'Traditional table with inline editing',
    icon: Table2,
    shortcut: '4',
  },
}

export const TRANSITION_MODE_CONFIG = {
  [TRANSITION_MODES.BRANCH]: {
    title: 'Branch Transition',
    description: 'Transfer employees to different branches with workstation assignment',
    color: 'teal',
    icon: Building2,
    features: [
      {
        label: 'Cross-Branch Transfer',
        desc: 'Move employees to different branch locations with new workstation assignment',
      },
      {
        label: 'Exchange Detection',
        desc: 'Automatically detects swaps when multiple employees exchange workstations',
      },
      {
        label: 'Smart Workstation Matching',
        desc: 'System suggests workstations matching employee position in new branch',
      },
      {
        label: 'Occupation Warnings',
        desc: 'Alerts when workstation is occupied and recommends creating exchanges',
      },
    ],
    infoBannerTitle: 'How Branch Transition Works',
    infoBannerDescriptionText: 'Transfer employees to different branches. Select new branch, then choose workstation in that branch. When multiple employees swap positions, they\'ll be automatically detected as exchanges and marked with purple badges. Assets do NOT move - they stay at their original location.',
    headerSubtitle: 'Transfer employees between branches with workstation assignment',
  },
  [TRANSITION_MODES.EMPLOYEE]: {
    title: 'Employee Transition',
    description: 'Reassign workstations within same branch - no branch change allowed',
    color: 'blue',
    icon: UserCog,
    features: [
      {
        label: 'Same Branch Only',
        desc: 'Employee stays in current branch - reassign to different workstation only',
      },
      {
        label: 'Workstation Reassignment',
        desc: 'Move employee to another desk/position within same location',
      },
      {
        label: 'Quick Desk Changes',
        desc: 'Perfect for internal reorganizations and desk swaps',
      },
      {
        label: 'Occupation Warnings',
        desc: 'Alerts when workstation is occupied and suggests creating exchanges',
      },
    ],
    infoBannerTitle: 'How Employee Transition Works',
    infoBannerDescriptionText: 'Reassign employees to different workstations within their current branch. Branch selection is locked - only workstation reassignment is allowed. Perfect for internal desk changes and reorganizations. Assets do NOT move - they stay at their original location.',
    headerSubtitle: 'Reassign workstations within current branch',
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
    id: 'currentWorkstation',
    header: 'Current Workstation',
    accessorFn: row => row.workstations?.[0]?.position?.title ?? '',
    enableSorting: true,
  },
  {
    id: 'destWorkstation',
    header: 'New Workstation',
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
