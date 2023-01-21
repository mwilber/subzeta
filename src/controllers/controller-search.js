export class ControllerSearch {
	constructor(state, api) {
		this.state = state;
		this.api = api;
	}

	async Search(e) {

		e.preventDefault();
		this.state.activepanel = 'search';
		this.state.fullscreen = false;
		const input = document.getElementById('search-query');
		
		console.log("Searching for", input.value);
		
		this.listing = await this.api.GetSearch2(input.value);
		console.log("search result: ", this.listing);
		if(!this.listing) return;
		this.state.searchresults = this.listing;
		input.value = '';

	}
}