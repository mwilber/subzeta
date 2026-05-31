import { reactive, watch, html } from './vendor/@arrow-js/core/index.min.mjs';

import { ApiSubsonic } from './apis/api-subsonic.js';
import { ApiSelma } from './apis/api-selma.js';
import { ApiHowler } from './apis/api-howler.js';
import { ApiMediaSession } from './apis/api-mediasession.js';
import { ApiPushNotifications } from './apis/api-push-notifications.js';

import { ControllerQueue } from './controllers/controller-queue.js';
import { ControllerCache } from './controllers/controller-cache.js';
import { ControllerSearch } from './controllers/controller-search.js';
import { ControllerSelma } from './controllers/controller-selma.js';
import { ControllerPushNotifications } from './controllers/controller-push-notifications.js';

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
import selma from './components/selma.js';
import navButton from './components/nav-button.js';
import * as icons from './icons.js';

const disableSW = false;
const legacyDefaultServer = "https://ampache.greenzeta.com";

window.swUpdate = () => {
	alert("Service Worker is not registered.")
}
if (disableSW && 'serviceWorker' in navigator) {
	window.addEventListener('load', async () => {
		const registrations = await navigator.serviceWorker.getRegistrations();
		await Promise.all(registrations.map(registration => registration.unregister()));

		if ('caches' in window) {
			const cacheNames = await caches.keys();
			await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
		}
	});
}
if (!disableSW && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
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
	selma: {
		revealed: false,
		text: "",
		status: "Tap Dictate and speak. The message sends automatically when dictation ends.",
		listening: false,
		sending: false
	},
	settings: {
		server: "",
		apiKey: "",
		selmaBaseUrl: "",
		selmaApiToken: "",
		mcpPushToken: ""
	},
	push: {
		enabled: false,
		supported: false,
		permission: 'default',
		status: 'idle',
		message: ''
	}
};
// Retrieve the state from localStorage, if available.
if(localStorage) {
	let savedState = localStorage.getItem('subzeta-state');
	if(savedState && savedState !== null)
		defaultState = JSON.parse(savedState);

	if (
		defaultState.settings?.server === legacyDefaultServer &&
		(defaultState.settings?.apiKey || defaultState.settings?.user || defaultState.settings?.pass)
	) {
		defaultState.settings = {
			server: "",
			apiKey: "",
			selmaBaseUrl: "",
			selmaApiToken: "",
			mcpPushToken: ""
		};
	}

	if (!defaultState.settings?.apiKey) {
		defaultState.settings = {
			server: defaultState.settings?.server || "",
			apiKey: "",
			selmaBaseUrl: defaultState.settings?.selmaBaseUrl || "",
			selmaApiToken: defaultState.settings?.selmaApiToken || "",
			mcpPushToken: defaultState.settings?.mcpPushToken || ""
		};
	}

	defaultState.settings.selmaBaseUrl = defaultState.settings.selmaBaseUrl || "";
	defaultState.settings.selmaApiToken = defaultState.settings.selmaApiToken || "";
	defaultState.settings.mcpPushToken = defaultState.settings.mcpPushToken || "";
	defaultState.push = {
		enabled: false,
		supported: false,
		permission: 'default',
		status: 'idle',
		message: ''
	};
	defaultState.selma = {
		revealed: false,
		text: "",
		status: "Tap Dictate and speak. The message sends automatically when dictation ends.",
		listening: false,
		sending: false
	};

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
const apiSelma = new ApiSelma(state.settings);
const apiMediaSession = new ApiMediaSession();
const apiPush = new ApiPushNotifications(state.settings);
const apiHowler = new ApiHowler(state, apiMediaSession);

const cCache = new ControllerCache('media_v0.14', state);
const cQueue = new ControllerQueue(state, apiHowler, cCache);
const cSearch = new ControllerSearch(state, apiSubsonic);
const cSelma = new ControllerSelma(state, apiSelma);
const cPush = new ControllerPushNotifications(state, apiPush);

apiMediaSession.Init(apiHowler, cQueue);
cQueue.RefreshCacheStatus();
cPush.RefreshStatus();

const LoadPlaylistById = async (id, autoplay) => {
	if(!id) return;
	
	//id = "800000013";
	let playlist = await apiSubsonic.GetPlaylist(id);
	cQueue.LoadData(playlist, autoplay);
	state.activepanel = 'queue';
	state.fullscreen = Boolean(autoplay);
};

const LoadPlaylistByName = async (name, autoplay) => {
	const cleanName = String(name || '').trim().toLowerCase();
	if(!cleanName || !state.playlists?.length) return;
	const playlist = state.playlists.find(item => String(item.name || '').trim().toLowerCase() === cleanName);
	if(!playlist) return;
	await LoadPlaylistById(playlist.id, autoplay);
};

const LoadRoutePlaylist = async () => {
	const params = new URLSearchParams(window.location.search);
	const routePlaylist = params.get('playlist');
	const autoplay = params.get('autoplay') === '1';
	if(routePlaylist) {
		await LoadPlaylistByName(routePlaylist, autoplay);
		return;
	}

	if(window.location.pathname.replace(/\/+$/, '') === '/ai-queue' || params.has('aiQueue')) {
		await LoadPlaylistByName('AI Queue', autoplay);
	}
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

if(state.settings.server && state.settings.apiKey) {
	state.playlists = await apiSubsonic.GetPlaylists();
	console.log("playlists", state.playlists);
	await LoadRoutePlaylist();
} else {
	state.activepanel = "settings";
}


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
			<button
				aria-label="SELMA dictation"
				title="SELMA"
				@click="${() => cSelma.OpenDictation()}"
				disabled="${() => state.activepanel == 'selma'}"
			>${icons.selma}</button>
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
			<button class="button-fullscreen" @click="${() => state.fullscreen = !state.fullscreen}"></button>
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

		<div class="${() => panelClass('selma')}">
			${() => selma(
				state.selma,
				cSelma
			)}
		</div>

		<div class="${() => panelClass('settings')}">
			${() => settings(
				state,
				cPush
			)}
		</div>
	</div>
`(document.getElementById('arrow'));

window.state = state;

// Enable auto search for development
// TODO: Remove this
// const searchQuery = document.getElementById('search-query');
// if(searchQuery) searchQuery.value = 'Pearl Jam';
// if(searchQuery) searchQuery.value = 'cri';
// const searchSubmit = document.getElementById('search-submit');
// if(searchSubmit) searchSubmit.click();
