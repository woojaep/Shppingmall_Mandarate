import type { AutomationStats } from '../lib/stats'
import { ratio } from '../lib/stats'
import { STATUS_LABEL, STATUS_MARK } from '../types/model'
import { STATUS_TONE } from '../lib/tokens'

interface SummaryBarProps {
  stats: AutomationStats
}

interface CellProps {
  label: string
  value: string
  sub?: string
  tone?: string
  dark?: boolean
}

function Cell({ label, value, sub, tone = '', dark = false }: CellProps) {
  const muted = dark ? 'text-slate-300' : 'text-slate-500'
  return (
    <div className={`rounded-lg border px-3 py-1.5 ${tone || 'border-slate-200 bg-white'}`}>
      <div className={`text-[11px] leading-none ${muted}`}>{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-lg leading-none font-semibold tabular-nums">{value}</span>
        {sub ? <span className={`text-[11px] ${muted}`}>{sub}</span> : null}
      </div>
    </div>
  )
}

/** 상단 자동화 현황 요약 — MVP에서는 이 한 줄이 대시보드 전부다. */
export function SummaryBar({ stats }: SummaryBarProps) {
  return (
    <div className="flex flex-wrap items-stretch gap-2">
      <Cell label="전체 항목" value={String(stats.total)} />
      <Cell
        label={`${STATUS_MARK.manual} ${STATUS_LABEL.manual}`}
        value={String(stats.manual)}
        sub={`${ratio(stats.manual, stats.total)}%`}
        tone={STATUS_TONE.manual.chip}
      />
      <Cell
        label={`${STATUS_MARK.semi} ${STATUS_LABEL.semi}`}
        value={String(stats.semi)}
        sub={`${ratio(stats.semi, stats.total)}%`}
        tone={STATUS_TONE.semi.chip}
      />
      <Cell
        label={`${STATUS_MARK.automated} ${STATUS_LABEL.automated}`}
        value={String(stats.automated)}
        sub={`${ratio(stats.automated, stats.total)}%`}
        tone={STATUS_TONE.automated.chip}
      />
      <Cell
        label="★★★ 인데 아직 수동"
        value={String(stats.urgent)}
        sub="자동화 1순위"
        tone="border-slate-900 bg-slate-900 text-white"
        dark
      />
    </div>
  )
}
