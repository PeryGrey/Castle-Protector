'use client'
import { Label } from '@/_shadcn/components/ui/label'
import { cn } from '@/_shadcn/lib/utils'

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Label className={cn(
      'text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1 leading-none',
      className
    )}>
      {children}
    </Label>
  )
}
