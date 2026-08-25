// 개발용 스모크 테스트 진입점. 초기 렌더가 예외 없이 끝나는지, seed 개수가 맞는지 확인한다.
import { renderToStaticMarkup } from 'react-dom/server'
import App from './App'
import { createSeedMap } from './data/seed'
import { collectItems, computeStats } from './lib/stats'
import { mapReducer } from './store/reducer'
import type { MapState } from './store/reducer'

const seed = createSeedMap()
const stats = computeStats(collectItems(seed))
const html = renderToStaticMarkup(<App />)

let state: MapState = { map: seed, past: [], undo: null, hydrated: true }
const salesFirst = seed.categories.find((category) => category.layer === 'sales')!
state = mapReducer(state, { type: 'MOVE_CATEGORY', categoryId: salesFirst.id, toLayer: 'future', toIndexInLayer: 0 })
const movedLayer = state.map.categories.find((category) => category.id === salesFirst.id)?.layer

const donor = seed.categories[1]
const receiver = seed.categories[3]
state = mapReducer(state, {
  type: 'MOVE_ITEM',
  itemId: donor.items[0].id,
  fromCategoryId: donor.id,
  toCategoryId: receiver.id,
  toIndex: 0,
})
const receiverFirst = state.map.categories.find((category) => category.id === receiver.id)?.items[0]?.name

state = mapReducer(state, { type: 'DELETE_CATEGORY', categoryId: receiver.id })
const afterDelete = state.map.categories.length
state = mapReducer(state, { type: 'UNDO' })
const afterUndo = state.map.categories.length

console.log(
  JSON.stringify(
    {
      categories: seed.categories.length,
      items: stats.total,
      stats,
      renderedChars: html.length,
      hasCenterCard: html.includes('CENTER'),
      movedLayer,
      receiverFirst,
      afterDelete,
      afterUndo,
    },
    null,
    2,
  ),
)
