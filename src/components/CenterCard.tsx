import type { AutomationStats } from '../lib/stats'
import { ratio } from '../lib/stats'

interface CenterCardProps {
  name: string
  stats: AutomationStats
}

/** 만다라트의 중앙 칸. 사업 전체가 무엇을 향하는지 한 문장으로 붙잡아 둔다. */
export function CenterCard({ name, stats }: CenterCardProps) {
  const automatedRatio = ratio(stats.automated + stats.semi, stats.total)
  return (
    <div className="flex min-w-[190px] flex-1 flex-col items-center justify-center rounded-lg border-2 border-slate-900 bg-slate-900 px-3 py-4 text-center text-white shadow-md">
      <span className="text-[10px] tracking-[0.2em] text-slate-400">CENTER</span>
      <h2 className="mt-1 text-base leading-snug font-bold">{name}</h2>
      <p className="mt-2 text-[11px] text-slate-300">
        전체 {stats.total}개 업무 중<br />
        <span className="font-semibold text-white">{automatedRatio}%</span>가 자동 · 반자동
      </p>
    </div>
  )
}
