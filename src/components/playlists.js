import { html } from '../vendor/@arrow-js/core/index.min.mjs';

export default (data, keyboardFocus, loadPl) => {
	if(data && data.length)
	return html`
		<ul>
			${() => data.filter(({songCount}) => parseInt(songCount)).map(({id, name, songCount}, index) => {
				return html`
					<li>
						<button 
							@click="${() => loadPl(id)}"
							data-keyboard-list-item
							data-keyboard-selected="${() => keyboardFocus?.panel === 'playlists' && keyboardFocus?.index === index}"
							data-id="${id}"
							data-name="${name}"
							data-songcount="${songCount}"
						>
							${name} <span>${songCount}</span>
						</button>
					</li>
				`.key(id);
			})}
		</ul>
	`;
}
