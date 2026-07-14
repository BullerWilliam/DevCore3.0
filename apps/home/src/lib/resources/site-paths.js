export const DEVCORE_HOME_PATH = '/';
export const DEVCORE_EDITOR_PATH = '/editor/';
export const DEVCORE_PLAYER_PATH = '/player/';
export const DEVCORE_PACKAGER_PATH = '/packager/';
export const DEVCORE_CREDITS_PATH = '/editor/credits.html';
export const DEVCORE_CONTACT_PATH = '/editor/contact.html';

export const buildSharedProjectPath = projectId => `${DEVCORE_PLAYER_PATH}#${projectId}`;
