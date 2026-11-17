import { sdk } from '../sdk'
import { connectJellyfin } from './connectJellyfin'
import { setAdminPassword } from './setAdminPassword'
import { connectRadarr, connectSonarr } from './connectArr'

export const actions = sdk.Actions.of()
  .addAction(connectJellyfin)
  .addAction(setAdminPassword)
  .addAction(connectRadarr)
  .addAction(connectSonarr)
