import * as React from 'react';
import {cn} from '@/lib/utils';

interface EmptyStateProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    icon?: React.ReactNode;
    title: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
    ({icon, title, description, action, className, ...props}, ref) => (
        <div
            ref={ref}
            className={cn(
                'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[color:var(--color-border-soft)] bg-[color:var(--color-surface)]/40 px-6 py-12 text-center',
                className
            )}
            {...props}
        >
            {icon ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-surface-2)] text-[color:var(--color-fg-muted)] [&_svg]:size-6">
                    {icon}
                </div>
            ) : null}
            <div className="space-y-1">
                <h4 className="text-base font-semibold text-[color:var(--color-fg)]">{title}</h4>
                {description ? (
                    <p className="text-sm text-[color:var(--color-fg-muted)]">{description}</p>
                ) : null}
            </div>
            {action ? <div className="pt-1">{action}</div> : null}
        </div>
    )
);
EmptyState.displayName = 'EmptyState';

export {EmptyState};
