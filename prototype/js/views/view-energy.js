/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * 视图 4: ⚡ 工程能耗与预测维护 (工程主管 / 设施维保)
 * =========================================================================
 */
window.ViewTemplates = window.ViewTemplates || {};
window.ViewTemplates['view-energy'] = `
    <!-- ----------------------------------------------------------------------- -->
    <!-- 视图 4: ⚡ 工程能耗与预测维护 (工程主管) -->
    <!-- ----------------------------------------------------------------------- -->
    <div id="view-energy" class="view-panel hidden space-y-6">
      
      <!-- 4 大能耗与运维核心指标大卡 (含近 1 小时用电量) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div class="glass-card rounded-2xl p-5 glass-card-hover border-l-4 border-amber-500">
          <div class="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span class="font-extrabold text-slate-900 text-sm">⚡ 全厂总有功功率</span>
            <span class="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-xs font-bold">威胜 0.5S 级</span>
          </div>
          <div class="text-3xl font-black text-slate-900 font-mono tracking-tight mt-2">
            <span id="energy-live-power">18.45</span> <span class="text-xs font-sans text-slate-500 font-normal">kW</span>
          </div>
          <p class="text-xs text-slate-500 mt-2 font-mono">三相平衡度: <strong class="text-slate-800">98.4%</strong> • PF: <strong class="text-slate-800">0.962</strong></p>
        </div>

        <div class="glass-card rounded-2xl p-5 glass-card-hover border-l-4 border-emerald-500 bg-emerald-50/30">
          <div class="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span class="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <span>🔋</span> 近 1 小时用电量 (1h kWh)
            </span>
            <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">实时积分</span>
          </div>
          <div class="flex items-baseline gap-2 mt-2">
            <span id="energy-1h-kwh" class="text-3xl font-black text-emerald-700 font-mono tracking-tight">18.25</span>
            <span class="text-xs font-sans text-slate-500 font-normal">kWh (度)</span>
          </div>
          <div class="mt-2.5 pt-1.5 border-t border-emerald-100 flex items-center justify-between text-xs font-mono text-slate-600">
            <span>折合电费: <strong id="energy-1h-cost" class="text-slate-900 font-bold">¥12.41</strong></span>
            <span class="text-emerald-700 font-bold">平段 (¥0.68/度)</span>
          </div>
        </div>

        <div class="glass-card rounded-2xl p-5 glass-card-hover border-l-4 border-purple-500">
          <div class="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span class="font-extrabold text-slate-900 text-sm">💰 今日累计电费 / 避峰节电</span>
            <span class="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-xs font-bold">MPC 策略</span>
          </div>
          <div class="text-3xl font-black text-purple-700 font-mono tracking-tight mt-2">
            ¥218.5 <span class="text-xs font-sans text-slate-500 font-normal">元</span>
          </div>
          <div class="mt-2.5 pt-1.5 border-t border-purple-100 flex items-center justify-between text-xs font-mono text-slate-600">
            <span>避峰节约: <strong class="text-purple-700 font-bold">¥48.2 (18.1%)</strong></span>
            <span class="text-slate-500">谷电蓄能对冲</span>
          </div>
        </div>

        <div class="glass-card rounded-2xl p-5 glass-card-hover border-l-4 border-teal-500">
          <div class="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span class="font-extrabold text-slate-900 text-sm">⚙️ 主水泵预测性健康度</span>
            <span class="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-mono text-xs font-bold">小波谐波分析</span>
          </div>
          <div class="text-3xl font-black text-teal-800 font-mono tracking-tight mt-2">
            96.8%
          </div>
          <p class="text-xs text-slate-500 mt-2 font-mono">无轴承偏心与叶轮气蚀异动</p>
        </div>

      </div>

      <!-- 📡 边缘网关近 1 小时 IIoT 宽表通信流速与丢包率条 -->
      <div class="p-3.5 bg-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-md">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="font-bold text-slate-200">📡 边缘网关近 1 小时遥测吞吐:</span>
          <strong class="text-emerald-400">720 帧 5s 宽表 (92,160 测点时序数据)</strong>
        </div>
        <div class="flex items-center gap-4 flex-wrap text-slate-300">
          <span>压缩流量: <strong class="text-teal-300">1.85 MB</strong> (上行占用 &lt; 0.1%)</span>
          <span>485 链路 CRC 丢包率: <strong class="text-emerald-400 font-bold">0.00% (极优)</strong></span>
          <span>网关本地缓存: <strong class="text-slate-200">128G SSD 就绪</strong></span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div class="lg:col-span-7 glass-card rounded-2xl p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div>
              <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <span>⚡</span> 24h 分时电价 (TOU) 与 MPC 避峰套利负荷曲线
              </h3>
              <p class="text-xs text-slate-500 mt-1">利用水体热容深夜谷电超前蓄热，尖峰时段关闭热泵节约电费 22%</p>
            </div>
            <span class="text-xs text-purple-700 font-mono font-bold bg-purple-100 px-2 py-0.5 rounded">MPC 策略运行中</span>
          </div>
          <div class="h-64 w-full">
            <canvas id="chart-energy-tou"></canvas>
          </div>
        </div>

        <div class="lg:col-span-5 glass-card rounded-2xl p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div>
              <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <span>🩺</span> 主循环泵谐波小波变换 (拒绝对断流停机)
              </h3>
              <p class="text-xs text-slate-500 mt-1">实时捕捉微弱电流异动，提前 14 天预警更换</p>
            </div>
            <span class="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold">
              无故障
            </span>
          </div>

          <div class="h-44 w-full">
            <canvas id="chart-pump-wavelet"></canvas>
          </div>

          <div class="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs font-sans space-y-1.5">
            <div class="flex justify-between text-slate-700"><span>额定功率 / 运行电流:</span> <strong class="text-slate-900 font-mono">3.0 kW / 6.2 A</strong></div>
            <div class="flex justify-between text-slate-700"><span>3次/5次谐波总畸变 (THD):</span> <strong class="text-emerald-700 font-mono">1.8% (国标 &lt; 5%)</strong></div>
            <div class="flex justify-between text-slate-700"><span>下次预防性保养建议:</span> <strong class="text-teal-700 font-mono">2026-10-15 (45天后)</strong></div>
          </div>
        </div>

      </div>

      <!-- 🔌 全厂主要动力设备 24h 运行时序甘特图与台时调度 (水泵/风机/热泵时段开停追溯) -->
      <div class="glass-card rounded-2xl p-6 border border-emerald-200 shadow-md space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 pb-3">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🔌</span>
            <div>
              <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
                全厂主要动力设备 24h 运行时序甘特图与台时调度
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold">
                  24h 全量时段追溯 · 1主1备轮换
                </span>
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">精确追溯水泵、微孔曝气风机与热泵在 8 个分时电价时段（谷/平/峰/尖峰）的实际开停状态，核验尖峰避峰效果并保障生物断流死线</p>
            </div>
          </div>

          <div class="flex items-center gap-3 text-xs font-mono">
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-emerald-500"></span> 运行 (RUN)</span>
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-amber-400"></span> 避峰降频 (ECO)</span>
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-slate-200"></span> 停机待命 (IDLE)</span>
          </div>
        </div>

        <!-- 甘特图表格 -->
        <div class="overflow-x-auto">
          <table class="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr class="bg-emerald-50/80 text-slate-700 border-b border-emerald-200">
                <th class="py-2.5 px-3 font-bold font-sans">动力设备名称</th>
                <th class="py-2.5 px-2 text-center text-emerald-800">00-03<br><span class="text-xs font-normal text-emerald-600 font-sans">谷(¥0.35)</span></th>
                <th class="py-2.5 px-2 text-center text-emerald-800">03-06<br><span class="text-xs font-normal text-emerald-600 font-sans">谷(¥0.35)</span></th>
                <th class="py-2.5 px-2 text-center text-teal-800">06-09<br><span class="text-xs font-normal text-teal-600 font-sans">平(¥0.68)</span></th>
                <th class="py-2.5 px-2 text-center text-amber-800">09-12<br><span class="text-xs font-normal text-amber-600 font-sans">峰(¥1.05)</span></th>
                <th class="py-2.5 px-2 text-center text-teal-800">12-15<br><span class="text-xs font-normal text-teal-600 font-sans">平(¥0.68)</span></th>
                <th class="py-2.5 px-2 text-center text-teal-800">15-18<br><span class="text-xs font-normal text-teal-600 font-sans">平(¥0.68)</span></th>
                <th class="py-2.5 px-2 text-center text-rose-800 font-bold bg-rose-50/70">18-21<br><span class="text-xs font-normal text-rose-600 font-sans">尖峰(¥1.28)</span></th>
                <th class="py-2.5 px-2 text-center text-teal-800">21-24<br><span class="text-xs font-normal text-teal-600 font-sans">平(¥0.68)</span></th>
                <th class="py-2.5 px-3 text-right font-sans font-bold">当日台时</th>
                <th class="py-2.5 px-3 font-sans font-bold">当前状态 / 轮换策略</th>
              </tr>
            </thead>
            <tbody id="equipment-timeline-tbody" class="divide-y divide-emerald-100">
              <!-- 动态由 data-engine.js 渲染 -->
            </tbody>
          </table>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 border-t border-emerald-100 pt-3 font-sans">
          <span>⚙️ 1主1备轮换规则：每天 08:00 自动执行倒闸切换，确保备用泵轴承润滑且无水锈卡死</span>
          <span class="font-mono">累计运行台时精度: ±1分钟 • PLC 触点硬件反馈</span>
        </div>
      </div>

    </div>
`;
