import { ControllerCache } from "./controller-cache.js";

export class ControllerQueue {

    constructor(state, audioApi, mediaCache) {
        this.state = state;
        this.audioApi = audioApi;
        this.mediaCache = mediaCache;

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
            this.state.mediaqueue = {...data, songs: cacheData};
            this.state.mediaselection = 0;
            console.log("Queue Data Loaded", this.state.mediaqueue);
            if(autoplay) this.PlayFirst();
        });
    }

    CacheAll() {
        //TODO: Set a state value here to trigger a spinner. Update the state and the listing from the cache controller
        this.mediaCache.CachePlaylist(this.state.mediaqueue);
    }

    Shuffle() {
        
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