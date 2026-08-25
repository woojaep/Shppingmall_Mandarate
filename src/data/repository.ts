import type { BusinessMap } from '../types/model'

/**
 * 저장소 경계.
 * 화면/상태 코드는 이 인터페이스에만 의존하므로,
 * 나중에 Supabase/Postgres 구현체로 갈아끼워도 나머지 코드는 그대로 둔다.
 */
export interface BusinessMapRepository {
  load(): Promise<BusinessMap | null>
  save(map: BusinessMap): Promise<void>
  clear(): Promise<void>
}
