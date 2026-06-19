import { html } from '../vendor/@arrow-js/core/index.min.mjs';
import {pin, cache, shuffle, spinner} from '../icons.js';

let scrolledTrackId = null;

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

const ScrollHighlightedTrack = (trackId, activePanel, fullscreen) => {
	if (!trackId || activePanel !== 'queue' || fullscreen || scrolledTrackId === trackId) return;
	scrolledTrackId = trackId;

	setTimeout(() => {
		const track = Array.from(document.querySelectorAll('.queue-track')).find(
			item => item.dataset.queueTrackId === String(trackId)
		);
		if (!track) return;
		track.scrollIntoView({
			block: 'center',
			inline: 'nearest',
			behavior: 'smooth'
		});
	}, 0);
}

const RenderListing = (data, playingQueueId, keyboardFocus, queue) => {
	let songs = `
		<li><button disabled>No songs in queue.</button></li>
	`;
	if(data.songs && data.songs.length) songs = data.songs.map(
		(song, index) => {
			const isPlaying = String(song.id) === String(playingQueueId);
			return html`
				<li>
					<button 
						class="${isPlaying ? 'queue-track is-playing' : 'queue-track'}"
						@click="${() => queue.PlayId(song.id)}"
						data-keyboard-list-item
						data-keyboard-selected="${() => keyboardFocus?.panel === 'queue' && keyboardFocus?.index === index}"
						data-queue-track-id="${song.id}"
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

export default (data, playingQueueId, activePanel, fullscreen, keyboardFocus, queue) => {;
	const activeTrackExists = Boolean(data.songs?.some(
		song => String(song.id) === String(playingQueueId)
	));
	const activeTrackId = activeTrackExists ? playingQueueId : null;
	if (!activeTrackId) scrolledTrackId = null;
	ScrollHighlightedTrack(activeTrackId, activePanel, fullscreen);


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
			${() => RenderListing(data, activeTrackId, keyboardFocus, queue)}
		</ul>
	`;
}
