import { useEffect } from 'react'
import { useMapDispatch, useMapState } from '../store/mapStore'
import { Button } from './ui/Button'

const AUTO_DISMISS_MS = 6000

/** 삭제·덮어쓰기처럼 되돌리고 싶어질 변경 뒤에 잠깐 떠 있는 안내. */
export function UndoToast() {
  const { undo } = useMapState()
  const dispatch = useMapDispatch()

  useEffect(() => {
    if (!undo) return
    const timer = window.setTimeout(() => dispatch({ type: 'DISMISS_UNDO' }), AUTO_DISMISS_MS)
    return () => window.clearTimeout(timer)
  }, [undo, dispatch])

  if (!undo) return null

  return (
    <div
      role="status"
      className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-xl"
    >
      <span>{undo.label}</span>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => dispatch({ type: 'UNDO' })}
      >
        되돌리기
      </Button>
      <button
        type="button"
        aria-label="알림 닫기"
        onClick={() => dispatch({ type: 'DISMISS_UNDO' })}
        className="text-slate-400 hover:text-white"
      >
        ✕
      </button>
    </div>
  )
}
