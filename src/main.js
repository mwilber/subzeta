import { reactive, watch, html } from './vendor/@arrow-js/core/index.min.mjs';

import { ApiSubsonic } from './apis/api-subsonic.js';
import { ApiHowler } from './apis/api-howler.js';
import { ApiMediaSession } from './apis/api-mediasession.js';

import { ControllerQueue } from './controllers/controller-queue.js';
import { ControllerCache } from './controllers/controller-cache.js';
import { ControllerSearch } from './controllers/controller-search.js';

import mediaPlayer from './components/media-player.js';
import mediaQueue from './components/media-queue.js';
import mediaDisplay from './components/media-display.js';
import mediaArt from './components/media-art.js';
import mediaTime from './components/media-time.js';
import mediaScrubber from './components/media_scrubber.js';
import mediaVolume from './components/media_volume.js';
import settings from './components/settings.js';
import playLists from './components/playlists.js';
import search from './components/search.js';
import navButton from './components/nav-button.js';

const disableSW = false;

window.swUpdate = () => {
	alert("Service Worker is not registered.")
}
if (!disableSW && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('../service-worker.js').then(registration => {
            console.log('SW registered: ', registration);
			window.swUpdate = () => {
				registration.update();
				alert("Update command issued. Reload the app.")
			};
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}

let defaultState = {
	searchresults: [],
	playlists: {},
	playlistSelection: null,
	mediaqueue: {},
	mediadisplay: {},
	mediaselection: null,
	volume: 100,
	activepanel: "playlists",
	fullscreen: false,
	playing: false,
	settings: {
		server: "",
		user: "",
		pass: ""
	}
};
// Retrieve the state from localStorage, if available.
if(localStorage) {
	let savedState = localStorage.getItem('subzeta-state');
	if(savedState && savedState !== null)
		defaultState = JSON.parse(savedState);

	// Reset values
	defaultState.playing = false;
}
const state = reactive(defaultState);

// Save the state to localStorage
watch(() => {
	if(!localStorage) return;
	localStorage.setItem('subzeta-state', JSON.stringify(state));
});

const apiSubsonic = new ApiSubsonic(state.settings);
const apiMediaSession = new ApiMediaSession();
const apiHowler = new ApiHowler(state, apiMediaSession);

const cCache = new ControllerCache('media_v0.12', state);
const cQueue = new ControllerQueue(state, apiHowler, cCache);
const cSearch = new ControllerSearch(state, apiSubsonic);

apiMediaSession.Init(apiHowler, cQueue);

if(state.settings.server && state.settings.user && state.settings.pass) {
	state.playlists = await apiSubsonic.GetPlaylists();
	console.log("playlists", state.playlists);
} else {
	state.activepanel = "settings";
}

const LoadPlaylistById = async (id) => {
	if(!id) return;
	
	//id = "800000013";
	let playlist = await apiSubsonic.GetPlaylist(id);
	cQueue.LoadData(playlist);
	state.activepanel = 'queue';
	state.fullscreen = false;
};

const LoadAlbumById = async (id, autoplay) => {
	if(!id) return;
	
	let playlist = await apiSubsonic.GetAlbum(id);
	cQueue.LoadData(playlist, autoplay);
	state.activepanel = 'queue';
	state.fullscreen = false;
};

const LoadAlbumsByArtistId = async (id) => {
	if(!id) return;
	
	let albums = await apiSubsonic.GetArtistAlbums(id);
	state.searchresults = albums;
	state.activepanel = 'search';
	state.fullscreen = false;
};


const panelClass = (panelName) => {
	let className = 'panel ' + panelName;
	className += (state.activepanel === panelName) ? ' active' : '';
	return className;
}

const wrapperClass = () => {
	let className = 'wrapper';
	className += state.fullscreen ? ' fullscreen' : '';
	className += state.playing ? ' playing' : '';
	return className;
}


html`
	<div class="${() => wrapperClass()}">
		<navigation>
			${() => navButton(state, 'search')}
			${() => navButton(state, 'playlists')}
			${() => navButton(state, 'queue')}
			${() => navButton(state, 'settings')}
		</navigation>

		<div class="${() => panelClass('queue')}">
			${() => mediaQueue(
				state.mediaqueue,
				cQueue
			)}
		</div>

		<div class="media-player">
			<button class="button-fullscreen" @click="${() => state.fullscreen = !state.fullscreen}">
				<!--<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
				viewBox="0 0 100 25" style="enable-background:new 0 0 100 25;" xml:space="preserve">
					<g>
						<line x1="0" y1="6.25" x2="100" y2="6.25"/>
					</g>
					<g>
						<line x1="0" y1="12.5" x2="100" y2="12.5"/>
					</g>
					<g>
						<line x1="0" y1="18.75" x2="100" y2="18.75"/>
					</g>
				</svg>-->
			</button>
			<div class="media-art">
				${() => mediaArt(state.mediadisplay)}
			</div>
			<div class="media-interface">
				<div class="media-display">
					${() => mediaDisplay(state.mediadisplay, LoadAlbumById, LoadAlbumsByArtistId)}
				</div>
				<div class="media-time">
					${() => mediaTime(state.mediadisplay)}
				</div>
				<div class="media-controls">
					${mediaPlayer(apiHowler, cQueue)}
					${() => mediaScrubber(state.mediadisplay, apiHowler)}
					${() => mediaVolume(state.volume, apiHowler)}
				</div>
			</div>
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

		<div class="${() => panelClass('settings')}">
			${() => settings(
				state
			)}
		</div>
	</div>
`(document.getElementById('arrow'));

window.state = state;

window.HandleImg = function (el) {
	//console.log("*** image loaded", el);
	const mediaPlayerEl = document.querySelector('.media-player');
	const mediaInterfaceEl = document.querySelector('.media-interface');
	const progressRouteEl = document.querySelector('.progress-bar svg path.route');
	const progressCircleEl = document.querySelector('.progress-bar svg path.circle');
	const fullScreenEl = document.querySelector('.media-player .button-fullscreen');
	if (!el || !mediaPlayerEl || !ColorThief) return;
	const colorThief = new ColorThief();
	const color = colorThief.getColor(el);
	const kVal = BlackOrWhite(color[0], color[1], color[2]);
	//console.log("color", color);
	mediaPlayerEl.style.backgroundColor = `rgb(${color[0]},${color[1]},${color[2]})`;
	mediaInterfaceEl.style.color = kVal;
	mediaInterfaceEl.style.fill = kVal;
	progressRouteEl.style.stroke = kVal;
	progressCircleEl.style.stroke = kVal;

	fullScreenEl.style.backgroundColor = kVal === 'black' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)';
	fullScreenEl.style.stroke = `rgb(${color[0]},${color[1]},${color[2]})`;
	fullScreenEl.style.stroke = kVal;

		// .then(color => { console.log(color) })
		// .catch(err => { console.log(err) });
}

window.BlackOrWhite = function (red, green, blue) {
	return ((red*0.299 + green*0.587 + blue*0.114) > 160) ? "black" : "white";
}