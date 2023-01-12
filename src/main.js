import { reactive, html } from 'https://cdn.skypack.dev/@arrow-js/core';
import mediaPlayer from './components/media-player.js';
import listData from './listData.js';
import { ApiSubsonic } from './apis/api-subsonic.js';

const state = reactive({
	mediaqueue: {},
	mediasrc: "test"
});

const api = new ApiSubsonic();
state.mediaqueue = await api.GetPlaylist("800000013");
console.log("playlist", state.mediaqueue);
  
function addItem(e) {
	e.preventDefault();
	const input = document.getElementById('new-item');
	data.items.push({
		id: Math.random(),
		task: input.value,
	});
	input.value = '';
}

function PlaySong(song) {
	console.log("playingMedia", song.src[0])
	if(song && song.src[0])
		state.mediasrc = song.src[0];
}
  
html`
	${() => mediaPlayer(state.mediasrc)}
	<div style="border: solid 1px #ccc;">
		${listData({
			songs: state.mediaqueue.songs,
			playMedia: PlaySong
		})}
	</div>
`(document.getElementById('arrow'));

console.log("mediasrc", state.mediasrc)