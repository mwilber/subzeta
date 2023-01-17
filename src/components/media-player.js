import { html } from 'https://cdn.skypack.dev/@arrow-js/core';

export default (audioApi, queueController) => 
	html`
		<div class="media-player-buttons">
				<button id="media-button-previous" @click="${() => queueController.PlayPrevious()}">Previous</button>
				<button id="media-button-reverse" @click="${() => audioApi.Jump(10, true)}" class="fs-only">Reverse</button>
				<button id="media-button-play" @click="${() => audioApi.Play()}">Play<br/>${Math.floor(Math.random()*1000)}</button>
				<button id="media-button-pause" @click="${() => audioApi.Pause()}">Pause</button>
				<button id="media-button-forward" @click="${() => audioApi.Jump(10, false)}" class="fs-only">Forward</button>
				<button id="media-button-next" @click="${() => queueController.PlayNext()}">Next</button>
		</div>
	`;