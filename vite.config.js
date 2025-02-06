import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // base: "/prompt/",  // GitHub Pages에서 정상적으로 로드되도록 설정
  plugins: [react()],
});
