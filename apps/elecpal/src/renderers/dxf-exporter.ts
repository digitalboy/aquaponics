/**
 * =========================================================================
 * ElecPal (电气伴侣) · AutoCAD DXF 工业级矢量图纸生成器
 * 生成兼容 AutoCAD R12 / 2000 / 浩辰 / 中望的标准 ASCII DXF 矢量图纸
 * 包含标准图块库 (BLOCKS) 与三大工程图卷 (ELEC-01/02/03)
 * 🚨 严格执行 GB 50054 ERC 物理安全阻断机制：存在越级跳闸/过载等错误时禁止出图！
 * =========================================================================
 */
import { PlantWideTopology } from '../core/schema';
import { ERCValidator } from '../core/erc-validator';

export class DXFExporter {
  /**
   * 导出图卷 1: ELEC-01 强电低压动力配电一次系统图
   */
  public static exportELEC01DXF(topology: PlantWideTopology): string {
    this.assertERC(topology);
    let dxf = this.generateHeaderAndTables();
    dxf += this.generateBlocks();
    dxf += `0\nSECTION\n2\nENTITIES\n`;

    // 1. 图纸外图框与标题栏 (A1: 2400 x 1600 单位空间)
    dxf += this.drawA1Border('ELEC-01', '全厂低压动力配电一次系统图 (380V/220V)', topology);

    // 2. 380V 主母线 (金色粗线)
    const busY = 1000.0;
    dxf += this.drawLine('0-BUSBAR', 80.0, busY, 2320.0, busY);
    dxf += this.drawText('0-TEXT', 90.0, busY + 20.0, 14.0, '380V/220V 50Hz 低压主母线 (Cu 3x(80x8)+1x(50x5))');

    // 3. 一级主进线柜 (AP-MAIN)
    const main = topology.power_distribution.main_incomer;
    dxf += this.drawInsert('BLK_TRANSFORMER', 200.0, 1380.0);
    dxf += this.drawText('0-TEXT', 220.0, 1400.0, 12.0, `${topology.power_distribution.transformer_capacity_kva}kVA 动力变压器`);
    dxf += this.drawLine('0-POWER', 200.0, 1320.0, 200.0, 1220.0);

    // 主断路器
    dxf += this.drawInsert('BLK_MCCB_3P', 200.0, 1180.0);
    dxf += this.drawText('0-TEXT', 220.0, 1190.0, 12.0, `${main.main_breaker.brand || ''} ${main.main_breaker.model}`);
    dxf += this.drawText('0-TEXT', 220.0, 1170.0, 10.0, `In=${main.main_breaker.rated_current_a}A Icu=${main.main_breaker.breaking_capacity_ka || 36}kA 3P`);

    // 进线电缆连线至母排
    dxf += this.drawLine('0-POWER', 200.0, 1140.0, 200.0, busY);

    // SPD 浪涌与电表
    dxf += this.drawInsert('BLK_SPD_T1', 320.0, 1100.0);
    dxf += this.drawLine('0-POWER', 200.0, 1100.0, 320.0, 1100.0);
    dxf += this.drawText('0-TEXT', 340.0, 1100.0, 10.0, `SPD ${main.spd_surge_protection.nominal_discharge_current_ka}kA (T1)`);

    // 4. 二级动力分箱回路排版
    let curX = 140.0;
    topology.power_distribution.sub_panels.forEach((panel) => {
      const panelWidth = Math.max(panel.circuits.length * 150.0 + 80.0, 420.0);

      // 分箱轮廓矩形 (虚线框)
      dxf += this.drawRect('0-SYMBOLS', curX, 100.0, curX + panelWidth, 880.0);
      dxf += this.drawText('0-TEXT', curX + 15.0, 855.0, 14.0, `【${panel.panel_id}】${panel.name} (${panel.ip_rating})`);

      // 分箱进线引下线 (从主母排引下)
      const feedX = curX + 40.0;
      dxf += this.drawLine('0-POWER', feedX, busY, feedX, 780.0);
      dxf += this.drawInsert('BLK_MCB_D_3P', feedX, 750.0);
      dxf += this.drawText('0-TEXT', feedX + 15.0, 755.0, 10.0, `进线开关: ${panel.incoming_switch.model} ${panel.incoming_switch.rated_current_a}A`);
      dxf += this.drawText('0-TEXT', feedX + 15.0, 740.0, 9.0, `电缆: ${panel.feeder_cable.spec} (${panel.feeder_cable.length_m}m)`);

      // 分箱小母排
      const subBusY = 660.0;
      dxf += this.drawLine('0-BUSBAR', curX + 20.0, subBusY, curX + panelWidth - 20.0, subBusY);
      dxf += this.drawLine('0-POWER', feedX, 720.0, feedX, subBusY);

      // 分支动力回路
      panel.circuits.forEach((c, cIdx) => {
        const cX = curX + 70.0 + cIdx * 150.0;

        // 回路引下线
        dxf += this.drawLine('0-POWER', cX, subBusY, cX, 580.0);
        dxf += this.drawInsert('BLK_MCB_D_3P', cX, 550.0);
        dxf += this.drawText('0-TEXT', cX + 15.0, 560.0, 10.0, `${c.circuit_id} ${c.breaker.model}`);
        dxf += this.drawText('0-TEXT', cX + 15.0, 545.0, 9.0, `D${c.breaker.rated_current_a}A ${c.breaker.poles}`);

        let nextY = 520.0;

        // 接触器 / 变频器
        if (c.load.is_vfd_driven) {
          dxf += this.drawLine('0-POWER', cX, nextY, cX, 450.0);
          dxf += this.drawInsert('BLK_VFD', cX, 420.0);
          dxf += this.drawText('0-TEXT', cX + 25.0, 420.0, 9.0, `变频器 ${c.load.rated_power_kw}kW`);
          nextY = 380.0;
        } else {
          dxf += this.drawLine('0-POWER', cX, nextY, cX, 450.0);
          dxf += this.drawInsert('BLK_KM_3P', cX, 420.0);
          nextY = 390.0;
        }

        // 动力电缆标注
        dxf += this.drawLine('0-POWER', cX, nextY, cX, 260.0);
        dxf += this.drawText('0-TEXT', cX + 10.0, 310.0, 8.5, `${c.cable.spec}`);
        dxf += this.drawText('0-TEXT', cX + 10.0, 295.0, 8.0, `L=${c.cable.length_m}m (Iz=${c.cable.allowable_ampacity_a}A)`);

        // 电机负荷
        dxf += this.drawInsert('BLK_MOTOR_3P', cX, 220.0);
        dxf += this.drawText('0-TEXT', cX - 40.0, 175.0, 10.0, c.load.name);
        dxf += this.drawText('0-TEXT', cX - 40.0, 160.0, 9.0, `Pe=${c.load.rated_power_kw}kW In=${c.load.rated_current_a}A`);
      });

      curX += panelWidth + 60.0;
    });

    dxf += `0\nENDSEC\n0\nEOF\n`;
    return dxf;
  }

