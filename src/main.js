import App from './App.svelte';

import "./global.scss";
window.worker  = new Worker('webworker.js');
const app = new App({
	target: document.body
});

export default app;