import { sdk } from '../sdk'
import { i18n } from '../i18n'
import { storeJson } from '../fileModels/store.json'
import { jellyfinAddress, maintain } from '../utils'

export const connectJellyfin = sdk.Action.withInput(
  'connect-jellyfin',
  {
    name: i18n('Connect Jellyfin'),
    description: i18n(
      'Connect the Jellyfin service on this server using a Jellyfin administrator account. Your Jellyfin password is used only for this connection.',
    ),
    warning: null,
    allowedStatuses: 'only-stopped',
    group: null,
    visibility: 'enabled',
  },
  sdk.InputSpec.of({
    username: sdk.Value.text({
      name: i18n('Jellyfin Username'),
      required: true,
      default: null,
    }),
    password: sdk.Value.text({
      name: i18n('Jellyfin Password'),
      masked: true,
      required: false,
      default: null,
    }),
    email: sdk.Value.text({
      name: i18n('Seerr Login Email'),
      inputmode: 'email',
      required: true,
      default: null,
      patterns: [
        {
          regex: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
          description: i18n('Enter a valid email address.'),
        },
      ],
    }),
  }),
  async () => ({
    username: undefined,
    password: null,
    email: (await storeJson.read((s) => s.email).once()) ?? undefined,
  }),
  async ({ effects, input }) => {
    const address = await jellyfinAddress(effects).once()
    if (!address)
      throw new Error(i18n('Install and start Jellyfin, then try again.'))
    await maintain(effects, {
      mode: 'connect',
      address,
      ...input,
      password: input.password ?? '',
      email: input.email.toLowerCase().trim(),
    })
    await storeJson.merge(effects, {
      jellyfinConfigured: true,
      email: input.email.toLowerCase().trim(),
    })
    return {
      version: '1',
      title: i18n('Jellyfin Connected'),
      message: i18n(
        'Set the Seerr admin password next. Select libraries in Seerr after signing in.',
      ),
      result: null,
    }
  },
)
