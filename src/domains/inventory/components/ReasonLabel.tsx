import { REASON_LABELS } from "../constants"
import type { MovementReason } from "../types/inventory.types"

interface ReasonLabelProps {
  reason: MovementReason | string
}

const ReasonLabel = ({ reason }: ReasonLabelProps) => (
  <>{REASON_LABELS[reason as MovementReason] ?? reason}</>
)

export default ReasonLabel
