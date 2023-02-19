import { html } from '../vendor/@arrow-js/core/index.min.mjs';

export default (data) => 
	html`
		<div id="display-time">${data.time}</div>
		<div id="display-duration">${data.duration}</div>
		<div id="display-remaining">${data.remaining}</div>
	`;