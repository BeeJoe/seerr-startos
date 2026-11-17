import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { connectJellyfin } from '../actions/connectJellyfin'
import { setAdminPassword } from '../actions/setAdminPassword'
import { i18n } from '../i18n'

export const seed = sdk.setupOnInit(async (effects) => {
  await storeJson.merge(effects, {})
})
export const tasks = sdk.setupOnInit(async (effects) => {
  const state = await storeJson
    .read((s) => ({
      configured: s.jellyfinConfigured,
      password: !!s.adminPassword,
    }))
    .const(effects)
  if (!state?.configured) {
    await sdk.action.createOwnTask(effects, connectJellyfin, 'critical', {
      reason: i18n(
        'Connect a Jellyfin administrator account to initialize Seerr.',
      ),
    })
  } else if (!state.password) {
    await sdk.action.createOwnTask(effects, setAdminPassword, 'critical', {
      reason: i18n('Generate the Seerr owner password before starting.'),
    })
  }
})
