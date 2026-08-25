import type { AutomationStatus, BusinessItem } from '../types/model'

export type StatusFilter = 'all' | AutomationStatus
export type PriorityFilter = 'all' | 1 | 2 | 3

export interface FilterState {
  status: StatusFilter
  priority: PriorityFilter
}

export const DEFAULT_FILTER: FilterState = { status: 'all', priority: 'all' }

export function isFilterActive(filter: FilterState): boolean {
  return filter.status !== 'all' || filter.priority !== 'all'
}

export function matchesFilter(item: BusinessItem, filter: FilterState): boolean {
  if (filter.status !== 'all' && item.automationStatus !== filter.status) return false
  if (filter.priority !== 'all' && item.automationPriority !== filter.priority) return false
  return true
}
