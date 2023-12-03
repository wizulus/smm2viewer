/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.conf > pwa > workboxPluginMode is set to "InjectManifest"
 */

import { precache, cleanupOutdatedCaches } from 'workbox-precaching'
import { setCacheNameDetails, clientsClaim } from 'workbox-core'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'

const pillCss = (bg, fg) => `background: ${bg}; color: ${fg}; border-radius: 0.5em; color: white; font-weight: bold; padding: 2px 0.5em;`
const log = (...args) => console.log('%cService Worker', pillCss('green', 'white'), ...args)
const error = (...args) => console.log('%cService Worker', pillCss('red', 'white'), ...args)

setCacheNameDetails({
  prefix: 'wizulus-smm',
  suffix: 'cache',
  precache: 'precache',
  runtime: 'runtime',
  googleAnalytics: 'ga'
})

const cacheFirst = new CacheFirst()
const networkFirst = new NetworkFirst()

clientsClaim() // Take over existing windows

precache(
  [
    ...self.__WB_MANIFEST
  ]
)
cleanupOutdatedCaches()

self.addEventListener('install', async event => {
  try {
    log('Installed')
    self.skipWaiting()
  } catch (err) {
    error(err)
  }
})

self.addEventListener('activate', async event => {
  try {
    log('Activate')
  } catch (err) {
    error(err)
  }
})

async function handleFetch (event) {
  try {
    const url = new URL(event.request.url)
    const isPageRequest = !url.pathname.split('/').pop().includes('.')

    if (isPageRequest) {
      // Always handle page requests network first, because the HTML would link to updated js and css assets if its a newer version,
      // and check for a new service worker in the background, because the user either just launched the site, or hit refresh.
      await networkFirst.handle({
        event,
        request: event.request
      })
    } else {
      await cacheFirst.handle({
        event,
        request: event.request
      })
    }
  } catch (err) {
    error(err)
  }
}

self.addEventListener('fetch', event => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.waitUntil(handleFetch(event))
  }
})
