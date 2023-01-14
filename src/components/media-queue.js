import { html } from 'https://cdn.skypack.dev/@arrow-js/core';

export default ({songs, playSong}) => 
	html`
    <ul>
		${() => songs.map(
            (song) => html`
            <li>
                <button 
                    @click="${() => playSong(song.id)}"
                    data-src="${song.src}"
                    data-artistid="${song.artistId}"
                    data-albumid="${song.albumId}"
                    data-image="${song.coverArt[0]}"
                >
                    <!--<img src="${song.coverArt[0].src}" width="25"/>-->
                    ${song.title}
                </button>
            </li>
        `.key(song.id))}
	</ul>
	`;