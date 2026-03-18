import { useParams } from 'react-router-dom'
import {
  useAssetViewController,
  AssetViewIndividualContainer,
  AssetViewEmployeeContainer,
  AssetViewModals,
} from './asset-view'


function AssetViewPage() {
  const { id, employeeId, workstationId } = useParams()

  // Initialize controller with all state, queries, mutations, and handlers
  const controller = useAssetViewController({ id, employeeId, workstationId })

  // Determine which view mode to render
  const isEmployeeView = !id && !!employeeId && !workstationId
  const isWorkstationView = !id && !employeeId && !!workstationId
  const isIndividualAssetView = !!id

  return (
    <>
      {/* Render modals (always present, controlled by state) */}
      <AssetViewModals controller={controller} isEmployeeView={isEmployeeView || isWorkstationView} />

      {/* Individual Asset View */}
      {isIndividualAssetView && (
        <AssetViewIndividualContainer controller={controller} />
      )}

      {/* Employee Assets View */}
      {isEmployeeView && (
        <AssetViewEmployeeContainer controller={controller} />
      )}

      {/* Workstation Assets View - reuse employee container for now */}
      {isWorkstationView && (
        <AssetViewEmployeeContainer controller={controller} isWorkstationView={true} />
      )}
    </>
  )
}

export default AssetViewPage
