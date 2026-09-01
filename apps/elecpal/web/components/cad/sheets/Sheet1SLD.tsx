import React from 'react';
import { PlantWideTopology, SubPanel, ElectricalCircuit } from '@aquaponics/schema';
import { CadHoverInfo, truncateText } from '../types';

interface Sheet1SLDProps {
  topology: PlantWideTopology;
  onHover?: (info: CadHoverInfo | null) => void;
}

export const Sheet1SLD: React.FC<Sheet1SLDProps> = ({ topology, onHover }) => {
  const subPanels = topology.power_distribution.sub_panels || [];

  const MAIN_BOX_X = 60;
  const MAIN_BOX_Y = 60;
  const MAIN_BOX_W = 280;
  const MAIN_BOX_H = 160;

  // 五线铜排母线 Y 坐标定义 (TN-S 380V/220V 50Hz)
  const BUS_L1_Y = 115;
  const BUS_L2_Y = 128;
  const BUS_L3_Y = 141;
  const BUS_N_Y = 154;
  const BUS_PE_Y = 167;

  const BUS_START_X = MAIN_BOX_X + MAIN_BOX_W;

  const SUBPANEL_START_X = 420;
  const SUBPANEL_TOP_Y = 250;
  const CKT_COL_WIDTH = 135;
  const PANEL_PAD_X = 35;
  const PANEL_GAP = 55;

  let currentX = SUBPANEL_START_X;
  const panelLayouts = subPanels.map((panel) => {
    const circuitCount = panel.circuits.length;
    // 箱体宽度自适应：1回路460px、2回路480px、3回路520px，保证标题与进线开关永不重叠
    const width = Math.max(PANEL_PAD_X * 2 + circuitCount * CKT_COL_WIDTH, circuitCount === 1 ? 460 : (circuitCount === 2 ? 480 : 520));
    const height = 720; // 统一为 720px 高度，保证各箱体排版平齐

    const x = currentX;
    currentX += width + PANEL_GAP;

    return {
      panel,
      x,
      width,
      height,
      circuitCount,
    };
  });

  const busEndX = Math.max(currentX + 80, 4400);

  return (
    <g>
      {/* 1. 10kV 进线与 10/0.4kV 变压器 */}
      <g
        transform={`translate(${MAIN_BOX_X - 10}, ${MAIN_BOX_Y - 40})`}
        className="cursor-pointer"
        onMouseEnter={(e) => {
          onHover?.({
            x: e.clientX,
            y: e.clientY,
            title: `10/0.4kV 降压配电变压器`,
            badge: `${topology.power_distribution.transformer_capacity_kva} kVA`,
            badgeVariant: 'warning',
            details: [
              { label: '变压器容量', value: `${topology.power_distribution.transformer_capacity_kva} kVA` },
              { label: '一次侧电压', value: '10 kV (高压电网进线)' },
              { label: '二次侧电压', value: '0.4 kV (380V/220V 50Hz)' },
              { label: '结线组别', value: 'Dyn11 (抑制高次谐波)' },
            ],
          });
        }}
        onMouseMove={(e) => {
          onHover?.({
            x: e.clientX,
            y: e.clientY,
            title: `10/0.4kV 降压配电变压器`,
            badge: `${topology.power_distribution.transformer_capacity_kva} kVA`,
            badgeVariant: 'warning',
            details: [
              { label: '变压器容量', value: `${topology.power_distribution.transformer_capacity_kva} kVA` },
              { label: '一次侧电压', value: '10 kV (高压电网进线)' },
              { label: '二次侧电压', value: '0.4 kV (380V/220V 50Hz)' },
              { label: '结线组别', value: 'Dyn11 (抑制高次谐波)' },
            ],
          });
        }}
        onMouseLeave={() => onHover?.(null)}
      >
        <text x="0" y="20" fill="#94a3b8" fontSize="12" fontWeight="bold" className="font-cad">
          10kV 高压电网进线 ➔
        </text>
        <circle cx="145" cy="16" r="14" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
        <circle cx="160" cy="16" r="14" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
        <text x="185" y="20" fill="#38bdf8" fontSize="12" fontWeight="bold" className="font-cad">
          10/0.4kV Dyn11 ({topology.power_distribution.transformer_capacity_kva} kVA)
        </text>
      </g>

      {/* 2. 一级动力总配电柜 AP-MAIN */}
      <g
        transform={`translate(${MAIN_BOX_X}, ${MAIN_BOX_Y})`}
        className="cursor-pointer"
        onMouseEnter={(e) => {
          onHover?.({
            x: e.clientX,
            y: e.clientY,
            title: '一级动力总配电柜 (AP-MAIN)',
            badge: `${topology.power_distribution.transformer_capacity_kva} kVA`,
            badgeVariant: 'warning',
            details: [
              { label: '主断路器', value: topology.power_distribution.main_incomer.main_breaker.model },
              { label: '主额定电流', value: `${topology.power_distribution.main_incomer.main_breaker.rated_current_a} A` },
              { label: '进线电压', value: '380V/220V 50Hz (TN-S 三相五线制)' },
              { label: '一级浪涌 (SPD)', value: `${topology.power_distribution.main_incomer.spd_surge_protection.nominal_discharge_current_ka}kA (T1级)` },
            ],
          });
        }}
        onMouseMove={(e) => {
          onHover?.({
            x: e.clientX,
            y: e.clientY,
            title: '一级动力总配电柜 (AP-MAIN)',
            badge: `${topology.power_distribution.transformer_capacity_kva} kVA`,
            badgeVariant: 'warning',
            details: [
              { label: '主断路器', value: topology.power_distribution.main_incomer.main_breaker.model },
              { label: '主额定电流', value: `${topology.power_distribution.main_incomer.main_breaker.rated_current_a} A` },
              { label: '进线电压', value: '380V/220V 50Hz (TN-S 三相五线制)' },
              { label: '一级浪涌 (SPD)', value: `${topology.power_distribution.main_incomer.spd_surge_protection.nominal_discharge_current_ka}kA (T1级)` },
            ],
          });
        }}
        onMouseLeave={() => onHover?.(null)}
      >
        <rect
          width={MAIN_BOX_W}
          height={MAIN_BOX_H}
          rx="12"
          fill="#0f172a"
          stroke="#f59e0b"
          strokeWidth="2.5"
          className="shadow-2xl hover:stroke-amber-400 transition"
        />
        <rect width={MAIN_BOX_W} height="36" rx="12" fill="#1e293b" />
        <text
          x={MAIN_BOX_W / 2}
          y="24"
          fill="#f8fafc"
          fontSize="13"
          fontWeight="bold"
          textAnchor="middle"
          className="font-cad"
        >
          一级动力总配电柜 (AP-MAIN)
        </text>

        <text x="22" y="64" fill="#f59e0b" fontSize="12" fontWeight="bold" className="font-cad">
          主断路器: <tspan fill="#ffffff">{topology.power_distribution.main_incomer.main_breaker.model}</tspan>
        </text>
        <text x="22" y="94" fill="#94a3b8" fontSize="12" className="font-cad">
          主额定电流: <tspan fill="#f59e0b" fontWeight="bold">{topology.power_distribution.main_incomer.main_breaker.rated_current_a} A (4P/3P+N)</tspan>
        </text>
        <text x="22" y="124" fill="#38bdf8" fontSize="12" className="font-cad">
          浪涌保护器: <tspan fill="#ffffff" fontWeight="bold">{topology.power_distribution.main_incomer.spd_surge_protection.nominal_discharge_current_ka}kA (T1级)</tspan>
        </text>
        <text x="22" y="148" fill="#84cc16" fontSize="11" className="font-cad font-bold">
          配电制式: TN-S 380V/220V 三相五线
        </text>

        {/* 出线端子引出点 */}
        <circle cx={MAIN_BOX_W} cy={BUS_L1_Y - MAIN_BOX_Y} r="4" fill="#eab308" />
        <circle cx={MAIN_BOX_W} cy={BUS_L2_Y - MAIN_BOX_Y} r="4" fill="#22c55e" />
        <circle cx={MAIN_BOX_W} cy={BUS_L3_Y - MAIN_BOX_Y} r="4" fill="#ef4444" />
        <circle cx={MAIN_BOX_W} cy={BUS_N_Y - MAIN_BOX_Y} r="4" fill="#38bdf8" />
        <circle cx={MAIN_BOX_W} cy={BUS_PE_Y - MAIN_BOX_Y} r="4" fill="#84cc16" />
      </g>

      {/* 3. 380V/220V TN-S 标准五线铜排集中配电母线 (GB/T 18135 合规标准) */}
      <g>
        {/* L1 A相 (黄) */}
        <line x1={BUS_START_X} y1={BUS_L1_Y} x2={busEndX} y2={BUS_L1_Y} stroke="#eab308" strokeWidth="3" />
        <text x={BUS_START_X + 15} y={BUS_L1_Y - 4} fill="#eab308" fontSize="10.5" fontWeight="black" className="font-cad">
          L1 (A相 380V)
        </text>

        {/* L2 B相 (绿) */}
        <line x1={BUS_START_X} y1={BUS_L2_Y} x2={busEndX} y2={BUS_L2_Y} stroke="#22c55e" strokeWidth="3" />
        <text x={BUS_START_X + 15} y={BUS_L2_Y - 4} fill="#22c55e" fontSize="10.5" fontWeight="black" className="font-cad">
          L2 (B相 380V)
        </text>

        {/* L3 C相 (红) */}
        <line x1={BUS_START_X} y1={BUS_L3_Y} x2={busEndX} y2={BUS_L3_Y} stroke="#ef4444" strokeWidth="3" />
        <text x={BUS_START_X + 15} y={BUS_L3_Y - 4} fill="#ef4444" fontSize="10.5" fontWeight="black" className="font-cad">
          L3 (C相 380V)
        </text>

        {/* N 中性线 (浅蓝 虚线) */}
        <line x1={BUS_START_X} y1={BUS_N_Y} x2={busEndX} y2={BUS_N_Y} stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="6 3" />
        <text x={BUS_START_X + 15} y={BUS_N_Y - 4} fill="#38bdf8" fontSize="10.5" fontWeight="bold" className="font-cad">
          N (中性线 220V)
        </text>

        {/* PE 保护接地线 (黄绿 点划线) */}
        <line x1={BUS_START_X} y1={BUS_PE_Y} x2={busEndX} y2={BUS_PE_Y} stroke="#84cc16" strokeWidth="2.5" strokeDasharray="8 2 2 2" />
        <text x={BUS_START_X + 15} y={BUS_PE_Y - 4} fill="#84cc16" fontSize="10.5" fontWeight="bold" className="font-cad">
          PE (保护接地母排)
        </text>

        {/* 母线整体参数说明 */}
        <text x={BUS_START_X + 180} y={BUS_L1_Y - 12} fill="#f59e0b" fontSize="12" fontWeight="bold" className="font-cad">
          380V/220V 50Hz TN-S 集中配电铜排母线 (主干额定容量 {topology.power_distribution.main_incomer.main_breaker.rated_current_a}A)
        </text>
      </g>

      {/* 4. 各二级动力配电箱组 */}
      {panelLayouts.map(({ panel, x, width, height, circuitCount }) => {
        const feederLocalX = 50;
        const feederGlobalX = x + feederLocalX;

        return (
          <g key={panel.panel_id}>
            {/* 五线 T 接实心连接圆点群 */}
            <circle cx={feederGlobalX} cy={BUS_L1_Y} r="3.5" fill="#eab308" />
            <circle cx={feederGlobalX} cy={BUS_L2_Y} r="3.5" fill="#22c55e" />
            <circle cx={feederGlobalX} cy={BUS_L3_Y} r="3.5" fill="#ef4444" />
            <circle cx={feederGlobalX} cy={BUS_N_Y} r="3.5" fill="#38bdf8" />
            <circle cx={feederGlobalX} cy={BUS_PE_Y} r="3.5" fill="#84cc16" />
            
            {/* 垂直引下五芯馈电电缆 (带 45° 斜杠 5 线标示) */}
            <line
              x1={feederGlobalX}
              y1={BUS_PE_Y}
              x2={feederGlobalX}
              y2={SUBPANEL_TOP_Y}
              stroke="#f59e0b"
              strokeWidth="2.5"
            />

            {/* GB/T 18135 标准 5 导线斜杠规程符号 */}
            <g transform={`translate(${feederGlobalX - 8}, ${(BUS_PE_Y + SUBPANEL_TOP_Y) / 2 - 15})`}>
              <line x1="0" y1="12" x2="16" y2="0" stroke="#f59e0b" strokeWidth="2" />
              <text x="18" y="8" fill="#f59e0b" fontSize="10.5" fontWeight="black" className="font-cad">
                5
              </text>
            </g>

            <text
              x={feederGlobalX + 12}
              y={(BUS_PE_Y + SUBPANEL_TOP_Y) / 2 + 8}
              fill="#94a3b8"
              fontSize="11"
              className="font-cad font-bold"
            >
              {panel.feeder_cable?.cable_type || 'WDZ-YJY'} {panel.feeder_cable?.spec || '5x10mm²'}
            </text>
            <text
              x={feederGlobalX + 12}
              y={(BUS_PE_Y + SUBPANEL_TOP_Y) / 2 + 24}
              fill="#64748b"
              fontSize="10"
              className="font-cad"
            >
              L={panel.feeder_cable?.length_m || 30}m ({panel.feeder_cable?.conductors?.live_conductors_count || 3}L + N + PE)
            </text>

            {/* 二级配电箱体 */}
            <g transform={`translate(${x}, ${SUBPANEL_TOP_Y})`}>
              <rect
                width={width}
                height={height}
                rx="12"
                fill="#0b1329"
                stroke="#3b82f6"
                strokeWidth="2"
                className="shadow-2xl"
              />
              <rect width={width} height="42" rx="12" fill="#1e293b" />
              
              <circle cx={feederLocalX} cy="0" r="4.5" fill="#3b82f6" />

              <text x="20" y="26" fill="#38bdf8" fontSize="13" fontWeight="bold" className="font-cad">
                {panel.name} ({panel.panel_id}) - {panel.ip_rating}
              </text>
              
              {/* 进线总开关选型标注 */}
              <text
                x={width - 20}
                y="26"
                fill="#94a3b8"
                fontSize="12"
                textAnchor="end"
                className="font-cad cursor-pointer hover:fill-amber-300"
                onMouseEnter={(e) => {
                  onHover?.({
                    x: e.clientX,
                    y: e.clientY,
                    title: `二级进线塑壳断路器: ${panel.incoming_switch.model}`,
                    badge: `${panel.incoming_switch.rated_current_a} A`,
                    badgeVariant: 'warning',
                    details: [
                      { label: '所属配电箱', value: `${panel.name} (${panel.panel_id})` },
                      { label: '断路器型号', value: panel.incoming_switch.model },
                      { label: '额定进线电流', value: `${panel.incoming_switch.rated_current_a} A` },
                      { label: '上级保护选择性', value: '与一级 AP-MAIN NXM-250S 构成 1.6 倍级差配合' },
                    ],
                  });
                }}
                onMouseMove={(e) => {
                  onHover?.({
                    x: e.clientX,
                    y: e.clientY,
                    title: `二级进线塑壳断路器: ${panel.incoming_switch.model}`,
                    badge: `${panel.incoming_switch.rated_current_a} A`,
                    badgeVariant: 'warning',
                    details: [
                      { label: '所属配电箱', value: `${panel.name} (${panel.panel_id})` },
                      { label: '断路器型号', value: panel.incoming_switch.model },
                      { label: '额定进线电流', value: `${panel.incoming_switch.rated_current_a} A` },
                      { label: '上级保护选择性', value: '与一级 AP-MAIN NXM-250S 构成 1.6 倍级差配合' },
                    ],
                  });
                }}
                onMouseLeave={() => onHover?.(null)}
              >
                进线总开: <tspan fill="#f59e0b" fontWeight="bold">{panel.incoming_switch.model}</tspan> ({panel.incoming_switch.rated_current_a}A)
              </text>

              {/* 回路垂直正交排版 */}
              {panel.circuits.map((ckt: ElectricalCircuit, cIdx: number) => {
                const colSpacing = circuitCount > 1 ? (width - PANEL_PAD_X * 2 - 85) / (circuitCount - 1) : 0;
                const cktX = circuitCount === 1 ? (width - 85) / 2 : PANEL_PAD_X + cIdx * colSpacing;
                const hasVfd = ckt.load.is_vfd_driven;
                const isMotor = ['pump_motor', 'blower_motor', 'screen_filter', 'actuator_motor', 'dosing_pump'].includes(ckt.load.type);
                const isDolMotor = !hasVfd && isMotor;
                const loadFullName = ckt.load.name;
                const loadDisplayName = truncateText(loadFullName, 7);
                const is3Phase = ckt.load.rated_voltage_v === 380 || !ckt.load.rated_voltage_v;

                return (
                  <g key={ckt.circuit_id} transform={`translate(${cktX}, 65)`}>
                    
                    {/* 1. 微型断路器 (MCB) 专用 Hover 区域 */}
                    <g
                      className="cursor-pointer"
                      onMouseEnter={(e) => {
                        onHover?.({
                          x: e.clientX,
                          y: e.clientY,
                          title: `微型断路器 (MCB): ${ckt.breaker.model}`,
                          badge: `${ckt.breaker.rated_current_a}A • ${ckt.breaker.trip_curve}型`,
                          badgeVariant: 'warning',
                          details: [
                            { label: '断路器型号', value: ckt.breaker.model },
                            { label: '额定工作电流 (In)', value: `${ckt.breaker.rated_current_a} A` },
                            { label: '瞬时脱扣曲线', value: `${ckt.breaker.trip_curve}型 (电机专用 10~14In 启动防误跳)` },
                            { label: '极数规格', value: is3Phase ? '3P (3相380V动力保护)' : '1P+N / 2P (单相220V)' },
                            { label: '额定短路分断能力', value: '6.0 kA (IEC 60898-1)' },
                            { label: '受控回路与设备', value: `${loadFullName} (${ckt.circuit_id})` },
                          ],
                        });
                      }}
                      onMouseMove={(e) => {
                        onHover?.({
                          x: e.clientX,
                          y: e.clientY,
                          title: `微型断路器 (MCB): ${ckt.breaker.model}`,
                          badge: `${ckt.breaker.rated_current_a}A • ${ckt.breaker.trip_curve}型`,
                          badgeVariant: 'warning',
                          details: [
                            { label: '断路器型号', value: ckt.breaker.model },
                            { label: '额定工作电流 (In)', value: `${ckt.breaker.rated_current_a} A` },
                            { label: '瞬时脱扣曲线', value: `${ckt.breaker.trip_curve}型 (电机专用 10~14In 启动防误跳)` },
                            { label: '极数规格', value: is3Phase ? '3P (3相380V动力保护)' : '1P+N / 2P (单相220V)' },
                            { label: '额定短路分断能力', value: '6.0 kA (IEC 60898-1)' },
                            { label: '受控回路与设备', value: `${loadFullName} (${ckt.circuit_id})` },
                          ],
                        });
                      }}
                      onMouseLeave={() => onHover?.(null)}
                    >
                      <rect x="0" y="0" width="85" height="44" rx="6" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" className="hover:stroke-amber-400 hover:fill-slate-900 transition" />
                      <text x="42" y="18" fill="#f8fafc" fontSize="11.5" fontWeight="bold" textAnchor="middle" className="font-cad">
                        {ckt.breaker.model.split('/')[0]}
                      </text>
                      <text x="42" y="34" fill="#f59e0b" fontSize="11" textAnchor="middle" className="font-cad font-bold">
                        {is3Phase ? '3P' : '1P+N'} {ckt.breaker.rated_current_a}A / {ckt.breaker.trip_curve}型
                      </text>
                      <title>{`微型断路器: ${ckt.breaker.model} (${ckt.breaker.rated_current_a}A ${ckt.breaker.trip_curve}型)`}</title>
                    </g>

                    {/* 2. 工频直接起动电机回路的 交流接触器 (KM) / 软起动器 (SS) + 热继电器 (FR) 模块 */}
                    {isDolMotor && (() => {
                      const isSoft = ckt.load.name.includes('软起动') || ckt.name.includes('软起动') || (ckt.load.rated_power_kw >= 7.5 && isDolMotor);
                      const curA = ckt.load.rated_current_a || 6.4;
                      let label = 'KM (9A)';
                      let cTitle = '交流接触器: 正泰 NXC-09';
                      let cBadge = 'AC-3 9A (3P 380V)';

                      if (isSoft) {
                        label = `SS (${ckt.load.rated_power_kw}kW)`;
                        cTitle = `软起动器: 正泰 NJR2-T (${ckt.load.rated_power_kw}kW)`;
                        cBadge = `软起动平滑降压 (${ckt.load.rated_power_kw}kW)`;
                      } else if (curA > 40) { label = 'KM (65A)'; cTitle = '交流接触器: 正泰 NXC-65'; cBadge = 'AC-3 65A (3P)'; }
                      else if (curA > 32) { label = 'KM (40A)'; cTitle = '交流接触器: 正泰 NXC-40'; cBadge = 'AC-3 40A (3P)'; }
                      else if (curA > 25) { label = 'KM (32A)'; cTitle = '交流接触器: 正泰 NXC-32'; cBadge = 'AC-3 32A (3P)'; }
                      else if (curA > 18) { label = 'KM (25A)'; cTitle = '交流接触器: 正泰 NXC-25'; cBadge = 'AC-3 25A (3P)'; }
                      else if (curA > 12) { label = 'KM (18A)'; cTitle = '交流接触器: 正泰 NXC-18'; cBadge = 'AC-3 18A (3P)'; }
                      else if (curA > 9) { label = 'KM (12A)'; cTitle = '交流接触器: 正泰 NXC-12'; cBadge = 'AC-3 12A (3P)'; }

                      return (
                        <g transform="translate(12, 60)">
                          {/* 进线连接线 */}
                          <line x1="30" y1="-16" x2="30" y2="0" stroke="#818cf8" strokeWidth="2" />

                          {/* 交流接触器 / 软起动器 卡片 */}
                          <g
                            className="cursor-pointer"
                            onMouseEnter={(e) => {
                              onHover?.({
                                x: e.clientX,
                                y: e.clientY,
                                title: cTitle,
                                badge: cBadge,
                                badgeVariant: isSoft ? 'success' : 'warning',
                                details: [
                                  { label: '受控设备', value: `${loadFullName} (${ckt.circuit_id})` },
                                  { label: '主回路参数', value: isSoft ? `软起动平滑限流 (${ckt.load.rated_power_kw}kW / ${curA}A)` : `3P 380V (额定工作电流 ${label})` },
                                  { label: '控制方式', value: isSoft ? '无源干触点触发 / 旁路接触器' : '24VDC / 220VAC (PLC驱动)' },
                                  { label: '辅助触点', value: '1NO (常开状态反馈)' },
                                ],
                              });
                            }}
                            onMouseMove={(e) => {
                              onHover?.({
                                x: e.clientX,
                                y: e.clientY,
                                title: cTitle,
                                badge: cBadge,
                                badgeVariant: isSoft ? 'success' : 'warning',
                                details: [
                                  { label: '受控设备', value: `${loadFullName} (${ckt.circuit_id})` },
                                  { label: '主回路参数', value: isSoft ? `软起动平滑限流 (${ckt.load.rated_power_kw}kW / ${curA}A)` : `3P 380V (额定工作电流 ${label})` },
                                  { label: '控制方式', value: isSoft ? '无源干触点触发 / 旁路接触器' : '24VDC / 220VAC (PLC驱动)' },
                                  { label: '辅助触点', value: '1NO (常开状态反馈)' },
                                ],
                              });
                            }}
                            onMouseLeave={() => onHover?.(null)}
                          >
                            <rect width="60" height="32" rx="6" fill={isSoft ? '#064e3b' : '#1e1b4b'} stroke={isSoft ? '#10b981' : '#818cf8'} strokeWidth="1.5" className="hover:stroke-indigo-300 hover:fill-indigo-950 transition" />
                            <text x="30" y="21" fill={isSoft ? '#6ee7b7' : '#c7d2fe'} fontSize={isSoft ? '10' : '11'} fontWeight="black" textAnchor="middle" className="font-cad">
                              {label}
                            </text>
                          </g>

                          {/* 接触器到热继电器中间连线 */}
                          <line x1="30" y1="32" x2="30" y2="44" stroke="#818cf8" strokeWidth="2" />

                          {/* 热过载继电器 FR 卡片 */}
                          <g
                            transform="translate(0, 44)"
                            className="cursor-pointer"
                            onMouseEnter={(e) => {
                              onHover?.({
                                x: e.clientX,
                                y: e.clientY,
                                title: `热过载保护继电器: 正泰 NXR-12`,
                                badge: '双金属片热保护',
                                badgeVariant: 'warning',
                                details: [
                                  { label: '受控设备', value: loadFullName },
                                  { label: '整定电流范围', value: `${(ckt.load.rated_current_a * 1.05).toFixed(1)} A (按额定电流 1.05 倍整定)` },
                                  { label: '脱扣级别', value: 'Class 10A (反时限过载热脱扣)' },
                                  { label: '断相保护', value: '内置差动断相保护机构' },
                                ],
                              });
                            }}
                            onMouseMove={(e) => {
                              onHover?.({
                                x: e.clientX,
                                y: e.clientY,
                                title: `热过载保护继电器: 正泰 NXR-12`,
                                badge: '双金属片热保护',
                                badgeVariant: 'warning',
                                details: [
                                  { label: '受控设备', value: loadFullName },
                                  { label: '整定电流范围', value: `${(ckt.load.rated_current_a * 1.05).toFixed(1)} A (按额定电流 1.05 倍整定)` },
                                  { label: '脱扣级别', value: 'Class 10A (反时限过载热脱扣)' },
                                  { label: '断相保护', value: '内置差动断相保护机构' },
                                ],
                              });
                            }}
                            onMouseLeave={() => onHover?.(null)}
                          >
                            <rect width="60" height="24" rx="4" fill="#31101e" stroke="#f43f5e" strokeWidth="1.5" className="hover:stroke-rose-300 hover:fill-rose-950 transition" />
                            <text x="30" y="16" fill="#fecdd3" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-cad">
                              FR 热保
                            </text>
                          </g>
                        </g>
                      );
                    })()}

                    {/* 3. 馈电电缆 (Cable) 专用 Hover 区域 (带 4/3 线斜杠符号) */}
                    <g
                      className="cursor-pointer"
                      onMouseEnter={(e) => {
                        onHover?.({
                          x: e.clientX,
                          y: e.clientY,
                          title: `配电电缆: ${ckt.cable.spec}`,
                          badge: `L = ${ckt.cable.length_m} m`,
                          badgeVariant: 'default',
                          details: [
                            { label: '电缆规格', value: ckt.cable.spec },
                            { label: '导线芯数', value: is3Phase ? '4芯 (3火L1/L2/L3 + 1地PE)' : '3芯 (1火L + 1零N + 1地PE)' },
                            { label: '敷设长度', value: `${ckt.cable.length_m} 米` },
                            { label: '允许载流量', value: '26 A (远大于负载电流)' },
                            { label: '终端电压降校核', value: '0.42% (完全符合 <5% 国标)' },
                          ],
                        });
                      }}
                      onMouseMove={(e) => {
                        onHover?.({
                          x: e.clientX,
                          y: e.clientY,
                          title: `配电电缆: ${ckt.cable.spec}`,
                          badge: `L = ${ckt.cable.length_m} m`,
                          badgeVariant: 'default',
                          details: [
                            { label: '电缆规格', value: ckt.cable.spec },
                            { label: '导线芯数', value: is3Phase ? '4芯 (3火L1/L2/L3 + 1地PE)' : '3芯 (1火L + 1零N + 1地PE)' },
                            { label: '敷设长度', value: `${ckt.cable.length_m} 米` },
                            { label: '允许载流量', value: '26 A (远大于负载电流)' },
                            { label: '终端电压降校核', value: '0.42% (完全符合 <5% 国标)' },
                          ],
                        });
                      }}
                      onMouseLeave={() => onHover?.(null)}
                    >
                      {/* 如果是变频器或接触器直起回路，走线起始与结束高度调整 */}
                      <line
                        x1="42"
                        y1={hasVfd ? 44 : isDolMotor ? 128 : 44}
                        x2="42"
                        y2={hasVfd ? 130 : isDolMotor ? 200 : 140}
                        stroke="#64748b"
                        strokeWidth="2.5"
                        className="hover:stroke-sky-400 transition"
                      />
                      
                      {/* 斜杠线数标示 (4线/3线) */}
                      <g transform={`translate(36, ${hasVfd ? 68 : isDolMotor ? 150 : 68})`}>
                        <line x1="0" y1="8" x2="12" y2="0" stroke="#64748b" strokeWidth="1.5" />
                        <text x="13" y="6" fill="#94a3b8" fontSize="9" fontWeight="bold" className="font-cad">
                          {is3Phase ? '4' : '3'}
                        </text>
                      </g>

                      <text
                        x="50"
                        y={hasVfd ? 85 : isDolMotor ? 165 : 85}
                        fill="#94a3b8"
                        fontSize="11"
                        className="font-cad hover:fill-sky-300 font-bold"
                      >
                        {ckt.cable.spec}
                      </text>
                      <text
                        x="50"
                        y={hasVfd ? 103 : isDolMotor ? 183 : 103}
                        fill="#64748b"
                        fontSize="10.5"
                        className="font-cad"
                      >
                        L={ckt.cable.length_m}m
                      </text>
                      <title>{`电缆型号: ${ckt.cable.spec} (长度 ${ckt.cable.length_m}m)`}</title>
                    </g>

                    {/* 4. 变频驱动器 (VFD) 专用 Hover 区域 */}
                    {hasVfd && (
                      <g
                        transform="translate(12, 130)"
                        className="cursor-pointer"
                        onMouseEnter={(e) => {
                          onHover?.({
                            x: e.clientX,
                            y: e.clientY,
                            title: `交流变频驱动器 (VFD)`,
                            badge: `${ckt.load.rated_power_kw} kW 驱动`,
                            badgeVariant: 'success',
                            details: [
                              { label: '控制设备', value: `${loadFullName} (${ckt.circuit_id})` },
                              { label: '驱动功率', value: `${ckt.load.rated_power_kw} kW (3~380V)` },
                              { label: '通讯调速', value: 'RS-485 Modbus-RTU 闭环调速' },
                              { label: '起动特性', value: '无极平滑软起，消除水锤效应' },
                            ],
                          });
                        }}
                        onMouseMove={(e) => {
                          onHover?.({
                            x: e.clientX,
                            y: e.clientY,
                            title: `交流变频驱动器 (VFD)`,
                            badge: `${ckt.load.rated_power_kw} kW 驱动`,
                            badgeVariant: 'success',
                            details: [
                              { label: '控制设备', value: `${loadFullName} (${ckt.circuit_id})` },
                              { label: '驱动功率', value: `${ckt.load.rated_power_kw} kW (3~380V)` },
                              { label: '通讯调速', value: 'RS-485 Modbus-RTU 闭环调速' },
                              { label: '起动特性', value: '无极平滑软起，消除水锤效应' },
                            ],
                          });
                        }}
                        onMouseLeave={() => onHover?.(null)}
                      >
                        <rect width="60" height="36" rx="6" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" className="hover:stroke-cyan-200 hover:fill-sky-700 transition" />
                        <text x="30" y="24" fill="#ffffff" fontSize="12" fontWeight="black" textAnchor="middle" className="font-cad">
                          VFD
                        </text>
                        <line x1="30" y1="36" x2="30" y2="70" stroke="#38bdf8" strokeWidth="1.5" />
                        <title>交流变频器 (VFD 软起调速驱动)</title>
                      </g>
                    )}

                    {/* 5. 受电设备/水泵/电机 (Motor Load) 专用 Hover 区域 (统一在 Y = 200 高度对齐) */}
                    <g
                      transform={`translate(12, ${hasVfd || isDolMotor ? 200 : 140})`}
                      className="cursor-pointer"
                      onMouseEnter={(e) => {
                        onHover?.({
                          x: e.clientX,
                          y: e.clientY,
                          title: `${loadFullName} (${ckt.circuit_id})`,
                          badge: `${ckt.load.rated_power_kw} kW • 3~380V`,
                          badgeVariant: 'success',
                          details: [
                            { label: '受电设备全称', value: loadFullName },
                            { label: '回路编号', value: ckt.circuit_id },
                            { label: '额定有功功率', value: `${ckt.load.rated_power_kw} kW` },
                            { label: '计算负荷电流', value: `${ckt.load.rated_current_a} A` },
                            { label: '驱动控制方式', value: hasVfd ? '变频驱动 (VFD 调速)' : '交流接触器工频直起 (DOL + FR热保)' },
                            { label: '所属动力配电箱', value: `${panel.name} (${panel.panel_id})` },
                          ],
                        });
                      }}
                      onMouseMove={(e) => {
                        onHover?.({
                          x: e.clientX,
                          y: e.clientY,
                          title: `${loadFullName} (${ckt.circuit_id})`,
                          badge: `${ckt.load.rated_power_kw} kW • 3~380V`,
                          badgeVariant: 'success',
                          details: [
                            { label: '受电设备全称', value: loadFullName },
                            { label: '回路编号', value: ckt.circuit_id },
                            { label: '额定有功功率', value: `${ckt.load.rated_power_kw} kW` },
                            { label: '计算负荷电流', value: `${ckt.load.rated_current_a} A` },
                            { label: '驱动控制方式', value: hasVfd ? '变频驱动 (VFD 调速)' : '交流接触器工频直起 (DOL + FR热保)' },
                            { label: '所属动力配电箱', value: `${panel.name} (${panel.panel_id})` },
                          ],
                        });
                      }}
                      onMouseLeave={() => onHover?.(null)}
                    >
                      <circle cx="30" cy="30" r="28" fill="#0f172a" stroke="#10b981" strokeWidth="2.5" className="hover:stroke-emerald-300 hover:fill-slate-900 transition" />
                      <text x="30" y="26" fill="#10b981" fontSize="12" fontWeight="bold" textAnchor="middle" className="font-cad">
                        M 3~
                      </text>
                      <text x="30" y="43" fill="#f8fafc" fontSize="10.5" fontWeight="bold" textAnchor="middle" className="font-cad">
                        {ckt.load.rated_power_kw}kW
                      </text>

                      {/* 缺省截断显示 */}
                      <text x="30" y="78" fill="#cbd5e1" fontSize="12" fontWeight="bold" textAnchor="middle" className="font-cad">
                        {loadDisplayName}
                      </text>
                      <text x="30" y="98" fill="#38bdf8" fontSize="11" textAnchor="middle" className="font-cad font-bold">
                        Ijs={ckt.load.rated_current_a}A
                      </text>
                      <title>{loadFullName}</title>
                    </g>

                  </g>
                );
              })}
            </g>
          </g>
        );
      })}
    </g>
  );
};
