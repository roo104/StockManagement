import * as React from 'react';
import {cn} from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({className, type = 'text', ...props}, ref) => (
        <input
            ref={ref}
            type={type}
            className={cn(
                'flex h-10 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface-input)] px-3 py-2 text-sm text-[color:var(--color-fg)] shadow-sm transition-colors',
                'placeholder:text-[color:var(--color-fg-subtle)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--color-bg)] focus-visible:border-[color:var(--color-ring)]',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'file:border-0 file:bg-transparent file:text-sm file:font-medium',
                className
            )}
            {...props}
        />
    )
);
Input.displayName = 'Input';

export {Input};
