import { html } from 'https://cdn.skypack.dev/@arrow-js/core';

export default item => {
    console.log(item.coverArt[0].src)
   return html`
        <li>
            <button 
                @click="${() => console.log('test')}"
                data-src="${item.src}"
                data-artistid="${item.artistId}"
                data-albumid="${item.albumId}"
                data-image="${item.coverArt[0]}"
            >
                <img src="${item.coverArt[0].src}" width="25"/>
                ${item.title}
            </button>
        </li>
    `.key(item.id)
}