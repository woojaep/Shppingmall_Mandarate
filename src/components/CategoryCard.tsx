import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Category, Layer } from '../types/model'
import { LAYER_LABEL, LAYERS, STATUS_LABEL, STATUS_MARK } from '../types/model'
import { categoryStats } from '../lib/stats'
import { STATUS_TONE } from '../lib/tokens'
import type { FilterState } from '../lib/filters'
import { matchesFilter } from '../lib/filters'
import { useMapDispatch } from '../store/mapStore'
import { ItemChip } from './ItemChip'
import { Button } from './ui/Button'

interface CategoryCardProps {
  category: Category
  editMode: boolean
  filter: FilterState
  onOpen: (categoryId: string, itemId?: string) => void
}

/** 대분류 하나 = 카드 하나. 카드 안에 하위항목이 2열로 깔린다. */
export function CategoryCard({ category, editMode, filter, onOpen }: CategoryCardProps) {
  const dispatch = useMapDispatch()
  const [renaming, setRenaming] = useState(false)
  const [draftName, setDraftName] = useState(category.name)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
    disabled: !editMode,
    data: { type: 'category', categoryId: category.id, layer: category.layer },
  })

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `body:${category.id}`,
    data: { type: 'category-body', categoryId: category.id },
  })

  const stats = categoryStats(category)

  const commitRename = () => {
    const name = draftName.trim()
    if (name && name !== category.name) dispatch({ type: 'RENAME_CATEGORY', categoryId: category.id, name })
    else setDraftName(category.name)
    setRenaming(false)
  }

  const addItem = () => {
    const name = window.prompt('새 하위항목 이름')?.trim()
    if (name) dispatch({ type: 'ADD_ITEM', categoryId: category.id, name })
  }

  const removeCategory = () => {
    if (!window.confirm(`대분류 "${category.name}"와(과) 하위항목 ${category.items.length}개를 삭제할까요?\n삭제 후 되돌리기 버튼으로 복구할 수 있습니다.`)) return
    dispatch({ type: 'DELETE_CATEGORY', categoryId: category.id })
  }

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`flex min-w-[190px] flex-1 flex-col rounded-lg border bg-white shadow-sm ${
        isDragging ? 'z-20 opacity-60 ring-2 ring-slate-400' : 'border-slate-200'
      } ${isOver ? 'ring-2 ring-sky-400' : ''}`}
    >
      <header className="flex items-start gap-1 border-b border-slate-100 px-2 pt-2 pb-1.5">
        {editMode ? (
          <span
            {...attributes}
            {...listeners}
            aria-label="대분류 이동"
            className="mt-0.5 cursor-grab rounded px-1 text-slate-400 select-none hover:bg-slate-100 active:cursor-grabbing"
          >
            ⠿
          </span>
        ) : null}

        <div className="min-w-0 flex-1">
          {renaming ? (
            <input
              autoFocus
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onBlur={commitRename}
              onKeyDown={(event) => {
                if (event.key === 'Enter') commitRename()
                if (event.key === 'Escape') {
                  setDraftName(category.name)
                  setRenaming(false)
                }
              }}
              className="w-full rounded border border-slate-300 px-1 py-0.5 text-sm font-semibold"
            />
          ) : (
            <button
              type="button"
              onClick={() => (editMode ? setRenaming(true) : onOpen(category.id))}
              className="w-full truncate text-left text-sm font-semibold text-slate-800 hover:text-sky-700"
              title={editMode ? '클릭해서 이름 변경' : '클릭해서 상세 보기'}
            >
              {category.name}
            </button>
          )}
          <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
            <span>{stats.total}개</span>
            <span aria-hidden="true">·</span>
            <span className={STATUS_TONE.manual.dot}>
              {STATUS_MARK.manual}
              {stats.manual}
            </span>
            <span className={STATUS_TONE.semi.dot}>
              {STATUS_MARK.semi}
              {stats.semi}
            </span>
            <span className={STATUS_TONE.automated.dot}>
              {STATUS_MARK.automated}
              {stats.automated}
            </span>
            {stats.urgent > 0 ? (
              <span className="ml-auto rounded bg-slate-900 px-1 text-[9px] font-semibold text-white">
                ★★★ 수동 {stats.urgent}
              </span>
            ) : null}
          </div>
        </div>

        {editMode ? (
          <button
            type="button"
            onClick={removeCategory}
            aria-label={`${category.name} 삭제`}
            className="rounded px-1 text-xs text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          >
            ✕
          </button>
        ) : null}
      </header>

      {/* 상태 비율 막대 — 카드 단위 자동화 수준을 한눈에 */}
      <div className="flex h-1 w-full overflow-hidden bg-slate-100" aria-hidden="true">
        {(['manual', 'semi', 'automated'] as const).map((status) =>
          stats[status] > 0 ? (
            <div
              key={status}
              className={STATUS_TONE[status].bar}
              style={{ width: `${(stats[status] / Math.max(stats.total, 1)) * 100}%` }}
              title={`${STATUS_LABEL[status]} ${stats[status]}개`}
            />
          ) : null,
        )}
      </div>

      <div ref={setDropRef} className="flex-1 p-1.5">
        <SortableContext items={category.items.map((item) => item.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 gap-1">
            {category.items.map((item) => (
              <ItemChip
                key={item.id}
                item={item}
                categoryId={category.id}
                editMode={editMode}
                dimmed={!matchesFilter(item, filter)}
                onOpen={() => onOpen(category.id, item.id)}
              />
            ))}
          </div>
        </SortableContext>
        {category.items.length === 0 ? (
          <p className="px-1 py-3 text-center text-[11px] text-slate-400">
            {editMode ? '아래 + 항목으로 추가하세요' : '하위항목 없음'}
          </p>
        ) : null}
      </div>

      {editMode ? (
        <footer className="flex items-center gap-1 border-t border-slate-100 px-1.5 py-1">
          <Button size="sm" variant="ghost" onClick={addItem}>
            + 항목
          </Button>
          <select
            aria-label={`${category.name}의 층`}
            value={category.layer}
            onChange={(event) =>
              dispatch({
                type: 'SET_CATEGORY_LAYER',
                categoryId: category.id,
                layer: event.target.value as Layer,
              })
            }
            className="ml-auto rounded border border-slate-200 bg-white px-1 py-0.5 text-[10px] text-slate-600"
          >
            {LAYERS.map((layer) => (
              <option key={layer} value={layer}>
                {LAYER_LABEL[layer]}
              </option>
            ))}
          </select>
        </footer>
      ) : null}
    </article>
  )
}
