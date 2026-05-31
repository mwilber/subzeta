const AI_QUEUE_URL = '/?playlist=AI%20Queue';
const DEBUG_PREFIX = '[SubZeta Push]';

const debug = (...args) => {
	console.log(DEBUG_PREFIX, ...args);
};

const debugError = (...args) => {
	console.error(DEBUG_PREFIX, ...args);
};

const pushErrorDetails = (error) => ({
	name: error.name,
	message: error.message,
	stack: error.stack
});

const base64urlToUint8Array = (value) => {
	const padding = '='.repeat((4 - (value.length % 4)) % 4);
	const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
	const raw = atob(base64);
	return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
};

const uint8ArrayToBase64url = (value) => {
	if(!value) return '';
	const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
	let raw = '';
	bytes.forEach((byte) => raw += String.fromCharCode(byte));
	return btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

export class ApiPushNotifications {
	constructor(settings) {
		this.settings = settings;
	}

	get supported() {
		return Boolean('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window);
	}

	GetMcpBaseUrl() {
		const { server } = this.settings;
		if(!server) return;
		const baseUrl = server.replace(/\/+$/, '').replace(/\/rest$/i, '');
		return `${baseUrl}/AmpacheMcp`;
	}

	GetUserToken() {
		return this.settings.mcpPushToken || this.settings.apiKey;
	}

	async GetRegistration() {
		if(!this.supported) throw new Error('Push notifications are not supported by this browser.');
		debug('Getting service worker registration.', {
			controller: Boolean(navigator.serviceWorker.controller),
			readyState: document.readyState,
			secureContext: window.isSecureContext,
			userAgent: navigator.userAgent
		});
		const existing = await navigator.serviceWorker.getRegistration('/');
		debug('Existing service worker registration.', {
			found: Boolean(existing),
			scope: existing?.scope,
			activeState: existing?.active?.state,
			waitingState: existing?.waiting?.state,
			installingState: existing?.installing?.state
		});
		if(!existing) {
			const created = await navigator.serviceWorker.register('/service-worker.js');
			debug('Registered service worker.', {
				scope: created.scope,
				activeState: created.active?.state,
				waitingState: created.waiting?.state,
				installingState: created.installing?.state
			});
		}
		const ready = await navigator.serviceWorker.ready;
		debug('Service worker ready.', {
			scope: ready.scope,
			activeState: ready.active?.state
		});
		return ready;
	}

	async GetFreshRegistration() {
		debug('Refreshing service worker registration before retry.');
		const existing = await navigator.serviceWorker.getRegistration('/');
		if(existing) {
			const removed = await existing.unregister();
			debug('Unregistered existing service worker registration.', {
				removed,
				scope: existing.scope
			});
		}

		const created = await navigator.serviceWorker.register('/service-worker.js', {
			updateViaCache: 'none'
		});
		debug('Registered fresh service worker.', {
			scope: created.scope,
			activeState: created.active?.state,
			waitingState: created.waiting?.state,
			installingState: created.installing?.state
		});
		const ready = await navigator.serviceWorker.ready;
		debug('Fresh service worker ready.', {
			scope: ready.scope,
			activeState: ready.active?.state
		});
		return ready;
	}

	async LogManifestDiagnostics() {
		try {
			const manifestHref = document.querySelector('link[rel="manifest"]')?.href;
			if(!manifestHref) {
				debug('Manifest diagnostics.', { found: false });
				return;
			}

			const response = await fetch(manifestHref, { cache: 'reload' });
			const manifest = await response.json();
			debug('Manifest diagnostics.', {
				found: true,
				url: manifestHref,
				ok: response.ok,
				status: response.status,
				gcmSenderId: manifest.gcm_sender_id,
				scope: manifest.scope,
				legacyScope: manifest.Scope,
				startUrl: manifest.start_url
			});
		} catch (error) {
			debugError('Manifest diagnostics failed.', pushErrorDetails(error));
		}
	}

	async Subscribe(registration, applicationServerKey, label = 'initial') {
		debug('Calling pushManager.subscribe().', { label });
		try {
			const subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey
			});
			debug('pushManager.subscribe() succeeded.', {
				label,
				endpoint: subscription.endpoint,
				keys: Object.keys(subscription.toJSON()?.keys || {})
			});
			return subscription;
		} catch (error) {
			debugError('pushManager.subscribe() failed.', {
				label,
				...pushErrorDetails(error)
			});
			throw error;
		}
	}

	async GetPublicKey() {
		const baseUrl = this.GetMcpBaseUrl();
		if(!baseUrl) throw new Error('Ampache server is missing.');

		debug('Fetching MCP VAPID public key.', { url: `${baseUrl}/push/public-key` });
		const response = await fetch(`${baseUrl}/push/public-key`);
		debug('MCP VAPID public key response.', {
			ok: response.ok,
			status: response.status,
			statusText: response.statusText
		});
		if(!response.ok) throw new Error('Unable to load the VAPID public key.');

		const { publicKey, configured } = await response.json();
		debug('MCP VAPID public key payload.', {
			configured,
			hasPublicKey: Boolean(publicKey),
			publicKeyLength: publicKey?.length
		});
		if(!configured || !publicKey) throw new Error('Ampache MCP push notifications are not configured.');
		return publicKey;
	}

	async GetSubscription() {
		if(!this.supported) return;
		const registration = await this.GetRegistration();
		return registration.pushManager.getSubscription();
	}

	async Enable() {
		debug('Enable started.', {
			supported: this.supported,
			permission: Notification?.permission,
			hasServer: Boolean(this.settings.server),
			hasApiKey: Boolean(this.settings.apiKey),
			hasPushToken: Boolean(this.settings.mcpPushToken),
			mcpBaseUrl: this.GetMcpBaseUrl()
		});
		if(!this.supported) throw new Error('Push notifications are not supported by this browser.');
		const userToken = this.GetUserToken();
		if(!userToken) throw new Error('MCP push token or Ampache API token is missing.');

		await this.LogManifestDiagnostics();
		let registration = await this.GetRegistration();
		const permission = await Notification.requestPermission();
		debug('Notification permission result.', { permission });
		if(permission !== 'granted') throw new Error('Notification permission was not granted.');

		const publicKey = await this.GetPublicKey();
		const applicationServerKey = base64urlToUint8Array(publicKey);
		debug('Converted VAPID public key.', {
			publicKeyLength: publicKey.length,
			applicationServerKeyLength: applicationServerKey.byteLength
		});
		let subscription = await registration.pushManager.getSubscription();
		debug('Existing push subscription.', {
			found: Boolean(subscription),
			endpoint: subscription?.endpoint,
			keyLength: subscription?.options?.applicationServerKey?.byteLength
		});
		const currentKey = uint8ArrayToBase64url(subscription?.options?.applicationServerKey);
		if(subscription && currentKey && currentKey !== publicKey) {
			debug('Existing push subscription uses a different VAPID key. Unsubscribing before resubscribe.', {
				currentKeyLength: currentKey.length,
				newKeyLength: publicKey.length
			});
			await subscription.unsubscribe();
			subscription = null;
		}

		if(!subscription) {
			try {
				subscription = await this.Subscribe(registration, applicationServerKey);
			} catch (error) {
				if(error.name !== 'AbortError') throw error;
				debug('Retrying push subscription after AbortError by refreshing service worker registration.');
				registration = await this.GetFreshRegistration();
				subscription = await this.Subscribe(registration, applicationServerKey, 'after-service-worker-refresh');
			}
		}

		debug('Saving push subscription to MCP.', {
			url: `${this.GetMcpBaseUrl()}/push/subscribe`,
			endpoint: subscription.endpoint
		});
		const response = await fetch(`${this.GetMcpBaseUrl()}/push/subscribe`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-user-token': userToken
			},
			body: JSON.stringify(subscription)
		});

		debug('MCP subscribe response.', {
			ok: response.ok,
			status: response.status,
			statusText: response.statusText
		});
		if(!response.ok) throw new Error('Unable to save the push subscription.');
		const result = await response.json();
		debug('Enable finished.', result);
		return result;
	}

	async Disable() {
		const subscription = await this.GetSubscription();
		if(!subscription) return { status: 'not_subscribed' };

		const userToken = this.GetUserToken();
		const endpoint = subscription.endpoint;
		await subscription.unsubscribe();

		if(!userToken || !this.GetMcpBaseUrl()) return { status: 'unsubscribed_locally' };

		const response = await fetch(`${this.GetMcpBaseUrl()}/push/unsubscribe`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-user-token': userToken
			},
			body: JSON.stringify({ endpoint })
		});

		if(!response.ok) throw new Error('Unable to remove the push subscription.');
		return response.json();
	}

	async SendTest() {
		const userToken = this.GetUserToken();
		if(!userToken) throw new Error('MCP push token or Ampache API token is missing.');
		if(!this.GetMcpBaseUrl()) throw new Error('Ampache server is missing.');

		const response = await fetch(`${this.GetMcpBaseUrl()}/push/test`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-user-token': userToken
			},
			body: JSON.stringify({
				title: 'SubZeta test',
				body: 'Push notifications are connected.',
				url: AI_QUEUE_URL
			})
		});

		if(!response.ok) throw new Error('Unable to send a test notification.');
		return response.json();
	}
}
