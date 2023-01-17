import { html } from 'https://cdn.skypack.dev/@arrow-js/core';

export default (data, loadAlbum, loadArtist) => 
	html`
		<h2>Display</h2>
		<div>Title: ${data.title}</div>
		<div>Album: <button @click="${() => {loadAlbum(data.albumId)}}">${data.album}</button></div>
		<div>Artist: <button @click="${() => {loadArtist(data.artistId)}}">${data.artist}</button></div>
		<div>Time: ${data.time}</div>
		<div>Duration: ${data.duration}</div>
	`;