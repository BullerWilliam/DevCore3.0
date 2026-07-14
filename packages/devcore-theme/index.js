export const DEVCORE_THEME_STORAGE_KEY = 'devcore:theme';

export const DEFAULT_DEVCORE_THEME = Object.freeze({
    topBar: '#00c3ff',
    topBarText: '#ffffff',
    accent: '#ff9f1a'
});

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

const normalizeColor = (value, fallback) => {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    return HEX_COLOR_PATTERN.test(trimmed) ? trimmed.toLowerCase() : fallback;
};

export const normalizeDevcoreTheme = input => ({
    topBar: normalizeColor(input && input.topBar, DEFAULT_DEVCORE_THEME.topBar),
    topBarText: normalizeColor(input && input.topBarText, DEFAULT_DEVCORE_THEME.topBarText),
    accent: normalizeColor(input && input.accent, DEFAULT_DEVCORE_THEME.accent)
});

export const readStoredDevcoreTheme = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return {...DEFAULT_DEVCORE_THEME};
    }
    try {
        const raw = window.localStorage.getItem(DEVCORE_THEME_STORAGE_KEY);
        if (!raw) return {...DEFAULT_DEVCORE_THEME};
        return normalizeDevcoreTheme(JSON.parse(raw));
    } catch (error) {
        return {...DEFAULT_DEVCORE_THEME};
    }
};

export const writeStoredDevcoreTheme = theme => {
    const normalized = normalizeDevcoreTheme(theme);
    if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(DEVCORE_THEME_STORAGE_KEY, JSON.stringify(normalized));
    }
    return normalized;
};

export const applyDevcoreTheme = (theme = readStoredDevcoreTheme(), root = typeof document !== 'undefined' ? document.documentElement : null) => {
    const normalized = normalizeDevcoreTheme(theme);
    if (!root) return normalized;

    root.style.setProperty('--devcore-topbar', normalized.topBar);
    root.style.setProperty('--devcore-topbar-text', normalized.topBarText);
    root.style.setProperty('--devcore-accent', normalized.accent);
    root.setAttribute('data-devcore-theme', 'true');

    if (typeof document !== 'undefined') {
        const meta = document.querySelector('meta[name="theme-color"], meta[property="theme-color"]');
        if (meta) meta.setAttribute('content', normalized.topBar);
    }

    return normalized;
};

export const bootDevcoreTheme = () => applyDevcoreTheme(readStoredDevcoreTheme());

export const subscribeToDevcoreTheme = callback => {
    if (typeof window === 'undefined') return () => {};
    const handleStorage = event => {
        if (event.key && event.key !== DEVCORE_THEME_STORAGE_KEY) return;
        callback(readStoredDevcoreTheme());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
};
