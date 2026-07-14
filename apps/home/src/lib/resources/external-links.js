import {
    DEVCORE_CREDITS_PATH,
    DEVCORE_CONTACT_PATH,
    DEVCORE_EDITOR_PATH,
    DEVCORE_PACKAGER_PATH
} from "$lib/resources/site-paths";

export default {
    /**
     * PenguinMod's editor page within the studio domain.
     * 
     * This should only be used in a context of "visit the editor" with no specific target
     */
    editor: DEVCORE_EDITOR_PATH,

    /**
     * PenguinMod's credits page
     */
    credits: DEVCORE_CREDITS_PATH,

    /**
     * PenguinMod's contact page
     */
    contact: DEVCORE_CONTACT_PATH,

    /**
     * Donation pages for sites
     */
    donate: {
        scratch: "https://www.scratchfoundation.org/donate",
        turbowarp: "https://github.com/sponsors/GarboMuffin"
    },

    /**
     * PenguinMod's packager page
     */
    packager: DEVCORE_PACKAGER_PATH,
    
    /**
     * PenguinMod's status page
     */
    status: "https://status.penguinmod.com/",

    /**
     * PenguinMod's official wiki
     */
    wiki: "https://wiki.penguinmod.com/wiki/Main_Page",

    /**
     * PenguinMod's Discord invite
     */
    discord: "https://discord.gg/NZ9MBMYTZh",

    /**
     * Scratch's website
     */
    scratch: "https://scratch.mit.edu",

    /**
     * TurboWarp's website
     */
    turbowarp: "https://turbowarp.org",

    /**
     * DevCore's github page
     */
    github: "https://github.com/BullerWilliam/DevCore3.0",

    /**
     * DevCore's issues page
     */
    issues: "https://github.com/BullerWilliam/DevCore3.0/issues",
}
