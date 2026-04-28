import Image from 'next/image'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  size?: number
  className?: string
  imageClassName?: string
}

export function BrandLogo({ size = 40, className, imageClassName }: BrandLogoProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-blue-400/25 bg-white/10',
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.jpeg"
        alt="Roastellar logo"
        fill
        sizes={`${size}px`}
        className={cn('object-cover', imageClassName)}
        priority
      />
    </div>
  )
}
