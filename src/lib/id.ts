/** 충돌 걱정 없이 짧은 id를 만든다. crypto.randomUUID가 없으면 시간+난수로 대체. */
export function createId(prefix = 'id'): string {
  const rnd =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `${prefix}_${rnd}`
}

export function now(): string {
  return new Date().toISOString()
}
