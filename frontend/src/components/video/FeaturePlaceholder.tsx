import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeaturePlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  emptyMessage: string;
  className?: string;
}

export function FeaturePlaceholder({
  icon: Icon,
  title,
  description,
  badge = 'Bientôt',
  emptyMessage,
  className,
}: FeaturePlaceholderProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-border bg-surface shadow-sm',
        className,
      )}
    >
      <header className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 shrink-0 text-brand-600" />
            <h2 className="font-semibold text-text-primary">{title}</h2>
          </div>
          <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
            {badge}
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-text-muted">{description}</p>
      </header>

      <div className="flex min-h-[140px] flex-col items-center justify-center px-5 py-8 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
          <Icon className="h-5 w-5 text-brand-400" />
        </div>
        <p className="text-sm text-text-secondary">{emptyMessage}</p>
      </div>
    </section>
  );
}
