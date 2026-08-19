/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * 视图 2: 🐟 水产养殖指挥台 (养殖长 / 现场作业)
 * =========================================================================
 */
window.ViewTemplates = window.ViewTemplates || {};
window.ViewTemplates['view-aquaculture'] = `
    <!-- ----------------------------------------------------------------------- -->
    <!-- 视图 2: 🐟 水产养殖指挥台 (养殖长) -->
    <!-- ----------------------------------------------------------------------- -->
    <div id="view-aquaculture" class="view-panel hidden space-y-6">
      
      <!-- 10座圆形RAS养殖鱼池在线巡检与独立测控选择大盘 -->
      <div class="glass-card rounded-2xl p-4 border border-emerald-200 shadow-md space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 pb-3">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">🐟</span>
            <div>
              <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
                10座圆形 RAS 养殖鱼池在线巡检调度
                <span id="aqua-active-tank-badge" class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold">
                  当前监测: #01 加州鲈鱼成鱼池
                </span>
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">点击下方任意鱼池，即可切换该池专属实时水质（DO/TAN/pH/水温）、AI 抢食视频与生物量估重</p>
            </div>
          </div>

          <div class="flex items-center gap-2 text-xs font-mono">
            <span class="flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              全厂鱼池: 10/10 在线
            </span>
          </div>
        </div>

        <!-- 10 个鱼池快速状态选择芯片矩阵 -->
        <div id="aqua-tank-selector-matrix" class="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 font-mono text-xs">
          <!-- 动态由 data-engine.js 实时渲染 -->
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div id="card-do" class="glass-card rounded-2xl p-5 glass-card-hover border-l-4 border-emerald-500 relative overflow-hidden">
          <div class="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span class="font-bold text-slate-900 flex items-center gap-1.5">
              <span>🫧</span> 溶解氧 (DO)
            </span>
            <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">光学荧光法</span>
          </div>
          <div class="flex items-baseline gap-2 mt-2">
            <span id="val-do" class="text-4xl font-black text-slate-900 font-mono tracking-tight">6.85</span>
            <span class="text-sm text-slate-500 font-mono">mg/L</span>
          </div>
          <div class="mt-3 flex items-center justify-between text-xs text-slate-600 border-t border-emerald-100 pt-2 font-mono">
            <span>安全区间: 5.0 ~ 8.0</span>
            <span class="text-teal-700 flex items-center gap-1 font-bold">
              <span class="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              吹扫倒计时: 02:45:12
            </span>
          </div>
        </div>

        <div id="card-tan" class="glass-card rounded-2xl p-5 glass-card-hover border-l-4 border-teal-500">
          <div class="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span class="font-bold text-slate-900 flex items-center gap-1.5">
              <span>🧪</span> 总氨氮 (TAN)
            </span>
            <span class="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-mono text-xs font-bold">离子选择电极</span>
          </div>
          <div class="flex items-baseline gap-2 mt-2">
            <span id="val-tan" class="text-4xl font-black text-teal-800 font-mono tracking-tight">0.82</span>
            <span class="text-sm text-slate-500 font-mono">mg/L</span>
          </div>
          <div class="mt-3 flex items-center justify-between text-xs text-slate-600 border-t border-emerald-100 pt-2 font-mono">
            <span>安全阈值: &lt; 1.50</span>
            <span class="text-emerald-700 font-bold">水质优良</span>
          </div>
        </div>

        <div id="card-uia" class="glass-card rounded-2xl p-5 glass-card-hover border-l-4 border-emerald-600">
          <div class="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span class="font-bold text-slate-900 flex items-center gap-1.5">
              <span>☣️</span> 游离有毒氨 (UIA / NH₃)
            </span>
            <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">理论模型反演</span>
          </div>
          <div class="flex items-baseline gap-2 mt-2">
            <span id="val-uia" class="text-4xl font-black text-cyan-800 font-mono tracking-tight">0.012</span>
            <span class="text-sm text-slate-500 font-mono">mg/L</span>
          </div>
          <div class="mt-3 flex items-center justify-between text-xs text-slate-600 border-t border-emerald-100 pt-2 font-mono">
            <span>致死红线: &gt; 0.050</span>
            <span class="text-emerald-700 font-bold">安全 (pKa=9.24)</span>
          </div>
        </div>

        <div class="glass-card rounded-2xl p-5 glass-card-hover border-l-4 border-teal-600">
          <div class="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span class="font-bold text-slate-900 flex items-center gap-1.5">
              <span>🌡️</span> pH 酸碱度 / 水温
            </span>
            <span class="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-mono text-xs font-bold">复合电极流通槽</span>
          </div>
          <div class="flex items-center justify-between mt-2 font-mono">
            <div>
              <span class="text-xs text-slate-500 block font-sans">pH 酸碱度</span>
              <span id="val-ph" class="text-2xl font-black text-slate-900">6.82</span>
            </div>
            <div class="h-8 w-px bg-slate-200"></div>
            <div>
              <span class="text-xs text-slate-500 block font-sans">水温 (°C)</span>
              <span id="val-temp" class="text-2xl font-black text-teal-800">23.5</span>
            </div>
          </div>
          <div class="mt-3 flex items-center justify-between text-xs text-slate-600 border-t border-emerald-100 pt-2 font-mono">
            <span>流速: 0.8 L/min (稳流)</span>
            <button onclick="openCalibrationModal()" class="text-emerald-700 hover:underline font-bold">SOP标定</button>
          </div>
        </div>

      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div class="lg:col-span-7 glass-card rounded-2xl p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div>
              <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <span>📈</span> 鱼池 24h 水质在线监测与硬互锁曲线
              </h3>
              <p class="text-xs text-slate-500 mt-1">实时绘制深圳国数全不锈钢 DO (mg/L) 与 塞恩在线氨氮 (mg/L)</p>
            </div>
            <div class="flex items-center gap-2 text-xs font-mono">
              <span class="flex items-center gap-1 text-emerald-700 font-bold"><span class="w-2 h-2 rounded-full bg-emerald-500"></span>溶氧 DO</span>
              <span class="flex items-center gap-1 text-teal-700 font-bold"><span class="w-2 h-2 rounded-full bg-teal-500"></span>总氨氮 TAN</span>
            </div>
          </div>
          <div class="h-64 w-full">
            <canvas id="chart-water-quality"></canvas>
          </div>
        </div>

        <div class="lg:col-span-5 glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div class="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div>
              <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <span>🐟</span> AI 摄食强度识别与双目点云估重
              </h3>
              <p class="text-xs text-slate-500 mt-1">海康 1080P PoE 枪机 + YOLO11 鱼群聚拢度热力分析</p>
            </div>
            <span class="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold">
              投喂中 (抢食中)
            </span>
          </div>

          <div class="relative bg-slate-900 rounded-xl overflow-hidden border border-slate-700 aspect-video flex items-center justify-center">
            <canvas id="canvas-fish" class="w-full h-full"></canvas>
            <div id="aqua-cam-title" class="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur px-2.5 py-1 rounded text-xs font-mono text-emerald-300">
              Cam #01: 鱼池#01 (加州鲈鱼成鱼池) 抢食监测 [1080P/25FPS]
            </div>
            <div class="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur px-2.5 py-1 rounded text-xs font-mono text-white flex items-center gap-2">
              <span>聚拢度: <strong class="text-emerald-400">88.4%</strong></span>
              <span>•</span>
              <span>落料刹车阈值: 40%</span>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3 text-center font-mono text-xs">
            <div class="p-3 bg-emerald-50/80 rounded-lg border border-emerald-200">
              <span class="text-slate-500 text-xs block font-sans">双目估算均重</span>
              <span class="text-base font-black text-slate-900"><span id="aqua-avg-weight">825</span> <span class="text-xs font-normal text-slate-400">g/尾</span></span>
            </div>
            <div class="p-3 bg-emerald-50/80 rounded-lg border border-emerald-200">
              <span class="text-slate-500 text-xs block font-sans">池内总生物量</span>
              <span class="text-base font-black text-teal-800"><span id="aqua-biomass">4,125</span> <span class="text-xs font-normal text-slate-400">kg</span></span>
            </div>
            <div class="p-3 bg-emerald-50/80 rounded-lg border border-emerald-200">
              <span class="text-slate-500 text-xs block font-sans">距上市规格</span>
              <span class="text-base font-black text-amber-700"><span id="aqua-days-to-market">18</span> <span class="text-xs font-normal text-slate-400">天</span></span>
            </div>
          </div>

        </div>

      </div>

    </div>
`;
