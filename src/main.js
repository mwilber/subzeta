import { reactive, watch, html } from 'https://cdn.skypack.dev/@arrow-js/core';

import { ApiSubsonic } from './apis/api-subsonic.js';
import { ApiHowler } from './apis/api-howler.js';

import { ControllerQueue } from './controllers/controller-queue.js';
import { ControllerCache } from './controllers/controller-cache.js';

import mediaPlayer from './components/media-player.js';
import mediaQueue from './components/media-queue.js';
import mediaDisplay from './components/media-display.js';
import mediaScrubber from './components/media_scrubber.js';

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
	mediaqueue: {},
	mediadisplay: {},
	mediaselection: null
});

const apiSubsonic = new ApiSubsonic();
const apiHowler = new ApiHowler(state);

const cCache = new ControllerCache('media_v0.11', state);
const cQueue = new ControllerQueue(state, apiHowler);

let mediaListing = await apiSubsonic.GetPlaylist("800000013");
const getCacheStatus = async item => {
	item.cached = await cCache.IsCached(item.src[0]);
	return item;
}
const getCacheData = async () => {
	return Promise.all(mediaListing.songs.map(item => getCacheStatus(item)))
}
getCacheData().then(data => {
	state.mediaqueue = {...mediaListing, songs: data};
});

state.mediaselection = 0;
console.log("playlist", state.mediaqueue);


html`
	${() => mediaDisplay(state.mediadisplay)}
	${() => mediaScrubber(state.mediadisplay, apiHowler)}
	${mediaPlayer(apiHowler, cQueue)}
	<div style="border: solid 1px #ccc;">
		${() => mediaQueue(
			state.mediaqueue,
			cQueue.PlayId.bind(cQueue)
		)}
	</div>
`(document.getElementById('arrow'));

window.state = state;