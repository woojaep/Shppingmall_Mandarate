import type { BusinessMap, Category, Layer } from '../types/model'
import { createId, now } from '../lib/id'
import type { MapAction } from './actions'

export interface MapState {
  map: BusinessMap
  /** 되돌리기용 스냅샷 스택 (최근 것이 마지막) */
  past: BusinessMap[]
  /** Undo 토스트에 띄울 안내. 띄울 게 없으면 null */
  undo: { label: string; token: number } | null
  hydrated: boolean
}

const HISTORY_LIMIT = 30

/** order 필드는 배열 순서를 그대로 반영한다 — 두 곳에서 순서가 어긋나지 않도록. */
function reindex(categories: Category[]): Category[] {
  return categories.map((category, index) => ({
    ...category,
    order: index,
    items: category.items.map((item, itemIndex) => ({ ...item, order: itemIndex })),
  }))
}

function touch(map: BusinessMap, categories: Category[]): BusinessMap {
  return { ...map, categories: reindex(categories), updatedAt: now() }
}

/** 되돌릴 수 있는 변경. 스냅샷을 쌓고, label이 있으면 Undo 토스트를 띄운다. */
function commit(state: MapState, next: BusinessMap, label: string | null): MapState {
  const past = [...state.past, state.map].slice(-HISTORY_LIMIT)
  return { ...state, map: next, past, undo: label ? { label, token: Date.now() } : null }
}

/** 레이어 기준 index를 전체 배열 index로 환산해 삽입한다. */
function insertIntoLayer(
  categories: Category[],
  moving: Category,
  toLayer: Layer,
  toIndexInLayer: number,
): Category[] {
  const rest = categories.filter((category) => category.id !== moving.id)
  const positions = rest
    .map((category, index) => ({ category, index }))
    .filter((entry) => entry.category.layer === toLayer)
    .map((entry) => entry.index)

  const clamped = Math.max(0, Math.min(toIndexInLayer, positions.length))
  let insertAt: number
  if (clamped < positions.length) {
    insertAt = positions[clamped]
  } else if (positions.length > 0) {
    insertAt = positions[positions.length - 1] + 1
  } else {
    insertAt = rest.length
  }

  const next = [...rest]
  next.splice(insertAt, 0, { ...moving, layer: toLayer })
  return next
}

export function mapReducer(state: MapState, action: MapAction): MapState {
  const { map } = state

  switch (action.type) {
    case 'HYDRATE':
      return { map: action.map, past: [], undo: null, hydrated: true }

    case 'REPLACE_MAP':
      return commit(state, action.map, action.label)

    case 'RENAME_MAP':
      return commit(state, { ...map, name: action.name, updatedAt: now() }, null)

    case 'ADD_CATEGORY': {
      const category: Category = {
        id: createId('cat'),
        name: action.name,
        layer: action.layer,
        order: map.categories.length,
        items: [],
      }
      const next = insertIntoLayer(map.categories, category, action.layer, Number.MAX_SAFE_INTEGER)
      return commit(state, touch(map, next), null)
    }

    case 'RENAME_CATEGORY': {
      const next = map.categories.map((category) =>
        category.id === action.categoryId ? { ...category, name: action.name } : category,
      )
      return commit(state, touch(map, next), null)
    }

    case 'DELETE_CATEGORY': {
      const target = map.categories.find((category) => category.id === action.categoryId)
      if (!target) return state
      const next = map.categories.filter((category) => category.id !== action.categoryId)
      return commit(state, touch(map, next), `대분류 "${target.name}" 삭제됨`)
    }

    case 'SET_CATEGORY_LAYER': {
      const target = map.categories.find((category) => category.id === action.categoryId)
      if (!target || target.layer === action.layer) return state
      const next = insertIntoLayer(map.categories, target, action.layer, Number.MAX_SAFE_INTEGER)
      return commit(state, touch(map, next), null)
    }

    case 'MOVE_CATEGORY': {
      const target = map.categories.find((category) => category.id === action.categoryId)
      if (!target) return state
      const next = insertIntoLayer(map.categories, target, action.toLayer, action.toIndexInLayer)
      return commit(state, touch(map, next), null)
    }

    case 'ADD_ITEM': {
      const timestamp = now()
      const next = map.categories.map((category) =>
        category.id === action.categoryId
          ? {
              ...category,
              items: [
                ...category.items,
                {
                  id: createId('item'),
                  name: action.name,
                  order: category.items.length,
                  automationStatus: 'manual' as const,
                  automationPriority: 2 as const,
                  humanJudgement: 'medium' as const,
                  memo: '',
                  owner: '',
                  updatedAt: timestamp,
                },
              ],
            }
          : category,
      )
      return commit(state, touch(map, next), null)
    }

    case 'UPDATE_ITEM': {
      const next = map.categories.map((category) =>
        category.id === action.categoryId
          ? {
              ...category,
              items: category.items.map((item) =>
                item.id === action.itemId ? { ...item, ...action.patch, updatedAt: now() } : item,
              ),
            }
          : category,
      )
      return commit(state, touch(map, next), null)
    }

    case 'DELETE_ITEM': {
      const category = map.categories.find((entry) => entry.id === action.categoryId)
      const target = category?.items.find((item) => item.id === action.itemId)
      if (!category || !target) return state
      const next = map.categories.map((entry) =>
        entry.id === action.categoryId
          ? { ...entry, items: entry.items.filter((item) => item.id !== action.itemId) }
          : entry,
      )
      return commit(state, touch(map, next), `항목 "${target.name}" 삭제됨`)
    }

    case 'MOVE_ITEM': {
      const from = map.categories.find((category) => category.id === action.fromCategoryId)
      const moving = from?.items.find((item) => item.id === action.itemId)
      if (!from || !moving) return state

      const next = map.categories.map((category) =>
        category.id === action.fromCategoryId
          ? { ...category, items: category.items.filter((item) => item.id !== action.itemId) }
          : category,
      )

      const targetIndex = next.findIndex((category) => category.id === action.toCategoryId)
      if (targetIndex === -1) return state

      const targetItems = [...next[targetIndex].items]
      const clamped = Math.max(0, Math.min(action.toIndex, targetItems.length))
      targetItems.splice(clamped, 0, moving)
      next[targetIndex] = { ...next[targetIndex], items: targetItems }

      return commit(state, touch(map, next), null)
    }

    case 'PROMOTE_ITEM': {
      const source = map.categories.find((category) => category.id === action.categoryId)
      const target = source?.items.find((item) => item.id === action.itemId)
      if (!source || !target) return state

      const stripped = map.categories.map((category) =>
        category.id === action.categoryId
          ? { ...category, items: category.items.filter((item) => item.id !== action.itemId) }
          : category,
      )

      const promoted: Category = {
        id: createId('cat'),
        name: target.name,
        layer: source.layer,
        order: 0,
        items: [],
      }
      const sourceIndex = stripped.findIndex((category) => category.id === action.categoryId)
      const next = [...stripped]
      next.splice(sourceIndex + 1, 0, promoted)

      return commit(state, touch(map, next), `"${target.name}" 대분류로 승격됨`)
    }

    case 'UNDO': {
      if (state.past.length === 0) return { ...state, undo: null }
      const previous = state.past[state.past.length - 1]
      return { ...state, map: previous, past: state.past.slice(0, -1), undo: null }
    }

    case 'DISMISS_UNDO':
      return { ...state, undo: null }

    default:
      return state
  }
}
