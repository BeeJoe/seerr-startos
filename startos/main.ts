import { FileHelper } from '@start9labs/start-sdk'
import { sdk } from './sdk'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import {
  addArrMount,
  arrAddress,
  configMounts,
  jellyfinAddress,
  jellyfinSettings,
  maintain,
  ready,
  uiPort,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  const store = await storeJson.read().const(effects)
  if (!store?.jellyfinConfigured || !store.adminPassword)
    throw new Error(i18n('Complete the setup actions before starting Seerr.'))
  const address = await jellyfinAddress(effects).const()
  const radarrAddress = store.radarr
    ? await arrAddress(effects, 'radarr').const()
    : null
  const sonarrAddress = store.sonarr
    ? await arrAddress(effects, 'sonarr').const()
    : null
  let mounts = configMounts()
  if (store.radarr && radarrAddress) mounts = addArrMount(mounts, 'radarr')
  if (store.sonarr && sonarrAddress) mounts = addArrMount(mounts, 'sonarr')
  const sub = sdk.SubContainer.of(
    effects,
    { imageId: 'seerr' },
    mounts,
    'seerr-sub',
  )
  const radarrKey =
    store.radarr && radarrAddress
      ? await FileHelper.string(await sub.subpath('/mnt/radarr/api-key'))
          .read()
          .const(effects)
      : null
  const sonarrKey =
    store.sonarr && sonarrAddress
      ? await FileHelper.string(await sub.subpath('/mnt/sonarr/api-key'))
          .read()
          .const(effects)
      : null
  await maintain(effects, {
    mode: 'reconcile',
    address,
    email: store.email,
    adminPassword: store.adminPassword,
    radarr: store.radarr
      ? { ...store.radarr, address: radarrAddress, apiKey: radarrKey?.trim() }
      : null,
    sonarr: store.sonarr
      ? { ...store.sonarr, address: sonarrAddress, apiKey: sonarrKey?.trim() }
      : null,
  })
  await sub.writeFile('/app/startos-root-ca.crt', await sdk.getRootCa(effects))
  return sdk.Daemons.of(effects)
    .addDaemon('primary', {
      subcontainer: sub,
      exec: {
        command: sdk.useEntrypoint(),
        env: {
          HOST: '::',
          PORT: String(uiPort),
          TZ: 'Etc/UTC',
          NODE_EXTRA_CA_CERTS: '/app/startos-root-ca.crt',
          NEXT_TELEMETRY_DISABLED: '1',
        },
      },
      ready: {
        display: i18n('Web Interface'),
        gracePeriod: 60000,
        fn: () => ready(`http://127.0.0.1:${uiPort}/api/v1/settings/public`),
      },
      requires: [],
    })
    .addHealthCheck('jellyfin', {
      ready: {
        display: i18n('Jellyfin Connection'),
        fn: async () => {
          const key = await jellyfinSettings
            .read((s) => s.jellyfin.apiKey)
            .once()
          return ready(address && key ? `http://${address}/System/Info` : '', {
            Authorization: `MediaBrowser Client="Seerr", Device="StartOS Health", DeviceId="seerr-health", Version="1", Token="${key ?? ''}"`,
          })
        },
      },
      requires: ['primary'],
    })
})
