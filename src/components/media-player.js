import { html } from '../vendor/@arrow-js/core/index.min.mjs';

export default (audioApi, queueController) => 
	html`
		<div class="media-player-buttons">
				<button id="media-button-previous" @click="${() => queueController.PlayPrevious()}">
					<svg
						version="1.1"
						id="icon-previous"
						xmlns="http://www.w3.org/2000/svg"
						xmlns:xlink="http://www.w3.org/1999/xlink"
						x="0px"
						y="0px"
						viewBox="0 0 300 300"
						xml:space="preserve"
					>
						<path d="M250.28,56.47c0-5.4-5.85-8.78-10.53-6.08L86.21,139.03c1.11-42.16,8.67-83.43,22.57-122.92c1.01-2.88-0.44-6.03-3.3-7.08L82.33,0.53c-2.9-1.07-6.14,0.43-7.17,3.34C58.64,50.66,50.27,99.74,50.27,149.84c0,50.35,8.45,99.66,25.13,146.66c1.03,2.91,4.27,4.4,7.17,3.33l23.14-8.55c2.86-1.06,4.31-4.21,3.29-7.09c-13.97-39.47-21.6-80.73-22.77-122.88l153.52,88.63c4.68,2.7,10.53-0.68,10.53-6.08c0,0-10.53-34.09-10.53-94.75S250.28,56.47,250.28,56.47z"/>
					</svg>
				</button>
				<button id="media-button-reverse" @click="${() => audioApi.Jump(10, true)}" class="fs-only">Reverse</button>
				<div class="progress-container">
					<div class="progress-bar">
						<svg viewBox="0 0 36 36" class="circular-chart">
							<path class="route"
							stroke-dasharray="100,100"
							d="M18 2.0845
								a 15.9155 15.9155 0 0 1 0 31.831
								a 15.9155 15.9155 0 0 1 0 -31.831"
							/>
							<path class="circle"
							stroke-dasharray="100,100"
							d="M18 2.0845
								a 15.9155 15.9155 0 0 1 0 31.831
								a 15.9155 15.9155 0 0 1 0 -31.831"
							/>
						</svg>
					</div>
					<button id="media-button-play" @click="${() => audioApi.Play()}">
						<svg
							id="icon-play" 
							version="1.1" 
							xmlns="http://www.w3.org/2000/svg" 
							xmlns:xlink="http://www.w3.org/1999/xlink" 
							x="0px" 
							y="0px" 
							viewBox="0 0 300 300" 
							xml:space="preserve"
						>
							<g>
								<path d="M150.27,0.18c-82.84,0-150,67.16-150,150s67.16,150,150,150s150-67.16,150-150S233.12,0.18,150.27,0.18z M118,206.5V93.87c0-4.3,4.66-6.99,8.38-4.84l72.75,56.32c3.73,2.15,3.73,7.53,0,9.68l-72.75,56.32C122.66,213.49,118,210.8,118,206.5z"/>
							</g>
					</svg>
					</button>
					<button id="media-button-pause" @click="${() => audioApi.Pause()}">
						<svg
							version="1.1"
							id="icon-pause"
							xmlns="http://www.w3.org/2000/svg"
							xmlns:xlink="http://www.w3.org/1999/xlink"
							x="0px"
							y="0px"
							viewBox="0 0 300 300"
							xml:space="preserve"
						>
							<g>
								<path d="M150.27,0.18c-82.84,0-150,67.16-150,150s67.16,150,150,150c82.84,0,150-67.16,150-150S233.12,0.18,150.27,0.18zM139.95,208c0,2.17-1.76,3.92-3.92,3.92h-25.03c-2.17,0-3.92-1.76-3.92-3.92V92.37c0-2.17,1.76-3.92,3.92-3.92h25.03c2.17,0,3.92,1.76,3.92,3.92V208z M193.47,208c0,2.17-1.76,3.92-3.92,3.92h-24.08c-2.17,0-3.92-1.76-3.92-3.92V92.37c0-2.17,1.76-3.92,3.92-3.92h24.08c2.17,0,3.92,1.76,3.92,3.92V208z"/>
							</g>
						</svg>
					</button>
				</div>
				<button id="media-button-forward" @click="${() => audioApi.Jump(10, false)}" class="fs-only">Forward</button>
				<button id="media-button-next" @click="${() => queueController.PlayNext()}">
					<svg
						version="1.1"
						id="icon-next"
						xmlns="http://www.w3.org/2000/svg"
						xmlns:xlink="http://www.w3.org/1999/xlink"
						x="0px"
						y="0px"
						viewBox="0 0 300 300"
						xml:space="preserve"
					>
						<path d="M50.27,56.47c0-5.4,5.85-8.78,10.53-6.08l153.54,88.64c-1.11-42.16-8.67-83.43-22.57-122.92c-1.01-2.88,0.44-6.03,3.3-7.08l23.16-8.51c2.9-1.07,6.14,0.43,7.17,3.34c16.52,46.79,24.89,95.87,24.89,145.98c0,50.35-8.45,99.66-25.13,146.66c-1.03,2.91-4.27,4.4-7.17,3.33l-23.14-8.55c-2.86-1.06-4.31-4.21-3.29-7.09c13.97-39.47,21.6-80.73,22.77-122.88L60.8,249.95c-4.68,2.7-10.53-0.68-10.53-6.08c0,0,10.53-34.09,10.53-94.75S50.27,56.47,50.27,56.47z"/>
					</svg>
				</button>
		</div>
	`;