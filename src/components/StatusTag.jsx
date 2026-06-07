import { getStatusText, getStatusColor } from '../utils/helpers'

export default function StatusTag({ status, reviewStage = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
        status,
        reviewStage
      )}`}
    >
      {getStatusText(status, reviewStage)}
    </span>
  )
}
