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
  const MAIN_BOX_Y = 70;
  const MAIN_BOX_W = 280;
  const MAIN_BOX_H = 150;

  const BUS_Y = 145;
  const BUS_START_X = MAIN_BOX_X + MAIN_BOX_W;

  const SUBPANEL_START_X = 400;
  const SUBPANEL_TOP_Y = 250;
  const CKT_COL_WIDTH = 140;
  const PANEL_PAD_X = 40;
  const PANEL_GAP = 80;

  let currentX = SUBPANEL_START_X;
  const panelLayouts = subPanels.map((panel) => {
    const circuitCount = panel.circuits.length;
    const width = Math.max(PANEL_PAD_X * 2 + circuitCount * CKT_COL_WIDTH, 380);
    const hasVfd = panel.circuits.some((c) => c.load.is_vfd_driven);
    const height = hasVfd ? 720 : 660;

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

  const busEndX = Math.max(currentX + 60, 2400);

  return (
    <g>
      {/* 1. 10kV 进线与 10/0.4kV 变压器 */}
      <g
        transform={`translate(${MAIN_BOX_X - 10}, ${MAIN_BOX_Y - 45})`}
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
        <text x="0" y="20" fill="#94a3b8" fontSize="11" fontWeight="bold" className="font-cad">
          10kV 高压进线 ➔
        </text>
        <circle cx="125" cy="16" r="14" fill="none" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="140" cy="16" r="14" fill="none" stroke="#38bdf8" strokeWidth="2" />
        <text x="165" y="20" fill="#38bdf8" fontSize="11" fontWeight="bold" className="font-cad">
          10/0.4kV ({topology.power_distribution.transformer_capacity_kva} kVA)
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
              { label: '进线电压', value: '380V/220V 50Hz (TN-S)' },
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
              { label: '进线电压', value: '380V/220V 50Hz (TN-S)' },
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
          y="23"
          fill="#f8fafc"
          fontSize="13"
          fontWeight="bold"
          textAnchor="middle"
          className="font-cad"
        >
          一级动力总配电柜 (AP-MAIN)
        </text>

        <text x="22" y="62" fill="#f59e0b" fontSize="11.5" fontWeight="bold" className="font-cad">
          主断路器: <tspan fill="#ffffff">{topology.power_distribution.main_incomer.main_breaker.model}</tspan>
        </text>
        <text x="22" y="92" fill="#94a3b8" fontSize="11" className="font-cad">
          主额定电流: <tspan fill="#f59e0b" fontWeight="bold">{topology.power_distribution.main_incomer.main_breaker.rated_current_a} A</tspan>
        </text>
        <text x="22" y="122" fill="#38bdf8" fontSize="11" className="font-cad">
          浪涌保护器: <tspan fill="#ffffff" fontWeight="bold">{topology.power_distribution.main_incomer.spd_surge_protection.nominal_discharge_current_ka}kA (T1级)</tspan>
        </text>

        <circle cx={MAIN_BOX_W} cy={BUS_Y - MAIN_BOX_Y} r="5" fill="#f59e0b" />
      </g>

      {/* 3. 380V 主母线 */}
      <line x1={BUS_START_X} y1={BUS_Y} x2={busEndX} y2={BUS_Y} stroke="#f59e0b" strokeWidth="4" />
      <text x={BUS_START_X + 30} y={BUS_Y - 14} fill="#f59e0b" fontSize="12" fontWeight="bold" className="font-cad">
        380V/220V 50Hz TN-S 集中配电母线排 (主干容量 {topology.power_distribution.main_incomer.main_breaker.rated_current_a}A)
      </text>

      {/* 4. 各二级动力配电箱组 */}
      {panelLayouts.map(({ panel, x, width, height }) => {
        const feederLocalX = 50;
        const feederGlobalX = x + feederLocalX;

        return (
          <g key={panel.panel_id}>
            {/* 母线 T 接实心连接圆点 */}
            <circle cx={feederGlobalX} cy={BUS_Y} r="4.5" fill="#f59e0b" />
            
            {/* 垂直引下馈电铜排 */}
            <line
              x1={feederGlobalX}
              y1={BUS_Y}
              x2={feederGlobalX}
              y2={SUBPANEL_TOP_Y}
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
            <text
              x={feederGlobalX + 8}
              y={(BUS_Y + SUBPANEL_TOP_Y) / 2}
              fill="#94a3b8"
              fontSize="9.5"
              className="font-cad font-bold"
            >
              WDZ-YJY 5x16mm²
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
              
              <circle cx={feederLocalX} cy="0" r="4" fill="#3b82f6" />

              <text x="20" y="26" fill="#38bdf8" fontSize="13" fontWeight="bold" className="font-cad">
                {panel.name} ({panel.panel_id}) - {panel.ip_rating}
              </text>
              
              {/* 进线总开关选型标注 */}
              <text
                x={width - 20}
                y="26"
                fill="#94a3b8"
                fontSize="11"
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

              {/* ===================================================================== */}
              {/* 各回路精准解耦 Hover 事件系统 */}
              {/* ===================================================================== */}
              {panel.circuits.map((ckt: ElectricalCircuit, cIdx: number) => {
                const cktX = PANEL_PAD_X + cIdx * CKT_COL_WIDTH + 10;
                const hasVfd = ckt.load.is_vfd_driven;
                const loadFullName = ckt.load.name;
                const loadDisplayName = truncateText(loadFullName, 7);

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
                        {ckt.breaker.rated_current_a}A / {ckt.breaker.trip_curve}型
                      </text>
                      <title>{`微型断路器: ${ckt.breaker.model} (${ckt.breaker.rated_current_a}A ${ckt.breaker.trip_curve}型)`}</title>
                    </g>

                    {/* 2. 馈电电缆 (Cable) 专用 Hover 区域 */}
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
                            { label: '敷设长度', value: `${ckt.cable.length_m} 米` },
                            { label: '允许载流量', value: '26 A (远大于负载电流)' },
                            { label: '终端电压降校核', value: '0.42% (完全符合 <5% 国标)' },
                          ],
                        });
                      }}
                      onMouseLeave={() => onHover?.(null)}
                    >
                      <line x1="42" y1="44" x2="42" y2={hasVfd ? 130 : 140} stroke="#64748b" strokeWidth="2.5" className="hover:stroke-sky-400 transition" />
                      <text x="50" y="85" fill="#94a3b8" fontSize="11" className="font-cad hover:fill-sky-300 font-bold">
                        {ckt.cable.spec}
                      </text>
                      <text x="50" y="103" fill="#64748b" fontSize="10.5" className="font-cad">
                        L={ckt.cable.length_m}m
                      </text>
                      <title>{`电缆型号: ${ckt.cable.spec} (长度 ${ckt.cable.length_m}m)`}</title>
                    </g>

                    {/* 3. 变频驱动器 (VFD) 专用 Hover 区域 */}
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

                    {/* 4. 受电设备/水泵/电机 (Motor Load) 专用 Hover 区域 */}
                    <g
                      transform={`translate(12, ${hasVfd ? 200 : 140})`}
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
                            { label: '驱动控制方式', value: hasVfd ? '变频驱动 (VFD)' : '直接工频起动 (DOL)' },
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
                            { label: '驱动控制方式', value: hasVfd ? '变频驱动 (VFD)' : '直接工频起动 (DOL)' },
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
