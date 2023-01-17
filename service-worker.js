/**
 * Service Worker boilerplate
 * 
 * This service worker has the bare minimum of features required 
 * to qualify for PWA installation. Use this as a starting point
 * to build out your own caching strategy and other PWA features.
 */

let CACHE_VERSION = '0.16';
let MEDIA_CACHE_VERSION = '0.11';
let CACHE_STATIC_NAME = 'static_v'+CACHE_VERSION;
let CACHE_DYNAMIC_NAME = 'dynamic_v'+CACHE_VERSION;
let CACHE_MEDIA_NAME = 'media_v'+MEDIA_CACHE_VERSION;
let cacheFirst = ['getCoverArt.view', 'download.view'];

self.addEventListener('install', function(event){
	console.log('[SW] installing...');
	event.waitUntil(caches.open(CACHE_STATIC_NAME)
		.then(function(cache){
			console.log('[SW] precaching');
			cache.addAll([
				'/',
				'/index.html',
				'/app-shell.css'
			]);
		}));
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
	);
});

self.addEventListener('fetch', function(event){
	if( cacheFirst.some(v => event.request.url.includes(v)) ){
		// Images and audio are always cache first
		console.log('[SW] Cache First URL', event.request.url);
		event.respondWith(
			caches.match(event.request, {ignoreVary: true})
				.then(function(response){
					if(response && response.body){
						console.log('[SW] Responding with cache');
						return response;
					}else{
						console.log('[SW] Punting to network...', event.request);
						return fetch(event.request.url).then((res)=>{
							if( !res || !res.body ){
								console.log('[SW] Network request failed. Returning undefined.');
								return;
							}
							return caches.open(CACHE_MEDIA_NAME)
								.then(function(cache) {
									console.log('[SW] Adding to media cache');
									cache.put(event.request.url, res.clone()).then(()=>{
										cache.keys().then(function(keys) {
											clients.get(event.clientId).then((client)=>{
												client.postMessage({
													msg: "File cached",
													count: keys.length,
													url: event.request.url
												});
											});
										});
									});
									return res;
								});
						});
					}
				})
		);
	}else{
		// Default to network with cache fallback
		event.respondWith(
			fetch(event.request.url)
				.then(function(res){
					// Skip caching the javascript bundle
					// TODO: remove this before production
					//if( event.request.url.includes('bundle.js') ) return res;
					// Cache and return
					console.log('fetch successful. adding to cache', CACHE_DYNAMIC_NAME)
					return caches.open(CACHE_DYNAMIC_NAME)
						.then(function(cache) {
							//console.log("[SW] cache put", event.request.url)
							if(!event.request.url.startsWith("chrome-extension://"))
								cache.put(event.request.url, res.clone());
							return res;
						});
				})
				.catch(function(err){
					// Network failed, try pulling from cache
					console.log('[SW] Network failed. Attempting cache.')
					return caches.match(event.request, {ignoreVary: true})
						.then(function(response){
							if(response){
								return response;
							}else{
								// TODO: decide if we need to handle a failed network request that isn't cached
								return;
							}
						});
				})
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