import { cn } from '@/lib/utils'

type PageHeaderProps = {
  title: string
  subtitle?: string
  badge?: string
  className?: string
}

export function PageHeader({ title, subtitle, badge, className }: PageHeaderProps) {
  return (
    <div className={cn('text-center mb-10 px-6', className)}>
      {badge && (
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4 px-3 py-1 rounded-full border border-border/50 bg-card/30 backdrop-blur-sm">
          {badge}
        </p>
      )}
      <h1 className="text-4xl md:text-6xl font-light tracking-tight text-foreground leading-[1.05]">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-4 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  )
}
