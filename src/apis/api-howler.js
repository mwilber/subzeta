export class ApiHowler {
    constructor(state) {
        this.state = state;
        this.meta = null;
		this.onEnd = null;

		this.InitMediaSessionHandlers();
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
            this.meta = {
				title: selectedSong.title,
				artist: selectedSong.artist,
				album: selectedSong.album,
				artwork: JSON.parse(JSON.stringify(selectedSong.coverArt)),
				src: selectedSong.src[0]
			};
            console.log("🚀 ~ file: media-player.js ~ line 113 ~ extends ~ PlaySongObject ~ this.meta", this.meta)
            this.PlaySongObject();
        }
    }

    PlaySongObject(){
        
		if(!this.meta || !this.meta.src) return;
		this.UnloadSongObject();
		this.howl = new Howl({
			src: this.meta.src,
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

		this.state.mediadisplay = {
			...this.meta,
			time: this._formatTime(0),
			duration: '--'
		};

		this.UpdateMediaSessionApi();
		this.Play();
	}

    UnloadSongObject(){
        console.log('Unloading audio file', this.howl);
        if(this.howl && this.howl.unload) this.howl.unload();
    }

	InitMediaSessionHandlers(){
		const actionsAndHandlers = [
			['play', () => { this.Play(); }],
			['pause', () => { this.Pause(); }],
			// ['previoustrack', () => { this.PreviousMediaFile(); }],
			// ['nexttrack', () => { this.NextMediaFile(); }],
			// ['seekbackward', (details) => { 
			// 	let seek = this.howl.seek() || 0;
			// 	this.howl.seek( seek - (details.seekOffset || 10) ); 
			// }],
			// ['seekforward', (details) => {
			// 	let seek = this.howl.seek() || 0;
			// 	this.howl.seek( seek + (details.seekOffset || 10) );
			// }],
			// ['seekto', (details) => { this.howl.seek( details.seekTime ); }],
			['stop', () => { this.Pause(); }]
		];
		 
		for (const [action, handler] of actionsAndHandlers) {
			try {
			  navigator.mediaSession.setActionHandler(action, handler);
			} catch (error) {
			  console.log(`The media session action, ${action}, is not supported`);
			}
		}
	}

	UpdateMediaSessionApi(){
		if ('mediaSession' in navigator) {
			const picked = (({ title, artist, album, artwork }) => ({ title, artist, album, artwork }))(this.meta);
			console.log("updating media session api", picked)
			navigator.mediaSession.metadata = new MediaMetadata(picked);
		}
	}

	Step(){
		let self = this;

		// Get the Howl we want to manipulate.
		let sound = self.howl;

		// Determine our current seek position.
		let seek = sound.seek() || 0;
		let duration = this.howl.duration();
		this.state.mediadisplay.time = self._formatTime(Math.round(seek));
		this.state.mediadisplay.progress = Math.floor((seek/duration)*100);

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