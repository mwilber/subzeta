import { html } from '../vendor/@arrow-js/core/index.min.mjs';

const HandleImg = function (el) {
	//console.log("*** image loaded", el);
	if (!el || !ColorThief) return;

	const {style} = document.documentElement;
	const colorThief = new ColorThief();
	const color = colorThief.getColor(el);
	const colorFg = BlackOrWhite(color[0], color[1], color[2]);

	style.setProperty('--player-color-bg', `rgb(${color[0]},${color[1]},${color[2]})`);
	style.setProperty('--player-color-fg', colorFg);
}

const BlackOrWhite = function (red, green, blue) {
	return ((red*0.299 + green*0.587 + blue*0.114) > 160) ? "black" : "white";
}

export default (data) => 
	html`
		<div id="display-artwork" style="background-image: url('${data.artwork}')"></div>
		<img id="display-artwork-ref" src="${data.artwork}" crossorigin="Anonymous" @load="${(e) => HandleImg(e.target)}" />
	`;