  /**
   * 导出图卷 2: ELEC-02 PLC 自动化控制与 I/O 接线原理图
   */
  public static exportELEC02DXF(topology: PlantWideTopology): string {
    this.assertERC(topology);
    let dxf = this.generateHeaderAndTables();
    dxf += this.generateBlocks();
    dxf += `0\nSECTION\n2\nENTITIES\n`;

    dxf += this.drawA1Border('ELEC-02', 'PLC 自动化控制与 I/O 接线原理图 (24V DC)', topology);

    // PLC 控制器核心图元
    const plc = topology.plc_controller;
    const plcX = 1200.0;
    const plcY = 900.0;

    dxf += this.drawRect('0-PLC-IO', 900.0, 400.0, 1500.0, 1300.0);
    dxf += this.drawText('0-TEXT', 950.0, 1260.0, 16.0, `中央控制器: ${plc?.controller_brand || ''} ${plc?.controller_model || 'PLC CPU 1214C'}`);
    dxf += this.drawText('0-TEXT', 950.0, 1230.0, 11.0, `通信协议: Modbus-TCP / IP: ${plc?.ip_address || '192.168.1.10'}:${plc?.port || 502}`);

    // DI 输入点排版 (左侧)
    const dis = plc?.digital_inputs || [];
    dis.forEach((di, idx) => {
      const pY = 1150.0 - idx * 120.0;
      dxf += this.drawRect('0-PLC-IO', 900.0, pY - 20.0, 960.0, pY + 20.0);
      dxf += this.drawText('0-TEXT', 915.0, pY - 6.0, 12.0, di.point_id);

      // 外部信号线与传感器
      dxf += this.drawLine('0-POWER', 500.0, pY, 900.0, pY);
      dxf += this.drawRect('0-SYMBOLS', 300.0, pY - 30.0, 500.0, pY + 30.0);
      dxf += this.drawText('0-TEXT', 315.0, pY - 5.0, 10.0, di.signal_name);
      dxf += this.drawText('0-TEXT', 315.0, pY - 20.0, 8.5, di.description);
      dxf += this.drawText('0-TEXT', 600.0, pY + 8.0, 9.0, `线号: ${di.wire_id} (${di.contact_type})`);
    });

    // DO 输出点排版 (右侧)
    const dos = plc?.digital_outputs || [];
    dos.forEach((doPoint, idx) => {
      const pY = 1150.0 - idx * 120.0;
      dxf += this.drawRect('0-PLC-IO', 1440.0, pY - 20.0, 1500.0, pY + 20.0);
      dxf += this.drawText('0-TEXT', 1455.0, pY - 6.0, 12.0, doPoint.point_id);

      // 外部控制线与受控执行器
      dxf += this.drawLine('0-POWER', 1500.0, pY, 1900.0, pY);
      dxf += this.drawRect('0-SYMBOLS', 1900.0, pY - 30.0, 2150.0, pY + 30.0);
      dxf += this.drawText('0-TEXT', 1915.0, pY - 5.0, 10.0, doPoint.signal_name);
      dxf += this.drawText('0-TEXT', 1915.0, pY - 20.0, 8.5, doPoint.description);
      dxf += this.drawText('0-TEXT', 1600.0, pY + 8.0, 9.0, `驱动线号: ${doPoint.wire_id}`);
    });

    dxf += `0\nENDSEC\n0\nEOF\n`;
    return dxf;
  }

