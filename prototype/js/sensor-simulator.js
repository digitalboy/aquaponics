/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * sensor-simulator.js: 物理感知仿真与时序高频扰动引擎 (Sensor Simulator Engine)
 * =========================================================================
 */

const SensorSimulator = {
  /**
   * Emerson 游离有毒氨反演公式 (UIA / NH3)
   */
  calculateUIA(tank) {
    const pKa = 0.09018 + (2729.92 / (tank.waterTemp + 273.15));
    const factor = 1 / (Math.pow(10, pKa - tank.ph) + 1);
    tank.uia = +(tank.tan * factor).toFixed(3);
  },

  /**
   * 800ms 细密高频微扰动算法
   */
  tick(engine) {
    if (!engine || !engine.fishTanks) return;

    // 1. 鱼池水质微扰动
    Object.values(engine.fishTanks).forEach(tank => {
      const oldDO = tank.do;
      const oldTAN = tank.tan;

      const dDO = (Math.random() - 0.49) * 0.02;
      const dTAN = (Math.random() - 0.49) * 0.01;

      tank.do = +(Math.max(2.5, Math.min(9.5, tank.do + dDO))).toFixed(2);
      tank.tan = +(Math.max(0.2, Math.min(3.5, tank.tan + dTAN))).toFixed(2);
      tank.deltaDO = +(tank.do - oldDO).toFixed(2);
      tank.deltaTAN = +(tank.tan - oldTAN).toFixed(2);

      tank.ph = +(Math.max(6.5, Math.min(7.5, tank.ph + (Math.random() - 0.5) * 0.01))).toFixed(2);
      this.calculateUIA(tank);

      if (tank.purgeCountdownSec > 0) tank.purgeCountdownSec--;
      else tank.purgeCountdownSec = 14400;
    });

    // 2. 跑道根区与微气候扰动
    Object.values(engine.raceways).forEach(raceway => {
      raceway.rootDO = +(Math.max(4.2, Math.min(8.8, raceway.rootDO + (Math.random() - 0.49) * 0.02))).toFixed(2);
      raceway.vpd = +(Math.max(0.6, Math.min(1.6, raceway.vpd + (Math.random() - 0.5) * 0.01))).toFixed(2);
      raceway.ppfd = Math.round(raceway.ppfd + (Math.random() - 0.5) * 4);
      raceway.ec = +(Math.max(1.2, Math.min(2.5, raceway.ec + (Math.random() - 0.5) * 0.01))).toFixed(2);
    });

    // 3. 电力与配电柜参数
    engine.cabinetHV.totalPowerKw = +(18.3 + Math.random() * 0.35).toFixed(2);
    engine.cabinetHV.currentA = +(28.2 + Math.random() * 0.6).toFixed(1);
    engine.cabinetLV.dc24Voltage = +(24.15 + Math.random() * 0.06).toFixed(2);

    // 实时电流顶部 Badge 同步
    const headerCurrentEl = document.getElementById('header-live-current');
    if (headerCurrentEl) {
      headerCurrentEl.textContent = `${engine.cabinetHV.currentA} A`;
    }

    // 4. 室外微气象六要素实时微扰动与 DOM 刷新
    engine.weather.solarRadiation = Math.round(680 + (Math.random() - 0.5) * 15);
    engine.weather.tempOutdoor = +(31.0 + (Math.random() - 0.5) * 0.4).toFixed(1);
    engine.weather.rhOutdoor = Math.round(58 + (Math.random() - 0.5) * 2);
    engine.weather.windSpeed = +(3.4 + (Math.random() - 0.5) * 0.3).toFixed(1);

    const wTempEl = document.getElementById('weather-temp');
    if (wTempEl) wTempEl.textContent = `${engine.weather.tempOutdoor}°C`;
    const wRhEl = document.getElementById('weather-rh');
    if (wRhEl) wRhEl.textContent = `${engine.weather.rhOutdoor}%RH`;
    const wSolarEl = document.getElementById('weather-solar');
    if (wSolarEl) wSolarEl.textContent = `${engine.weather.solarRadiation} W/m²`;
    const wWindEl = document.getElementById('weather-wind');
    if (wWindEl) wWindEl.textContent = `${engine.weather.windSpeed}m/s 东南`;
    const wRainEl = document.getElementById('weather-rain');
    if (wRainEl) {
      if (engine.weather.rainSensorClosed) {
        wRainEl.textContent = '28.5mm 暴雨(天窗闭)';
        wRainEl.className = 'font-black text-rose-600 animate-pulse';
      } else {
        wRainEl.textContent = '0.0mm (无雨)';
        wRainEl.className = 'font-bold text-teal-700';
      }
    }

    // 5. 联动刷新养殖长与种植长视界 DOM
    if (engine.updateAquacultureViewMetrics) engine.updateAquacultureViewMetrics();
    if (engine.updateHydroponicsViewMetrics) engine.updateHydroponicsViewMetrics();

    // 6. 联动刷新矩阵
    if (engine.renderAquaTankMatrix) engine.renderAquaTankMatrix();
    if (engine.renderHydroRacewayMatrix) engine.renderHydroRacewayMatrix();

    // 7. 刷新能耗视图
    const pwrEl = document.getElementById('energy-live-power');
    if (pwrEl) pwrEl.textContent = engine.cabinetHV.totalPowerKw.toFixed(2);
    const kwhEl = document.getElementById('energy-1h-kwh');
    if (kwhEl) kwhEl.textContent = engine.energyRollup1h.kwh.toFixed(2);
    const costEl = document.getElementById('energy-1h-cost');
    if (costEl) costEl.textContent = `¥${engine.energyRollup1h.costYuan.toFixed(2)}`;

    // 8. 刷新 3D 全息 HUD
    if (engine.renderSelectedHUD) engine.renderSelectedHUD();
  },

  /**
   * 一键起飞：室内自主无人机定时航测巡检
   */
  triggerDroneLaunch(engine) {
    if (!engine || !engine.drone || engine.drone.status === 'FLYING') return;

    engine.drone.status = 'FLYING';
    engine.drone.dockStatus = '开盖起飞巡检中 (航线: 跑道A-D全景正射)';
    
    const dockStatusEl = document.getElementById('drone-dock-status');
    if (dockStatusEl) {
      dockStatusEl.textContent = '开盖巡检中 (空中航测)';
      dockStatusEl.className = 'text-teal-600 font-bold animate-pulse';
    }

    const btnEl = document.getElementById('btn-drone-launch');
    if (btnEl) {
      btnEl.innerHTML = '<span>🛰️</span> 航线正射扫描中...';
      btnEl.className = 'px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-md animate-pulse cursor-not-allowed';
    }

    // 触发 3D 数字孪生无人机巡航微动
    if (typeof DigitalTwin3D !== 'undefined' && DigitalTwin3D.animateDroneFlight) {
      DigitalTwin3D.animateDroneFlight();
    }

    setTimeout(() => {
      engine.drone.status = 'DOCKED';
      engine.drone.battery = 96;
      engine.drone.dockStatus = '已返航机巢 (无线快充中)';

      if (dockStatusEl) {
        dockStatusEl.textContent = '闭合充电中 (已生成全景拼图)';
        dockStatusEl.className = 'text-emerald-700 font-bold';
      }

      if (btnEl) {
        btnEl.innerHTML = '<span>🚀</span> 立即一键起飞巡检';
        btnEl.className = 'px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer transition shadow-md shadow-teal-500/25 flex items-center gap-1.5';
      }

      const batEl = document.getElementById('drone-battery');
      if (batEl) batEl.textContent = `${engine.drone.battery}%`;

      alert('🛸 巡检无人机 Alpha-01 已自主完成 #A~#D 跑道与 10 座鱼池 4K 正射拼图！已更新全场 24 孔位点云表型与 FLIR 热红外健康热力图。');
    }, 3500);
  }
};
