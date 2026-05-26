import {Toaster as Sonner} from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({...props}: ToasterProps) => (
    <Sonner
        theme="dark"
        position="bottom-right"
        toastOptions={{
            classNames: {
                toast:
                    'group rounded-lg border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface)] text-[color:var(--color-fg)] shadow-lg',
                description: 'text-[color:var(--color-fg-muted)]',
                actionButton:
                    'bg-[color:var(--color-brand-purple)] text-white rounded-md px-2 py-1 text-xs',
                cancelButton:
                    'bg-[color:var(--color-surface-2)] text-[color:var(--color-fg-muted)] rounded-md px-2 py-1 text-xs',
                error: 'border-[rgba(244,63,94,0.4)]',
                success: 'border-[rgba(61,214,140,0.4)]',
                warning: 'border-[rgba(255,200,61,0.4)]',
            },
        }}
        {...props}
    />
);

export {Toaster};
export {toast} from 'sonner';
