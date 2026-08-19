/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * charts.js: 全局图表绘制引擎 (Chart.js 纯白生机绿微渐变适配)
 * =========================================================================
 */

const AppCharts = {
  cashflow: null,
  waterQuality: null,
  energyTOU: null,
  pumpWavelet: null,
  radarBases: null,
  atpForecast: null,
  qualityRadar: null,

  /**
   * 初始化所有核心图表
   */
  initAll() {
    this.initCashflowHedge();
    this.initWaterQuality();
    this.initEnergyTOU();
    this.initPumpWavelet();
    this.initRadarBases();
    this.initATPForecast();
    this.initQualityRadar();
  },

  /**
   * 1. 跨周期快慢资产现金流对冲模型 (投资人视角)
   */
  initCashflowHedge() {
    const ctx = document.getElementById('chart-cashflow')?.getContext('2d');
    if (!ctx) return;

    this.cashflow = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月 (鳕鱼起捕)'],
        datasets: [
          {
            label: '30天蔬菜高频销售现金流入 (万元/月)',
            data: [6.2, 6.5, 6.8, 7.0, 7.2, 7.1, 6.9, 7.3, 7.5, 7.8, 8.0, 8.2],
            borderColor: '#059669',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            fill: true,
            tension: 0.3
          },
          {
            label: '鱼类饲料与电费刚性支出 (万元/月)',
            data: [3.8, 4.0, 4.2, 4.5, 4.8, 5.0, 5.2, 5.5, 5.8, 6.0, 6.2, 6.5],
            borderColor: '#d97706',
            borderDash: [5, 5],
            tension: 0.3
          },
          {
            label: '净累积现金流储备 (万元)',
            data: [2.4, 4.9, 7.5, 10.0, 12.4, 14.5, 16.2, 18.0, 19.7, 21.5, 23.3, 48.5],
            borderColor: '#0284c7',
            borderWidth: 3,
            tension: 0.2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#334155', font: { family: 'JetBrains Mono', size: 11, weight: 'bold' } }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(16, 185, 129, 0.12)' }, ticks: { color: '#475569', font: { weight: '500' } } },
          y: { grid: { color: 'rgba(16, 185, 129, 0.12)' }, ticks: { color: '#475569', font: { weight: '500' } } }
        }
      }
    });
  },

  /**
   * 2. 鱼池 24h 水质在线监测曲线 (养殖长视角)
   */
  initWaterQuality() {
    const ctx = document.getElementById('chart-water-quality')?.getContext('2d');
    if (!ctx) return;

    this.waterQuality = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '当前'],
        datasets: [
          {
            label: '光学荧光法 DO (mg/L)',
            data: [7.2, 7.0, 6.8, 6.5, 6.9, 7.1, 6.8, 6.7, 6.85],
            borderColor: '#059669',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            yAxisID: 'y',
            tension: 0.3
          },
          {
            label: '在线总氨氮 TAN (mg/L)',
            data: [0.65, 0.70, 0.75, 0.85, 0.90, 0.88, 0.84, 0.81, 0.82],
            borderColor: '#0284c7',
            yAxisID: 'y1',
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#334155', font: { family: 'JetBrains Mono', size: 11, weight: 'bold' } }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(16, 185, 129, 0.12)' }, ticks: { color: '#475569', font: { weight: '500' } } },
          y: {
            type: 'linear',
            position: 'left',
            min: 2,
            max: 10,
            grid: { color: 'rgba(16, 185, 129, 0.12)' },
            ticks: { color: '#059669', font: { weight: 'bold' } }
          },
          y1: {
            type: 'linear',
            position: 'right',
            min: 0,
            max: 3,
            grid: { drawOnChartArea: false },
            ticks: { color: '#0284c7', font: { weight: 'bold' } }
          }
        }
      }
    });
  },

  /**
   * 3. 24h 分时电价 (TOU) 与 MPC 避峰套利负荷 (工程主管视角)
   */
  initEnergyTOU() {
    const ctx = document.getElementById('chart-energy-tou')?.getContext('2d');
    if (!ctx) return;

    this.energyTOU = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['00-06谷', '06-08平', '08-11峰', '11-14平', '14-17峰', '17-19尖', '19-22峰', '22-24谷'],
        datasets: [
          {
            type: 'line',
            label: '电网电价 (元/度)',
            data: [0.35, 0.68, 1.05, 0.68, 1.05, 1.28, 1.05, 0.35],
            borderColor: '#7c3aed',
            yAxisID: 'yPrice',
            borderWidth: 2
          },
          {
            type: 'bar',
            label: 'MPC 智能调度负荷 (kW)',
            data: [32.0, 18.0, 8.5, 16.0, 9.0, 4.5, 9.5, 28.0],
            backgroundColor: 'rgba(16, 185, 129, 0.65)',
            borderColor: '#059669',
            yAxisID: 'yPower'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#334155', font: { family: 'JetBrains Mono', size: 11, weight: 'bold' } }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(16, 185, 129, 0.12)' }, ticks: { color: '#475569', font: { weight: '500' } } },
          yPower: {
            type: 'linear',
            position: 'left',
            ticks: { color: '#059669', font: { weight: 'bold' } },
            title: { display: true, text: 'kW 负荷', color: '#059669' }
          },
          yPrice: {
            type: 'linear',
            position: 'right',
            ticks: { color: '#7c3aed', font: { weight: 'bold' } },
            grid: { drawOnChartArea: false },
            title: { display: true, text: '元/度', color: '#7c3aed' }
          }
        }
      }
    });
  },

  /**
   * 4. 主水泵小波谐波预测性维护频谱分析
   */
  initPumpWavelet() {
    const ctx = document.getElementById('chart-pump-wavelet')?.getContext('2d');
    if (!ctx) return;

    this.pumpWavelet = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['0Hz', '50Hz(基波)', '100Hz', '150Hz', '200Hz', '250Hz', '300Hz', '350Hz'],
        datasets: [{
          label: '主水泵电流 FFT 频谱能量 (dB)',
          data: [-45, 0, -38, -42, -49, -52, -55, -60],
          borderColor: '#059669',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(16, 185, 129, 0.12)' }, ticks: { color: '#475569' } },
          y: { grid: { color: 'rgba(16, 185, 129, 0.12)' }, ticks: { color: '#475569' } }
        }
      }
    });
  },

  /**
   * 5. 全国基地横向对标雷达图 (集团 COO 视角)
   */
  initRadarBases() {
    const ctx = document.getElementById('chart-radar-bases')?.getContext('2d');
    if (!ctx) return;

    this.radarBases = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['单位电耗产量(kg/kWh)', '每吨鱼水耗节水率', '单株优品率', 'SOP标准达标率', 'ATP商超履约率', 'MPC套利效益'],
        datasets: [
          {
            label: '苏州一号基地 (标杆示范)',
            data: [95, 96, 98, 99, 97, 92],
            borderColor: '#059669',
            backgroundColor: 'rgba(16, 185, 129, 0.25)',
            borderWidth: 2
          },
          {
            label: '成都二号基地',
            data: [88, 92, 90, 94, 91, 85],
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.2)',
            borderWidth: 2
          },
          {
            label: '北京三号基地',
            data: [82, 88, 86, 90, 89, 80],
            borderColor: '#7c3aed',
            backgroundColor: 'rgba(124, 58, 237, 0.2)',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#334155', font: { family: 'JetBrains Mono', size: 10, weight: 'bold' } } }
        },
        scales: {
          r: {
            angleLines: { color: 'rgba(16, 185, 129, 0.2)' },
            grid: { color: 'rgba(16, 185, 129, 0.15)' },
            pointLabels: { color: '#1e293b', font: { size: 10, weight: 'bold' } },
            ticks: { backdropColor: 'transparent', color: '#475569' }
          }
        }
      }
    });
  },

  /**
   * 6. 30 天可承诺量 (ATP) 产能大盘 (集团中台视角)
   */
  initATPForecast() {
    const ctx = document.getElementById('chart-atp-forecast')?.getContext('2d');
    if (!ctx) return;

    this.atpForecast = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['第3天', '第7天', '第10天', '第14天', '第18天', '第21天', '第25天', '第30天'],
        datasets: [
          {
            label: '模型预测精准可出货量 (kg/天)',
            data: [1200, 1350, 1500, 1480, 1620, 1800, 1750, 1900],
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.12)',
            fill: true,
            tension: 0.3
          },
          {
            label: '已锁定商超期货订单 (kg/天)',
            data: [1100, 1250, 1380, 1300, 1450, 1600, 1500, 1650],
            borderColor: '#059669',
            borderDash: [4, 4],
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#334155', font: { family: 'JetBrains Mono', size: 11, weight: 'bold' } } }
        },
        scales: {
          x: { grid: { color: 'rgba(16, 185, 129, 0.12)' }, ticks: { color: '#475569', font: { weight: '500' } } },
          y: { grid: { color: 'rgba(16, 185, 129, 0.12)' }, ticks: { color: '#475569', font: { weight: '500' } } }
        }
      }
    });
  },

  /**
   * 7. 6 维出厂品质与营养安全对比雷达图 (品质主管视角)
   */
  initQualityRadar() {
    const ctx = document.getElementById('chart-quality-radar')?.getContext('2d');
    if (!ctx) return;

    this.qualityRadar = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: [
          '低硝酸盐控制 (<800mg/kg)',
          '62项化学农残 0检出',
          '水产抗生素/孔雀石绿 0检出',
          '维生素 C 超额富集 (+110%)',
          '可溶性糖度鲜甜 (≥4.0°Bx)',
          '活水无土腥味 (<10ng/kg)'
        ],
        datasets: [
          {
            label: '鱼菜共生驻厂实验室实测',
            data: [98, 100, 100, 96, 94, 98],
            borderColor: '#059669',
            backgroundColor: 'rgba(16, 185, 129, 0.28)',
            pointBackgroundColor: '#059669',
            pointBorderColor: '#ffffff',
            pointHoverBackgroundColor: '#ffffff',
            pointHoverBorderColor: '#059669',
            borderWidth: 2.5,
            pointRadius: 4
          },
          {
            label: '普通大棚/传统农业基准',
            data: [45, 60, 50, 48, 55, 62],
            borderColor: '#94a3b8',
            backgroundColor: 'rgba(148, 163, 184, 0.14)',
            borderDash: [4, 4],
            borderWidth: 1.5,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 8, bottom: 8, left: 10, right: 10 }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#334155',
              font: { family: 'JetBrains Mono, PingFang SC, sans-serif', size: 11, weight: 'bold' },
              padding: 12
            }
          }
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 25,
              backdropColor: 'transparent',
              color: '#64748b',
              font: { size: 9, weight: '600' }
            },
            angleLines: { color: 'rgba(16, 185, 129, 0.25)' },
            grid: { color: 'rgba(16, 185, 129, 0.16)' },
            pointLabels: {
              color: '#0f172a',
              font: { family: 'PingFang SC, sans-serif', size: 11, weight: 'bold' },
              padding: 6
            }
          }
        }
      }
    });
  },

  /**
   * 角色切换时自适应重置图表大小
   */
  resizeForRole(roleId) {
    if (roleId === 'investor' && this.cashflow) this.cashflow.resize();
    if (roleId === 'aquaculture' && this.waterQuality) this.waterQuality.resize();
    if (roleId === 'energy') {
      if (this.energyTOU) this.energyTOU.resize();
      if (this.pumpWavelet) this.pumpWavelet.resize();
    }
    if (roleId === 'executive') {
      if (this.radarBases) this.radarBases.resize();
      if (this.atpForecast) this.atpForecast.resize();
    }
    if (roleId === 'quality' && this.qualityRadar) {
      this.qualityRadar.resize();
    }
  }
};
