import * as React from 'react';

interface HotkeyOptions {
    enabled?: boolean;
    preventDefault?: boolean;
}

/**
 * Bind a global keyboard shortcut. Pass keys like "mod+k" (mod = ⌘ on macOS, Ctrl elsewhere).
 * Modifiers: mod | meta | ctrl | alt | shift. Use "+" to combine.
 */
export function useHotkey(
    key: string,
    callback: (event: KeyboardEvent) => void,
    {enabled = true, preventDefault = true}: HotkeyOptions = {}
) {
    const callbackRef = React.useRef(callback);
    callbackRef.current = callback;

    React.useEffect(() => {
        if (!enabled) return;

        const parts = key.toLowerCase().split('+').map((p) => p.trim());
        const targetKey = parts[parts.length - 1];
        const mods = new Set(parts.slice(0, -1));

        const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);

        function handler(e: KeyboardEvent) {
            if (e.key.toLowerCase() !== targetKey) return;
            const needMod = mods.has('mod');
            const modOk = !needMod || (isMac ? e.metaKey : e.ctrlKey);
            const ctrlOk = !mods.has('ctrl') || e.ctrlKey;
            const metaOk = !mods.has('meta') || e.metaKey;
            const altOk = !mods.has('alt') || e.altKey;
            const shiftOk = !mods.has('shift') || e.shiftKey;
            if (modOk && ctrlOk && metaOk && altOk && shiftOk) {
                if (preventDefault) e.preventDefault();
                callbackRef.current(e);
            }
        }

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [key, enabled, preventDefault]);
}
