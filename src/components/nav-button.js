import { html } from '../vendor/@arrow-js/core/index.min.mjs';
import * as icons from '../icons.js';

export default (state, panelName) => html`
	<button @click="${() => state.activepanel = panelName}" disabled="${() => state.activepanel == panelName}">${icons[panelName]}</button>
`