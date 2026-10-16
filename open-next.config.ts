import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

/*
 * Every page is built ahead of time (the hourly rebuild brings in new
 * listings), so prerendered pages are read from the Worker's static assets:
 * no R2, KV or queue needed.
 */
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
