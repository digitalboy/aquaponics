import { PlantWideTopology } from '@aquaponics/schema';

export type WireCategory = 'power' | 'plc' | 'rs485';

export interface WireScheduleItem {
  wireId: string;           // 线号 (套管印字，含 PWR / CTRL / BUS 防呆前缀)
  category: WireCategory;   // 分类域 (强电动力 / PLC自控 / 485通信)
  panelId: string;          // 所属配电箱 / 控制柜
  circuitId: string;        // 所属回路 / 通道
  loadName: string;         // 控制设备 / 信号全称
  phaseType: string;        // 相别 / 极性 (L1, L2, L3, N, PE, 24V+, 0V-, A+, B-, SHIELD)
  colorName: string;        // 国际标准导线颜色
  colorHex: string;         // UI 高亮色
  spec: string;             // 导线型号规格 (如 BVR 2.5mm², RVSP 2x0.5mm²)
  fromComponent: string;    // 起点元器件
  fromTerminal: string;     // 起点端子引脚
  toComponent: string;      // 终点元器件/端子排
  toTerminal: string;       // 终点端子引脚 (如 XT1:1, XT2:12, XT3:A+)
  stripLengthMm: number;    // 剥线长度 (mm)
  torqueNm: number;         // 紧固力矩 (N·m)
  toolType: string;         // 建议工具 (如 PZ2十字刀, 4mm一字刀)
  safetyRemark?: string;    // 施工安全与防呆提示
  extraMeta?: {
    slaveAddress?: string;  // RS-485 从站地址
    baudRate?: string;      // 波特率
    wireIdRaw?: string;     // 原始线号
  };
}

/**
 * 从全要素拓扑生成三大分类防呆接线总表 (ELEC-01 动力 / ELEC-02 PLC / ELEC-03 485)
 */
