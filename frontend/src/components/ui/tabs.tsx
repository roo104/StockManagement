import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import {cn} from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({className, ...props}, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            'inline-flex items-center gap-1 border-b border-[color:var(--color-border-soft)] -mb-px',
            className
        )}
        {...props}
    />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({className, ...props}, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
            'relative inline-flex items-center justify-center whitespace-nowrap px-4 py-2.5 text-sm font-medium text-[color:var(--color-fg-muted)] transition-colors',
            'hover:text-[color:var(--color-fg)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 focus-visible:rounded-sm',
            'disabled:pointer-events-none disabled:opacity-50',
            'data-[state=active]:text-[color:var(--color-fg)]',
            'data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:bottom-[-1px] data-[state=active]:after:h-[2px] data-[state=active]:after:w-full data-[state=active]:after:bg-[image:var(--gradient-brand)]',
            className
        )}
        {...props}
    />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({className, ...props}, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            'mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 rounded-sm',
            className
        )}
        {...props}
    />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export {Tabs, TabsList, TabsTrigger, TabsContent};
