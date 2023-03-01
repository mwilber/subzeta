import { ControllerCache } from "./controller-cache.js";

export class ControllerQueue {

	constructor(state, audioApi, mediaCache) {
		this.state = state;
		this.audioApi = audioApi;
		this.mediaCache = mediaCache;

		// Listen for messages on the fetch/cache status from the ServiceWorker
		navigator.serviceWorker.addEventListener("message", (event) => {
			console.log(event.data);
			const { type: eventType } = event.data;
			if (eventType !== 'fetching' & eventType !== 'cached') return;


			let tempQueue = JSON.parse(JSON.stringify(state.mediaqueue));
			tempQueue.songs.forEach((song) => {
				if (song.src[0] === event.data.url) {
					song.cached = eventType === 'fetching' ? -1 : 1;
				}
			});
			// state.mediaqueue.songs.forEach((song) => {
			// 	console.log("comparing", song.src[0], event.data.url, (song.src[0] === event.data.url))
			// 	tempQueue.songs.push({...song, cached:(song.src[0] === event.data.url || song.cached)});
			// });

			
			console.log("tempQueue", tempQueue);

			this.state.mediaqueue = tempQueue;

			// for (let idx=0; idx < state.mediaqueue.songs.length; idx++) {
			// 	console.log("checking for", state.mediaqueue.songs[idx], idx)
			// 	if (state.mediaqueue.songs[idx].src[0] === event.data.url) {
			// 		console.log("found", event.data.url)
			// 		state.mediaqueue.songs[idx].cached = true;
			// 	}
			// }
			// let theOne = state.mediaqueue.songs.find((song) => {
			// 	return song.src[0] === event.data.url;
			// });

			// console.log("Zathrus found the one", theOne);
			// if (theOne) theOne.cached = true;
		});

		// TODO: tie this into a user setting
		this.audioApi.onEnd = this.PlayNext.bind(this);
	}

	_setMediaSelection(index) {
		console.log("set at index", index);
		if(index >= 0 && index <= (this.state.mediaqueue.songs.length-1)) {
			console.log("setting media selection");
			this.state.mediaselection = index;
			this.audioApi.PlayMediaSelection();
		}
	}

	async _getCacheStatus (item) {
		item.cached = await this.mediaCache.IsCached(item.src[0]);
		return item;
	}

	async _getCacheData (mediaListing) {
		return Promise.all(mediaListing.map(item => this._getCacheStatus(item)))
	}

	LoadData (data, autoplay){
		if(!data || !data.songs) return;
		this._getCacheData(data.songs).then(cacheData => {
			console.log('cacheData', cacheData);
			this.state.mediaqueue = {...data, songs: cacheData};
			this.state.mediaselection = 0;
			console.log("Queue Data Loaded", this.state.mediaqueue);
			if(autoplay){
				this.PlayFirst();
				this.state.activepanel = 'queue';
				this.state.fullscreen = true;
			}
		});
	}

	CacheAll() {
		//TODO: Set a state value here to trigger a spinner. Update the state and the listing from the cache controller
		this.mediaCache.CachePlaylist(this.state.mediaqueue);
	}

	Shuffle() {
		let tmpQueue = JSON.parse(JSON.stringify(this.state.mediaqueue));
		
		/* Shuffle the playlist using Durstenfeld algorithm */
		for (let i = tmpQueue.songs.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random() * (i + 1));
			let temp = tmpQueue.songs[i];
			tmpQueue.songs[i] = tmpQueue.songs[j];
			tmpQueue.songs[j] = temp;
		}

		console.log("temp queue", tmpQueue);
		this.state.mediaqueue = tmpQueue;
		this.state.mediaselection = -1;
	}

	PlayId(id) {
		if(!id) return;

		const songIndex = this.state.mediaqueue.songs.findIndex(song => song.id === id);
		if(songIndex >= 0) {
			console.log("playingMedia", id);
			this._setMediaSelection(songIndex);
		}
	}

	PlayFirst() {
		this._setMediaSelection(0);
	}
	
	PlayNext() {
		let {mediaselection, mediaqueue} = this.state;
		if(mediaselection === null || mediaselection >= (mediaqueue.songs.length-1)) 
			this._setMediaSelection(0);
		else 
			this._setMediaSelection((mediaselection + 1));
	}

	PlayPrevious() {
		let {mediaselection, mediaqueue} = this.state;
		if(mediaselection === null || mediaselection === 0) 
			this._setMediaSelection(mediaqueue.songs.length-1);
		else 
			this._setMediaSelection((mediaselection - 1));
	}
}