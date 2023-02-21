import { html } from '../vendor/@arrow-js/core/index.min.mjs';
import {play, pause, next, previous} from '../icons.js';

export default (audioApi, queueController) => 
	html`
		<div class="media-player-buttons">
			<button id="media-button-previous" @click="${() => queueController.PlayPrevious()}">${previous}</button>
			<button id="media-button-reverse" @click="${() => audioApi.Jump(10, true)}">Reverse</button>
			<div class="progress-container">
				<div class="progress-bar">
					<svg viewBox="0 0 36 36" class="circular-chart">
						<path class="route" stroke-dasharray="100,100"
							d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"/>
						<path class="circle" stroke-dasharray="100,100"
							d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"/>
					</svg>
				</div>
				<button id="media-button-play" @click="${() => audioApi.Play()}">${play}</button>
				<button id="media-button-pause" @click="${() => audioApi.Pause()}">${pause}</button>
			</div>
			<button id="media-button-forward" @click="${() => audioApi.Jump(10, false)}">Forward</button>
			<button id="media-button-next" @click="${() => queueController.PlayNext()}">${next}</button>
		</div>
	`;