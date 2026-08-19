/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * 视图 6: 🚚 B2B 大客户与冷链履约中台 (B2B 业务经理专属独立工作台)
 * =========================================================================
 */
window.ViewTemplates = window.ViewTemplates || {};
window.ViewTemplates['view-b2b-fulfillment'] = `
    <!-- ----------------------------------------------------------------------- -->
    <!-- 视图 6: 🚚 B2B 大客户与冷链履约中台 (B2B 业务经理专属独立工作台) -->
    <!-- ----------------------------------------------------------------------- -->
    <div id="view-b2b-fulfillment" class="view-panel hidden space-y-6">
      
      <!-- 1. 四大核心 B2B 大客户与履约 Hero 大卡 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <!-- 🎯 准时足额交付率 (OTIF) -->
        <div class="glass-card rounded-2xl p-5 border-2 border-purple-300 shadow-md bg-gradient-to-br from-purple-50/90 to-white space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 font-bold font-sans">🎯 准时足额交付率 (OTIF)</span>
            <span class="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-mono font-bold">行业第 1</span>
          </div>
          <div class="flex items-baseline gap-2">
            <strong class="text-2xl font-black text-slate-900 font-mono">99.8%</strong>
            <span class="text-xs text-slate-500 font-sans">/ 100% 满分标杆</span>
          </div>
          <p class="text-[11px] text-purple-700 font-mono">近30天交付 128 批次 • 0 延误拒收</p>
        </div>

        <!-- 🚚 在途冷链恒温车次 -->
        <div class="glass-card rounded-2xl p-5 border-2 border-emerald-300 shadow-md bg-gradient-to-br from-emerald-50/90 to-white space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 font-bold font-sans">🚚 今日在途冷链履约中</span>
            <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold">全程 2~4°C</span>
          </div>
          <div class="flex items-baseline gap-2">
            <strong class="text-2xl font-black text-slate-900 font-mono">18</strong>
            <span class="text-xs text-slate-500 font-sans">车次 (14.2 吨菜/鱼)</span>
          </div>
          <p class="text-[11px] text-emerald-700 font-mono">北斗 GPS + 智能温湿度多点探针联动</p>
        </div>

        <!-- ⚡ B2B 商业客诉响应时效 -->
        <div class="glass-card rounded-2xl p-5 border-2 border-teal-300 shadow-md bg-gradient-to-br from-teal-50/90 to-white space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 font-bold font-sans">⚡ 商业客诉响应与换补货</span>
            <span class="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-mono font-bold">&lt;15分钟闭环</span>
          </div>
          <div class="flex items-baseline gap-2">
            <strong class="text-2xl font-black text-slate-900 font-mono">12.5</strong>
            <span class="text-xs text-slate-500 font-sans">分钟平均闭环</span>
          </div>
          <p class="text-[11px] text-teal-700 font-mono">前置仓跨厂紧急调拨 • 0 滞销扣款</p>
        </div>

        <!-- 👑 战略大客户年度长协 -->
        <div class="glass-card rounded-2xl p-5 border-2 border-amber-300 shadow-md bg-gradient-to-br from-amber-50/90 to-white space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 font-bold font-sans">👑 战略大客户年度长协</span>
            <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-mono font-bold">100% 续约</span>
          </div>
          <div class="flex items-baseline gap-2">
            <strong class="text-2xl font-black text-slate-900 font-mono">¥2,840</strong>
            <span class="text-xs text-slate-500 font-sans">万元在手年合约</span>
          </div>
          <p class="text-[11px] text-amber-700 font-mono">盒马 / 山姆 / 海底捞 / Ole' 定向包销</p>
        </div>

      </div>

      <!-- 2. 战略大客户年度包销跑道与跨基地物流多仓联动看板 (6:6 Grid) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- 左侧：战略大客户专属包销跑道与价格合约 -->
        <div class="lg:col-span-6 glass-card rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2">
              <span class="text-base">📑</span>
              <h4 class="font-extrabold text-slate-900 text-sm">战略大客户包销跑道与保供协议 (SLA)</h4>
            </div>
            <span class="text-xs font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">锁单率 91.2%</span>
          </div>

          <div class="space-y-2.5 font-sans text-xs">
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span class="font-extrabold text-slate-900 text-sm">🛒 盒马鲜生 (华东大区)</span>
                <span class="text-slate-500 text-xs block font-mono">专属包销 #A 跑道 (80% 奶油生菜) • 日供 850kg • ¥8.50/kg</span>
              </div>
              <span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-black text-xs">OTIF 100%</span>
            </div>

            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span class="font-extrabold text-slate-900 text-sm">🛒 山姆会员店 (华东总仓)</span>
                <span class="text-slate-500 text-xs block font-mono">专属包销 #B 跑道 (75% 罗马脆生菜) • 日供 1,200kg • ¥8.80/kg</span>
              </div>
              <span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-black text-xs">OTIF 99.8%</span>
            </div>

            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span class="font-extrabold text-slate-900 text-sm">🍲 海底捞 (华东中央厨房)</span>
                <span class="text-slate-500 text-xs block font-mono">专属包销 #01~#03 鲈鱼池 (加州鲈净菜) • 日供 600kg • ¥28.00/kg</span>
              </div>
              <span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-black text-xs">OTIF 100%</span>
            </div>

            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span class="font-extrabold text-slate-900 text-sm">🌿 Ole' 精品超市 (上海各门店)</span>
                <span class="text-slate-500 text-xs block font-mono">专属包销 #C 跑道 (无菌罗勒/芝麻菜) • 日供 350kg • ¥18.00/kg</span>
              </div>
              <span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-black text-xs">OTIF 99.5%</span>
            </div>
          </div>
        </div>

        <!-- 右侧：跨基地多仓在途冷链物流雷达与应急调拨路由 -->
        <div class="lg:col-span-6 glass-card rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2">
              <span class="text-base">🗺️</span>
              <h4 class="font-extrabold text-slate-900 text-sm">跨基地冷链多仓协同与防断供调拨路由</h4>
            </div>
            <span class="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">3基地联网调度</span>
          </div>

          <div class="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 space-y-2 text-xs font-sans">
            <div class="flex justify-between items-center text-slate-700">
              <span class="font-bold flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 🏭 苏州示范基地 (主力生产)</span>
              <span class="font-mono font-bold text-emerald-800">日产能 3.5 吨 (直配昆山/嘉兴)</span>
            </div>
            <div class="flex justify-between items-center text-slate-700">
              <span class="font-bold flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-teal-500"></span> 🏭 常州二期基地 (卫星协同)</span>
              <span class="font-mono font-bold text-teal-800">日产能 2.8 吨 (25分钟应急调拨响应)</span>
            </div>
            <div class="flex justify-between items-center text-slate-700">
              <span class="font-bold flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span> 🏭 无锡试验基地 (特种香草)</span>
              <span class="font-mono font-bold text-purple-800">日产能 1.2 吨 (定向包销高端餐饮)</span>
            </div>
            <div class="p-2.5 bg-white/90 rounded-lg border border-emerald-100 text-[11px] text-slate-600 leading-relaxed font-mono">
              🛡️ <strong>防断供安全阀:</strong> 系统实时维持 15% 物理缓冲产能与区域前置冷链备件，出现单厂减产时可在 10 分钟内完成跨基地自动补调！
            </div>
          </div>
        </div>

      </div>

      <!-- 3. B2B 在途冷链监控表 vs 商业客诉应急与调拨工单 (7:5 Grid) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- 左侧：大客户专属在途冷链履约与动态到达预测预警雷达 (7列) -->
        <div class="lg:col-span-7 glass-card rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2">
              <span class="text-base">🚚</span>
              <h4 class="font-extrabold text-slate-900 text-sm">头部战略商超在途冷链履约与动态到货时效预警雷达</h4>
            </div>
            <span class="text-xs text-purple-800 bg-purple-100 font-mono font-bold px-2 py-0.5 rounded">AI 动态 ETA 毫秒级推演</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 text-slate-500 font-sans text-xs border-b border-slate-200">
                  <th class="py-2.5 px-3">商超大客户 / 截单窗口</th>
                  <th class="py-2.5 px-3">交付品类 / 批次号</th>
                  <th class="py-2.5 px-3">车牌 / 全程恒温</th>
                  <th class="py-2.5 px-3">计划 vs 预测到达时刻</th>
                  <th class="py-2.5 px-3">提前/延后预警与归因</th>
                  <th class="py-2.5 px-3 text-right">调度干预 / 质检单</th>
                </tr>
              </thead>
              <tbody id="b2b-fulfillment-tbody">
                <!-- JavaScript 动态渲染 -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- 右侧：B2B 商业客诉应急与跨基地多仓智能调度中枢 (5列) -->
        <div class="lg:col-span-5 glass-card rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div class="flex items-center gap-2">
                <span class="text-base">⚡</span>
                <h4 class="font-extrabold text-slate-900 text-sm">B2B 商业客诉快速响应与跨厂应急调拨</h4>
              </div>
              <span class="text-xs text-emerald-700 font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded">15分钟极速闭环</span>
            </div>
            <p class="text-xs text-slate-500 mt-2">支持商超验货异议一键调取 e-COA 质检单与前置仓/邻近基地紧急发车补齐</p>
          </div>

          <div id="b2b-tickets-stream" class="space-y-3 overflow-y-auto max-h-[380px] pr-1 mt-3">
            <!-- JavaScript 动态渲染工单流 -->
          </div>
        </div>

      </div>

    </div>
`;
