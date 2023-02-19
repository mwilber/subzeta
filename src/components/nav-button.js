import { html } from '../vendor/@arrow-js/core/index.min.mjs';

export default (state, panelName) => html`
	<button @click="${() => state.activepanel = panelName}" disabled="${() => state.activepanel == panelName}">${panelName}</button>
`