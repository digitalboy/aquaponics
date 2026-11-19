import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  ShieldAlert,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";

interface FaceSample {
  sample_id: string;
  r2_key: string | null;
  status: "pending" | "ready" | "failed";
  error_message: string | null;
  created_at: string;
}

interface StaffItem {
  person_id: string;
  name: string;
  role: string;
  status: "active" | "disabled";
  sample_count: number;
  updated_at: string;
  samples: FaceSample[];
}

interface NightAiEventFrame {
  label: string;
  r2_key: string;
  captured_at: string;
}

interface NightAiEvent {
  event_id: string;
  cam_id: string;
  cam_name: string;
  trigger_at: string;
  r2_key: string | null;
  recognized_names: string[];
  face_similarity: number | null;
  person_count: number;
  max_confidence: number | null;
  frames: NightAiEventFrame[];
}

const ADMIN_TOKEN_KEY = "aquaponics_video_admin_token";

interface AdminUser {
  name: string;
  open_id?: string;
  avatar_url?: string;
  exp?: number;
}

function formatLocalTime(isoUtc: string): string {
  const d = new Date(isoUtc);
  if (Number.isNaN(d.getTime())) return isoUtc;
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function AdminFacePanel({
  gatewayUrl,
  onBack,
}: {
  gatewayUrl: string;
  onBack: () => void;
}) {
  const [token, setToken] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const feishuToken = params.get("feishu_token");
    if (feishuToken) {
      localStorage.setItem(ADMIN_TOKEN_KEY, feishuToken);
      window.history.replaceState(null, "", `${window.location.pathname}#admin`);
      return feishuToken;
    }
    return localStorage.getItem(ADMIN_TOKEN_KEY) || "";
  });
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("auth_error");
    if (err) {
      window.history.replaceState(null, "", `${window.location.pathname}#admin`);
      return err;
    }
    return "";
  });
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab, setTab] = useState<"events" | "staff">("events");
  const [staff, setStaff] = useState<StaffItem[]>([]);
  const [events, setEvents] = useState<NightAiEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 上传表单状态
  const [nameInput, setNameInput] = useState("");
  const [roleInput, setRoleInput] = useState("员工");
  const [targetPersonId, setTargetPersonId] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState("");

  // 事件连拍大图弹窗
  const [previewEvent, setPreviewEvent] = useState<NightAiEvent | null>(null);

  const mediaUrl = useCallback(
    (r2Key: string) =>
      `${gatewayUrl}/api/internal/faces/media?key=${encodeURIComponent(r2Key)}&token=${encodeURIComponent(token)}`,
    [gatewayUrl, token],
  );

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [facesRes, eventsRes, meRes] = await Promise.all([
        fetch(`${gatewayUrl}/api/internal/faces`, { headers }),
        fetch(`${gatewayUrl}/api/internal/events/night-ai?limit=50`, { headers }),
        fetch(`${gatewayUrl}/api/internal/admin/me`, { headers }),
      ]);

      if (facesRes.status === 401 || eventsRes.status === 401) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setToken("");
        setAdminUser(null);
        setErrorMsg("登录会话已过期（超过 30 天），请重新飞书扫码登录");
        return;
      }

      if (meRes.ok) {
        const meData = (await meRes.json()) as { user?: AdminUser };
        if (meData.user) setAdminUser(meData.user);
      }

      if (facesRes.ok) {
        const data = (await facesRes.json()) as { staff: StaffItem[] };
        setStaff(data.staff ?? []);
      }
      if (eventsRes.ok) {
        const data = (await eventsRes.json()) as { events: NightAiEvent[] };
        setEvents(data.events ?? []);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "加载管理数据失败");
    } finally {
      setLoading(false);
    }
  }, [gatewayUrl, token]);

  useEffect(() => {
    if (token) void fetchAll();
  }, [token, fetchAll]);

  // 有 pending 特征提取任务时每 3 秒自动刷新状态
  useEffect(() => {
    if (!token) return;
    const hasPending = staff.some((s) => s.samples.some((smp) => smp.status === "pending"));
    if (!hasPending) return;
    const timer = window.setInterval(() => void fetchAll(), 3000);
    return () => window.clearInterval(timer);
  }, [token, staff, fetchAll]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await fetch(`${gatewayUrl}/api/internal/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!res.ok || !data.token) {
        setLoginError(data.error || "口令校验失败");
        return;
      }
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      setToken(data.token);
      setPassword("");
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "网络请求失败");
    } finally {
      setLoggingIn(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken("");
    setAdminUser(null);
    setStaff([]);
    setEvents([]);
  }

  async function handleUploadPhotos(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim() || selectedFiles.length === 0) return;
    setUploading(true);
    setUploadResult("");
    try {
      const personId = targetPersonId || `STAFF-${Date.now()}`;
      let okCount = 0;
      for (const file of selectedFiles) {
        const form = new FormData();
        form.append("person_id", personId);
        form.append("name", nameInput.trim());
        form.append("role", roleInput.trim() || "员工");
        form.append("file", file);
        const res = await fetch(`${gatewayUrl}/api/internal/faces/upload-sample`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        if (res.ok) okCount += 1;
      }
      setUploadResult(`已上传 ${okCount} 张照片，正在通知工控机提取人脸特征（约 5~10 秒生效）`);
      setNameInput("");
      setTargetPersonId("");
      setSelectedFiles([]);
      await fetchAll();
    } catch (err) {
      setUploadResult(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
    }
  }

  async function toggleStatus(item: StaffItem) {
    const next = item.status === "active" ? "disabled" : "active";
    await fetch(`${gatewayUrl}/api/internal/faces/status`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ person_id: item.person_id, status: next }),
    });
    await fetchAll();
  }

  async function deleteStaff(item: StaffItem) {
    if (!window.confirm(`确认删除「${item.name}」及其所有面部样本？`)) return;
    await fetch(`${gatewayUrl}/api/internal/faces/${encodeURIComponent(item.person_id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchAll();
  }

  if (!token) {
    const feishuLoginUrl = `${gatewayUrl}/api/auth/feishu/login?redirect=${encodeURIComponent(window.location.origin)}`;
    return (
      <div className="mx-auto mt-10 max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold">管理后台鉴权</h2>
            <p className="text-xs text-muted-foreground">员工人脸库管理与夜间来访识别记录</p>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href={feishuLoginUrl}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3370ff] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2860e1]"
          >
            <UserCheck className="h-4 w-4" />
            飞书扫码 / 一键登录（30 天免登录）
          </a>
          {loginError && <p className="text-xs text-red-400">{loginError}</p>}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowPasswordLogin((v) => !v)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {showPasswordLogin ? "收起备用口令登录" : "使用备用管理口令登录 →"}
            </button>
          </div>

          {showPasswordLogin && (
            <form onSubmit={handleLogin} className="space-y-3 border-t border-border pt-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">备用口令</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入管理员口令"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                disabled={loggingIn || !password.trim()}
                className="w-full rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {loggingIn ? "验证中..." : "口令登录"}
              </button>
            </form>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              返回公开监控
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            返回公开页
          </button>
          <div className="flex rounded-lg border border-border bg-background p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setTab("events")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium ${
                tab === "events" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              夜间识别记录 ({events.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("staff")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium ${
                tab === "staff" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              员工人脸库 ({staff.length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {adminUser && (
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs">
              {adminUser.avatar_url && (
                <img src={adminUser.avatar_url} alt={adminUser.name} className="h-4 w-4 rounded-full" />
              )}
              <span>{adminUser.name}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => void fetchAll()}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            刷新
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted"
          >
            <LogOut className="h-3.5 w-3.5" />
            退出
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs text-red-400">
          {errorMsg}
        </div>
      )}

      {tab === "events" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {events.length === 0 ? (
            <div className="col-span-full rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              暂无夜间 AI 识别记录
            </div>
          ) : (
            events.map((ev) => {
              const isKnown = ev.recognized_names.length > 0;
              const thumbKey = ev.frames[0]?.r2_key || ev.r2_key;
              return (
                <div
                  key={ev.event_id}
                  className="flex gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-primary/40"
                >
                  {thumbKey ? (
                    <button
                      type="button"
                      onClick={() => setPreviewEvent(ev)}
                      className="h-24 w-36 shrink-0 overflow-hidden rounded-lg border border-border bg-black"
                    >
                      <img
                        src={mediaUrl(thumbKey)}
                        alt={ev.cam_name}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ) : (
                    <div className="flex h-24 w-36 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-xs text-muted-foreground">
                      无图
                    </div>
                  )}

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {isKnown ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
                            <UserCheck className="h-3 w-3" />
                            熟人：{ev.recognized_names.join("、")}
                            {ev.face_similarity ? ` (${Math.round(ev.face_similarity * 100)}%)` : ""}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-400">
                            <ShieldAlert className="h-3 w-3" />
                            未知人员 ({ev.person_count}人)
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs font-medium text-foreground">{ev.cam_name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatLocalTime(ev.trigger_at)}
                      </p>
                    </div>
                    {ev.frames.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setPreviewEvent(ev)}
                        className="self-start text-xs text-primary hover:underline"
                      >
                        查看 {ev.frames.length} 张现场连拍 →
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <form
            onSubmit={handleUploadPhotos}
            className="rounded-xl border border-border bg-card p-4 space-y-3"
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <Plus className="h-4 w-4 text-primary" />
              <span>{targetPersonId ? `为「${nameInput}」补充正面照片` : "录入新员工人脸照片"}</span>
              {targetPersonId && (
                <button
                  type="button"
                  onClick={() => {
                    setTargetPersonId("");
                    setNameInput("");
                  }}
                  className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                >
                  取消补充（改为新建）
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="姓名（如：李四）"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
              <input
                type="text"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                placeholder="身份/岗位（如：技术员）"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => setSelectedFiles(Array.from(e.target.files ?? []))}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs file:mr-2 file:rounded file:border-0 file:bg-primary/15 file:px-2 file:py-1 file:text-xs file:text-primary"
                required
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                建议上传 2~3 张正面及微侧脸清晰照，工控机将在 10 秒内自动提取特征并同步生效
              </p>
              <button
                type="submit"
                disabled={uploading || !nameInput.trim() || selectedFiles.length === 0}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {uploading ? "上传中..." : `上传照片 (${selectedFiles.length})`}
              </button>
            </div>
            {uploadResult && <p className="text-xs text-emerald-400">{uploadResult}</p>}
          </form>

          <div className="space-y-3">
            {staff.map((item) => (
              <div key={item.person_id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold">{item.name}</span>
                    <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {item.role}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.status === "active"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-zinc-500/20 text-zinc-400"
                      }`}
                    >
                      {item.status === "active" ? "启用中" : "已停用"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      有效特征：{item.sample_count} 组
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetPersonId(item.person_id);
                        setNameInput(item.name);
                        setRoleInput(item.role);
                      }}
                      className="rounded-md border border-border px-2.5 py-1 hover:bg-muted"
                    >
                      + 补充照片
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleStatus(item)}
                      className="rounded-md border border-border px-2.5 py-1 hover:bg-muted"
                    >
                      {item.status === "active" ? "停用" : "启用"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteStaff(item)}
                      className="inline-flex items-center gap-1 rounded-md border border-red-500/30 px-2.5 py-1 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                      删除
                    </button>
                  </div>
                </div>

                {item.samples.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.samples.map((s) => (
                      <div
                        key={s.sample_id}
                        className="flex items-center gap-2 rounded-lg border border-border bg-background/60 p-1.5 pr-2.5 text-xs"
                      >
                        {s.r2_key ? (
                          <img
                            src={mediaUrl(s.r2_key)}
                            alt={s.sample_id}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-muted text-[10px] text-muted-foreground">
                            CLI
                          </div>
                        )}
                        <div>
                          {s.status === "ready" && (
                            <span className="inline-flex items-center gap-1 text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" />
                              已生效
                            </span>
                          )}
                          {s.status === "pending" && (
                            <span className="inline-flex items-center gap-1 text-amber-400">
                              <Clock className="h-3 w-3 animate-spin" />
                              提取特征中
                            </span>
                          )}
                          {s.status === "failed" && (
                            <span className="text-red-400">{s.error_message || "提取失败"}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {previewEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewEvent(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-border bg-card p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">
                  {previewEvent.cam_name} · {formatLocalTime(previewEvent.trigger_at)}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {previewEvent.recognized_names.length > 0
                    ? `识别身份：${previewEvent.recognized_names.join("、")}`
                    : `未知人员 (${previewEvent.person_count} 人)`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewEvent(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {(previewEvent.frames.length > 0
                ? previewEvent.frames
                : previewEvent.r2_key
                  ? [{ label: "现场抓拍", r2_key: previewEvent.r2_key, captured_at: previewEvent.trigger_at }]
                  : []
              ).map((f) => (
                <div key={f.r2_key} className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    {f.label} · {formatLocalTime(f.captured_at)}
                  </div>
                  <img
                    src={mediaUrl(f.r2_key)}
                    alt={f.label}
                    className="w-full rounded-lg border border-border"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
