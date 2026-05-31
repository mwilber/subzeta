import { html } from '../vendor/@arrow-js/core/index.min.mjs';

export default (selma, controller) => html`
	<section class="selma-panel">
		<h2>SELMA</h2>
		<div class="selma-action">
			<button
				class="${() => selma.listening ? 'selma-mic is-listening' : 'selma-mic'}"
				aria-pressed="${() => String(selma.listening)}"
				aria-label="${() => selma.listening ? 'Stop voice dictation' : 'Start voice dictation'}"
				disabled="${() => selma.sending || !controller.supported}"
				@click="${() => controller.OpenDictation()}"
			>
				${() => selma.listening ? 'Stop' : 'Dictate'}
			</button>
		</div>
		<div class="${() => selma.revealed ? 'selma-input revealed' : 'selma-input'}">
			<textarea
				placeholder="Voice dictation will appear here before it is sent."
				.value="${() => selma.text}"
				@input="${(event) => selma.text = event.target.value}"
			></textarea>
			<button
				class="selma-send"
				disabled="${() => selma.sending || selma.listening}"
				@click="${() => controller.SendTypedMessage()}"
			>Send typed input</button>
			<p role="status">${() => selma.status}</p>
		</div>
	</section>
`;
