import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		include: ['svelte-email']
	},
	ssr: {
		noExternal: ['svelte-email']
	}
});
