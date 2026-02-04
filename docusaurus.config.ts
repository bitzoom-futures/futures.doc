// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import type * as Preset from '@docusaurus/preset-classic'
import type { Config } from '@docusaurus/types'
import type * as Plugin from '@docusaurus/types/src/plugin'
import type * as OpenApiPlugin from 'docusaurus-plugin-openapi-docs'
import fs from 'fs'
import path from 'path'

const localSearchPlugin: Plugin.PluginConfig | null = (() => {
  try {
    return [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        indexDocs: true,
        indexBlog: false,
        indexPages: false,
        docsRouteBasePath: '/docs',
        language: ['en', 'zh']
      }
    ]
  } catch {
    return null
  }
})()

const gatewayServerUrl: string = (() => {
  try {
    const gatewaySpecPath = path.join(process.cwd(), 'examples', 'bitzoom.gateway.json')
    const spec = JSON.parse(fs.readFileSync(gatewaySpecPath, 'utf8'))
    const url = spec && spec.servers && spec.servers[0] && spec.servers[0].url
    return typeof url === 'string' ? url.replace(/\/+$/, '') : 'http://119.8.50.236:8088'
  } catch {
    return 'http://119.8.50.236:8088'
  }
})()

const config: Config = {
  title: 'Bitzoom API Docs',
  tagline: 'Bitzoom futures API documentation',
  url: 'https://bitzoom-futures.github.io',
  baseUrl: '/futures.doc/',
  onBrokenLinks: 'throw',
  favicon: 'img/icon.png',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn'
    }
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-Hans']
  },
  customFields: {
    gatewayServerUrl
  },

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
          lastVersion: 'current',
          versions: {
            current: {
              label: 'Next'
            }
          },
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
      title: 'Bitzoom API',
      logo: {
        alt: 'Bitzoom API Docs Logo',
        src: 'img/icon.png'
      },
      items: [
        {
          type: 'doc',
          docId: 'getting-started',
          position: 'left',
          label: 'Documentation'
        },
        {
          label: 'API Reference',
          position: 'left',
          to: '/docs/category/bitzoom-api'
        },
        {
          label: 'WebSocket Playground',
          position: 'left',
          to: '/docs/websocket-playground'
        },
        {
          type: 'search',
          position: 'right'
        },
        {
          type: 'docsVersionDropdown',
          position: 'right'
        },
        {
          type: 'localeDropdown',
          position: 'right'
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
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/getting-started'
            },
            {
              label: 'Authentication',
              to: '/docs/authentication'
            },
            {
              label: 'API Reference',
              to: '/docs/category/bitzoom-api'
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
    ...(localSearchPlugin ? [localSearchPlugin] : []),
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
            specPath: 'examples/bitzoom.gateway.json',
            outputDir: 'docs/bitzoom',
            version: 'next',
            label: 'Next',
            baseUrl: '/docs',
            versions: {
              '1.0': {
                specPath: 'examples/bitzoom.gateway.json',
                outputDir: 'versioned_docs/version-1.0/bitzoom',
                label: '1.0',
                baseUrl: '/docs/1.0'
              }
            },
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
