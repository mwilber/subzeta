import { reactive, html } from 'https://cdn.skypack.dev/@arrow-js/core';

import { ApiSubsonic } from './apis/api-subsonic.js';

import mediaPlayer from './components/media-player.js';
import mediaQueue from './components/media-queue.js';

const state = reactive({
	mediaqueue: {},
	mediasrc: ""
});

const api = new ApiSubsonic();
state.mediaqueue = await api.GetPlaylist("800000013");
console.log("playlist", state.mediaqueue);

function PlayMedia(song) {
	console.log("playingMedia", song.src[0])
	if(song && song.src[0])
		state.mediasrc = song.src[0];
}
  
html`
	${() => mediaPlayer(state.mediasrc)}
	<div style="border: solid 1px #ccc;">
		${() => mediaQueue({
			songs: state.mediaqueue.songs,
			playMedia: PlayMedia
		})}
	</div>
`(document.getElementById('arrow'));