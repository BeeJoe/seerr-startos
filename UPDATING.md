# Updating Seerr

1. Read the latest stable release at https://github.com/seerr-team/seerr/releases. Review its migration instructions and security fixes.
2. Confirm the exact `ghcr.io/seerr-team/seerr:vX.Y.Z` tag exists and its manifest includes linux/amd64 and linux/arm64. Update `images.seerr.source.dockerTag` in `startos/manifest/index.ts`.
3. Review the pinned release’s `server/routes/auth.ts`, `server/entity/User.ts`, `server/lib/settings/index.ts`, `server/api/jellyfin.ts`, and database migration setup against the maintenance program in `startos/utils.ts`. That program calls the image’s compiled modules directly; module paths and account fields must still match.
4. Update `startos/versions/current.ts` and translated release notes. Keep one version file unless the preceding version carries a package migration.
5. Check the current SDK with `npm view @start9labs/start-sdk version`; update the pin and lockfile if needed. Dependency source commits are pinned in `package.json`; update them only after checking their host, port, health, and public-key contracts and adjusting version floors.
6. Build both architectures. On a disposable StartOS server, verify fresh setup, non-admin Jellyfin rejection, local and Jellyfin login, password rotation, library synchronization, Radarr and Sonarr connection/disconnection, real requests, restart persistence, backup/restore, and uninstall/reinstall. Verify reconnection after an address or exported API-key change, and that repeated starts create neither duplicate managed servers nor extra Jellyfin API keys.
