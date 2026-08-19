/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * 视图 7: 🛍️ B2C 自有品牌与零售运营台 (零售业务经理专属)
 * 新增：全网社媒市场舆情大盘 (小红书/抖音/视频号) 与 AI 品牌心智分析中枢 (Social Sentiment & Trend Copilot)
 * 字体规范：全面保障中文阅读体验，严格杜绝低于 12px 的过小字体，确保清晰舒适
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
        <div class="glass-card rounded-2xl p-5 border-2 border-emerald-300 shadow-md bg-gradient-to-br from-emerald-50/90 to-white space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-600 font-bold font-sans">💎 C端自有品牌溢价率</span>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">+312% 溢价</span>
          </div>
          <div class="flex items-baseline gap-2">
            <strong class="text-3xl font-black text-slate-900 font-mono">¥35.0</strong>
            <span class="text-xs text-slate-500 font-sans font-medium">/ kg 综合均价</span>
          </div>
          <p class="text-xs text-emerald-800 font-mono font-semibold">B2B大宗 ¥8.5 vs DTC ¥35.0 • 毛利 78.5%</p>
        </div>

        <!-- 👑 周期购与会员认养大盘 -->
        <div class="glass-card rounded-2xl p-5 border-2 border-teal-300 shadow-md bg-gradient-to-br from-teal-50/90 to-white space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-600 font-bold font-sans">👑 周期购会员认养大盘</span>
            <span class="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold">周留存 82.5%</span>
          </div>
          <div class="flex items-baseline gap-2">
            <strong class="text-3xl font-black text-slate-900 font-mono">1,280</strong>
            <span class="text-xs text-slate-500 font-sans font-medium">位活跃订阅家庭</span>
          </div>
          <p class="text-xs text-teal-800 font-mono font-semibold">周客单价 ¥128.0 • 周回款 ¥16.4 万</p>
        </div>

        <!-- 📱 一物一码扫码互动率 -->
        <div class="glass-card rounded-2xl p-5 border-2 border-purple-300 shadow-md bg-gradient-to-br from-purple-50/90 to-white space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-600 font-bold font-sans">📱 一物一码扫码互动率</span>
            <span class="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-mono font-bold">NPS 86.5分</span>
          </div>
          <div class="flex items-baseline gap-2">
            <strong class="text-3xl font-black text-slate-900 font-mono">68.4%</strong>
            <span class="text-xs text-slate-500 font-sans font-medium">终端消费者扫码</span>
          </div>
          <p class="text-xs text-purple-800 font-mono font-semibold">平均停留 48秒 • 二次复购率 42.5%</p>
        </div>

        <!-- 🤖 AI 会员客服自动处理率 -->
        <div class="glass-card rounded-2xl p-5 border-2 border-indigo-300 shadow-md bg-gradient-to-br from-indigo-50/90 to-white space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-600 font-bold font-sans">🤖 AI 会员客服自动处理率</span>
            <span class="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-mono font-bold">响应 0.8s</span>
          </div>
          <div class="flex items-baseline gap-2">
            <strong class="text-3xl font-black text-indigo-700 font-mono">98.2%</strong>
            <span class="text-xs text-slate-500 font-sans font-medium">闭环解决</span>
          </div>
          <p class="text-xs text-slate-700 font-mono font-semibold">调取批次档案 • 满意度 98.6%</p>
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
                  <span class="text-xs px-2 py-0.5 rounded bg-emerald-600 text-white font-mono font-bold">热销 TOP 1</span>
                </div>
                <p class="text-slate-600 text-xs">硝酸盐&lt;800mg/kg • 0化学农药 • 机械臂无菌切根称重打码</p>
              </div>
              <div class="flex items-center gap-4 text-right">
                <div>
                  <span class="text-xs text-slate-500 block">DTC零售价 (折合¥152/kg)</span>
                  <span class="text-base font-black text-emerald-700 font-mono">¥38.0 / 盒</span>
                </div>
                <div class="pl-3 border-l border-emerald-200">
                  <span class="text-xs text-slate-500 block">单品毛利率</span>
                  <span class="text-sm font-black text-slate-900 font-mono">79.2%</span>
                </div>
              </div>
            </div>

            <!-- 产品 2: 活泉鲈鱼净菜包 -->
            <div class="p-4 rounded-xl bg-teal-50/70 border border-teal-200 flex flex-wrap items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-900 text-sm">🐟 活泉加州鲈鲜切冷链净菜包 (500g鱼柳/鱼片)</span>
                  <span class="text-xs px-2 py-0.5 rounded bg-teal-700 text-white font-mono font-bold">高蛋白辅食</span>
                </div>
                <p class="text-slate-600 text-xs">封闭纯净循环水养殖 • 0抗生素0孔雀石绿 • 活鱼瞬冷锁鲜</p>
              </div>
              <div class="flex items-center gap-4 text-right">
                <div>
                  <span class="text-xs text-slate-500 block">DTC零售价 (折合¥136/kg)</span>
                  <span class="text-base font-black text-teal-800 font-mono">¥68.0 / 份</span>
                </div>
                <div class="pl-3 border-l border-teal-200">
                  <span class="text-xs text-slate-500 block">单品毛利率</span>
                  <span class="text-sm font-black text-slate-900 font-mono">68.5%</span>
                </div>
              </div>
            </div>

            <!-- 产品 3: 专属浮板认养年卡 -->
            <div class="p-4 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-wrap items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-900 text-sm">👑 专属水培浮板认养年卡 (52周高定周配)</span>
                  <span class="text-xs px-2 py-0.5 rounded bg-purple-700 text-white font-mono font-bold">高净值尊享</span>
                </div>
                <p class="text-slate-600 text-xs">认养专属浮板孔位 • 每周2盒定制冷链直配 • 24h RTSP专属慢直播机位</p>
              </div>
              <div class="flex items-center gap-4 text-right">
                <div>
                  <span class="text-xs text-slate-500 block">年卡订阅价 (已售420张)</span>
                  <span class="text-base font-black text-purple-700 font-mono">¥1,980 / 年</span>
                </div>
                <div class="pl-3 border-l border-purple-200">
                  <span class="text-xs text-slate-500 block">会员续费率</span>
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
            <span class="text-xs px-2.5 py-1 rounded bg-purple-100 text-purple-800 font-bold border border-purple-300">
              NPS 86.5 分
            </span>
          </div>

          <!-- 一物一码转化漏斗 -->
          <div class="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-2 font-sans text-xs">
            <span class="font-bold text-slate-900 text-xs block">📊 全生命周期扫码互动转化漏斗</span>
            <div class="grid grid-cols-4 gap-2 text-center font-mono text-xs">
              <div class="p-2 bg-white rounded-lg border border-purple-100">
                <span class="text-slate-500 font-sans block text-xs">1. 微信扫码率</span>
                <span class="text-base font-black text-slate-900">68.4%</span>
              </div>
              <div class="p-2 bg-white rounded-lg border border-purple-100">
                <span class="text-slate-500 font-sans block text-xs">2. 延时视频停留</span>
                <span class="text-base font-black text-emerald-700">48 秒</span>
              </div>
              <div class="p-2 bg-white rounded-lg border border-purple-100">
                <span class="text-slate-500 font-sans block text-xs">3. 周期购转化率</span>
                <span class="text-base font-black text-teal-800">42.5%</span>
              </div>
              <div class="p-2 bg-white rounded-lg border border-purple-100">
                <span class="text-slate-500 font-sans block text-xs">4. 二次复购率</span>
                <span class="text-base font-black text-purple-700">82.5%</span>
              </div>
            </div>
          </div>

          <!-- 会员画像与客群偏好分析 -->
          <div class="space-y-2 font-sans text-xs">
            <span class="font-bold text-slate-900 block">👥 1,280 位活跃周期购会员画像分布</span>
            <div class="space-y-2 font-sans text-xs">
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

      <!-- ========================================================================= -->
      <!-- 3. 👤 核心新增：会员 360° 全息档案与客户全生命周期智能检索 (Customer 360 & CRM Intelligence) -->
      <!-- ========================================================================= -->
      <div class="glass-card rounded-2xl p-6 space-y-6 border-2 border-indigo-300 shadow-lg bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/40">
        
        <!-- 头部搜索栏与标杆快捷切换 -->
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-100 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-2xl shadow-md shadow-indigo-500/20">
              👤
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-black text-slate-900 text-base tracking-tight">
                  会员 360° 全息档案与客户全生命周期智能检索 (Customer 360 & CRM)
                </h3>
                <span class="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-mono font-bold border border-indigo-300">
                  CRM & LTV Copilot
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5 font-medium">
                输入会员姓名/手机号/卡号 • 穿透全生命周期历史订单与冷链轨迹 • 查阅多渠道交流历史 • AI 专属运营策略
              </p>
            </div>
          </div>

          <!-- 搜索输入框 -->
          <div class="flex items-center gap-2 w-full md:w-auto">
            <div class="relative flex-1 md:w-80">
              <input 
                id="retail-user-search-input" 
                type="text" 
                value="张女士" 
                placeholder="输入会员姓名/手机号（如：张女士 / 13800008821 / 林妈妈）..." 
                class="w-full pl-9 pr-24 py-2.5 rounded-xl border border-indigo-300 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                onkeydown="if(event.key === 'Enter') RetailCopilotController.searchCustomer();"
              />
              <span class="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
              <button 
                onclick="RetailCopilotController.searchCustomer()" 
                class="absolute right-1.5 top-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition cursor-pointer shadow-xs">
                搜索档案
              </button>
            </div>
          </div>
        </div>

        <!-- 快捷会员筛选标签 -->
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <span class="text-slate-500 font-bold">快捷调取标杆会员:</span>
          <button onclick="RetailCopilotController.quickSelectCustomer('zhang')" id="btn-cust-zhang" class="px-3 py-1.5 rounded-xl bg-purple-600 text-white border border-purple-600 font-extrabold transition cursor-pointer shadow-xs">
            👑 钻石年卡会员 (张女士 · 杭州)
          </button>
          <button onclick="RetailCopilotController.quickSelectCustomer('lin')" id="btn-cust-lin" class="px-3 py-1.5 rounded-xl bg-white hover:bg-pink-50 text-slate-700 border border-slate-300 font-bold transition cursor-pointer">
            👶 母婴辅食周订 (林妈妈 · 上海)
          </button>
          <button onclick="RetailCopilotController.quickSelectCustomer('chen')" id="btn-cust-chen" class="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 border border-slate-300 font-bold transition cursor-pointer">
            🥗 健身轻食周配 (陈先生 · 深圳)
          </button>
          <button onclick="RetailCopilotController.quickSelectCustomer('wang')" id="btn-cust-wang" class="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-slate-700 border border-slate-300 font-bold transition cursor-pointer">
            ⚠️ 临期关怀会员 (王教授 · 北京)
          </button>
        </div>

        <!-- 会员 360° 全息档案动态面板容器 (由 retail-copilot.js 动态渲染) -->
        <div id="customer-profile-card-container">
          <!-- 动态装配用户画像、历史订单、交流记录与 AI 行动建议 -->
        </div>

      </div>

      <!-- ========================================================================= -->
      <!-- 4. 🌟 全网社媒市场舆情大盘与 AI 品牌心智分析中枢 (Social Sentiment & Trend Copilot) -->
      <!-- ========================================================================= -->
      <div class="glass-card rounded-2xl p-6 space-y-5 border-2 border-rose-300/80 shadow-lg bg-gradient-to-br from-rose-50/40 via-white to-orange-50/40">
        
        <!-- 头部标题与控制区 -->
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-rose-100 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-orange-500 text-white flex items-center justify-center text-2xl shadow-md shadow-rose-500/30">
              📱
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-black text-slate-900 text-base tracking-tight">
                  全网社媒市场舆情大盘与 AI 品牌心智分析中枢
                </h3>
                <span class="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-mono font-bold border border-rose-300">
                  小红书 · 抖音 · 视频号
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5 font-medium">
                实时抓取社媒笔记/短视频/带货评价 • AI 情感分析打标 • 爆款趋势直连研发主管试验舱排产
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2.5">
            <div class="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-mono">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span class="text-slate-600">全网爬虫引擎: <strong class="text-emerald-700 font-bold">实时同步中</strong></span>
            </div>
            <button 
              onclick="RetailCopilotController.refreshSocialSentiment()" 
              class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white font-extrabold text-xs shadow-sm transition cursor-pointer flex items-center gap-1">
              <span>🔄</span> 刷新全网舆情
            </button>
          </div>
        </div>

        <!-- (1) 四大全网社媒舆情 Hero 核心大卡 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
          
          <!-- 📕 小红书全网声量 -->
          <div class="p-4 rounded-2xl bg-white border border-rose-200 shadow-sm space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span class="text-rose-600">📕</span> 小红书种草声量
              </span>
              <span class="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-xs font-mono font-bold">+42% 周环比</span>
            </div>
            <div class="flex items-baseline gap-2">
              <strong class="text-2xl font-black text-rose-600 font-mono">3,420 篇</strong>
              <span class="text-xs text-slate-500">笔记测评</span>
            </div>
            <p class="text-xs text-slate-600 font-medium">TOP1热词: <strong class="text-slate-900">宝宝辅食无硝酸盐苦涩</strong></p>
          </div>

          <!-- 🎵 抖音短视频与直播 -->
          <div class="p-4 rounded-2xl bg-white border border-slate-300 shadow-sm space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span class="text-slate-900">🎵</span> 抖音短视频与开箱
              </span>
              <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-mono font-bold">1,280w 播放</span>
            </div>
            <div class="flex items-baseline gap-2">
              <strong class="text-2xl font-black text-slate-900 font-mono">1,850 条</strong>
              <span class="text-xs text-slate-500">带货视频</span>
            </div>
            <p class="text-xs text-slate-600 font-medium">TOP1热词: <strong class="text-slate-900">顺丰冷链开箱无土腥味</strong></p>
          </div>

          <!-- 💖 全网正向好评率 (NPS) -->
          <div class="p-4 rounded-2xl bg-white border border-emerald-300 shadow-sm space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span class="text-emerald-600">💖</span> 全网净推荐 NPS
              </span>
              <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">生鲜均值 71分</span>
            </div>
            <div class="flex items-baseline gap-2">
              <strong class="text-2xl font-black text-emerald-700 font-mono">94.2%</strong>
              <span class="text-xs text-emerald-800 font-bold font-mono">NPS 92.6分</span>
            </div>
            <p class="text-xs text-emerald-800 font-medium">复购意愿 82.5% • 成分党认可 98%</p>
          </div>

          <!-- 🛡️ 舆情预警与秒级化解 -->
          <div class="p-4 rounded-2xl bg-white border border-amber-300 shadow-sm space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span class="text-amber-600">🛡️</span> 舆情风险与公关防御
              </span>
              <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">0 级特急</span>
            </div>
            <div class="flex items-baseline gap-2">
              <strong class="text-2xl font-black text-slate-900 font-mono">2 条微差评</strong>
              <span class="text-xs text-emerald-700 font-bold font-mono">已秒级闭环</span>
            </div>
            <p class="text-xs text-slate-600 font-medium">AI 客服 0.8s 调取 e-COA 单完成答疑</p>
          </div>

        </div>

        <!-- (2) 双栏布局：左侧 社媒 Feed 流 (7列) + 右侧 AI 舆情洞察与行动引擎 (5列) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          
          <!-- 左侧: 多平台社媒动态 Feed 瀑布流 (7列) -->
          <div class="lg:col-span-7 space-y-3.5">
            
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <span>📰</span> 社媒动态舆情信息流 (Social Feed)
                </span>
                <span class="text-xs text-slate-500 font-mono">近 24 小时捕获 186 条</span>
              </div>

              <!-- 平台过滤筛选按钮组 -->
              <div class="flex items-center gap-1 text-xs">
                <button onclick="RetailCopilotController.filterSocialPlatform('all')" id="btn-social-all" class="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold transition cursor-pointer">全部</button>
                <button onclick="RetailCopilotController.filterSocialPlatform('xhs')" id="btn-social-xhs" class="px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 text-slate-700 font-bold border border-slate-200 transition cursor-pointer">📕 小红书</button>
                <button onclick="RetailCopilotController.filterSocialPlatform('douyin')" id="btn-social-douyin" class="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 transition cursor-pointer">🎵 抖音</button>
                <button onclick="RetailCopilotController.filterSocialPlatform('wx')" id="btn-social-wx" class="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-slate-700 font-bold border border-slate-200 transition cursor-pointer">💬 视频号</button>
              </div>
            </div>

            <!-- Feed 列表卡片容器 -->
            <div id="social-feed-container" class="space-y-3 max-h-[460px] overflow-y-auto pr-1 font-sans text-xs">
              
              <!-- 帖子 1: 小红书母婴博主 -->
              <div onclick="RetailCopilotController.showSocialDetail('post-1')" class="p-4 rounded-2xl bg-white border border-rose-200 hover:border-rose-400 hover:shadow-md transition cursor-pointer space-y-2.5">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-2.5">
                    <span class="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-sm shrink-0">📕</span>
                    <div>
                      <div class="flex items-center gap-1.5">
                        <strong class="text-slate-900 text-xs">@萌宝辅食日记 (粉丝 12.5w)</strong>
                        <span class="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[11px] font-bold">小红书母婴达人</span>
                      </div>
                      <span class="text-slate-400 text-xs font-mono">2026-08-19 14:15 · 杭州</span>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                    💖 极度好评 (99%)
                  </span>
                </div>
                <p class="text-slate-700 text-xs leading-relaxed font-medium">
                  “终于买到了做宝宝辅食的真·母婴级生菜！带去实验室测了硝酸盐只有 620mg，远低于欧盟 2500mg 标准，生吃脆甜无苦味，宝宝一口气吃了大半碗蔬菜泥！顺丰冷链包装太专业了！”
                </p>
                <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500 font-mono text-xs">
                  <div class="flex items-center gap-3">
                    <span>❤️ 2,840 赞</span>
                    <span>💬 382 评论</span>
                    <span>⭐ 1,420 收藏</span>
                  </div>
                  <span class="text-rose-600 font-bold">带货转化: 142 盒</span>
                </div>
              </div>

              <!-- 帖子 2: 抖音美食开箱博主 -->
              <div onclick="RetailCopilotController.showSocialDetail('post-2')" class="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition cursor-pointer space-y-2.5">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-2.5">
                    <span class="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm shrink-0">🎵</span>
                    <div>
                      <div class="flex items-center gap-1.5">
                        <strong class="text-slate-900 text-xs">@大雄的品质厨房 (点赞 35w)</strong>
                        <span class="px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 text-[11px] font-bold">抖音美食测评</span>
                      </div>
                      <span class="text-slate-400 text-xs font-mono">2026-08-19 11:20 · 上海</span>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                    💖 极度好评 (96%)
                  </span>
                </div>
                <p class="text-slate-700 text-xs leading-relaxed font-medium">
                  “【加州鲈盲测开箱】清蒸 8 分钟开盖真的一点土腥味都没有！肉质像蒜瓣一样紧致 Q 弹！最绝的是扫包装上的一物一码，能直接看到这条鱼在工厂恒温水槽里 21 天的生长延时视频，工业化养殖确实强！”
                </p>
                <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500 font-mono text-xs">
                  <div class="flex items-center gap-3">
                    <span>❤️ 1.8w 赞</span>
                    <span>💬 1,240 评论</span>
                    <span>▶️ 18.5w 播放</span>
                  </div>
                  <span class="text-slate-900 font-bold">带货转化: 86 份</span>
                </div>
              </div>

              <!-- 帖子 3: 小红书成分党横向测评 -->
              <div onclick="RetailCopilotController.showSocialDetail('post-3')" class="p-4 rounded-2xl bg-white border border-indigo-200 hover:border-indigo-400 hover:shadow-md transition cursor-pointer space-y-2.5">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-2.5">
                    <span class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm shrink-0">📕</span>
                    <div>
                      <div class="flex items-center gap-1.5">
                        <strong class="text-slate-900 text-xs">@硬核成分党Dr.Li (粉丝 28w)</strong>
                        <span class="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 text-[11px] font-bold">食品科学博士</span>
                      </div>
                      <span class="text-slate-400 text-xs font-mono">2026-08-18 19:40 · 北京</span>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs border border-indigo-300">
                    🔬 专业背书 (98%)
                  </span>
                </div>
                <p class="text-slate-700 text-xs leading-relaxed font-medium">
                  “横评了市面上 6 款号称‘水培有机’的生菜。碧波鲜源的糖度达到了 4.3°Bx（普通水培只有 2.5），果胶硬度 820g，完全没有化肥水培菜那种水哒哒软塌塌的口感。他们的鱼菜共生微生态系统确实把硝态氮转化做得极其彻底。”
                </p>
                <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500 font-mono text-xs">
                  <div class="flex items-center gap-3">
                    <span>❤️ 4,520 赞</span>
                    <span>💬 520 评论</span>
                    <span>⭐ 3,890 收藏</span>
                  </div>
                  <span class="text-indigo-700 font-bold">带货转化: 210 年卡</span>
                </div>
              </div>

              <!-- 帖子 4: 抖音消费者提问 (中性/新品需求线索) -->
              <div onclick="RetailCopilotController.showSocialDetail('post-4')" class="p-4 rounded-2xl bg-white border border-amber-200 hover:border-amber-400 hover:shadow-md transition cursor-pointer space-y-2.5">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-2.5">
                    <span class="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-sm shrink-0">🎵</span>
                    <div>
                      <div class="flex items-center gap-1.5">
                        <strong class="text-slate-900 text-xs">@减脂期的小甜 (真实买家)</strong>
                        <span class="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[11px] font-bold">周订会员</span>
                      </div>
                      <span class="text-slate-400 text-xs font-mono">2026-08-18 16:30 · 深圳</span>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs border border-amber-300">
                    💡 新品需求线索
                  </span>
                </div>
                <p class="text-slate-700 text-xs leading-relaxed font-medium">
                  “生菜和鲈鱼都很棒，但现在减脂打工人真的很需要【羽衣甘蓝鲜榨汁组合包】和【免浆免洗黑鱼/鲈鱼片】！希望能尽快上线新 SKU，我一定每周订！”
                </p>
                <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500 font-mono text-xs">
                  <div class="flex items-center gap-3">
                    <span>❤️ 340 赞</span>
                    <span>💬 86 评论</span>
                  </div>
                  <span class="text-amber-700 font-bold">AI 识别: 爆款新品高潜</span>
                </div>
              </div>

            </div>

          </div>

          <!-- 右侧: 💡 AI 市场舆情洞察与三大智能行动引擎 (5列) -->
          <div class="lg:col-span-5 space-y-3 font-sans text-xs">
            
            <div class="flex items-center justify-between">
              <span class="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <span>💡</span> AI 舆情洞察与行动引擎 (Actionable Copilot)
              </span>
              <span class="text-xs text-rose-700 font-bold font-mono">4 项行动已生成</span>
            </div>

            <div class="space-y-3">
              
              <!-- 行动 1: 爆款新品直连研发主管试验舱 -->
              <div class="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-white border-2 border-rose-300 space-y-2.5 shadow-sm">
                <div class="flex items-center justify-between">
                  <span class="font-extrabold text-rose-950 text-xs flex items-center gap-1">
                    <span>🚀</span> [爆款新品雷达] 羽衣甘蓝与免浆鱼柳
                  </span>
                  <span class="px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-bold text-[11px]">搜索量 +340%</span>
                </div>
                <p class="text-slate-600 text-xs leading-relaxed font-medium">
                  小红书与抖音近 7 天“羽衣甘蓝抗氧化”与“免浆低脂鱼片”声量暴涨 340%，已有 42 位周订会员在评论区请愿。
                </p>
                <div class="pt-2 border-t border-rose-100 flex items-center justify-between">
                  <span class="text-slate-500 text-xs">建议: 派发研发中试</span>
                  <button 
                    onclick="RetailCopilotController.dispatchNewProductToRnd()" 
                    class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white font-extrabold text-xs shadow-sm transition cursor-pointer flex items-center gap-1">
                    <span>🧬</span> 一键派发研发主管试验舱
                  </button>
                </div>
              </div>

              <!-- 行动 2: 包装与规格优化建议 -->
              <div class="p-4 rounded-2xl bg-white border border-teal-200 space-y-2.5 shadow-sm">
                <div class="flex items-center justify-between">
                  <span class="font-extrabold text-teal-950 text-xs flex items-center gap-1">
                    <span>📦</span> [包装规格升级] 200g 便携双拼鲜萃盒
                  </span>
                  <span class="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold text-[11px]">好评率提振</span>
                </div>
                <p class="text-slate-600 text-xs leading-relaxed font-medium">
                  28% 单身与双人中产家庭反馈 500g 生菜分量偏大，建议推出“200g 奶油生菜 + 茼蒿”免洗便携双拼盒。
                </p>
                <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span class="text-slate-500 text-xs">预期溢价提升: +15%</span>
                  <button 
                    onclick="RetailCopilotController.applyPackagingUpgrade()" 
                    class="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition cursor-pointer shadow-xs">
                    下发包装线打样
                  </button>
                </div>
              </div>

              <!-- 行动 3: 成分党公关与科普短视频生成 -->
              <div class="p-4 rounded-2xl bg-white border border-indigo-200 space-y-2.5 shadow-sm">
                <div class="flex items-center justify-between">
                  <span class="font-extrabold text-indigo-950 text-xs flex items-center gap-1">
                    <span>📄</span> [成分党公关] 鱼粪生物转化科普脚本
                  </span>
                  <span class="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold text-[11px]">信任筑基</span>
                </div>
                <p class="text-slate-600 text-xs leading-relaxed font-medium">
                  针对个别新用户对水培肥料的顾虑，AI 已自动调取出厂 e-COA 盲测单生成 60s 科普短视频脚本。
                </p>
                <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span class="text-indigo-800 text-xs font-bold font-mono">附带 e-COA 报告</span>
                  <button 
                    onclick="RetailCopilotController.generatePrContent()" 
                    class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer shadow-xs">
                    生成并分发公关文案
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      <!-- 4. 🤖 AI 智能客服工单流与零售经理决策 Copilot (原会员客诉处理流) -->
      <div class="glass-card rounded-2xl p-6 space-y-5 border border-emerald-200 shadow-md">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-100 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xl shadow-md shadow-purple-500/20">
              🤖
            </div>
            <div>
              <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
                AI 会员私域客服工单流与即时服务响应
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

            <div id="member-ticket-stream" class="space-y-3 font-sans text-xs max-h-[340px] overflow-y-auto pr-1">
              <!-- 由 data-engine.js 动态渲染 -->
            </div>
          </div>

          <!-- 右侧: AI 零售决策 Copilot 建议卡片 (5列) -->
          <div class="lg:col-span-5 space-y-3 font-sans text-xs">
            <span class="font-bold text-slate-900 block flex items-center gap-1.5">
              <span>💡</span> AI 私域留存与客诉关怀行动
            </span>

            <div class="space-y-3">
              
              <!-- 建议 1: 选品排产 -->
              <div class="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-purple-900 text-xs">🌱 私域周配品类调整 (置信度 94%)</span>
                  <span class="text-xs px-1.5 py-0.5 rounded bg-purple-200 text-purple-800 font-bold">高频诉求</span>
                </div>
                <p class="text-slate-600 text-xs leading-relaxed">
                  近 7 天有 <strong class="text-purple-800 font-mono">24 位会员</strong> 在小程序建议增加“嫩叶羽衣甘蓝”与“芝麻菜”周配选项。
                </p>
                <div class="flex items-center justify-between pt-1 border-t border-purple-100">
                  <span class="text-xs text-emerald-700 font-bold">建议: 将 #04 跑道 20% 面积切换</span>
                  <button onclick="DataEngine.applyAICopilotSuggestion('crop')" class="px-2.5 py-1 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs cursor-pointer shadow-sm">
                    一键采纳排产
                  </button>
                </div>
              </div>

              <!-- 建议 2: 冷链温控 -->
              <div class="p-3.5 rounded-xl bg-teal-50/80 border border-teal-200 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-teal-900 text-xs">❄️ 冷链温控策略优化 (置信度 91%)</span>
                  <span class="text-xs px-1.5 py-0.5 rounded bg-teal-200 text-teal-800 font-bold">风险预警</span>
                </div>
                <p class="text-slate-600 text-xs leading-relaxed">
                  检测到 2 起夏季午间末端配送微温差反馈。
                </p>
                <div class="flex items-center justify-between pt-1 border-t border-teal-100">
                  <span class="text-xs text-teal-800 font-bold">建议: 增投 150g 相变蓄冷冰袋</span>
                  <button onclick="DataEngine.applyAICopilotSuggestion('coldchain')" class="px-2.5 py-1 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs cursor-pointer shadow-sm">
                    下发冷链工单
                  </button>
                </div>
              </div>

              <!-- 建议 3: 会员流失挽留 -->
              <div class="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-amber-900 text-xs">👑 高净值年卡会员续费关怀 (置信度 96%)</span>
                  <span class="text-xs px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 font-bold">VIP 关怀</span>
                </div>
                <p class="text-slate-600 text-xs leading-relaxed">
                  有 <strong class="text-amber-800 font-mono">15 位认养年卡会员</strong> 处于最后 30 天周期。
                </p>
                <div class="flex items-center justify-between pt-1 border-t border-amber-100">
                  <span class="text-xs text-amber-800 font-bold">建议: 自动派发 VIP 续费礼遇券</span>
                  <button onclick="DataEngine.applyAICopilotSuggestion('vip')" class="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer shadow-sm">
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
