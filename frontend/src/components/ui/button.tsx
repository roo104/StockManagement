import * as React from 'react';
import {Slot} from '@radix-ui/react-slot';
import {cva, type VariantProps} from 'class-variance-authority';
import {cn} from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-bg transition-[filter,background-color,box-shadow,transform,border-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:size-4 [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                default:
                    'text-white shadow-md bg-[image:var(--gradient-brand)] hover:brightness-110 hover:shadow-[0_0_24px_rgba(189,52,254,0.35)]',
                secondary:
                    'bg-[color:var(--color-surface-2)] text-[color:var(--color-fg)] border border-[color:var(--color-border-soft)] hover:bg-[color:var(--color-surface-hover)] hover:border-[color:var(--color-brand-purple)]',
                outline:
                    'border border-[color:var(--color-border)] bg-transparent text-[color:var(--color-fg)] hover:bg-[color:var(--color-surface-hover)] hover:border-[color:var(--color-brand-purple)]',
                ghost:
                    'bg-transparent text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-surface-hover)] hover:text-[color:var(--color-fg)]',
                destructive:
                    'bg-[color:var(--color-danger)] text-white hover:brightness-110 shadow-md',
                link: 'text-[color:var(--color-brand-cyan)] underline-offset-4 hover:underline',
            },
            size: {
                sm: 'h-8 px-3 text-xs',
                md: 'h-10 px-4',
                lg: 'h-11 px-6 text-base',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({className, variant, size, asChild = false, ...props}, ref) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp
                ref={ref}
                className={cn(buttonVariants({variant, size, className}))}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export {Button, buttonVariants};
