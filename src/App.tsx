import { useState } from 'react'
import type { Layer } from './types/model'
import { MapProvider, useMap, useMapDispatch } from './store/mapStore'
import { collectItems, computeStats } from './lib/stats'
import { DEFAULT_FILTER, isFilterActive } from './lib/filters'
import type { FilterState } from './lib/filters'
import { Header } from './components/Header'
import { BoardView } from './components/BoardView'
import { CategoryDrawer } from './components/CategoryDrawer'
import { UndoToast } from './components/UndoToast'

function Workspace() {
  const map = useMap()
  const dispatch = useMapDispatch()
  const [editMode, setEditMode] = useState(false)
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER)
  const [open, setOpen] = useState<{ categoryId: string; itemId: string | null } | null>(null)

  const stats = computeStats(collectItems(map))

  const addCategory = (layer: Layer) => {
    const name = window.prompt('새 대분류 이름')?.trim()
    if (name) dispatch({ type: 'ADD_CATEGORY', layer, name })
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Header
        stats={stats}
        editMode={editMode}
        onToggleEdit={() => setEditMode((value) => !value)}
        filter={filter}
        onFilterChange={setFilter}
      />

      {isFilterActive(filter) ? (
        <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-1 text-[11px] text-amber-900">
          필터가 켜져 있습니다 — 조건에 맞지 않는 항목은 흐리게 표시됩니다.
          <button
            type="button"
            onClick={() => setFilter(DEFAULT_FILTER)}
            className="rounded border border-amber-300 bg-white px-1.5 py-0.5 font-medium"
          >
            필터 해제
          </button>
        </div>
      ) : null}

      <main className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-3">
        <BoardView
          editMode={editMode}
          filter={filter}
          onOpen={(categoryId, itemId) => setOpen({ categoryId, itemId: itemId ?? null })}
          onAddCategory={addCategory}
        />
      </main>

      <CategoryDrawer
        categoryId={open?.categoryId ?? null}
        focusItemId={open?.itemId ?? null}
        onClose={() => setOpen(null)}
      />
      <UndoToast />
    </div>
  )
}

export default function App() {
  return (
    <MapProvider>
      <Workspace />
    </MapProvider>
  )
}
