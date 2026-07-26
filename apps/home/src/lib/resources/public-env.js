import {
    PUBLIC_API_URL as STATIC_PUBLIC_API_URL,
    PUBLIC_BASIC_API_URL as STATIC_PUBLIC_BASIC_API_URL,
    PUBLIC_STUDIO_URL as STATIC_PUBLIC_STUDIO_URL
} from '$env/static/public';

const normalizePublicUrl = (value, fallback) => {
    if (typeof value !== 'string') return fallback;

    const trimmed = value.trim();
    if (!trimmed) return fallback;

    return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
};

export const PUBLIC_STUDIO_URL = normalizePublicUrl(
    STATIC_PUBLIC_STUDIO_URL,
    'https://studio.penguinmod.com'
);

export const PUBLIC_API_URL = normalizePublicUrl(
    STATIC_PUBLIC_API_URL,
    'https://studio.penguinmod.com/api'
);

export const PUBLIC_BASIC_API_URL = normalizePublicUrl(
    STATIC_PUBLIC_BASIC_API_URL,
    'https://penguinmod-basic-api.derpygamer2142.com'
);
