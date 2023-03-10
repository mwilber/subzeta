import { html } from '../vendor/@arrow-js/core/index.min.mjs';

export default (data, audioApi) => 
	html`
		<input 
			class="range volume fs-only" 
			type="range" 
			min="0" 
			max="100" 
			value="${data || 100}"
			@change="${(e) => audioApi.Volume(e.target.value)}">
	`;