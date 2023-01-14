export class ApiHowler {
    constructor(state) {
        this.state = state;
        this.meta = null;
    }

    PlayMediaSelection(){
        if(this.state.mediaselection < 0) return;
        const selectedSong = this.state.mediaqueue.songs[this.state.mediaselection];
        if(selectedSong.src && selectedSong.src[0]) {
            console.log("found song at index", this.state.mediaselection);
            this.meta = selectedSong;
            console.log("🚀 ~ file: media-player.js ~ line 113 ~ extends ~ PlaySongObject ~ this.meta", this.meta)
            this.PlaySongObject();
        }
    }

    PlaySongObject(){
        
		if(!this.meta) return;
		this.UnloadSongObject();
		//this.meta.cb = cb;
		this.howl = new Howl({
			src: this.meta.src[0],
			html5: true,
			onplay: ()=>{
				// Set the media volume to match the UI
				this.howl.volume( 1 / 100 );
				// Enable wake lock
				//this.noSleep.enable();
				// Display the duration.
				this.state.mediadisplay.title = this.meta.title;
				this.state.mediadisplay.duration = this.formatTime(Math.round(this.howl.duration()));
				// Update the media session api
				if ('mediaSession' in navigator) {
					navigator.mediaSession.playbackState = "playing";
				}
				// Start upating the progress of the track.
				//requestAnimationFrame(this.Step.bind(this));
			},
			onpause: ()=>{
				// Disable wake lock
				//this.noSleep.disable();
				// Update the media session api
				if ('mediaSession' in navigator) {
					navigator.mediaSession.playbackState = "paused";
				}
			},
			onstop: ()=>{
				// Disable wake lock
				//this.noSleep.disable();
				// Update the media session api
				if ('mediaSession' in navigator) {
					navigator.mediaSession.playbackState = "none";
				}
			},
			onend: ()=>{
				// Disable wake lock
				//this.noSleep.disable();
				// Update the media session api
				if ('mediaSession' in navigator) {
					navigator.mediaSession.playbackState = "none";
				}
			}
		});

		this.howl.on('end', this.meta.cb);

		//this.UpdateMediaSessionApi();
		this.Play();
	}

    UnloadSongObject(){
        console.log('Unloading audio file', this.howl);
        if(this.howl && this.howl.unload) this.howl.unload();
    }

    /**
     * UI Control Functions
     */

	Play(){
		if(!this.howl || this.howl.playing()) return;
		this.howl.play();
	}

    Pause(){
		if(!this.howl || !this.howl.playing()) return;
		this.howl.pause();
	}

}