import { useParams } from 'react-router-dom'
import {
  useAssetViewController,
  AssetViewIndividualContainer,
  AssetViewEmployeeContainer,
  AssetViewModals,
} from './asset-view'


function AssetViewPage() {
  const { id, employeeId } = useParams()

  // Initialize controller with all state, queries, mutations, and handlers
  const controller = useAssetViewController({ id, employeeId })

  // Determine which view mode to render
  const isEmployeeView = !id && !!employeeId
  const isIndividualAssetView = !!id

  return (
    <>
      {/* Render modals (always present, controlled by state) */}
      <AssetViewModals controller={controller} isEmployeeView={isEmployeeView} />

      {/* Individual Asset View */}
      {isIndividualAssetView && (
        <AssetViewIndividualContainer controller={controller} />
      )}

      {/* Employee Assets View */}
      {isEmployeeView && (
        <AssetViewEmployeeContainer controller={controller} />
      )}
    </>
  )
}

export default AssetViewPage
