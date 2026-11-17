import { utils } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { i18n } from '../i18n'
import { storeJson } from '../fileModels/store.json'
import { maintain } from '../utils'

export const setAdminPassword = sdk.Action.withoutInput(
  'set-admin-password',
  async ({ effects }) => ({
    name: i18n('Set Admin Password'),
    description: i18n(
      'Generate a new random password for the Seerr owner. This does not change your Jellyfin password.',
    ),
    warning: (await storeJson.read((s) => s.adminPassword).const(effects))
      ? i18n('Replaces the current Seerr admin password.')
      : null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  async ({ effects }) => {
    const store = await storeJson.read().once()
    if (!store?.jellyfinConfigured || !store.email)
      throw new Error(i18n('Connect Jellyfin first.'))
    const adminPassword = utils.getDefaultString({
      charset: 'a-z,A-Z,0-9',
      len: 32,
    })
    await maintain(effects, { mode: 'password', password: adminPassword })
    await storeJson.merge(effects, { adminPassword })
    return {
      version: '1',
      title: i18n('Login Credentials'),
      message: i18n('Save this password and use it to sign in to Seerr.'),
      result: {
        type: 'group',
        value: [
          {
            type: 'single',
            name: i18n('Email'),
            description: null,
            value: store.email,
            masked: false,
            copyable: true,
            qr: false,
            launchable: false,
          },
          {
            type: 'single',
            name: i18n('Password'),
            description: null,
            value: adminPassword,
            masked: true,
            copyable: true,
            qr: false,
            launchable: false,
          },
        ],
      },
    }
  },
)
