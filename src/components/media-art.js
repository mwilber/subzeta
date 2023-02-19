import { html } from '../vendor/@arrow-js/core/index.min.mjs';

export default (data) => 
	html`
		<!--<div id="display-artwork" style="background-image: url('${data.artwork}')"></div>-->
		<img id="display-artwork" src="${data.artwork}" crossorigin="Anonymous" onload="HandleImg(this)" />
	`;