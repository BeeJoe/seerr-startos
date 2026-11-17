import { z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { i18n } from '../i18n'
import { storeJson } from '../fileModels/store.json'
import { ArrId, readArr } from '../utils'

const profilesShape = z.array(
  z.looseObject({ id: z.number(), name: z.string() }),
)
const rootsShape = z.array(z.looseObject({ path: z.string() }))

function connectionAction(id: ArrId) {
  return sdk.Action.withInput(
    `connect-${id}`,
    {
      name: id === 'radarr' ? i18n('Connect Radarr') : i18n('Connect Sonarr'),
      description: i18n(
        'Enable or disable the local connection. Choose an existing quality profile and root folder; the API key is provided automatically. Changes restart Seerr.',
      ),
      warning: null,
      allowedStatuses: 'any',
      group: null,
      visibility: 'enabled',
    },
    async ({ effects }) => {
      const stored = await storeJson.read((s) => s[id]).once()
      const profiles: Record<string, string> = stored
        ? { [stored.profileId]: stored.profileName }
        : {}
      const roots: Record<string, string> = stored
        ? { [stored.rootFolder]: stored.rootFolder }
        : {}
      try {
        const client = await readArr(effects, id)
        const [p, r] = await Promise.all([
          client.get('qualityprofile'),
          client.get('rootfolder'),
        ])
        for (const profile of profilesShape.parse(p))
          profiles[String(profile.id)] = profile.name
        for (const root of rootsShape.parse(r)) roots[root.path] = root.path
      } catch {}
      return sdk.InputSpec.of({
        connection: sdk.Value.union({
          name: i18n('Connection'),
          default: 'disabled',
          variants: sdk.Variants.of({
            disabled: { name: i18n('Disabled'), spec: sdk.InputSpec.of({}) },
            enabled: {
              name: i18n('Enabled'),
              spec: sdk.InputSpec.of({
                profileId: sdk.Value.select({
                  name: i18n('Quality Profile'),
                  values: profiles,
                  default: Object.keys(profiles)[0] ?? null,
                }),
                rootFolder: sdk.Value.select({
                  name: i18n('Root Folder'),
                  values: roots,
                  default: Object.keys(roots)[0] ?? null,
                }),
              }),
            },
          }),
        }),
      })
    },
    async () => {
      const stored = await storeJson.read((s) => s[id]).once()
      return {
        connection: stored
          ? {
              selection: 'enabled' as const,
              value: {
                profileId: String(stored.profileId),
                rootFolder: stored.rootFolder,
              },
            }
          : { selection: 'disabled' as const, value: {} },
      }
    },
    async ({ effects, input: { connection } }) => {
      if (connection.selection === 'disabled') {
        await storeJson.merge(effects, { [id]: null })
      } else {
        const client = await readArr(effects, id)
        const [p, r] = await Promise.all([
          client.get('qualityprofile'),
          client.get('rootfolder'),
        ])
        const profile = profilesShape
          .parse(p)
          .find((p) => String(p.id) === connection.value.profileId)
        const root = rootsShape
          .parse(r)
          .find((r) => r.path === connection.value.rootFolder)
        if (!profile || !root)
          throw new Error(
            i18n(
              'Create a root folder and quality profile in the selected service, then reopen this action.',
            ),
          )
        await storeJson.merge(effects, {
          [id]: {
            profileId: profile.id,
            profileName: profile.name,
            rootFolder: root.path,
          },
        })
      }
      return {
        version: '1',
        title: i18n('Connection Saved'),
        message: i18n('The connection will be applied when Seerr starts.'),
        result: null,
      }
    },
  )
}

export const connectRadarr = connectionAction('radarr')
export const connectSonarr = connectionAction('sonarr')
