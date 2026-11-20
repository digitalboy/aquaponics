import { defineConfig } from "cf/config";

export default defineConfig({
	worker: {
		name: "aquaponics-video-console",
		compatibilityDate: "2026-11-17",
		assets: {
			notFoundHandling: "single-page-application",
		},
		domains: [
			"video.guoshu.dev",
		],
	},
});
