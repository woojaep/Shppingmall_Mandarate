import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { BusinessItem } from '../types/model'
import { JUDGEMENT_LABEL, PRIORITY_LABEL, STATUS_LABEL, STATUS_MARK } from '../types/model'
import { STATUS_TONE } from '../lib/tokens'

interface ItemChipProps {
  item: BusinessItem
  categoryId: string
  editMode: boolean
  dimmed: boolean
  onOpen: () => void
}

export function ItemChip({ item, categoryId, editMode, dimmed, onOpen }: ItemChipProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !editMode,
    data: { type: 'item', categoryId, itemId: item.id },
  })

  const tone = STATUS_TONE[item.automationStatus]
  const title = [
    `${item.name}`,
    `자동화: ${STATUS_LABEL[item.automationStatus]}`,
    `우선순위: ${PRIORITY_LABEL[item.automationPriority]}`,
    `사람판단: ${JUDGEMENT_LABEL[item.humanJudgement]}`,
    item.owner ? `담당: ${item.owner}` : '',
    item.memo ? `메모: ${item.memo}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onOpen}
      title={title}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={`flex w-full items-center gap-1 rounded border px-1.5 py-1 text-left text-[11px] leading-tight transition-opacity ${tone.chip} ${
        editMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } ${isDragging ? 'z-10 opacity-40' : ''} ${dimmed ? 'opacity-20 grayscale' : ''}`}
    >
      <span aria-hidden="true" className={`${tone.dot} text-[10px]`}>
        {STATUS_MARK[item.automationStatus]}
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">{item.name}</span>
      <span className="shrink-0 text-[9px] tracking-tighter text-slate-500">
        {PRIORITY_LABEL[item.automationPriority]}
      </span>
      <span className="sr-only">
        {STATUS_LABEL[item.automationStatus]}, 우선순위 {item.automationPriority}단계
      </span>
    </button>
  )
}
