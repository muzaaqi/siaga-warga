import { HeroSection } from './hero-section'
import { QuickTrackingCard } from './quick-tracking-card'
import { SafetyGuideSection } from './safety-guide-section'
import type { LandingStats } from '@/lib/schema'

interface LandingViewProps {
  stats?: LandingStats
}

/**
 * Orkestrator halaman beranda SiagaWarga.
 * Identik 1:1 dengan spesifikasi visual referensi design/landing.jpg.
 */
export function LandingView({ stats: _stats }: LandingViewProps) {
  return (
    <div className="flex flex-col pb-16 sm:pb-24">
      {/* 1. Hero Section dengan foto latar penuh dan kurva cembung */}
      <HeroSection />

      {/* 2. Floating Quick Tracking Card ("Cek Cepat Status laporan") */}
      <QuickTrackingCard />

      {/* 3. Panduan Keselamatan Warga di Lokasi Kebakaran */}
      <div className="mt-8 sm:mt-12 lg:mt-16">
        <SafetyGuideSection />
      </div>
    </div>
  )
}
