import { html } from 'https://cdn.skypack.dev/@arrow-js/core';

export default (audioApi, queueApi) => 
	html`
        <button @click="${() => audioApi.Play()}">Play${Math.random()}</button>
        <button @click="${() => audioApi.Pause()}">Pause</button>
        <button @click="${() => queueApi.PlayNextInQueue()}">Next</button>
	`;