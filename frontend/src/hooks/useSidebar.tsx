import * as React from 'react';

const STORAGE_KEY = 'app.sidebar.collapsed';

interface SidebarContextValue {
    collapsed: boolean;
    toggle: () => void;
    setCollapsed: (collapsed: boolean) => void;
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function readInitial(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        return window.localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
        return false;
    }
}

export function SidebarProvider({children}: { children: React.ReactNode }) {
    const [collapsed, setCollapsedState] = React.useState<boolean>(readInitial);
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const setCollapsed = React.useCallback((next: boolean) => {
        setCollapsedState(next);
        try {
            window.localStorage.setItem(STORAGE_KEY, String(next));
        } catch {
            // Ignore storage errors (e.g., disabled storage).
        }
    }, []);

    const toggle = React.useCallback(() => {
        setCollapsed(!collapsed);
    }, [collapsed, setCollapsed]);

    const value = React.useMemo(
        () => ({collapsed, toggle, setCollapsed, mobileOpen, setMobileOpen}),
        [collapsed, toggle, setCollapsed, mobileOpen]
    );

    return (
        <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
    );
}

export function useSidebar() {
    const ctx = React.useContext(SidebarContext);
    if (!ctx) throw new Error('useSidebar must be used within <SidebarProvider>');
    return ctx;
}
