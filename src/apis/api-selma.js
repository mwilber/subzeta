export class ApiSelma {
	constructor(settings) {
		this.settings = settings;
	}

	async SendText(text) {
		const { selmaBaseUrl, selmaApiToken } = this.settings;
		const cleanText = String(text || '').trim();
		if (!cleanText) throw new Error('No dictation captured.');
		if (!selmaBaseUrl || !selmaApiToken) throw new Error('SELMA settings are missing.');

		const baseUrl = selmaBaseUrl.replace(/\/+$/, '');
		const submittedAt = new Date().toISOString();
		const response = await fetch(`${baseUrl}/api/agent-runs`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${selmaApiToken}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				transcript: cleanText,
				source: 'freevox_text',
				metadata: {
					submitted_at: submittedAt
				}
			})
		});

		if (!response.ok) {
			const data = await response.json().catch(() => ({}));
			throw new Error(data.error || `SELMA request failed with status ${response.status}.`);
		}

		return { ok: true };
	}
}
