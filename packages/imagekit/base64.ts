export async function getBase64DataURI(urlForB64: string) {
	const buffer = await fetch(urlForB64).then((r) => r.arrayBuffer());

	const b = Buffer.from(buffer).toString('base64');

	const b64Placeholder = `data:image/jpeg;base64,${b}`;
	return b64Placeholder;
}
