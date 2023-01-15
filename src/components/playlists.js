import { html } from 'https://cdn.skypack.dev/@arrow-js/core';

export default (data) => {
    if(data && data.length)
	return html`
        <ul>
            ${() => data.map(({id, name, songCount}) => {
                if(!parseInt(songCount)) return;
                return html`
                    <li>
                        <button 
                            @click="${() => queue.PlayId(id)}"
                            data-id="${id}"
                            data-name="${name}"
                            data-songcount="${songCount}"
                        >
                            ${name} (${songCount})
                        </button>
                    </li>
                `.key(id);
            })}
        </ul>
	`;
}