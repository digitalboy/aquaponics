/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * 视图 9: 🔬 品质检验与实验室中台 (品质主管专属独立工作台)
 * =========================================================================
 */
window.ViewTemplates = window.ViewTemplates || {};
window.ViewTemplates['view-quality'] = `
    <!-- ----------------------------------------------------------------------- -->
    <!-- 视图 9: 🔬 品质检验与实验室中台 (品质主管专属独立工作台) -->
    <!-- ----------------------------------------------------------------------- -->
    <div id="view-quality" class="view-panel hidden space-y-6">
      
      <!-- 1. 四大核心品质与实验室 Hero 大卡 (Quality & Lab Core KPIs) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <!-- 🛡️ 出厂批次合格放行率 -->
        <div class="glass-card rounded-2xl p-5 border-2 border-emerald-300 shadow-md bg-gradient-to-br from-emerald-50/90 to-white space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 font-bold font-sans">🛡️ 出厂批次合格放行率</span>
            <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">100% 满分标杆</span>
          </div>
          <div class="flex items-baseline gap-2">
            <strong class="text-2xl font-black text-slate-900 font-mono">100.0%</strong>
            <span class="text-xs text-slate-500 font-sans">/ 128 批次放行</span>
          </div>
          <p class="text-xs text-emerald-700 font-mono">近30天 0 质量客诉 · 0 批次退货</p>
        </div>

        <!-- 🥬 母婴级低硝酸盐均值 -->
        <div class="glass-card rounded-2xl p-5 border-2 border-teal-300 shadow-md bg-gradient-to-br from-teal-50/90 to-white space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 font-bold font-sans">🥬 母婴级低硝酸盐严选均值</span>
            <span class="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold">特级优选</span>
          </div>
          <div class="flex items-baseline gap-2">
            <strong class="text-2xl font-black text-slate-900 font-mono">620.5</strong>
            <span class="text-xs text-slate-500 font-sans">mg/kg (限值 &lt; 800)</span>
          </div>
          <p class="text-xs text-teal-700 font-mono">较欧盟标准 (3000~4000) 降低 82%</p>
        </div>

        <!-- 🧪 农残与水产抗生素 -->
        <div class="glass-card rounded-2xl p-5 border-2 border-purple-300 shadow-md bg-gradient-to-br from-purple-50/90 to-white space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 font-bold font-sans">🧪 化学农药与抗生素多残留</span>
            <span class="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-mono font-bold">0 容忍标准</span>
          </div>
          <div class="flex items-baseline gap-2">
            <strong class="text-2xl font-black text-purple-700 font-mono">0 检出</strong>
            <span class="text-xs text-slate-500 font-sans">/ 62 项农残 + 4项抗生素</span>
          </div>
          <p class="text-xs text-purple-700 font-mono">孔雀石绿 0 · 氯霉素 0 · 土腥味 &lt; 10ng</p>
        </div>

        <!-- ⚙️ 实验室仪器标定就绪率 -->
        <div class="glass-card rounded-2xl p-5 border-2 border-indigo-300 shadow-md bg-gradient-to-br from-indigo-50/90 to-white space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 font-bold font-sans">⚙️ 实验室仪器标定就绪率</span>
            <span class="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-mono font-bold">R² = 0.9998</span>
          </div>
          <div class="flex items-baseline gap-2">
            <strong class="text-2xl font-black text-indigo-700 font-mono">6 / 6 台</strong>
            <span class="text-xs text-slate-500 font-sans">在线已校准</span>
          </div>
          <p class="text-xs text-slate-600 font-mono">分光光度计 · 糖度计 · 质构仪全在线</p>
        </div>

      </div>

      <!-- 2. 中层双栏：左侧 驻厂实验室核心仪器台账 (6列) + 右侧 4°C留样室与双维度指标对标 (6列) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- 左侧: 驻厂实验室核心仪器台账与实时校准状态 (6列) -->
        <div class="lg:col-span-6 glass-card rounded-2xl p-5 border border-emerald-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg shadow-md shadow-emerald-500/20">
                🔬
              </div>
              <div>
                <h4 class="font-extrabold text-slate-900 text-sm">驻厂理化与微生物快检实验室仪器台账</h4>
                <p class="text-xs text-slate-500 mt-0.5">每日开机自动进行零点基准校正与标样对比 • 数据直连 LIMS</p>
              </div>
            </div>
            <span class="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
              LIMS 实时互联
            </span>
          </div>

          <!-- 仪器芯片网格 (2x3) -->
          <div id="quality-instruments-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-sans text-xs">
            <!-- 由 data-engine.js 动态渲染 -->
          </div>
        </div>

        <!-- 右侧: 6维出厂品质与营养安全实测对标雷达 (高定大图) + 4°C 留样观察室 (6列) -->
        <div class="lg:col-span-6 glass-card rounded-2xl p-5 border border-teal-200 shadow-sm space-y-4 flex flex-col justify-between">
          
          <!-- 头部标题栏 -->
          <div class="flex items-center justify-between border-b border-teal-100 pb-3">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center text-lg shadow-md shadow-teal-600/20">
                💎
              </div>
              <div>
                <h4 class="font-extrabold text-slate-900 text-sm">6维出厂品质与营养安全实测对标雷达</h4>
                <p class="text-xs text-slate-500 mt-0.5">覆盖安全红线与超额活性营养指标 · 综合品质评分 97.8 / 100</p>
              </div>
            </div>
            <span class="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
              超额溢价支撑
            </span>
          </div>

          <!-- 🌟 满幅高清水晶雷达图 (高度 320px，宽裕呼吸空间) -->
          <div class="h-80 w-full relative flex items-center justify-center px-2 py-1">
            <canvas id="chart-quality-radar"></canvas>
          </div>

          <!-- 底部：4°C 留样观察室与 5 天货架期衰减精细化监控条 -->
          <div class="p-3 bg-gradient-to-r from-teal-50/90 to-emerald-50/90 rounded-xl border border-teal-200 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-extrabold text-slate-900 flex items-center gap-1.5 font-sans">
                <span>❄️</span> 4°C 留样观察室 (72~120h 货架期跟踪)
              </span>
              <span id="quality-room-alert" class="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                🟢 恒温恒湿正常 (无结露/无冷害)
              </span>
            </div>
            
            <div class="grid grid-cols-3 gap-2 font-mono text-xs text-center">
              <div class="p-2 bg-white/95 rounded-lg border border-teal-100 shadow-2xs">
                <span class="text-slate-500 font-sans block text-xs">库房温湿度</span>
                <span id="quality-room-temp" class="text-sm font-black text-slate-900">4.1°C</span>
                <span id="quality-room-rh" class="text-xs text-teal-700 font-sans block">86%RH (恒湿)</span>
              </div>
              <div class="p-2 bg-white/95 rounded-lg border border-teal-100 shadow-2xs">
                <span class="text-slate-500 font-sans block text-xs">在库留样批次</span>
                <span id="quality-room-count" class="text-sm font-black text-slate-900">48 批次</span>
                <span class="text-xs text-slate-500 font-sans block">全周期溯源</span>
              </div>
              <div class="p-2 bg-white/95 rounded-lg border border-teal-100 shadow-2xs">
                <span class="text-slate-500 font-sans block text-xs">5天平均失重率</span>
                <span id="quality-room-weightloss" class="text-sm font-black text-emerald-700">1.85%</span>
                <span class="text-xs text-emerald-600 font-sans block">微气调锁鲜</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- 3. 🔄 生产过程动态质检与前置农艺干预工作台 (IPQC In-Process Quality Gates & Preemptive Control) -->
      <div class="glass-card rounded-2xl p-6 border-2 border-emerald-300 shadow-md space-y-4 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-xl shadow-md shadow-emerald-600/30">
              🔄
            </div>
            <div>
              <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
                生产过程动态质检与前置农艺干预工作台 (IPQC 前道防线)
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold">
                  拒绝事后报废 · 预防为主
                </span>
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                在苗期移栽、生长旺期、采收冲刺前48h与水产起捕前7天关键节点提前抽检，自动联动环控下发增糖、降硝与吊水指令
              </p>
            </div>
          </div>
          <span class="px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold border border-teal-300">
            4 大生长节点实时受控
          </span>
        </div>

        <!-- 过程质检动态卡片网格 (2x2) -->
        <div id="in-process-qc-stream" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- 由 data-engine.js 动态渲染 -->
        </div>
      </div>

      <!-- 4. 下层双栏：左侧 每日出厂批次检验与 e-COA 电子放行工作台 (7列) + 右侧 质量 CAPA 纠偏工单流 (5列) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- 左侧：每日出厂批次双维度抽检与放行工作台表 (7列) -->
        <div class="lg:col-span-7 glass-card rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2">
              <span class="text-base">📋</span>
              <h4 class="font-extrabold text-slate-900 text-sm">出厂成品批次双维度理化终检与 e-COA 放行工作台 (OQC)</h4>
            </div>
            <span class="text-xs text-purple-800 bg-purple-100 font-mono font-bold px-2.5 py-1 rounded-lg border border-purple-300">
              品质主管 · 一票否决权
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 text-slate-500 font-sans text-xs border-b border-slate-200">
                  <th class="py-2.5 px-3">批次号 / 品类 / 来源</th>
                  <th class="py-2.5 px-3">采收 / 化验时刻</th>
                  <th class="py-2.5 px-3">安全指标 (硝酸盐/农残/重金属)</th>
                  <th class="py-2.5 px-3">营养风味 (维C/糖度/蛋白)</th>
                  <th class="py-2.5 px-3">放行状态 / e-COA 证书</th>
                  <th class="py-2.5 px-3 text-right">质检报告 / 放行操作</th>
                </tr>
              </thead>
              <tbody id="quality-batches-tbody">
                <!-- JavaScript 动态渲染 -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- 右侧：质量 CAPA (纠正与预防措施) 闭环跟踪工单流 (5列) -->
        <div class="lg:col-span-5 glass-card rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3.5 flex flex-col justify-start">
          <div class="border-b border-slate-100 pb-3 space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-base">🛠️</span>
                <h4 class="font-extrabold text-slate-900 text-sm">质量 CAPA (纠偏与预防) 闭环联动中枢</h4>
              </div>
              <span class="text-xs text-purple-700 font-mono font-bold bg-purple-100 px-2 py-0.5 rounded border border-purple-300">
                农艺/养殖闭环
              </span>
            </div>
            <p class="text-xs text-slate-500">检测到指标微小偏离时，一键向种植长或养殖长下发纠偏指令，形成闭环持续优化</p>
            
            <div class="flex items-center justify-between pt-1 text-xs font-mono">
              <span class="text-slate-500 font-sans">工单状态统计:</span>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">⚡ 待下发: 2 起</span>
                <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">✅ 已闭环: 2 起</span>
              </div>
            </div>
          </div>

          <div id="quality-capa-stream" class="space-y-3 overflow-y-auto max-h-[460px] pr-1 flex-1">
            <!-- JavaScript 动态渲染 CAPA 工单流 -->
          </div>
        </div>

      </div>

    </div>
`;
