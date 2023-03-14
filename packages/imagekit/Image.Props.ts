/// <reference types="astro/astro-jsx" />

import type { UrlOptions } from 'imagekit/dist/libs/interfaces';

export const formats = ['png', 'jpeg', 'jpg', 'gif'];

/* NOTE: Could be configurable */
export const attributes = {
	hasJs: 'data-has-js',
	isLazy: 'data-is-lazy',
	isLoaded: 'data-is-loaded',
} as const;

export interface Props {
	/**
	 * File path, relative to project root.
	 *
	 * @remark
	 *
	 * This is a shortcut to `urlOptions.path` setting,
	 * for simple use case without additional transforms.
	 *
	 * @remark
	 *
	 * Given `./content` is set as your base lookup directory for medias,
	 *
	 * `path="content/posts/some-post/my-pic.jpeg"` \
	 * 	*⬇︎ Will push synchronize the original file to ⬇︎* \
	 * `https://imagekit.io/username/base-dir/posts/some-post/my-pic.jpeg`
	 */
	path: string;

	/**
	 * Options for generating an URL
	 *
	 * @see {@link https://github.com/imagekit-developer/imagekit-nodejs#url-generation}
	 */
	urlOptions?: UrlOptions;

	/** Inline, low-res image which appears before full image load */
	placeholder?: {
		/**
		 * In **pixels**
		 *
		 * @default 64
		 */
		width?: number;
	};

	/**
	 * Responsive source set sizes variants. Width in **pixels**.
	 * */
	widths: number[];
	/**
	 * Responsive possible sizes.
	 * */
	sizes?: string;

	/**
	 * Actual image width, in **CSS unit**
	 * */
	width: string;
	// /** Actual image height, in **CSS unit** */
	// height: string;
}
