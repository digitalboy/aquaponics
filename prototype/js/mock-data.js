/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * mock-data.js: 全厂细密遥测初始数据集与数据工厂 (Mock Data Factory)
 * =========================================================================
 */

const MockDataFactory = {
  createDefaultState() {
    return {
      // 当前选中的 3D 聚焦实体
      selectedEntity: {
        id: 'tank-1',
        type: 'fish-tank',
        name: '🐟 鱼池 #01 (加州鲈鱼成鱼池)',
      },

      // 养殖长指挥台当前选中的鱼池 ID ('tank-1' ~ 'tank-10')
      currentAquaTankId: 'tank-1',

      // 种植长调度台当前选中的菜池 ID ('raceway-a' ~ 'raceway-d')
      currentHydroRacewayId: 'raceway-a',

      // 水培浮板当前选中的浮板编号 ('B01' ~ 'B04')
      currentRaftId: 'B03',

      // 底部快捷巡检矩阵当前选中的分类 Tab
      activeQuickTab: 'fish',

      // 集团决策视角切换 ('all' | 'coo' | 'cfo')
      executiveRole: 'all',

      // 1. 鱼池养殖区数据 (10 个环形鱼池)
      fishTanks: {},

      // 2. 水培蔬菜跑道区 (4 个深水跑道，含根区溶解氧 Root DO)
      raceways: {},

      // 3. 浮板孔位单株全息追踪微阵列 (每板 24 孔)
      raftSlots: {},

      // 4. 种植试验舱区 (12 个标准化方形独立种植试验舱)
      nurseryBlocks: {},

      // 5. 8.1米立体垂直分层测温立柱 (6 根测温柱 × 3 层)
      pillars: {},

      // 6. ⚡ 强电动力配电柜 (380V 三相主动力 / 威胜0.5S智能电表)
      cabinetHV: {
        voltageA: 382.4,
        voltageB: 381.8,
        voltageC: 383.1,
        currentA: 28.5,
        currentB: 27.9,
        currentC: 28.2,
        totalPowerKw: 18.45,
        powerFactor: 0.962,
        ctRatio: 40,
        touRate: 0.68,
        touStatus: '平段',
        breakerStatus: '闭合吸合 (ON)',
        freqHz: 50.02
      },

      // 7. 📡 弱电自动化控制柜 (汇川 Easy320 PLC / 24V DC / 隔离安全栅)
      cabinetLV: {
        plcModel: '汇川 Easy320 PLC (192.168.1.88)',
        plcCycleMs: 100,
        dc24Voltage: 24.18,
        modbusStatus: '485 正常轮询 (CRC 0.00%)',
        safetyInterlock: 'READY (0.1s 硬安全联锁待命)',
        ioPoints: 'DI 32 / DO 24 / AI 16',
        barrierStatus: '本安隔离安全栅 正常',
        lastPurgeIso: '2026-08-18T16:00:00.000Z'
      },

      // 8. 室外六要素微气象站
      weather: {
        windSpeed: 3.4,
        windDirection: '东南偏东 (128°)',
        solarRadiation: 685,
        tempOutdoor: 31.2,
        rhOutdoor: 58,
        pressureHpa: 1012.4,
        rainSensorClosed: false
      },

      // 9. 🛸 室内自主多光谱巡检无人机与自动机巢 (主力巡检 · 零铺轨)
      drone: {
        name: '室内自主巡检无人机 Alpha-01',
        battery: 98,
        status: 'DOCKED',
        dockStatus: '闭合充电中',
        nextFlight: '10:00 (全场 4K NDVI 扫描)',
        resolution: '1,280万像素',
        coverage: '100%'
      },

      // 10. 🔋 近 1 小时用电量与 IIoT 遥测数据量统计
      energyRollup1h: {
        kwh: 18.25,
        costYuan: 12.41,
        touRate: 0.68,
        telemetryFrames: 720,
        telemetryPoints: 92160,
        bytesMb: 1.85,
        lossRate: '0.00%'
      },

      // 11. 🔌 全厂关键动力设备 24h 运行时序甘特图 (8 个 3h 时段)
      equipmentTimeline: [
        {
          id: 'pump_01',
          name: '💧 #1 主水循环泵 (15kW变频)',
          periods: ['RUN', 'RUN', 'RUN', 'RUN', 'RUN', 'RUN', 'RUN', 'RUN'],
          hours: '24.0 h',
          status: '🟢 连续运行',
          rule: '主泵 (常开保命)'
        },
        {
          id: 'pump_02',
          name: '💧 #2 备用循环泵 (15kW热备)',
          periods: ['IDLE', 'IDLE', 'IDLE', 'IDLE', 'IDLE', 'IDLE', 'IDLE', 'IDLE'],
          hours: '0.0 h',
          status: '⚪ 热备待命',
          rule: '明日 08:00 自动倒闸轮换'
        },
        {
          id: 'blower_01',
          name: '🫧 鱼池微孔罗茨风机 (5.5kW)',
          periods: ['RUN', 'RUN', 'RUN', 'RUN', 'RUN', 'RUN', 'RUN', 'RUN'],
          hours: '24.0 h',
          status: '🟢 变频微气泡',
          rule: '溶氧闭环自愈'
        },
        {
          id: 'hydro_aerator_01',
          name: '🥬 菜池水槽增氧泵 (3.0kW)',
          periods: ['RUN', 'RUN', 'RUN', 'RUN', 'RUN', 'RUN', 'ECO', 'RUN'],
          hours: '21.0 h',
          status: '🟢 运行中',
          rule: '18:00~21:00 尖峰避峰3h'
        },
        {
          id: 'hvac_fans_group',
          name: '💨 温室高空环流风机群 (4×0.75kW)',
          periods: ['RUN', 'RUN', 'IDLE', 'RUN', 'RUN', 'IDLE', 'IDLE', 'RUN'],
          hours: '15.0 h',
          status: '🟢 运行中',
          rule: '温湿差&结露触发'
        },
        {
          id: 'heatpump_main',
          name: '🔥 地源热泵中央机组 (45kW)',
          periods: ['RUN', 'RUN', 'IDLE', 'IDLE', 'IDLE', 'IDLE', 'IDLE', 'RUN'],
          hours: '9.0 h',
          status: '🟡 待命蓄能',
          rule: '00:00~06:00 谷电蓄热1.5°C'
        }
      ],

      // 12. 会员小程序实时投诉 / 建议 / AI 客服互动流
      memberTickets: [
        {
          id: 'TKT-0819-041',
          member: '👑 张女士 (钻石认养会员)',
          time: '10:14:22',
          type: '品控投诉',
          typeBadge: 'bg-rose-100 text-rose-800 border-rose-300',
          content: '这周收到的生菜有两片外叶微黄，希望注意冷链保温',
          aiReply: '已调取批次 LOT-0818-VEG03 (0农残/DLI 16.5)，已自动补发 ¥20 鲜萃券并联动冷链强化保温。',
          status: '✅ AI 已秒级闭环处理'
        },
        {
          id: 'TKT-0819-040',
          member: '🌟 李先生 (周期购金卡)',
          time: '09:42:15',
          type: '选品建议',
          typeBadge: 'bg-purple-100 text-purple-800 border-purple-300',
          content: '建议下周周配增加羽衣甘蓝或芝麻菜品种，适合做轻食沙拉',
          aiReply: '已记录您的宝贵偏好！系统已将诉求推送至农艺排产 Copilot，预计下期周配即可支持自选羽衣甘蓝。',
          status: '✅ 已汇入排产决策流'
        },
        {
          id: 'TKT-0819-039',
          member: '👑 王女士 (认养年卡会员)',
          time: '08:18:05',
          type: '认养探视',
          typeBadge: 'bg-teal-100 text-teal-800 border-teal-300',
          content: '查询我专属认养浮板 #RA-B03-R02C04 的最新生长状态与慢直播',
          aiReply: '已为您连通 #A03 跑道 RTSP-02 专用水下双目机位，当前作物日龄 16天，均重 210g，长势极佳！',
          status: '✅ 直播推流已接通'
        }
      ],

      // 13. 🚚 B2B 大客户专属 SLA 履约与动态到达预测预警 (提前/延误智能推演)
      b2bShipments: [
        {
          id: 'SHP-0819-01',
          client: '盒马鲜生 (华东昆山 DC 仓)',
          clientBadge: 'bg-blue-100 text-blue-800 border-blue-300',
          cutoffTime: '05:30 截单',
          cargo: '特级奶油生菜 850 kg',
          batchId: 'LOT-20260819-VEG01',
          truckPlate: '苏E·5882F (顺丰冷链)',
          temp: '2.8°C (标准 2~4°C)',
          plannedEta: '05:00',
          predictedEta: '04:35',
          varianceMin: -25,
          varianceText: '🟢 预计提前 25 分钟',
          varianceBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          rootCause: '高速路网畅通 · 采收装箱提前 15 分钟',
          status: '🟢 顺畅提前 (准点率 100%)',
          riskLevel: 'green',
          otifRate: '100.0%',
          canMitigate: false
        },
        {
          id: 'SHP-0819-02',
          client: '山姆会员店 (华东嘉兴总仓)',
          clientBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          cutoffTime: '06:00 截单',
          cargo: '罗马脆生菜 1,200 kg',
          batchId: 'LOT-20260819-VEG02',
          truckPlate: '浙A·3991C (恒温专车)',
          temp: '3.1°C (标准 2~4°C)',
          plannedEta: '05:30',
          predictedEta: '06:15',
          varianceMin: +45,
          varianceText: '🔴 预警：预计延后 45 分钟',
          varianceBadge: 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse font-black',
          rootCause: 'G15 沈海高速突发路段施工拥堵 (排队 3.8km)',
          status: '🔴 延后预警 (触碰 06:00 截单红线)',
          riskLevel: 'red',
          otifRate: '99.8%',
          canMitigate: true,
          mitigationText: '⚡ 一键改派常州前置仓代送 (保 05:18 提前入库)'
        },
        {
          id: 'SHP-0819-03',
          client: '海底捞 (华东中央生鲜厨房)',
          clientBadge: 'bg-rose-100 text-rose-800 border-rose-300',
          cutoffTime: '07:00 截单',
          cargo: '生态加州鲈鱼 600 kg (增氧活水车)',
          batchId: 'LOT-20260819-AQUA01',
          truckPlate: '苏U·8821B (活鲜运保车)',
          temp: '18.5°C / DO 7.2 mg/L',
          plannedEta: '06:30',
          predictedEta: '06:05',
          varianceMin: -25,
          varianceText: '🟢 预计提前 25 分钟',
          varianceBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          rootCause: '水产出塘分选流水线高效，活水车路况通畅',
          status: '🟢 顺畅提前 (准点率 100%)',
          riskLevel: 'green',
          otifRate: '100.0%',
          canMitigate: false
        },
        {
          id: 'SHP-0819-04',
          client: 'Ole\' 精品超市 (上海各门店)',
          clientBadge: 'bg-purple-100 text-purple-800 border-purple-300',
          cutoffTime: '08:00 截单',
          cargo: '有机罗勒/芝麻菜 350 kg',
          batchId: 'LOT-20260819-HERB01',
          truckPlate: '沪B·7721A (城市精配车)',
          temp: '3.4°C (标准 2~4°C)',
          plannedEta: '07:30',
          predictedEta: '06:55',
          varianceMin: -35,
          varianceText: '🔵 预计提前 35 分钟 (光温生长加速)',
          varianceBadge: 'bg-teal-100 text-teal-800 border-teal-300',
          rootCause: '温室 #C 跑道光合积分 DLI 超预期，定植周期提前 1 天达标',
          status: '🔵 生物节律提前 (可提前交付)',
          riskLevel: 'blue',
          otifRate: '99.5%',
          canMitigate: true,
          mitigationText: '📑 一键通知买手申请提前入库窗口'
        }
      ],

      // 14. ⚡ B2B 商业级客诉、突发需求与跨基地调拨工单
      b2bTickets: [
        {
          id: 'TKT-B2B-01',
          client: '盒马鲜生 (华东昆山 DC 仓)',
          time: '04:15:10',
          type: '外包装微损客诉',
          typeBadge: 'bg-amber-100 text-amber-800 border-amber-300',
          content: '到货生菜外包装箱在装卸中有 30 盒轻微折痕，要求在早 06:00 截单前完成换补货。',
          solution: '已触发【常州前置卫星仓】紧急调拨 30 盒同批次精品，顺丰专车已发车，预计 22 分钟送达！',
          status: '✅ 12分钟已换补送达 (0延误)',
          canAction: false
        },
        {
          id: 'TKT-B2B-02',
          client: '山姆会员店 (华东嘉兴总仓)',
          time: '04:30:22',
          type: '突发大单增补需求',
          typeBadge: 'bg-purple-100 text-purple-800 border-purple-300',
          content: '周末大促会员抢购火爆，紧急申请追加特级奶油生菜 200 kg，需上午 09:00 前入库。',
          solution: '系统已完成 30 天 ATP 锁定：#B02 跑道处于 95% 成熟采收期，已生成跨基地冷链紧急调拨派工单！',
          status: '⚡ 待一键确认跨厂调拨',
          canAction: true,
          actionText: '🚀 一键确认跨基地调拨派车'
        },
        {
          id: 'TKT-B2B-03',
          client: 'Ole\' 精品超市 (上海各门店)',
          time: '03:50:18',
          type: '入库质检核验证明',
          typeBadge: 'bg-teal-100 text-teal-800 border-teal-300',
          content: '门店质检部门例行抽检，要求出具该批次罗勒草在温室的 DLI 光积累与 0 农残 SGS 电子质检单 (e-COA)。',
          solution: '系统已调取跑道 #C 全生命周期环境传感器与 SGS 检测报告，已加盖防伪电子签章。',
          status: '✅ 电子质检单已推至商超 EDI',
          canAction: true,
          actionText: '📄 调取并预览 e-COA 质检单'
        }
      ]
    };
  },

  /**
   * 构建 10 座鱼池、4 座水培跑道、浮板 24 孔单株、12 个试验舱与 6 根测温立柱
   */
  populateFacilities(state) {
    const fishNames = [
      '加州鲈鱼成鱼池', '加州鲈鱼育成池', '黑鱼养殖池', '银鳕鱼高密池', 
      '草鱼生态池', '鲈鱼分选池', '水质净化鱼池', '幼鱼标粗池', '鱼苗繁育池', '备用隔离池'
    ];
    for (let i = 1; i <= 10; i++) {
      state.fishTanks[`tank-${i}`] = {
        id: `tank-${i}`,
        index: i,
        name: `🐟 鱼池 #${i.toString().padStart(2, '0')} (${fishNames[i - 1]})`,
        species: fishNames[i - 1].replace('养殖池', '').replace('生态池', '').replace('成鱼池', '').replace('育成池', '').replace('高密池', '').replace('分选池', '').replace('净化鱼池', '').replace('标粗池', '').replace('繁育池', '').replace('隔离池', ''),
        do: +(6.2 + (Math.sin(i * 1.5) * 0.8)).toFixed(2),
        tan: +(0.65 + (Math.cos(i) * 0.25)).toFixed(2),
        ph: +(7.15 + (Math.sin(i * 0.15) * 0.15)).toFixed(2),
        waterTemp: +(21.5 + (i % 3) * 0.4).toFixed(1),
        uia: 0.012,
        deltaDO: 0.00,
        deltaTAN: 0.00,
        waterFlowLpm: Math.round(180 + Math.random() * 20),
        purgeCountdownSec: 14400 - (i * 900),
        biomassKg: Math.round(1200 + i * 180),
        avgWeightG: Math.round(420 + i * 25)
      };
      // 初始 UIA
      const pKa = 0.09018 + (2729.92 / (state.fishTanks[`tank-${i}`].waterTemp + 273.15));
      const factor = 1 / (Math.pow(10, pKa - state.fishTanks[`tank-${i}`].ph) + 1);
      state.fishTanks[`tank-${i}`].uia = +(state.fishTanks[`tank-${i}`].tan * factor).toFixed(3);
    }

    const racewayConfigs = [
      { key: 'raceway-a', char: 'A', name: '🥬 #A 跑道 (特级奶油生菜)', days: 20, percent: 95, amr: '今日 16:00 采收' },
      { key: 'raceway-b', char: 'B', name: '🥬 #B 跑道 (罗马脆生菜)', days: 14, percent: 66, amr: '预计 4 天后采收' },
      { key: 'raceway-c', char: 'C', name: '🌿 #C 跑道 (无菌罗勒草)', days: 8, percent: 38, amr: '巡检中 (长势旺)' },
      { key: 'raceway-d', char: 'D', name: '🥗 #D 跑道 (嫩叶芝麻菜)', days: 3, percent: 10, amr: '缓苗期 (弱光)' }
    ];

    racewayConfigs.forEach((cfg, idx) => {
      state.raceways[cfg.key] = {
        id: cfg.key,
        char: cfg.char,
        name: cfg.name,
        rootDO: +(6.8 - idx * 0.3).toFixed(2),
        vpd: +(0.95 + idx * 0.08).toFixed(2),
        dliToday: +(16.8 - idx * 1.2).toFixed(1),
        ppfd: Math.round(280 - idx * 25),
        ec: +(1.85 + idx * 0.1).toFixed(2),
        rootTemp: +(20.8 + idx * 0.3).toFixed(1),
        growthDays: cfg.days,
        growthPercent: cfg.percent,
        amrStatus: cfg.amr
      };
    });

    ['B01', 'B02', 'B03', 'B04'].forEach(bId => {
      state.raftSlots[bId] = [];
      for (let r = 1; r <= 4; r++) {
        for (let c = 1; c <= 6; c++) {
          const slotNum = (r - 1) * 6 + c;
          const uid = `RA-${bId}-R${r.toString().padStart(2, '0')}C${c.toString().padStart(2, '0')}`;
          
          let status = 'normal';
          let healthScore = Math.round(94 + Math.random() * 5);
          let pestInfo = '0虫害 · 0叶斑 (健康)';
          let weight = Math.round(210 + Math.random() * 45);

          if (bId === 'B03' && r === 2 && c === 4) {
            status = 'warning';
            healthScore = 82;
            pestInfo = '早期微弱蓟马微斑 (NDVI 偏异 4.2%)';
            weight = 195;
          } else if (weight >= 245) {
            status = 'ready';
          }

          state.raftSlots[bId].push({
            uid: uid,
            raftId: bId,
            row: r,
            col: c,
            slotCode: `#${slotNum.toString().padStart(2, '0')}`,
            cropName: '特级奶油生菜',
            weight: weight,
            targetWeight: 250,
            canopyCm: +(16.5 + (weight / 250) * 3.5).toFixed(1),
            spad: +(44.0 + Math.random() * 4.0).toFixed(1),
            healthScore: healthScore,
            status: status,
            pestInfo: pestInfo,
            transplantDate: '2026-07-28 08:00 (定植第 20 天)',
            harvestEta: status === 'ready' ? '今日 16:00 (派发 AMR #02)' : '预计明日 08:00 (派发 AMR #02)'
          });
        }
      }
    });

    const trials = [
      '低糖促脆光配方试验', '高花青素光谱试验', '草莓水培定植试验', '微量元素铁强化试验',
      '低硝酸盐代谢试验', '根腐拮抗有益菌试验', '番茄矮化密植试验', '芽苗菜高频循环试验',
      '夜间变温节律试验', '深液流增氧对比试验', '全光谱LED能效试验', '自研营养液配方试验'
    ];

    for (let i = 1; i <= 12; i++) {
      state.nurseryBlocks[`nursery-${i}`] = {
        id: `nursery-${i}`,
        name: `🌱 种植试验舱 #${i.toString().padStart(2, '0')}`,
        trialName: trials[i - 1],
        batchNo: `TRIAL-EXP-08${i.toString().padStart(2, '0')}`,
        healthIndex: +(97.5 + Math.random() * 2.0).toFixed(1),
        tempCanopy: +(24.0 + Math.random() * 0.4).toFixed(1),
        rh: Math.round(75 + Math.random() * 5),
        ledSpectrum: '动态可调全光谱 4:2:1',
        trialDays: Math.round((i % 14) + 1)
      };
    }

    for (let i = 1; i <= 6; i++) {
      state.pillars[`pillar-${i}`] = {
        id: `pillar-${i}`,
        name: `🌡️ 立体温湿立柱 #${i} (8.1m垂直测温)`,
        l1_canopy_temp: +(22.6 + Math.random() * 0.4).toFixed(1),
        l1_canopy_rh: Math.round(67 + Math.random() * 3),
        l2_middle_temp: +(24.8 + Math.random() * 0.5).toFixed(1),
        l2_middle_rh: Math.round(61 + Math.random() * 3),
        l3_ridge_temp: +(29.2 + Math.random() * 0.6).toFixed(1),
        l3_ridge_rh: Math.round(53 + Math.random() * 3),
        deltaT: 0
      };
      state.pillars[`pillar-${i}`].deltaT = +(state.pillars[`pillar-${i}`].l3_ridge_temp - state.pillars[`pillar-${i}`].l1_canopy_temp).toFixed(1);
    }
  }
};
