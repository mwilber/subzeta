import { html } from '../vendor/@arrow-js/core/index.min.mjs';
import {pin, cache, shuffle, spinner} from '../icons.js';

const GetIcon = (status) => {
	// TODO: Investigate this further.
	// ArrowJS doesn't appear to detect a change in the html when only the svg is swapped out.
	// Adding the changed attribute to the span wrapper fixes it.
	switch(status) {
		case 1:
			return html`<span data-status="1">${pin}</span>`;
		case -1:
			return html`<span data-status="-1">${spinner}</span>`;
		default:
			return html`<span data-status="0"></span>`;
	}
}

const RenderListing = (data, queue) => {
	let songs = `
		<li><button disabled>No songs in queue.</button></li>
	`;
	if(data.songs && data.songs.length) songs = data.songs.map(
		(song) => {
			let cachedIcon = '';
			if(song.cached === -1) cachedIcon = spinner;
			if(song.cached === 1) cachedIcon = pin;
			return html`
				<li>
					<button 
						@click="${() => queue.PlayId(song.id)}"
						data-src="${song.src}"
						data-artistid="${song.artistId}"
						data-albumid="${song.albumId}"
						data-image="${song.coverArt[0]}"
					>
						${song.title}
						${() => GetIcon(song.cached)}
					</button>
				</li>
			`.key(song.id);
		}
	);

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