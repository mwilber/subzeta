import { html } from 'https://cdn.skypack.dev/@arrow-js/core';

export default (song, playMedia) => {
    //console.log(song)
    return html`
        <li>
            <button 
                @click="${() => playMedia(song)}"
                data-src="${song.src}"
                data-artistid="${song.artistId}"
                data-albumid="${song.albumId}"
                data-image="${song.coverArt[0]}"
            >
                <img src="${song.coverArt[0].src}" width="25"/>
                ${song.title}
            </button>
        </li>
    `.key(song.id)
}