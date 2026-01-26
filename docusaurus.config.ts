// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import type * as Preset from '@docusaurus/preset-classic'
import type { Config } from '@docusaurus/types'
import type * as Plugin from '@docusaurus/types/src/plugin'
import type * as OpenApiPlugin from 'docusaurus-plugin-openapi-docs'

const config: Config = {
  title: 'Bitzoom API Docs',
  tagline: 'Bitzoom futures API documentation',
  url: 'https://bitzoom-futures.github.io',
  baseUrl: '/futures.doc/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'bitzoom-futures', // Usually your GitHub org/user name.
  projectName: 'futures.doc', // Usually your repo name.
  trailingSlash: false,

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.ts'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/bitzoom-futures/futures.doc/tree/main/',
          docItemComponent: '@theme/ApiItem' // Derived from docusaurus-theme-openapi
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/bitzoom-futures/futures.doc/tree/main/',
          onInlineAuthors: 'ignore',
          onUntruncatedBlogPosts: 'ignore'
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      } satisfies Preset.Options
    ]
  ],

  themeConfig: {
    api: {
      // proxy: 'https://cors.pan.dev', // Site-wide proxy (can be overridden per-spec in plugin config)
      authPersistance: 'localStorage',
      requestTimeout: 60000 // 60 seconds
    },
    docs: {
      sidebar: {
        hideable: true
      }
    },
    navbar: {
      title: 'Bitzoom API Docs',
      logo: {
        alt: 'Bitzoom API Docs Logo',
        src: 'img/logo.svg'
      },
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Tutorial'
        },
        { to: '/blog', label: 'Blog', position: 'left' },
        // {
        //   label: 'Petstore API',
        //   position: 'left',
        //   to: '/docs/category/petstore-api'
        // },
        {
          label: 'Bitzoom API',
          position: 'left',
          to: '/docs/category/bitzoom-api'
        },
        {
          href: 'https://github.com/bitzoom-futures/futures.doc',
          label: 'GitHub',
          position: 'right'
        }
      ]
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Tutorial',
              to: '/docs/intro'
            }
          ]
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/bitzoom'
            },
            {
              label: 'Discord',
              href: 'https://discord.gg/bitzoom'
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/bitzoom'
            }
          ]
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog'
            },
            {
              label: 'GitHub',
              href: 'https://github.com/bitzoom-futures/futures.doc'
            }
          ]
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Bitzoom.`
    },
    prism: {
      additionalLanguages: ['ruby', 'csharp', 'php', 'java', 'powershell', 'json', 'bash', 'dart', 'objectivec', 'r']
    },
    languageTabs: [
      {
        highlight: 'bash',
        language: 'curl',
        logoClass: 'curl'
      },
      {
        highlight: 'go',
        language: 'go',
        logoClass: 'go'
      },
      {
        highlight: 'python',
        language: 'python',
        logoClass: 'python'
      },
      {
        highlight: 'csharp',
        language: 'csharp',
        logoClass: 'csharp'
      },
      {
        highlight: 'javascript',
        language: 'nodejs',
        logoClass: 'nodejs'
      },
      {
        highlight: 'ruby',
        language: 'ruby',
        logoClass: 'ruby'
      },
      {
        highlight: 'php',
        language: 'php',
        logoClass: 'php'
      },
      {
        highlight: 'java',
        language: 'java',
        logoClass: 'java',
        variant: 'unirest'
      },
      {
        highlight: 'powershell',
        language: 'powershell',
        logoClass: 'powershell'
      },
      {
        highlight: 'dart',
        language: 'dart',
        logoClass: 'dart'
      },
      {
        highlight: 'javascript',
        language: 'javascript',
        logoClass: 'javascript'
      },
      {
        highlight: 'c',
        language: 'c',
        logoClass: 'c'
      },
      {
        highlight: 'objective-c',
        language: 'objective-c',
        logoClass: 'objective-c'
      },
      {
        highlight: 'ocaml',
        language: 'ocaml',
        logoClass: 'ocaml'
      },
      {
        highlight: 'r',
        language: 'r',
        logoClass: 'r'
      },
      {
        highlight: 'swift',
        language: 'swift',
        logoClass: 'swift'
      },
      {
        highlight: 'kotlin',
        language: 'kotlin',
        logoClass: 'kotlin'
      },
      {
        highlight: 'rust',
        language: 'rust',
        logoClass: 'rust'
      }
    ]
  } satisfies Preset.ThemeConfig,

  plugins: [
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'openapi',
        docsPluginId: 'classic',
        config: {
          // petstore: {
          //   specPath: 'examples/petstore.yaml',
          //   outputDir: 'docs/petstore',
          //   downloadUrl:
          //     'https://raw.githubusercontent.com/PaloAltoNetworks/docusaurus-template-openapi-docs/main/examples/petstore.yaml',
          //   sidebarOptions: {
          //     groupPathsBy: 'tag',
          //     categoryLinkSource: 'tag'
          //   }
          // } satisfies OpenApiPlugin.Options,
          bitzoom: {
            specPath: 'examples/bitzoom.json',
            outputDir: 'docs/bitzoom',
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag'
            }
          } satisfies OpenApiPlugin.Options
        } satisfies Plugin.PluginOptions
      }
    ]
  ],

  themes: ['docusaurus-theme-openapi-docs']
}

export default async function createConfig() {
  return config
}