  /**
   * 导出图卷 3: ELEC-03 RS-485 现场总线与工控物联网络拓扑图
   */
  public static exportELEC03DXF(topology: PlantWideTopology): string {
    this.assertERC(topology);
    let dxf = this.generateHeaderAndTables();
    dxf += this.generateBlocks();
    dxf += `0\nSECTION\n2\nENTITIES\n`;

    dxf += this.drawA1Border('ELEC-03', 'RS-485 现场总线与工控物联网络拓扑图', topology);

    // 1. 边缘计算工控机 (IPC)
    const net = topology.edge_and_network;
    dxf += this.drawRect('0-SYMBOLS', 200.0, 1100.0, 600.0, 1350.0);
    dxf += this.drawText('0-TEXT', 220.0, 1310.0, 14.0, `【边缘工控机】${net?.edge_ipc?.brand_and_model || net?.edge_ipc?.model || 'IPC-610'}`);
    dxf += this.drawText('0-TEXT', 220.0, 1275.0, 10.0, `IP: ${net?.edge_ipc?.ip_address || '192.168.1.50'} (${net?.edge_ipc?.os || 'Linux RT'})`);
    dxf += this.drawText('0-TEXT', 220.0, 1240.0, 9.0, `服务: 5s 宽表聚合 / YOLO 视觉 / 云端同步`);

    // 2. RS-485 菊花链总线 (差分 A/B 双绞线)
    const bus = topology.rs485_fieldbus;
    const busY = 850.0;
    dxf += this.drawLine('0-BUS485', 200.0, busY, 2200.0, busY);
    dxf += this.drawText('0-TEXT', 220.0, busY + 20.0, 12.0, `RS-485 菊花链总线 (9600-8-N-1 屏蔽双绞线 RVSP 2x0.5)`);

    // IPC 连至 485 总线
    dxf += this.drawLine('0-BUS485', 400.0, 1100.0, 400.0, busY);

    // 遍历 RS-485 从站
    const slaves = bus?.slaves || [];
    slaves.forEach((s, idx) => {
      const sX = 350.0 + idx * 280.0;
      dxf += this.drawLine('0-BUS485', sX, busY, sX, 600.0);
      dxf += this.drawRect('0-SYMBOLS', sX - 110.0, 380.0, sX + 110.0, 600.0);
      dxf += this.drawText('0-TEXT', sX - 95.0, 560.0, 11.0, `站号: ${s.slave_address_hex || s.addr}`);
      dxf += this.drawText('0-TEXT', sX - 95.0, 525.0, 9.5, s.device_name || s.name || '');
      dxf += this.drawText('0-TEXT', sX - 95.0, 490.0, 8.5, s.manufacturer_and_model || s.model || '');
      dxf += this.drawText('0-TEXT', sX - 95.0, 455.0, 8.0, `轮询: ${s.polling_interval_ms || s.poll_ms || 1000}ms`);
    });

    // 末端 120Ω 吸收电阻
    if (bus?.has_120_ohm_terminator_at_end) {
      const endX = 350.0 + (slaves.length - 1) * 280.0 + 160.0;
      dxf += this.drawRect('0-BUS485', endX, busY - 15.0, endX + 60.0, busY + 15.0);
      dxf += this.drawText('0-TEXT', endX - 10.0, busY + 25.0, 9.0, '120Ω 吸收电阻');
    }

    dxf += `0\nENDSEC\n0\nEOF\n`;
    return dxf;
  }

