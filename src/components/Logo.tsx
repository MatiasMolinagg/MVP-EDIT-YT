import { useId } from 'react'
import { cn } from '@/lib/cn'
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  const gid = 'lg' + useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={cn('shrink-0', className)} aria-hidden>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#818cf8" /><stop offset="1" stopColor="#4f46e5" /></linearGradient></defs>
      <rect width="64" height="64" rx="16" fill={`url(#${gid})`} />
      <path d="M26 20v24l18-12z" fill="#fff" />
    </svg>
  )
}
export function Logo({ size = 32, showName = true, className }: { size?: number; showName?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2', className)}>
      <LogoMark size={size} />
      {showName && <span className="truncate text-[17px] font-extrabold tracking-tight">Creavo</span>}
    </span>
  )
}
