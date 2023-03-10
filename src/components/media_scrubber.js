import { html } from '../vendor/@arrow-js/core/index.min.mjs';

export default (data, audioApi) => 
	html`
		<input 
			class="range scrubber fs-only" 
			type="range" 
			min="0" 
			max="100" 
			value="${data.progress || 0}"
			@change="${(e) => audioApi.Scrub(e.target.value)}">
	`;