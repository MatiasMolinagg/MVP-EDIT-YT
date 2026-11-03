import { Outlet } from 'react-router-dom'
import { useApp } from '@/store/app'
import { cn } from '@/lib/cn'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { BottomNav } from './BottomNav'
import { PreviewReturn } from './PreviewReturn'
import { WelcomeModal } from './WelcomeModal'
import { Tour } from './Tour'
import { Agent } from './Agent'

export function Shell() {
  const preview = useApp((s) => s.preview)
  const trailer = useApp((s) => s.trailer)
  const withReturn = !!preview && !trailer
  return (
    <div className="flex min-h-[100dvh] w-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <PreviewReturn />
        <main className={cn('mx-auto w-full min-w-0 max-w-[1240px] flex-1 px-4 pt-5 sm:px-6 sm:pt-7 lg:px-8', withReturn && 'pt-[118px] sm:pt-[84px]')}>
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <WelcomeModal />
      <Tour />
      <Agent />
    </div>
  )
}
