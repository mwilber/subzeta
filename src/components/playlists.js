import { html } from '../vendor/@arrow-js/core/index.min.mjs';

export default (data, loadPl) => {
	if(data && data.length)
	return html`
		<ul>
			${() => data.map(({id, name, songCount}) => {
				if(!parseInt(songCount)) return;
				return html`
					<li>
						<button 
							@click="${() => loadPl(id)}"
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