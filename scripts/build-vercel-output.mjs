import { execSync } from 'node:child_process';
import {
    copyFileSync,
    cpSync,
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    rmSync,
    writeFileSync
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

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

const installApp = (cwd, {
    ignoreScripts = false,
    extraArgs = []
} = {}) => {
    if (skipInstalls) {
        console.log(`\n> skipping install in ${path.relative(repoRoot, cwd) || '.'}`);
        return;
    }

    const args = usingPnpm
        ? ['install', '--strict-peer-dependencies=false', '--no-frozen-lockfile']
        : ['install', '--workspaces=false', '--legacy-peer-deps'];
    if (ignoreScripts) {
        args.push('--ignore-scripts');
    }
    args.push(...extraArgs);
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

const runWebpackBuild = (cwd, env = {}, {
    args = [],
    cleanDirectory = null
} = {}) => {
    const candidatePaths = [
        path.join(cwd, 'node_modules', 'webpack-cli', 'bin', 'cli.js'),
        path.join(cwd, 'node_modules', 'webpack', 'bin', 'webpack.js')
    ];
    const cliPath = candidatePaths.find(candidate => existsSync(candidate));

    if (!cliPath) {
        throw new Error(`Could not find a local webpack entrypoint in ${cwd}`);
    }

    if (cleanDirectory) {
        rmSync(cleanDirectory, { recursive: true, force: true });
    }

    console.log(`\n> webpack ${args.join(' ')}`.trim());
    execSync(`"${process.execPath}" "${cliPath}" ${args.join(' ')}`.trim(), {
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

const writeOutputFile = (relativePath, content) => {
    const target = path.join(outputRoot, relativePath);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content, 'utf8');
};

const writeOutputJson = (relativePath, data) => {
    writeOutputFile(relativePath, JSON.stringify(data, null, 2));
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
const docsDir = path.join(repoRoot, 'apps', 'docs');
const extensionsGalleryDir = path.join(repoRoot, 'apps', 'extensions-gallery');
const packagerDir = path.join(repoRoot, 'apps', 'packager');

installApp(homeDir);
installApp(docsDir);
installApp(extensionsGalleryDir);
if (skipHomeBuild) {
    console.log('\n> skipping home build');
} else {
    runNpm(['run', 'build'], {}, homeDir);
}
runNpm([
    'run',
    'build'
], {
    DEVCORE_DOCS_BASE_URL: '/docs/',
    DEVCORE_DOCS_URL: 'https://dev-core-xi.vercel.app'
}, docsDir);
runNpm([
    'run',
    'build'
], {
    DEVCORE_EXTENSIONS_BASE_PATH: '/extensions-gallery'
}, extensionsGalleryDir);

const homeOutput = path.join(repoRoot, 'apps', 'home', 'public');
const docsOutput = path.join(repoRoot, 'apps', 'docs', 'build');
const extensionsGalleryOutput = path.join(repoRoot, 'apps', 'extensions-gallery', 'public');
const editorOutput = path.join(repoRoot, 'apps', 'editor', 'build');
const packagerOutput = path.join(repoRoot, 'apps', 'packager', 'dist');
const frontpageMirrorPath = path.join(
    homeDir,
    'src',
    'lib',
    'content',
    'dev-panel',
    'homepage-frontpage.json'
);
const homepageOwnedProfileCatalogModuleUrl = pathToFileURL(
    path.join(homeDir, 'src', 'lib', 'content', 'dev-panel', 'owned-profile-catalog.js')
).href;
const homepageBasicApiModuleUrl = pathToFileURL(
    path.join(homeDir, 'src', 'lib', 'content', 'dev-panel', 'homepage-basic-api.js')
).href;
const homepageFrontpage = JSON.parse(readFileSync(frontpageMirrorPath, 'utf8'));
const { buildOwnedProfileCatalog } = await import(homepageOwnedProfileCatalogModuleUrl);
const { default: homepageBasicApi } = await import(homepageBasicApiModuleUrl);
const ownedProfileCatalog = buildOwnedProfileCatalog(homepageFrontpage);

copyDirectory(checkedInOutputDir, outputRoot);
copyDirectory(homeOutput, outputRoot);
copyDirectory(docsOutput, path.join(outputRoot, 'docs'));
copyDirectory(extensionsGalleryOutput, path.join(outputRoot, 'extensions-gallery'));
copyDirectory(path.join(extensionsGalleryOutput, 'extensions'), path.join(outputRoot, 'extensions'));
copyFile(frontpageMirrorPath, path.join(outputRoot, 'api', 'v1', 'projects', 'frontpage'));
writeOutputJson(path.join('basic-api', 'status'), homepageBasicApi.status);
writeOutputJson(path.join('basic-api', 'updates'), homepageBasicApi.updates);
writeOutputJson(path.join('basic-api', 'commits'), homepageBasicApi.commits);
writeOutputJson(path.join('api', 'v1', 'devcore', 'profiles', 'index.json'), ownedProfileCatalog.metadata);
for (const [username, profile] of Object.entries(ownedProfileCatalog.profilesByUsername)) {
    writeOutputJson(path.join('api', 'v1', 'devcore', 'profiles', `${username}.json`), profile);
}
copyHtmlRoute(
    path.join('extensions-gallery', 'load.html'),
    path.join('extensions-gallery', 'load')
);
copyHtmlRoute(
    path.join('extensions-gallery', 'docs.html'),
    path.join('extensions-gallery', 'docs')
);
for (const entry of readdirSync(path.join(outputRoot, 'extensions-gallery', 'docs'), { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;

    const slug = path.basename(entry.name, '.html');
    if (slug === 'index') continue;
    copyHtmlRoute(
        path.join('extensions-gallery', 'docs', entry.name),
        path.join('extensions-gallery', 'docs', slug)
    );
}
copyHtmlRoute('mystuff.html', 'mystuff', content => content.replaceAll('="./', '="/'));
copyHtmlRoute('settings.html', 'settings', content => content.replaceAll('="./', '="/'));
copyHtmlRoute('profile.html', 'profile', content => content.replaceAll('="./', '="/'));
copyHtmlRoute('privacy.html', 'privacy', content => content.replaceAll('="./', '="/'));
copyHtmlRoute('terms.html', 'terms', content => content.replaceAll('="./', '="/'));
copyHtmlRoute('support.html', 'support', content => content.replaceAll('="./', '="/'));
copyHtmlRoute('contact.html', 'contact', content => content.replaceAll('="./', '="/'));
copyHtmlRoute('credits.html', 'credits', content => content.replaceAll('="./', '="/'));
copyHtmlRoute('dev-panel.html', 'dev-panel', content => content.replaceAll('="./', '="/'));
copyHtmlRoute('forgotpassword.html', 'forgotpassword', content => content.replaceAll('="./', '="/'));
copyHtmlRoute('signin.html', 'signin', content => content.replaceAll('="./', '="/'));
copyHtmlRoute('signup.html', 'signup', content => content.replaceAll('="./', '="/'));
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
        'packages/blocks',
        'packages/paint',
        'packages/render-fonts',
        'packages/svg-renderer',
        'packages/render',
        'packages/storage',
        'packages/vm'
    ].map(packagePath => path.join(repoRoot, packagePath));

    for (const packageDir of sharedPackageDirs) {
        installApp(packageDir, { ignoreScripts: true });
    }
    installApp(editorDir, {
        extraArgs: usingPnpm ? [] : ['--install-strategy=nested']
    });
    installApp(packagerDir, {
        extraArgs: usingPnpm ? [] : ['--install-strategy=nested']
    });
    runNodeScript('scripts/repair-legacy-install.mjs');
    runWebpackBuild(packagerDir, {}, {
        cleanDirectory: packagerOutput
    });
    runWebpackBuild(editorDir, {
        NODE_OPTIONS: '--openssl-legacy-provider',
        ROOT: '/editor/'
    }, {
        args: ['--colors', '--bail'],
        cleanDirectory: editorOutput
    });

    copyDirectory(packagerOutput, path.join(outputRoot, 'packager'));
    copyDirectory(editorOutput, path.join(outputRoot, 'editor'));
    copyFile(path.join(editorOutput, 'editor.html'), path.join(outputRoot, 'editor', 'index.html'));
    copyFile(path.join(editorOutput, 'index.html'), path.join(outputRoot, 'player', 'index.html'));
}
