import { execSync } from 'node:child_process';
import {
    copyFileSync,
    cpSync,
    existsSync,
    mkdirSync,
    rmSync
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const homeDir = path.join(repoRoot, 'apps', 'home');
const outputRoot = process.env.DEVCORE_OUTPUT_DIR
    ? path.resolve(repoRoot, process.env.DEVCORE_OUTPUT_DIR)
    : process.cwd() === homeDir
        ? path.join(homeDir, 'dist', 'vercel')
        : path.join(repoRoot, 'dist', 'vercel');
const npmRunner = process.env.npm_execpath
    ? `"${process.execPath}" "${process.env.npm_execpath}"`
    : 'npm';

const runNpm = (args, env = {}, cwd = repoRoot) => {
    console.log(`\n> npm ${args.join(' ')}`);
    execSync(`${npmRunner} ${args.join(' ')}`, {
        cwd,
        stdio: 'inherit',
        env: {
            ...process.env,
            ...env
        }
    });
};

const resetDirectory = directory => {
    rmSync(directory, { recursive: true, force: true });
    mkdirSync(directory, { recursive: true });
};

const copyDirectory = (source, target) => {
    if (!existsSync(source)) return;
    cpSync(source, target, { recursive: true });
};

const copyFile = (source, target) => {
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(source, target);
};

resetDirectory(outputRoot);

const editorDir = path.join(repoRoot, 'apps', 'editor');
const packagerDir = path.join(repoRoot, 'apps', 'packager');

runNpm(['install', '--workspaces=false', '--legacy-peer-deps'], {}, homeDir);
runNpm(['install', '--workspaces=false', '--legacy-peer-deps'], {}, editorDir);
runNpm(['install', '--workspaces=false', '--legacy-peer-deps'], {}, packagerDir);

runNpm(['run', 'build'], {}, homeDir);
runNpm(['run', 'build'], {}, packagerDir);
runNpm(['run', 'build'], { ROOT: '/editor/' }, editorDir);

const homeOutput = path.join(repoRoot, 'apps', 'home', 'public');
const editorOutput = path.join(repoRoot, 'apps', 'editor', 'build');
const packagerOutput = path.join(repoRoot, 'apps', 'packager', 'dist');

copyDirectory(homeOutput, outputRoot);
copyDirectory(packagerOutput, path.join(outputRoot, 'packager'));
copyDirectory(editorOutput, path.join(outputRoot, 'editor'));

copyFile(path.join(editorOutput, 'editor.html'), path.join(outputRoot, 'editor', 'index.html'));
copyFile(path.join(editorOutput, 'index.html'), path.join(outputRoot, 'player', 'index.html'));
