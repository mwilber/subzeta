import { html } from '../vendor/@arrow-js/core/index.min.mjs';
import {pin, cache, shuffle} from '../icons.js';

export default (data, queue) => {
	if(data.songs && data.songs.length)
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
			${() => data.songs.map((song) => html`
				<li>
					<button 
						@click="${() => queue.PlayId(song.id)}"
						data-src="${song.src}"
						data-artistid="${song.artistId}"
						data-albumid="${song.albumId}"
						data-image="${song.coverArt[0]}"
					>
						<!--<img src="${song.coverArt[0].src}" width="25"/>-->
						${song.title}
						<span>${song.cached ? pin : ''}</span>
					</button>
				</li>
			`.key(song.id))}
		</ul>
	`;
}