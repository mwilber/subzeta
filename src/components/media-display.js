import { html } from 'https://cdn.skypack.dev/@arrow-js/core';

export default (data) => 
	html`
        <h2>Display</h2>
        <div>Title: ${data.title}</div>
        <div>Time: ${data.time}</div>
        <div>Duration: ${data.duration}</div>
	`;