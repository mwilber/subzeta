const AI_QUEUE_URL = '/?playlist=AI%20Queue&autoplay=1';

const isPushServiceAbort = (error) => (
	error.name === 'AbortError' &&
	String(error.message || '').toLowerCase().includes('push service')
);

const pushServiceError = () => new Error(
	'Browser push service registration failed. Chrome has permission and the service worker is active, but its push service rejected the subscription. Try a normal Chrome window with Google services enabled, outside incognito or embedded browsers.'
);

const base64urlToUint8Array = (value) => {
	const padding = '='.repeat((4 - (value.length % 4)) % 4);
	const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
	const raw = atob(base64);
	return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
};

const toExactArrayBuffer = (value) => {
	const buffer = value.buffer;
	return buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
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
		const existing = await navigator.serviceWorker.getRegistration('/');
		if(!existing) await navigator.serviceWorker.register('/service-worker.js');
		return navigator.serviceWorker.ready;
	}

	async GetFreshRegistration() {
		const existing = await navigator.serviceWorker.getRegistration('/');
		if(existing) await existing.unregister();

		await navigator.serviceWorker.register('/service-worker.js', {
			updateViaCache: 'none'
		});
		return navigator.serviceWorker.ready;
	}

	async GetPublicKey() {
		const baseUrl = this.GetMcpBaseUrl();
		if(!baseUrl) throw new Error('Ampache server is missing.');

		const response = await fetch(`${baseUrl}/push/public-key`);
		if(!response.ok) throw new Error('Unable to load the VAPID public key.');

		const { publicKey, configured } = await response.json();
		if(!configured || !publicKey) throw new Error('Ampache MCP push notifications are not configured.');
		return publicKey;
	}

	async GetSubscription() {
		if(!this.supported) return;
		const registration = await this.GetRegistration();
		return registration.pushManager.getSubscription();
	}

	async Enable() {
		if(!this.supported) throw new Error('Push notifications are not supported by this browser.');
		const userToken = this.GetUserToken();
		if(!userToken) throw new Error('MCP push token or Ampache API token is missing.');

		let registration = await this.GetRegistration();
		const permission = await Notification.requestPermission();
		if(permission !== 'granted') throw new Error('Notification permission was not granted.');

		const publicKey = await this.GetPublicKey();
		const applicationServerKey = base64urlToUint8Array(publicKey);
		let subscription = await registration.pushManager.getSubscription();
		const currentKey = uint8ArrayToBase64url(subscription?.options?.applicationServerKey);
		if(subscription && currentKey && currentKey !== publicKey) {
			await subscription.unsubscribe();
			subscription = null;
		}

		if(!subscription) {
			try {
				subscription = await registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey
				});
			} catch (error) {
				if(!isPushServiceAbort(error)) throw error;
				registration = await this.GetFreshRegistration();
				try {
					subscription = await registration.pushManager.subscribe({
						userVisibleOnly: true,
						applicationServerKey: toExactArrayBuffer(applicationServerKey)
					});
				} catch (retryError) {
					if(isPushServiceAbort(retryError)) throw pushServiceError();
					throw retryError;
				}
			}
		}

		const response = await fetch(`${this.GetMcpBaseUrl()}/push/subscribe`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-user-token': userToken
			},
			body: JSON.stringify(subscription)
		});

		if(!response.ok) throw new Error('Unable to save the push subscription.');
		return response.json();
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
