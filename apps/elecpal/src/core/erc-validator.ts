/**
 * =========================================================================
 * ElecPal (电气伴侣) · ERC 电气规则校验器 (Electrical Rule Check)
 * 内置 GB 50054 / GB 50057 / IEC 60364 工业物理安全断言
 * 🚨 严格执行 GB 50054 阻断机制：存在 ERROR 级别隐患时强制拦截图纸导出！
 * =========================================================================
 */
import { PlantWideTopology } from './schema';

export interface ERCIssue {
  rule_id: string;
  severity: 'error' | 'warning';
  location: string;
  message: string;
  recommendation?: string;
}

export interface ERCValidationResult {
  passed: boolean;
  error_count: number;
  warning_count: number;
  issues: ERCIssue[];
}

export class ERCValidator {
  /**
   * 对全要素电气与智能化拓扑执行物理安全规则诊断
   */
  public static validate(topology: PlantWideTopology): ERCValidationResult {
    const issues: ERCIssue[] = [];
    const power = topology.power_distribution;
    const mainIncomer = power?.main_incomer;
    const mainRatedA = mainIncomer?.main_breaker?.rated_current_a || 160;

    // ========================================================================
    // 1. 强电系统校验 (Power Distribution)
    // ========================================================================
    if (power && power.sub_panels) {
      power.sub_panels.forEach(panel => {
        const subRatedA = panel.incoming_switch.rated_current_a;

        // 规则 1: 断路器级差防越级跳闸 (Selectivity)
        if (subRatedA >= mainRatedA) {
          issues.push({
            rule_id: 'ERC-SELECTIVITY-01',
            severity: 'error',
            location: `${panel.panel_id} (${panel.name})`,
            message: `分箱进线开关额定电流 (${subRatedA}A) 必须小于一级总开关 (${mainRatedA}A)，避免短路或过载时越级跳闸停掉全厂动力！`,
            recommendation: `降低分箱进线额定电流或升级一级主进线断路器 (建议级差系数 >= 1.6)`
          });
        } else if (mainRatedA / subRatedA < 1.4) {
          issues.push({
            rule_id: 'ERC-SELECTIVITY-01-WARN',
            severity: 'warning',
            location: `${panel.panel_id} (${panel.name})`,
            message: `分箱进线开关 (${subRatedA}A) 与总开关 (${mainRatedA}A) 级差比例为 ${(mainRatedA / subRatedA).toFixed(2)}，低于 GB 推荐的 1.6 倍保护选择性余量。`,
            recommendation: `优化分级保护定值以增强故障隔离能力`
          });
        }

        // 遍历动力回路
        panel.circuits.forEach(c => {
          const isMotorLoad = [
            'pump_motor',
            'blower_motor',
            'screen_filter',
            'actuator_motor',
            'hvac_fan'
          ].includes(c.load.type) || c.load.name.includes('泵') || c.load.name.includes('风机') || c.load.name.includes('马达');

          // 规则 2: 电动机回路强制选用 D 型动力微断
          if (isMotorLoad && c.breaker.trip_curve !== 'D') {
            issues.push({
              rule_id: 'ERC-MOTOR-CURVE-02',
              severity: 'error',
              location: `${panel.panel_id} -> ${c.circuit_id} (${c.name})`,
              message: `电动机负荷 '${c.load.name}' 启动瞬间涌流为额定电流的 5~7 倍，断路器必须配置 D 型动力脱扣特性 (10~14In)，当前为 '${c.breaker.trip_curve}' 型，电机启动极易误跳闸！`,
              recommendation: `将断路器型号更换为 D 型脱扣微断 (如 NXB-63 D16)`
            });
          }

          // 规则 3: 电缆允许载流量严禁小于断路器额定电流 (防电缆过热起火)
          if (c.cable.allowable_ampacity_a < c.breaker.rated_current_a) {
            issues.push({
              rule_id: 'ERC-CABLE-AMPACITY-03',
              severity: 'error',
              location: `${panel.panel_id} -> ${c.circuit_id} (${c.name})`,
              message: `电缆持续允许载流量 (${c.cable.allowable_ampacity_a}A) 小于断路器额定保护电流 (${c.breaker.rated_current_a}A)，发生过载时断路器未跳闸电缆已严重发热自燃！`,
              recommendation: `加大电缆截面规格或降低断路器额定脱扣电流`
            });
          }

          // 规则 4: 动力回路计算电压降校验 (Delta U <= 5.0%)
          if (c.cable.calculated_voltage_drop_pct && c.cable.calculated_voltage_drop_pct > 5.0) {
            issues.push({
              rule_id: 'ERC-VOLTAGE-DROP-04',
              severity: 'error',
              location: `${panel.panel_id} -> ${c.circuit_id} (${c.name})`,
              message: `末端计算电压降为 ${c.cable.calculated_voltage_drop_pct}%，超过国家标准允许的最大极限 5.0%，会导致电机欠压发热损毁！`,
              recommendation: `增大电缆导体截面积以降低线路交流电阻`
            });
          }
        });
      });
    }

    // ========================================================================
    // 2. 弱电直流与集中供电校验 (DC & UPS System)
    // ========================================================================
    if (topology.dc_and_ups_system?.dc_power_supply) {
      const dropV = topology.dc_and_ups_system.dc_power_supply.max_measured_line_drop_v;
      if (dropV && dropV > 2.4) {
        issues.push({
          rule_id: 'ERC-DC-LINE-DROP-05',
          severity: 'error',
          location: `弱电直流供电系统 (DC 24V)`,
          message: `DC 24V 集中供电末端线路压降 (${dropV}V) 超过 10% (2.4V)，传感器与 PLC 输入端实际工作电压低于 21.6V，易导致传感器死机或采集漂移！`,
          recommendation: `采用更粗截面的 RVV/RVSP 屏蔽双绞线，或在远端增设 DC-DC 稳压模块`
        });
      }
    }

    // ========================================================================
    // 3. 联合防雷接地校验 (Earthing System)
    // ========================================================================
    if (topology.earthing_system) {
      const rOhm = topology.earthing_system.measured_earthing_resistance_ohm;
      if (rOhm > 1.0) {
        issues.push({
          rule_id: 'ERC-EARTHING-RESISTANCE-06',
          severity: 'error',
          location: `联合接地网与 MEB 系统`,
          message: `实测工频接地电阻 (${rOhm} Ω) 超过规范上限 1.0 Ω，雷击或绝缘损坏时无法迅速泄放电荷，严重危及人身和工控设备安全！`,
          recommendation: `补充垂直接地极或注入降阻剂以确保接地电阻 <= 1.0 Ω`
        });
      }
    }

    // ========================================================================
    // 4. RS-485 现场总线校验 (Fieldbus & Slaves)
    // ========================================================================
    const fieldbus = topology.rs485_fieldbus;
    if (fieldbus) {
      const slaves = fieldbus.slaves || [];
      const addrs = new Set<string>();

      slaves.forEach((s) => {
        const addrKey = s.slave_address_hex || s.addr;
        if (addrKey) {
          if (addrs.has(addrKey)) {
            issues.push({
              rule_id: 'ERC-RS485-ADDR-CONFLICT-07',
              severity: 'error',
              location: `RS-485 总线 (${fieldbus.bus_id || 'BUS-RS485'})`,
              message: `检测到 RS-485 从站地址重复冲突: '${addrKey}' (${s.device_name || s.name})，总线通信将发生严重数据冲突乱码！`,
              recommendation: `重新规划从站唯一站号 (0x01 ~ 0xFF)`
            });
          } else {
            addrs.add(addrKey);
          }
        }
      });

      if (!fieldbus.has_120_ohm_terminator_at_end) {
        issues.push({
          rule_id: 'ERC-RS485-TERMINATOR-08',
          severity: 'warning',
          location: `RS-485 总线 (${fieldbus.bus_id || 'BUS-RS485'})`,
          message: `RS-485 菊花链末端未配置 120Ω 终端吸收电阻，工业长距离通信易受高频信号反射干扰导致丢包。`,
          recommendation: `在最远端从站差分 A/B 端子间并联 120Ω 1/4W 金属膜电阻`
        });
      }
    }

    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;

    return {
      passed: errorCount === 0,
      error_count: errorCount,
      warning_count: warningCount,
      issues
    };
  }
}
