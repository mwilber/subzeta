import { html } from 'https://cdn.skypack.dev/@arrow-js/core';

export default (data, audioApi) => 
	html`
        <input 
            class="range scrubber" 
            type="range" 
            min="0" 
            max="100" 
            value="${data.progress}"
            @change="${(e) => audioApi.Scrub(e.target.value)}">
	`;