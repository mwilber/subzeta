/**
 * Service Worker boilerplate
 * 
 * This service worker has the bare minimum of features required 
 * to qualify for PWA installation. Use this as a starting point
 * to build out your own caching strategy and other PWA features.
 */

let CACHE_VERSION = '0.23';
let MEDIA_CACHE_VERSION = '0.14';
let CACHE_STATIC_NAME = 'static_v'+CACHE_VERSION;
let CACHE_DYNAMIC_NAME = 'dynamic_v'+CACHE_VERSION;
let CACHE_MEDIA_NAME = 'media_v'+MEDIA_CACHE_VERSION;
let cacheFirst = ['getCoverArt.view', 'download.view'];
let precacheUrls = [
	'/',
	'/index.html',
	'/styles/main.css'
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
	const cachedResponse = await caches.match(request, {ignoreVary: true});
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
		const response = await fetch(request);
		await PutInCache(cacheName, request, response);
		return response;
	} catch (err) {
		console.log('[SW] Network failed. Attempting cache.', err);
		const cachedResponse = await caches.match(request, {ignoreVary: true});
		if(cachedResponse) return cachedResponse;
		throw err;
	}
}

self.addEventListener('install', function(event){
	console.log('[SW] installing...');
	event.waitUntil(
		caches.open(CACHE_STATIC_NAME)
			.then(function(cache){
				console.log('[SW] precaching');
				return Promise.all(precacheUrls.map(function(url){
					return fetch(url)
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
