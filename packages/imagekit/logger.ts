import yaml from 'yaml';
import kleur from 'kleur';
import { highlight } from 'cli-highlight';

const logPrefix = () =>
	`${kleur.gray().dim(new Date().toLocaleTimeString())} ${kleur
		.magenta()
		.bold('[imagekit] ')}`;

export function log(
	fmt: ({
		k,
	}: {
		/** Kleur formatting */
		k: typeof kleur;
	}) => string | undefined,
) {
	// if (import.meta.env.PROD) return;

	const formatted = fmt({ k: kleur });
	console.log(`${logPrefix()}${formatted ?? 'Undefined'}`);
}

export function dump(input: unknown) {
	// if (import.meta.env.PROD) return;

	const formatted = highlight(yaml.stringify(input, null, 2), {
		language: 'yaml',
		ignoreIllegals: true,
	});

	console.log(`${logPrefix()}— DUMP —\n${formatted}`);
}
