import { nextTick } from '../vendor/@arrow-js/core/index.min.mjs';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const appendDictation = (baseText, spokenText) => {
	const cleanBase = String(baseText || '').trimEnd();
	const cleanSpoken = String(spokenText || '').trim();
	if (!cleanSpoken) return cleanBase;
	return cleanBase ? `${cleanBase} ${cleanSpoken}` : cleanSpoken;
};

export class ControllerSelma {
	constructor(state, api) {
		this.state = state;
		this.api = api;
		this.recognition = null;
		this.baseText = '';
		this.finalText = '';
		this.latestText = '';
		this.errorMessage = '';
	}

	get supported() {
		return Boolean(SpeechRecognition);
	}

	async OpenDictation() {
		this.state.activepanel = 'selma';
		this.state.fullscreen = false;
		this.state.selma.revealed = true;
		await nextTick();
		this.StartDictation();
	}

	StartDictation() {
		if (!this.supported) {
			this.state.selma.status = 'Voice input is not supported in this browser.';
			return;
		}

		if (this.state.selma.listening) {
			this.StopDictation();
			return;
		}

		this.baseText = this.state.selma.text;
		this.finalText = '';
		this.latestText = '';
		this.errorMessage = '';
		this.recognition = this.CreateRecognition();

		try {
			this.recognition.start();
		} catch (error) {
			this.state.selma.listening = false;
			this.state.selma.status = error.message || 'Could not start voice input.';
		}
	}

	StopDictation() {
		if (!this.recognition || !this.state.selma.listening) return;
		this.recognition.stop();
	}

	CreateRecognition() {
		const recognition = new SpeechRecognition();
		recognition.continuous = false;
		recognition.interimResults = true;
		recognition.lang = navigator.language || 'en-US';

		recognition.addEventListener('start', () => {
			this.state.selma.listening = true;
			this.state.selma.sending = false;
			this.state.selma.status = 'Listening...';
		});

		recognition.addEventListener('result', (event) => {
			let interimText = '';
			for (let index = event.resultIndex; index < event.results.length; index += 1) {
				const result = event.results[index];
				const transcript = result[0]?.transcript || '';
				if (result.isFinal) {
					this.finalText = `${this.finalText} ${transcript}`.trim();
				} else {
					interimText = `${interimText} ${transcript}`.trim();
				}
			}
			this.latestText = `${this.finalText} ${interimText}`.trim();
			this.state.selma.text = appendDictation(this.baseText, this.latestText);
		});

		recognition.addEventListener('end', () => {
			this.HandleDictationEnd();
		});

		recognition.addEventListener('error', (event) => {
			this.errorMessage = event.error === 'not-allowed' ? 'Microphone permission was denied.' : 'Voice input failed.';
		});

		return recognition;
	}

	async HandleDictationEnd() {
		const capturedText = (this.latestText || this.finalText).trim();
		this.state.selma.listening = false;
		this.state.selma.text = appendDictation(this.baseText, capturedText);

		if (this.errorMessage) {
			this.state.selma.status = this.errorMessage;
			this.errorMessage = '';
			return;
		}

		const message = this.state.selma.text.trim();
		if (!message) {
			this.state.selma.status = 'No voice input captured.';
			return;
		}

		await this.SendMessage(message);
	}

	async SendTypedMessage() {
		const message = this.state.selma.text.trim();
		if (!message) {
			this.state.selma.status = 'Enter text before sending.';
			return;
		}

		await this.SendMessage(message);
	}

	async SendMessage(message) {
		this.state.selma.sending = true;
		this.state.selma.status = 'Sending to SELMA...';

		try {
			await this.api.SendText(message);
			this.state.selma.text = '';
			this.state.selma.status = 'Sent to SELMA.';
		} catch (error) {
			this.state.selma.status = error.message || 'Failed to send to SELMA.';
		} finally {
			this.state.selma.sending = false;
		}
	}
}
