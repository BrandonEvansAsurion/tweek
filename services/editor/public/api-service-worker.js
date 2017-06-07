self.importScripts('/socket.io/socket.io.js');

const CACHE_NAME = 'v1';
const urls = {
  IS_LOGGED_IN: '/api/logged-in',
  LOGIN: '/login',
  CACHE: ['/api/keys', '/api/search-index', '/api/types', '/api/context-schema', '/api/tags'],
};
const notificationTypes = {
  LOGIN: 'LOGIN',
};

function getUrl(request) {
  const url = new URL(request.url).pathname;
  return url.replace(/\/$/, '');
}

async function testLogin(request) {
  const response = await fetch(request);
  if (response.status === 403 && Notification.permission === 'granted') {
    self.registration.showNotification('Login expired\nPlease log in again', {
      icon: '/tweek.png',
      requireInteraction: true,
      tag: notificationTypes.LOGIN,
    });
  }

  return response;
}

async function refresh() {
  console.log('refreshing cache...');

  if (!testLogin(urls.IS_LOGGED_IN).ok) return;

  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(urls.CACHE);

  console.log('cache refreshed');
}

async function redirectToLogin() {
  await self.clients.claim();
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((client) => {
    if ('navigate' in client) {
      client.navigate(urls.LOGIN);
    }
  });
}

async function install() {
  const socket = io(self.origin, { jsonp: false });
  socket.on('connect', () => console.log('connected to socket'));
  socket.on('refresh', () => {
    console.log('refreshing cache...');
    refresh().catch(error => console.error('error while refreshing cache', error));
  });

  try {
    await refresh();
  } catch (error) {
    console.error('error while loading cache', error);
  }

  self.skipWaiting();
}

async function activate() {
  const cache = await caches.open(CACHE_NAME);
  const cachedKeys = await cache.keys();
  const urlsToCacheSet = new Set(urls.CACHE);
  const keysToDelete = cachedKeys.filter(key => !urlsToCacheSet.has(getUrl(key)));
  await Promise.all(
    keysToDelete.map(key => (console.log('deleting from cache', key.url), cache.delete(key))),
  );
  self.clients.claim();
}

async function loadFromCache(originalRequest) {
  const cache = await caches.open(CACHE_NAME);
  const url = getUrl(originalRequest);

  const shouldCache = urls.CACHE.includes(url);
  const request = new Request(originalRequest.url.replace(/\/$/, ''));

  if (shouldCache) {
    const match = await cache.match(request);
    if (match) return match;
  }
  const response = testLogin(originalRequest);
  if (shouldCache && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function handleNotification(notification) {
  switch (notification.tag) {
  case notificationTypes.LOGIN:
    await redirectToLogin();
    break;
  default:
    break;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(install());
});

self.addEventListener('activate', (events) => {
  events.waitUntil(activate());
});

self.addEventListener('fetch', (event) => {
  if ('GET' === event.request.method) {
    event.respondWith(loadFromCache(event.request));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(handleNotification(event.notification));
});
