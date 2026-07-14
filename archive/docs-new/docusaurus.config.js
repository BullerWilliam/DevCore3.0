/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'PenguinMod Documentation',
  url: 'https://docs.penguinmod.site',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  organizationName: 'PenguinMod',
  projectName: 'docs',
  trailingSlash: false,
  themeConfig: {
    navbar: {
      title: 'PenguinMod Documentation',
      items: [
        // {
        //   href: '/packager/',
        //   label: 'Packager',
        //   position: 'left'
        // },
        {
          href: '/development/',
          label: 'Development',
          position: 'left'
        },
        {
          href: 'https://penguinmod.site/',
          label: 'PenguinMod',
          position: 'right'
        },
        {
          href: 'https://github.com/PenguinMod',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    algolia: {
      // This is all supposed to be public
      // idk what this is man ill figure it out later tbh
      appId: 'HORQ9E5CCA',
      apiKey: 'c3873ce4208edb896a31bb3e7c2cbdad',
      indexName: 'turbowarp'
    },
    colorMode: {
      respectPrefersColorScheme: true,
    },
    prism: {
      theme: require('./code-themes/light'),
      darkTheme: require('./code-themes/dark'),
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
          editUrl: 'https://github.com/PenguinMod/PenguinMod-DocsNew/edit/master/',
          breadcrumbs: false,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
