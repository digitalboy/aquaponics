import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@aquaponics/ui";
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
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { type DailySummaryItem, NightAiCalendar } from "./NightAiCalendar";

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

interface AdminUser {
  name: string;
  open_id?: string;
  avatar_url?: string;
  exp?: number;
}

const ADMIN_TOKEN_KEY = "aquaponics_video_admin_token";

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
  const [calendarMonth, setCalendarMonth] = useState<string>(() => {
    const cst = new Date(Date.now() + 8 * 3600 * 1000);
    return cst.toISOString().slice(0, 7);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dailySummary, setDailySummary] = useState<Record<string, DailySummaryItem>>({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 上传表单状态
  const [nameInput, setNameInput] = useState("");
  const [roleInput, setRoleInput] = useState("员工");
  const [targetPersonId, setTargetPersonId] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState("");

  // 事件连拍大图弹窗 & 删除确认弹窗
  const [previewEvent, setPreviewEvent] = useState<NightAiEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffItem | null>(null);

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
      const eventsQuery = new URLSearchParams({ limit: "100", month: calendarMonth });
      if (selectedDate) eventsQuery.set("date", selectedDate);

      const [facesRes, eventsRes, meRes] = await Promise.all([
        fetch(`${gatewayUrl}/api/internal/faces`, { headers }),
        fetch(`${gatewayUrl}/api/internal/events/night-ai?${eventsQuery.toString()}`, { headers }),
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
        const data = (await eventsRes.json()) as {
          events: NightAiEvent[];
          daily_summary?: Record<string, DailySummaryItem>;
        };
        setEvents(data.events ?? []);
        if (data.daily_summary) setDailySummary(data.daily_summary);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "加载管理数据失败");
    } finally {
      setLoading(false);
    }
  }, [gatewayUrl, token, calendarMonth, selectedDate]);

  useEffect(() => {
    if (token) void fetchAll();
  }, [token, fetchAll]);

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

  async function confirmDeleteStaff() {
    if (!deleteTarget) return;
    await fetch(`${gatewayUrl}/api/internal/faces/${encodeURIComponent(deleteTarget.person_id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeleteTarget(null);
    await fetchAll();
  }

  if (!token) {
    const feishuLoginUrl = `${gatewayUrl}/api/auth/feishu/login?redirect=${encodeURIComponent(window.location.origin)}`;
    return (
      <Card className="mx-auto mt-10 max-w-md">
        <CardHeader className="justify-start gap-3 py-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Lock className="size-4" />
          </div>
          <div className="flex flex-col gap-1">
            <CardTitle>管理后台鉴权</CardTitle>
            <CardDescription>员工人脸库管理与夜间来访识别记录</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <a
            href={feishuLoginUrl}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3370ff] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2860e1]"
          >
            <UserCheck className="size-4" />
            飞书扫码 / 一键登录（30 天免登录）
          </a>
          {loginError && <p className="text-xs text-destructive">{loginError}</p>}

          <div className="pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="px-0 text-muted-foreground"
              onClick={() => setShowPasswordLogin((v) => !v)}
            >
              {showPasswordLogin ? "收起备用口令登录" : "使用备用管理口令登录 →"}
            </Button>
          </div>

          {showPasswordLogin && (
            <>
              <Separator />
              <form onSubmit={handleLogin} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="admin-password">备用口令</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入管理员口令"
                  />
                </div>
                <Button type="submit" disabled={loggingIn || !password.trim()} className="w-full">
                  {loggingIn ? "验证中..." : "口令登录"}
                </Button>
              </form>
            </>
          )}

          <div className="pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft />
              返回公开监控
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={tab} onValueChange={(v) => setTab(v as "events" | "staff")}>
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft />
                返回公开页
              </Button>
              <TabsList>
                <TabsTrigger value="events">
                  <UserCheck className="size-3.5" />
                  夜间识别记录 ({events.length})
                </TabsTrigger>
                <TabsTrigger value="staff">
                  <Users className="size-3.5" />
                  员工人脸库 ({staff.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex items-center gap-2">
              {adminUser && (
                <div className="hidden items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs sm:inline-flex">
                  <Avatar>
                    {adminUser.avatar_url && <AvatarImage src={adminUser.avatar_url} alt={adminUser.name} />}
                    <AvatarFallback>{adminUser.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <span>{adminUser.name}</span>
                </div>
              )}
              <Button type="button" variant="outline" size="sm" onClick={() => void fetchAll()} disabled={loading}>
                <RefreshCw className={loading ? "animate-spin" : ""} />
                刷新
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
                <LogOut />
                退出
              </Button>
            </div>
          </CardContent>
        </Card>

        {errorMsg && (
          <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-xs text-destructive">
            {errorMsg}
          </div>
        )}

        <TabsContent value="events">
          <div className="grid gap-4 lg:grid-cols-[340px_1fr] lg:items-start">
            <NightAiCalendar
              month={calendarMonth}
              selectedDate={selectedDate}
              dailySummary={dailySummary}
              onMonthChange={(m) => {
                setCalendarMonth(m);
                setSelectedDate(null);
              }}
              onSelectDate={(d) => setSelectedDate(d)}
            />

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {selectedDate ? `${selectedDate} 识别记录 (${events.length})` : `最近识别记录 (${events.length})`}
                </span>
                {selectedDate && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedDate(null)}>
                    显示全部日期
                  </Button>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {events.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="p-8 text-center text-sm text-muted-foreground">
                      {selectedDate ? `${selectedDate} 当天暂无识别记录` : "暂无夜间 AI 识别记录"}
                    </CardContent>
                  </Card>
                ) : (
                  events.map((ev) => {
                    const isKnown = ev.recognized_names.length > 0;
                    const thumbKey = ev.frames[0]?.r2_key || ev.r2_key;
                    return (
                      <Card key={ev.event_id} className="transition hover:border-primary/40">
                        <CardContent className="flex gap-3 p-3">
                          {thumbKey ? (
                            <button
                              type="button"
                              onClick={() => setPreviewEvent(ev)}
                              className="h-24 w-36 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-border bg-black"
                            >
                              <img src={mediaUrl(thumbKey)} alt={ev.cam_name} className="size-full object-cover" />
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
                                  <Badge variant="default">
                                    <UserCheck className="size-3" />
                                    熟人：{ev.recognized_names.join("、")}
                                    {ev.face_similarity ? ` (${Math.round(ev.face_similarity * 100)}%)` : ""}
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive">
                                    <ShieldAlert className="size-3" />
                                    未知人员 ({ev.person_count}人)
                                  </Badge>
                                )}
                              </div>
                              <p className="mt-1.5 text-xs font-medium text-foreground">{ev.cam_name}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">{formatLocalTime(ev.trigger_at)}</p>
                            </div>
                            {ev.frames.length > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto self-start px-0 py-0 text-primary hover:bg-transparent"
                                onClick={() => setPreviewEvent(ev)}
                              >
                                查看 {ev.frames.length} 张现场连拍 →
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="staff">
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Plus className="size-4 text-primary" />
                  <CardTitle>
                    {targetPersonId ? `为「${nameInput}」补充正面照片` : "录入新员工人脸照片"}
                  </CardTitle>
                </div>
                {targetPersonId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTargetPersonId("");
                      setNameInput("");
                    }}
                  >
                    取消补充（改为新建）
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUploadPhotos} className="flex flex-col gap-3">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="姓名（如：李四）"
                      required
                    />
                    <Input
                      type="text"
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value)}
                      placeholder="身份/岗位（如：技术员）"
                    />
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(e) => setSelectedFiles(Array.from(e.target.files ?? []))}
                      className="cursor-pointer py-1 text-xs file:mr-2 file:rounded file:border-0 file:bg-primary/15 file:px-2 file:py-0.5 file:text-xs file:text-primary"
                      required
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      建议上传 2~3 张正面及微侧脸清晰照，工控机将在 10 秒内自动提取特征并同步生效
                    </p>
                    <Button type="submit" disabled={uploading || !nameInput.trim() || selectedFiles.length === 0}>
                      {uploading ? "上传中..." : `上传照片 (${selectedFiles.length})`}
                    </Button>
                  </div>
                  {uploadResult && <p className="text-xs text-primary">{uploadResult}</p>}
                </form>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              {staff.map((item) => (
                <Card key={item.person_id}>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">{item.name}</span>
                        <Badge variant="outline">{item.role}</Badge>
                        <Badge variant={item.status === "active" ? "default" : "secondary"}>
                          {item.status === "active" ? "启用中" : "已停用"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">有效特征：{item.sample_count} 组</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTargetPersonId(item.person_id);
                            setNameInput(item.name);
                            setRoleInput(item.role);
                          }}
                        >
                          + 补充照片
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => void toggleStatus(item)}>
                          {item.status === "active" ? "停用" : "启用"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setDeleteTarget(item)}
                        >
                          <Trash2 />
                          删除
                        </Button>
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
                              <img src={mediaUrl(s.r2_key)} alt={s.sample_id} className="size-10 rounded object-cover" />
                            ) : (
                              <div className="flex size-10 items-center justify-center rounded bg-muted text-[10px] text-muted-foreground">
                                CLI
                              </div>
                            )}
                            <div>
                              {s.status === "ready" && (
                                <span className="inline-flex items-center gap-1 text-primary">
                                  <CheckCircle2 className="size-3" />
                                  已生效
                                </span>
                              )}
                              {s.status === "pending" && (
                                <span className="inline-flex items-center gap-1 text-muted-foreground">
                                  <Clock className="size-3 animate-spin" />
                                  提取特征中
                                </span>
                              )}
                              {s.status === "failed" && (
                                <span className="text-destructive">{s.error_message || "提取失败"}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={previewEvent !== null} onOpenChange={(open) => !open && setPreviewEvent(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          {previewEvent && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {previewEvent.cam_name} · {formatLocalTime(previewEvent.trigger_at)}
                </DialogTitle>
                <DialogDescription>
                  {previewEvent.recognized_names.length > 0
                    ? `识别身份：${previewEvent.recognized_names.join("、")}`
                    : `未知人员 (${previewEvent.person_count} 人)`}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                {(previewEvent.frames.length > 0
                  ? previewEvent.frames
                  : previewEvent.r2_key
                    ? [{ label: "现场抓拍", r2_key: previewEvent.r2_key, captured_at: previewEvent.trigger_at }]
                    : []
                ).map((f) => (
                  <div key={f.r2_key} className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      {f.label} · {formatLocalTime(f.captured_at)}
                    </span>
                    <img src={mediaUrl(f.r2_key)} alt={f.label} className="w-full rounded-lg border border-border" />
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除员工人脸档案？</AlertDialogTitle>
            <AlertDialogDescription>
              将永久移除「{deleteTarget?.name}」及其所有采集样本与特征向量，删除后工控机将不再识别该人员为熟人。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDeleteStaff()}>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
