import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const connection = z.looseObject({
  profileId: z.number().int().positive(),
  profileName: z.string(),
  rootFolder: z.string(),
})

const shape = z.looseObject({
  jellyfinConfigured: z.boolean().catch(false),
  email: z.string().nullable().catch(null),
  adminPassword: z.string().nullable().catch(null),
  radarr: connection.nullable().catch(null),
  sonarr: connection.nullable().catch(null),
})
export const storeJson = FileHelper.json(
  { base: sdk.volumes.startos, subpath: 'store.json' },
  shape,
)
export type Store = z.infer<typeof shape>
