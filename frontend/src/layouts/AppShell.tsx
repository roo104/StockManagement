import * as React from 'react';
import {Outlet} from 'react-router-dom';
import {Sheet, SheetContent, SheetTitle} from '@/components/ui/sheet';
import {VisuallyHidden} from '@radix-ui/react-visually-hidden';
import {SidebarProvider, useSidebar} from '@/hooks/useSidebar';
import {SidebarContents} from '@/layouts/Sidebar';
import {Topbar} from '@/layouts/Topbar';
import {CommandPalette} from '@/components/CommandPalette';
import {Toaster} from '@/components/ui/toaster';
import {cn} from '@/lib/utils';

function ShellInner() {
    const {collapsed, mobileOpen, setMobileOpen} = useSidebar();
    const [commandOpen, setCommandOpen] = React.useState(false);

    return (
        <div className="relative min-h-screen w-full bg-[color:var(--color-bg)] text-[color:var(--color-fg)]">
            {/* Ambient brand glow */}
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 -z-10"
                style={{
                    background:
                        'radial-gradient(ellipse 80% 60% at 20% 0%, rgba(189, 52, 254, 0.16), transparent 60%), radial-gradient(ellipse 70% 50% at 80% 20%, rgba(65, 209, 255, 0.10), transparent 60%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(255, 200, 61, 0.05), transparent 70%)',
                }}
            />

            {/* Desktop sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-20 hidden md:flex flex-col border-r border-[color:var(--color-border-soft)] bg-[color:var(--color-surface)]/60 backdrop-blur transition-[width] duration-200',
                    collapsed ? 'w-16' : 'w-60'
                )}
            >
                <SidebarContents/>
            </aside>

            {/* Mobile sidebar via Sheet */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetContent side="left" className="w-64 p-0">
                    <VisuallyHidden asChild>
                        <SheetTitle>Navigation</SheetTitle>
                    </VisuallyHidden>
                    <SidebarContents onNavigate={() => setMobileOpen(false)}/>
                </SheetContent>
            </Sheet>

            <div
                className={cn(
                    'flex min-h-screen flex-col transition-[padding] duration-200',
                    'md:pl-60',
                    collapsed && 'md:pl-16'
                )}
            >
                <Topbar onOpenCommand={() => setCommandOpen(true)}/>
                <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
                    <Outlet/>
                </main>
            </div>

            <CommandPalette open={commandOpen} onOpenChange={setCommandOpen}/>
            <Toaster/>
        </div>
    );
}

export function AppShell() {
    return (
        <SidebarProvider>
            <ShellInner/>
        </SidebarProvider>
    );
}
