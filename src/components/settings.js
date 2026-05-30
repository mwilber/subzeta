import { html } from '../vendor/@arrow-js/core/index.min.mjs';

export default (state) => html`
	<h2>Settings</h2>
	<form @submit="${(e) => {
			e.preventDefault();
			const inpServer = document.getElementById("login-server");
			const inpApiKey = document.getElementById("login-api-key");
			if(inpServer) state.settings.server = inpServer.value;
			if(inpApiKey) state.settings.apiKey = inpApiKey.value;
		}}">
		<input id="login-server" type="text" placeholder="Server" .value="${() => state.settings.server}" />
		<input id="login-api-key" type="password" placeholder="API key / access token" .value="${() => state.settings.apiKey}" />
		<input type="submit" class="search" value="Save" />
	</form>
	<button class="update-sw" @click="${() => window.swUpdate()}">Update SW</button>
`
