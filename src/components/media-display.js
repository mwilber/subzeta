import { html } from '../vendor/@arrow-js/core/index.min.mjs';
import { searchcircle } from '../icons.js';

export default (data, loadAlbum, loadArtist) => 
	html`
		<div style="grid-area: meta;">
			<button class="button-search" @click="${() => {
				const searchSubmit = document.getElementById('search-submit');
				const searchQuery = document.getElementById('search-query');
				searchQuery.value = data.artist;
				searchSubmit.click();
			}}">
				${searchcircle}
			</button>
			<div id="display-title">${data.title}</div>
			<div id="display-album"><button @click="${() => {loadAlbum(data.albumId)}}">${data.album}</button></div>
			<div id="display-artist"> 
				<button @click="${() => {loadArtist(data.artistId)}}">${data.artist}</button>
			</div>
		</div>
	`;