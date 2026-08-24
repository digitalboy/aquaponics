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
  const maxPoints = Math.max(diList.length, doList.length, 6);

  const RACK_W = 740;
  const RACK_H = Math.max(120 + maxPoints * 68, 480);
  const START_X = 300;
  const START_Y = 130; // 顶部预留空间给明纬 NDR-120-24 导轨开关电源

  return (
    <g transform={`translate(${START_X}, ${START_Y})`}>
      {/* =========================================================================
          0. ⭐️ 核心弱电供电中枢：明纬 (MEAN WELL) NDR-120-24 导轨开关电源 (24V 5A 120W)
         ========================================================================= */}
      <g
        transform="translate(0, -90)"
        className="cursor-pointer"
        onMouseEnter={(e) => {
          onHover?.({
            x: e.clientX,
            y: e.clientY,
            title: `直流稳压电源: 台湾明纬 (MEAN WELL) NDR-120-24`,
            badge: 'DC 24V 5A (120W 导轨电源)',
            badgeVariant: 'warning',
            details: [
              { label: '电源型号', value: 'NDR-120-24 (TS-35 导轨安装，超薄 40mm 金属机身)' },
              { label: '交流输入', value: '220VAC 50Hz (来自 1kVA 工控在线式 UPS)' },
              { label: '直流输出', value: 'DC 24V ±10% (额定 5A / 120W 满载自然风冷)' },
              { label: '全厂实时负载率', value: '约 42.5W / 120W (负载率 35.4%，具备 2.8 倍充足安全余量)' },
              { label: '工业四重保护', value: '短路保护、过载恒流保护、过电压保护、过温保护' },
              { label: '端子排布', value: '顶部输出: -V / -V / +V / +V ；底部输入: PE / N / L' },
            ],
          });
        }}
        onMouseMove={(e) => {
          onHover?.({
            x: e.clientX,
            y: e.clientY,
            title: `直流稳压电源: 台湾明纬 (MEAN WELL) NDR-120-24`,
            badge: 'DC 24V 5A (120W 导轨电源)',
            badgeVariant: 'warning',
            details: [
              { label: '电源型号', value: 'NDR-120-24 (TS-35 导轨安装，超薄 40mm 金属机身)' },
              { label: '交流输入', value: '220VAC 50Hz (来自 1kVA 工控在线式 UPS)' },
              { label: '直流输出', value: 'DC 24V ±10% (额定 5A / 120W 满载自然风冷)' },
              { label: '全厂实时负载率', value: '约 42.5W / 120W (负载率 35.4%，具备 2.8 倍充足安全余量)' },
              { label: '工业四重保护', value: '短路保护、过载恒流保护、过电压保护、过温保护' },
              { label: '端子排布', value: '顶部输出: -V / -V / +V / +V ；底部输入: PE / N / L' },
            ],
          });
        }}
        onMouseLeave={() => onHover?.(null)}
      >
        {/* 220V 进线箭头 */}
        <g transform="translate(-240, 20)">
          <line x1="0" y1="12" x2="60" y2="12" stroke="#f59e0b" strokeWidth="2" />
          <polygon points="58,12 52,8 52,16" fill="#f59e0b" />
          <text x="30" y="4" fill="#f59e0b" fontSize="10.5" fontWeight="bold" textAnchor="middle" className="font-cad">
            220VAC (UPS供电)
          </text>
        </g>

        {/* 开关电源本体卡片 */}
        <rect
          x="-170"
          y="0"
          width="420"
          height="64"
          rx="10"
          fill="#0f172a"
          stroke="#f59e0b"
          strokeWidth="2"
          className="shadow-xl hover:stroke-amber-400 transition"
        />
        <rect x="-170" y="0" width="420" height="22" rx="10" fill="#78350f" />

        <text x="-158" y="16" fill="#fef3c7" fontSize="11" fontWeight="black" className="font-cad">
          ⚡ 直流稳压电源: 明纬 (MEAN WELL) NDR-120-24 (DC 24V / 5A 120W)
        </text>

        {/* 底部输入端子与顶部输出端子示意 */}
        <text x="-158" y="42" fill="#94a3b8" fontSize="11" className="font-cad">
          输入: <tspan fill="#f59e0b" fontWeight="bold">L / N / PE (220V)</tspan> • 保护: <tspan fill="#38bdf8">短路/过载恒流</tspan>
        </text>
        <text x="-158" y="56" fill="#10b981" fontSize="10.5" fontWeight="bold" className="font-cad">
          输出端子: +V (+24VDC) / -V (0V GND) ➔ 全厂弱电总母线 (负载率 35%)
        </text>

        {/* 24V 馈出分流至 PLC 与传感器母线 */}
        <g transform="translate(250, 32)">
          <line x1="0" y1="0" x2="60" y2="0" stroke="#10b981" strokeWidth="2.5" />
          <line x1="60" y1="0" x2="60" y2="38" stroke="#10b981" strokeWidth="2.5" />
          <polygon points="60,36 56,30 64,30" fill="#10b981" />
          <text x="30" y="-6" fill="#10b981" fontSize="9.5" fontWeight="bold" textAnchor="middle" className="font-cad">
            DC 24V 供电母线
          </text>
        </g>
      </g>

      {/* =========================================================================
          1. PLC 主控制器机架外框 (Inovance Easy320-0808TN)
         ========================================================================= */}
      <g
        className="cursor-pointer"
        onMouseEnter={(e) => {
          onHover?.({
            x: e.clientX,
            y: e.clientY,
            title: `PLC 主控制器: ${plc.controller_brand ? `${plc.controller_brand} ` : ''}${plc.controller_model}`,
            badge: `${plc.ip_address}:${plc.port || 502}`,
            badgeVariant: 'success',
            details: [
              { label: '控制器品牌/型号', value: `${plc.controller_brand || '汇川'} ${plc.controller_model} (订货编码 01440325)` },
              { label: '工业以太网 IP', value: `${plc.ip_address} (${plc.protocol || 'Modbus-TCP'})` },
              { label: 'DI 状态输入映射', value: `${diList.length} 点 (24VDC 现场屏蔽线 RVVP 2x0.75)` },
              { label: 'DO 控制输出映射', value: `${doList.length} 点 (柜内跳线 BVR 0.75 驱动中继)` },
              { label: '自控供电制式', value: '明纬 NDR-120-24 稳压直流电源 24V 5A (独立弱电接地)' },
            ],
          });
        }}
        onMouseMove={(e) => {
          onHover?.({
            x: e.clientX,
            y: e.clientY,
            title: `PLC 主控制器: ${plc.controller_brand ? `${plc.controller_brand} ` : ''}${plc.controller_model}`,
            badge: `${plc.ip_address}:${plc.port || 502}`,
            badgeVariant: 'success',
            details: [
              { label: '控制器品牌/型号', value: `${plc.controller_brand || '汇川'} ${plc.controller_model} (订货编码 01440325)` },
              { label: '工业以太网 IP', value: `${plc.ip_address} (${plc.protocol || 'Modbus-TCP'})` },
              { label: 'DI 状态输入映射', value: `${diList.length} 点 (24VDC 现场屏蔽线 RVVP 2x0.75)` },
              { label: 'DO 控制输出映射', value: `${doList.length} 点 (柜内跳线 BVR 0.75 驱动中继)` },
              { label: '自控供电制式', value: '明纬 NDR-120-24 稳压直流电源 24V 5A (独立弱电接地)' },
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
        
        {/* 控制器标头 (双行排版，彻底避免文字碰撞) */}
        <text x="24" y="24" fill="#a7f3d0" fontSize="14" fontWeight="black" className="font-cad">
          PLC 主控制器: {plc.controller_brand ? `${plc.controller_brand} ` : ''}{plc.controller_model}
        </text>
        <text x="24" y="42" fill="#6ee7b7" fontSize="11" fontWeight="bold" className="font-cad">
          以太网: <tspan fill="#ffffff">{plc.ip_address}</tspan> • 映射: <tspan fill="#f59e0b">{diList.length} DI</tspan> (状态输入) / <tspan fill="#10b981">{doList.length} DO</tspan> (中继输出)
        </text>
      </g>

      {/* =========================================================================
          2. DI 数字量输入点位群 (左侧通道 ➔ 现场传感器/开关信号)
         ========================================================================= */}
      <g transform="translate(24, 75)">
        <text x="0" y="0" fill="#38bdf8" fontSize="13" fontWeight="black" className="font-cad">
          数字量输入通道 (24VDC 光耦隔离)
        </text>

        {diList.map((di, idx) => {
          const rowY = 16 + idx * 64;
          const targetDevice = di.description || di.signal_name;
          const signalCode = di.signal_name;
          const wireCode = di.wire_id;
          const isNC = di.contact_type === 'NC';

          return (
            <g key={di.point_id} transform={`translate(0, ${rowY})`}>
              {/* 左翼现场传感器实体盒 */}
              <g
                transform="translate(-270, 0)"
                className="cursor-pointer"
                onMouseEnter={(e) => {
                  onHover?.({
                    x: e.clientX,
                    y: e.clientY,
                    title: `现场传感器: ${targetDevice}`,
                    badge: isNC ? '常闭干接点 (NC 安全防断线)' : '常开干接点 (NO)',
                    badgeVariant: 'warning',
                    details: [
                      { label: '现场传感器', value: targetDevice },
                      { label: '接入 PLC 通道', value: di.point_id },
                      { label: '施工线材规格', value: 'RVVP 2x0.75mm² (屏蔽双绞软电缆)' },
                      { label: '触点类型', value: isNC ? 'NC (断线即报警)' : 'NO (闭合即触发)' },
                      { label: '端子分配', value: `接入自控端子排 XT2-${idx + 1}` },
                    ],
                  });
                }}
                onMouseMove={(e) => {
                  onHover?.({
                    x: e.clientX,
                    y: e.clientY,
                    title: `现场传感器: ${targetDevice}`,
                    badge: isNC ? '常闭干接点 (NC 安全防断线)' : '常开干接点 (NO)',
                    badgeVariant: 'warning',
                    details: [
                      { label: '现场传感器', value: targetDevice },
                      { label: '接入 PLC 通道', value: di.point_id },
                      { label: '施工线材规格', value: 'RVVP 2x0.75mm² (屏蔽双绞软电缆)' },
                      { label: '触点类型', value: isNC ? 'NC (断线即报警)' : 'NO (闭合即触发)' },
                      { label: '端子分配', value: `接入自控端子排 XT2-${idx + 1}` },
                    ],
                  });
                }}
                onMouseLeave={() => onHover?.(null)}
              >
                <rect width="210" height="48" rx="8" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" className="hover:stroke-sky-300 hover:fill-slate-900 transition" />
                <circle cx="16" cy="24" r="5" fill={isNC ? '#f43f5e' : '#22c55e'} />
                <text x="30" y="22" fill="#38bdf8" fontSize="12" fontWeight="bold" className="font-cad">
                  {truncateText(targetDevice, 11)}
                </text>
                <text x="30" y="38" fill="#94a3b8" fontSize="10" className="font-cad">
                  触点: <tspan fill="#f59e0b" fontWeight="bold">{di.contact_type || 'NO'}</tspan> • {wireCode}
                </text>
              </g>

              {/* 外部连线 (标注标准施工线材规格: RVVP 2x0.75mm²) */}
              <g>
                <line x1="-60" y1="24" x2="0" y2="24" stroke="#0284c7" strokeWidth="2" strokeDasharray="3 2" />
                <polygon points="-2,24 -8,20 -8,28" fill="#0284c7" />
                <text x="-30" y="17" fill="#38bdf8" fontSize="8.5" fontWeight="bold" textAnchor="middle" className="font-cad">
                  RVVP 2x0.75
                </text>
              </g>

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
                      { label: '输入线材', value: 'RVVP 2x0.75mm² 屏蔽双绞线' },
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
                      { label: '输入线材', value: 'RVVP 2x0.75mm² 屏蔽双绞线' },
                      { label: '信号工程代码', value: signalCode },
                      { label: '施工套管线号', value: wireCode },
                      { label: '电气特性', value: '24VDC 光电隔离输入 (防强电误入)' },
                    ],
                  });
                }}
                onMouseLeave={() => onHover?.(null)}
              >
                <rect width="320" height="48" rx="8" fill="#111c35" stroke="#1e293b" className="hover:stroke-sky-400 hover:fill-slate-900 transition" />
                <rect width="48" height="48" rx="8" fill="#0284c7" />
                <text x="24" y="30" fill="#ffffff" fontSize="13" fontWeight="black" textAnchor="middle" className="font-cad">
                  {di.point_id}
                </text>

                {/* 中文主标题：接入什么传感器/开关 */}
                <text x="58" y="22" fill="#f8fafc" fontSize="12.5" fontWeight="bold" className="font-cad">
                  {truncateText(targetDevice, 13)}
                </text>

                {/* 副标题：信号代码 + 线号印字 */}
                <text x="58" y="40" fill="#94a3b8" fontSize="10.5" className="font-cad">
                  <tspan fill="#38bdf8">{signalCode}</tspan> • 线号: <tspan fill="#fbbf24" fontWeight="bold">{wireCode}</tspan>
                </text>
              </g>
            </g>
          );
        })}
      </g>

      {/* =========================================================================
          3. DO 数字量输出点位群 (右侧通道 ➔ 驱动中间继电器 KA ➔ 交流接触器 KM)
         ========================================================================= */}
      <g transform="translate(380, 75)">
        <text x="0" y="0" fill="#a7f3d0" fontSize="13" fontWeight="black" className="font-cad">
          数字量输出通道 (PLC 24VDC 驱动)
        </text>

        {doList.map((doPt, idx) => {
          const rowY = 16 + idx * 64;
          const targetActuator = doPt.description || doPt.signal_name;
          const signalCode = doPt.signal_name;
          const wireCode = doPt.wire_id;
          const kaName = `KA${idx + 1}`;
          const kmName = `KM${idx + 1}`;

          return (
            <g key={doPt.point_id} transform={`translate(0, ${rowY})`}>
              {/* 1. PLC 内部输出端子卡片 */}
              <g
                className="cursor-pointer"
                onMouseEnter={(e) => {
                  onHover?.({
                    x: e.clientX,
                    y: e.clientY,
                    title: `PLC 输出通道 ${doPt.point_id} ➔ ${targetActuator}`,
                    badge: '24VDC 晶体管输出',
                    badgeVariant: 'success',
                    details: [
                      { label: '受控设备', value: targetActuator },
                      { label: 'PLC 通道端子', value: doPt.point_id },
                      { label: '柜内跳线线材', value: 'BVR 0.75mm² (铜芯软线)' },
                      { label: '控制工程代码', value: signalCode },
                      { label: '线圈套管线号', value: wireCode },
                      { label: '驱动目标', value: `中间继电器 ${kaName} 线圈 A1(+)` },
                    ],
                  });
                }}
                onMouseMove={(e) => {
                  onHover?.({
                    x: e.clientX,
                    y: e.clientY,
                    title: `PLC 输出通道 ${doPt.point_id} ➔ ${targetActuator}`,
                    badge: '24VDC 晶体管输出',
                    badgeVariant: 'success',
                    details: [
                      { label: '受控设备', value: targetActuator },
                      { label: 'PLC 通道端子', value: doPt.point_id },
                      { label: '柜内跳线线材', value: 'BVR 0.75mm² (铜芯软线)' },
                      { label: '控制工程代码', value: signalCode },
                      { label: '线圈套管线号', value: wireCode },
                      { label: '驱动目标', value: `中间继电器 ${kaName} 线圈 A1(+)` },
                    ],
                  });
                }}
                onMouseLeave={() => onHover?.(null)}
              >
                <rect width="320" height="48" rx="8" fill="#0f291e" stroke="#1e293b" className="hover:stroke-emerald-400 hover:fill-slate-900 transition" />
                <rect width="48" height="48" rx="8" fill="#059669" />
                <text x="24" y="30" fill="#ffffff" fontSize="13" fontWeight="black" textAnchor="middle" className="font-cad">
                  {doPt.point_id}
                </text>

                {/* 显性中文主标题：受控电机/电磁阀 */}
                <text x="58" y="22" fill="#f8fafc" fontSize="12.5" fontWeight="bold" className="font-cad">
                  {truncateText(targetActuator, 13)}
                </text>

                {/* 副标题：控制代码 + 线号印字 */}
                <text x="58" y="40" fill="#94a3b8" fontSize="10.5" className="font-cad">
                  <tspan fill="#6ee7b7">{signalCode}</tspan> • 线号: <tspan fill="#fbbf24" fontWeight="bold">{wireCode}</tspan>
                </text>
              </g>

              {/* 连线 1: PLC DO 输出 ➔ 继电器线圈 A1 (标注线材 BVR 0.75mm²) */}
              <g>
                <line x1="320" y1="24" x2="380" y2="24" stroke="#059669" strokeWidth="2" strokeDasharray="3 2" />
                <polygon points="378,24 372,20 372,28" fill="#059669" />
                <text x="350" y="17" fill="#6ee7b7" fontSize="8.5" fontWeight="bold" textAnchor="middle" className="font-cad">
                  BVR 0.75
                </text>
              </g>

              {/* =========================================================================
                  2. 欧姆龙中间继电器 KA 模块 (带 A1/A2 线圈与 13/14 触点)
                 ========================================================================= */}
              <g
                transform="translate(380, -4)"
                className="cursor-pointer"
                onMouseEnter={(e) => {
                  onHover?.({
                    x: e.clientX,
                    y: e.clientY,
                    title: `中间继电器模组: 欧姆龙 MY2N-GS (${kaName})`,
                    badge: '24VDC 线圈 • 250VAC 5A 触点',
                    badgeVariant: 'warning',
                    details: [
                      { label: '所属继电器编号', value: `${kaName} (欧姆龙双触点继电器)` },
                      { label: '线圈端子与线材', value: `A1(+)/A2(0V) 使用 BVR 0.75mm² 软线` },
                      { label: '干触点输出端子', value: `13(L进火)/14(NO出火) 使用 BVR 1.0mm² 软线` },
                      { label: '安全物理隔离', value: '2000VAC 介电耐压，彻底杜绝 220V 串入 PLC' },
                      { label: '指示状态', value: '线圈得电绿色 LED 动作指示灯亮起' },
                    ],
                  });
                }}
                onMouseMove={(e) => {
                  onHover?.({
                    x: e.clientX,
                    y: e.clientY,
                    title: `中间继电器模组: 欧姆龙 MY2N-GS (${kaName})`,
                    badge: '24VDC 线圈 • 250VAC 5A 触点',
                    badgeVariant: 'warning',
                    details: [
                      { label: '所属继电器编号', value: `${kaName} (欧姆龙双触点继电器)` },
                      { label: '线圈端子与线材', value: `A1(+)/A2(0V) 使用 BVR 0.75mm² 软线` },
                      { label: '干触点输出端子', value: `13(L进火)/14(NO出火) 使用 BVR 1.0mm² 软线` },
                      { label: '安全物理隔离', value: '2000VAC 介电耐压，彻底杜绝 220V 串入 PLC' },
                      { label: '指示状态', value: '线圈得电绿色 LED 动作指示灯亮起' },
                    ],
                  });
                }}
                onMouseLeave={() => onHover?.(null)}
              >
                {/* 继电器外壳 */}
                <rect width="250" height="56" rx="8" fill="#13172e" stroke="#818cf8" strokeWidth="1.5" className="hover:stroke-indigo-300 hover:fill-indigo-950 transition" />
                
                {/* 继电器顶部标头 */}
                <rect width="250" height="18" rx="8" fill="#1e1b4b" />
                <text x="12" y="13" fill="#c7d2fe" fontSize="10.5" fontWeight="bold" className="font-cad">
                  中继模组: {kaName} (欧姆龙 MY2N 24VDC)
                </text>

                {/* 左侧线圈端子 (A1/A2) */}
                <g transform="translate(12, 26)">
                  <rect width="48" height="22" rx="4" fill="#1e293b" stroke="#059669" strokeWidth="1" />
                  <text x="24" y="15" fill="#a7f3d0" fontSize="10" fontWeight="black" textAnchor="middle" className="font-cad">
                    A1(+)
                  </text>
                  <text x="54" y="15" fill="#64748b" fontSize="9" className="font-cad">
                    A2:0V
                  </text>
                </g>

                {/* 中间线圈电磁吸合图标 */}
                <g transform="translate(108, 28)">
                  <rect width="32" height="18" rx="3" fill="#312e81" stroke="#818cf8" strokeWidth="1" />
                  <line x1="16" y1="2" x2="16" y2="16" stroke="#c7d2fe" strokeWidth="2" />
                  <circle cx="16" cy="9" r="3" fill="#22c55e" className="animate-pulse" />
                </g>

                {/* 右侧触点端子 (13 COM / 14 NO) */}
                <g transform="translate(158, 26)">
                  <rect width="80" height="22" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
                  <text x="40" y="15" fill="#fcd34d" fontSize="9.5" fontWeight="bold" textAnchor="middle" className="font-cad">
                    13(L) ➔ 14(NO)
                  </text>
                </g>
              </g>

              {/* 连线 2: 继电器 14 NO 触点 ➔ 接触器 KM 线圈 (标注线材 BVR 1.0mm²) */}
              <g>
                <line x1="630" y1="24" x2="690" y2="24" stroke="#f59e0b" strokeWidth="2" />
                <polygon points="688,24 682,20 682,28" fill="#f59e0b" />
                <text x="660" y="17" fill="#fcd34d" fontSize="8.5" fontWeight="bold" textAnchor="middle" className="font-cad">
                  BVR 1.0
                </text>
              </g>

              {/* =========================================================================
                  3. 强电执行侧：交流接触器 KM (NXC-09) / 220V 电磁阀
                 ========================================================================= */}
              <g
                transform="translate(690, -4)"
                className="cursor-pointer"
                onMouseEnter={(e) => {
                  onHover?.({
                    x: e.clientX,
                    y: e.clientY,
                    title: `强电驱动受控执行器: ${targetActuator}`,
                    badge: `${kmName} 交流接触器 / 执行器`,
                    badgeVariant: 'warning',
                    details: [
                      { label: '执行设备全称', value: targetActuator },
                      { label: '接触器编号', value: `${kmName} (正泰 NXC-09 3P)` },
                      { label: '线圈控制线材', value: 'BVR 1.0mm² (220VAC 控制火线)' },
                      { label: '线圈受控端子', value: `A1 接入中继 ${kaName}:14，A2 接入零线 N` },
                      { label: '主触点控制回路', value: '380V/220V 动力电源通断' },
                    ],
                  });
                }}
                onMouseMove={(e) => {
                  onHover?.({
                    x: e.clientX,
                    y: e.clientY,
                    title: `强电驱动受控执行器: ${targetActuator}`,
                    badge: `${kmName} 交流接触器 / 执行器`,
                    badgeVariant: 'warning',
                    details: [
                      { label: '执行设备全称', value: targetActuator },
                      { label: '接触器编号', value: `${kmName} (正泰 NXC-09 3P)` },
                      { label: '线圈控制线材', value: 'BVR 1.0mm² (220VAC 控制火线)' },
                      { label: '线圈受控端子', value: `A1 接入中继 ${kaName}:14，A2 接入零线 N` },
                      { label: '主触点控制回路', value: '380V/220V 动力电源通断' },
                    ],
                  });
                }}
                onMouseLeave={() => onHover?.(null)}
              >
                <rect width="210" height="56" rx="8" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" className="hover:stroke-emerald-300 hover:fill-slate-900 transition" />
                <rect width="210" height="18" rx="8" fill="#064e3b" />
                <text x="12" y="13" fill="#a7f3d0" fontSize="10.5" fontWeight="bold" className="font-cad">
                  执行器: {kmName} (220V 接触器)
                </text>

                <text x="12" y="34" fill="#f8fafc" fontSize="12" fontWeight="bold" className="font-cad">
                  {truncateText(targetActuator, 13)}
                </text>
                <text x="12" y="49" fill="#94a3b8" fontSize="10" className="font-cad">
                  线圈: <tspan fill="#f59e0b" fontWeight="bold">A1/A2</tspan> • 主触头 ➔ 电机/阀
                </text>
              </g>
            </g>
          );
        })}
      </g>
    </g>
  );
};
