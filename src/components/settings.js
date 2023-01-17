import { html } from 'https://cdn.skypack.dev/@arrow-js/core';

export default (state) => html`
	<h2>Settings</h2>
	<form @submit="${(e) => {
		e.preventDefault();
		const inpServer = document.getElementById("login-server");
		const inpUser = document.getElementById("login-user");
		const inpPass = document.getElementById("login-password");
		if(inpServer && inpServer.value) state.settings.server = inpServer.value;
		if(inpUser && inpUser.value) state.settings.user = inpUser.value;
		if(inpPass && inpPass.value) state.settings.pass = inpPass.value;
	}}">
		<input id="login-server" type="text" placeholder="Server" value="${state.settings.server}" />
		<input id="login-user" type="text" placeholder="Username" value="${state.settings.user}" />
		<input id="login-password" type="text" placeholder="Password" value="${state.settings.pass}" />
		<input type="submit" class="search" value="Save" />
	</form>
`