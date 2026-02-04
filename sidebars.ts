/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check
import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

const sidebars: SidebarsConfig = {
  // Main documentation sidebar
  docsSidebar: [
    {
      type: 'doc',
      id: 'getting-started',
      label: 'Getting Started'
    },
    {
      type: 'doc',
      id: 'authentication',
      label: 'Authentication'
    },
    {
      type: 'doc',
      id: 'websocket',
      label: 'WebSocket Streams'
    },
    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      items: [
        'guides/place-order',
        'guides/positions'
      ]
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: false,
      items: [
        'errors',
        'faq',
        'changelog'
      ]
    }
  ],
  // API Reference sidebar
  openApiSidebar: [
    {
      type: 'category',
      label: 'API Reference',
      link: {
        type: 'generated-index',
        title: 'Bitzoom Futures API',
        description:
          'Complete API reference for the Bitzoom Futures trading platform. Includes endpoints for market data, trading, account management, and wallet operations.',
        slug: '/category/bitzoom-api'
      },
      items: require('./docs/bitzoom/sidebar.js')
    },
    {
      type: 'category',
      label: 'WebSocket Testing',
      collapsed: false,
      items: [
        'websocket-playground',
        'websocket-test/ticker',
        'websocket-test/openorders'
      ]
    }
  ]
}

export default sidebars
