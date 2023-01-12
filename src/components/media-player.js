import { html } from 'https://cdn.skypack.dev/@arrow-js/core';

export default src => 
	html`
	<audio controls src="${() => src}" />
	`;