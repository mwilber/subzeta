import { html } from 'https://cdn.skypack.dev/@arrow-js/core';

export default (data, loadAlbum, loadArtist) => 
	html`
		<div style="grid-area: meta;">
			<div id="display-title">Title: ${data.title}</div>
			<div id="display-album">Album: <button @click="${() => {loadAlbum(data.albumId)}}">${data.album}</button></div>
			<div id="display-artist">Artist: 
				<button @click="${() => {loadArtist(data.artistId)}}">${data.artist}</button>
				<button @click="${() => {
					const searchSubmit = document.getElementById('search-submit');
					const searchQuery = document.getElementById('search-query');
					searchQuery.value = data.artist;
					searchSubmit.click();
				}}">Search</button>
			</div>
		</div>
	`;