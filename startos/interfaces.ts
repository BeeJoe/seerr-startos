import { sdk } from './sdk'
import { i18n } from './i18n'
import { uiHostId, uiPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const origin = await sdk.MultiHost.of(effects, uiHostId).bindPort(uiPort, {
    protocol: 'http',
  })
  return [
    await origin.export([
      sdk.createInterface(effects, {
        name: i18n('Web Interface'),
        id: 'ui',
        description: i18n('Media discovery, requests, and administration.'),
        type: 'ui',
        masked: false,
        schemeOverride: null,
        username: null,
        path: '',
        query: {},
      }),
    ]),
  ]
})
