/* eslint-disable */

import type { GetStaticPaths, APIRoute } from 'astro';
import { html2png, html } from '@astro-content/html2png';

export const getStaticPaths: GetStaticPaths = () => {
	return [
		{ params: { route: 'default.png' } },

		// ...
		// Do your typical paths sourcing logic here
	];
};

export const get: APIRoute = async ({ params }) => {
	const styles = {
		container: `
			height: 100%;
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			background-color: rgb(45, 26, 84);
			font-size: 32px;
			font-weight: 600;`,

		title: `
			margin-left: 15ch;
			color: rgb(255, 93, 1);`,

		wrap: `
			font-size: 70px;
			margin-top: 38px;
			display: flex;
			flex-direction: column;
			color: white;`,
	};

	// …Do your variables logic here…
	const title = params.route;

	const markup = html` <!--  -->
		<div style="${styles.container}">
			<div style="${styles.wrap}">
				<span>
					Hello from
					<span style="${styles.title}">${title}</span>
				</span>
			</div>
		</div>`;

	const {
		responses: { png },
	} = await html2png({ markup });

	return new Response(...png);
};
