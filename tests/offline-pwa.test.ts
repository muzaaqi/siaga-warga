import { describe, expect, it } from 'bun:test'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { useOnlineStatus } from '@/lib/use-online-status'
import { OfflineIndicator } from '@/components/shared/offline-indicator'

describe('PWA Web Manifest & Offline Signal Indicator (Plan 16)', () => {
  describe('Web App Manifest Integrity (public/manifest.webmanifest)', () => {
    const manifestPath = path.resolve(process.cwd(), 'public/manifest.webmanifest')

    it('harus memastikan berkas manifest.webmanifest ada dan valid JSON', () => {
      expect(fs.existsSync(manifestPath)).toBe(true)
      const raw = fs.readFileSync(manifestPath, 'utf-8')
      const manifest = JSON.parse(raw)
      expect(typeof manifest).toBe('object')
      expect(manifest.name).toBe('SiagaWarga - Pelaporan & Pantau Kebakaran')
      expect(manifest.short_name).toBe('SiagaWarga')
      expect(manifest.start_url).toBe('/')
      expect(manifest.display).toBe('standalone')
      expect(manifest.theme_color).toBe('#1b4d3e')
    })

    it('harus menyertakan definisi ikon PWA yang valid termasuk format SVG dan ICO', () => {
      const raw = fs.readFileSync(manifestPath, 'utf-8')
      const manifest = JSON.parse(raw)
      expect(Array.isArray(manifest.icons)).toBe(true)
      expect(manifest.icons.length).toBeGreaterThanOrEqual(2)

      const svgIcon = manifest.icons.find((i: { type?: string }) => i.type === 'image/svg+xml')
      expect(svgIcon).toBeDefined()
      expect(svgIcon.src).toBe('/icon.svg')

      // Cek bahwa berkas icon.svg benar-benar ada di public/
      const iconSvgPath = path.resolve(process.cwd(), 'public/icon.svg')
      expect(fs.existsSync(iconSvgPath)).toBe(true)
    })

    it('harus menyertakan 3 App Shortcuts resmi menuju /lapor, /pantau, dan /news', () => {
      const raw = fs.readFileSync(manifestPath, 'utf-8')
      const manifest = JSON.parse(raw)
      expect(Array.isArray(manifest.shortcuts)).toBe(true)
      expect(manifest.shortcuts.length).toBe(3)

      const shortcutUrls = manifest.shortcuts.map((s: { url: string }) => s.url)
      expect(shortcutUrls).toContain('/lapor')
      expect(shortcutUrls).toContain('/pantau')
      expect(shortcutUrls).toContain('/news')
    })
  })

  describe('Universal Zero Emoji Compliance (Rule 14)', () => {
    it('seluruh teks manifest dan microcopy offline indicator harus 100% bebas emoji', () => {
      const rawManifest = fs.readFileSync(
        path.resolve(process.cwd(), 'public/manifest.webmanifest'),
        'utf-8',
      )

      const offlineCopyTexts = [
        rawManifest,
        'Koneksi Terputus',
        'Anda sedang berada dalam mode luar jaringan (offline). Fitur pengiriman laporan dan sinkronisasi peta satelit membutuhkan koneksi internet aktif.',
        'Periksa Sambungan',
        'Koneksi Terhubung Kembali',
        'Sinyal internet aktif. Seluruh fitur pelaporan dan pemantauan siap digunakan kembali.',
      ]

      const emojiRegex =
        /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u

      for (const text of offlineCopyTexts) {
        expect(emojiRegex.test(text)).toBe(false)
      }
    })
  })

  describe('Component & Hook Exports', () => {
    it('harus mengekspor fungsi hook useOnlineStatus dan komponen OfflineIndicator yang valid', () => {
      expect(typeof useOnlineStatus).toBe('function')
      expect(typeof OfflineIndicator).toBe('function')
    })
  })
})
