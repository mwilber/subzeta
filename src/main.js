import { reactive, html } from 'https://cdn.skypack.dev/@arrow-js/core';
import listForm from './listForm.js';
import listData from './listData.js';

const data = reactive({
	items: [
		{ id: 17, task: 'Check email' },
		{ id: 21, task: 'Get groceries' },
		{ id: 44, task: 'Make dinner' },
	]
});
  
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
	${listData(data.items)}
	${listForm(addItem)}
`(document.getElementById('arrow'));