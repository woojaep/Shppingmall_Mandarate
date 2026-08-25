import type { BusinessMap } from '../types/model'
import { normalizeMap } from '../data/normalize'

function fileStamp(): string {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`
}

/** 현재 지도를 JSON 파일로 내려받는다 — 백업이자 다른 PC로 옮기는 수단. */
export function exportMapToFile(map: BusinessMap): void {
  const blob = new Blob([JSON.stringify(map, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `business-mandalart-${fileStamp()}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/** 파일을 읽어 지도로 되돌린다. 형식이 아니면 에러를 던진다. */
export async function importMapFromFile(file: File): Promise<BusinessMap> {
  const text = await file.text()
  const parsed = JSON.parse(text) as unknown
  const map = normalizeMap(parsed)
  if (!map) throw new Error('만다라트 JSON 형식이 아닙니다.')
  return map
}
