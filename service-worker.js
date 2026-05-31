/**
 * Service Worker boilerplate
 * 
 * This service worker has the bare minimum of features required 
 * to qualify for PWA installation. Use this as a starting point
 * to build out your own caching strategy and other PWA features.
 */

let CACHE_VERSION = '0.28';
let MEDIA_CACHE_VERSION = '0.14';
let CACHE_STATIC_NAME = 'static_v'+CACHE_VERSION;
let CACHE_DYNAMIC_NAME = 'dynamic_v'+CACHE_VERSION;
let CACHE_MEDIA_NAME = 'media_v'+MEDIA_CACHE_VERSION;
let AI_QUEUE_URL = '/?playlist=AI%20Queue&autoplay=1';
let cacheFirst = ['getCoverArt.view', 'download.view'];
let precacheUrls = [
	'/',
	'/index.html',
	'/manifest.json',
	'/styles/main.css',
	'/styles/_reset.css',
	'/styles/_layout.css',
	'/styles/_panel.css',
	'/styles/_navigation.css',
	'/styles/_mediaplayer.css',
	'/src/main.js',
	'/src/icons.js',
	'/src/apis/api-howler.js',
	'/src/apis/api-mediasession.js',
	'/src/apis/api-push-notifications.js',
	'/src/apis/api-selma.js',
	'/src/apis/api-subsonic.js',
	'/src/components/media-art.js',
	'/src/components/media-display.js',
	'/src/components/media-player.js',
	'/src/components/media-queue.js',
	'/src/components/media-time.js',
	'/src/components/media_scrubber.js',
	'/src/components/media_volume.js',
	'/src/components/nav-button.js',
	'/src/components/playlists.js',
	'/src/components/search.js',
	'/src/components/selma.js',
	'/src/components/settings.js',
	'/src/controllers/controller-cache.js',
	'/src/controllers/controller-push-notifications.js',
	'/src/controllers/controller-queue.js',
	'/src/controllers/controller-search.js',
	'/src/controllers/controller-selma.js',
	'/src/vendor/@arrow-js/core/index.min.mjs',
	'/src/vendor/@arrow-js/core/index.js',
	'/src/vendor/@arrow-js/core/chunks/internal-DchK7S7v.mjs',
	'/src/vendor/nosleep/index.js',
	'/src/vendor/nosleep/media.js',
	'/assets/icons/icon-72x72.png',
	'/assets/icons/icon-96x96.png',
	'/assets/icons/icon-128x128.png',
	'/assets/icons/icon-144x144.png',
	'/assets/icons/icon-152x152.png',
	'/assets/icons/icon-192x192.png',
	'/assets/icons/icon-384x384.png',
	'/assets/icons/icon-512x512.png'
];

const isCacheableRequest = (request) => request.method === 'GET' && request.url.startsWith('http');
const isCacheableResponse = (response) => response && (response.ok || response.type === 'opaque');

async function PutInCache(cacheName, request, response){
	if(!isCacheableRequest(request) || !isCacheableResponse(response)) return;

	const cache = await caches.open(cacheName);
	try {
		await cache.put(request, response.clone());
	} catch (err) {
		console.log('[SW] Cache put failed.', err);
	}
}

async function MatchCache(request){
	const cachedResponse = await caches.match(request, {ignoreVary: true});
	if(cachedResponse) return cachedResponse;

	const url = typeof request === 'string' ? request : request.url;
	if(!url) return;

	const urlResponse = await caches.match(url, {ignoreVary: true});
	if(urlResponse) return urlResponse;

	const cacheNames = await caches.keys();
	for(const cacheName of cacheNames){
		const cache = await caches.open(cacheName);
		const cacheResponse = await cache.match(url, {ignoreVary: true});
		if(cacheResponse) return cacheResponse;
	}
}

async function PostClient(clientId, message){
	if(!clientId) return;
	const client = await clients.get(clientId);
	if(!client) return;
	client.postMessage(message);
}

function GetRangePosition(rangeHeader, contentLength){
	const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader || '');
	if(!match) return;

	let start = match[1] === '' ? undefined : Number(match[1]);
	let end = match[2] === '' ? undefined : Number(match[2]);
	if(start === undefined && end === undefined) return;

	if(start === undefined){
		start = Math.max(contentLength - end, 0);
		end = contentLength - 1;
	}else{
		end = end === undefined ? contentLength - 1 : Math.min(end, contentLength - 1);
	}

	if(Number.isNaN(start) || Number.isNaN(end) || start < 0 || end < start || start >= contentLength) return;
	return {start, end};
}

async function RangeResponse(request, response){
	try {
		const buffer = await response.arrayBuffer();
		const range = GetRangePosition(request.headers.get('range'), buffer.byteLength);
		if(!range) return response;

		const chunk = buffer.slice(range.start, range.end + 1);
		const headers = new Headers(response.headers);
		headers.set('content-length', String(chunk.byteLength));
		headers.set('content-range', `bytes ${range.start}-${range.end}/${buffer.byteLength}`);
		headers.set('accept-ranges', 'bytes');

		return new Response(chunk, {
			status: 206,
			statusText: 'Partial Content',
			headers
		});
	} catch (err) {
		console.log('[SW] Cached range response failed.', err);
		return response;
	}
}

