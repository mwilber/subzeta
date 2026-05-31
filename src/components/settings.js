import { html } from '../vendor/@arrow-js/core/index.min.mjs';

export default (state, cPush) => html`
	<h2>Settings</h2>
	<form @submit="${(e) => {
			e.preventDefault();
			const inpServer = document.getElementById("login-server");
			const inpApiKey = document.getElementById("login-api-key");
			const inpSelmaBaseUrl = document.getElementById("selma-base-url");
			const inpSelmaApiToken = document.getElementById("selma-api-token");
			const inpMcpPushToken = document.getElementById("mcp-push-token");
			if(inpServer) state.settings.server = inpServer.value;
			if(inpApiKey) state.settings.apiKey = inpApiKey.value;
			if(inpSelmaBaseUrl) state.settings.selmaBaseUrl = inpSelmaBaseUrl.value;
			if(inpSelmaApiToken) state.settings.selmaApiToken = inpSelmaApiToken.value;
			if(inpMcpPushToken) state.settings.mcpPushToken = inpMcpPushToken.value;
			cPush.RefreshStatus();
		}}">
		<h3>Ampache</h3>
		<input id="login-server" type="text" placeholder="Server" .value="${() => state.settings.server}" />
		<input id="login-api-key" type="password" placeholder="API key / access token" .value="${() => state.settings.apiKey}" />
		<h3>SELMA</h3>
		<input id="selma-base-url" type="text" placeholder="SELMA base URL" .value="${() => state.settings.selmaBaseUrl}" />
		<input id="selma-api-token" type="password" placeholder="SELMA API token" .value="${() => state.settings.selmaApiToken}" />
		<h3>AI Queue Notifications</h3>
		<input id="mcp-push-token" type="password" placeholder="MCP push token (defaults to API key)" .value="${() => state.settings.mcpPushToken}" />
		<input type="submit" class="search" value="Save" />
	</form>
	<div class="settings-actions">
		<button
			class="push-enable"
			disabled="${() => state.push.status === 'working' || state.push.enabled}"
			@click="${() => cPush.Enable()}"
		>Enable AI Queue Notifications</button>
		<button
			class="push-disable"
			disabled="${() => state.push.status === 'working' || !state.push.enabled}"
			@click="${() => cPush.Disable()}"
		>Disable Notifications</button>
		<button
			class="push-test"
			disabled="${() => state.push.status === 'working' || !state.push.enabled}"
			@click="${() => cPush.SendTest()}"
		>Send Test Notification</button>
		<button class="update-sw" @click="${() => window.swUpdate()}">Update SW</button>
		<p class="push-status">${() => state.push.message}</p>
	</div>
`
