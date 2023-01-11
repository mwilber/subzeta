import { html } from 'https://cdn.skypack.dev/@arrow-js/core';
import listItem from './listItem.js';

export default dataSet => 
	html`
    <ul>
		${() => dataSet.map(listItem)}
	</ul>
	`;