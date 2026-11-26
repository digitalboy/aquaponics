import { bindings, defineConfig, triggers } from "cf/config";

export default defineConfig({
	worker: {
		name: "aquaponics-agri-intel",
		compatibilityDate: "2026-11-17",
		entrypoint: "src/index.ts",
		assets: {
			notFoundHandling: "single-page-application",
		},
		domains: [
			"intel.guoshu.dev",
		],
		triggers: [
			triggers.scheduled({
				schedule: "*/10 * * * *",
			}),
		],
		env: {
			CLOUDFLARE_ACCOUNT_ID: bindings.text("d06c9445a2675bdbf52fe47eab4f0278"),
			AI_GATEWAY_NAME: bindings.text("beike"),
			DECISION_MIN_SCORE: bindings.text("3.5"),
			MAX_DAILY_ITEMS: bindings.text("5"),
			LOOKBACK_HOURS: bindings.text("48"),
			INTEL_DB: bindings.d1({
				name: "aquaponics-agri-intel-db",
				id: "3423d090-1e2d-40a9-903b-d27d3c145d9a",
			}),
		},
	},
});