async function MediaCacheFirst(request){
	const cachedResponse = await MatchCache(request);
	if(cachedResponse && cachedResponse.body){
		console.log('[SW] Responding with media cache');
		if(request.headers.has('range')){
			return RangeResponse(request, cachedResponse);
		}
		return cachedResponse;
	}

	console.log('[SW] Punting media to network...', request);
	if(request.headers.has('range')){
		const fullResponse = await fetch(request.url);
		if(fullResponse.status === 200){
			await PutInCache(CACHE_MEDIA_NAME, new Request(request.url), fullResponse);
			return RangeResponse(request, fullResponse.clone());
		}
		return fetch(request);
	}

	const response = await fetch(request);
	await PutInCache(CACHE_MEDIA_NAME, request, response);
	return response;
}

async function NetworkFirst(request, cacheName){
	try {
		const response = await fetch(request, {cache: 'reload'});
		await PutInCache(cacheName, request, response);
		return response;
	} catch (err) {
		console.log('[SW] Network failed. Attempting cache.', err);
		const cachedResponse = await MatchCache(request);
		if(cachedResponse) return cachedResponse;
		throw err;
	}
}

function GetNotificationClickUrl(value){
	if(!value) return new URL(AI_QUEUE_URL, self.location.origin).href;

	const url = new URL(value, self.location.origin);
	if(url.origin !== self.location.origin) {
		return new URL(AI_QUEUE_URL, self.location.origin).href;
	}

	url.searchParams.set('autoplay', '1');
	return url.href;
}

self.addEventListener('install', function(event){
	console.log('[SW] installing...');
	event.waitUntil(
		caches.open(CACHE_STATIC_NAME)
			.then(function(cache){
				console.log('[SW] precaching');
				return Promise.all(precacheUrls.map(function(url){
					return fetch(url, {cache: 'reload'})
						.then(function(response){
							if(!isCacheableResponse(response)) return;
							return cache.put(url, response);
						})
						.catch(function(err){
							console.log('[SW] Precache failed.', url, err);
						});
				}));
			})
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', function(event){
	console.log('[SW] activating...');
	event.waitUntil(
		caches.keys()
			.then(function(keyList) {
				return Promise.all(keyList.map(function(key) {
					if (
						key !== CACHE_STATIC_NAME && 
						key !== CACHE_DYNAMIC_NAME && 
						key !== CACHE_MEDIA_NAME && 
						!key.includes('playlist_')
					) {
						return caches.delete(key);
					}
				}));
			})
			.then(() => clients.claim())
	);
});

self.addEventListener('fetch', function(event){
	console.log("[SW] Heard fetch", event.request.url);
	if(event.request.method !== 'GET'){
		event.respondWith(fetch(event.request));
		return;
	}

	if( cacheFirst.some(v => event.request.url.includes(v)) ){
		// Images and audio are always cache first
		console.log('[SW] Cache First URL', event.request.url);
		event.respondWith(
			MediaCacheFirst(event.request)
				.then((res)=>{
					caches.open(CACHE_MEDIA_NAME).then((cache)=>{
						cache.keys().then(function(keys) {
							PostClient(event.clientId, {
								type: 'cached',
								msg: 'Cached File',
								count: keys.length,
								url: event.request.url
							});
						});
					});
					return res;
				})
		);
	}else{
		// Default to network with cache fallback
		event.respondWith(
			NetworkFirst(event.request, CACHE_DYNAMIC_NAME)
		);
	}
});

self.addEventListener('push', function(event){
	let payload = {};
	if(event.data){
		try {
			payload = event.data.json();
		} catch (err) {
			payload = { body: event.data.text() };
		}
	}

	const title = payload.title || 'AI Queue ready';
	const options = {
		body: payload.body || 'Your AI Queue playlist has been updated.',
		tag: payload.tag || 'ampache-ai-queue',
		icon: payload.icon || '/assets/icons/icon-192x192.png',
		badge: payload.badge || '/assets/icons/icon-96x96.png',
		data: {
			url: payload.url || AI_QUEUE_URL,
			...(payload.data || {})
		}
	};

	event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event){
	event.notification.close();
	const targetUrl = GetNotificationClickUrl(event.notification.data?.url);

	event.waitUntil(
		self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList){
			for(const client of clientList){
				if('focus' in client){
					if('navigate' in client) client.navigate(targetUrl);
					return client.focus();
				}
			}

			return self.clients.openWindow(targetUrl);
		})
	);
});

self.addEventListener('message', async function (event) {
	console.log('[SW] Message event received', event.data);
	if(event.data.action){
		const client = await clients.get(event.clientId);
		switch(event.data.action){
			case 'cache-version':
				event.source.postMessage({
					type: 'cache-version',
					msg: CACHE_VERSION
				});
				break;
			case 'cache-status':
				CacheDetails().then((data)=>{
					event.source.postMessage({
						type: 'cache-status',
						msg: data
					});
				});
				break;
			default:
				break;
		}
	}
});

async function CacheDetails(){
	let cache = await caches.open(CACHE_MEDIA_NAME);
	let mediaKeys = await cache.keys();
	cache = await caches.open(CACHE_DYNAMIC_NAME);
	let dynamicKeys = await cache.keys();
	cache = await caches.open(CACHE_STATIC_NAME);
	let staticKeys = await cache.keys();

	return {
		version: CACHE_VERSION,
		mediaCount: mediaKeys.length,
		dynamicCount: dynamicKeys.length,
		staticCount: staticKeys.length
	};
}
