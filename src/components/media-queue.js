import { html } from 'https://cdn.skypack.dev/@arrow-js/core';

export default (data, queue) => {
	if(data.songs && data.songs.length)
	return html`
		<navigation>
			<button @click="${() => queue.CacheAll()}">Cache All</button>
			<button @click="${() => queue.Shuffle()}">Shuffle</button>
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
						${song.cached ? '📌' : ''}
					</button>
				</li>
			`.key(song.id))}
		</ul>
	`;
}