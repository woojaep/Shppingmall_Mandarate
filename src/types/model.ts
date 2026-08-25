export type Layer = 'sales' | 'operations' | 'future'
export type AutomationStatus = 'manual' | 'semi' | 'automated'
export type HumanJudgement = 'low' | 'medium' | 'high'
export type AutomationPriority = 1 | 2 | 3

export interface BusinessItem {
  id: string
  name: string
  order: number
  automationStatus: AutomationStatus
  automationPriority: AutomationPriority
  humanJudgement: HumanJudgement
  memo?: string
  owner?: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  layer: Layer
  order: number
  items: BusinessItem[]
}

export interface BusinessMap {
  id: string
  name: string
  categories: Category[]
  /** 저장 포맷 버전. import 시 마이그레이션 판단에 쓴다. */
  schemaVersion: number
  updatedAt: string
}

export const LAYERS: Layer[] = ['sales', 'operations', 'future']

export const LAYER_LABEL: Record<Layer, string> = {
  sales: '판매',
  operations: '운영',
  future: '경영 · 미래',
}

export const LAYER_DESC: Record<Layer, string> = {
  sales: '돈을 버는 활동 — 상품, 마케팅, 고객',
  operations: '돌아가게 만드는 활동 — 물류, 시스템',
  future: '방향을 정하는 활동 — 재무, 세무, 전략',
}

export const STATUS_LABEL: Record<AutomationStatus, string> = {
  manual: '수동',
  semi: '반자동',
  automated: '자동',
}

/** 색만으로 의미를 전달하지 않도록 상태마다 텍스트 기호를 함께 쓴다. */
export const STATUS_MARK: Record<AutomationStatus, string> = {
  manual: '●',
  semi: '◐',
  automated: '○',
}

export const JUDGEMENT_LABEL: Record<HumanJudgement, string> = {
  low: '낮음',
  medium: '보통',
  high: '높음',
}

export const PRIORITY_LABEL: Record<AutomationPriority, string> = {
  1: '★',
  2: '★★',
  3: '★★★',
}

export const SCHEMA_VERSION = 1
