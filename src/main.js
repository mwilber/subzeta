import { reactive, html } from 'https://cdn.skypack.dev/@arrow-js/core';
import listForm from './listForm.js';
import listData from './listData.js';
import { ApiSubsonic } from './apis/api-subsonic.js';

const state = reactive({
	mediaqueue: {}
});

const api = new ApiSubsonic();
state.mediaqueue = await api.GetPlaylist("800000013");
console.log("playlist", state.mediaqueue.songs);
  
function addItem(e) {
	e.preventDefault();
	const input = document.getElementById('new-item');
	data.items.push({
		id: Math.random(),
		task: input.value,
	});
	input.value = '';
}
  
html`
	<div style="border: solid 1px #ccc;">
		${listData(state.mediaqueue.songs)}
	</div>
	${listForm(addItem)}
`(document.getElementById('arrow'));