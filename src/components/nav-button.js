import { html } from 'https://cdn.skypack.dev/@arrow-js/core';

export default (state, panelName) => html`
	<button @click="${() => state.activepanel = panelName}" disabled="${() => state.activepanel == panelName}">${panelName}</button>
`