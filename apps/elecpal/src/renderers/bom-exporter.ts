/**
 * =========================================================================
 * ElecPal (电气伴侣) · 盘柜成套厂采购 BOM 清单与线号表生成器
 * 自动汇总强电动力、弱电直流、PLC 控制、现场总线与工控网络全要素物料
 * =========================================================================
 */
import { PlantWideTopology } from '../core/schema';

export interface BOMItem {
  index: number;
  category: string;
  name: string;
  spec_model: string;
  quantity: number;
  unit: string;
  location: string;
}

export class BOMExporter {
  public static generateBOM(topology: PlantWideTopology): BOMItem[] {
    const items: BOMItem[] = [];
    let idx = 1;

    // 1. 强电系统 - 一级主断路器
    const main = topology.power_distribution?.main_incomer;
    if (main) {
      items.push({
        index: idx++,
        category: '塑壳断路器 (MCCB)',
        name: '一级动力总闸',
        spec_model: `${main.main_breaker.brand || ''} ${main.main_breaker.model} ${main.main_breaker.rated_current_a}A ${main.main_breaker.poles} (${main.main_breaker.trip_curve}型) $I_{cu}=${main.main_breaker.breaking_capacity_ka || 36}kA`,
        quantity: 1,
        unit: '台',
        location: main.panel_id
      });

      // 智能电表与互感器
      items.push({
        index: idx++,
        category: '电能计量仪表',
        name: '三相智能电表',
        spec_model: `${main.metering.meter_model} (CT变比 ${main.metering.ct_ratio})`,
        quantity: 1,
        unit: '台',
        location: main.panel_id
      });

      // 一级浪涌保护器
      items.push({
        index: idx++,
        category: '防雷与过压保护',
        name: '一级电涌保护器 (SPD)',
        spec_model: `标称放电电流 ${main.spd_surge_protection.nominal_discharge_current_ka}kA (${main.spd_surge_protection.test_class || 'T1'})`,
        quantity: 1,
        unit: '台',
        location: main.panel_id
      });
    }

    // 2. 强电系统 - 二级分箱与动力回路微断
    const subPanels = topology.power_distribution?.sub_panels || [];
    subPanels.forEach(panel => {
      items.push({
        index: idx++,
        category: '动力配电箱体',
        name: `${panel.name} 箱体`,
        spec_model: `防护等级 ${panel.ip_rating || 'IP65'} (进线电缆 ${panel.feeder_cable.spec})`,
        quantity: 1,
        unit: '面',
        location: panel.panel_id
      });

      items.push({
        index: idx++,
        category: '微型断路器 (MCB)',
        name: `${panel.name} 进线总开关`,
        spec_model: `${panel.incoming_switch.brand || ''} ${panel.incoming_switch.model} ${panel.incoming_switch.rated_current_a}A ${panel.incoming_switch.poles} (${panel.incoming_switch.trip_curve}型)`,
        quantity: 1,
        unit: '台',
        location: panel.panel_id
      });

      panel.circuits.forEach(c => {
        items.push({
          index: idx++,
          category: '微型断路器 (MCB)',
          name: `${c.name} 分支开关`,
          spec_model: `${c.breaker.brand || ''} ${c.breaker.model} ${c.breaker.rated_current_a}A ${c.breaker.poles} (${c.breaker.trip_curve}型)`,
          quantity: 1,
          unit: '台',
          location: panel.panel_id
        });

        // 动力电缆汇总
        items.push({
          index: idx++,
          category: '电力线缆',
          name: `${c.name} 动力电缆`,
          spec_model: `${c.cable.cable_type} ${c.cable.spec} (长约 ${c.cable.length_m}m)`,
          quantity: c.cable.length_m,
          unit: '米',
          location: `${panel.panel_id} -> ${c.load.name}`
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
            location: panel.panel_id
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
          name: '在线式工控 UPS',
          spec_model: `${ups.brand || ''} ${ups.model} ${ups.capacity_kva}kVA (${ups.battery_spec || ''} 续航≥${ups.backup_hours_at_full_load}h)`,
          quantity: 1,
          unit: '套',
          location: 'AP-CTRL'
        });
      }
      if (topology.dc_and_ups_system.dc_power_supply) {
        const ps = topology.dc_and_ups_system.dc_power_supply;
        items.push({
          index: idx++,
          category: '直流稳压电源',
          name: '集中供电开关电源',
          spec_model: `${ps.brand || ''} ${ps.model} (DC ${ps.output_voltage_v}V / ${ps.output_current_a}A)`,
          quantity: 1,
          unit: '台',
          location: 'AP-CTRL'
        });
      }
    }

    // 4. PLC 控制系统
    if (topology.plc_controller) {
      const plc = topology.plc_controller;
      items.push({
        index: idx++,
        category: '工业 PLC 控制器',
        name: '中央逻辑控制器',
        spec_model: `${plc.controller_brand || ''} ${plc.controller_model} (Modbus-TCP / IP: ${plc.ip_address})`,
        quantity: 1,
        unit: '台',
        location: 'PLC-CABINET'
      });
    }

    // 5. RS-485 现场总线从站
    if (topology.rs485_fieldbus) {
      topology.rs485_fieldbus.slaves.forEach(s => {
        items.push({
          index: idx++,
          category: '现场传感器/仪表',
          name: s.device_name || s.name || 'RS485 从站设备',
          spec_model: `${s.manufacturer_and_model || s.model || ''} (站号: ${s.slave_address_hex || s.addr}, 波特率: ${s.baud_rate}bps)`,
          quantity: 1,
          unit: '台',
          location: 'RS-485 菊花链总线'
        });
      });
    }

    // 6. 边缘网络与安防
    if (topology.edge_and_network) {
      const net = topology.edge_and_network;
      if (net.edge_ipc) {
        items.push({
          index: idx++,
          category: '边缘计算工控机',
          name: '无风扇边缘工控机',
          spec_model: `${net.edge_ipc.brand_and_model || net.edge_ipc.model || ''} (IP: ${net.edge_ipc.ip_address})`,
          quantity: 1,
          unit: '台',
          location: '中控操作工位'
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
          location: '网络中枢柜'
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
          location: '监控机柜'
        });
      }
      net.ip_cameras.forEach(cam => {
        items.push({
          index: idx++,
          category: '工业高清网络摄像机',
          name: cam.location_and_target,
          spec_model: `PoE 供电超清工业枪机 (IP: ${cam.ip_address})`,
          quantity: 1,
          unit: '台',
          location: cam.camera_id
        });
      });
    }

    return items;
  }

  public static exportBOMToCSV(topology: PlantWideTopology): string {
    const bom = this.generateBOM(topology);
    let csv = '\uFEFF序号,类别,设备名称,型号规格,数量,单位,安装位置\n';
    bom.forEach(b => {
      csv += `${b.index},"${b.category}","${b.name}","${b.spec_model.replace(/"/g, '""')}",${b.quantity},"${b.unit}","${b.location}"\n`;
    });
    return csv;
  }
}