export function generateCategorizedWiringSchedule(topology: PlantWideTopology): {
  all: WireScheduleItem[];
  power: WireScheduleItem[];
  plc: WireScheduleItem[];
  rs485: WireScheduleItem[];
} {
  const power: WireScheduleItem[] = [];
  const plc: WireScheduleItem[] = [];
  const rs485: WireScheduleItem[] = [];

  // =========================================================================
  // 1. ELEC-01 强电动力接线表 (380V/220V AC - XT1 强电端子排)
  // =========================================================================
  (topology.power_distribution.sub_panels || []).forEach((panel) => {
    panel.circuits.forEach((ckt) => {
      const is3Phase = ckt.load.rated_voltage_v === 380 || !ckt.load.rated_voltage_v;
      const isVfd = ckt.load.is_vfd_driven;
      const cktId = ckt.circuit_id;
      const loadName = ckt.load.name;

      if (is3Phase) {
        // 三相 380V 动力回路 (L1, L2, L3, PE)
        // A相 (黄)
        power.push({
          wireId: `W-PWR-${panel.panel_id}-${cktId}-L1`,
          category: 'power',
          panelId: panel.panel_id,
          circuitId: cktId,
          loadName,
          phaseType: 'L1',
          colorName: '黄色 (A相 380V)',
          colorHex: '#eab308',
          spec: `${ckt.cable.spec.split('+')[0] || 'BVR 2.5mm²'}`,
          fromComponent: `微断 ${ckt.breaker.model}`,
          fromTerminal: '2 (L1下出线)',
          toComponent: isVfd ? '变频器 VFD' : `强电端子排 XT1-${panel.panel_id}`,
          toTerminal: isVfd ? 'R / L1' : '1 (L1端子)',
          stripLengthMm: 10,
          torqueNm: 1.8,
          toolType: 'PZ2 十字绝缘螺丝刀',
          safetyRemark: '380V 强电相线，严禁与弱电信号线同槽敷设',
        });

        // B相 (绿)
        power.push({
          wireId: `W-PWR-${panel.panel_id}-${cktId}-L2`,
          category: 'power',
          panelId: panel.panel_id,
          circuitId: cktId,
          loadName,
          phaseType: 'L2',
          colorName: '绿色 (B相 380V)',
          colorHex: '#22c55e',
          spec: `${ckt.cable.spec.split('+')[0] || 'BVR 2.5mm²'}`,
          fromComponent: `微断 ${ckt.breaker.model}`,
          fromTerminal: '4 (L2下出线)',
          toComponent: isVfd ? '变频器 VFD' : `强电端子排 XT1-${panel.panel_id}`,
          toTerminal: isVfd ? 'S / L2' : '2 (L2端子)',
          stripLengthMm: 10,
          torqueNm: 1.8,
          toolType: 'PZ2 十字绝缘螺丝刀',
          safetyRemark: '380V 强电相线，必须与 A/C 相保持正确相序',
        });

        // C相 (红)
        power.push({
          wireId: `W-PWR-${panel.panel_id}-${cktId}-L3`,
          category: 'power',
          panelId: panel.panel_id,
          circuitId: cktId,
          loadName,
          phaseType: 'L3',
          colorName: '红色 (C相 380V)',
          colorHex: '#ef4444',
          spec: `${ckt.cable.spec.split('+')[0] || 'BVR 2.5mm²'}`,
          fromComponent: `微断 ${ckt.breaker.model}`,
          fromTerminal: '6 (L3下出线)',
          toComponent: isVfd ? '变频器 VFD' : `强电端子排 XT1-${panel.panel_id}`,
          toTerminal: isVfd ? 'T / L3' : '3 (L3端子)',
          stripLengthMm: 10,
          torqueNm: 1.8,
          toolType: 'PZ2 十字绝缘螺丝刀',
          safetyRemark: '380V 强电相线',
        });

        // PE 保护接地 (黄绿)
        power.push({
          wireId: `W-PWR-${panel.panel_id}-${cktId}-PE`,
          category: 'power',
          panelId: panel.panel_id,
          circuitId: cktId,
          loadName,
          phaseType: 'PE',
          colorName: '黄绿双色 (PE接地)',
          colorHex: '#84cc16',
          spec: 'BVR 2.5mm² (黄绿)',
          fromComponent: '箱内 PE 接地铜排',
          fromTerminal: 'PE 压接孔',
          toComponent: `强电端子排 XT1-${panel.panel_id}`,
          toTerminal: 'PE 接地端子',
          stripLengthMm: 10,
          torqueNm: 2.0,
          toolType: 'PZ2 十字螺丝刀 (接地压紧)',
          safetyRemark: '生命安全接地线，压紧后阻抗必须 < 0.1Ω',
        });
      } else {
        // 单相 220V 设备 (L, N, PE)
        power.push({
          wireId: `W-PWR-${panel.panel_id}-${cktId}-L`,
          category: 'power',
          panelId: panel.panel_id,
          circuitId: cktId,
          loadName,
          phaseType: 'L1',
          colorName: '红色 (火线 220V)',
          colorHex: '#ef4444',
          spec: 'BVR 2.5mm²',
          fromComponent: `微断 ${ckt.breaker.model}`,
          fromTerminal: '2 (相线出线)',
          toComponent: `强电端子排 XT1-${panel.panel_id}`,
          toTerminal: 'L 端子',
          stripLengthMm: 8,
          torqueNm: 1.2,
          toolType: 'PZ1 十字绝缘螺丝刀',
        });

        power.push({
          wireId: `W-PWR-${panel.panel_id}-${cktId}-N`,
          category: 'power',
          panelId: panel.panel_id,
          circuitId: cktId,
          loadName,
          phaseType: 'N',
          colorName: '浅蓝色 (中性线 N)',
          colorHex: '#38bdf8',
          spec: 'BVR 2.5mm²',
          fromComponent: '箱内 N 中性铜排',
          fromTerminal: 'N 压接孔',
          toComponent: `强电端子排 XT1-${panel.panel_id}`,
          toTerminal: 'N 端子',
          stripLengthMm: 8,
          torqueNm: 1.2,
          toolType: 'PZ1 十字绝缘螺丝刀',
        });

        power.push({
          wireId: `W-PWR-${panel.panel_id}-${cktId}-PE`,
          category: 'power',
          panelId: panel.panel_id,
          circuitId: cktId,
          loadName,
          phaseType: 'PE',
          colorName: '黄绿双色 (PE接地)',
          colorHex: '#84cc16',
          spec: 'BVR 2.5mm²',
          fromComponent: '箱内 PE 接地铜排',
          fromTerminal: 'PE 压接孔',
          toComponent: `强电端子排 XT1-${panel.panel_id}`,
          toTerminal: 'PE 端子',
          stripLengthMm: 8,
          torqueNm: 1.2,
          toolType: 'PZ1 十字螺丝刀',
        });
      }
    });
  });

  // =========================================================================
  // 2. ELEC-02 PLC 自控接线表 (24VDC - XT2 弱电控制端子排)
  // =========================================================================
  const plcCtrl = topology.plc_controller;
  if (plcCtrl) {
    // DI 输入点位 (24VDC 状态反馈)
    (plcCtrl.digital_inputs || []).forEach((di, idx) => {
      // 信号正极回路线
      plc.push({
        wireId: `W-CTRL-PLC-${di.point_id}`,
        category: 'plc',
        panelId: 'PLC-CABINET',
        circuitId: di.point_id,
        loadName: di.signal_name,
        phaseType: '24V+',
        colorName: '蓝色 (24VDC 信号)',
        colorHex: '#0284c7',
        spec: 'BVR 0.5mm²',
        fromComponent: `PLC ${plcCtrl.controller_model}`,
        fromTerminal: `DI 通道 ${di.point_id}`,
        toComponent: '弱电端子排 XT2-PLC',
        toTerminal: `端子 ${idx + 1} (${di.wire_id})`,
        stripLengthMm: 7,
        torqueNm: 0.6,
        toolType: '3mm 一字精密螺丝刀',
        safetyRemark: '24VDC 干接点信号，严禁混入 220VAC 强电',
        extraMeta: { wireIdRaw: di.wire_id },
      });

      // 公共 24V 供电线
      plc.push({
        wireId: `W-CTRL-24V-DI-${di.point_id}`,
        category: 'plc',
        panelId: 'PLC-CABINET',
        circuitId: di.point_id,
        loadName: `${di.signal_name} (电源侧)`,
        phaseType: '24V+',
        colorName: '棕色 (+24VDC 电源)',
        colorHex: '#b45309',
        spec: 'BVR 0.5mm²',
        fromComponent: '开关电源 24VDC (+V)',
        fromTerminal: '+V 端子',
        toComponent: '弱电端子排 XT2-PLC',
        toTerminal: `24V 公共端`,
        stripLengthMm: 7,
        torqueNm: 0.6,
        toolType: '3mm 一字精密螺丝刀',
      });
    });

    // DO 输出点位 (继电器动作控制)
    (plcCtrl.digital_outputs || []).forEach((doPt, idx) => {
      plc.push({
        wireId: `W-CTRL-PLC-${doPt.point_id}`,
        category: 'plc',
        panelId: 'PLC-CABINET',
        circuitId: doPt.point_id,
        loadName: doPt.signal_name,
        phaseType: 'DO-Ctrl',
        colorName: '绿色 (DO 继电器动作输出)',
        colorHex: '#059669',
        spec: 'BVR 0.75mm²',
        fromComponent: `PLC ${plcCtrl.controller_model}`,
        fromTerminal: `DO 通道 ${doPt.point_id}`,
        toComponent: '中间继电器 KA 模块',
        toTerminal: `线圈 A1 (+) [线号 ${doPt.wire_id}]`,
        stripLengthMm: 7,
        torqueNm: 0.6,
        toolType: '3mm 一字精密螺丝刀',
        safetyRemark: '触点容量 250VAC 5A，线圈共负极 A2 接 0V',
        extraMeta: { wireIdRaw: doPt.wire_id },
      });
    });
  }

  // =========================================================================
  // 3. ELEC-03 RS-485 现场总线接线表 (差分通信 - XT3 绿色通信端子排)
  // =========================================================================
  const bus = topology.rs485_fieldbus;
  if (bus) {
    (bus.slaves || []).forEach((slave: any, sIdx: number) => {
      const slaveName = slave.device_name || slave.name || '485从站传感器';
      const addr = String(slave.slave_address_hex || slave.addr);
      const isLast = sIdx === (bus.slaves || []).length - 1;

      // A+ 差分正 (白底蓝条 / 蓝色)
      rs485.push({
        wireId: `W-BUS-485-${addr}-A`,
        category: 'rs485',
        panelId: '485-FIELDBUS',
        circuitId: addr,
        loadName: slaveName,
        phaseType: 'A+',
        colorName: '白色 (RS-485 A+ 差分正)',
        colorHex: '#38bdf8',
        spec: 'RVSP 2x0.5mm² (屏蔽双绞)',
        fromComponent: sIdx === 0 ? '网关 COM1 (A+)' : `前级从站 ${bus.slaves[sIdx - 1]?.device_name || ''} (A+)`,
        fromTerminal: 'A+ 端子',
        toComponent: `智能传感器 ${slaveName}`,
        toTerminal: 'A+ 通信端子',
        stripLengthMm: 6,
        torqueNm: 0.4,
        toolType: '2.5mm 一字精密螺丝刀 / 冷压针形头',
        safetyRemark: `菊花链手拉手拓扑，从站地址拨码必须设为 ${addr}`,
        extraMeta: {
          slaveAddress: addr,
          baudRate: '9600-8-N-1',
        },
      });

      // B- 差分负 (蓝色)
      rs485.push({
        wireId: `W-BUS-485-${addr}-B`,
        category: 'rs485',
        panelId: '485-FIELDBUS',
        circuitId: addr,
        loadName: slaveName,
        phaseType: 'B-',
        colorName: '蓝色 (RS-485 B- 差分负)',
        colorHex: '#6366f1',
        spec: 'RVSP 2x0.5mm² (屏蔽双绞)',
        fromComponent: sIdx === 0 ? '网关 COM1 (B-)' : `前级从站 ${bus.slaves[sIdx - 1]?.device_name || ''} (B-)`,
        fromTerminal: 'B- 端子',
        toComponent: `智能传感器 ${slaveName}`,
        toTerminal: 'B- 通信端子',
        stripLengthMm: 6,
        torqueNm: 0.4,
        toolType: '2.5mm 一字精密螺丝刀 / 冷压针形头',
        safetyRemark: '严禁 A/B 极性反接，否则整条 485 总线通信阻塞',
        extraMeta: {
          slaveAddress: addr,
          baudRate: '9600-8-N-1',
        },
      });

      // 屏蔽层单端接地
      rs485.push({
        wireId: `W-BUS-SHIELD-${addr}`,
        category: 'rs485',
        panelId: '485-FIELDBUS',
        circuitId: addr,
        loadName: `${slaveName} (金属屏蔽网)`,
        phaseType: 'SHIELD',
        colorName: '金属镀锡铜屏蔽网 (SHIELD)',
        colorHex: '#94a3b8',
        spec: 'RVSP 屏蔽层',
        fromComponent: '电缆金属屏蔽网',
        fromTerminal: '连续屏蔽层',
        toComponent: sIdx === 0 ? '机柜专用仪表接地铜排 (IE)' : '串联至下一从站屏蔽层',
        toTerminal: '屏蔽接地端子',
        stripLengthMm: 15,
        torqueNm: 0.5,
        toolType: '热缩管封套 + 接地夹',
        safetyRemark: '必须单端接地，严禁两端接地形成地环路高频干扰',
      });

      // 末端 120Ω 电阻
      if (isLast && bus.has_120_ohm_terminator_at_end) {
        rs485.push({
          wireId: `W-BUS-TERM-120R`,
          category: 'rs485',
          panelId: '485-FIELDBUS',
          circuitId: addr,
          loadName: '120Ω 终端抗反射匹配电阻',
          phaseType: 'TERM',
          colorName: '金属膜色环电阻 (120Ω 1/4W)',
          colorHex: '#10b981',
          spec: '120Ω ±1% 0.25W',
          fromComponent: `物理末端从站 ${slaveName}`,
          fromTerminal: 'A+ 端子',
          toComponent: `物理末端从站 ${slaveName}`,
          toTerminal: 'B- 端子',
          stripLengthMm: 5,
          torqueNm: 0.4,
          toolType: '2.5mm 一字螺丝刀 (跨接在 A+/B- 之间)',
          safetyRemark: '末端必须激活 120Ω 终端电阻以吸收高频反射波',
        });
      }
    });
  }

  const all = [...power, ...plc, ...rs485];
  return { all, power, plc, rs485 };
}

