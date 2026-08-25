import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: './' 로 두면 빌드 결과(dist/index.html)를 파일 더블클릭으로도,
// GitHub Pages 하위 경로에서도 그대로 열 수 있다.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
