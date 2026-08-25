import type { AutomationStatus, HumanJudgement, Layer } from '../types/model'

/**
 * 상태별 색 토큰.
 * 색은 보조 신호일 뿐이라 화면에서는 항상 기호(●◐○)와 한글 라벨을 함께 붙인다.
 */
export const STATUS_TONE: Record<AutomationStatus, { chip: string; dot: string; bar: string; solid: string }> = {
  manual: {
    chip: 'border-rose-200 bg-rose-50 text-rose-800',
    dot: 'text-rose-500',
    bar: 'bg-rose-400',
    solid: 'bg-rose-600 text-white',
  },
  semi: {
    chip: 'border-amber-200 bg-amber-50 text-amber-900',
    dot: 'text-amber-500',
    bar: 'bg-amber-400',
    solid: 'bg-amber-500 text-white',
  },
  automated: {
    chip: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    dot: 'text-emerald-600',
    bar: 'bg-emerald-500',
    solid: 'bg-emerald-600 text-white',
  },
}

export const LAYER_TONE: Record<Layer, { band: string; label: string; accent: string }> = {
  sales: {
    band: 'border-sky-200 bg-sky-50/60',
    label: 'bg-sky-600 text-white',
    accent: 'text-sky-700',
  },
  operations: {
    band: 'border-violet-200 bg-violet-50/60',
    label: 'bg-violet-600 text-white',
    accent: 'text-violet-700',
  },
  future: {
    band: 'border-teal-200 bg-teal-50/60',
    label: 'bg-teal-700 text-white',
    accent: 'text-teal-700',
  },
}

export const JUDGEMENT_TONE: Record<HumanJudgement, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-slate-200 text-slate-700',
  high: 'bg-slate-800 text-white',
}
