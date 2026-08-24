import React from 'react';
import { PlantWideTopology } from '@aquaponics/schema';
import { CadHoverInfo, truncateText } from '../types';

interface Sheet3RS485Props {
  topology: PlantWideTopology;
  onHover?: (info: CadHoverInfo | null) => void;
}

export const Sheet3RS485: React.FC<Sheet3RS485Props> = ({ topology, onHover }) => {
  const bus = topology.rs485_fieldbus;
  if (!bus) {
    return (
      <text x="400" y="200" fill="#94a3b8" fontSize="18" className="font-cad">
        未配置 RS-485 现场总线网络拓扑
      </text>
    );
  }

  const slaves = bus.slaves || [];
  const SLAVE_BOX_WIDTH = 190;
  const SLAVE_GAP = 70;
  const START_X = 300;

  // 动态计算总线末端与终端电阻坐标
  const busStartX = 180;
  const busEndX = START_X + slaves.length * (SLAVE_BOX_WIDTH + SLAVE_GAP) + 60;

  return (
    <g transform="translate(60, 80)">
      {/* 1. RS-485 主站网关卡片 */}
      <g
        transform="translate(0, 95)"
        className="cursor-pointer"
        onMouseEnter={(e) => {
          onHover?.({
            x: e.clientX,
            y: e.clientY,
            title: 'RS-485 工业主站网关 (COM1)',
            badge: 'Modbus-RTU 主站',
            badgeVariant: 'warning',
            details: [
              { label: '通信参数', value: '9600 bps • 8-N-1' },
              { label: '总线介质', value: 'RVSP 2x0.5mm² 屏蔽双绞线' },
              { label: '轮询周期', value: '100 ms' },
              { label: '终端电阻', value: '120Ω 高频抗反射已激活' },
            ],
          });
        }}
        onMouseMove={(e) => {
          onHover?.({
            x: e.clientX,
            y: e.clientY,
            title: 'RS-485 工业主站网关 (COM1)',
            badge: 'Modbus-RTU 主站',
            badgeVariant: 'warning',
            details: [
              { label: '通信参数', value: '9600 bps • 8-N-1' },
              { label: '总线介质', value: 'RVSP 2x0.5mm² 屏蔽双绞线' },
              { label: '轮询周期', value: '100 ms' },
              { label: '终端电阻', value: '120Ω 高频抗反射已激活' },
            ],
          });
        }}
        onMouseLeave={() => onHover?.(null)}
      >
        <rect width="190" height="95" rx="10" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2.5" className="shadow-lg hover:stroke-indigo-400 transition" />
        <rect width="190" height="28" rx="10" fill="#312e81" />
        <text x="95" y="19" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle" className="font-cad">
          RS-485 主站网关 (COM1)
        </text>
        <text x="95" y="52" fill="#c7d2fe" fontSize="10.5" textAnchor="middle" className="font-cad font-bold">
          9600-8-N-1 • Modbus-RTU
        </text>
        <text x="95" y="74" fill="#a5b4fc" fontSize="10" textAnchor="middle" className="font-cad">
          轮询周期: 100ms
        </text>
      </g>

      {/* 2. 菊花链总线主干 (随从站数量自动动态延展) */}
      <line x1={busStartX} y1="142" x2={busEndX} y2="142" stroke="#818cf8" strokeWidth="3.5" />
      <text x={busStartX + 30} y="128" fill="#818cf8" fontSize="12" fontWeight="bold" className="font-cad">
        RVSP 2x0.5mm² 屏蔽双绞差分菊花链总线主干 (A+/B-)
      </text>

      {/* 3. 各 Modbus-RTU 智能从站节点 (缺省紧凑排版 + Hover 呈现全文字) */}
      {slaves.map((slave: any, idx: number) => {
        const sX = START_X + idx * (SLAVE_BOX_WIDTH + SLAVE_GAP);
        const tapX = sX + SLAVE_BOX_WIDTH / 2;
        const deviceFullName = slave.device_name || slave.name || '智能传感器';
        const displayShortName = truncateText(deviceFullName, 9);

        return (
          <g key={idx}>
            {/* T接引下虚线与总线节点圆点 */}
            <line x1={tapX} y1="142" x2={tapX} y2="220" stroke="#818cf8" strokeWidth="2" strokeDasharray="3" />
            <circle cx={tapX} cy="142" r="4.5" fill="#818cf8" />

            {/* 从站设备卡片 (支持 hover 交互) */}
            <g
              transform={`translate(${sX}, 220)`}
              className="cursor-pointer"
              onMouseEnter={(e) => {
                onHover?.({
                  x: e.clientX,
                  y: e.clientY,
                  title: deviceFullName,
                  badge: `从站 ${slave.slave_address_hex || slave.addr}`,
                  badgeVariant: 'success',
                  details: [
                    { label: '设备全称', value: deviceFullName },
                    { label: '从站地址', value: String(slave.slave_address_hex || slave.addr) },
                    { label: '采集周期', value: `${slave.polling_interval_ms || slave.poll_ms || 100} ms` },
                    { label: '通信协议', value: 'Modbus-RTU (03/04 Function)' },
                    { label: '总线介质', value: 'RVSP 2x0.5mm² 屏蔽双绞线' },
                  ],
                });
              }}
              onMouseMove={(e) => {
                onHover?.({
                  x: e.clientX,
                  y: e.clientY,
                  title: deviceFullName,
                  badge: `从站 ${slave.slave_address_hex || slave.addr}`,
                  badgeVariant: 'success',
                  details: [
                    { label: '设备全称', value: deviceFullName },
                    { label: '从站地址', value: String(slave.slave_address_hex || slave.addr) },
                    { label: '采集周期', value: `${slave.polling_interval_ms || slave.poll_ms || 100} ms` },
                    { label: '通信协议', value: 'Modbus-RTU (03/04 Function)' },
                    { label: '总线介质', value: 'RVSP 2x0.5mm² 屏蔽双绞线' },
                  ],
                });
              }}
              onMouseLeave={() => onHover?.(null)}
            >
              <rect
                width={SLAVE_BOX_WIDTH}
                height="100"
                rx="10"
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth="2"
                className="shadow-md hover:stroke-amber-400 hover:fill-slate-900 transition"
              />
              <rect width={SLAVE_BOX_WIDTH} height="28" rx="10" fill="#0369a1" />
              
              <text x={SLAVE_BOX_WIDTH / 2} y="19" fill="#ffffff" fontSize="12" fontWeight="black" textAnchor="middle" className="font-cad">
                从站地址: {slave.slave_address_hex || slave.addr}
              </text>
              
              {/* 缺省截断显示，绝不溢出边框 */}
              <text x={SLAVE_BOX_WIDTH / 2} y="55" fill="#f8fafc" fontSize="12.5" fontWeight="bold" textAnchor="middle" className="font-cad">
                {displayShortName}
              </text>
              
              <text x={SLAVE_BOX_WIDTH / 2} y="80" fill="#94a3b8" fontSize="11.5" textAnchor="middle" className="font-cad">
                周期: {slave.polling_interval_ms || slave.poll_ms}ms
              </text>

              {/* 原生浏览器辅助 title */}
              <title>{deviceFullName}</title>
            </g>
          </g>
        );
      })}

      {/* 4. 120Ω 终端吸收电阻 */}
      {bus.has_120_ohm_terminator_at_end && (
        <g
          transform={`translate(${busEndX}, 117)`}
          className="cursor-pointer"
          onMouseEnter={(e) => {
            onHover?.({
              x: e.clientX,
              y: e.clientY,
              title: '120Ω 终端吸收匹配电阻',
              badge: '高频抗反射保护',
              badgeVariant: 'success',
              details: [
                { label: '阻值标准', value: '120 Ω • 1/4W' },
                { label: '物理位置', value: 'RS-485 菊花链总线物理最末端' },
                { label: '工程作用', value: '消除高速长距离差分反射波与误码' },
              ],
            });
          }}
          onMouseMove={(e) => {
            onHover?.({
              x: e.clientX,
              y: e.clientY,
              title: '120Ω 终端吸收匹配电阻',
              badge: '高频抗反射保护',
              badgeVariant: 'success',
              details: [
                { label: '阻值标准', value: '120 Ω • 1/4W' },
                { label: '物理位置', value: 'RS-485 菊花链总线物理最末端' },
                { label: '工程作用', value: '消除高速长距离差分反射波与误码' },
              ],
            });
          }}
          onMouseLeave={() => onHover?.(null)}
        >
          <rect width="130" height="50" rx="8" fill="#065f46" stroke="#34d399" strokeWidth="2" className="hover:stroke-emerald-300 transition" />
          <text x="65" y="24" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-cad">
            120Ω 终端电阻
          </text>
          <text x="65" y="40" fill="#a7f3d0" fontSize="9.5" textAnchor="middle" className="font-cad">
            高频抗反射已激活
          </text>
          <title>120Ω 终端吸收匹配电阻 (消除高频反射波)</title>
        </g>
      )}
    </g>
  );
};
