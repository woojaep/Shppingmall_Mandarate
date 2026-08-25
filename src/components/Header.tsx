import { useRef, useState } from 'react'
import type { AutomationStats } from '../lib/stats'
import type { FilterState, PriorityFilter, StatusFilter } from '../lib/filters'
import { STATUS_LABEL, STATUS_MARK } from '../types/model'
import { useMap, useMapDispatch, useMapState } from '../store/mapStore'
import { exportMapToFile, importMapFromFile } from '../lib/io'
import { createSeedMap } from '../data/seed'
import { SummaryBar } from './SummaryBar'
import { Button } from './ui/Button'

interface HeaderProps {
  stats: AutomationStats
  editMode: boolean
  onToggleEdit: () => void
  filter: FilterState
  onFilterChange: (filter: FilterState) => void
}

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'manual', label: `${STATUS_MARK.manual} ${STATUS_LABEL.manual}` },
  { value: 'semi', label: `${STATUS_MARK.semi} ${STATUS_LABEL.semi}` },
  { value: 'automated', label: `${STATUS_MARK.automated} ${STATUS_LABEL.automated}` },
]

const PRIORITY_FILTERS: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 3, label: '★★★' },
  { value: 2, label: '★★' },
  { value: 1, label: '★' },
]

function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[11px] text-slate-500">{label}</span>
      <div className="flex overflow-hidden rounded-md border border-slate-300 bg-white">
        {options.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={`px-2 py-1 text-[11px] font-medium transition-colors ${
              value === option.value ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Header({ stats, editMode, onToggleEdit, filter, onFilterChange }: HeaderProps) {
  const map = useMap()
  const { past } = useMapState()
  const dispatch = useMapDispatch()
  const fileInput = useRef<HTMLInputElement>(null)
  const [renaming, setRenaming] = useState(false)
  const [draftName, setDraftName] = useState(map.name)

  const handleImport = async (file: File) => {
    try {
      const imported = await importMapFromFile(file)
      if (!window.confirm('불러온 파일로 현재 지도를 덮어씁니다. 계속할까요?\n(되돌리기로 복구할 수 있습니다)')) return
      dispatch({ type: 'REPLACE_MAP', map: imported, label: 'JSON을 불러왔습니다' })
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '파일을 읽지 못했습니다.')
    }
  }

  const resetToSeed = () => {
    if (!window.confirm('기본 8개 대분류 / 64개 항목으로 되돌립니다. 지금 내용은 사라집니다.\n(되돌리기로 복구할 수 있습니다)')) return
    dispatch({ type: 'REPLACE_MAP', map: createSeedMap(), label: '기본 구조로 초기화했습니다' })
  }

  const commitRename = () => {
    const name = draftName.trim()
    if (name && name !== map.name) dispatch({ type: 'RENAME_MAP', name })
    else setDraftName(map.name)
    setRenaming(false)
  }

  return (
    <header className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2.5">
      <div className="min-w-0">
        {renaming ? (
          <input
            autoFocus
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            onBlur={commitRename}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitRename()
              if (event.key === 'Escape') {
                setDraftName(map.name)
                setRenaming(false)
              }
            }}
            className="rounded border border-slate-300 px-2 py-1 text-xl font-bold"
          />
        ) : (
          <h1
            className="cursor-text text-xl leading-tight font-bold text-slate-900"
            onDoubleClick={() => {
              setDraftName(map.name)
              setRenaming(true)
            }}
            title="더블클릭해서 이름 변경"
          >
            {map.name} <span className="text-sm font-normal text-slate-400">만다라트</span>
          </h1>
        )}
        <p className="mt-0.5 text-[11px] text-slate-500">
          대분류 {map.categories.length}개 · 하위항목 {stats.total}개 · 변경사항은 이 브라우저에 자동 저장됩니다
        </p>
      </div>

      <SummaryBar stats={stats} />

      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          label="자동화"
          options={STATUS_FILTERS}
          value={filter.status}
          onChange={(status) => onFilterChange({ ...filter, status })}
        />
        <Segmented
          label="우선순위"
          options={PRIORITY_FILTERS}
          value={filter.priority}
          onChange={(priority) => onFilterChange({ ...filter, priority })}
        />
        <div className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />
        <Button
          variant={editMode ? 'primary' : 'secondary'}
          size="sm"
          onClick={onToggleEdit}
          aria-pressed={editMode}
        >
          {editMode ? '편집 모드 켜짐' : '편집 모드'}
        </Button>
        <Button size="sm" onClick={() => dispatch({ type: 'UNDO' })} disabled={past.length === 0}>
          되돌리기
        </Button>
        <Button size="sm" onClick={() => exportMapToFile(map)}>
          내보내기
        </Button>
        <Button size="sm" onClick={() => fileInput.current?.click()}>
          불러오기
        </Button>
        <Button size="sm" variant="danger" onClick={resetToSeed}>
          초기화
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void handleImport(file)
            event.target.value = ''
          }}
        />
      </div>
    </header>
  )
}
