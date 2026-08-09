import adapter from '@sveltejs/adapter-static';

const basePath = process.env.DEVCORE_EXTENSIONS_BASE_PATH || '';

export default {
	kit: {
		paths: {
			base: basePath
		},
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically - see below
			pages: 'public',
			assets: 'public',
			fallback: undefined,
			precompress: false,
			strict: true
		})
	},
};
