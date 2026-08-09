import { base } from "$app/paths";

export const galleryBasePath = base || "";

export const buildGalleryPath = pathname => {
    const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return `${galleryBasePath}${normalizedPath}`;
};

export const buildExtensionCodePath = relativePath => {
    const normalizedPath = relativePath.startsWith("/") ? relativePath.slice(1) : relativePath;
    return `/extensions/${normalizedPath}`;
};

export const buildEditorPath = pathname => {
    const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return `/editor${normalizedPath}`;
};
