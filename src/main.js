import { reactive, watch, html } from 'https://cdn.skypack.dev/@arrow-js/core';

import { ApiSubsonic } from './apis/api-subsonic.js';
import { ApiHowler } from './apis/api-howler.js';

import { ControllerQueue } from './controllers/controller-queue.js';
import { ControllerCache } from './controllers/controller-cache.js';

import mediaPlayer from './components/media-player.js';
import mediaQueue from './components/media-queue.js';
import mediaDisplay from './components/media-display.js';
import mediaScrubber from './components/media_scrubber.js';
import mediaVolume from './components/media_volume.js';

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
	mediaselection: null,
	volume: 100
});

const apiSubsonic = new ApiSubsonic();
const apiHowler = new ApiHowler(state);

const cCache = new ControllerCache('media_v0.11', state);
const cQueue = new ControllerQueue(state, apiHowler, cCache);


let playlist = await apiSubsonic.GetPlaylist("800000013");
cQueue.LoadData(playlist);


html`
	${() => mediaDisplay(state.mediadisplay)}
	${() => mediaScrubber(state.mediadisplay, apiHowler)}
	${mediaPlayer(apiHowler, cQueue)}
	${() => mediaVolume(state.volume, apiHowler)}
	<div style="border: solid 1px #ccc;">
		${() => mediaQueue(
			state.mediaqueue,
			cQueue
		)}
	</div>
`(document.getElementById('arrow'));

window.state = state;