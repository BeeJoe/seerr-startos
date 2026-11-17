import { i18n } from './i18n'
import { sdk } from './sdk'
import { storeJson } from './fileModels/store.json'

export const dependencies = sdk.Dependencies.of()
  .addDependency(
    sdk.Dependency.required('jellyfin', {
      description: i18n('Provides media libraries and user authentication.'),
      metadata: {
        title: 'Jellyfin',
        icon: 'https://raw.githubusercontent.com/Start9Labs/jellyfin-startos/c7de440424083f7305d9197d6f0dd44bb863713c/icon.svg',
      },
      versionRange: '>=12.4:4',
      kind: 'running',
      healthChecks: ['primary'],
    }),
  )
  .addDependency(
    sdk.Dependency.optional('radarr', {
      description: i18n('Handles movie requests.'),
      metadata: {
        title: 'Radarr',
        icon: 'https://raw.githubusercontent.com/Start9Labs/radarr-startos/2808a06e7bdd1943ca8b5d04a72fe66b27b31cf5/icon.svg',
      },
      versionRange: '>=6.4.4.10685:7',
      kind: 'running',
      healthChecks: ['primary'],
      enabled: async ({ effects }) =>
        !!(await storeJson.read((s) => s.radarr).const(effects)),
    }),
  )
  .addDependency(
    sdk.Dependency.optional('sonarr', {
      description: i18n('Handles television requests.'),
      metadata: {
        title: 'Sonarr',
        icon: 'https://raw.githubusercontent.com/Start9Labs/sonarr-startos/37d0a2373eb2418cf308dbd4bf3aa22d08e1b42f/icon.svg',
      },
      versionRange: '>=4.0.20.3014:9',
      kind: 'running',
      healthChecks: ['primary'],
      enabled: async ({ effects }) =>
        !!(await storeJson.read((s) => s.sonarr).const(effects)),
    }),
  )
