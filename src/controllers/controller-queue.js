export class ControllerQueue {

    constructor(state) {
        this.state = state;
    }

    _setMediaSelection(index){
        console.log("set at index", index);
        if(index >= 0 && index <= (this.state.mediaqueue.songs.length-1)) {
            console.log("setting media selection");
            this.state.mediaselection = index;
        }
    }

    PlayId(id) {
        if(!id) return;

        const songIndex = this.state.mediaqueue.songs.findIndex(song => song.id === id);
        if(songIndex >= 0) {
            console.log("playingMedia", id);
            this._setMediaSelection(songIndex);
        }
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