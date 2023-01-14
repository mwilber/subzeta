import { reactive, watch, html } from 'https://cdn.skypack.dev/@arrow-js/core';

import { ApiSubsonic } from './apis/api-subsonic.js';
import { ApiHowler } from './apis/api-howler.js';

import { ControllerQueue } from './controllers/controller-queue.js';

import mediaPlayer from './components/media-player.js';
import mediaQueue from './components/media-queue.js';
import mediaDisplay from './components/media-display.js';

const state = reactive({
	mediaqueue: {},
	mediadisplay: {},
	mediaselection: null
});

const apiSubsonic = new ApiSubsonic();
const apiHowler = new ApiHowler(state);

const cQueue = new ControllerQueue(state);

state.mediaqueue = await apiSubsonic.GetPlaylist("800000013");
console.log("playlist", state.mediaqueue);

watch(() => {
	if(state.mediaselection !== null)
		apiHowler.PlayMediaSelection();
});
  
html`
	${() => mediaDisplay(state.mediadisplay)}
	${mediaPlayer(apiHowler, cQueue)}
	<div style="border: solid 1px #ccc;">
		${() => mediaQueue({
			songs: state.mediaqueue.songs,
			playSong: cQueue.PlayId.bind(cQueue)
		})}
	</div>
`(document.getElementById('arrow'));

window.state = state;