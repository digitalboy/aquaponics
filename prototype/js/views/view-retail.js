/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * 视图 7: 🛍️ B2C 自有品牌与零售运营台 (零售业务经理专属)
 * =========================================================================
 */
window.ViewTemplates = window.ViewTemplates || {};
window.ViewTemplates['view-b2b'] = `
    <!-- ----------------------------------------------------------------------- -->
    <!-- 视图 7: 🛍️ B2C 自有品牌与零售运营台 (零售业务经理专属) -->
    <!-- ----------------------------------------------------------------------- -->
    <div id="view-b2b" class="view-panel hidden space-y-6">
      
      <!-- 1. 四大核心零售与会员运营 Hero 大卡 (Retail DTC KPIs) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <!-- 💎 C 端自有品牌溢价率 -->
        <div class="glass-card rounded-2xl p-5 border-2 border-emerald-300 shadow-md bg-gradient-to-br from-emerald-50/90 to-white space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 font-bold font-sans">💎 C端自有品牌溢价率</span>
            <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold">+312% 溢价</span>
          </div>
          <div class="flex items-baseline gap-2">
            <strong class="text-2xl font-black text-slate-900 font-mono">¥35.0</strong>
            <span class="text-xs text-slate-500 font-sans">/ kg 综合均价</span>
          </div>
          <p class="text-[11px] text-emerald-700 font-mono">B2B大宗 ¥8.5 vs DTC ¥35.0 • 毛利 78.5%</p>
        </div>

        <!-- 👑 周期购与会员认养大盘 -->
        <div class="glass-card rounded-2xl p-5 border-2 border-teal-300 shadow-md bg-gradient-to-br from-teal-50/90 to-white space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 font-bold font-sans">👑 周期购会员认养大盘</span>
            <span class="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-mono font-bold">周留存 82.5%</span>
          </div>
          <div class="flex items-baseline gap-2">
            <strong class="text-2xl font-black text-slate-900 font-mono">1,280</strong>
            <span class="text-xs text-slate-500 font-sans">位活跃订阅家庭</span>
          </div>
          <p class="text-[11px] text-teal-700 font-mono">周客单价 ¥128.0 • 周回款 ¥16.4 万</p>
        </div>

        <!-- 📱 一物一码扫码互动率 -->
        <div class="glass-card rounded-2xl p-5 border-2 border-purple-300 shadow-md bg-gradient-to-br from-purple-50/90 to-white space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 font-bold font-sans">📱 一物一码扫码互动率</span>
            <span class="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-mono font-bold">NPS 86.5分</span>
          </div>
          <div class="flex items-baseline gap-2">
            <strong class="text-2xl font-black text-slate-900 font-mono">68.4%</strong>
            <span class="text-xs text-slate-500 font-sans">终端消费者扫码</span>
          </div>
          <p class="text-[11px] text-purple-700 font-mono">平均停留 48秒 • 二次复购率 42.5%</p>
        </div>

        <!-- 🤖 AI 会员客服自动处理率 -->
        <div class="glass-card rounded-2xl p-5 border-2 border-indigo-300 shadow-md bg-gradient-to-br from-indigo-50/90 to-white space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 font-bold font-sans">🤖 AI 会员客服自动处理率</span>
            <span class="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-mono font-bold">响应 0.8s</span>
          </div>
          <div class="flex items-baseline gap-2">
            <strong class="text-2xl font-black text-indigo-700 font-mono">98.2%</strong>
            <span class="text-xs text-slate-500 font-sans">闭环解决</span>
          </div>
          <p class="text-[11px] text-slate-600 font-mono">调取批次档案 • 满意度 98.6%</p>
        </div>

      </div>

      <!-- 2. 核心双栏：左侧 DTC 自有高端产品矩阵与周配大盘 (6列) + 右侧 一物一码 C 端溯源转化与会员画像 (6列) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- 左侧: DTC 自有高端产品矩阵与溢价结构 (6列) -->
        <div class="lg:col-span-6 glass-card rounded-2xl p-6 space-y-5 border border-emerald-200 shadow-md">
          <div class="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-md shadow-emerald-500/20">
                🛍️
              </div>
              <div>
                <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  “碧波鲜源” DTC 自有高端品牌产品矩阵
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">直接面向中高端家庭会员直配 • 跑通单厂高毛利自造血闭环</p>
              </div>
            </div>
            <span class="text-xs px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold">
              综合毛利率 78.5%
            </span>
          </div>

          <!-- 产品卡片列表 -->
          <div class="space-y-3 font-sans text-xs">
            
            <!-- 产品 1: 母婴级生菜礼盒 -->
            <div class="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-wrap items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-900 text-sm">🥬 母婴级低硝酸盐生菜鲜萃礼盒 (250g净菜)</span>
                  <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-600 text-white font-mono font-bold">热销 TOP 1</span>
                </div>
                <p class="text-slate-500 text-xs">硝酸盐&lt;800mg/kg • 0化学农药 • 机械臂无菌切根称重打码</p>
              </div>
              <div class="flex items-center gap-4 text-right">
                <div>
                  <span class="text-xs text-slate-500 block">DTC零售价 (折合¥152/kg)</span>
                  <span class="text-base font-black text-emerald-700 font-mono">¥38.0 / 盒</span>
                </div>
                <div class="pl-3 border-l border-emerald-200">
                  <span class="text-[11px] text-slate-500 block">单品毛利率</span>
                  <span class="text-sm font-black text-slate-900 font-mono">79.2%</span>
                </div>
              </div>
            </div>

            <!-- 产品 2: 活泉鲈鱼净菜包 -->
            <div class="p-4 rounded-xl bg-teal-50/70 border border-teal-200 flex flex-wrap items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-900 text-sm">🐟 活泉加州鲈鲜切冷链净菜包 (500g鱼柳/鱼片)</span>
                  <span class="text-[10px] px-2 py-0.5 rounded bg-teal-700 text-white font-mono font-bold">高蛋白辅食</span>
                </div>
                <p class="text-slate-500 text-xs">封闭纯净循环水养殖 • 0抗生素0孔雀石绿 • 活鱼瞬冷锁鲜</p>
              </div>
              <div class="flex items-center gap-4 text-right">
                <div>
                  <span class="text-xs text-slate-500 block">DTC零售价 (折合¥136/kg)</span>
                  <span class="text-base font-black text-teal-800 font-mono">¥68.0 / 份</span>
                </div>
                <div class="pl-3 border-l border-teal-200">
                  <span class="text-[11px] text-slate-500 block">单品毛利率</span>
                  <span class="text-sm font-black text-slate-900 font-mono">68.5%</span>
                </div>
              </div>
            </div>

            <!-- 产品 3: 专属浮板认养年卡 -->
            <div class="p-4 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-wrap items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-900 text-sm">👑 专属水培浮板认养年卡 (52周高定周配)</span>
                  <span class="text-[10px] px-2 py-0.5 rounded bg-purple-700 text-white font-mono font-bold">高净值尊享</span>
                </div>
                <p class="text-slate-500 text-xs">认养专属浮板孔位 • 每周2盒定制冷链直配 • 24h RTSP专属慢直播机位</p>
              </div>
              <div class="flex items-center gap-4 text-right">
                <div>
                  <span class="text-xs text-slate-500 block">年卡订阅价 (已售420张)</span>
                  <span class="text-base font-black text-purple-700 font-mono">¥1,980 / 年</span>
                </div>
                <div class="pl-3 border-l border-purple-200">
                  <span class="text-[11px] text-slate-500 block">会员续费率</span>
                  <span class="text-sm font-black text-slate-900 font-mono">84.2%</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        <!-- 右侧: 一物一码 C 端全生命周期扫码溯源信任漏斗与会员画像 (6列) -->
        <div class="lg:col-span-6 glass-card rounded-2xl p-6 space-y-5 border border-purple-200 shadow-md">
          <div class="flex items-center justify-between border-b border-purple-100 pb-3">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">📱</span>
              <div>
                <h3 class="font-extrabold text-slate-900 text-base">
                  一物一码 C 端溯源信任漏斗与会员画像
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">扫码查看21天生长延时摄影 • 0化学农药凭证驱动高复购</p>
              </div>
            </div>
            <span class="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold border border-purple-300">
              NPS 86.5 分
            </span>
          </div>

          <!-- 一物一码转化漏斗 -->
          <div class="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-2 font-sans text-xs">
            <span class="font-bold text-slate-900 text-xs block">📊 全生命周期扫码互动转化漏斗</span>
            <div class="grid grid-cols-4 gap-2 text-center font-mono text-xs">
              <div class="p-2 bg-white rounded-lg border border-purple-100">
                <span class="text-slate-500 font-sans block text-[10px]">1. 微信扫码率</span>
                <span class="text-base font-black text-slate-900">68.4%</span>
              </div>
              <div class="p-2 bg-white rounded-lg border border-purple-100">
                <span class="text-slate-500 font-sans block text-[10px]">2. 延时视频停留</span>
                <span class="text-base font-black text-emerald-700">48 秒</span>
              </div>
              <div class="p-2 bg-white rounded-lg border border-purple-100">
                <span class="text-slate-500 font-sans block text-[10px]">3. 周期购转化率</span>
                <span class="text-base font-black text-teal-800">42.5%</span>
              </div>
              <div class="p-2 bg-white rounded-lg border border-purple-100">
                <span class="text-slate-500 font-sans block text-[10px]">4. 二次复购率</span>
                <span class="text-base font-black text-purple-700">82.5%</span>
              </div>
            </div>
          </div>

          <!-- 会员画像与客群偏好分析 -->
          <div class="space-y-2 font-sans text-xs">
            <span class="font-bold text-slate-900 block">👥 1,280 位活跃周期购会员画像分布</span>
            <div class="space-y-2 font-sans text-[11px]">
              <div class="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                  <span><strong>母婴辅食家庭客群</strong> (重点关注低硝酸盐、0化学农药)</span>
                </div>
                <span class="font-mono font-bold text-slate-900">45% (576户)</span>
              </div>
              <div class="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span><strong>健身减脂与轻食白领</strong> (重点关注高蛋白活泉鲈鱼、生菜鲜萃)</span>
                </div>
                <span class="font-mono font-bold text-slate-900">32% (410户)</span>
              </div>
              <div class="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <span><strong>高净值健康养生银发族</strong> (专属水培浮板认养年卡主力)</span>
                </div>
                <span class="font-mono font-bold text-slate-900">23% (294户)</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- 3. 🤖 AI 智能客服工单流与零售经理决策 Copilot (AI Member Experience & Decision Copilot) -->
      <div class="glass-card rounded-2xl p-6 space-y-5 border border-emerald-200 shadow-md">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-100 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xl shadow-md shadow-purple-500/20">
              🤖
            </div>
            <div>
              <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
                AI 会员客服工单流与零售运营决策 Copilot
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">会员小程序投诉/建议毫秒级自动回复 • 聚合全量客诉驱动排产与运营决策</p>
            </div>
          </div>
          <div class="flex items-center gap-2 font-mono text-xs">
            <span class="px-2.5 py-1 rounded bg-purple-100 text-purple-800 font-bold border border-purple-300">
              AI 自动处理率: 98.2%
            </span>
            <span class="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              平均响应: 0.8s
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- 左侧: 实时会员工单与 AI 毫秒级回复流 (7列) -->
          <div class="lg:col-span-7 space-y-3">
            <div class="flex items-center justify-between text-xs font-bold text-slate-800">
              <span class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                📱 会员小程序实时投诉 / 建议 / 咨询动态流
              </span>
              <span class="text-slate-500 font-normal">点击 View 7 手机模拟器可实时提报</span>
            </div>

            <div id="member-ticket-stream" class="space-y-3 font-sans text-xs max-h-[380px] overflow-y-auto pr-1">
              <!-- 由 data-engine.js 动态渲染 -->
            </div>
          </div>

          <!-- 右侧: AI 零售决策 Copilot 建议卡片 (5列) -->
          <div class="lg:col-span-5 space-y-3 font-sans text-xs">
            <span class="font-bold text-slate-900 block flex items-center gap-1.5">
              <span>💡</span> AI 决策引擎为零售经理提炼的行动建议 (Actionable Insights)
            </span>

            <div class="space-y-3">
              
              <!-- 建议 1: 选品排产 -->
              <div class="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-purple-900 text-xs">🌱 选品排产优化建议 (置信度 94%)</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-purple-200 text-purple-800 font-bold">高频诉求</span>
                </div>
                <p class="text-slate-600 text-xs leading-relaxed">
                  近 7 天有 <strong class="text-purple-800 font-mono">24 位会员</strong> 在小程序建议增加“嫩叶羽衣甘蓝”与“芝麻菜”周配选项。
                </p>
                <div class="flex items-center justify-between pt-1 border-t border-purple-100">
                  <span class="text-[11px] text-emerald-700 font-bold">建议: 将 #04 跑道 20% 面积切换</span>
                  <button onclick="DataEngine.applyAICopilotSuggestion('crop')" class="px-2.5 py-1 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11px] cursor-pointer shadow-sm">
                    一键采纳排产
                  </button>
                </div>
              </div>

              <!-- 建议 2: 冷链温控 -->
              <div class="p-3.5 rounded-xl bg-teal-50/80 border border-teal-200 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-teal-900 text-xs">❄️ 冷链温控策略优化 (置信度 91%)</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-teal-200 text-teal-800 font-bold">风险预警</span>
                </div>
                <p class="text-slate-600 text-xs leading-relaxed">
                  检测到 2 起夏季午间末端配送微温差反馈。
                </p>
                <div class="flex items-center justify-between pt-1 border-t border-teal-100">
                  <span class="text-[11px] text-teal-800 font-bold">建议: 增投 150g 相变蓄冷冰袋</span>
                  <button onclick="DataEngine.applyAICopilotSuggestion('coldchain')" class="px-2.5 py-1 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-[11px] cursor-pointer shadow-sm">
                    下发冷链工单
                  </button>
                </div>
              </div>

              <!-- 建议 3: 会员流失挽留 -->
              <div class="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-amber-900 text-xs">👑 高净值年卡会员续费关怀 (置信度 96%)</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 font-bold">VIP 关怀</span>
                </div>
                <p class="text-slate-600 text-xs leading-relaxed">
                  有 <strong class="text-amber-800 font-mono">15 位认养年卡会员</strong> 处于最后 30 天周期。
                </p>
                <div class="flex items-center justify-between pt-1 border-t border-amber-100">
                  <span class="text-[11px] text-amber-800 font-bold">建议: 自动派发 VIP 续费礼遇券</span>
                  <button onclick="DataEngine.applyAICopilotSuggestion('vip')" class="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] cursor-pointer shadow-sm">
                    一键批量发送
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
`;
