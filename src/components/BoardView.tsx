import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import type { Layer } from '../types/model'
import { LAYERS } from '../types/model'
import { useMap, useMapDispatch } from '../store/mapStore'
import { collectItems, computeStats } from '../lib/stats'
import type { FilterState } from '../lib/filters'
import { LayerBand } from './LayerBand'
import { CenterCard } from './CenterCard'

interface BoardViewProps {
  editMode: boolean
  filter: FilterState
  onOpen: (categoryId: string, itemId?: string) => void
  onAddCategory: (layer: Layer) => void
}

type DragInfo = { kind: 'category' | 'item'; label: string } | null

export function BoardView({ editMode, filter, onOpen, onAddCategory }: BoardViewProps) {
  const map = useMap()
  const dispatch = useMapDispatch()
  const [dragging, setDragging] = useState<DragInfo>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const stats = computeStats(collectItems(map))
  const byLayer = (layer: Layer) => map.categories.filter((category) => category.layer === layer)

  const findCategoryOfItem = (itemId: string) =>
    map.categories.find((category) => category.items.some((item) => item.id === itemId))

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as { type?: string } | undefined
    if (data?.type === 'category') {
      const category = map.categories.find((entry) => entry.id === event.active.id)
      setDragging(category ? { kind: 'category', label: category.name } : null)
      return
    }
    const item = collectItems(map).find((entry) => entry.id === event.active.id)
    setDragging(item ? { kind: 'item', label: item.name } : null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setDragging(null)
    const { active, over } = event
    if (!over) return

    const activeData = active.data.current as { type?: string; categoryId?: string } | undefined
    const overData = over.data.current as
      | { type?: string; categoryId?: string; layer?: Layer }
      | undefined
    if (!activeData || !overData) return

    if (activeData.type === 'category') {
      const categoryId = String(active.id)
      const moving = map.categories.find((entry) => entry.id === categoryId)
      if (!moving) return

      // 대분류 위에 떨어뜨리면 그 자리로, band 빈 곳에 떨어뜨리면 그 층 맨 뒤로.
      if (overData.type === 'category' || overData.type === 'category-body') {
        const targetId = overData.categoryId ?? String(over.id)
        const target = map.categories.find((entry) => entry.id === targetId)
        if (!target || target.id === categoryId) return
        const targetLayerList = byLayer(target.layer)
        const toIndexInLayer = targetLayerList.findIndex((entry) => entry.id === target.id)
        dispatch({ type: 'MOVE_CATEGORY', categoryId, toLayer: target.layer, toIndexInLayer })
        return
      }

      if (overData.type === 'band' && overData.layer) {
        dispatch({
          type: 'MOVE_CATEGORY',
          categoryId,
          toLayer: overData.layer,
          toIndexInLayer: Number.MAX_SAFE_INTEGER,
        })
      }
      return
    }

    if (activeData.type === 'item') {
      const itemId = String(active.id)
      const from = findCategoryOfItem(itemId)
      if (!from) return

      if (overData.type === 'item') {
        const to = findCategoryOfItem(String(over.id))
        if (!to) return
        const toIndex = to.items.findIndex((entry) => entry.id === over.id)
        if (to.id === from.id && to.items[toIndex]?.id === itemId) return
        dispatch({
          type: 'MOVE_ITEM',
          itemId,
          fromCategoryId: from.id,
          toCategoryId: to.id,
          toIndex: toIndex < 0 ? to.items.length : toIndex,
        })
        return
      }

      if (overData.type === 'category-body' || overData.type === 'category') {
        const targetId = overData.categoryId
        const to = map.categories.find((entry) => entry.id === targetId)
        if (!to || to.id === from.id) return
        dispatch({
          type: 'MOVE_ITEM',
          itemId,
          fromCategoryId: from.id,
          toCategoryId: to.id,
          toIndex: to.items.length,
        })
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDragging(null)}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        {LAYERS.map((layer) => (
          <LayerBand
            key={layer}
            layer={layer}
            categories={byLayer(layer)}
            editMode={editMode}
            filter={filter}
            onOpen={onOpen}
            onAddCategory={onAddCategory}
            center={layer === 'operations' ? <CenterCard name={map.name} stats={stats} /> : undefined}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {dragging ? (
          <div
            className={`rounded border-2 border-slate-900 bg-white px-2 py-1 text-xs font-semibold shadow-lg ${
              dragging.kind === 'category' ? 'text-slate-900' : 'text-slate-700'
            }`}
          >
            {dragging.label}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
