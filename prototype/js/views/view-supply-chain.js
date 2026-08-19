/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * 视图 5: 📊 集团多基地运营与供应链决策中台 (COO / CFO / 进销存)
 * =========================================================================
 */
window.ViewTemplates = window.ViewTemplates || {};
window.ViewTemplates['view-supply-chain'] = `
    <!-- ----------------------------------------------------------------------- -->
    <!-- 视图 5: 📊 集团多基地运营与供应链决策中台 (COO/CFO/进销存) -->
    <!-- ----------------------------------------------------------------------- -->
    <div id="view-executive" class="view-panel hidden space-y-6">
      
      <!-- 1. 鱼菜分离：双板块核心资产与经营大卡 (Parallel Hero Cards) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- 🥬 水培蔬菜快周转板块 (现金流奶牛) -->
        <div class="glass-card rounded-2xl p-6 border-2 border-emerald-300 shadow-md bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white space-y-4">
          <div class="flex items-center justify-between border-b border-emerald-200 pb-3">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-md shadow-emerald-500/30">
                🥬
              </div>
              <div>
                <h3 class="font-black text-slate-900 text-base flex items-center gap-2">
                  水培蔬菜快周转板块
                  <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold">
                    21天极速周转 · 现金流奶牛
                  </span>
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">连续定植日配商超(盒马/山姆) • 高频次快速回款</p>
              </div>
            </div>
            <div class="text-right">
              <span class="text-xs text-slate-500 font-sans block">单品毛利率</span>
              <strong class="text-2xl font-black text-emerald-700 font-mono">66.5%</strong>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3 font-mono text-xs">
            <div class="p-3 bg-white/80 rounded-xl border border-emerald-100">
              <span class="text-slate-500 font-sans block text-[11px]">月度预计出货量</span>
              <span class="text-lg font-black text-slate-900">142.5 <span class="text-xs font-normal text-slate-400">吨</span></span>
              <span class="text-[10px] text-emerald-700 font-sans block mt-0.5">商超已锁单 86.4%</span>
            </div>
            <div class="p-3 bg-white/80 rounded-xl border border-emerald-100">
              <span class="text-slate-500 font-sans block text-[11px]">月度销售预估</span>
              <span class="text-lg font-black text-slate-900">¥108.8 <span class="text-xs font-normal text-slate-400">万</span></span>
              <span class="text-[10px] text-teal-700 font-sans block mt-0.5">均价: ¥8.50/kg</span>
            </div>
            <div class="p-3 bg-white/80 rounded-xl border border-emerald-100">
              <span class="text-slate-500 font-sans block text-[11px]">单公斤生产成本 (COGS)</span>
              <span class="text-lg font-black text-emerald-800">¥2.85 <span class="text-xs font-normal text-slate-400">/kg</span></span>
              <span class="text-[10px] text-slate-500 font-sans block mt-0.5">含电费/种苗/折旧</span>
            </div>
          </div>
        </div>

        <!-- 🐟 循环水产高毛利大宗板块 (利润支柱) -->
        <div class="glass-card rounded-2xl p-6 border-2 border-teal-300 shadow-md bg-gradient-to-br from-teal-50/90 via-cyan-50/50 to-white space-y-4">
          <div class="flex items-center justify-between border-b border-teal-200 pb-3">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl bg-teal-700 text-white flex items-center justify-center text-2xl shadow-md shadow-teal-600/30">
                🐟
              </div>
              <div>
                <h3 class="font-black text-slate-900 text-base flex items-center gap-2">
                  循环水产高毛利大宗板块
                  <span class="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300 font-mono font-bold">
                    4~6个月大宗批次 · 利润支柱
                  </span>
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">加州鲈/黑鱼成鱼整车出塘 • 活水物流高溢价结算</p>
              </div>
            </div>
            <div class="text-right">
              <span class="text-xs text-slate-500 font-sans block">单品毛利率</span>
              <strong class="text-2xl font-black text-teal-800 font-mono">52.8%</strong>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3 font-mono text-xs">
            <div class="p-3 bg-white/80 rounded-xl border border-teal-100">
              <span class="text-slate-500 font-sans block text-[11px]">存塘总生物量</span>
              <span class="text-lg font-black text-slate-900">38.5 <span class="text-xs font-normal text-slate-400">吨</span></span>
              <span class="text-[10px] text-teal-700 font-sans block mt-0.5">在养加州鲈 4.8万尾</span>
            </div>
            <div class="p-3 bg-white/80 rounded-xl border border-teal-100">
              <span class="text-slate-500 font-sans block text-[11px]">存塘活体资产估值</span>
              <span class="text-lg font-black text-slate-900">¥98.2 <span class="text-xs font-normal text-slate-400">万</span></span>
              <span class="text-[10px] text-emerald-700 font-sans block mt-0.5">均价: ¥28.00/kg</span>
            </div>
            <div class="p-3 bg-white/80 rounded-xl border border-teal-100">
              <span class="text-slate-500 font-sans block text-[11px]">饲料转化率 (FCR) / 成本</span>
              <span class="text-lg font-black text-teal-800">0.98 <span class="text-xs font-normal text-slate-400">(¥13.2/kg)</span></span>
              <span class="text-[10px] text-slate-500 font-sans block mt-0.5">海大特种膨化沉料</span>
            </div>
          </div>
        </div>

      </div>

      <!-- 2. 进销存“时空双向对账大盘” (最近 7 天实绩 vs 未来 30 天预测计划) -->
      <div class="glass-card rounded-2xl p-6 border border-emerald-200 shadow-md space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 pb-3">
          <div class="flex items-center gap-3">
            <span class="text-2xl">📦</span>
            <div>
              <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
                鱼菜进销存“时空双向对账大盘” (最近 7 天实绩 ⇄ 未来 30 天计划)
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">双向穿透核算历史发货与进料成本，根据生长模型自动推导未来 30 天商超锁单与排产集采预算</p>
            </div>
          </div>
          <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
            实时财务进销存对齐
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans text-xs">
          
          <!-- 最近 7 天采销实绩 -->
          <div class="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
            <div class="flex items-center justify-between border-b border-emerald-200/80 pb-2">
              <span class="font-black text-slate-900 flex items-center gap-2 text-sm">
                <span>📋</span> 最近 7 天已完成采销实绩 (Recent 7d Actuals)
              </span>
              <span class="text-[11px] font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">实绩已入账</span>
            </div>

            <div class="space-y-2 font-mono">
              <div class="p-2.5 bg-white/90 rounded-lg border border-emerald-100 flex justify-between items-center">
                <div>
                  <span class="font-bold text-slate-900 font-sans block">🥬 蔬菜销售发货:</span>
                  <span class="text-slate-500 text-[11px] font-sans">盒马鲜生/山姆会员店日配</span>
                </div>
                <div class="text-right">
                  <span class="text-slate-900 font-black text-sm">31.5 吨</span>
                  <span class="text-emerald-700 font-bold block text-xs">回款 ¥26.8 万</span>
                </div>
              </div>

              <div class="p-2.5 bg-white/90 rounded-lg border border-emerald-100 flex justify-between items-center">
                <div>
                  <span class="font-bold text-slate-900 font-sans block">🥬 蔬菜种苗微肥采购:</span>
                  <span class="text-slate-500 text-[11px] font-sans">特级奶油生菜海绵种苗 5万株</span>
                </div>
                <div class="text-right">
                  <span class="text-slate-900 font-black text-sm">50,000 株</span>
                  <span class="text-slate-600 block text-xs">支出 ¥1.50 万</span>
                </div>
              </div>

              <div class="p-2.5 bg-white/90 rounded-lg border border-teal-100 flex justify-between items-center">
                <div>
                  <span class="font-bold text-slate-900 font-sans block">🐟 加州鲈成鱼分选出塘:</span>
                  <span class="text-slate-500 text-[11px] font-sans">#01/#05成鱼池活水车大宗批发</span>
                </div>
                <div class="text-right">
                  <span class="text-slate-900 font-black text-sm">8.2 吨</span>
                  <span class="text-teal-700 font-bold block text-xs">回款 ¥22.9 万</span>
                </div>
              </div>

              <div class="p-2.5 bg-white/90 rounded-lg border border-teal-100 flex justify-between items-center">
                <div>
                  <span class="font-bold text-slate-900 font-sans block">🐟 水产特种膨化饲料采购:</span>
                  <span class="text-slate-500 text-[11px] font-sans">海大特种沉性膨化料 (粗蛋白≥46%)</span>
                </div>
                <div class="text-right">
                  <span class="text-slate-900 font-black text-sm">12.0 吨</span>
                  <span class="text-slate-600 block text-xs">支出 ¥9.60 万</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 未来 30 天预测与计划 -->
          <div class="p-4 rounded-xl bg-teal-50/70 border border-teal-200 space-y-3">
            <div class="flex items-center justify-between border-b border-teal-200/80 pb-2">
              <span class="font-black text-slate-900 flex items-center gap-2 text-sm">
                <span>🔮</span> 未来 30 天预测销售与集采预算 (Future 30d Plan)
              </span>
              <span class="text-[11px] font-mono text-teal-800 font-bold bg-teal-100 px-2 py-0.5 rounded">APS 自动推导</span>
            </div>

            <div class="space-y-2 font-mono">
              <div class="p-2.5 bg-white/90 rounded-lg border border-teal-100 flex justify-between items-center">
                <div>
                  <span class="font-bold text-slate-900 font-sans block">🥬 30天蔬菜预测出货 (ATP):</span>
                  <span class="text-slate-500 text-[11px] font-sans">期货商超已锁单 86.4% (123.1吨)</span>
                </div>
                <div class="text-right">
                  <span class="text-slate-900 font-black text-sm">142.5 吨</span>
                  <span class="text-emerald-700 font-bold block text-xs">预估 ¥108.8 万</span>
                </div>
              </div>

              <div class="p-2.5 bg-white/90 rounded-lg border border-teal-100 flex justify-between items-center">
                <div>
                  <span class="font-bold text-slate-900 font-sans block">🥬 30天种苗与冷链包材采购:</span>
                  <span class="text-slate-500 text-[11px] font-sans">15万株优质种苗 + 2万只降解箱</span>
                </div>
                <div class="text-right">
                  <span class="text-slate-900 font-black text-sm">150,000 株</span>
                  <span class="text-purple-700 font-bold block text-xs">预算 ¥5.20 万</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. COO 生产运营看板 vs CFO 财务盈利看板专属切换控制器 -->
      <div class="glass-card rounded-2xl p-6 border border-emerald-200 shadow-md space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-100 pb-4">
          <div>
            <h3 class="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <span>🎯</span> 集团决策视角切换器 (Executive Role Switcher)
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">根据 COO (生产履约/人效平效) 与 CFO (财务盈利/成本穿透) 岗位职责呈现差异化专属看板</p>
          </div>

          <div class="flex items-center gap-2 font-mono text-xs bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button onclick="DataEngine.switchExecutiveRole('all')" id="btn-role-all" class="px-3.5 py-1.5 rounded-xl transition cursor-pointer font-extrabold bg-emerald-600 text-white shadow-sm">
              🌐 全景总览
            </button>
            <button onclick="DataEngine.switchExecutiveRole('coo')" id="btn-role-coo" class="px-3.5 py-1.5 rounded-xl transition cursor-pointer font-bold text-slate-600 hover:text-slate-900">
              🏭 COO 生产运营与交付
            </button>
            <button onclick="DataEngine.switchExecutiveRole('cfo')" id="btn-role-cfo" class="px-3.5 py-1.5 rounded-xl transition cursor-pointer font-bold text-slate-600 hover:text-slate-900">
              💰 CFO 财务盈利与成本穿透
            </button>
          </div>
        </div>

        <!-- 🏭 COO 生产运营专属区域 -->
        <div id="section-coo-view" class="space-y-6">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 🏭 COO 核心关注：全国 3 大基地运营指标与 30 天 ATP 产能负荷
            </h4>
            <span class="text-xs text-slate-500 font-mono">集团平效: 42.5 kg/㎡/年 • 人效: 3.2 工时/吨</span>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-6 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-3">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-900 text-xs">🎯 全国基地 6 维运营指标横向对标</span>
                <span class="text-xs text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">SOP 复制率 98%</span>
              </div>
              <div class="h-64 w-full flex items-center justify-center">
                <canvas id="chart-radar-bases"></canvas>
              </div>
            </div>

            <div class="lg:col-span-6 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-3">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-900 text-xs">📅 未来 30 天可承诺交付产能 (ATP) 期货大盘</span>
                <span class="text-xs text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">预售锁定率 91.2%</span>
              </div>
              <div class="h-64 w-full flex items-center justify-center">
                <canvas id="chart-atp-forecast"></canvas>
              </div>
            </div>
          </div>

          <!-- 多基地 SOP 达标与异常偏差跟踪表 -->
          <div class="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
            <span class="font-bold text-slate-900 text-xs block">📋 全国基地标准化 SOP 达标率与现场管理偏差</span>
            <div class="overflow-x-auto">
              <table class="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr class="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <th class="py-2 px-3 font-bold font-sans">基地名称 / 规模</th>
                    <th class="py-2 px-2 text-center">SOP达标率</th>
                    <th class="py-2 px-2 text-center">单株优品率</th>
                    <th class="py-2 px-2 text-center">平效 (kg/㎡/年)</th>
                    <th class="py-2 px-2 text-center">人效 (工时/吨)</th>
                    <th class="py-2 px-3 font-sans font-bold">异常偏离警报 / 整改建议</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-800">
                  <tr class="hover:bg-emerald-50/40">
                    <td class="py-2.5 px-3 font-bold text-slate-900 font-sans">🌿 苏州示范一号基地 (4,200㎡)</td>
                    <td class="py-2.5 px-2 text-center"><span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">99.2%</span></td>
                    <td class="py-2.5 px-2 text-center font-bold text-emerald-700">98.6%</td>
                    <td class="py-2.5 px-2 text-center">42.5</td>
                    <td class="py-2.5 px-2 text-center">3.2</td>
                    <td class="py-2.5 px-3 text-emerald-700 font-sans">🟢 集团标杆 (全自动机器人采收闭环)</td>
                  </tr>
                  <tr class="hover:bg-amber-50/40">
                    <td class="py-2.5 px-3 font-bold text-slate-900 font-sans">🌿 成都二号基地 (2,400㎡)</td>
                    <td class="py-2.5 px-2 text-center"><span class="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">94.5%</span></td>
                    <td class="py-2.5 px-2 text-center font-bold text-teal-700">95.1%</td>
                    <td class="py-2.5 px-2 text-center">38.2</td>
                    <td class="py-2.5 px-2 text-center">3.8</td>
                    <td class="py-2.5 px-3 text-amber-700 font-sans">🟡 夜间温差偏离 1.2°C (已下发环流风机补偿)</td>
                  </tr>
                  <tr class="hover:bg-amber-50/40">
                    <td class="py-2.5 px-3 font-bold text-slate-900 font-sans">🌿 北京三号基地 (1,800㎡)</td>
                    <td class="py-2.5 px-2 text-center"><span class="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">92.0%</span></td>
                    <td class="py-2.5 px-2 text-center font-bold text-amber-700">93.4%</td>
                    <td class="py-2.5 px-2 text-center">36.5</td>
                    <td class="py-2.5 px-2 text-center">4.1</td>
                    <td class="py-2.5 px-3 text-amber-700 font-sans">🟡 溶氧补充微滞后 (已调整微孔曝气频率)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 💰 CFO 财务盈利专属区域 -->
        <div id="section-cfo-view" class="space-y-6">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-teal-600"></span> 💰 CFO 核心关注：单公斤成本结构 (COGS) 穿透拆解与单厂 2.5 年投资回收模型
            </h4>
            <span class="text-xs text-purple-700 font-mono font-bold bg-purple-100 px-2 py-0.5 rounded">MPC 避峰年省: ¥17.0万 (纯净利润)</span>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- 🥬 生菜 COGS 穿透 -->
            <div class="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div class="flex justify-between items-center border-b border-emerald-200/80 pb-2">
                <span class="font-black text-slate-900 text-sm font-sans flex items-center gap-2">
                  <span>🥬</span> 特级水培生菜 · 单公斤生产成本 (COGS) 穿透
                </span>
                <span class="text-emerald-800 font-mono font-black text-sm">¥2.85 / kg</span>
              </div>
              <div class="space-y-2 font-mono text-xs">
                <div class="flex justify-between items-center p-2 bg-white/90 rounded-lg">
                  <span class="font-sans text-slate-600">1. 电力动力与补光能耗:</span>
                  <span class="font-bold text-slate-900">¥0.62 (21.8%)</span>
                </div>
                <div class="flex justify-between items-center p-2 bg-white/90 rounded-lg">
                  <span class="font-sans text-slate-600">2. 优质种苗与岩棉基质:</span>
                  <span class="font-bold text-slate-900">¥0.55 (19.3%)</span>
                </div>
                <div class="flex justify-between items-center p-2 bg-white/90 rounded-lg">
                  <span class="font-sans text-slate-600">3. 营养液微肥调理剂:</span>
                  <span class="font-bold text-slate-900">¥0.38 (13.3%)</span>
                </div>
                <div class="flex justify-between items-center p-2 bg-white/90 rounded-lg">
                  <span class="font-sans text-slate-600">4. 温室钢构与设备折旧:</span>
                  <span class="font-bold text-slate-900">¥0.80 (28.1%)</span>
                </div>
                <div class="flex justify-between items-center p-2 bg-white/90 rounded-lg">
                  <span class="font-sans text-slate-600">5. 人工管护工时摊销:</span>
                  <span class="font-bold text-slate-900">¥0.50 (17.5%)</span>
                </div>
                <div class="p-3 bg-emerald-100/90 rounded-xl border border-emerald-300 flex justify-between items-center font-sans font-bold text-xs text-emerald-950">
                  <span>商超直供协议均价: ¥8.50 / kg</span>
                  <span class="text-emerald-700 text-sm font-mono font-black">超额毛利: 66.5% (+¥5.65)</span>
                </div>
              </div>
            </div>

            <!-- 🐟 加州鲈鱼 COGS 穿透 -->
            <div class="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3">
              <div class="flex justify-between items-center border-b border-teal-200/80 pb-2">
                <span class="font-black text-slate-900 text-sm font-sans flex items-center gap-2">
                  <span>🐟</span> 加州鲈鱼成鱼 · 单公斤养殖成本 (COGS) 穿透
                </span>
                <span class="text-teal-800 font-mono font-black text-sm">¥13.20 / kg</span>
              </div>
              <div class="space-y-2 font-mono text-xs">
                <div class="flex justify-between items-center p-2 bg-white/90 rounded-lg">
                  <span class="font-sans text-slate-600">1. 海大特种膨化饲料 (FCR 0.98):</span>
                  <span class="font-bold text-slate-900">¥8.80 (66.7%)</span>
                </div>
                <div class="flex justify-between items-center p-2 bg-white/90 rounded-lg">
                  <span class="font-sans text-slate-600">2. 优质早秋鲈鱼苗种:</span>
                  <span class="font-bold text-slate-900">¥1.80 (13.6%)</span>
                </div>
                <div class="flex justify-between items-center p-2 bg-white/90 rounded-lg">
                  <span class="font-sans text-slate-600">3. 循环水泵与微孔曝气充氧:</span>
                  <span class="font-bold text-slate-900">¥1.20 (9.1%)</span>
                </div>
                <div class="flex justify-between items-center p-2 bg-white/90 rounded-lg">
                  <span class="font-sans text-slate-600">4. RAS 鱼池设施折旧与人工:</span>
                  <span class="font-bold text-slate-900">¥1.40 (10.6%)</span>
                </div>
                <div class="p-3 bg-teal-100/90 rounded-xl border border-teal-300 flex justify-between items-center font-sans font-bold text-xs text-teal-950">
                  <span>活水车大宗批发价: ¥28.00 / kg</span>
                  <span class="text-teal-800 text-sm font-mono font-black">大宗毛利: 52.8% (+¥14.80)</span>
                </div>
              </div>
            </div>

          </div>

          <!-- 静态投资回收期模型 -->
          <div class="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 font-sans text-xs">
            <span class="font-bold text-slate-900 text-sm block">📈 苏州一号示范基地投资回报测算模型 (Payback Period)</span>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span class="text-slate-500 font-sans block">总建造成本 (CAPEX)</span>
                <span class="text-lg font-black text-slate-900">¥420.0 万</span>
              </div>
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span class="text-slate-500 font-sans block">年均净现金流 (EBITDA)</span>
                <span class="text-lg font-black text-emerald-700">¥168.0 万 / 年</span>
              </div>
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span class="text-slate-500 font-sans block">静态投资回收期</span>
                <span class="text-lg font-black text-teal-800">2.5 年 (30个月)</span>
              </div>
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span class="text-slate-500 font-sans block">避峰节电年化利润贡献</span>
                <span class="text-lg font-black text-purple-700">+¥17.0 万 / 年</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
`;
