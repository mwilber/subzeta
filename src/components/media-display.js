import { html } from '../vendor/@arrow-js/core/index.min.mjs';

export default (data, loadAlbum, loadArtist) => 
	html`
		<div style="grid-area: meta;">
			<button class="button-search" @click="${() => {
				const searchSubmit = document.getElementById('search-submit');
				const searchQuery = document.getElementById('search-query');
				searchQuery.value = data.artist;
				searchSubmit.click();
			}}">
				<svg
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
					x="0px"
					y="0px"
					viewBox="0 0 300 300"
					xml:space="preserve"
				>
					<g>
						<circle cx="132.18" cy="132.09" r="54.52"/>
						<path d="M150.27,0.18c-82.84,0-150,67.16-150,150c0,82.84,67.16,150,150,150c82.84,0,150-67.16,150-150C300.27,67.34,233.12,0.18,150.27,0.18z M232.81,245.57l-56.13-56.13c-12.31,9.58-27.73,15.34-44.5,15.34c-40.08,0-72.69-32.61-72.69-72.69s32.61-72.69,72.69-72.69s72.69,32.61,72.69,72.69c0,16.77-5.76,32.19-15.34,44.5l56.13,56.13L232.81,245.57z"/>
					</g>
				</svg>
			</button>
			<div id="display-title">${data.title}</div>
			<div id="display-album"><button @click="${() => {loadAlbum(data.albumId)}}">${data.album}</button></div>
			<div id="display-artist"> 
				<button @click="${() => {loadArtist(data.artistId)}}">${data.artist}</button>
			</div>
		</div>
	`;