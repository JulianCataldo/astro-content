import { attributes } from './Image.Props.js';

const imgElems = document.querySelectorAll(`picture[${attributes.hasJs}] img`);

imgElems.forEach((img) => {
	if (!(img instanceof HTMLImageElement)) return;

	function toggle() {
		img.toggleAttribute(attributes.isLoaded);
	}
	if (img.complete) {
		/* Already loaded (in cache or very fast…) */
		toggle();
	} else {
		img.addEventListener('load', () => toggle());
	}
});

export {};
