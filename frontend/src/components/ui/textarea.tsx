import * as React from 'react';
import {cn} from '@/lib/utils';

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({className, ...props}, ref) => (
        <textarea
            ref={ref}
            className={cn(
                'flex min-h-[80px] w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface-input)] px-3 py-2 text-sm text-[color:var(--color-fg)] shadow-sm',
                'placeholder:text-[color:var(--color-fg-subtle)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--color-bg)] focus-visible:border-[color:var(--color-ring)]',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        />
    )
);
Textarea.displayName = 'Textarea';

export {Textarea};
