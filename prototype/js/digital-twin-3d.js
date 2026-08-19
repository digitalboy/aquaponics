/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * digital-twin-3d.js: Three.js 3D 全景温室数字孪生引擎 (高清晰高对比度立体工业风)
 * 48m 水培/种植试验区 + 116m RAS 养殖区完整 3D 几何建模、平滑运镜与射线拾取
 * =========================================================================
 */

const DigitalTwin3D = {
  container: null,
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  raycaster: null,
  mouse: null,

  // 可交互实体 Mesh 列表
  interactiveMeshes: [],
  // 需执行微行动画的对象 (水波纹旋转等)
  animatedObjects: [],

  // 相机平滑运镜插值状态 (Lerp)
  isLerpingCamera: false,
  targetCameraPos: null,
  targetLookAt: null,
  hoveredMesh: null,

  // ---------------------------------------------------------------------------
  // 🚀 科技感 3 秒自动巡检轮巡状态机 (Auto Cruise Tour Engine)
  // 循环路径：🐟 鱼池 (fish) ➔ 🥬 菜池 (vege) ➔ ⚡ 强电柜 (cabinet-hv) ➔ 📡 弱电柜 (cabinet-lv)
  // ---------------------------------------------------------------------------
  tourSteps: ['fish', 'vege', 'cabinet-hv', 'cabinet-lv'],
  tourIndex: 0,
  isTourActive: true,          // 默认开启 3 秒科技感自动轮巡
  tourRemainingMs: 3000,       // 距离下次切换的剩余毫秒数
  tourInterval: null,          // 100ms 高频倒计时刷新心跳
  userManualOverride: false,   // 用户是否正在手动接管
  manualOverrideTimer: null,   // 手动接管超时恢复定时器

  /**
   * 初始化 3D 视口 (清晰明朗、立体高对比度)
   * @param {string} containerId 挂载 DOM 容器 ID
   */
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // 1. 场景 (清新浅空灰绿，提供优良对比基底)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdcfce7);
    this.scene.fog = new THREE.FogExp2(0xdcfce7, 0.0018);

    // 2. 相机 (精准俯仰全景)
    this.camera = new THREE.PerspectiveCamera(40, width / height, 1, 1200);
    this.camera.position.set(-50, 95, 140);

    // 3. 渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);

    // 4. 轨道控制器 OrbitControls
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
      this.controls.minDistance = 15;
      this.controls.maxDistance = 350;
      this.controls.target.set(10, 0, 0);

      // 💡 监听用户鼠标手动拖拽旋转，智能切换为临时接管模式，避免强行打断用户体验
      this.controls.addEventListener('start', () => {
        this.pauseTourTemporarily();
      });
    }

    // 5. 光源配置 (强立体阴影与多方向照明)
    this.setupLighting();

    // 6. 场景地面与空间坐标网格 (高清晰深灰混凝土地坪 + 翠绿工业标线)
    this.buildGround();

    // 7. 构建左区温室 (48m × 48m × 8.1m): 水培蔬菜跑道 + 12座种植试验舱
    this.buildLeftPavilion();

    // 8. 构建右区温室 (116m × 35m × 8.1m): 10座圆形RAS鱼池 + 8.1m立体温控柱 + 桥架
    this.buildRightPavilion();

    // 9. 构建室内多光谱巡检无人机与自动机巢 (主力巡检 · 零铺轨)
    this.buildDroneAndDock();

    // 10. 射线拾取与鼠标事件
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.setupInteractions();

    // 10. 窗口缩放响应
    window.addEventListener('resize', () => this.onWindowResize());

    // 11. 启动 60FPS 渲染循环
    this.animate();

    // 12. 启动 3 秒自动轮巡巡检引擎
    this.startAutoTour();
  },

  /**
   * 光源布置 (强化明暗交界与立体感)
   */
  setupLighting() {
    // 环境天光 (柔和通透)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    this.scene.add(ambientLight);

    // 主平行阳光 (投射清晰阴影，赋予模型厚重体积感)
    const mainSun = new THREE.DirectionalLight(0xffffff, 1.8);
    mainSun.position.set(50, 100, 60);
    mainSun.castShadow = true;
    mainSun.shadow.mapSize.width = 2048;
    mainSun.shadow.mapSize.height = 2048;
    mainSun.shadow.bias = -0.0005;
    this.scene.add(mainSun);

    // 侧向补光 (提升左侧暗部细节)
    const fillLight = new THREE.DirectionalLight(0xa7f3d0, 0.8);
    fillLight.position.set(-60, 50, -50);
    this.scene.add(fillLight);
  },

  /**
   * 地面基础 (雅致浅灰地坪 + 淡雅半透明微网格)
   */
  buildGround() {
    const floorGeo = new THREE.PlaneGeometry(320, 220);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9, // 温润浅灰地坪，干净通透
      roughness: 0.6,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // 淡雅极简工业坐标网格 (32 分格，半透明微弱标线)
    const gridHelper = new THREE.GridHelper(320, 32, 0x10b981, 0x94a3b8);
    gridHelper.position.y = 0.05;
    if (gridHelper.material) {
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = 0.28; // 更淡、更雅致、不抢眼
    }
    this.scene.add(gridHelper);
  },

  /**
   * 构建左区温室 (48m × 48m × 8.1m): 水培蔬菜跑道 + 12座种植试验舱
   */
  buildLeftPavilion() {
    const group = new THREE.Group();
    group.position.set(-45, 0, 0);

    const width = 48;
    const length = 48;
    const height = 8.1;

    // 1. 半透明高透玻璃外罩
    const glassGeo = new THREE.BoxGeometry(width, height, length);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.12,
      roughness: 0.05,
      transmission: 0.94,
      thickness: 0.5,
      depthWrite: false
    });
    const glassBox = new THREE.Mesh(glassGeo, glassMat);
    glassBox.position.y = height / 2;
    group.add(glassBox);

    // 玻璃外框边线 (清晰深绿骨架线)
    const edges = new THREE.EdgesGeometry(glassGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x047857, linewidth: 2.5 });
    const line = new THREE.LineSegments(edges, lineMat);
    line.position.y = height / 2;
    group.add(line);

    // 2. 长条形水培蔬菜跑道 (分布于上下两侧)
    const racewayConfigs = [
      { id: 'raceway-a', name: '🥬 菜池 #A 槽 (特级奶油生菜)', z: -16 },
      { id: 'raceway-b', name: '🥬 菜池 #B 槽 (罗马脆生菜)', z: -10 },
      { id: 'raceway-c', name: '🥬 菜池 #C 槽 (无菌罗勒)', z: 10 },
      { id: 'raceway-d', name: '🥬 菜池 #D 槽 (嫩叶芝麻菜)', z: 16 }
    ];

    racewayConfigs.forEach(cfg => {
      // 蔬菜跑道床身 (清晰白色槽体带深色底座)
      const bedGeo = new THREE.BoxGeometry(40, 1.2, 4.5);
      const bedMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.4,
        metalness: 0.2
      });
      const bed = new THREE.Mesh(bedGeo, bedMat);
      bed.position.set(0, 0.6, cfg.z);
      bed.castShadow = true;
      bed.receiveShadow = true;

      bed.userData = { id: cfg.id, type: 'raceway', name: cfg.name };
      this.interactiveMeshes.push(bed);
      group.add(bed);

      // 蔬菜浮板植被层 (鲜嫩生机浓绿，高清晰度)
      const plantGeo = new THREE.BoxGeometry(39.2, 0.25, 3.8);
      const plantMat = new THREE.MeshStandardMaterial({
        color: 0x16a34a,
        emissive: 0x15803d,
        emissiveIntensity: 0.25,
        roughness: 0.3
      });
      const plants = new THREE.Mesh(plantGeo, plantMat);
      plants.position.set(0, 1.25, cfg.z);
      group.add(plants);

      // 上方红粉补光灯架 (Grow LED Light)
      const lightGeo = new THREE.BoxGeometry(38, 0.15, 0.4);
      const lightMat = new THREE.MeshStandardMaterial({
        color: 0xe11d48,
        emissive: 0xf43f5e,
        emissiveIntensity: 0.8
      });
      const ledBar = new THREE.Mesh(lightGeo, lightMat);
      ledBar.position.set(0, 4.2, cfg.z);
      group.add(ledBar);
    });

    // 3. 中间区域: 12 座立体种植试验舱 (2 行 × 6 列)
    const nurseryWidth = 3.6;
    const nurseryLength = 3.6;
    const nurseryHeight = 2.4;

    let cubeIndex = 1;
    for (let row = -1; row <= 1; row += 2) {
      for (let col = -2.5; col <= 2.5; col += 1) {
        // 试验舱主体 (深蓝底座 + 洁白舱体)
        const cubeGeo = new THREE.BoxGeometry(nurseryWidth, nurseryHeight, nurseryLength);
        const cubeMat = new THREE.MeshStandardMaterial({
          color: 0x0f766e,
          roughness: 0.3,
          metalness: 0.3
        });
        const cube = new THREE.Mesh(cubeGeo, cubeMat);
        cube.position.set(col * 6.5, nurseryHeight / 2, row * 4.0);
        cube.castShadow = true;
        cube.receiveShadow = true;

        const blockId = `nursery-${cubeIndex}`;
        cube.userData = {
          id: blockId,
          type: 'nursery',
          name: `🌱 种植试验舱 #${cubeIndex.toString().padStart(2, '0')}`
        };
        this.interactiveMeshes.push(cube);
        group.add(cube);

        // 试验舱发光观察窗 (亮薄荷绿)
        const winGeo = new THREE.PlaneGeometry(2.6, 1.4);
        const winMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
        const win = new THREE.Mesh(winGeo, winMat);
        win.position.set(col * 6.5, 1.4, row * 4.0 + (row > 0 ? 1.81 : -1.81));
        if (row < 0) win.rotation.y = Math.PI;
        group.add(win);

        // 试验舱顶部科技光环
        const roofGeo = new THREE.BoxGeometry(nurseryWidth * 0.9, 0.1, nurseryLength * 0.9);
        const roofMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.set(col * 6.5, nurseryHeight + 0.05, row * 4.0);
        group.add(roof);

        cubeIndex++;
      }
    }

    this.scene.add(group);
  },

  /**
   * 构建右区温室 (116m × 35m × 8.1m): 10座圆形RAS鱼池 + 8.1m立体温控立柱 + 桥架
   */
  buildRightPavilion() {
    const group = new THREE.Group();
    group.position.set(45, 0, 0);

    const width = 116;
    const length = 35;
    const height = 8.1;

    // 1. 半透明高透玻璃外罩
    const glassGeo = new THREE.BoxGeometry(width, height, length);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.12,
      roughness: 0.05,
      transmission: 0.94,
      thickness: 0.5,
      depthWrite: false
    });
    const glassBox = new THREE.Mesh(glassGeo, glassMat);
    glassBox.position.y = height / 2;
    group.add(glassBox);

    const edges = new THREE.EdgesGeometry(glassGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x047857, linewidth: 2.5 });
    const line = new THREE.LineSegments(edges, lineMat);
    line.position.y = height / 2;
    group.add(line);

    // 2. 10 座圆形 RAS 养殖鱼池 (高饱和、清晰深蓝外壁与碧波水面)
    const tankLayouts = [
      { id: 'tank-1', name: '🐟 鱼池 #01 (加州鲈鱼成鱼池)', radius: 6.5, x: -42, z: 7 },
      { id: 'tank-2', name: '🐟 鱼池 #02 (加州鲈鱼育成池)', radius: 6.5, x: -24, z: 7 },
      { id: 'tank-3', name: '🐟 鱼池 #03 (黑鱼养殖池)', radius: 6.0, x: -7, z: 7 },
      { id: 'tank-4', name: '🐟 鱼池 #04 (银鳕鱼高密池)', radius: 6.0, x: 10, z: 7 },
      { id: 'tank-5', name: '🐟 鱼池 #05 (草鱼生态池)', radius: 4.8, x: -40, z: -7 },
      { id: 'tank-6', name: '🐟 鱼池 #06 (鲈鱼分选池)', radius: 4.5, x: -25, z: -7 },
      { id: 'tank-7', name: '🐟 鱼池 #07 (水质净化鱼池)', radius: 4.2, x: -12, z: -7 },
      { id: 'tank-8', name: '🐟 鱼池 #08 (幼鱼标粗池)', radius: 4.0, x: 0, z: -7 },
      { id: 'tank-9', name: '🐟 鱼池 #09 (鱼苗繁育池)', radius: 3.5, x: 12, z: -7 },
      { id: 'tank-10', name: '🐟 鱼池 #10 (备用隔离池)', radius: 3.5, x: 23, z: -7 }
    ];

    tankLayouts.forEach(t => {
      // 鱼池外壁 (深海蓝工业圆柱，对比极其鲜明)
      const tankGeo = new THREE.CylinderGeometry(t.radius, t.radius, 2.8, 32);
      const tankMat = new THREE.MeshStandardMaterial({
        color: 0x0369a1,
        roughness: 0.3,
        metalness: 0.3
      });
      const tankMesh = new THREE.Mesh(tankGeo, tankMat);
      tankMesh.position.set(t.x, 1.4, t.z);
      tankMesh.castShadow = true;
      tankMesh.receiveShadow = true;

      tankMesh.userData = { id: t.id, type: 'fish-tank', name: t.name };
      this.interactiveMeshes.push(tankMesh);
      group.add(tankMesh);

      // 鱼池顶部深色边缘封边 (增加精致机械轮廓)
      const rimGeo = new THREE.TorusGeometry(t.radius, 0.15, 8, 32);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.rotation.x = Math.PI / 2;
      rimMesh.position.set(t.x, 2.8, t.z);
      group.add(rimMesh);

      // 水面发光顶盖 (清澈碧波水光)
      const waterGeo = new THREE.CircleGeometry(t.radius - 0.2, 32);
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x0284c7,
        emissiveIntensity: 0.45,
        roughness: 0.1,
        metalness: 0.7,
        transparent: true,
        opacity: 0.9
      });
      const waterPlane = new THREE.Mesh(waterGeo, waterMat);
      waterPlane.rotation.x = -Math.PI / 2;
      waterPlane.position.set(t.x, 2.7, t.z);
      this.animatedObjects.push(waterPlane);
      group.add(waterPlane);

      // 传感器支架与探头模型
      const rodGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2);
      const rodMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
      const rod = new THREE.Mesh(rodGeo, rodMat);
      rod.position.set(t.x + t.radius * 0.7, 2.6, t.z);
      group.add(rod);

      const sensorTip = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x10b981 })
      );
      sensorTip.position.set(t.x + t.radius * 0.7, 3.7, t.z);
      group.add(sensorTip);
    });

    // 3. 6 根垂直测温立柱
    const pillarPositions = [
      { x: -35, z: 0 }, { x: -18, z: 0 }, { x: -3, z: 0 },
      { x: 12, z: 0 }, { x: 28, z: 0 }, { x: 42, z: 0 }
    ];

    pillarPositions.forEach((pos) => {
      const poleGeo = new THREE.CylinderGeometry(0.25, 0.25, 8.1, 16);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(pos.x, 4.05, pos.z);
      group.add(pole);

      // L1 (1.2m) - 冠层温度发光球
      const l1 = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
      l1.position.set(pos.x, 1.2, pos.z);
      group.add(l1);

      // L2 (3.8m) - 中层混风发光球
      const l2 = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
      l2.position.set(pos.x, 3.8, pos.z);
      group.add(l2);

      // L3 (7.5m) - 顶脊热滞发光球
      const l3 = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), new THREE.MeshBasicMaterial({ color: 0xd97706 }));
      l3.position.set(pos.x, 7.5, pos.z);
      group.add(l3);
    });

    // 4. 桥架横梁
    const cableTrayGeo = new THREE.BoxGeometry(110, 0.4, 1.2);
    const cableTrayMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.8,
      roughness: 0.2
    });
    const cableTray = new THREE.Mesh(cableTrayGeo, cableTrayMat);
    cableTray.position.set(0, 6.2, 0);
    group.add(cableTray);

    // 5. 靠墙并排放置的【强电动力柜】与【弱电自动化柜】
    // (1) ⚡ 强电动力配电柜 (380V 三相主动力 / 威胜0.5S智能电表 / 丁本CT互感器)
    const cabinetHVGeo = new THREE.BoxGeometry(2.5, 4.5, 4.0);
    const cabinetHVMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // 沉稳深色工业冷轧钢
      metalness: 0.7,
      roughness: 0.3
    });
    const cabinetHV = new THREE.Mesh(cabinetHVGeo, cabinetHVMat);
    cabinetHV.position.set(50, 2.25, -3.2);
    cabinetHV.castShadow = true;
    cabinetHV.receiveShadow = true;
    cabinetHV.userData = {
      id: 'cabinet-hv',
      type: 'cabinet-hv',
      name: '⚡ 强电动力配电柜 (380V主动力/威胜电表)'
    };
    this.interactiveMeshes.push(cabinetHV);
    group.add(cabinetHV);

    // 强电柜警示铭牌 (明黄高压电标识)
    const plateHVGeo = new THREE.PlaneGeometry(0.1, 1.2, 2.0);
    const plateHVMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const plateHV = new THREE.Mesh(plateHVGeo, plateHVMat);
    plateHV.position.set(48.7, 2.8, -3.2);
    group.add(plateHV);

    // (2) 📡 弱电自动化控制柜 (汇川 Easy320 PLC / 24V DC / 隔离安全栅 / 485 Modbus)
    const cabinetLVGeo = new THREE.BoxGeometry(2.5, 4.5, 4.0);
    const cabinetLVMat = new THREE.MeshStandardMaterial({
      color: 0x0f766e, // 现代翡翠工业绿色 PLC 柜体
      metalness: 0.6,
      roughness: 0.3
    });
    const cabinetLV = new THREE.Mesh(cabinetLVGeo, cabinetLVMat);
    cabinetLV.position.set(50, 2.25, 3.2);
    cabinetLV.castShadow = true;
    cabinetLV.receiveShadow = true;
    cabinetLV.userData = {
      id: 'cabinet-lv',
      type: 'cabinet-lv',
      name: '📡 弱电自动化控制柜 (汇川PLC/安全栅/Modbus)'
    };
    this.interactiveMeshes.push(cabinetLV);
    group.add(cabinetLV);

    // 弱电柜运行指示屏 (薄荷绿发光微屏)
    const plateLVGeo = new THREE.PlaneGeometry(0.1, 1.2, 2.0);
    const plateLVMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const plateLV = new THREE.Mesh(plateLVGeo, plateLVMat);
    plateLV.position.set(48.7, 2.8, 3.2);
    group.add(plateLV);

    this.scene.add(group);
  },

  /**
   * 构建室内多光谱巡检无人机与自动机巢 (主力巡检 · 零铺轨)
   */
  buildDroneAndDock() {
    // 1. 自动机巢 (Drone Dock)
    const dockGroup = new THREE.Group();
    dockGroup.position.set(48, 0, 9);

    const baseGeo = new THREE.CylinderGeometry(2.4, 2.7, 0.8, 8);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, metalness: 0.8, roughness: 0.2 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.4;
    dockGroup.add(base);

    // 机巢顶盖发光停机坪标识 (H 标标牌)
    const padGeo = new THREE.CircleGeometry(1.6, 16);
    const padMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.rotation.x = -Math.PI / 2;
    pad.position.y = 0.81;
    dockGroup.add(pad);

    this.scene.add(dockGroup);

    // 2. 悬停巡检微型无人机 (UAV)
    const droneGroup = new THREE.Group();
    droneGroup.position.set(-50, 7.2, 0);

    // 机身
    const bodyGeo = new THREE.BoxGeometry(1.8, 0.4, 1.8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x047857, metalness: 0.9, roughness: 0.1 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    droneGroup.add(body);

    // 4 个发光旋翼
    const armPositions = [
      { x: 1.1, z: 1.1 }, { x: -1.1, z: 1.1 },
      { x: 1.1, z: -1.1 }, { x: -1.1, z: -1.1 }
    ];
    armPositions.forEach(p => {
      const rotorGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 12);
      const rotorMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.8 });
      const rotor = new THREE.Mesh(rotorGeo, rotorMat);
      rotor.position.set(p.x, 0.25, p.z);
      droneGroup.add(rotor);
    });

    // 挂载下视扫描光束 (半透明薄荷绿圆锥)
    const scanGeo = new THREE.ConeGeometry(3.5, 6.5, 16, 1, true);
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const scanBeam = new THREE.Mesh(scanGeo, scanMat);
    scanBeam.position.y = -3.25;
    droneGroup.add(scanBeam);

    this.droneMesh = droneGroup;
    this.droneHoverTime = 0;
    this.scene.add(droneGroup);
  },

  /**
   * 触发无人机自主航测模拟动画
   */
  animateDroneFlight() {
    if (!this.droneMesh) return;
    let t = 0;
    const startX = this.droneMesh.position.x;
    const startZ = this.droneMesh.position.z;
    const interval = setInterval(() => {
      t += 0.06;
      this.droneMesh.position.x = -50 + Math.sin(t * 2) * 16;
      this.droneMesh.position.z = Math.cos(t * 1.5) * 8;
      if (t >= Math.PI * 2) {
        clearInterval(interval);
        this.droneMesh.position.set(startX, 7.2, startZ);
      }
    }, 40);
  },

  /**
   * 鼠标射线交互与悬停高亮
   */
  setupInteractions() {
    const dom = this.renderer.domElement;

    dom.addEventListener('mousemove', (event) => {
      const rect = dom.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactiveMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        dom.style.cursor = 'pointer';

        if (this.hoveredMesh !== hit) {
          this.resetHoverState();
          this.hoveredMesh = hit;
          if (hit.material && hit.material.emissive) {
            hit.userData.origEmissive = hit.material.emissive.getHex();
            hit.material.emissive.setHex(0x10b981);
          }
        }
        this.show3DTooltip(event.clientX, event.clientY, hit.userData.name);
      } else {
        dom.style.cursor = 'default';
        this.resetHoverState();
        this.hide3DTooltip();
      }
    });

    dom.addEventListener('click', (event) => {
      const rect = dom.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactiveMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        this.focusOnEntity(hit);
      }
    });
  },

  resetHoverState() {
    if (this.hoveredMesh) {
      if (this.hoveredMesh.material && this.hoveredMesh.material.emissive && this.hoveredMesh.userData.origEmissive !== undefined) {
        this.hoveredMesh.material.emissive.setHex(this.hoveredMesh.userData.origEmissive);
      }
      this.hoveredMesh = null;
    }
  },

  /**
   * 平滑聚焦到某个 3D 实体 (Lerp Camera)
   */
  focusOnEntity(mesh) {
    const worldPos = new THREE.Vector3();
    mesh.getWorldPosition(worldPos);

    this.targetLookAt = worldPos.clone();
    this.targetCameraPos = new THREE.Vector3(
      worldPos.x + 16,
      worldPos.y + 18,
      worldPos.z + 24
    );

    this.isLerpingCamera = true;

    // 同步更新右侧数据面板
    if (typeof DataEngine !== 'undefined') {
      DataEngine.selectEntity(mesh.userData.id, mesh.userData.type, mesh.userData.name);
    }
  },

  /**
   * 空间区域快速跳跃导航与自动巡检聚焦
   * @param {string} zoneKey 区域标识 ('fish' | 'vege' | 'nursery' | 'cabinet-hv' | 'cabinet-lv' | 'all')
   * @param {boolean} isManualClick 是否为用户手动点击触发 (手动点击将进入临时接管模式)
   */
  jumpToZone(zoneKey, isManualClick = true) {
    if (isManualClick) {
      this.pauseTourTemporarily();
      if (this.tourSteps.includes(zoneKey)) {
        this.tourIndex = this.tourSteps.indexOf(zoneKey);
      }
    }

    // 1. 同步顶部空间导航按钮高亮状态
    this.updateZoneButtons(zoneKey);

    // 2. 更新 3D 浮层状态文字
    this.updateTourStatusText(zoneKey, isManualClick);

    let targetMesh = null;
    if (zoneKey === 'fish') {
      targetMesh = this.interactiveMeshes.find(m => m.userData.id === 'tank-1');
    } else if (zoneKey === 'vege') {
      targetMesh = this.interactiveMeshes.find(m => m.userData.id === 'raceway-a');
    } else if (zoneKey === 'nursery') {
      targetMesh = this.interactiveMeshes.find(m => m.userData.id === 'nursery-1');
    } else if (zoneKey === 'cabinet-hv' || zoneKey === 'cabinet') {
      targetMesh = this.interactiveMeshes.find(m => m.userData.id === 'cabinet-hv');
    } else if (zoneKey === 'cabinet-lv') {
      targetMesh = this.interactiveMeshes.find(m => m.userData.id === 'cabinet-lv');
    } else {
      // 全局总览视口
      this.targetLookAt = new THREE.Vector3(10, 0, 0);
      this.targetCameraPos = new THREE.Vector3(-50, 95, 140);
      this.isLerpingCamera = true;
      if (typeof DataEngine !== 'undefined') {
        DataEngine.selectEntity('tank-1', 'fish-tank', '🐟 鱼池 #01 (加州鲈鱼成鱼池)');
      }
      return;
    }

    if (targetMesh) {
      this.focusOnEntity(targetMesh);
    }
  },

  /**
   * 启动 3 秒自动轮巡巡检时钟
   */
  startAutoTour() {
    if (this.tourInterval) clearInterval(this.tourInterval);
    this.isTourActive = true;
    this.tourRemainingMs = 3000;

    // 首次将按钮与当前步骤对齐
    this.updateZoneButtons(this.tourSteps[this.tourIndex]);

    this.tourInterval = setInterval(() => {
      if (!this.isTourActive) return;

      const countdownEl = document.getElementById('tour-countdown-text');
      const toggleTextEl = document.getElementById('tour-toggle-text');
      const toggleIconEl = document.getElementById('tour-toggle-icon');
      const pingDotEl = document.getElementById('tour-ping-dot');

      if (this.userManualOverride) {
        if (countdownEl) countdownEl.textContent = '接管中';
        if (toggleTextEl) toggleTextEl.textContent = '手动暂停';
        if (toggleIconEl) toggleIconEl.textContent = '⏸️';
        if (pingDotEl) pingDotEl.className = 'w-2 h-2 rounded-full bg-amber-500 animate-pulse';
        return;
      }

      if (toggleTextEl) toggleTextEl.textContent = '3s 自动轮巡';
      if (toggleIconEl) toggleIconEl.textContent = '⚡';
      if (pingDotEl) pingDotEl.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-ping';

      this.tourRemainingMs -= 100;
      if (countdownEl) {
        countdownEl.textContent = `${(Math.max(0, this.tourRemainingMs) / 1000).toFixed(1)}s`;
      }

      if (this.tourRemainingMs <= 0) {
        this.tourRemainingMs = 3000;
        this.tourIndex = (this.tourIndex + 1) % this.tourSteps.length;
        const nextZone = this.tourSteps[this.tourIndex];
        this.jumpToZone(nextZone, false);
      }
    }, 100);
  },

  /**
   * 用户交互时触发临时暂停 (5 秒无操作后智能平滑恢复)
   */
  pauseTourTemporarily() {
    if (!this.isTourActive) return;
    this.userManualOverride = true;
    
    const statusEl = document.getElementById('three-live-status');
    const statusDotEl = document.getElementById('live-status-dot');
    if (statusEl) {
      statusEl.textContent = '🖱️ 手动接管模式中 • 5秒无操作后将自动恢复 3s 轮巡';
    }
    if (statusDotEl) {
      statusDotEl.className = 'w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse';
    }

    if (this.manualOverrideTimer) clearTimeout(this.manualOverrideTimer);
    this.manualOverrideTimer = setTimeout(() => {
      this.userManualOverride = false;
      this.tourRemainingMs = 3000;
      const currentZone = this.tourSteps[this.tourIndex];
      this.updateTourStatusText(currentZone, false);
      if (statusDotEl) statusDotEl.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping';
    }, 5000);
  },

  /**
   * 切换自动巡检开关 (开启 / 暂停)
   */
  toggleAutoTour() {
    this.isTourActive = !this.isTourActive;
    const countdownEl = document.getElementById('tour-countdown-text');
    const toggleTextEl = document.getElementById('tour-toggle-text');
    const toggleIconEl = document.getElementById('tour-toggle-icon');
    const toggleBtnEl = document.getElementById('btn-tour-toggle');
    const pingDotEl = document.getElementById('tour-ping-dot');
    const statusEl = document.getElementById('three-live-status');
    const statusDotEl = document.getElementById('live-status-dot');

    if (this.isTourActive) {
      this.userManualOverride = false;
      this.tourRemainingMs = 3000;
      if (toggleBtnEl) toggleBtnEl.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm cursor-pointer";
      if (toggleTextEl) toggleTextEl.textContent = '3s 自动轮巡';
      if (toggleIconEl) toggleIconEl.textContent = '⚡';
      if (countdownEl) countdownEl.textContent = '3.0s';
      if (pingDotEl) pingDotEl.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-ping';
      if (statusDotEl) statusDotEl.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping';
      
      const currentZone = this.tourSteps[this.tourIndex];
      this.updateTourStatusText(currentZone, false);
      this.startAutoTour();
    } else {
      if (this.manualOverrideTimer) clearTimeout(this.manualOverrideTimer);
      this.userManualOverride = false;
      if (toggleBtnEl) toggleBtnEl.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition shadow-sm cursor-pointer";
      if (toggleTextEl) toggleTextEl.textContent = '已暂停';
      if (toggleIconEl) toggleIconEl.textContent = '⏸️';
      if (countdownEl) countdownEl.textContent = 'PAUSED';
      if (pingDotEl) pingDotEl.className = 'w-2 h-2 rounded-full bg-slate-400';
      if (statusDotEl) statusDotEl.className = 'w-2.5 h-2.5 rounded-full bg-slate-400';
      if (statusEl) {
        statusEl.textContent = '⏸️ 自动巡检已暂停 • 点击【已暂停】按钮可重新恢复 3s 轮巡';
      }
    }
  },

  /**
   * 同步空间导航按钮高亮
   */
  updateZoneButtons(activeKey) {
    const keys = ['all', 'fish', 'vege', 'nursery', 'cabinet-hv', 'cabinet-lv'];
    keys.forEach(k => {
      const btn = document.getElementById(`btn-zone-${k}`);
      if (btn) {
        if (k === activeKey) {
          btn.className = "px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold transition shadow-sm cursor-pointer";
        } else {
          btn.className = "px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 text-slate-800 border border-emerald-200 transition font-medium cursor-pointer";
        }
      }
    });
  },

  /**
   * 更新 3D 浮层状态文字
   */
  updateTourStatusText(zoneKey, isManual) {
    const statusEl = document.getElementById('three-live-status');
    if (!statusEl) return;

    const names = {
      fish: '🐟 10座鱼池 (#01 加州鲈鱼成鱼池)',
      vege: '🥬 4座深水菜池 (#A 奶油生菜跑道)',
      nursery: '🌱 12座种植试验舱 (#01 试验舱)',
      'cabinet-hv': '⚡ 强电动力配电柜 (380V主动力/威胜电表)',
      'cabinet-lv': '📡 弱电自动化控制柜 (汇川 Easy320 PLC)',
      all: '🌐 全景总览温室视界'
    };

    const targetName = names[zoneKey] || zoneKey;
    if (isManual) {
      statusEl.textContent = `🖱️ 手动聚焦: ${targetName} • 5秒后恢复自动轮巡`;
    } else {
      statusEl.textContent = `🚀 自动巡检中 (3s周期) • 当前聚焦: ${targetName}`;
    }
  },

  /**
   * 根据池号直接跳转
   */
  selectById(entityId) {
    this.pauseTourTemporarily();
    const targetMesh = this.interactiveMeshes.find(m => m.userData.id === entityId);
    if (targetMesh) {
      this.focusOnEntity(targetMesh);
    }
  },

  /**
   * 3D 浮动标签提示
   */
  show3DTooltip(clientX, clientY, text) {
    let tip = document.getElementById('three-tooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'three-tooltip';
      tip.className = 'fixed z-50 pointer-events-none px-3 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-emerald-400 text-white font-bold text-xs font-mono shadow-2xl transition-opacity';
      document.body.appendChild(tip);
    }
    tip.textContent = text;
    tip.style.left = `${clientX + 15}px`;
    tip.style.top = `${clientY + 15}px`;
    tip.style.display = 'block';
  },

  hide3DTooltip() {
    const tip = document.getElementById('three-tooltip');
    if (tip) tip.style.display = 'none';
  },

  /**
   * 自适应窗口缩放
   */
  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  },

  /**
   * 60FPS 动画循环
   */
  animate() {
    requestAnimationFrame(() => this.animate());

    this.animatedObjects.forEach(obj => {
      obj.rotation.z += 0.003;
    });

    // 无人机悬停起伏微动
    if (this.droneMesh) {
      this.droneHoverTime += 0.03;
      this.droneMesh.position.y = 7.2 + Math.sin(this.droneHoverTime) * 0.18;
    }

    if (this.isLerpingCamera && this.targetCameraPos && this.targetLookAt) {
      this.camera.position.lerp(this.targetCameraPos, 0.06);
      if (this.controls) {
        this.controls.target.lerp(this.targetLookAt, 0.06);
      }

      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.5) {
        this.isLerpingCamera = false;
      }
    }

    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }
};
