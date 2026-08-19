/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * 视图 8: 📱 C端会员手机小程序与 AI 智能互动体验
 * =========================================================================
 */
window.ViewTemplates = window.ViewTemplates || {};
window.ViewTemplates['view-b2c'] = `
    <!-- ----------------------------------------------------------------------- -->
    <!-- 视图 8: 📱 C端会员手机小程序与 AI 智能互动体验 -->
    <!-- ----------------------------------------------------------------------- -->
    <div id="view-b2c" class="view-panel hidden flex justify-center py-6">
      
      <div class="w-full max-w-[420px] bg-white rounded-[44px] p-3.5 shadow-2xl border-4 border-slate-300 relative overflow-hidden">
        
        <!-- 手机听筒与前摄 -->
        <div class="w-28 h-4 bg-slate-900 rounded-full mx-auto mb-2 relative z-20 flex items-center justify-center">
          <div class="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-teal-900"></div>
        </div>

        <div class="bg-slate-50 rounded-[34px] p-4 text-slate-800 space-y-4 font-sans text-xs overflow-y-auto max-h-[720px] scrollbar-none">
          
          <!-- 会员小程序顶部 Tab 切换 -->
          <div class="flex items-center justify-center gap-2 bg-slate-200/80 p-1 rounded-xl">
            <button onclick="DataEngine.switchMiniAppTab('trace')" id="tab-btn-trace" class="flex-1 py-1.5 rounded-lg font-bold text-xs bg-white text-slate-900 shadow-sm transition">
              🌿 溯源与生长
            </button>
            <button onclick="DataEngine.switchMiniAppTab('service')" id="tab-btn-service" class="flex-1 py-1.5 rounded-lg font-bold text-xs text-slate-600 hover:text-slate-900 transition">
              💬 会员管家与 AI 客服
            </button>
          </div>

          <!-- Tab 1: 溯源与生长足迹 -->
          <div id="miniapp-tab-trace" class="space-y-4">
            <div class="rounded-2xl bg-gradient-to-b from-emerald-100 to-teal-50 p-4 border border-emerald-300 text-center space-y-2">
              <div class="inline-block px-2.5 py-0.5 bg-emerald-600 text-white font-extrabold text-xs rounded-full shadow-sm">
                一物一码 · 纯净免洗
              </div>
              <h3 class="text-base font-black text-slate-900">🌿 数字化生菜 · 全生命周期数字身份证</h3>
              <p class="text-xs text-emerald-800 font-mono">批次追溯码: #AQ-20260819-0932</p>
            </div>

            <div class="grid grid-cols-3 gap-2.5 text-center text-xs font-sans">
              <div class="p-2.5 bg-white rounded-xl border border-emerald-200 shadow-sm">
                <span class="text-emerald-700 text-lg font-black block">0</span>
                <span class="text-slate-600 font-bold">化学农药</span>
              </div>
              <div class="p-2.5 bg-white rounded-xl border border-emerald-200 shadow-sm">
                <span class="text-teal-700 text-lg font-black block">0</span>
                <span class="text-slate-600 font-bold">抗生素</span>
              </div>
              <div class="p-2.5 bg-white rounded-xl border border-emerald-200 shadow-sm">
                <span class="text-emerald-700 text-lg font-black block">95%</span>
                <span class="text-slate-600 font-bold">循环节水</span>
              </div>
            </div>

            <div class="p-3.5 bg-emerald-100/70 border border-emerald-300 rounded-xl flex items-center gap-3">
              <span class="text-2xl">🌱</span>
              <div>
                <div class="font-extrabold text-emerald-900 text-xs">这盒生菜为您减碳 142.5g</div>
                <div class="text-xs text-slate-600 mt-0.5">采用温室智能热泵夜间绿电蓄热技术</div>
              </div>
            </div>

            <div class="space-y-2">
              <h4 class="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <span>📅</span> 21 天纯净生长足迹
              </h4>
              
              <div class="border-l-2 border-emerald-500 ml-2 pl-3 space-y-3 text-xs">
                <div>
                  <span class="text-emerald-800 font-bold font-mono">第 1 天 · 种子萌发</span>
                  <p class="text-slate-600 text-xs mt-0.5">在恒温无菌苗床定植发芽</p>
                </div>
                <div>
                  <span class="text-emerald-800 font-bold font-mono">第 10 天 · 鱼菜循环滋养</span>
                  <p class="text-slate-600 text-xs mt-0.5">吸收有益硝酸盐，水温 21°C，溶氧 6.8 mg/L</p>
                </div>
                <div>
                  <span class="text-emerald-800 font-bold font-mono">第 21 天 · 机械臂无菌采收</span>
                  <p class="text-slate-600 text-xs mt-0.5">自动切根封装，全程无手触，4°C冷链配送</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab 2: 会员管家与 AI 客服互动 -->
          <div id="miniapp-tab-service" class="hidden space-y-4">
            
            <!-- 会员身份与订购卡片 -->
            <div class="p-3.5 bg-gradient-to-br from-purple-50 via-white to-purple-50 rounded-2xl border border-purple-200 space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-black text-slate-900 text-xs">👑 钻石认养会员 · 张女士</span>
                <span class="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold font-mono">年卡第 142 天</span>
              </div>
              <div class="text-xs text-slate-600 font-mono space-y-0.5">
                <div>📦 <strong>本周五鲜配</strong>: 顺丰冷链运输中 (2.8°C 恒温)</div>
                <div>🌱 <strong>专属认养槽</strong>: #RA-B03-R02C04 (生长第16天 / 210g)</div>
              </div>
            </div>

            <!-- AI 在线客服交互窗口 -->
            <div class="p-3 bg-white rounded-2xl border border-slate-200 space-y-3">
              <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                <span class="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  🤖 AI 智能农庄管家 (在线秒回)
                </span>
                <span class="text-xs text-slate-400 font-mono">调取全量批次质检档案</span>
              </div>

              <!-- 快捷提报按钮 -->
              <div class="space-y-1.5">
                <span class="text-xs text-slate-500 block">点击快捷提交诉求：</span>
                <div class="flex flex-wrap gap-1.5 text-xs">
                  <button onclick="DataEngine.quickSendFeedback('这周收到的生菜有两片外叶微黄，希望注意冷链保温')" class="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg border border-purple-200 cursor-pointer">
                    🥬 反馈生菜微黄
                  </button>
                  <button onclick="DataEngine.quickSendFeedback('建议下周周配增加羽衣甘蓝或芝麻菜品种')" class="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 cursor-pointer">
                    🌱 建议增加羽衣甘蓝
                  </button>
                  <button onclick="DataEngine.quickSendFeedback('查询我专属认养浮板的最新高清生长慢直播机位')" class="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg border border-teal-200 cursor-pointer">
                    📹 查看专属认养机位
                  </button>
                </div>
              </div>

              <!-- 聊天气泡区域 -->
              <div id="miniapp-chat-bubbles" class="space-y-2.5 max-h-48 overflow-y-auto font-sans text-xs pr-1">
                <div class="bg-slate-100 p-2.5 rounded-xl rounded-tl-none text-slate-800 text-xs leading-relaxed">
                  您好，张女士！我是您的专属 AI 农庄管家。您订购的产品状态正常，若对生长品质或周配选品有任何投诉与建议，随时告诉我，我将秒级为您解答与关怀处理！
                </div>
              </div>

              <!-- 输入框 -->
              <div class="flex gap-1.5 pt-1">
                <input type="text" id="miniapp-input-text" placeholder="输入投诉、建议或选品需求..." class="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-500">
                <button onclick="DataEngine.handleCustomFeedbackInput()" class="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm whitespace-nowrap">
                  发送
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
`;
