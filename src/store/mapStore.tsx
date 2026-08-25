import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react'
import type { ReactNode } from 'react'
import type { BusinessMap } from '../types/model'
import { createSeedMap } from '../data/seed'
import { LocalStorageRepository } from '../data/localStorageRepository'
import type { BusinessMapRepository } from '../data/repository'
import type { MapAction } from './actions'
import { mapReducer } from './reducer'
import type { MapState } from './reducer'

const MapStateContext = createContext<MapState | null>(null)
const MapDispatchContext = createContext<((action: MapAction) => void) | null>(null)

const SAVE_DEBOUNCE_MS = 300

function initialState(): MapState {
  // 진짜 데이터는 hydrate 이후에 들어온다. 첫 렌더는 seed로 채워 화면이 비지 않게 한다.
  return { map: createSeedMap(), past: [], undo: null, hydrated: false }
}

interface MapProviderProps {
  children: ReactNode
  repository?: BusinessMapRepository
}

export function MapProvider({ children, repository }: MapProviderProps) {
  const repo = useMemo(() => repository ?? new LocalStorageRepository(), [repository])
  const [state, dispatch] = useReducer(mapReducer, undefined, initialState)
  const saveTimer = useRef<number | null>(null)

  // 최초 1회: 저장된 지도를 읽고, 없으면 seed를 그대로 확정한다.
  useEffect(() => {
    let cancelled = false
    void repo.load().then((saved) => {
      if (cancelled) return
      dispatch({ type: 'HYDRATE', map: saved ?? createSeedMap() })
    })
    return () => {
      cancelled = true
    }
  }, [repo])

  // 변경이 멈추면 저장. hydrate 전에는 저장하지 않는다(빈 seed로 덮어쓰기 방지).
  useEffect(() => {
    if (!state.hydrated) return
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      void repo.save(state.map)
    }, SAVE_DEBOUNCE_MS)
    return () => {
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current)
    }
  }, [state.map, state.hydrated, repo])

  return (
    <MapStateContext.Provider value={state}>
      <MapDispatchContext.Provider value={dispatch}>{children}</MapDispatchContext.Provider>
    </MapStateContext.Provider>
  )
}

export function useMapState(): MapState {
  const state = useContext(MapStateContext)
  if (!state) throw new Error('useMapState는 MapProvider 안에서만 쓸 수 있습니다.')
  return state
}

export function useMap(): BusinessMap {
  return useMapState().map
}

export function useMapDispatch(): (action: MapAction) => void {
  const dispatch = useContext(MapDispatchContext)
  if (!dispatch) throw new Error('useMapDispatch는 MapProvider 안에서만 쓸 수 있습니다.')
  return dispatch
}
