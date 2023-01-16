import { html } from 'https://cdn.skypack.dev/@arrow-js/core';

export default (audioApi, queueController) => 
	html`
        <div class="media-player-buttons">
                <button @click="${() => audioApi.Play()}">Play ${Math.random()}</button>
                <button @click="${() => audioApi.Pause()}">Pause</button>
                <button @click="${() => queueController.PlayPrevious()}">Previous</button>
                <button @click="${() => audioApi.Jump(10, true)}" class="fs-only">Reverse</button>
                <button @click="${() => audioApi.Jump(10, false)}" class="fs-only">Forward</button>
                <button @click="${() => queueController.PlayNext()}">Next</button>
        </div>
	`;