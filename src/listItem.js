import { html } from 'https://cdn.skypack.dev/@arrow-js/core';

export default item => 
    html`
        <li>${item.task}</li>
    `.key(item.id)