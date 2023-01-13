import { reactive, html } from 'https://cdn.skypack.dev/@arrow-js/core';

import { ApiSubsonic } from './apis/api-subsonic.js';
import { ApiHowler } from './apis/api-howler.js';

import mediaPlayer from './components/media-player.js';
import mediaQueue from './components/media-queue.js';

const state = reactive({
	mediaqueue: {},
	mediaselection: null
});

const api = new ApiSubsonic();
const apiHowler = new ApiHowler(state);

state.mediaqueue = await api.GetPlaylist("800000013");
console.log("playlist", state.mediaqueue);

function PlayMedia(id) {
	if(!id) return;
	// make sure the id is valid
	const songIndex = state.mediaqueue.songs.findIndex(song => song.id === id);
	if(songIndex >= 0) {
		console.log("playingMedia", id)
		state.mediaselection = songIndex;
		apiHowler.PlayMediaSelection();
	}
}

function PlayNextInQueue() {
	if(state.mediaselection === null || state.mediaselection >= (state.mediaqueue.songs.length-1)) state.mediaselection = 0;
	else state.mediaselection++;

	apiHowler.PlayMediaSelection();
}
  
html`
	${mediaPlayer(apiHowler, {PlayNextInQueue})}
	<div style="border: solid 1px #ccc;">
		${() => mediaQueue({
			songs: state.mediaqueue.songs,
			playMedia: PlayMedia
		})}
	</div>
`(document.getElementById('arrow'));

window.state = state;