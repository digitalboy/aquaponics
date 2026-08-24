import React from 'react';
import { PlantWideTopology } from '@aquaponics/schema';
import { CadHoverInfo, truncateText } from '../types';

interface Sheet2PLCProps {
  topology: PlantWideTopology;
  onHover?: (info: CadHoverInfo | null) => void;
}

export const Sheet2PLC: React.FC<Sheet2PLCProps> = ({ topology, onHover }) => {
  const plc = topology.plc_controller;
  if (!plc) {
    return (
      <text x="400" y="200" fill="#94a3b8" fontSize="18" className="font-cad">
        未配置 PLC 控制器点位映射数据
      </text>
    );
  }

  const diList = plc.digital_inputs || [];
  const doList = plc.digital_outputs || [];
  const maxPoints = Math.max(diList.length, doList.length);

  const rackHeight = Math.max(110 + maxPoints * 48, 520);
  const rackWidth = 660;

  return (
    <g transform="translate(100, 70)">
      {/* PLC 主控制器机架外框 */}
      <g
        className="cursor-pointer"
        onMouseEnter={(e) => {
          onHover?.({
            x: e.clientX,
            y: e.clientY,
            title: `PLC 主控制器 (${plc.controller_model})`,
            badge: plc.ip_address,
            badgeVariant: 'success',
            details: [
              { label: '控制器型号', value: plc.controller_model },
              { label: '工业以太网 IP', value: plc.ip_address },
              { label: 'DI 映射数量', value: `${diList.length} 点 (24VDC)` },
              { label: 'DO 映射数量', value: `${doList.length} 点 (继电器)` },
            ],
          });
        }}
        onMouseMove={(e) => {
          onHover?.({
            x: e.clientX,
            y: e.clientY,
            title: `PLC 主控制器 (${plc.controller_model})`,
            badge: plc.ip_address,
            badgeVariant: 'success',
            details: [
              { label: '控制器型号', value: plc.controller_model },
              { label: '工业以太网 IP', value: plc.ip_address },
              { label: 'DI 映射数量', value: `${diList.length} 点 (24VDC)` },
              { label: 'DO 映射数量', value: `${doList.length} 点 (继电器)` },
            ],
          });
        }}
        onMouseLeave={() => onHover?.(null)}
      >
        <rect
          width={rackWidth}
          height={rackHeight}
          rx="16"
          fill="#0f172a"
          stroke="#10b981"
          strokeWidth="3"
          className="shadow-2xl hover:stroke-emerald-400 transition"
        />
        <rect width={rackWidth} height="48" rx="16" fill="#064e3b" />
        <text x="30" y="30" fill="#a7f3d0" fontSize="15" fontWeight="black" className="font-cad">
          PLC 控制器: {plc.controller_model} ({plc.ip_address})
        </text>
        <text x={rackWidth - 30} y="30" fill="#6ee7b7" fontSize="11" textAnchor="end" className="font-cad">
          I/O 映射总数: {diList.length} DI / {doList.length} DO
        </text>
      </g>

      {/* DI 数字量输入点位列表 */}
      <g transform="translate(35, 75)">
        <text x="0" y="0" fill="#38bdf8" fontSize="13" fontWeight="bold" className="font-cad">
          数字量输入 (Digital Inputs - 24VDC)
        </text>
        {diList.map((di, idx) => {
          const fullName = di.signal_name;
          const displayName = truncateText(fullName, 10);

          return (
            <g
              key={di.point_id}
              transform={`translate(0, ${20 + idx * 46})`}
              className="cursor-pointer"
              onMouseEnter={(e) => {
                onHover?.({
                  x: e.clientX,
                  y: e.clientY,
                  title: `数字量输入 ${di.point_id}: ${fullName}`,
                  badge: '24VDC 输入',
                  badgeVariant: 'warning',
                  details: [
                    { label: '通道点位', value: di.point_id },
                    { label: '信号全称', value: fullName },
                    { label: '设计线号', value: di.wire_id },
                    { label: '电气类型', value: '常开干接点 (NO 24VDC)' },
                  ],
                });
              }}
              onMouseMove={(e) => {
                onHover?.({
                  x: e.clientX,
                  y: e.clientY,
                  title: `数字量输入 ${di.point_id}: ${fullName}`,
                  badge: '24VDC 输入',
                  badgeVariant: 'warning',
                  details: [
                    { label: '通道点位', value: di.point_id },
                    { label: '信号全称', value: fullName },
                    { label: '设计线号', value: di.wire_id },
                    { label: '电气类型', value: '常开干接点 (NO 24VDC)' },
                  ],
                });
              }}
              onMouseLeave={() => onHover?.(null)}
            >
              <rect width="270" height="34" rx="6" fill="#1e293b" stroke="#334155" className="hover:stroke-sky-400 hover:fill-slate-900 transition" />
              <rect width="46" height="34" rx="6" fill="#0284c7" />
              <text x="23" y="21" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle" className="font-cad">
                {di.point_id}
              </text>
              <text x="56" y="21" fill="#f8fafc" fontSize="12" fontWeight="bold" className="font-cad">
                {displayName}
              </text>
              <text x="260" y="21" fill="#94a3b8" fontSize="11" textAnchor="end" className="font-cad">
                {di.wire_id}
              </text>
              <title>{fullName}</title>
            </g>
          );
        })}
      </g>

      {/* DO 数字量输出点位列表 */}
      <g transform="translate(345, 75)">
        <text x="0" y="0" fill="#a7f3d0" fontSize="14" fontWeight="bold" className="font-cad">
          数字量输出 (Digital Outputs - 继电器)
        </text>
        {doList.map((doPt, idx) => {
          const fullName = doPt.signal_name;
          const displayName = truncateText(fullName, 10);

          return (
            <g
              key={doPt.point_id}
              transform={`translate(0, ${20 + idx * 46})`}
              className="cursor-pointer"
              onMouseEnter={(e) => {
                onHover?.({
                  x: e.clientX,
                  y: e.clientY,
                  title: `数字量输出 ${doPt.point_id}: ${fullName}`,
                  badge: '继电器输出',
                  badgeVariant: 'success',
                  details: [
                    { label: '通道点位', value: doPt.point_id },
                    { label: '控制设备', value: fullName },
                    { label: '设计线号', value: doPt.wire_id },
                    { label: '触点容量', value: '250VAC 5A / 30VDC 5A' },
                  ],
                });
              }}
              onMouseMove={(e) => {
                onHover?.({
                  x: e.clientX,
                  y: e.clientY,
                  title: `数字量输出 ${doPt.point_id}: ${fullName}`,
                  badge: '继电器输出',
                  badgeVariant: 'success',
                  details: [
                    { label: '通道点位', value: doPt.point_id },
                    { label: '控制设备', value: fullName },
                    { label: '设计线号', value: doPt.wire_id },
                    { label: '触点容量', value: '250VAC 5A / 30VDC 5A' },
                  ],
                });
              }}
              onMouseLeave={() => onHover?.(null)}
            >
              <rect width="270" height="34" rx="6" fill="#1e293b" stroke="#334155" className="hover:stroke-emerald-400 hover:fill-slate-900 transition" />
              <rect width="46" height="34" rx="6" fill="#059669" />
              <text x="23" y="21" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle" className="font-cad">
                {doPt.point_id}
              </text>
              <text x="56" y="21" fill="#f8fafc" fontSize="12" fontWeight="bold" className="font-cad">
                {displayName}
              </text>
              <text x="260" y="21" fill="#94a3b8" fontSize="11" textAnchor="end" className="font-cad">
                {doPt.wire_id}
              </text>
              <title>{fullName}</title>
            </g>
          );
        })}
      </g>
    </g>
  );
};
