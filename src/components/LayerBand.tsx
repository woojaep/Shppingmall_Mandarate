import type { ReactNode } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import type { Category, Layer } from '../types/model'
import { LAYER_DESC, LAYER_LABEL } from '../types/model'
import { LAYER_TONE } from '../lib/tokens'
import type { FilterState } from '../lib/filters'
import { CategoryCard } from './CategoryCard'
import { Button } from './ui/Button'

interface LayerBandProps {
  layer: Layer
  categories: Category[]
  editMode: boolean
  filter: FilterState
  onOpen: (categoryId: string, itemId?: string) => void
  onAddCategory: (layer: Layer) => void
  /** 운영 band 가운데에 끼워 넣을 중심 카드 */
  center?: ReactNode
}

export function LayerBand({
  layer,
  categories,
  editMode,
  filter,
  onOpen,
  onAddCategory,
  center,
}: LayerBandProps) {
  const tone = LAYER_TONE[layer]
  const { setNodeRef, isOver } = useDroppable({ id: `band:${layer}`, data: { type: 'band', layer } })

  // 중심 카드는 대분류 개수와 무관하게 항상 band 한가운데에 온다.
  const splitAt = center ? Math.ceil(categories.length / 2) : categories.length
  const head = categories.slice(0, splitAt)
  const tail = categories.slice(splitAt)

  const renderCard = (category: Category) => (
    <CategoryCard
      key={category.id}
      category={category}
      editMode={editMode}
      filter={filter}
      onOpen={onOpen}
    />
  )

  return (
    <section
      ref={setNodeRef}
      className={`flex min-h-0 flex-1 gap-2 rounded-xl border p-2 ${tone.band} ${
        isOver ? 'ring-2 ring-slate-400' : ''
      }`}
    >
      <div className="flex w-[86px] shrink-0 flex-col justify-between">
        <div>
          <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${tone.label}`}>
            {LAYER_LABEL[layer]}
          </span>
          <p className="mt-1 text-[10px] leading-tight text-slate-500">{LAYER_DESC[layer]}</p>
          <p className="mt-1 text-[10px] text-slate-400">대분류 {categories.length}개</p>
        </div>
        {editMode ? (
          <Button size="sm" variant="secondary" onClick={() => onAddCategory(layer)}>
            + 대분류
          </Button>
        ) : null}
      </div>

      <SortableContext items={categories.map((category) => category.id)} strategy={rectSortingStrategy}>
        <div className="flex min-w-0 flex-1 flex-wrap content-start items-stretch gap-2">
          {head.map(renderCard)}
          {center}
          {tail.map(renderCard)}
          {categories.length === 0 && !center ? (
            <p className="self-center px-3 text-xs text-slate-400">
              이 층에는 아직 대분류가 없습니다. 편집 모드에서 + 대분류를 눌러 추가하세요.
            </p>
          ) : null}
        </div>
      </SortableContext>
    </section>
  )
}
