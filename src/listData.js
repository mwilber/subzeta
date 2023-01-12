import { html } from 'https://cdn.skypack.dev/@arrow-js/core';
import listItem from './listItem.js';

export default ({songs, playMedia}) => 
	html`
    <ul>
		${() => songs.map((song) => listItem(song, playMedia))}
	</ul>
	`;