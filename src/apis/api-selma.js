export class ApiSelma {
	constructor(settings) {
		this.settings = settings;
	}

	async SendText(text) {
		const { selmaBaseUrl, selmaApiToken } = this.settings;
		const cleanText = String(text || '').trim();
		if (!cleanText) throw new Error('No dictation captured.');
		if (!selmaBaseUrl || !selmaApiToken) throw new Error('SELMA settings are missing.');

		const response = await fetch('api/selma-send.php', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				text: cleanText,
				selmaBaseUrl,
				selmaApiToken
			})
		});

		if (!response.ok) {
			const data = await response.json().catch(() => ({}));
			throw new Error(data.error || `SELMA request failed with status ${response.status}.`);
		}

		return { ok: true };
	}
}
