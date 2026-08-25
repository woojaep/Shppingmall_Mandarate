import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { AutomationPriority, AutomationStatus, BusinessItem, Category, HumanJudgement } from '../types/model'
import { JUDGEMENT_LABEL, PRIORITY_LABEL, STATUS_LABEL, STATUS_MARK } from '../types/model'
import { STATUS_TONE } from '../lib/tokens'
import { useMapDispatch } from '../store/mapStore'
import type { ItemPatch } from '../store/actions'
import { Button } from './ui/Button'

const STATUSES: AutomationStatus[] = ['manual', 'semi', 'automated']
const PRIORITIES: AutomationPriority[] = [1, 2, 3]
const JUDGEMENTS: HumanJudgement[] = ['low', 'medium', 'high']

interface ItemEditorRowProps {
  item: BusinessItem
  categoryId: string
  categories: Category[]
  expanded: boolean
  onToggle: () => void
}

export function ItemEditorRow({ item, categoryId, categories, expanded, onToggle }: ItemEditorRowProps) {
  const dispatch = useMapDispatch()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `editor:${item.id}`,
    data: { type: 'editor-item', itemId: item.id },
  })

  const patch = (changes: ItemPatch) =>
    dispatch({ type: 'UPDATE_ITEM', categoryId, itemId: item.id, patch: changes })

  const tone = STATUS_TONE[item.automationStatus]

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`rounded-lg border bg-white ${isDragging ? 'opacity-50 ring-2 ring-slate-400' : 'border-slate-200'}`}
    >
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        <span
          {...attributes}
          {...listeners}
          aria-label="순서 이동"
          className="cursor-grab rounded px-1 text-slate-400 select-none hover:bg-slate-100 active:cursor-grabbing"
        >
          ⠿
        </span>
        <span aria-hidden="true" className={tone.dot}>
          {STATUS_MARK[item.automationStatus]}
        </span>
        <input
          value={item.name}
          onChange={(event) => patch({ name: event.target.value })}
          className="min-w-0 flex-1 rounded border border-transparent px-1 py-0.5 text-sm font-medium hover:border-slate-200 focus:border-slate-400 focus:outline-none"
        />
        <span className="text-[11px] text-slate-400">{PRIORITY_LABEL[item.automationPriority]}</span>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="rounded px-1 text-xs text-slate-500 hover:bg-slate-100"
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {expanded ? (
        <div className="space-y-2 border-t border-slate-100 px-2 py-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500">자동화</span>
              {STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => patch({ automationStatus: status })}
                  className={`rounded border px-1.5 py-0.5 text-[11px] ${
                    item.automationStatus === status
                      ? STATUS_TONE[status].solid
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {STATUS_MARK[status]} {STATUS_LABEL[status]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500">우선순위</span>
              {PRIORITIES.map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => patch({ automationPriority: priority })}
                  className={`rounded border px-1.5 py-0.5 text-[11px] ${
                    item.automationPriority === priority
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {PRIORITY_LABEL[priority]}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-1 text-[11px] text-slate-500">
              사람판단
              <select
                value={item.humanJudgement}
                onChange={(event) => patch({ humanJudgement: event.target.value as HumanJudgement })}
                className="rounded border border-slate-200 px-1 py-0.5 text-[11px] text-slate-700"
              >
                {JUDGEMENTS.map((judgement) => (
                  <option key={judgement} value={judgement}>
                    {JUDGEMENT_LABEL[judgement]}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-1 text-[11px] text-slate-500">
              담당
              <input
                value={item.owner ?? ''}
                onChange={(event) => patch({ owner: event.target.value })}
                placeholder="미지정"
                className="w-24 rounded border border-slate-200 px-1 py-0.5 text-[11px] text-slate-700"
              />
            </label>
          </div>

          <textarea
            value={item.memo ?? ''}
            onChange={(event) => patch({ memo: event.target.value })}
            placeholder="메모 — 지금 어떻게 처리하는지, 무엇이 걸리는지"
            rows={2}
            className="w-full resize-y rounded border border-slate-200 px-2 py-1 text-[12px] text-slate-700"
          />

          <div className="flex flex-wrap items-center gap-1.5">
            <label className="flex items-center gap-1 text-[11px] text-slate-500">
              대분류 이동
              <select
                value={categoryId}
                onChange={(event) => {
                  const toCategoryId = event.target.value
                  if (toCategoryId === categoryId) return
                  const target = categories.find((category) => category.id === toCategoryId)
                  dispatch({
                    type: 'MOVE_ITEM',
                    itemId: item.id,
                    fromCategoryId: categoryId,
                    toCategoryId,
                    toIndex: target ? target.items.length : 0,
                  })
                }}
                className="rounded border border-slate-200 px-1 py-0.5 text-[11px] text-slate-700"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => dispatch({ type: 'PROMOTE_ITEM', categoryId, itemId: item.id })}
            >
              대분류로 승격
            </Button>

            <Button
              size="sm"
              variant="danger"
              className="ml-auto"
              onClick={() => dispatch({ type: 'DELETE_ITEM', categoryId, itemId: item.id })}
            >
              삭제
            </Button>
          </div>
        </div>
      ) : null}
    </li>
  )
}
