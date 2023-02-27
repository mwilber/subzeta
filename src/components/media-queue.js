import { html } from '../vendor/@arrow-js/core/index.min.mjs';
import {pin, cache, shuffle} from '../icons.js';

const RenderListing = (data, queue) => {
	let songs = `
		<li><button disabled>No songs in queue.</button></li>
	`;
	if(data.songs && data.songs.length) songs = data.songs.map(
		(song) => html`
			<li>
				<button 
					@click="${() => queue.PlayId(song.id)}"
					data-src="${song.src}"
					data-artistid="${song.artistId}"
					data-albumid="${song.albumId}"
					data-image="${song.coverArt[0]}"
				>
					${song.title}
					<span>${song.cached ? pin : ''}</span>
				</button>
			</li>
		`.key(song.id));

	return songs;
}

export default (data, queue) => {;


	return html`
		<navigation>
			<button @click="${() => queue.CacheAll()}">
				${cache}   
			</button>
			<button @click="${() => queue.Shuffle()}">
				${shuffle}
			</button>
		</navigation>
		<ul>
			${() => RenderListing(data, queue)}
		</ul>
	`;
}