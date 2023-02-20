import { html } from '../vendor/@arrow-js/core/index.min.mjs';

const icons = {
	search: `
		<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
			viewBox="0 0 110 110" style="enable-background:new 0 0 110 110;" xml:space="preserve">
		<path d="M94.77,88.36L71.34,64.94c3.91-5.34,6.22-11.92,6.22-19.04c0-17.83-14.5-32.33-32.33-32.33S12.9,28.07,12.9,45.9
			c0,17.83,14.5,32.33,32.33,32.33c7.11,0,13.69-2.31,19.04-6.22L87.7,95.43c0.98,0.98,2.26,1.46,3.54,1.46s2.56-0.49,3.54-1.46
			C96.72,93.48,96.72,90.31,94.77,88.36z M22.9,45.9c0-12.31,10.02-22.33,22.33-22.33S67.56,33.59,67.56,45.9
			c0,5.95-2.34,11.36-6.15,15.37c-0.15,0.12-0.31,0.22-0.44,0.36c-0.14,0.14-0.24,0.3-0.36,0.45c-4.01,3.81-9.42,6.15-15.37,6.15
			C32.92,68.23,22.9,58.21,22.9,45.9z"/>
		</svg>`,
	playlists: `
		<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
			viewBox="0 0 110 110" style="enable-background:new 0 0 110 110;" xml:space="preserve">
		<g>
			<path d="M94.85,30.21H45.48c-2.76,0-5-2.24-5-5s2.24-5,5-5h49.37c2.76,0,5,2.24,5,5S97.61,30.21,94.85,30.21z"/>
		</g>
		<path d="M24.77,15.21h-10c-2.76,0-5,2.24-5,5v10c0,2.76,2.24,5,5,5h10c2.76,0,5-2.24,5-5v-10C29.77,17.45,27.54,15.21,24.77,15.21z"
			/>
		<g>
			<path d="M94.85,60.23H45.48c-2.76,0-5-2.24-5-5s2.24-5,5-5h49.37c2.76,0,5,2.24,5,5S97.61,60.23,94.85,60.23z"/>
		</g>
		<path d="M24.77,45.23h-10c-2.76,0-5,2.24-5,5v10c0,2.76,2.24,5,5,5h10c2.76,0,5-2.24,5-5v-10C29.77,47.47,27.54,45.23,24.77,45.23z"
			/>
		<g>
			<path d="M94.85,90.26H45.48c-2.76,0-5-2.24-5-5s2.24-5,5-5h49.37c2.76,0,5,2.24,5,5S97.61,90.26,94.85,90.26z"/>
		</g>
		<path d="M24.77,75.26h-10c-2.76,0-5,2.24-5,5v10c0,2.76,2.24,5,5,5h10c2.76,0,5-2.24,5-5v-10C29.77,77.5,27.54,75.26,24.77,75.26z"/>
		</svg>`,
	queue: `
		<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
			viewBox="0 0 110 110" style="enable-background:new 0 0 110 110;" xml:space="preserve">
		<path d="M81.94,8.81c-9.92,0-9.94,9.36-9.94,9.36v49.21c-3.41-2.29-7.8-3.93-12.91-3.93c-12.11,0-23.27,8.52-23.27,18.49
			c0,9.96,9.12,18.39,21.92,16.7C68.99,97.15,78.97,89,79.67,79.81h0.04V31.57c0-13.83,29.91-0.37,29.91-0.37S91.87,8.81,81.94,8.81z"
			/>
		<g>
			<path d="M55.75,29.13H5.38c-2.76,0-5-2.24-5-5s2.24-5,5-5h50.37c2.76,0,5,2.24,5,5S58.51,29.13,55.75,29.13z"/>
		</g>
		<g>
			<path d="M45.74,54.15H5.38c-2.76,0-5-2.24-5-5s2.24-5,5-5h40.36c2.76,0,5,2.24,5,5S48.5,54.15,45.74,54.15z"/>
		</g>
		<g>
			<path d="M20.72,79.17H5.38c-2.76,0-5-2.24-5-5s2.24-5,5-5h15.34c2.76,0,5,2.24,5,5S23.48,79.17,20.72,79.17z"/>
		</g>
		</svg>`,
	settings: `
		<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
			viewBox="0 0 110 110" style="enable-background:new 0 0 110 110;" xml:space="preserve">
		<path d="M83.47,20.55c1.25,1.04,1.69,2.76,1.19,4.31l-2.23,6.99c-0.55,1.76-0.2,3.67,0.79,5.2c0.27,0.43,0.54,0.87,0.8,1.32
			c0.26,0.46,0.5,0.91,0.74,1.36c0.85,1.64,2.31,2.91,4.11,3.29l7.17,1.56c1.59,0.34,2.86,1.58,3.14,3.18c0.38,2.2,0.57,4.4,0.61,6.61
			l0,1.65c-0.04,2.25-0.25,4.49-0.62,6.69c-0.27,1.61-1.55,2.84-3.13,3.19l-7.15,1.57c-1.8,0.39-3.26,1.66-4.12,3.31
			c-0.47,0.9-0.97,1.8-1.53,2.65c-0.99,1.55-1.35,3.46-0.81,5.21l2.22,6.98c0.5,1.56,0.06,3.27-1.21,4.31
			c-1.9,1.56-3.95,2.99-6.16,4.27c-2.21,1.27-4.47,2.34-6.78,3.2c-1.53,0.58-3.23,0.1-4.33-1.11l-4.93-5.41
			c-1.23-1.36-3.08-2-4.92-1.91c-1.03,0.05-2.04,0.04-3.06,0c-1.84-0.09-3.68,0.54-4.92,1.91l-4.91,5.41c-1.09,1.2-2.8,1.68-4.33,1.12
			c-2.09-0.78-4.13-1.71-6.1-2.81l-1.43-0.82c-1.89-1.14-3.7-2.41-5.42-3.83c-1.25-1.04-1.69-2.76-1.19-4.31l2.23-6.99
			c0.55-1.76,0.2-3.67-0.79-5.2c-0.27-0.43-0.54-0.87-0.8-1.32c-0.26-0.46-0.5-0.91-0.74-1.36c-0.85-1.64-2.31-2.91-4.11-3.29
			l-7.18-1.58c-1.59-0.34-2.86-1.58-3.14-3.18c-0.38-2.2-0.57-4.4-0.61-6.61l0-1.65c0.04-2.25,0.25-4.49,0.62-6.69
			c0.27-1.61,1.55-2.84,3.13-3.19l7.15-1.57c1.8-0.39,3.26-1.66,4.12-3.31c0.47-0.9,0.97-1.8,1.53-2.65c0.99-1.55,1.35-3.46,0.81-5.21
			l-2.22-6.98c-0.5-1.56-0.06-3.27,1.21-4.31c1.89-1.58,3.95-3.01,6.15-4.28c2.21-1.27,4.47-2.34,6.78-3.2
			c1.53-0.58,3.23-0.1,4.33,1.11l4.93,5.41c1.23,1.36,3.06,2,4.92,1.91c1.03-0.05,2.04-0.04,3.06,0c1.84,0.09,3.67-0.56,4.92-1.91
			l4.93-5.41c1.09-1.2,2.8-1.68,4.33-1.12c2.09,0.78,4.13,1.71,6.1,2.81l1.43,0.82c1.89,1.14,3.7,2.41,5.42,3.83L83.47,20.55z
			M61.85,67.41c6.72-3.88,9.03-12.48,5.15-19.2c-3.88-6.72-12.48-9.03-19.2-5.15s-9.03,12.48-5.15,19.2S55.12,71.29,61.85,67.41z"/>
		</svg>`,
};

export default (state, panelName) => html`
	<button @click="${() => state.activepanel = panelName}" disabled="${() => state.activepanel == panelName}">${icons[panelName]}</button>
`