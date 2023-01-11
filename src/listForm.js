import { html } from 'https://cdn.skypack.dev/@arrow-js/core';

export default addFunction => 
	html`
	<form @submit="${addFunction}">
		<input type="text" id="new-item">
		<button>Add</button>
	</form>
	`;