export class ApiMediaSession {
	constructor() {
		this.ready = false;
	}

	Init(apiAudio, mediaQueue) {
		this.audio = apiAudio;
		this.queue = mediaQueue;

		this.ready = ('mediaSession' in navigator) ? true : false;

		this.InitHandlers();
	}

	InitHandlers(){
		if(!this.ready) return;

		const actionsAndHandlers = [
			['play', () => { this.audio.Play(); }],
			['pause', () => { this.audio.Pause(); }],
			['previoustrack', () => { this.queue.PlayPrevious(); }],
			['nexttrack', () => { this.queue.PlayNext(); }],
			['seekbackward', (details) => this.audio.Jump((details.seekOffset || 10), true)],
			['seekforward', (details) => this.audio.Jump((details.seekOffset || 10), false)],
			['seekto', (details) => { this.audio.Seek( details.seekTime ); }],
			['stop', () => { this.audio.Pause(); }]
		];
		 
		for (const [action, handler] of actionsAndHandlers) {
			try {
			  navigator.mediaSession.setActionHandler(action, handler);
			} catch (error) {
			  console.log(`The media session action, ${action}, is not supported`);
			}
		}
	}

	SetState(state) {
		if(!this.ready || isNaN(state)) return;

		const stateEnum = ["none", "playing", "paused"];

		navigator.mediaSession.playbackState = stateEnum[state] || stateEnum[0];
	}


	UpdateMeta(meta){
		if(!this.ready) return;

		const picked = (({ title, artist, album, artwork }) => ({ title, artist, album, artwork }))(meta);
		console.log("updating media session api", picked)
		navigator.mediaSession.metadata = new MediaMetadata(picked);
	}

	UpdatePosition({duration, playbackRate, position}){
		if(!this.ready) return;

		navigator.mediaSession.setPositionState(
			{duration, playbackRate, position}
		);
	}
}