  // ==========================================================================
  // 私有辅助方法与标准 DXF 构造工具
  // ==========================================================================

  private static assertERC(topology: PlantWideTopology): void {
    const erc = ERCValidator.validate(topology);
    if (!erc.passed) {
      const errors = erc.issues
        .filter(i => i.severity === 'error')
        .map(i => `• [${i.rule_id}] ${i.location}: ${i.message}`)
        .join('\n');
      throw new Error(`【ERC 严格阻断】系统检测到严重电气安全隐患，强制禁止导出施工图纸！\n${errors}`);
    }
  }

  private static generateHeaderAndTables(): string {
    let out = `0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n0\nENDSEC\n`;
    out += `0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n7\n`;
    out += `0\nLAYER\n2\n0-BORDER\n70\n0\n62\n7\n6\nCONTINUOUS\n`;   // 白色图框
    out += `0\nLAYER\n2\n0-BUSBAR\n70\n0\n62\n2\n6\nCONTINUOUS\n`;   // 金黄色母排 (粗)
    out += `0\nLAYER\n2\n0-POWER\n70\n0\n62\n4\n6\nCONTINUOUS\n`;    // 青色动力/控制线
    out += `0\nLAYER\n2\n0-SYMBOLS\n70\n0\n62\n3\n6\nCONTINUOUS\n`;  // 绿色符号图元
    out += `0\nLAYER\n2\n0-TEXT\n70\n0\n62\n1\n6\nCONTINUOUS\n`;     // 红色/白色文字
    out += `0\nLAYER\n2\n0-PLC-IO\n70\n0\n62\n5\n6\nCONTINUOUS\n`;   // 蓝色自控 I/O
    out += `0\nLAYER\n2\n0-BUS485\n70\n0\n62\n6\n6\nCONTINUOUS\n`;   // 洋红现场总线
    out += `0\nENDTAB\n0\nENDSEC\n`;
    return out;
  }

