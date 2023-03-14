/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly IMAGEKIT_URL_ENDPOINT?: string | undefined;
	readonly IMAGEKIT_PUBLIC_KEY?: string | undefined;
	readonly IMAGEKIT_PRIVATE_KEY?: string | undefined;
	readonly IMAGEKIT_BASE_LOCAL_DIR?: string | undefined;
	readonly IMAGEKIT_REMOTE_DIR?: string | undefined;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
