/** 生成轻量级多路监控前端页面（直接托管于 Video Gateway，无需额外前端服务器） */
export function renderMonitorHtml(): string {
  return `<!doctype html>
<html lang="zh-CN" class="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>鱼菜共生基地 · 边缘视频监控台</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js"></script>
</head>
<body class="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
  <header class="border-b border-zinc-800 bg-zinc-900/70 px-4 py-3">
    <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-base font-semibold tracking-tight">数字化农业工厂 · 视频监控台</h1>
        <p class="text-xs text-zinc-400">Cloudflare Workers + R2 + 倍控 N100 (4G 按需唤醒 / 省流快照)</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <select id="refreshInterval" class="rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none">
          <option value="15" selected>快照 15秒自动刷新</option>
          <option value="30">快照 30秒自动刷新</option>
          <option value="0">关闭自动刷新</option>
        </select>
        <input id="apiKey" type="password" placeholder="输入 INTERNAL_API_KEY (看内部安防机位)"
          class="w-64 rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none" />
        <button id="saveKeyBtn"
          class="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500">加载机位</button>
      </div>
    </div>
  </header>

  <main class="mx-auto max-w-6xl p-4">
    <div id="statusBar" class="mb-4 text-xs text-zinc-400">正在加载机位列表...</div>
    <div id="grid" class="grid grid-cols-1 gap-4 md:grid-cols-2"></div>
  </main>

  <script>
    const keyInput = document.getElementById("apiKey");
    const refreshSelect = document.getElementById("refreshInterval");
    const saveBtn = document.getElementById("saveKeyBtn");
    const statusBar = document.getElementById("statusBar");
    const grid = document.getElementById("grid");

    keyInput.value = localStorage.getItem("aquaponics_video_key") || "";
    const activePlayers = new Map();
    const snapshotRefreshers = new Set();
    const ringUpdaters = new Set();
    let autoRefreshTimer = null;
    let remainingSec = 15;

    function formatLocalTime(isoUtc) {
      if (!isoUtc) return "";
      const d = new Date(isoUtc);
      return Number.isNaN(d.getTime()) ? isoUtc : d.toLocaleString("zh-CN", { hour12: false });
    }

    function getHeaders() {
      const k = keyInput.value.trim();
      return k ? { Authorization: "Bearer " + k } : {};
    }

    async function loadCameras() {
      statusBar.textContent = "正在查询机位...";
      grid.innerHTML = "";
      snapshotRefreshers.clear();
      ringUpdaters.clear();
      for (const cleanup of activePlayers.values()) cleanup();
      activePlayers.clear();

      try {
        const res = await fetch("/api/v1/cameras", { headers: getHeaders() });
        const data = await res.json();
        statusBar.textContent = "当前身份: " + data.role + " · 共 " + data.cameras.length + " 路机位 (仅显示已启用机位，含 disabled 共 " + data.cameras.length + " 路)";
        const visible = data.cameras.filter(c => c.stream_mode !== "disabled");
        if (visible.length === 0) {
          grid.innerHTML = '<div class="rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-400">当前权限下暂无已启用机位，请填入 INTERNAL_API_KEY 后点击“加载机位”。</div>';
          return;
        }
        visible.forEach(renderCard);
      } catch (e) {
        statusBar.textContent = "加载失败: " + e.message;
      }
    }

    function renderCard(cam) {
      const card = document.createElement("div");
      card.className = "overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60";
      card.innerHTML = \`
        <div class="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
          <div>
            <span class="text-sm font-medium">\${cam.name}</span>
            <span class="ml-2 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">\${cam.cam_id}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <button data-mode="snapshot" class="btn-snap rounded bg-zinc-800 px-2.5 py-1 text-xs hover:bg-zinc-700">最新快照</button>
            <!-- 后端 on-demand 按需直播逻辑完整保留；一期纯 4G 省流阶段前端暂不渲染“4G按需直播”入口，待需要时取消隐藏即可 -->
          </div>
        </div>
        <div class="relative aspect-video bg-black">
          <img class="snap-img h-full w-full object-cover" alt="\${cam.name}" />
          <video class="live-vid hidden h-full w-full object-cover" controls autoplay muted playsinline></video>
          <div class="ring-badge pointer-events-none absolute left-2.5 bottom-2.5 flex items-center gap-1.5 rounded-full bg-black/70 px-2 py-1 text-[11px] text-zinc-200 backdrop-blur-sm">
            <svg class="h-4 w-4 -rotate-90" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="7" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2.5" />
              <circle class="ring-arc transition-all duration-700" cx="10" cy="10" r="7" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="43.98" stroke-dashoffset="0" />
            </svg>
            <span class="ring-sec tabular-nums">15s</span>
          </div>
          <div class="overlay absolute inset-0 flex items-center justify-center bg-black/65 text-xs text-zinc-200">点击“最新快照”或“4G按需直播”</div>
        </div>
        <div class="meta flex items-center justify-between px-3 py-1.5 text-[11px] text-zinc-400">
          <span>模式: \${cam.stream_mode} · 权限: \${cam.visibility}</span>
          <span class="ts"></span>
        </div>
      \`;
      grid.appendChild(card);

      const img = card.querySelector(".snap-img");
      const vid = card.querySelector(".live-vid");
      const overlay = card.querySelector(".overlay");
      const ringBadge = card.querySelector(".ring-badge");
      const ringArc = card.querySelector(".ring-arc");
      const ringSec = card.querySelector(".ring-sec");
      const tsEl = card.querySelector(".ts");
      let lastCapturedAt = "";
      let cardMode = "snapshot";

      ringUpdaters.add((rem, total) => {
        if (cardMode !== "snapshot" || total <= 0) {
          ringBadge.classList.add("hidden");
          return;
        }
        ringBadge.classList.remove("hidden");
        const circumference = 43.98;
        const offset = circumference * (1 - Math.max(0, rem) / total);
        ringArc.setAttribute("stroke-dashoffset", offset.toFixed(2));
        ringSec.textContent = rem <= 0 ? "刷新中" : rem + "s";
      });

      function stopCurrent() {
        const prev = activePlayers.get(cam.cam_id);
        if (prev) prev();
        activePlayers.delete(cam.cam_id);
      }

      async function showSnapshot(silent = false) {
        if (!silent) {
          stopCurrent();
          cardMode = "snapshot";
          vid.classList.add("hidden");
          img.classList.remove("hidden");
          if (!lastCapturedAt) {
            overlay.classList.remove("hidden");
            overlay.textContent = "加载最新快照...";
          }
        }
        const res = await fetch("/api/v1/snapshots/" + encodeURIComponent(cam.cam_id) + "?refresh=1", { headers: getHeaders() });
        const data = await res.json();
        if (!res.ok || !data.snapshots?.length) {
          if (!lastCapturedAt) overlay.textContent = data.error || "暂无快照";
          return;
        }
        const latest = data.snapshots[0];
        if (latest.captured_at !== lastCapturedAt) {
          const pre = new Image();
          pre.onload = () => {
            img.src = latest.url;
            lastCapturedAt = latest.captured_at;
            tsEl.textContent = formatLocalTime(latest.captured_at) + " (" + Math.round(latest.size_bytes / 1024) + " KB)";
            tsEl.title = latest.captured_at;
            overlay.classList.add("hidden");
          };
          pre.src = latest.url;
        } else {
          overlay.classList.add("hidden");
        }
      }

      snapshotRefreshers.add(() => {
        if (cardMode === "snapshot" && !document.hidden) showSnapshot(true);
      });

      async function showLive() {
        stopCurrent();
        cardMode = "live";
        ringBadge.classList.add("hidden");
        let cancelled = false;
        let timer = null;
        let hls = null;
        activePlayers.set(cam.cam_id, () => {
          cancelled = true;
          if (timer) clearTimeout(timer);
          if (hls) hls.destroy();
        });

        img.classList.add("hidden");
        vid.classList.remove("hidden");
        overlay.classList.remove("hidden");
        overlay.textContent = "正在下发 4G 唤醒指令...";

        async function poll() {
          if (cancelled) return;
          const res = await fetch("/api/v1/streams/" + encodeURIComponent(cam.cam_id) + "/live", { headers: getHeaders() });
          const data = await res.json();
          if (cancelled) return;
          if (!res.ok) {
            overlay.textContent = data.error || "拉流失败";
            return;
          }
          if (data.status === "waking") {
            overlay.textContent = "正在唤醒倍控 N100 推流 (约 5~10 秒)...";
            timer = setTimeout(poll, 2000);
            return;
          }
          overlay.classList.add("hidden");
          tsEl.textContent = "LIVE · " + formatLocalTime(new Date().toISOString());
          if (Hls.isSupported()) {
            hls = new Hls({ lowLatencyMode: true });
            hls.loadSource(data.playback_url);
            hls.attachMedia(vid);
          } else if (vid.canPlayType("application/vnd.apple.mpegurl")) {
            vid.src = data.playback_url;
          }
        }
        poll();
      }

      // 后端按需直播接口 (/api/v1/streams/:camId/live) 保留完整可用；前端暂不暴露直播触发入口
      card.querySelector(".btn-snap").addEventListener("click", () => showSnapshot(false));
      showSnapshot();
    }

    function resetAutoRefresh() {
      if (autoRefreshTimer) clearInterval(autoRefreshTimer);
      const sec = Number(refreshSelect.value || "0");
      const notifyRings = (rem) => {
        for (const fn of ringUpdaters) fn(rem, sec);
      };
      if (sec <= 0) {
        notifyRings(0);
        return;
      }
      remainingSec = sec;
      notifyRings(remainingSec);
      autoRefreshTimer = setInterval(() => {
        if (document.hidden) return;
        remainingSec -= 1;
        if (remainingSec <= 0) {
          notifyRings(0);
          for (const fn of snapshotRefreshers) fn();
          remainingSec = sec;
        } else {
          notifyRings(remainingSec);
        }
      }, 1000);
    }

    refreshSelect.addEventListener("change", resetAutoRefresh);
    saveBtn.addEventListener("click", () => {
      localStorage.setItem("aquaponics_video_key", keyInput.value.trim());
      loadCameras();
    });
    resetAutoRefresh();
    loadCameras();
  </script>
</body>
</html>`;
}
