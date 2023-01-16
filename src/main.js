import { reactive, watch, html } from 'https://cdn.skypack.dev/@arrow-js/core';

import { ApiSubsonic } from './apis/api-subsonic.js';
import { ApiHowler } from './apis/api-howler.js';
import { ApiMediaSession } from './apis/api-mediasession.js';

import { ControllerQueue } from './controllers/controller-queue.js';
import { ControllerCache } from './controllers/controller-cache.js';
import { ControllerSearch } from './controllers/controller-search.js';

import mediaPlayer from './components/media-player.js';
import mediaQueue from './components/media-queue.js';
import mediaDisplay from './components/media-display.js';
import mediaScrubber from './components/media_scrubber.js';
import mediaVolume from './components/media_volume.js';
import playLists from './components/playlists.js';
import search from './components/search.js';
import navButton from './components/nav-button.js';

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('../service-worker.js').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}

const state = reactive({
	searchresults: [],
	playlists: {},
	playlistSelection: null,
	mediaqueue: {},
	mediadisplay: {},
	mediaselection: null,
	volume: 100,
	activepanel: "playlists"
});

const apiSubsonic = new ApiSubsonic();
const apiMediaSession = new ApiMediaSession();
const apiHowler = new ApiHowler(state, apiMediaSession);

const cCache = new ControllerCache('media_v0.11', state);
const cQueue = new ControllerQueue(state, apiHowler, cCache);
const cSearch = new ControllerSearch(state, apiSubsonic);

apiMediaSession.Init(apiHowler, cQueue);

state.playlists = await apiSubsonic.GetPlaylists();
console.log("playlists", state.playlists);

const LoadPlaylistById = async (id) => {
	if(!id) return;
	
	//id = "800000013";
	let playlist = await apiSubsonic.GetPlaylist(id);
	cQueue.LoadData(playlist);
	state.activepanel = 'queue';
};

const LoadAlbumById = async (id, autoplay) => {
	if(!id) return;
	
	let playlist = await apiSubsonic.GetAlbum(id);
	cQueue.LoadData(playlist, autoplay);
	state.activepanel = 'queue';
};

const LoadAlbumsByArtistId = async (id) => {
	if(!id) return;
	
	let albums = await apiSubsonic.GetArtistAlbums(id);
	state.searchresults = albums;
	state.activepanel = 'search';
};


const panelClass = (panelName) => {
	const activeClass = (state.activepanel === panelName) ? ' active' : '';
	return 'panel ' + panelName + activeClass;
} 


html`
	<navigation>
		${() => navButton(state, 'search')}
		${() => navButton(state, 'playlists')}
		${() => navButton(state, 'queue')}
	</navigation>

	<div class="${() => panelClass('queue')}">
		${() => mediaQueue(
			state.mediaqueue,
			cQueue
		)}
	</div>

	<div class="media-player">
	${() => mediaDisplay(state.mediadisplay, LoadAlbumById, LoadAlbumsByArtistId)}
	${() => mediaScrubber(state.mediadisplay, apiHowler)}
	${mediaPlayer(apiHowler, cQueue)}
	${() => mediaVolume(state.volume, apiHowler)}
	</div>

	<div class="${() => panelClass('search')}">
		${() => search(
			state.searchresults,
			cSearch,
			cQueue,
			LoadAlbumById,
			LoadAlbumsByArtistId
		)}
	</div>

	<div class="${() => panelClass('playlists')}">
		${() => playLists(
			state.playlists,
			LoadPlaylistById,
		)}
	</div>
`(document.getElementById('arrow'));

window.state = state;