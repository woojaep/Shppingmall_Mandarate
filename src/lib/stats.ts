import type { AutomationStatus, BusinessItem, BusinessMap, Category } from '../types/model'

export interface AutomationStats {
  total: number
  manual: number
  semi: number
  automated: number
  /** 우선순위 ★★★인데 아직 수동인 항목 수 — 자동화 로드맵의 1순위 */
  urgent: number
}

export function collectItems(map: BusinessMap): BusinessItem[] {
  return map.categories.flatMap((category) => category.items)
}

export function computeStats(items: BusinessItem[]): AutomationStats {
  const stats: AutomationStats = { total: items.length, manual: 0, semi: 0, automated: 0, urgent: 0 }
  for (const item of items) {
    stats[item.automationStatus] += 1
    if (item.automationPriority === 3 && item.automationStatus === 'manual') stats.urgent += 1
  }
  return stats
}

export function ratio(count: number, total: number): number {
  if (total === 0) return 0
  return Math.round((count / total) * 100)
}

export function categoryStats(category: Category): AutomationStats {
  return computeStats(category.items)
}

/** 카테고리의 대표 상태 — 카드 한 줄 요약에 쓴다. */
export function dominantStatus(category: Category): AutomationStatus | null {
  const stats = categoryStats(category)
  if (stats.total === 0) return null
  const entries: [AutomationStatus, number][] = [
    ['manual', stats.manual],
    ['semi', stats.semi],
    ['automated', stats.automated],
  ]
  entries.sort((a, b) => b[1] - a[1])
  return entries[0][0]
}
