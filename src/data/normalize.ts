import type {
  AutomationPriority,
  AutomationStatus,
  BusinessItem,
  BusinessMap,
  Category,
  HumanJudgement,
  Layer,
} from '../types/model'
import { SCHEMA_VERSION } from '../types/model'
import { createId, now } from '../lib/id'

const LAYER_SET: Layer[] = ['sales', 'operations', 'future']
const STATUS_SET: AutomationStatus[] = ['manual', 'semi', 'automated']
const JUDGEMENT_SET: HumanJudgement[] = ['low', 'medium', 'high']

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asLayer(value: unknown): Layer {
  return LAYER_SET.includes(value as Layer) ? (value as Layer) : 'sales'
}

function asStatus(value: unknown): AutomationStatus {
  return STATUS_SET.includes(value as AutomationStatus) ? (value as AutomationStatus) : 'manual'
}

function asJudgement(value: unknown): HumanJudgement {
  return JUDGEMENT_SET.includes(value as HumanJudgement) ? (value as HumanJudgement) : 'medium'
}

function asPriority(value: unknown): AutomationPriority {
  return value === 1 || value === 2 || value === 3 ? value : 2
}

/**
 * localStorage나 import한 JSON은 신뢰할 수 없다.
 * 모양이 어긋난 값은 버리지 않고 기본값으로 메워서 앱이 죽지 않게 한다.
 * 형태 자체가 지도(map)가 아니면 null을 돌려준다.
 */
export function normalizeMap(input: unknown): BusinessMap | null {
  if (!input || typeof input !== 'object') return null
  const raw = input as Record<string, unknown>
  if (!Array.isArray(raw.categories)) return null

  const timestamp = now()

  const categories: Category[] = raw.categories.map((rawCategory, categoryIndex) => {
    const category = (rawCategory ?? {}) as Record<string, unknown>
    const rawItems = Array.isArray(category.items) ? category.items : []

    const items: BusinessItem[] = rawItems.map((rawItem, itemIndex) => {
      const item = (rawItem ?? {}) as Record<string, unknown>
      return {
        id: asString(item.id) || createId('item'),
        name: asString(item.name, '(이름 없음)'),
        order: typeof item.order === 'number' ? item.order : itemIndex,
        automationStatus: asStatus(item.automationStatus),
        automationPriority: asPriority(item.automationPriority),
        humanJudgement: asJudgement(item.humanJudgement),
        memo: asString(item.memo),
        owner: asString(item.owner),
        updatedAt: asString(item.updatedAt, timestamp),
      }
    })

    items.sort((a, b) => a.order - b.order)

    return {
      id: asString(category.id) || createId('cat'),
      name: asString(category.name, '(이름 없음)'),
      layer: asLayer(category.layer),
      order: typeof category.order === 'number' ? category.order : categoryIndex,
      items: items.map((item, index) => ({ ...item, order: index })),
    }
  })

  categories.sort((a, b) => a.order - b.order)

  return {
    id: asString(raw.id) || createId('map'),
    name: asString(raw.name, '온라인 쇼핑몰 BUSINESS'),
    categories: categories.map((category, index) => ({ ...category, order: index })),
    schemaVersion: SCHEMA_VERSION,
    updatedAt: asString(raw.updatedAt, timestamp),
  }
}
