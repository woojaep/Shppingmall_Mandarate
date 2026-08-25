import { useEffect, useState } from 'react'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Layer } from '../types/model'
import { LAYERS, LAYER_LABEL, STATUS_LABEL, STATUS_MARK } from '../types/model'
import { categoryStats, ratio } from '../lib/stats'
import { STATUS_TONE } from '../lib/tokens'
import { useMap, useMapDispatch } from '../store/mapStore'
import { Drawer } from './ui/Drawer'
import { Button } from './ui/Button'
import { ItemEditorRow } from './ItemEditorRow'

interface CategoryDrawerProps {
  categoryId: string | null
  focusItemId: string | null
  onClose: () => void
}

export function CategoryDrawer({ categoryId, focusItemId, onClose }: CategoryDrawerProps) {
  const map = useMap()
  const dispatch = useMapDispatch()
  const [expanded, setExpanded] = useState<string | null>(null)

  const category = map.categories.find((entry) => entry.id === categoryId) ?? null

  useEffect(() => {
    setExpanded(focusItemId)
  }, [focusItemId, categoryId])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  if (!category) return null
  const stats = categoryStats(category)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const activeId = String(active.id).replace('editor:', '')
    const overId = String(over.id).replace('editor:', '')
    const toIndex = category.items.findIndex((item) => item.id === overId)
    if (toIndex < 0) return
    dispatch({
      type: 'MOVE_ITEM',
      itemId: activeId,
      fromCategoryId: category.id,
      toCategoryId: category.id,
      toIndex,
    })
  }

  const addItem = () => {
    const name = window.prompt('새 하위항목 이름')?.trim()
    if (name) dispatch({ type: 'ADD_ITEM', categoryId: category.id, name })
  }

  const removeCategory = () => {
    if (!window.confirm(`대분류 "${category.name}"와(과) 하위항목 ${category.items.length}개를 삭제할까요?\n삭제 후 되돌리기로 복구할 수 있습니다.`)) return
    dispatch({ type: 'DELETE_CATEGORY', categoryId: category.id })
    onClose()
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={
        <div>
          <input
            value={category.name}
            onChange={(event) =>
              dispatch({ type: 'RENAME_CATEGORY', categoryId: category.id, name: event.target.value })
            }
            className="w-full rounded border border-transparent px-1 py-0.5 text-lg font-bold hover:border-slate-200 focus:border-slate-400 focus:outline-none"
          />
          <div className="mt-1 flex flex-wrap items-center gap-2 px-1 text-[11px] text-slate-500">
            <label className="flex items-center gap-1">
              층
              <select
                value={category.layer}
                onChange={(event) =>
                  dispatch({
                    type: 'SET_CATEGORY_LAYER',
                    categoryId: category.id,
                    layer: event.target.value as Layer,
                  })
                }
                className="rounded border border-slate-200 px-1 py-0.5 text-slate-700"
              >
                {LAYERS.map((layer) => (
                  <option key={layer} value={layer}>
                    {LAYER_LABEL[layer]}
                  </option>
                ))}
              </select>
            </label>
            <span>항목 {stats.total}개</span>
            {(['manual', 'semi', 'automated'] as const).map((status) => (
              <span key={status} className={STATUS_TONE[status].dot}>
                {STATUS_MARK[status]} {STATUS_LABEL[status]} {stats[status]} ({ratio(stats[status], stats.total)}%)
              </span>
            ))}
          </div>
        </div>
      }
      footer={
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={addItem}>
            + 하위항목
          </Button>
          <span className="text-[11px] text-slate-500">
            ⠿ 를 잡아 순서를 바꾸고, 항목을 펼쳐 자동화 상태를 지정하세요
          </span>
          <Button variant="danger" size="sm" className="ml-auto" onClick={removeCategory}>
            대분류 삭제
          </Button>
        </div>
      }
    >
      {stats.urgent > 0 ? (
        <p className="mb-3 rounded-md border border-slate-900 bg-slate-900 px-3 py-2 text-[12px] text-white">
          ★★★ 우선순위인데 아직 수동인 항목이 {stats.urgent}개 있습니다 — 자동화 후보 1순위입니다.
        </p>
      ) : null}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={category.items.map((item) => `editor:${item.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-1.5">
            {category.items.map((item) => (
              <ItemEditorRow
                key={item.id}
                item={item}
                categoryId={category.id}
                categories={map.categories}
                expanded={expanded === item.id}
                onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {category.items.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">하위항목이 없습니다. 아래 + 하위항목으로 추가하세요.</p>
      ) : null}
    </Drawer>
  )
}
