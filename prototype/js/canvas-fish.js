/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * canvas-fish.js: AI 鱼群摄食行为识别与 YOLO11 视觉扰动仿真动画
 * =========================================================================
 */

function initFishFeedingCanvas() {
  const canvas = document.getElementById('canvas-fish');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = 480;
  canvas.height = 270;

  // 生成游动鱼群粒子
  let fishList = [];
  for (let i = 0; i < 35; i++) {
    fishList.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2.2,
      vy: (Math.random() - 0.5) * 2.2,
      size: Math.random() * 4 + 3,
    });
  }

  function render() {
    // 1. 深水背景
    ctx.fillStyle = '#06101e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. 模拟水面波纹
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.15)';
    ctx.lineWidth = 1;
    for (let r = 20; r < 200; r += 40) {
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 3. 绘制鱼群游动并更新位置
    fishList.forEach(fish => {
      fish.x += fish.vx;
      fish.y += fish.vy;

      // 边界碰撞反弹
      if (fish.x < 10 || fish.x > canvas.width - 10) fish.vx *= -1;
      if (fish.y < 10 || fish.y > canvas.height - 10) fish.vy *= -1;

      // 绘制鱼形粒子
      ctx.fillStyle = 'rgba(52, 211, 153, 0.85)';
      ctx.beginPath();
      ctx.ellipse(fish.x, fish.y, fish.size * 1.8, fish.size, Math.atan2(fish.vy, fish.vx), 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. 叠加载入 YOLO11 AI 目标检测框与聚拢度置信度标签
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.strokeRect(140, 60, 200, 150);

    // 标签背景
    ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
    ctx.fillRect(140, 42, 135, 18);

    // 标签文字
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 10px JetBrains Mono';
    ctx.fillText('YOLO11: Fish School 88%', 145, 55);

    requestAnimationFrame(render);
  }

  render();
}
