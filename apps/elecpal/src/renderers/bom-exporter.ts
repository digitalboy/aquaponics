/**
 * =========================================================================
 * ElecPal (电气伴侣) · 盘柜成套厂采购 BOM 清单与线号表生成器
 * 自动汇总强电动力、弱电直流、PLC 控制、现场总线与工控网络全要素物料
 * =========================================================================
 */
import { PlantWideTopology } from '@aquaponics/schema';

export interface BOMItem {
  index: number;
  category: string;
  name: string;
  spec_model: string;
  quantity: string | number; // 设备固定数量 (如 1/2)，线材为 "根据实际情况"
  unit: string;
  location: string;
  remarks?: string;
}

export class BOMExporter {
  public static generateBOM(topology: PlantWideTopology): BOMItem[] {
    const items: BOMItem[] = [];
    let idx = 1;

    // 1. 强电系统 - 一级主断路器与总柜
    const main = topology.power_distribution?.main_incomer;
    if (main) {
      items.push({
        index: idx++,
        category: '动力配电箱体',
        name: '一级动力总配电柜',
        spec_model: `AP-MAIN 标准成套动力配电柜 (380V/220V 50Hz)`,
        quantity: 1,
        unit: '面',
        location: main.panel_id,
        remarks: '变压器下口主配电',
      });

      items.push({
        index: idx++,
        category: '塑壳断路器 (MCCB)',
        name: '一级动力总闸断路器',
        spec_model: `${main.main_breaker.brand || ''} ${main.main_breaker.model} ${main.main_breaker.rated_current_a}A ${main.main_breaker.poles} (${main.main_breaker.trip_curve}型)`,
        quantity: 1,
        unit: '台',
        location: main.panel_id,
        remarks: '整定电流与级差保护',
      });

      // 智能电表与互感器
      items.push({
        index: idx++,
        category: '电能计量仪表',
        name: '三相智能多功能电表',
        spec_model: `${main.metering.meter_model} (CT变比 ${main.metering.ct_ratio})`,
        quantity: 1,
        unit: '台',
        location: main.panel_id,
        remarks: '带 RS-485 远传抄表',
      });

      items.push({
        index: idx++,
        category: '电能计量仪表',
        name: '开口式电流互感器 (CT)',
        spec_model: `开口卡扣式 200/5A 0.5S级`,
        quantity: 3,
        unit: '只',
        location: main.panel_id,
        remarks: '卡装于主进线电缆',
      });

      // 一级浪涌保护器
      items.push({
        index: idx++,
        category: '防雷与过压保护',
        name: '一级电源电涌保护器 (SPD)',
        spec_model: `标称放电电流 ${main.spd_surge_protection.nominal_discharge_current_ka}kA (${main.spd_surge_protection.test_class || 'T1'})`,
        quantity: 1,
        unit: '台',
        location: main.panel_id,
        remarks: '防雷电感应与开关浪涌',
      });
    }

    // 2. 强电系统 - 二级分箱与动力回路微断
    const subPanels = topology.power_distribution?.sub_panels || [];
    subPanels.forEach((panel) => {
      items.push({
        index: idx++,
        category: '动力配电箱体',
        name: `${panel.name} 箱体`,
        spec_model: `防护等级 ${panel.ip_rating || 'IP65'} 喷塑配电箱`,
        quantity: 1,
        unit: '面',
        location: panel.panel_id,
        remarks: '壁挂式安装',
      });

      items.push({
        index: idx++,
        category: '进线主缆',
        name: `${panel.name} 进线动力主缆`,
        spec_model: `${panel.feeder_cable?.cable_type || 'WDZ-YJY'} ${panel.feeder_cable?.spec || '5x16mm²'} (设计长约 ${panel.feeder_cable?.length_m || 20}m)`,
        quantity: '根据实际情况',
        unit: '米',
        location: `AP-MAIN ➔ ${panel.panel_id}`,
        remarks: '以现场桥架实际敷设长度截料',
      });

      items.push({
        index: idx++,
        category: '微型断路器 (MCB)',
        name: `${panel.name} 进线总开关`,
        spec_model: `${panel.incoming_switch.brand || ''} ${panel.incoming_switch.model} ${panel.incoming_switch.rated_current_a}A ${panel.incoming_switch.poles} (${panel.incoming_switch.trip_curve}型)`,
        quantity: 1,
        unit: '台',
        location: panel.panel_id,
      });

      panel.circuits.forEach((c) => {
        items.push({
          index: idx++,
          category: '微型断路器 (MCB)',
          name: `${c.name} 分支断路器`,
          spec_model: `${c.breaker.brand || ''} ${c.breaker.model} ${c.breaker.rated_current_a}A ${c.breaker.poles} (${c.breaker.trip_curve}型)`,
          quantity: 1,
          unit: '台',
          location: panel.panel_id,
        });

        // 动力电缆汇总 (线材数量根据实际情况)
        items.push({
          index: idx++,
          category: '电力线缆',
          name: `${c.name} 动力馈电电缆`,
          spec_model: `${c.cable.cable_type || 'WDZ-YJY'} ${c.cable.spec} (图纸设计长约 ${c.cable.length_m}m)`,
          quantity: '根据实际情况',
          unit: '米',
          location: `${panel.panel_id} ➔ ${c.load.name}`,
          remarks: '以现场桥架实际敷设长度截料',
        });

        // 若带变频器
        if (c.load.is_vfd_driven && c.load.vfd_config) {
          items.push({
            index: idx++,
            category: '变频驱动器 (VFD)',
            name: `${c.load.name} 变频驱动器`,
            spec_model: `${c.load.vfd_config.vfd_brand || c.load.vfd_config.brand || ''} ${c.load.vfd_config.vfd_model || c.load.vfd_config.model || ''} ${c.load.vfd_config.rated_power_kw}kW`,
            quantity: 1,
            unit: '台',
            location: panel.panel_id,
            remarks: 'RS-485 通信调速',
          });
        } else if (['pump_motor', 'blower_motor', 'screen_filter', 'actuator_motor', 'dosing_pump'].includes(c.load.type)) {
          // 工频直起电机回路，必须配交流接触器 KM + 热过载继电器 FR
          items.push({
            index: idx++,
            category: '交流接触器 (KM)',
            name: `${c.load.name} 交流接触器`,
            spec_model: `正泰 NXC-09 3P 380V (线圈 24VDC / 触点 9A)`,
            quantity: 1,
            unit: '台',
            location: panel.panel_id,
            remarks: '由 PLC 中继驱动启停',
          });

          items.push({
            index: idx++,
            category: '热过载继电器 (FR)',
            name: `${c.load.name} 热过载继电器`,
            spec_model: `正泰 NXR-12 (整定 ${(c.load.rated_current_a * 1.05).toFixed(1)}A / Class 10A)`,
            quantity: 1,
            unit: '台',
            location: panel.panel_id,
            remarks: '电机堵转与缺相热保护',
          });
        }
      });
    });

    // 3. 弱电直流与保命系统
    if (topology.dc_and_ups_system) {
      if (topology.dc_and_ups_system.ups_unit) {
        const ups = topology.dc_and_ups_system.ups_unit;
        items.push({
          index: idx++,
          category: '不间断电源 (UPS)',
          name: '在线式工控 UPS 主机',
          spec_model: `${ups.brand || ''} ${ups.model} ${ups.capacity_kva}kVA (${ups.battery_spec || ''} 续航≥${ups.backup_hours_at_full_load}h)`,
          quantity: 1,
          unit: '套',
          location: 'AP-CTRL',
          remarks: '断电保护核心控制器与工控机',
        });
      }
      if (topology.dc_and_ups_system.dc_power_supply) {
        const ps = topology.dc_and_ups_system.dc_power_supply;
        items.push({
          index: idx++,
          category: '直流稳压电源',
          name: '集中供电开关电源',
          spec_model: `${ps.brand || ''} ${ps.model} (DC ${ps.output_voltage_v}V / ${ps.output_current_a}A 120W)`,
          quantity: 1,
          unit: '台',
          location: 'AP-CTRL',
          remarks: '导轨安装',
        });
      }
    }

    // 4. PLC 控制系统与中继
    if (topology.plc_controller) {
      const plc = topology.plc_controller;
      items.push({
        index: idx++,
        category: '工业 PLC 控制器',
        name: 'PLC 中央逻辑控制器',
        spec_model: `${plc.controller_brand || '汇川'} ${plc.controller_model} (Modbus-TCP / IP: ${plc.ip_address})`,
        quantity: 1,
        unit: '台',
        location: 'PLC-CABINET',
        remarks: '8DI / 8DO 晶体管漏型 (NPN) • 订货编码 01440325',
      });

      // 欧姆龙微型中继组
      items.push({
        index: idx++,
        category: '微型继电器',
        name: '中间继电器隔离模组',
        spec_model: '欧姆龙 MY2N-GS 24VDC + PYFZ-08-E 导轨底座',
        quantity: plc.digital_outputs.length || 4,
        unit: '套',
        location: 'PLC-CABINET',
        remarks: '带指示灯与固定卡扣',
      });
    }

    // 5. RS-485 现场总线从站与线缆
    if (topology.rs485_fieldbus) {
      // 通信屏蔽双绞线 (线材数量根据实际情况)
      items.push({
        index: idx++,
        category: '通信线缆',
        name: 'RS-485 传感器屏蔽双绞总线',
        spec_model: 'RVSP 2x0.5mm² (纯铜镀锡屏蔽双绞线)',
        quantity: '根据实际情况',
        unit: '米',
        location: '全厂弱电下层桥架',
        remarks: '手拉手菊花链敷设',
      });

      topology.rs485_fieldbus.slaves.forEach((s) => {
        items.push({
          index: idx++,
          category: '现场传感器/仪表',
          name: s.device_name || s.name || 'RS485 从站设备',
          spec_model: `${s.manufacturer_and_model || s.model || ''} (站号: ${s.slave_address_hex || s.addr}, 波特率: ${s.baud_rate || 9600}bps)`,
          quantity: 1,
          unit: '支',
          location: 'RS-485 菊花链总线',
          remarks: `采样周期 ${s.polling_interval_ms || 1000}ms`,
        });
      });
    }

    // 6. 边缘网络与安防监控
    if (topology.edge_and_network) {
      const net = topology.edge_and_network;
      if (net.edge_ipc) {
        items.push({
          index: idx++,
          category: '边缘计算工控机',
          name: '无风扇嵌入式工控机',
          spec_model: `${net.edge_ipc.brand_and_model || net.edge_ipc.model || ''} (IP: ${net.edge_ipc.ip_address})`,
          quantity: 1,
          unit: '台',
          location: '中控操作工位',
          remarks: '运行 AI 投饵与数据中台',
        });
      }
      if (net.poe_switch) {
        items.push({
          index: idx++,
          category: '工业交换机',
          name: '工业级 PoE 网络交换机',
          spec_model: `${net.poe_switch.model} (供电预算: ${net.poe_switch.total_power_budget_w}W)`,
          quantity: 1,
          unit: '台',
          location: '网络中枢柜',
        });
      }
      if (net.nvr_recorder) {
        items.push({
          index: idx++,
          category: '网络录像机 (NVR)',
          name: '高清网络视频录像机',
          spec_model: `${net.nvr_recorder.model} (存储容量: ${net.nvr_recorder.storage_capacity_tb}TB)`,
          quantity: 1,
          unit: '台',
          location: '监控机柜',
        });
      }
      // 监控网线 (线材数量根据实际情况)
      items.push({
        index: idx++,
        category: '网络线缆',
        name: 'PoE 监控屏蔽双绞网线',
        spec_model: 'Cat5e STP 超五类全阻燃带屏蔽网线',
        quantity: '根据实际情况',
        unit: '米',
        location: '交换机 ➔ 各枪机点位',
        remarks: '按点位实际距离敷设',
      });

      net.ip_cameras.forEach((cam) => {
        items.push({
          index: idx++,
          category: '工业高清网络摄像机',
          name: cam.location_and_target,
          spec_model: `PoE 供电超清工业枪机 (IP: ${cam.ip_address})`,
          quantity: 1,
          unit: '台',
          location: cam.camera_id,
        });
      });
    }

    return items;
  }

  public static exportBOMToCSV(topology: PlantWideTopology): string {
    const bom = this.generateBOM(topology);
    let csv = '\uFEFF序号,类别,设备名称,型号规格,采购数量,计量单位,安装位置,备注说明\n';
    bom.forEach((b) => {
      const qVal = typeof b.quantity === 'number' ? b.quantity : `"${b.quantity}"`;
      csv += `${b.index},"${b.category}","${b.name}","${b.spec_model.replace(/"/g, '""')}",${qVal},"${b.unit}","${b.location}","${b.remarks || ''}"\n`;
    });
    return csv;
  }
}