  private static generateBlocks(): string {
    let out = `0\nSECTION\n2\nBLOCKS\n`;

    // 1. 变压器符号 BLOCK
    out += `0\nBLOCK\n8\n0-SYMBOLS\n2\nBLK_TRANSFORMER\n70\n0\n10\n0.0\n20\n0.0\n30\n0.0\n3\nBLK_TRANSFORMER\n`;
    out += `0\nCIRCLE\n8\n0-SYMBOLS\n10\n0.0\n20\n25.0\n30\n0.0\n40\n25.0\n`;
    out += `0\nCIRCLE\n8\n0-SYMBOLS\n10\n0.0\n20\n-25.0\n30\n0.0\n40\n25.0\n`;
    out += `0\nENDBLK\n`;

    // 2. 塑壳断路器 MCCB_3P BLOCK
    out += `0\nBLOCK\n8\n0-SYMBOLS\n2\nBLK_MCCB_3P\n70\n0\n10\n0.0\n20\n0.0\n30\n0.0\n3\nBLK_MCCB_3P\n`;
    out += `0\nLINE\n8\n0-SYMBOLS\n10\n-15.0\n20\n-20.0\n30\n0.0\n11\n15.0\n21\n-20.0\n31\n0.0\n`;
    out += `0\nLINE\n8\n0-SYMBOLS\n10\n15.0\n20\n-20.0\n30\n0.0\n11\n15.0\n21\n20.0\n31\n0.0\n`;
    out += `0\nLINE\n8\n0-SYMBOLS\n10\n15.0\n20\n20.0\n30\n0.0\n11\n-15.0\n21\n20.0\n31\n0.0\n`;
    out += `0\nLINE\n8\n0-SYMBOLS\n10\n-15.0\n20\n20.0\n30\n0.0\n11\n-15.0\n21\n-20.0\n31\n0.0\n`;
    out += `0\nLINE\n8\n0-SYMBOLS\n10\n-15.0\n20\n-20.0\n30\n0.0\n11\n15.0\n21\n20.0\n31\n0.0\n`;
    out += `0\nLINE\n8\n0-SYMBOLS\n10\n-15.0\n20\n20.0\n30\n0.0\n11\n15.0\n21\n-20.0\n31\n0.0\n`;
    out += `0\nENDBLK\n`;

    // 3. 微断 MCB_D_3P BLOCK
    out += `0\nBLOCK\n8\n0-SYMBOLS\n2\nBLK_MCB_D_3P\n70\n0\n10\n0.0\n20\n0.0\n30\n0.0\n3\nBLK_MCB_D_3P\n`;
    out += `0\nLINE\n8\n0-SYMBOLS\n10\n0.0\n20\n-20.0\n30\n0.0\n11\n0.0\n21\n-10.0\n31\n0.0\n`;
    out += `0\nLINE\n8\n0-SYMBOLS\n10\n0.0\n20\n-10.0\n30\n0.0\n11\n-10.0\n21\n10.0\n31\n0.0\n`;
    out += `0\nLINE\n8\n0-SYMBOLS\n10\n0.0\n20\n10.0\n30\n0.0\n11\n0.0\n21\n20.0\n31\n0.0\n`;
    out += `0\nENDBLK\n`;

    // 4. 变频器 VFD BLOCK
    out += `0\nBLOCK\n8\n0-SYMBOLS\n2\nBLK_VFD\n70\n0\n10\n0.0\n20\n0.0\n30\n0.0\n3\nBLK_VFD\n`;
    out += `0\nLINE\n8\n0-SYMBOLS\n10\n-20.0\n20\n-20.0\n30\n0.0\n11\n20.0\n21\n-20.0\n31\n0.0\n`;
    out += `0\nLINE\n8\n0-SYMBOLS\n10\n20.0\n20\n-20.0\n30\n0.0\n11\n20.0\n21\n20.0\n31\n0.0\n`;
    out += `0\nLINE\n8\n0-SYMBOLS\n10\n20.0\n20\n20.0\n30\n0.0\n11\n-20.0\n21\n20.0\n31\n0.0\n`;
    out += `0\nLINE\n8\n0-SYMBOLS\n10\n-20.0\n20\n20.0\n30\n0.0\n11\n-20.0\n21\n-20.0\n31\n0.0\n`;
    out += `0\nLINE\n8\n0-SYMBOLS\n10\n-20.0\n20\n-20.0\n30\n0.0\n11\n20.0\n21\n20.0\n31\n0.0\n`;
    out += `0\nENDBLK\n`;

    // 5. 电动机 MOTOR_3P BLOCK
    out += `0\nBLOCK\n8\n0-SYMBOLS\n2\nBLK_MOTOR_3P\n70\n0\n10\n0.0\n20\n0.0\n30\n0.0\n3\nBLK_MOTOR_3P\n`;
    out += `0\nCIRCLE\n8\n0-SYMBOLS\n10\n0.0\n20\n0.0\n30\n0.0\n40\n20.0\n`;
    out += `0\nTEXT\n8\n0-SYMBOLS\n10\n-8.0\n20\n-6.0\n30\n0.0\n40\n14.0\n1\nM\n`;
    out += `0\nENDBLK\n`;

    // 6. 浪涌保护器 SPD BLOCK
    out += `0\nBLOCK\n8\n0-SYMBOLS\n2\nBLK_SPD_T1\n70\n0\n10\n0.0\n20\n0.0\n30\n0.0\n3\nBLK_SPD_T1\n`;
    out += `0\nLINE\n8\n0-SYMBOLS\n10\n-12.0\n20\n-15.0\n30\n0.0\n11\n12.0\n21\n-15.0\n31\n0.0\n`;
    out += `0\nLINE\n8\n0-SYMBOLS\n10\n12.0\n20\n-15.0\n30\n0.0\n11\n12.0\n21\n15.0\n31\n0.0\n`;
    out += `0\nLINE\n8\n0-SYMBOLS\n10\n12.0\n20\n15.0\n30\n0.0\n11\n-12.0\n21\n15.0\n31\n0.0\n`;
    out += `0\nLINE\n8\n0-SYMBOLS\n10\n-12.0\n20\n15.0\n30\n0.0\n11\n-12.0\n21\n-15.0\n31\n0.0\n`;
    out += `0\nENDBLK\n`;

    // 7. 交流接触器 KM BLOCK
    out += `0\nBLOCK\n8\n0-SYMBOLS\n2\nBLK_KM_3P\n70\n0\n10\n0.0\n20\n0.0\n30\n0.0\n3\nBLK_KM_3P\n`;
    out += `0\nLINE\n8\n0-SYMBOLS\n10\n-10.0\n20\n-10.0\n30\n0.0\n11\n10.0\n21\n-10.0\n31\n0.0\n`;
    out += `0\nLINE\n8\n0-SYMBOLS\n10\n10.0\n20\n-10.0\n30\n0.0\n11\n10.0\n21\n10.0\n31\n0.0\n`;
    out += `0\nLINE\n8\n0-SYMBOLS\n10\n10.0\n20\n10.0\n30\n0.0\n11\n-10.0\n21\n10.0\n31\n0.0\n`;
    out += `0\nLINE\n8\n0-SYMBOLS\n10\n-10.0\n20\n10.0\n30\n0.0\n11\n-10.0\n21\n-10.0\n31\n0.0\n`;
    out += `0\nENDBLK\n`;

    out += `0\nENDTAB\n0\nENDSEC\n`;
    return out;
  }

