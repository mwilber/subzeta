export class ApiHowler {
	constructor(state, mediaSession) {
		this.state = state;
		this.mediaSession = mediaSession;
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
			this.meta = {
				title: selectedSong.title,
				artist: selectedSong.artist,
				artistId: selectedSong.artistId,
				album: selectedSong.album,
				albumId: selectedSong.albumId,
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
				this.Volume( this.state.volume || 1 );
				// Enable wake lock
				//this.noSleep.enable();
				// Display the duration.
				this.state.mediadisplay.duration = this._formatTime(Math.round(this.howl.duration()));
				// Update the media session api
				this.mediaSession.SetState(1);
				this.state.playing = true;
				// Start upating the progress of the track.
				requestAnimationFrame(this.Step.bind(this));
			},
			onpause: ()=>{
				// Disable wake lock
				//this.noSleep.disable();
				// Update the media session api
				this.mediaSession.SetState(2);
				this.state.playing = false;
			},
			onstop: ()=>{
				// Disable wake lock
				//this.noSleep.disable();
				// Update the media session api
				this.mediaSession.SetState(0);
				this.state.playing = false;
			},
			onend: ()=>{
				// Disable wake lock
				//this.noSleep.disable();
				// Update the media session api
				this.mediaSession.SetState(0);
				this.state.playing = false;
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

		this.mediaSession.UpdateMeta(this.meta);
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
		this.state.mediadisplay.progress = Math.floor((seek/duration)*100);

		// Update the media session api
		this.mediaSession.UpdatePosition({
			duration: duration,
			playbackRate: this.howl.rate(),
			position: seek
		});

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
		else if(!this.howl.playing()) this.howl.play();
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
		if(!this.howl) return;
		let seek = this.howl.seek() || 0;
		seek = Math.max(0, reverse ? (seek - duration) : (seek + duration));
		
		this.howl.pause();
		this.howl.seek(seek);
		this.howl.play();
	}

	Seek(time){
		if(!this.howl) return;
		
		this.howl.pause();
		this.howl.seek(time);
		this.howl.play();
	}

	/**
	 * 
	 * @param {number} percent value between 1 and 100 
	 */
	Volume(percent){
		if(isNaN(percent) || !this.howl) return;
		this.state.volume = percent;
		let volVal = this.state.volume / 100;
		console.log('setting volume to', volVal);
		this.howl.volume( volVal );
	}

}