import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Cable,
  CheckCircle2,
  Cpu,
  HardHat,
  Layers,
  Network,
  ShieldCheck,
  Thermometer,
} from 'lucide-react';
import { PanelAssembly, PanelAssemblySchema } from '@aquaponics/schema';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import apCtrlRaw from '../../../../../packages/schema/fixtures/panels/ap-ctrl.json';
import apEdge01Raw from '../../../../../packages/schema/fixtures/panels/ap-edge-01.json';
import apEdge03Raw from '../../../../../packages/schema/fixtures/panels/ap-edge-03.json';

interface CabinetWorkbenchProps {
  theme: 'dark' | 'light';
}

const RAW_PANELS = [apCtrlRaw, apEdge01Raw, apEdge03Raw];

const MOUNT_TYPE_LABEL: Record<string, string> = {
  din_rail: 'DIN 导轨',
  plate_screw: '底板螺丝直装',
  shelf_tray: '承重托盘',
  door_cutout: '柜门开孔',
};

const COLOR_BADGE_MAP: Record<string, string> = {
  grey_24v_plus: 'bg-slate-400/20 text-slate-200 border-slate-400/40',
  blue_0v: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
  yellow_green_pe: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
  rj45: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
};

export const CabinetWorkbench: React.FC<CabinetWorkbenchProps> = ({ theme }) => {
  const parsedPanels = useMemo(() => {
    return RAW_PANELS.map((raw) => {
      const res = PanelAssemblySchema.safeParse(raw);
      return {
        raw: raw as PanelAssembly,
        ok: res.success,
        errors: res.success ? [] : res.error.issues.map((i) => i.message),
      };
    });
  }, []);

  const [selectedId, setSelectedId] = useState<string>(parsedPanels[0]?.raw.panel_id ?? 'AP-CTRL');
  const [subTab, setSubTab] = useState<'layout' | 'wiring' | 'checklist'>('layout');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const current = parsedPanels.find((p) => p.raw.panel_id === selectedId) ?? parsedPanels[0];
  const panel = current.raw;

  const isDark = theme === 'dark';
  const totalHeatW = useMemo(() => {
    const rHeat = panel.din_rails
      .flatMap((r) => r.items)
      .reduce((s, item) => s + (item.heat_dissipation_w ?? 0), 0);
    const nHeat = (panel.non_rail_zones ?? [])
      .flatMap((z) => z.items)
      .reduce((s, item) => s + (item.heat_dissipation_w ?? 0), 0);
    return rHeat + nHeat;
  }, [panel]);

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <main
      className={`flex-1 overflow-y-auto p-5 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-5">
        {/* 顶部电箱切换与 Zod v4 校验状态栏 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {parsedPanels.map(({ raw, ok }) => {
              const active = raw.panel_id === panel.panel_id;
              return (
                <button
                  key={raw.panel_id}
                  type="button"
                  onClick={() => setSelectedId(raw.panel_id)}
                  className={`px-3.5 py-2 rounded-lg border text-left transition cursor-pointer ${
                    active
                      ? 'border-amber-500 bg-amber-500/15 text-amber-300 shadow-sm'
                      : isDark
                        ? 'border-slate-800 bg-slate-900/80 hover:border-slate-700 text-slate-300'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs">{raw.panel_id}</span>
                    {ok ? (
                      <CheckCircle2 className="size-3.5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="size-3.5 text-rose-400" />
                    )}
                  </div>
                  <div className="text-[11px] opacity-80 mt-0.5">{raw.name}</div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {current.ok ? (
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1.5 py-1 px-2.5">
                <ShieldCheck className="size-3.5" />
                Zod v4 红线校验通过 ({panel.function_aspect})
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1.5 py-1 px-2.5">
                <AlertTriangle className="size-3.5" />
                校验失败 ({current.errors.length} 项)
              </Badge>
            )}
          </div>
        </div>

        {/* 关键物理参数 KPI 卡片 (IEC 61439) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className={`p-3.5 ${isDark ? 'bg-slate-900/80 border-slate-800' : ''}`}>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Layers className="size-3.5 text-amber-400" />
              箱体规格与防护 (IEC 61439)
            </div>
            <div className="mt-1.5 font-mono font-bold text-sm">
              {panel.enclosure.width_mm} × {panel.enclosure.height_mm} × {panel.enclosure.depth_mm} mm
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {panel.enclosure.ip_rating} · 底座 {panel.enclosure.base_plinth_mm ?? 0} mm · Ue {panel.enclosure.rated_voltage_ue_v}V
            </div>
          </Card>

          <Card className={`p-3.5 ${isDark ? 'bg-slate-900/80 border-slate-800' : ''}`}>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Thermometer className="size-3.5 text-sky-400" />
              热耗散与散热方式
            </div>
            <div className="mt-1.5 font-mono font-bold text-sm">
              {totalHeatW} W / 上限 {panel.enclosure.max_heat_dissipation_w ?? '—'} W
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {panel.enclosure.cooling_type === 'forced_fan' ? '顶置强制抽风对流' : '自然对流散热 + 干燥剂'}
            </div>
          </Card>

          <Card className={`p-3.5 ${isDark ? 'bg-slate-900/80 border-slate-800' : ''}`}>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Network className="size-3.5 text-indigo-400" />
              PoE / 网络节点
            </div>
            <div className="mt-1.5 font-mono font-bold text-sm">
              {(panel.poe_switches?.length ?? 0) > 0
                ? `${panel.poe_switches![0].ports.length} 路已分配`
                : `${panel.network_nodes?.length ?? 0} 个工控网络节点`}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {(panel.poe_splitters?.length ?? 0) > 0
                ? `PoE+ 负载 ${panel.poe_splitters![0].downlink_load_w}W / ${panel.poe_splitters![0].max_output_w}W`
                : panel.physical_location}
            </div>
          </Card>

          <Card className={`p-3.5 ${isDark ? 'bg-slate-900/80 border-slate-800' : ''}`}>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <HardHat className="size-3.5 text-emerald-400" />
              强弱电安全边界
            </div>
            <div className="mt-1.5 font-bold text-sm">
              {panel.safety_boundary.has_ac_power ? '含 220VAC 稳压 + 24VDC' : '纯 PoE+ 24VDC（无 220V）'}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              PE 接地 ≤ {panel.safety_boundary.pe_grounding_max_ohm}Ω · 线径 ≥ {panel.safety_boundary.pe_wire_min_mm2}mm²
            </div>
          </Card>
        </div>

        {/* 二级视图切换 */}
        <Tabs value={subTab} onValueChange={(v) => setSubTab(v as 'layout' | 'wiring' | 'checklist')}>
          <TabsList>
            <TabsTrigger value="layout" className="gap-1.5">
              <Cpu className="size-3.5 text-amber-400" />
              1:1 导轨与托盘物理配盘
            </TabsTrigger>
            <TabsTrigger value="wiring" className="gap-1.5">
              <Cable className="size-3.5 text-indigo-400" />
              PoE 端口矩阵 & 端到端接线
            </TabsTrigger>
            <TabsTrigger value="checklist" className="gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              开孔葛兰头 & 施工验收 Checklist
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 1. 1:1 物理配盘图 */}
        {subTab === 'layout' && (
          <div className="space-y-4">
            {/* 非导轨区（托盘 / 底板螺丝直装） */}
            {(panel.non_rail_zones ?? []).map((zone) => (
              <Card key={zone.zone_id} className={`p-4 ${isDark ? 'bg-slate-900/80 border-slate-800' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold text-sm flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[11px]">
                      {zone.zone_id}
                    </Badge>
                    <span>{zone.location_label}</span>
                  </div>
                  <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30">
                    {MOUNT_TYPE_LABEL[zone.mount_type] ?? zone.mount_type}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {zone.items.map((item) => (
                    <div
                      key={item.component_ref}
                      className={`p-3 rounded-lg border ${
                        isDark ? 'border-slate-700/80 bg-slate-950/70' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-xs text-amber-400">
                          {item.component_ref} ({item.iec_class})
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          宽 {item.width_mm}mm · {item.supply_type}
                        </span>
                      </div>
                      <div className="font-semibold text-sm mt-1">{item.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.model}</div>
                      {(item.install_notes?.length ?? 0) > 0 && (
                        <ul className="mt-2 space-y-1 text-[11px] text-amber-300/90 list-disc list-inside">
                          {item.install_notes!.map((note, idx) => (
                            <li key={idx}>{note}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ))}

            {/* 35mm DIN 导轨按真实毫米比例绘制 */}
            {panel.din_rails.map((rail) => {
              const usedMm = rail.items.reduce((s, it) => s + it.width_mm + (it.clearance_mm ?? 0), 0);
              const pct = Math.min(Math.round((usedMm / rail.usable_width_mm) * 100), 100);
              return (
                <Card key={rail.rail_id} className={`p-4 ${isDark ? 'bg-slate-900/80 border-slate-800' : ''}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="font-bold text-sm flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[11px]">
                        +{panel.panel_id}+{rail.rail_id}
                      </Badge>
                      <span>{rail.location_label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span>
                        已占 {usedMm} / {rail.usable_width_mm} mm ({pct}%)
                      </span>
                      <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* 模拟 35mm 导轨金属底槽与器件比例排布 */}
                  <div className="relative rounded-lg border border-slate-700/70 bg-slate-950/60 p-3 overflow-x-auto">
                    <div className="flex items-stretch gap-1 min-w-[640px]">
                      {rail.items.map((item) => {
                        const widthPct = Math.max((item.width_mm / rail.usable_width_mm) * 100, 12);
                        return (
                          <div
                            key={item.component_ref}
                            style={{ width: `${widthPct}%` }}
                            className={`rounded-md border p-2.5 flex flex-col justify-between shrink-0 ${
                              item.is_fuse_terminal
                                ? 'border-rose-500/60 bg-rose-500/10'
                                : item.iec_class === 'K'
                                  ? 'border-emerald-500/50 bg-emerald-500/10'
                                  : 'border-sky-500/50 bg-sky-500/10'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 text-[11px] font-mono">
                                <span className="font-bold text-amber-300">{item.component_ref}</span>
                                <span className="text-slate-400">{item.width_mm}mm</span>
                              </div>
                              <div className="font-semibold text-xs mt-1 leading-snug">{item.name}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5 truncate" title={item.model}>
                                {item.model}
                              </div>
                            </div>
                            <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                              <span>{item.supply_type}</span>
                              {(item.clearance_mm ?? 0) > 0 && <span>间隙 +{item.clearance_mm}mm</span>}
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex-1 rounded-md border border-dashed border-slate-700/60 flex items-center justify-center text-[11px] text-slate-500 font-mono min-w-[60px]">
                        余量 {Math.max(rail.usable_width_mm - usedMm, 0)}mm
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* 2. PoE 端口矩阵 & 端到端接线表 */}
        {subTab === 'wiring' && (
          <div className="space-y-4">
            {(panel.poe_switches ?? []).map((sw) => (
              <Card key={sw.component_ref} className={`p-4 ${isDark ? 'bg-slate-900/80 border-slate-800' : ''}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="font-bold text-sm">
                    {sw.component_ref} {sw.model} 端口固化矩阵
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-mono">
                      拨码模式: {sw.dip_switch_mode}
                    </Badge>
                    <Badge variant="outline" className="font-mono">
                      PoE 预算: {sw.ports.reduce((s, p) => s + (p.allocated_power_w ?? 0), 0)} / {sw.poe_budget_w} W
                    </Badge>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-muted-foreground">
                        <th className="py-2 pr-3">端口</th>
                        <th className="py-2 pr-3">线号 (Cable Tag)</th>
                        <th className="py-2 pr-3">设备 ID</th>
                        <th className="py-2 pr-3">说明</th>
                        <th className="py-2 pr-3">IP 地址</th>
                        <th className="py-2">PoE 供电</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sw.ports.map((p) => (
                        <tr key={p.port_id} className="border-b border-slate-800/60">
                          <td className="py-2 pr-3 font-mono font-bold text-amber-300">{p.port_id}</td>
                          <td className="py-2 pr-3 font-mono">{p.cable_tag ?? '—'}</td>
                          <td className="py-2 pr-3 font-mono">{p.target_device_id ?? '—'}</td>
                          <td className="py-2 pr-3">{p.target_device_name ?? '—'}</td>
                          <td className="py-2 pr-3 font-mono text-sky-300">{p.target_ip ?? '—'}</td>
                          <td className="py-2 font-mono">
                            {p.poe_standard === 'none' ? '非 PoE' : `${p.poe_standard} (${p.allocated_power_w}W)`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ))}

            {(panel.network_nodes ?? []).some((n) => (n.modbus_slaves?.length ?? 0) > 0) && (
              <Card className={`p-4 ${isDark ? 'bg-slate-900/80 border-slate-800' : ''}`}>
                <div className="font-bold text-sm mb-3">传感器总线与 24V 熔断端子映射表</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-muted-foreground">
                        <th className="py-2 pr-3">网关 / IP</th>
                        <th className="py-2 pr-3">Slave ID</th>
                        <th className="py-2 pr-3">传感器名称</th>
                        <th className="py-2 pr-3">24V 熔断端子</th>
                        <th className="py-2">功耗</th>
                      </tr>
                    </thead>
                    <tbody>
                      {panel.network_nodes?.flatMap((node) =>
                        (node.modbus_slaves ?? []).map((sl) => (
                          <tr key={`${node.node_id}-${sl.slave_id}`} className="border-b border-slate-800/60">
                            <td className="py-2 pr-3 font-mono">
                              {node.name} ({node.ip_address}:{node.tcp_port})
                            </td>
                            <td className="py-2 pr-3 font-mono font-bold text-amber-300">{sl.slave_id}</td>
                            <td className="py-2 pr-3">{sl.sensor_name}</td>
                            <td className="py-2 pr-3 font-mono text-rose-300">{sl.fuse_terminal_ref}</td>
                            <td className="py-2 font-mono">{sl.power_w}W</td>
                          </tr>
                        )),
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            <Card className={`p-4 ${isDark ? 'bg-slate-900/80 border-slate-800' : ''}`}>
              <div className="font-bold text-sm mb-3">端到端对称接线表 (ISO/IEC 14763-2)</div>
              <div className="space-y-2">
                {(panel.wiring_connections ?? []).map((w) => (
                  <div
                    key={w.wire_id}
                    className={`p-3 rounded-lg border flex flex-wrap items-center justify-between gap-2 text-xs ${
                      isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Badge className={`font-mono ${COLOR_BADGE_MAP[w.color_code] ?? ''}`}>{w.cable_tag}</Badge>
                      <span className="font-semibold">{w.signal_desc}</span>
                    </div>
                    <div className="font-mono text-slate-300">
                      [{w.from.cabinet_or_zone}:{w.from.component_ref}:{w.from.terminal_or_port}] ⟷ [
                      {w.to.cabinet_or_zone}:{w.to.component_ref}:{w.to.terminal_or_port}]
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* 3. 开孔葛兰头 & 施工防坑验收 Checklist */}
        {subTab === 'checklist' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className={`p-4 ${isDark ? 'bg-slate-900/80 border-slate-800' : ''}`}>
              <div className="font-bold text-sm mb-3">箱体开孔与防水葛兰头清单</div>
              <div className="space-y-2">
                {(panel.cutouts ?? []).map((c, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs ${
                      isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span className="text-amber-300">
                        {c.gland_size} (φ{c.diameter_mm}mm) × {c.quantity}
                      </span>
                      <span className="text-muted-foreground">{c.position}</span>
                    </div>
                    <div className="mt-1 text-muted-foreground">{c.purpose}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className={`p-4 ${isDark ? 'bg-slate-900/80 border-slate-800' : ''}`}>
              <div className="font-bold text-sm mb-3">现场施工与防坑验收 Checklist</div>
              <div className="space-y-2">
                {[...(panel.safety_boundary.notes ?? []), ...(panel.acceptance_checklist ?? [])].map(
                  (item, idx) => {
                    const key = `${panel.panel_id}-${idx}`;
                    const checked = Boolean(checkedItems[key]);
                    return (
                      <label
                        key={key}
                        className={`p-3 rounded-lg border flex items-start gap-2.5 text-xs cursor-pointer transition ${
                          checked
                            ? 'border-emerald-500/40 bg-emerald-500/10 line-through opacity-75'
                            : isDark
                              ? 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                              : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCheck(key)}
                          className="mt-0.5 accent-emerald-500"
                        />
                        <span>{item}</span>
                      </label>
                    );
                  },
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
};