  private static drawA1Border(sheetCode: string, sheetTitle: string, topology: PlantWideTopology): string {
    let out = '';
    // A1 图框外框 (2400 x 1600)
    out += this.drawRect('0-BORDER', 30.0, 30.0, 2370.0, 1570.0);
    out += this.drawRect('0-BORDER', 45.0, 45.0, 2355.0, 1555.0);

    // 右下角 GB/T 10609.1 标准工程标题栏 (420 x 120)
    const bx = 1935.0;
    const by = 45.0;
    out += this.drawRect('0-BORDER', bx, by, 2355.0, by + 130.0);
    out += this.drawLine('0-BORDER', bx, by + 65.0, 2355.0, by + 65.0);
    out += this.drawLine('0-BORDER', bx + 220.0, by, bx + 220.0, by + 130.0);

    out += this.drawText('0-TEXT', bx + 15.0, by + 100.0, 14.0, topology.facility_name);
    out += this.drawText('0-TEXT', bx + 15.0, by + 75.0, 11.0, `工程图名: ${sheetTitle}`);
    out += this.drawText('0-TEXT', bx + 15.0, by + 40.0, 11.0, `图号: ${sheetCode}   版次: V2.0`);
    out += this.drawText('0-TEXT', bx + 15.0, by + 15.0, 9.0, `设计软件: ElecPal (GB/T 18135 / IEC 60617)`);

    out += this.drawText('0-TEXT', bx + 235.0, by + 100.0, 12.0, `供电制式: ${topology.voltage_system}`);
    out += this.drawText('0-TEXT', bx + 235.0, by + 75.0, 10.0, `车间编号: ${topology.workshop_code}`);
    out += this.drawText('0-TEXT', bx + 235.0, by + 40.0, 9.0, `签署: 资深电气总工 (Approved)`);
    out += this.drawText('0-TEXT', bx + 235.0, by + 15.0, 8.5, `出图日期: ${topology.updated_at.split('T')[0]}`);

    return out;
  }

  private static drawLine(layer: string, x1: number, y1: number, x2: number, y2: number): string {
    return `0\nLINE\n8\n${layer}\n10\n${x1.toFixed(1)}\n20\n${y1.toFixed(1)}\n30\n0.0\n11\n${x2.toFixed(1)}\n21\n${y2.toFixed(1)}\n31\n0.0\n`;
  }

  private static drawRect(layer: string, x1: number, y1: number, x2: number, y2: number): string {
    let s = this.drawLine(layer, x1, y1, x2, y1);
    s += this.drawLine(layer, x2, y1, x2, y2);
    s += this.drawLine(layer, x2, y2, x1, y2);
    s += this.drawLine(layer, x1, y2, x1, y1);
    return s;
  }

  private static drawText(layer: string, x: number, y: number, height: number, text: string): string {
    return `0\nTEXT\n8\n${layer}\n10\n${x.toFixed(1)}\n20\n${y.toFixed(1)}\n30\n0.0\n40\n${height.toFixed(1)}\n1\n${text}\n`;
  }

  private static drawInsert(blockName: string, x: number, y: number, scale = 1.0): string {
    return `0\nINSERT\n8\n0-SYMBOLS\n2\n${blockName}\n10\n${x.toFixed(1)}\n20\n${y.toFixed(1)}\n30\n0.0\n41\n${scale.toFixed(1)}\n42\n${scale.toFixed(1)}\n43\n1.0\n`;
  }
}
