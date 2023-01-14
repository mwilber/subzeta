import { html } from 'https://cdn.skypack.dev/@arrow-js/core';

export default (data) => 
	html`
        <div>${data.title}</div>
        <div>${data.duration}</div>
	`;