import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import content from '../content-plan/content.json'

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Write site.title from content-plan/content.json into index.html's <title>.
function contentTitle(): Plugin {
  return {
    name: 'content-title',
    transformIndexHtml(html) {
      const title = content.site?.title
      return title ? html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`) : html
    },
  }
}

export default defineConfig({
  // Built assets use relative paths (dist/index.html references ./assets/..., so it works from any subdirectory or opened directly)
  base: './',
  plugins: [react(), contentTitle()],
  // content-plan/content.json lives outside web/, so let the dev server read the repo root too
  server: { host: true, port: 5173, fs: { allow: ['..'] } },
})
