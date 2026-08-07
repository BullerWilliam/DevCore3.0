import { execSync } from 'node:child_process';
import {
    copyFileSync,
    cpSync,
    existsSync,
    mkdirSync,
    readFileSync,
    rmSync,
    writeFileSync
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const homeDir = path.join(repoRoot, 'apps', 'home');
const checkedInOutputDir = path.join(homeDir, 'vercel-output');
const outputRoot = process.env.DEVCORE_OUTPUT_DIR
    ? path.resolve(repoRoot, process.env.DEVCORE_OUTPUT_DIR)
    : process.cwd() === homeDir
        ? path.join(homeDir, 'dist', 'vercel')
        : path.join(repoRoot, 'dist', 'vercel');
const rebuildLegacyApps = process.env.DEVCORE_REBUILD_LEGACY_APPS === '1';
const skipInstalls = process.env.DEVCORE_SKIP_INSTALLS === '1';
const skipHomeBuild = process.env.DEVCORE_SKIP_HOME_BUILD === '1';
const npmExecPath = process.env.npm_execpath;
const npmRunner = npmExecPath
    ? path.extname(npmExecPath).toLowerCase() === '.cmd'
        ? `"${npmExecPath}"`
        : `"${process.execPath}" "${npmExecPath}"`
    : process.platform === 'win32'
        ? 'npm.cmd'
        : 'npm';
const packageManagerName = path.basename(npmExecPath || npmRunner).toLowerCase();
const usingPnpm = packageManagerName.includes('pnpm');

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

const installApp = cwd => {
    if (skipInstalls) {
        console.log(`\n> skipping install in ${path.relative(repoRoot, cwd) || '.'}`);
        return;
    }

    const args = usingPnpm
        ? ['install', '--strict-peer-dependencies=false', '--no-frozen-lockfile']
        : ['install', '--workspaces=false', '--legacy-peer-deps'];
    runNpm(args, {}, cwd);
};

const runNodeScript = scriptPath => {
    console.log(`\n> node ${scriptPath}`);
    execSync(`"${process.execPath}" "${path.join(repoRoot, scriptPath)}"`, {
        cwd: repoRoot,
        stdio: 'inherit',
        env: process.env
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

const rewriteTextFile = (relativePath, transform) => {
    const filePath = path.join(outputRoot, relativePath);
    const current = readFileSync(filePath, 'utf8');
    const next = transform(current);
    if (next !== current) {
        writeFileSync(filePath, next, 'utf8');
    }
};

const copyHtmlRoute = (sourceRelativePath, targetRoutePath, replacer) => {
    const targetRelativePath = path.join(targetRoutePath, 'index.html');
    copyFile(path.join(outputRoot, sourceRelativePath), path.join(outputRoot, targetRelativePath));
    if (replacer) {
        rewriteTextFile(targetRelativePath, replacer);
    }
};

resetDirectory(outputRoot);

const editorDir = path.join(repoRoot, 'apps', 'editor');
const packagerDir = path.join(repoRoot, 'apps', 'packager');

installApp(homeDir);
if (skipHomeBuild) {
    console.log('\n> skipping home build');
} else {
    runNpm(['run', 'build'], {}, homeDir);
}

const homeOutput = path.join(repoRoot, 'apps', 'home', 'public');
const editorOutput = path.join(repoRoot, 'apps', 'editor', 'build');
const packagerOutput = path.join(repoRoot, 'apps', 'packager', 'dist');

copyDirectory(checkedInOutputDir, outputRoot);
copyDirectory(homeOutput, outputRoot);
copyHtmlRoute('mystuff.html', 'mystuff', content => content.replaceAll('="./', '="/'));
copyHtmlRoute('settings.html', 'settings', content => content.replaceAll('="./', '="/'));
copyHtmlRoute('profile.html', 'profile', content => content.replaceAll('="./', '="/'));
copyHtmlRoute('privacy.html', 'privacy', content => content.replaceAll('="./', '="/'));
copyHtmlRoute('terms.html', 'terms', content => content.replaceAll('="./', '="/'));
copyHtmlRoute('support.html', 'support', content => content.replaceAll('="./', '="/'));
copyHtmlRoute(
    path.join('guidelines', 'uploading.html'),
    path.join('guidelines', 'uploading'),
    content => content.replaceAll('"../', '"/')
);
for (const relativePath of [
    path.join('editor', 'editor.html'),
    path.join('editor', 'embed.html'),
    path.join('editor', 'fullscreen.html'),
    path.join('editor', 'index.html'),
    path.join('editor', 'playground.html'),
    path.join('player', 'index.html')
]) {
    rewriteTextFile(relativePath, content => content.replaceAll('./penguinmod.github.io/favicon.ico', '/favicon.ico'));
}

if (rebuildLegacyApps) {
    const sharedPackageDirs = [
        'packages/api-module',
        'packages/markdown',
        'packages/parser',
        'packages/pmp-protobuf',
        'packages/audio',
        'packages/render-fonts',
        'packages/svg-renderer',
        'packages/render',
        'packages/storage',
        'packages/vm'
    ].map(packagePath => path.join(repoRoot, packagePath));

    for (const packageDir of sharedPackageDirs) {
        installApp(packageDir);
    }
    installApp(editorDir);
    installApp(packagerDir);
    runNodeScript('scripts/repair-legacy-install.mjs');
    runNpm(['run', 'build'], {}, packagerDir);
    runNpm(['run', 'build'], { ROOT: '/editor/' }, editorDir);

    copyDirectory(packagerOutput, path.join(outputRoot, 'packager'));
    copyDirectory(editorOutput, path.join(outputRoot, 'editor'));
    copyFile(path.join(editorOutput, 'editor.html'), path.join(outputRoot, 'editor', 'index.html'));
    copyFile(path.join(editorOutput, 'index.html'), path.join(outputRoot, 'player', 'index.html'));
}