/**
 * 导出指定分类的 CSV 接线表
 */
export function exportCategorizedWiringCSV(
  topology: PlantWideTopology,
  category: 'all' | 'power' | 'plc' | 'rs485'
): string {
  const schedule = generateCategorizedWiringSchedule(topology);
  const items = schedule[category];

  const headers = [
    '防呆线号(套管印字)',
    '专业分类',
    '所属配电箱/柜',
    '回路/通道',
    '控制设备/信号全称',
    '相别/极性',
    '国际标准线色',
    '规格型号',
    '起点(From)',
    '起点引脚',
    '终点(To)',
    '终点引脚',
    '剥线(mm)',
    '力矩(N.m)',
    '建议工具',
    '施工安全与防呆提示',
    '从站地址/波特率',
  ];

  const rows = items.map((w) => [
    `"${w.wireId}"`,
    `"${w.category === 'power' ? '⚡ 强电动力' : w.category === 'plc' ? '🤖 PLC自控' : '📶 485通信'}"`,
    `"${w.panelId}"`,
    `"${w.circuitId}"`,
    `"${w.loadName}"`,
    `"${w.phaseType}"`,
    `"${w.colorName}"`,
    `"${w.spec}"`,
    `"${w.fromComponent}"`,
    `"${w.fromTerminal}"`,
    `"${w.toComponent}"`,
    `"${w.toTerminal}"`,
    `"${w.stripLengthMm}"`,
    `"${w.torqueNm}"`,
    `"${w.toolType}"`,
    `"${w.safetyRemark || ''}"`,
    `"${w.extraMeta?.slaveAddress ? `从站 ${w.extraMeta.slaveAddress} (${w.extraMeta.baudRate})` : ''}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * 导出指定分类的线号打管机 TXT 文件
 */
export function exportCategorizedFerruleText(
  topology: PlantWideTopology,
  category: 'all' | 'power' | 'plc' | 'rs485'
): string {
  const schedule = generateCategorizedWiringSchedule(topology);
  const items = schedule[category];
  return items.map((w) => w.wireId).join('\r\n');
}
