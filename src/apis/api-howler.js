export class ApiHowler {
    constructor(state) {
        this.state = state;
        this.meta = null;
		this.onEnd = null;
    }

	_formatTime(secs) {
		var minutes = Math.floor(secs / 60) || 0;
		var seconds = (secs - minutes * 60) || 0;
	
		return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
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
		this.howl = new Howl({
			src: this.meta.src[0],
			html5: true,
			onplay: ()=>{
				// Set the media volume to match the UI
				this.howl.volume( 2 / 100 );
				// Enable wake lock
				//this.noSleep.enable();
				// Display the duration.
				this.state.mediadisplay.duration = this._formatTime(Math.round(this.howl.duration()));
				// Update the media session api
				if ('mediaSession' in navigator) {
					navigator.mediaSession.playbackState = "playing";
				}
				// Start upating the progress of the track.
				requestAnimationFrame(this.Step.bind(this));
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

		this.howl.on('end', () => {
			if(this.onEnd) this.onEnd();
		});
		this.state.mediadisplay.title = this.meta.title;
		this.state.mediadisplay.time = this._formatTime(0);
		this.state.mediadisplay.duration = "--";

		//this.UpdateMediaSessionApi();
		this.Play();
	}

    UnloadSongObject(){
        console.log('Unloading audio file', this.howl);
        if(this.howl && this.howl.unload) this.howl.unload();
    }

	Step(){
		let self = this;

		// Get the Howl we want to manipulate.
		let sound = self.howl;

		// Determine our current seek position.
		let seek = sound.seek() || 0;
		let duration = this.howl.duration();
		this.state.mediadisplay.time = self._formatTime(Math.round(seek));
		//progress.style.width = (((seek / sound.duration()) * 100) || 0) + '%';

		// Update the scrubber position
		// if (document.activeElement != this.controls.scrubber){
		this.state.mediadisplay.progress = Math.floor((seek/duration)*100);
		// }

		// Update the media session api
		if ('mediaSession' in navigator) {
			navigator.mediaSession.setPositionState({
				duration: duration,
				playbackRate: this.howl.rate(),
				position: seek
			});
		}

		// If the sound is still playing, continue stepping.
		if (sound.playing()) {
			requestAnimationFrame(self.Step.bind(self));
		}
	}

    /**
     * UI Control Functions
     */

	Play(){
		if(!this.howl) this.PlayMediaSelection();
		if(!this.howl.playing()) this.howl.play();
	}

    Pause(){
		if(this.howl && this.howl.playing())
			this.howl.pause();
	}

	/**
	 * 
	 * @param {number} percent value between 1 and 100 
	 */
	Scrub(percent){
		if(isNaN(percent) || !this.howl || !this.howl.duration) return;
		console.log('scrubber changed', percent);
		let duration = this.howl.duration();
		this.howl.seek( duration * (percent / 100) );
	}

	Jump(duration, reverse){
		
	}

}