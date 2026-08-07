export const DEVCORE_THEME_STORAGE_KEY = 'devcore:theme';

export const DEVCORE_GREEN_SCALE = Object.freeze({
    50: '#effbea',
    100: '#d7f5cf',
    200: '#afeaa3',
    300: '#83dc78',
    400: '#52cf4a',
    500: '#27bf24',
    600: '#1fa41d',
    700: '#19871a',
    800: '#156c17',
    900: '#105214'
});

export const DEFAULT_DEVCORE_THEME = Object.freeze({
    topBar: DEVCORE_GREEN_SCALE[500],
    topBarText: '#ffffff',
    accent: DEVCORE_GREEN_SCALE[700]
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
    return {...DEFAULT_DEVCORE_THEME};
};

export const writeStoredDevcoreTheme = theme => {
    return normalizeDevcoreTheme(theme);
};

export const applyDevcoreTheme = (theme = readStoredDevcoreTheme(), root = typeof document !== 'undefined' ? document.documentElement : null) => {
    const normalized = normalizeDevcoreTheme(theme);
    if (!root) return normalized;

    root.style.setProperty('--devcore-topbar', normalized.topBar);
    root.style.setProperty('--devcore-topbar-text', normalized.topBarText);
    root.style.setProperty('--devcore-accent', normalized.accent);
    root.style.setProperty('--devcore-green-50', DEVCORE_GREEN_SCALE[50]);
    root.style.setProperty('--devcore-green-100', DEVCORE_GREEN_SCALE[100]);
    root.style.setProperty('--devcore-green-200', DEVCORE_GREEN_SCALE[200]);
    root.style.setProperty('--devcore-green-300', DEVCORE_GREEN_SCALE[300]);
    root.style.setProperty('--devcore-green-400', DEVCORE_GREEN_SCALE[400]);
    root.style.setProperty('--devcore-green-500', DEVCORE_GREEN_SCALE[500]);
    root.style.setProperty('--devcore-green-600', DEVCORE_GREEN_SCALE[600]);
    root.style.setProperty('--devcore-green-700', DEVCORE_GREEN_SCALE[700]);
    root.style.setProperty('--devcore-green-800', DEVCORE_GREEN_SCALE[800]);
    root.style.setProperty('--devcore-green-900', DEVCORE_GREEN_SCALE[900]);
    root.setAttribute('data-devcore-theme', 'true');

    if (typeof document !== 'undefined') {
        const meta = document.querySelector('meta[name="theme-color"], meta[property="theme-color"]');
        if (meta) meta.setAttribute('content', normalized.topBar);
    }

    return normalized;
};

export const bootDevcoreTheme = () => applyDevcoreTheme(readStoredDevcoreTheme());

export const subscribeToDevcoreTheme = callback => {
    callback(readStoredDevcoreTheme());
    return () => {};
};
