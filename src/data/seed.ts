import type {
  AutomationPriority,
  AutomationStatus,
  BusinessMap,
  Category,
  HumanJudgement,
  Layer,
} from '../types/model'
import { SCHEMA_VERSION } from '../types/model'
import { createId, now } from '../lib/id'

/** [항목명, 자동화상태, 자동화우선순위, 사람판단 필요도] */
type ItemSeed = [string, AutomationStatus, AutomationPriority, HumanJudgement]

interface CategorySeed {
  name: string
  layer: Layer
  items: ItemSeed[]
}

/**
 * 초기 8개 대분류 / 64개 하위항목.
 * 상태값·우선순위는 일반적인 온라인 쇼핑몰을 가정한 '초기 추정치'이며,
 * 대표가 화면에서 직접 수정하는 것을 전제로 한다.
 */
const CATEGORY_SEEDS: CategorySeed[] = [
  {
    name: '상품 / 소싱',
    layer: 'sales',
    items: [
      ['상품기획', 'manual', 1, 'high'],
      ['공급처', 'manual', 2, 'high'],
      ['매입', 'semi', 2, 'medium'],
      ['원가', 'semi', 3, 'medium'],
      ['가격 / 마진', 'semi', 3, 'high'],
      ['상품정보', 'semi', 3, 'low'],
      ['상품성과', 'manual', 3, 'medium'],
      ['상품 Lifecycle', 'manual', 2, 'high'],
    ],
  },
  {
    name: '마케팅',
    layer: 'sales',
    items: [
      ['광고', 'semi', 3, 'high'],
      ['예산', 'manual', 2, 'high'],
      ['콘텐츠 / 소재', 'manual', 2, 'high'],
      ['프로모션', 'manual', 2, 'high'],
      ['CRM', 'semi', 3, 'medium'],
      ['유입', 'automated', 2, 'low'],
      ['성과분석', 'semi', 3, 'medium'],
      ['대행사 / 외주', 'manual', 1, 'high'],
    ],
  },
  {
    name: '고객 / CS',
    layer: 'sales',
    items: [
      ['고객정보', 'automated', 2, 'low'],
      ['문의', 'semi', 3, 'medium'],
      ['교환 / 반품', 'semi', 3, 'medium'],
      ['환불 / 취소', 'semi', 3, 'medium'],
      ['클레임', 'manual', 1, 'high'],
      ['리뷰 / VOC', 'semi', 3, 'medium'],
      ['CS 채널', 'semi', 2, 'low'],
      ['정책 / FAQ', 'manual', 2, 'medium'],
    ],
  },
  {
    name: '재고 / 물류',
    layer: 'operations',
    items: [
      ['발주', 'semi', 3, 'medium'],
      ['입고', 'semi', 3, 'low'],
      ['재고', 'semi', 3, 'medium'],
      ['출고', 'automated', 3, 'low'],
      ['배송', 'automated', 2, 'low'],
      ['반품물류', 'semi', 2, 'medium'],
      ['물류업체', 'manual', 1, 'high'],
      ['물류비', 'manual', 2, 'medium'],
    ],
  },
  {
    name: '운영 / 시스템',
    layer: 'operations',
    items: [
      ['계정 / 권한', 'manual', 2, 'medium'],
      ['판매채널', 'semi', 3, 'medium'],
      ['결제수단', 'automated', 1, 'low'],
      ['계약 / 갱신', 'manual', 2, 'high'],
      ['솔루션', 'manual', 1, 'high'],
      ['API / 연동', 'semi', 3, 'medium'],
      ['조직 / 외주', 'manual', 1, 'high'],
      ['법무 / 보안', 'manual', 1, 'high'],
    ],
  },
  {
    name: '재무 / 자금',
    layer: 'future',
    items: [
      ['매출', 'semi', 3, 'low'],
      ['정산', 'semi', 3, 'medium'],
      ['비용', 'manual', 3, 'medium'],
      ['손익', 'manual', 3, 'high'],
      ['수익성', 'manual', 3, 'high'],
      ['현금흐름', 'manual', 3, 'high'],
      ['계좌 / 카드', 'semi', 2, 'low'],
      ['자금계획', 'manual', 2, 'high'],
    ],
  },
  {
    name: '세무 / 회계',
    layer: 'future',
    items: [
      ['매출증빙', 'semi', 3, 'low'],
      ['매입증빙', 'manual', 3, 'medium'],
      ['세금계산서', 'semi', 3, 'low'],
      ['부가세', 'semi', 2, 'medium'],
      ['법인 / 소득세', 'manual', 1, 'high'],
      ['인건비 세무', 'manual', 2, 'medium'],
      ['신고일정', 'manual', 3, 'low'],
      ['세무대리', 'manual', 1, 'high'],
    ],
  },
  {
    name: '전략 / 계획',
    layer: 'future',
    items: [
      ['목표', 'manual', 1, 'high'],
      ['예산', 'manual', 2, 'high'],
      ['상품계획', 'manual', 1, 'high'],
      ['채널계획', 'manual', 1, 'high'],
      ['마케팅계획', 'manual', 2, 'high'],
      ['시장 / 경쟁사', 'manual', 2, 'high'],
      ['조직계획', 'manual', 1, 'high'],
      ['핵심과제', 'manual', 1, 'high'],
    ],
  },
]

export function createSeedMap(): BusinessMap {
  const timestamp = now()
  const categories: Category[] = CATEGORY_SEEDS.map((seed, categoryIndex) => ({
    id: createId('cat'),
    name: seed.name,
    layer: seed.layer,
    order: categoryIndex,
    items: seed.items.map(([name, automationStatus, automationPriority, humanJudgement], itemIndex) => ({
      id: createId('item'),
      name,
      order: itemIndex,
      automationStatus,
      automationPriority,
      humanJudgement,
      memo: '',
      owner: '',
      updatedAt: timestamp,
    })),
  }))

  return {
    id: createId('map'),
    name: '온라인 쇼핑몰 BUSINESS',
    categories,
    schemaVersion: SCHEMA_VERSION,
    updatedAt: timestamp,
  }
}
