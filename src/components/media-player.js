import { html } from 'https://cdn.skypack.dev/@arrow-js/core';

function TestClick() {
    const mediaPlayer = document.getElementById("media-player");
    mediaPlayer.play();
}

function PlaySongObject(song, cb){
    // this.UnloadMediaFile();
    // this.meta = song;
    // console.log("🚀 ~ file: media-player.js ~ line 113 ~ extends ~ PlaySongObject ~ this.meta", this.meta)
    // this.meta.cb = cb;
    let howl = new Howl({
        src: song,
        html5: true,
        onplay: ()=>{
            // // Set the media volume to match the UI
            // this.howl.volume( this.controls.volume.value / 100 );
            // // Enable wake lock
            // this.noSleep.enable();
            // // Display the duration.
            // this.display.duration.innerHTML = this.formatTime(Math.round(this.howl.duration()));
            // // Update the media session api
            // if ('mediaSession' in navigator) {
            //     navigator.mediaSession.playbackState = "playing";
            // }
            // // Start upating the progress of the track.
            // requestAnimationFrame(this.Step.bind(this));
        },
        onpause: ()=>{
            // // Disable wake lock
            // this.noSleep.disable();
            // // Update the media session api
            // if ('mediaSession' in navigator) {
            //     navigator.mediaSession.playbackState = "paused";
            // }
        },
        onstop: ()=>{
            // // Disable wake lock
            // this.noSleep.disable();
            // // Update the media session api
            // if ('mediaSession' in navigator) {
            //     navigator.mediaSession.playbackState = "none";
            // }
        },
        onend: ()=>{
            // // Disable wake lock
            // this.noSleep.disable();
            // // Update the media session api
            // if ('mediaSession' in navigator) {
            //     navigator.mediaSession.playbackState = "none";
            // }
        }
    });

    howl.play();
}

export default src => 
	html`
	<audio id="media-player" controls src="${() => src}"></audio>
    <button @click="${() => PlaySongObject(src, null)}">Test</button>
	`;