import { html } from 'https://cdn.skypack.dev/@arrow-js/core';

export default (audioApi, queueController) => 
	html`
        <button @click="${() => audioApi.Play()}">Play${Math.random()}</button>
        <button @click="${() => audioApi.Pause()}">Pause</button>
        <button @click="${() => queueController.PlayPrevious()}">Previous</button>
        <button @click="${() => queueController.PlayNext()}">Next</button>
	`;