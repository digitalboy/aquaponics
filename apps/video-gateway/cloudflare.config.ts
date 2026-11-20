import { bindings, defineConfig, triggers } from "cf/config";

// D1 迁移目录由 `cf d1 migrations apply --dir` 指定，默认即 `./migrations`
export default defineConfig({
	worker: {
		name: "aquaponics-video-gateway",
		compatibilityDate: "2024-11-01",
		entrypoint: "src/index.ts",
		domains: [
			"video-gw.guoshu.dev",
		],
		triggers: [
			triggers.scheduled({
				schedule: "*/2 * * * *",
			}),
		],
		env: {
			DEFAULT_SITE_ID: bindings.text("guangming-01"),
			WAKE_TTL_SEC: bindings.text("180"),
			TOKEN_TTL_SEC: bindings.text("600"),
			ALLOWED_ORIGINS: bindings.text("*"),
			ALERT_EMAIL_TO: bindings.text("digitalboyzone@gmail.com"),
			ALERT_EMAIL_FROM: bindings.text("video-alert@guoshu.dev"),
			HEARTBEAT_TIMEOUT_SEC: bindings.text("300"),
			SNAPSHOT_STALE_SEC: bindings.text("1500"),
			ALERT_COOLDOWN_SEC: bindings.text("1800"),
			DIGEST_INTERVAL_SEC: bindings.text("3600"),
			VIDEO_DB: bindings.d1({
				name: "aquaponics-video-db",
				id: "872bd8e2-012e-4922-bc43-8b48314e87f2",
			}),
			VIDEO_R2: bindings.r2({
				name: "aquaponics-video-media",
			}),
			EMAIL: bindings.sendEmail({
				destinationAddress: "digitalboyzone@gmail.com",
			}),
		},
	},
});
