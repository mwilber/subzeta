const API_VERSION = '1.16.1';
const CLIENT_NAME = 'subzeta';
const ToArray = (value) => {
	if(!value) return [];
	return Array.isArray(value) ? value : [value];
};

export class ApiSubsonic{

	constructor(settings){
		this.settings = settings;
	}

	GetServerQuery(method, params){
		const {server, apiKey} = this.settings;

		if(!server || !apiKey) return;

		const baseUrl = server.replace(/\/+$/, '');
		const query = new URL(`${baseUrl}/rest/${method}.view`);
		const searchParams = new URLSearchParams({
			apiKey,
			v: API_VERSION,
			f: 'json',
			c: CLIENT_NAME,
			...params
		});

		query.search = searchParams.toString();
		return query.toString();
	}

	async FetchJson(method, params = {}){
		const url = this.GetServerQuery(method, params);
		if(!url) return;

		const response = await fetch(url);
		if(!response.ok) return;

		const data = await response.json();
		const body = data['subsonic-response'];
		if(!body || body.status !== 'ok') return;

		return body;
	}

	FormatSongObject(data){
		//TODO: validate the data object
		const coverArtId = data.coverArt || data.albumId || data.id;
		return {
			id: data.id,
			album: data.album,
			albumId: data.albumId,
			artist: data.artist,
			artistId: data.artistId,
			title: data.title,
			coverArt: [
				{
					src: this.GetServerQuery('getCoverArt',{id: coverArtId, size: 256}),
					sizes: '256x256', 
					type: 'image/png'
				}
			],
			src: [
				this.GetServerQuery('download',{id: data.id})
			]
		};
	}

	async GetSong(id){
		const body = await this.FetchJson('getSong', {id});
		if(!body || !body.song) return;
		const song = Array.isArray(body.song) ? body.song[0] : body.song;
		return this.FormatSongObject(song);
	}

	async GetAlbum(id){
		if(!id) return;

		const body = await this.FetchJson('getAlbum', {id});
		if(!body || !body.album || !body.album.song) return;

		const playlistObj = {
			name: body.album.name,
			songs: []
		}
		ToArray(body.album.song).forEach((song)=>{
			playlistObj.songs.push(this.FormatSongObject(song))
		});
		return playlistObj;
	}

	async GetArtistAlbums(id){
		if(!id) return;

		const body = await this.FetchJson('getArtist', {id});
		if(!body || !body.artist || !body.artist.album) return;

		const playlistObj = {
			albums: []
		}
		ToArray(body.artist.album).forEach((album)=>{
			playlistObj.albums.push(album)
		});
		return playlistObj;
	}

	async GetPlaylist(id){
		// TODO: remove this defualt value
		id = id || '800000013';

		const body = await this.FetchJson('getPlaylist', {id});
		if(!body || !body.playlist || !body.playlist.entry) return;

		const playlistObj = {
			name: body.playlist.name,
			songs: []
		}
		ToArray(body.playlist.entry).forEach((song)=>{
			playlistObj.songs.push(this.FormatSongObject(song))
		});
		return playlistObj;
	}

	async GetPlaylists(){
		const body = await this.FetchJson('getPlaylists');
		if(!body) return;

		let playlistsObj = [];
		if(body.playlists && body.playlists.playlist)
			playlistsObj = ToArray(body.playlists.playlist);

		return playlistsObj;
	}

	async GetSearch3(query){
		if(!query) return;

		const body = await this.FetchJson('search3',{
			query,
			artistCount: 20,
			albumCount: 20,
			songCount: 50
		});
		if(!body || !body.searchResult3) return;

		const {searchResult3} = body;
		let searchResultObj = {
			albums: [],
			artists: [],
			songs: []
		}
		// Format Songs
		if(searchResult3.song)
			ToArray(searchResult3.song).forEach((song)=>{
				searchResultObj.songs.push(this.FormatSongObject(song))
			});
		// Add Albums
		if(searchResult3.album)
			searchResultObj.albums = ToArray(searchResult3.album);
		// Add artists
		if(searchResult3.artist)
			searchResultObj.artists = ToArray(searchResult3.artist);
		return searchResultObj;
	}
}
