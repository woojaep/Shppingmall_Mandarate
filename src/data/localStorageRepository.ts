import type { BusinessMap } from '../types/model'
import { SCHEMA_VERSION } from '../types/model'
import type { BusinessMapRepository } from './repository'
import { normalizeMap } from './normalize'

const STORAGE_KEY = 'shopping-mall-mandalart:v1'

export class LocalStorageRepository implements BusinessMapRepository {
  constructor(private readonly key: string = STORAGE_KEY) {}

  async load(): Promise<BusinessMap | null> {
    try {
      const raw = localStorage.getItem(this.key)
      if (!raw) return null
      const parsed = JSON.parse(raw) as unknown
      return normalizeMap(parsed)
    } catch (error) {
      console.error('저장된 데이터를 읽지 못했습니다.', error)
      return null
    }
  }

  async save(map: BusinessMap): Promise<void> {
    try {
      localStorage.setItem(this.key, JSON.stringify({ ...map, schemaVersion: SCHEMA_VERSION }))
    } catch (error) {
      console.error('저장에 실패했습니다.', error)
      throw error
    }
  }

  async clear(): Promise<void> {
    localStorage.removeItem(this.key)
  }
}
