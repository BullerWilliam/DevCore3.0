import { existsSync, lstatSync, mkdirSync, rmSync, symlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

const ensureDirectory = directory => {
    mkdirSync(directory, { recursive: true });
};

const replaceWithJunction = (targetPath, linkPath) => {
    const parentDirectory = path.dirname(linkPath);
    ensureDirectory(parentDirectory);

    if (existsSync(linkPath)) {
        lstatSync(linkPath);
        rmSync(linkPath, { recursive: true, force: true });
    }

    symlinkSync(targetPath, linkPath, 'junction');
};

const editorLinks = [
    ['PenguinMod-MarkDown', 'packages/markdown'],
    ['pmp-protobuf', 'packages/pmp-protobuf'],
    ['scratch-audio', 'packages/audio'],
    ['scratch-blocks', 'packages/blocks'],
    ['scratch-paint', 'packages/paint'],
    ['scratch-render', 'packages/render'],
    ['scratch-render-fonts', 'packages/render-fonts'],
    ['scratch-storage', 'packages/storage'],
    ['scratch-svg-renderer', 'packages/svg-renderer'],
    ['scratch-vm', 'packages/vm']
];

const packagerLinks = [
    ['pmp-protobuf', 'packages/pmp-protobuf'],
    ['scratch-audio', 'packages/audio'],
    ['scratch-render', 'packages/render'],
    ['scratch-render-fonts', 'packages/render-fonts'],
    ['scratch-storage', 'packages/storage'],
    ['scratch-svg-renderer', 'packages/svg-renderer'],
    ['scratch-vm', 'packages/vm']
];

const linkModuleSet = (appPath, mappings) => {
    const appDirectory = path.join(repoRoot, appPath);
    const nodeModulesDirectory = path.join(appDirectory, 'node_modules');

    if (!existsSync(appDirectory)) {
        throw new Error(`Expected app directory to exist: ${appDirectory}`);
    }

    ensureDirectory(nodeModulesDirectory);

    for (const [moduleName, relativeTarget] of mappings) {
        const targetPath = path.join(repoRoot, relativeTarget);
        const linkPath = path.join(nodeModulesDirectory, ...moduleName.split('/'));

        if (!existsSync(targetPath)) {
            throw new Error(`Expected local package to exist: ${targetPath}`);
        }

        if (moduleName === 'scratch-blocks') {
            const requiredGeneratedEntrypoint = path.join(targetPath, 'blockly_compressed_vertical.js');
            if (!existsSync(requiredGeneratedEntrypoint)) {
                console.log(
                    `skipping ${moduleName}; local package is missing generated Blockly entrypoints like ${path.relative(repoRoot, requiredGeneratedEntrypoint)}`
                );
                continue;
            }
        }

        replaceWithJunction(targetPath, linkPath);
        console.log(`linked ${moduleName} -> ${path.relative(repoRoot, targetPath)}`);
    }
};

linkModuleSet(path.join('apps', 'editor'), editorLinks);
linkModuleSet(path.join('apps', 'packager'), packagerLinks);
