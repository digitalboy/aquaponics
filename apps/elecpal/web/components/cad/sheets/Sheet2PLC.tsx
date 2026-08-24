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

  const RACK_W = 860;
  const RACK_H = Math.max(120 + maxPoints * 72, 420);
  const START_X = 260;
  const START_Y = 80;

  return (
    <g transform={`translate(${START_X}, ${START_Y})`}>
      {/* =========================================================================
          1. PLC 主控制器机架外框 (Inovance Easy320-1614TN)
         ========================================================================= */}
      <g
        className="cursor-pointer"
        onMouseEnter={(e) => {
          onHover?.({
            x: e.clientX,
            y: e.clientY,
            title: `PLC 主控制器: ${plc.controller_brand || '汇川'} ${plc.controller_model}`,
            badge: `${plc.ip_address}:${plc.port || 502}`,
            badgeVariant: 'success',
            details: [
              { label: '控制器品牌/型号', value: `${plc.controller_brand || '汇川'} ${plc.controller_model}` },
              { label: '工业以太网 IP', value: `${plc.ip_address} (${plc.protocol || 'Modbus-TCP'})` },
              { label: 'DI 状态输入映射', value: `${diList.length} 点 (24VDC 状态反馈/报警连锁)` },
              { label: 'DO 控制输出映射', value: `${doList.length} 点 (中间继电器驱动水泵/电磁阀)` },
              { label: '自控供电制式', value: '24VDC 稳压开关电源 (独立弱电接地)' },
            ],
          });
        }}
        onMouseMove={(e) => {
          onHover?.({
            x: e.clientX,
            y: e.clientY,
            title: `PLC 主控制器: ${plc.controller_brand || '汇川'} ${plc.controller_model}`,
            badge: `${plc.ip_address}:${plc.port || 502}`,
            badgeVariant: 'success',
            details: [
              { label: '控制器品牌/型号', value: `${plc.controller_brand || '汇川'} ${plc.controller_model}` },
              { label: '工业以太网 IP', value: `${plc.ip_address} (${plc.protocol || 'Modbus-TCP'})` },
              { label: 'DI 状态输入映射', value: `${diList.length} 点 (24VDC 状态反馈/报警连锁)` },
              { label: 'DO 控制输出映射', value: `${doList.length} 点 (中间继电器驱动水泵/电磁阀)` },
              { label: '自控供电制式', value: '24VDC 稳压开关电源 (独立弱电接地)' },
            ],
          });
        }}
        onMouseLeave={() => onHover?.(null)}
      >
        <rect
          width={RACK_W}
          height={RACK_H}
          rx="16"
          fill="#0a0f1d"
          stroke="#10b981"
          strokeWidth="3"
          className="shadow-2xl hover:stroke-emerald-400 transition"
        />
        <rect width={RACK_W} height="52" rx="16" fill="#064e3b" />
        
        {/* 控制器标头 */}
        <text x="28" y="33" fill="#a7f3d0" fontSize="16" fontWeight="black" className="font-cad">
          PLC 主控制器: {plc.controller_brand || '汇川'} {plc.controller_model}
        </text>
        <text x={RACK_W - 28} y="33" fill="#6ee7b7" fontSize="12" fontWeight="bold" textAnchor="end" className="font-cad">
          工业以太网: {plc.ip_address} • 映射: {diList.length} DI (输入) / {doList.length} DO (输出)
        </text>
      </g>

      {/* =========================================================================
          2. DI 数字量输入点位群 (左侧通道 ➔ 现场传感器/开关信号)
         ========================================================================= */}
      <g transform="translate(30, 75)">
        <text x="0" y="0" fill="#38bdf8" fontSize="14" fontWeight="black" className="font-cad">
          数字量输入 (Digital Inputs - 24VDC 状态信号)
        </text>

        {diList.map((di, idx) => {
          const rowY = 18 + idx * 64;
          const targetDevice = di.description || di.signal_name;
          const signalCode = di.signal_name;
          const wireCode = di.wire_id;
          const contactType = di.contact_type || 'NO';

          return (
            <g key={di.point_id} transform={`translate(0, ${rowY})`}>
              {/* 左侧外部现场传感器/开关源图标卡 (显性展示接入什么传感器) */}
              <g
                transform="translate(-210, 0)"
                className="cursor-pointer"
                onMouseEnter={(e) => {
                  onHover?.({
                    x: e.clientX,
                    y: e.clientY,
                    title: `现场信号源: ${targetDevice}`,
                    badge: `${contactType} 常开/常闭`,
                    badgeVariant: 'warning',
                    details: [
                      { label: '现场传感器/开关', value: targetDevice },
                      { label: '对应 PLC 端子', value: di.point_id },
                      { label: '套管线号印字', value: wireCode },
                      { label: '信号触发逻辑', value: contactType === 'NC' ? '常闭触点 (断开即触发急停/报警)' : '常开干接点 (闭合导通)' },
                    ],
                  });
                }}
                onMouseMove={(e) => {
                  onHover?.({
                    x: e.clientX,
                    y: e.clientY,
                    title: `现场信号源: ${targetDevice}`,
                    badge: `${contactType} 常开/常闭`,
                    badgeVariant: 'warning',
                    details: [
                      { label: '现场传感器/开关', value: targetDevice },
                      { label: '对应 PLC 端子', value: di.point_id },
                      { label: '套管线号印字', value: wireCode },
                      { label: '信号触发逻辑', value: contactType === 'NC' ? '常闭触点 (断开即触发急停/报警)' : '常开干接点 (闭合导通)' },
                    ],
                  });
                }}
                onMouseLeave={() => onHover?.(null)}
              >
                <rect width="180" height="48" rx="8" fill="#1e293b" stroke="#0284c7" strokeWidth="1.5" className="hover:stroke-sky-300 hover:fill-slate-900 transition" />
                <text x="14" y="22" fill="#38bdf8" fontSize="12" fontWeight="bold" className="font-cad">
                  {truncateText(targetDevice, 11)}
                </text>
                <text x="14" y="38" fill="#94a3b8" fontSize="10.5" className="font-cad">
                  触点: <tspan fill="#fbbf24" fontWeight="bold">{contactType}</tspan> • 线号: {wireCode}
                </text>
              </g>

              {/* 外部连线 (24VDC 蓝色导线 ➔ PLC 进线) */}
              <line x1="-30" y1="24" x2="0" y2="24" stroke="#0284c7" strokeWidth="2" strokeDasharray="3 2" />
              <polygon points="-2,24 -8,20 -8,28" fill="#0284c7" />

              {/* PLC 内部输入端子卡片 */}
              <g
                className="cursor-pointer"
                onMouseEnter={(e) => {
                  onHover?.({
                    x: e.clientX,
                    y: e.clientY,
                    title: `PLC 输入通道 ${di.point_id} ➔ ${targetDevice}`,
                    badge: '24VDC 状态输入',
                    badgeVariant: 'warning',
                    details: [
                      { label: '接入受控对象', value: targetDevice },
                      { label: 'PLC 通道端子', value: di.point_id },
                      { label: '信号工程代码', value: signalCode },
                      { label: '施工套管线号', value: wireCode },
                      { label: '电气特性', value: '24VDC 光电隔离输入 (防强电误入)' },
                    ],
                  });
                }}
                onMouseMove={(e) => {
                  onHover?.({
                    x: e.clientX,
                    y: e.clientY,
                    title: `PLC 输入通道 ${di.point_id} ➔ ${targetDevice}`,
                    badge: '24VDC 状态输入',
                    badgeVariant: 'warning',
                    details: [
                      { label: '接入受控对象', value: targetDevice },
                      { label: 'PLC 通道端子', value: di.point_id },
                      { label: '信号工程代码', value: signalCode },
                      { label: '施工套管线号', value: wireCode },
                      { label: '电气特性', value: '24VDC 光电隔离输入 (防强电误入)' },
                    ],
                  });
                }}
                onMouseLeave={() => onHover?.(null)}
              >
                <rect width="360" height="48" rx="8" fill="#111c35" stroke="#1e293b" className="hover:stroke-sky-400 hover:fill-slate-900 transition" />
                <rect width="52" height="48" rx="8" fill="#0284c7" />
                <text x="26" y="30" fill="#ffffff" fontSize="14" fontWeight="black" textAnchor="middle" className="font-cad">
                  {di.point_id}
                </text>

                {/* 显性中文主标题：接入什么传感器/开关 */}
                <text x="64" y="22" fill="#f8fafc" fontSize="13" fontWeight="bold" className="font-cad">
                  {truncateText(targetDevice, 14)}
                </text>

                {/* 副标题：信号代码 + 线号印字 */}
                <text x="64" y="40" fill="#94a3b8" fontSize="11" className="font-cad">
                  <tspan fill="#38bdf8">{signalCode}</tspan> • 线号: <tspan fill="#fbbf24" fontWeight="bold">{wireCode}</tspan>
                </text>
              </g>
            </g>
          );
        })}
      </g>

      {/* =========================================================================
          3. DO 数字量输出点位群 (右侧通道 ➔ 驱动中间继电器/电机/电磁阀)
         ========================================================================= */}
      <g transform="translate(450, 75)">
        <text x="0" y="0" fill="#a7f3d0" fontSize="14" fontWeight="black" className="font-cad">
          数字量输出 (Digital Outputs - 继电器驱动执行器)
        </text>

        {doList.map((doPt, idx) => {
          const rowY = 18 + idx * 64;
          const targetActuator = doPt.description || doPt.signal_name;
          const signalCode = doPt.signal_name;
          const wireCode = doPt.wire_id;

          return (
            <g key={doPt.point_id} transform={`translate(0, ${rowY})`}>
              {/* PLC 内部输出端子卡片 */}
              <g
                className="cursor-pointer"
                onMouseEnter={(e) => {
                  onHover?.({
                    x: e.clientX,
                    y: e.clientY,
                    title: `PLC 输出通道 ${doPt.point_id} ➔ 驱动 ${targetActuator}`,
                    badge: '继电器输出',
                    badgeVariant: 'success',
                    details: [
                      { label: '受控电机/执行器', value: targetActuator },
                      { label: 'PLC 通道端子', value: doPt.point_id },
                      { label: '控制工程代码', value: signalCode },
                      { label: '施工套管线号', value: wireCode },
                      { label: '隔离驱动方式', value: '驱动中间继电器 KA (触点 250VAC 5A)' },
                    ],
                  });
                }}
                onMouseMove={(e) => {
                  onHover?.({
                    x: e.clientX,
                    y: e.clientY,
                    title: `PLC 输出通道 ${doPt.point_id} ➔ 驱动 ${targetActuator}`,
                    badge: '继电器输出',
                    badgeVariant: 'success',
                    details: [
                      { label: '受控电机/执行器', value: targetActuator },
                      { label: 'PLC 通道端子', value: doPt.point_id },
                      { label: '控制工程代码', value: signalCode },
                      { label: '施工套管线号', value: wireCode },
                      { label: '隔离驱动方式', value: '驱动中间继电器 KA (触点 250VAC 5A)' },
                    ],
                  });
                }}
                onMouseLeave={() => onHover?.(null)}
              >
                <rect width="360" height="48" rx="8" fill="#0f291e" stroke="#1e293b" className="hover:stroke-emerald-400 hover:fill-slate-900 transition" />
                <rect width="52" height="48" rx="8" fill="#059669" />
                <text x="26" y="30" fill="#ffffff" fontSize="14" fontWeight="black" textAnchor="middle" className="font-cad">
                  {doPt.point_id}
                </text>

                {/* 显性中文主标题：受控电机/电磁阀 */}
                <text x="64" y="22" fill="#f8fafc" fontSize="13" fontWeight="bold" className="font-cad">
                  {truncateText(targetActuator, 14)}
                </text>

                {/* 副标题：控制代码 + 线号印字 */}
                <text x="64" y="40" fill="#94a3b8" fontSize="11" className="font-cad">
                  <tspan fill="#6ee7b7">{signalCode}</tspan> • 线号: <tspan fill="#fbbf24" fontWeight="bold">{wireCode}</tspan>
                </text>
              </g>

              {/* 外部连线 (DO 输出 ➔ 外部受控执行机构) */}
              <line x1="360" y1="24" x2="390" y2="24" stroke="#059669" strokeWidth="2" strokeDasharray="3 2" />
              <polygon points="388,24 382,20 382,28" fill="#059669" />

              {/* 右侧受控电机 / 电磁阀 / 变频器执行器卡片 (显性展示接入什么执行器) */}
              <g
                transform="translate(390, 0)"
                className="cursor-pointer"
                onMouseEnter={(e) => {
                  onHover?.({
                    x: e.clientX,
                    y: e.clientY,
                    title: `受控执行机构: ${targetActuator}`,
                    badge: '中间继电器隔离驱动',
                    badgeVariant: 'success',
                    details: [
                      { label: '执行器全称', value: targetActuator },
                      { label: '控制线号', value: wireCode },
                      { label: '驱动电压', value: '24VDC 驱动继电器线圈 A1/A2' },
                      { label: '触点负载', value: '控制 380V 水泵交流接触器 / 24V 电磁阀' },
                    ],
                  });
                }}
                onMouseMove={(e) => {
                  onHover?.({
                    x: e.clientX,
                    y: e.clientY,
                    title: `受控执行机构: ${targetActuator}`,
                    badge: '中间继电器隔离驱动',
                    badgeVariant: 'success',
                    details: [
                      { label: '执行器全称', value: targetActuator },
                      { label: '控制线号', value: wireCode },
                      { label: '驱动电压', value: '24VDC 驱动继电器线圈 A1/A2' },
                      { label: '触点负载', value: '控制 380V 水泵交流接触器 / 24V 电磁阀' },
                    ],
                  });
                }}
                onMouseLeave={() => onHover?.(null)}
              >
                <rect width="180" height="48" rx="8" fill="#1e293b" stroke="#059669" strokeWidth="1.5" className="hover:stroke-emerald-300 hover:fill-slate-900 transition" />
                <text x="14" y="22" fill="#6ee7b7" fontSize="12" fontWeight="bold" className="font-cad">
                  {truncateText(targetActuator, 11)}
                </text>
                <text x="14" y="38" fill="#94a3b8" fontSize="10.5" className="font-cad">
                  线圈: <tspan fill="#fbbf24" fontWeight="bold">KA1</tspan> • 线号: {wireCode}
                </text>
              </g>
            </g>
          );
        })}
      </g>
    </g>
  );
};
