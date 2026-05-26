import * as React from 'react';
import {cva, type VariantProps} from 'class-variance-authority';
import {cn} from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
    {
        variants: {
            variant: {
                default:
                    'bg-[color:var(--color-surface-2)] text-[color:var(--color-fg)] border border-[color:var(--color-border-soft)]',
                gradient:
                    'text-white bg-[image:var(--gradient-brand)] shadow-sm',
                outline:
                    'border border-[color:var(--color-border)] text-[color:var(--color-fg-muted)] bg-transparent',
                secondary:
                    'bg-[color:var(--color-surface-3)] text-[color:var(--color-fg-muted)]',
                success:
                    'bg-[rgba(61,214,140,0.12)] text-[color:var(--color-success)] border border-[rgba(61,214,140,0.35)]',
                danger:
                    'bg-[rgba(244,63,94,0.12)] text-[color:var(--color-danger)] border border-[rgba(244,63,94,0.35)]',
                warning:
                    'bg-[rgba(255,200,61,0.12)] text-[color:var(--color-warning)] border border-[rgba(255,200,61,0.35)]',
                info:
                    'bg-[rgba(65,209,255,0.12)] text-[color:var(--color-info)] border border-[rgba(65,209,255,0.35)]',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
        VariantProps<typeof badgeVariants> {
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({className, variant, ...props}, ref) => (
        <span
            ref={ref}
            className={cn(badgeVariants({variant}), className)}
            {...props}
        />
    )
);
Badge.displayName = 'Badge';

export {Badge, badgeVariants};
