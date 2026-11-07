import { describe, expect, it } from 'vitest';
import vercelConfig from '../vercel.json';

// Every route is prerendered, so SvelteKit hooks never run and vercel.json is the only place the
// security headers are set. `vite preview` ignores vercel.json, so this test is the local guard.
describe('vercel.json headers', () => {
	it('sends the security header baseline on every path', () => {
		const rule = vercelConfig.headers.find(({ source }) => source === '/(.*)');
		const headers = Object.fromEntries(rule?.headers.map(({ key, value }) => [key, value]) ?? []);

		expect(headers).toEqual({
			'X-Content-Type-Options': 'nosniff',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
			'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
			'Content-Security-Policy':
				"frame-ancestors 'self' https://jakezohdi.dev https://studio-zohdi-llc.com https://www.studio-zohdi-llc.com"
		});
	});
});
