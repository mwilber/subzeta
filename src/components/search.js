import { html } from 'https://cdn.skypack.dev/@arrow-js/core';

export default (results, controller, queue, loadAlbum) => html`
    <form @submit="${controller.Search.bind(controller)}">
        <input id="search-query" type="text" name="query" placeholder="Search" value="" />
        <input type="submit" class="search" value="Go" />
    </form>
    ${() => {
        if(results.albums && results.albums.length)
            return html`
            <h2>Albums</h2>
                <ul>
                    ${() => results.albums.map((album) => {
                        return html`
                            <li>
                                <button 
                                    @click="${() => loadAlbum(album.id, true)}"
                                    data-id="${album.id}"
                                    data-name="${album.name}"
                                    data-artist="${album.artist}"
                                    data-songCount="${album.songCount}"
                                    data-year="${album.year}"
                                >
                                    ${album.title} : ${album.artist} (${album.year})
                                </button>
                            </li>
                        `.key(album.id);
                    })}
                </ul>
            `
    }}
    ${() => {
        if(results.songs && results.songs.length)
            return html`
            <h2>Songs</h2>
                <ul>
                    ${() => results.songs.map((song) => {
                        return html`
                            <li>
                                <button 
                                    @click="${() => queue.LoadData({
                                        name: 'Search Results',
                                        songs: [song]
                                    }, true)}"
                                    data-src="${song.src}"
                                    data-artistid="${song.artistId}"
                                    data-albumid="${song.albumId}"
                                    data-image="${song.coverArt[0]}"
                                >
                                    <!--<img src="${song.coverArt[0].src}" width="25"/>-->
                                    ${song.title}
                                </button>
                            </li>
                        `.key(song.id);
                    })}
                </ul>
            `
    }}
`;