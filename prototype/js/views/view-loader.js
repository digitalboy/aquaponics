/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * 视图自动加载与挂载引擎 (View Loader)
 * 作用：将各个模块化视图模板挂载至 DOM 容器，支持本地直接无服务器 file:/// 零延迟运行
 * =========================================================================
 */
(function() {
  const mainContainer = document.getElementById('main-view-container');
  const modalsContainer = document.getElementById('modals-container');

  if (!window.ViewTemplates) {
    console.error('[ViewLoader] ViewTemplates 未定义');
    return;
  }

  const viewOrder = [
    'view-investor',
    'view-aquaculture',
    'view-hydroponics',
    'view-energy',
    'view-supply-chain',
    'view-b2b-fulfillment',
    'view-b2b',
    'view-b2c'
  ];

  if (mainContainer) {
    let mainHtml = '';
    viewOrder.forEach(key => {
      if (window.ViewTemplates[key]) {
        mainHtml += window.ViewTemplates[key] + '\n';
      }
    });
    mainContainer.innerHTML = mainHtml;
  }

  if (modalsContainer && window.ViewTemplates['modals']) {
    modalsContainer.innerHTML = window.ViewTemplates['modals'];
  }
})();
