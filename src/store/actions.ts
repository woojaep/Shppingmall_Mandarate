import type { BusinessItem, BusinessMap, Layer } from '../types/model'

export type ItemPatch = Partial<Omit<BusinessItem, 'id' | 'order' | 'updatedAt'>>

export type MapAction =
  | { type: 'HYDRATE'; map: BusinessMap }
  | { type: 'REPLACE_MAP'; map: BusinessMap; label: string | null }
  | { type: 'RENAME_MAP'; name: string }
  | { type: 'ADD_CATEGORY'; layer: Layer; name: string }
  | { type: 'RENAME_CATEGORY'; categoryId: string; name: string }
  | { type: 'DELETE_CATEGORY'; categoryId: string }
  | { type: 'SET_CATEGORY_LAYER'; categoryId: string; layer: Layer }
  | { type: 'MOVE_CATEGORY'; categoryId: string; toLayer: Layer; toIndexInLayer: number }
  | { type: 'ADD_ITEM'; categoryId: string; name: string }
  | { type: 'UPDATE_ITEM'; categoryId: string; itemId: string; patch: ItemPatch }
  | { type: 'DELETE_ITEM'; categoryId: string; itemId: string }
  | { type: 'MOVE_ITEM'; itemId: string; fromCategoryId: string; toCategoryId: string; toIndex: number }
  | { type: 'PROMOTE_ITEM'; categoryId: string; itemId: string }
  | { type: 'UNDO' }
  | { type: 'DISMISS_UNDO' }
