/* ============================================================================
 * 瘋狂農場•果實計算器 — 商業級 Three.js 宇宙皇家宮殿 × 滿天星系 × 中心神果引擎
 * 渲染管線：ACESFilmicToneMapping + 雙主題 PMREM + UnrealBloomPass (Dark) + 10組 GLSL
 * 相容性：全程序化貼圖 (零 file:// CORS 錯誤)、預設流暢(smooth)即呈現完整宇宙宮殿與星系
 * ============================================================================ */
(function (global) {
  "use strict";

  const AstralScene3D = (function () {
    let initialized = false;
    let renderer = null;
    let scene = null;
    let camera = null;
    let composer = null;
    let bloomPass = null;
    let useBloom = false;

    let envMapDark = null;
    let envMapLight = null;
    let currentTheme = "dark";
    let currentView = "picker";
    let currentQuality = "smooth";
    let parallaxEnabled = true;
    let legacyMode = false;

    const animState = {
      lightMode: 0,
      pulseBoost: 0,
      ringSpeedBoost: 0,
      weightScale: 1.0,
      fruitBurstScale: 1.0,
      camShake: 0,
      camTargetX: 0,
      camTargetY: 4.8,
      camTargetZ: 40.0,
      lookAtY: 2.0
    };

    const moodPrimary = new THREE.Color("#34e2d8");
    const moodSecondary = new THREE.Color("#f4c553");
    const moodRim = new THREE.Color("#b76cff");
    const moodTarget = { iridescent: 0.72, glow: 1.0 };

    // Shaders & Scene Groups
    let skyMat = null;
    let galaxyMat = null;
    let saturnRingMat = null;
    let cloudMat1 = null;
    let cloudMat2 = null;
    let crystalMat = null;
    let ribbonMat = null;
    let stardustMat = null;
    let supernovaMat = null;

    let palaceGroup = null;
    let fruitGroup = null;
    let fruitSeedsGroup = null;
    let ring1Group = null;
    let ring2Group = null;
    let ring3Group = null;
    let ring4Group = null;
    let galaxyPoints = null;
    let planetGroup = null;
    let asteroidInstanced = null;
    let asteroidMeta = [];
    let instancedShards = null;
    let shardMeta = [];
    let stardustPoints = null;
    let cloudPlane1 = null;
    let cloudPlane2 = null;

    // 舊版介面：升級版 2x 量子天體球、四重星環、衛星公轉自轉與 2x 體積感旋臂星系群組
    let legacyGroup = null;
    let legacyDiscGroup = null;
    let legacyGalaxyMats = [];
    let legacySpiralDust = null;
    let legacyGalaxyMeshes = [];
    let legacyStarMat = null;
    let legacyStarPoints = null;
    let legacyReactorGroup = null;
    let legacyCoreMesh = null;
    let legacyCoreMat = null;
    let legacyInnerGlowMesh = null;
    let legacyInnerGlowMat = null;
    let legacyGlassShell = null;
    let legacyGlassShellMat = null;
    let legacyLatticeMesh = null;
    let legacyLatticeMat = null;
    let legacyRings = [];
    let legacyRingMats = [];
    let legacySatMat = null;
    let legacySatellites = [];
    let legacyWarp = 1.0;
    let legacyRotDir = 1.0;
    let legacyTargetDir = 1.0;
    let legacyBurstSpeed = 0;
    let legacyBurstDir = 1;
    let legacySpringX = 0;
    let legacySpringY = 0;
    let legacyVelX = 0;
    let legacyVelY = 0;

    // 舊版獨立爆裂與重聚物理特效
    const LEGACY_DEBRIS_COUNT = 650;
    let legacyDebrisPoints = null;
    let legacyDebrisGeo = null;
    let legacyDebrisPos = null;
    let legacyDebrisVel = null;
    let legacyDebrisMat = null;
    let legacyBlastRing = null;
    let legacyBlastRingMat = null;
    let legacyExpState = "IDLE";
    let legacyExpTimer = 0;

    // 新版專屬宮殿聖輝光柱與超新星線程
    let palaceBeamMesh = null;
    let palaceBeamMat = null;
    let supernovaTimeline = null;

    // 滑鼠 / 行動裝置搖晃偵測 (共用能量池，依模式分別觸發專屬特效)
    let shakeEnergy = 0;
    let shakeCooldownUntil = 0;
    let lastMouseX = null;
    let lastMouseY = null;
    let lastMouseTime = 0;
    let lastDirX = 0;
    let lastDirY = 0;
    let mouseReversals = 0;
    let lastReversalTime = 0;
    let lastAx = 0;
    let lastAy = 0;
    let lastAz = 0;

    // 效能優化共用暫存物件與 DOM 尺寸快取
    const _dummy = new THREE.Object3D();
    let frameCounter = 0;
    let uiRectsDirty = true;
    let lastStageRX = -999;
    let lastStageRY = -999;
    let pickerGridEl = null;
    let lastTileTiltX = -999;
    let lastTileTiltY = -999;

    function getLegacyReactorBaseScale() {
      return (global.innerWidth || 1280) <= 680 ? 0.68 : 1.0;
    }

    function triggerScreenGlow() {
      const flash = document.getElementById("screenFlash");
      if (!flash) return;
      flash.classList.add("active");
      setTimeout(() => flash.classList.remove("active"), 220);
    }

    // 3 段式超新星系統 (3 個交錯震波環 + 450 顆 3D 聚能/爆裂粒子)
    let shockwaves = [];
    let supernovaPoints = null;
    let supernovaMeta = [];
    const supernovaState = { active: false, opacity: 0, heat: 1.0, progress: 0, phase: 0 };

    // Three.js 3D 介面立體邊框系統 (主頁使用，進入作物計算後停用傾斜保持精準好操作)
    let uiRigGroup = null;
    let uiFrameItems = [];
    let appStageEl = null;
    let matUiGlass = null;
    let matUiBezel = null;

    // 共用 PBR 材質
    let matGoldMetal = null;
    let matTitanium = null;
    let matMarble = null;
    let matStone = null;
    let matGlassDome = null;
    let matVeinGlow = null;
    let matAccentCrystal = null;

    // 光源
    let hemiLight = null;
    let dirLight = null;
    let corePointLight = null;
    let leftRimLight = null;
    let rightRimLight = null;

    let pointerNX = 0;
    let pointerNY = 0;
    let smoothPX = 0;
    let smoothPY = 0;
    let gyroBaseGamma = null;
    let gyroBaseBeta = null;
    let isGyroInput = false;
    let clock = null;
    let rafId = null;
    let isPaused = false;

    /* ------------------------------------------------------------------
     * 1. 程序化高畫質貼圖
     * ------------------------------------------------------------------ */
    function createVernierDialTexture() {
      const c = document.createElement("canvas");
      c.width = 1024;
      c.height = 128;
      const g = c.getContext("2d");
      g.strokeStyle = "rgba(255,255,255,0.85)";
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(0, 18); g.lineTo(1024, 18);
      g.moveTo(0, 110); g.lineTo(1024, 110);
      g.stroke();
      for (let i = 0; i < 128; i++) {
        const x = (i / 128) * 1024;
        const isMajor = i % 8 === 0;
        const isMid = i % 4 === 0;
        g.strokeStyle = isMajor ? "rgba(255,255,255,0.95)" : isMid ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.32)";
        g.lineWidth = isMajor ? 2.5 : 1.2;
        const h = isMajor ? 28 : isMid ? 18 : 10;
        g.beginPath();
        g.moveTo(x, 22); g.lineTo(x, 22 + h);
        g.moveTo(x, 106); g.lineTo(x, 106 - h * 0.7);
        g.stroke();
        if (isMajor) {
          g.fillStyle = "rgba(255,255,255,0.85)";
          g.beginPath(); g.arc(x, 64, 4, 0, Math.PI * 2); g.fill();
        }
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.repeat.set(4, 1);
      return tex;
    }

    function createBrushedMetalTexture() {
      const c = document.createElement("canvas");
      c.width = 256;
      c.height = 256;
      const g = c.getContext("2d");
      g.fillStyle = "#808080";
      g.fillRect(0, 0, 256, 256);
      for (let y = 0; y < 256; y++) {
        const v = 110 + Math.floor(Math.random() * 38);
        g.fillStyle = `rgb(${v},${v},${v})`;
        g.fillRect(0, y, 256, 1);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 2);
      return tex;
    }

    function createStrataBumpTexture() {
      const c = document.createElement("canvas");
      c.width = 256;
      c.height = 256;
      const g = c.getContext("2d");
      g.fillStyle = "#777";
      g.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 420; i++) {
        const lum = 70 + Math.floor(Math.random() * 120);
        g.fillStyle = `rgba(${lum},${lum},${lum},0.35)`;
        g.fillRect(Math.random() * 256, Math.random() * 256, 18 + Math.random() * 70, 3 + Math.random() * 10);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 2);
      return tex;
    }

    /* ------------------------------------------------------------------
     * 2. 雙主題 PMREM 環境貼圖
     * ------------------------------------------------------------------ */
    function buildStudioEnvMap(pmrem, isLight) {
      const envScene = new THREE.Scene();
      envScene.background = new THREE.Color(isLight ? 0x6ea6dc : 0x060d1c);
      const addPanel = (w, h, color, pos, rotX) => {
        const m = new THREE.Mesh(
          new THREE.PlaneGeometry(w, h),
          new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
        );
        m.position.set(pos[0], pos[1], pos[2]);
        if (rotX !== undefined) m.rotation.x = rotX;
        else m.lookAt(0, 0, 0);
        envScene.add(m);
      };
      addPanel(40, 40, isLight ? 0xaad4f5 : 0x34e2d8, [0, 18, 0], Math.PI / 2);
      addPanel(24, 14, isLight ? 0xffe4b5 : 0xf4c553, [16, 8, 10]);
      addPanel(20, 14, isLight ? 0x4a8fd4 : 0xb76cff, [-16, 6, -8]);
      addPanel(46, 46, isLight ? 0x527699 : 0x0b1f38, [0, -14, 0], -Math.PI / 2);
      return pmrem.fromScene(envScene, 0.04).texture;
    }

    /* ------------------------------------------------------------------
     * 3. 氣派豪華宇宙皇家宮殿建築群 (三層露台 + 四座跨橋偏殿 + 雙層飛簷主殿 + 中心神果)
     * ------------------------------------------------------------------ */
    function buildFloatingRockBase(radius, depth, detailSegments) {
      const group = new THREE.Group();
      const geo = new THREE.ConeGeometry(radius, depth, detailSegments, 5);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i), vy = pos.getY(i), vz = pos.getZ(i);
        const normY = (vy + depth * 0.5) / depth;
        const rough = (1.0 - normY * 0.72) * 0.16;
        const n = Math.sin(vx * 1.1 + vz * 0.8) * Math.cos(vy * 1.0 + vx * 0.6);
        pos.setXYZ(i, vx * (1 + n * rough), vy, vz * (1 + n * rough));
      }
      geo.computeVertexNormals();
      const rock = new THREE.Mesh(geo, matStone);
      rock.rotation.x = Math.PI;
      rock.position.y = -depth * 0.5;
      group.add(rock);

      // 岩底發光晶脈尖柱 (5 根錯落)
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2 + 0.3;
        const shard = new THREE.Mesh(new THREE.ConeGeometry(radius * 0.11, depth * 0.38, 6), matVeinGlow);
        shard.rotation.x = Math.PI + (Math.random() - 0.5) * 0.25;
        shard.rotation.z = (Math.random() - 0.5) * 0.25;
        shard.position.set(Math.cos(a) * radius * 0.48, -depth * 0.46, Math.sin(a) * radius * 0.48);
        group.add(shard);
      }
      return group;
    }

    function buildWatchPavilion() {
      const pav = new THREE.Group();
      const rock = buildFloatingRockBase(3.6, 7.2, 8);
      pav.add(rock);

      // 六角宮廷底座
      const base = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.5, 0.7, 6), matMarble);
      base.position.y = 0.35;
      pav.add(base);

      const goldRim = new THREE.Mesh(new THREE.TorusGeometry(3.25, 0.12, 8, 24), matGoldMetal);
      goldRim.rotation.x = Math.PI / 2;
      goldRim.position.y = 0.72;
      pav.add(goldRim);

      // 6 根金頂玉柱
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.21, 3.6, 8), matMarble);
        col.position.set(Math.cos(a) * 2.45, 2.5, Math.sin(a) * 2.45);
        pav.add(col);
      }

      // 雙層皇家翹角寶塔頂
      const eave1 = new THREE.Mesh(new THREE.ConeGeometry(3.5, 1.3, 6), matTitanium);
      eave1.position.y = 4.95;
      const eaveGold1 = new THREE.Mesh(new THREE.TorusGeometry(3.45, 0.10, 8, 6), matGoldMetal);
      eaveGold1.rotation.x = Math.PI / 2;
      eaveGold1.position.y = 4.32;

      const eave2 = new THREE.Mesh(new THREE.ConeGeometry(2.3, 1.4, 6), matGoldMetal);
      eave2.position.y = 6.15;

      const coreGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 0), matAccentCrystal);
      coreGem.position.y = 2.4;

      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.8, 6), matGoldMetal);
      spire.position.y = 7.6;

      pav.add(eave1, eaveGold1, eave2, coreGem, spire);
      return pav;
    }

    function buildMythicCenterpieceFruit() {
      const container = new THREE.Group();

      // 1. 雕刻有機神果主體 (LatheGeometry + 垂直瓜稜凹凸造型，非單調幾何體！)
      const pts = [];
      const steps = 28;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps; // 0 (bottom) -> 1 (top tip)
        const angle = t * Math.PI;
        // 豐潤壽桃/星果輪廓：底部飽滿、頂部優雅收尖
        let r = Math.sin(angle) * (1.75 + 0.42 * Math.sin(t * Math.PI * 1.4));
        if (t > 0.72) r *= (1.0 - (t - 0.72) * 0.75);
        const y = (t - 0.45) * 4.4;
        pts.push(new THREE.Vector2(Math.max(0.02, r), y));
      }
      const fruitGeo = new THREE.LatheGeometry(pts, 36);
      // 加入 8 道立體瓜稜浮雕，讓果實具備真實植物稜線與光影折面
      const pos = fruitGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        const ang = Math.atan2(z, x);
        const flute = 1.0 + 0.095 * Math.cos(ang * 8.0);
        pos.setXYZ(i, x * flute, y, z * flute);
      }
      fruitGeo.computeVertexNormals();

      const fruitMesh = new THREE.Mesh(fruitGeo, crystalMat);
      container.add(fruitMesh);

      // 2. 頂部 6 片晶瑩剔透的水晶花萼葉片
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const leafGeo = new THREE.ConeGeometry(0.48, 1.65, 4);
        leafGeo.scale(1.0, 1.0, 0.28);
        const leaf = new THREE.Mesh(leafGeo, matAccentCrystal);
        leaf.position.set(Math.cos(a) * 0.78, 2.05, Math.sin(a) * 0.78);
        leaf.rotation.y = -a + Math.PI / 2;
        leaf.rotation.x = 0.95;
        container.add(leaf);
      }

      // 3. 彎曲鎏金果蒂枝蔓 (TubeGeometry)
      const stemCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 1.85, 0),
        new THREE.Vector3(0.15, 2.55, 0.08),
        new THREE.Vector3(0.55, 2.95, 0.25),
        new THREE.Vector3(0.95, 2.75, 0.35)
      ]);
      const stemMesh = new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 16, 0.11, 8, false), matGoldMetal);
      container.add(stemMesh);

      // 4. 神果背後的神聖鎏金光環 + 環繞星實種子
      const haloRing = new THREE.Mesh(new THREE.TorusGeometry(2.85, 0.09, 10, 64), matGoldMetal);
      haloRing.rotation.y = 0.15;
      container.add(haloRing);

      fruitSeedsGroup = new THREE.Group();
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const seed = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), matAccentCrystal);
        seed.position.set(Math.cos(a) * 3.1, Math.sin(a * 2) * 0.45, Math.sin(a) * 3.1);
        fruitSeedsGroup.add(seed);
      }
      container.add(fruitSeedsGroup);

      container.position.y = 6.2;
      return container;
    }

    function buildCosmicPalace() {
      palaceGroup = new THREE.Group();
      palaceGroup.position.set(0, -3.5, -24);

      // 1. 巨型浮空岩石基座 + 三層漢白玉鎏金皇家露台
      const heroRock = buildFloatingRockBase(16.5, 21.0, 16);
      palaceGroup.add(heroRock);

      const terraceConfigs = [
        { rTop: 15.2, rBot: 16.0, h: 0.9, y: 0.45, seg: 12 },
        { rTop: 12.0, rBot: 12.8, h: 0.9, y: 1.35, seg: 12 },
        { rTop: 8.8,  rBot: 9.6,  h: 0.9, y: 2.25, seg: 12 }
      ];
      terraceConfigs.forEach((tc) => {
        const tier = new THREE.Mesh(new THREE.CylinderGeometry(tc.rTop, tc.rBot, tc.h, tc.seg), matMarble);
        tier.position.y = tc.y;
        palaceGroup.add(tier);

        const trim = new THREE.Mesh(new THREE.TorusGeometry(tc.rTop + 0.08, 0.15, 10, 48), matGoldMetal);
        trim.rotation.x = Math.PI / 2;
        trim.position.y = tc.y + tc.h * 0.5;
        palaceGroup.add(trim);

        const veinRing = new THREE.Mesh(new THREE.TorusGeometry(tc.rTop - 0.35, 0.07, 8, 48), matVeinGlow);
        veinRing.rotation.x = Math.PI / 2;
        veinRing.position.y = tc.y + tc.h * 0.52;
        palaceGroup.add(veinRing);
      });

      // 2. 四方跨空天橋與四座守望偏殿 (東西南北四象限)
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + Math.PI * 0.25;
        const bridgePivot = new THREE.Group();
        bridgePivot.rotation.y = angle;

        // 浮空玉橋橋面
        const deck = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.42, 10.8), matMarble);
        deck.position.set(0, 0.9, 17.6);
        bridgePivot.add(deck);

        // 橋側鎏金護欄與光柱
        [-1.15, 1.15].forEach((bx) => {
          const rail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.32, 10.8), matGoldMetal);
          rail.position.set(bx, 1.32, 17.6);
          bridgePivot.add(rail);
          [14.2, 17.6, 21.0].forEach((bz) => {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.9, 6), matGoldMetal);
            post.position.set(bx, 1.5, bz);
            const lamp = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), matVeinGlow);
            lamp.position.set(bx, 2.08, bz);
            bridgePivot.add(post, lamp);
          });
        });

        // 偏殿樓閣
        const pav = buildWatchPavilion();
        pav.position.set(0, 0.6, 25.0);
        bridgePivot.add(pav);

        palaceGroup.add(bridgePivot);
      }

      // 3. 皇家主殿 12 根雕金巨柱 (保留正面較開闊視野展示內部宇宙神果)
      const colR = 8.1;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const px = Math.cos(a) * colR;
        const pz = Math.sin(a) * colR;

        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 8.2, 10), matMarble);
        pillar.position.set(px, 6.8, pz);
        const baseCap = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 0.55, 8), matGoldMetal);
        baseCap.position.set(px, 2.95, pz);
        const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.32, 0.55, 8), matGoldMetal);
        topCap.position.set(px, 10.9, pz);
        palaceGroup.add(pillar, baseCap, topCap);
      }

      // 4. 中央神果蓮花聖壇
      const altar1 = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 4.1, 0.75, 12), matTitanium);
      altar1.position.y = 3.05;
      const altar2 = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.8, 0.55, 12), matGoldMetal);
      altar2.position.y = 3.65;
      palaceGroup.add(altar1, altar2);

      // 5. 雙層飛簷主殿屋頂 + 水晶觀測穹頂 + 黃金九重塔剎
      const lowerEave = new THREE.Mesh(new THREE.CylinderGeometry(8.2, 11.2, 1.5, 12, 1, true), matTitanium);
      lowerEave.position.y = 11.75;
      const lowerGoldRim = new THREE.Mesh(new THREE.TorusGeometry(11.15, 0.24, 10, 12), matGoldMetal);
      lowerGoldRim.rotation.x = Math.PI / 2;
      lowerGoldRim.position.y = 11.02;

      const upperEave = new THREE.Mesh(new THREE.CylinderGeometry(6.4, 8.8, 1.35, 12, 1, true), matGoldMetal);
      upperEave.position.y = 13.0;

      const domeMesh = new THREE.Mesh(
        new THREE.SphereGeometry(6.5, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.46),
        matGlassDome
      );
      domeMesh.position.y = 13.5;

      palaceGroup.add(lowerEave, lowerGoldRim, upperEave, domeMesh);

      for (let i = 0; i < 6; i++) {
        const rib = new THREE.Mesh(
          new THREE.TorusGeometry(6.58, 0.14, 8, 48, Math.PI),
          matGoldMetal
        );
        rib.position.y = 13.5;
        rib.rotation.y = (i / 6) * Math.PI;
        palaceGroup.add(rib);
      }

      const finialBase = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.65, 0.9, 8), matGoldMetal);
      finialBase.position.y = 20.1;
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.45, 5.2, 8), matGoldMetal);
      spire.position.y = 23.0;
      const tipGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.75, 0), matAccentCrystal);
      tipGem.position.y = 26.2;
      palaceGroup.add(finialBase, spire, tipGem);

      // 6. 中心宇宙神果
      fruitGroup = buildMythicCenterpieceFruit();
      palaceGroup.add(fruitGroup);

      // 7. 環繞宮殿外圍的壯闊宇宙星環群
      buildPlanetaryStarRings(createVernierDialTexture());

      scene.add(palaceGroup);
    }

    function buildPlanetaryStarRings(vernierTex) {
      // Ring 1: 內圈鎏金星象儀刻度環
      ring1Group = new THREE.Group();
      ring1Group.add(new THREE.Mesh(new THREE.TorusGeometry(18.5, 0.28, 12, 96), matGoldMetal));
      const r1Band = new THREE.Mesh(
        new THREE.CylinderGeometry(18.3, 18.3, 1.45, 96, 1, true),
        new THREE.MeshStandardMaterial({
          color: 0xf4c553,
          emissive: 0x34e2d8,
          emissiveIntensity: 0.45,
          alphaMap: vernierTex,
          transparent: true,
          opacity: 0.9,
          metalness: 0.85,
          roughness: 0.25,
          side: THREE.DoubleSide
        })
      );
      r1Band.rotation.x = Math.PI / 2;
      ring1Group.add(r1Band);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const node = new THREE.Mesh(new THREE.OctahedronGeometry(0.62, 0), matAccentCrystal);
        node.position.set(Math.cos(a) * 18.5, Math.sin(a) * 18.5, 0);
        ring1Group.add(node);
      }
      ring1Group.rotation.set(Math.PI * 0.36, Math.PI * 0.14, 0);

      // Ring 2: 中圈雙軌鈦金戴森環 + 能量流光
      ring2Group = new THREE.Group();
      const railA = new THREE.Mesh(new THREE.TorusGeometry(24.8, 0.26, 12, 110), matTitanium);
      railA.position.z = 0.45;
      const railB = new THREE.Mesh(new THREE.TorusGeometry(24.8, 0.26, 12, 110), matTitanium);
      railB.position.z = -0.45;
      ring2Group.add(railA, railB);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const strut = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 1.15), matGoldMetal);
        strut.position.set(Math.cos(a) * 24.8, Math.sin(a) * 24.8, 0);
        strut.rotation.z = a;
        ring2Group.add(strut);
      }
      const ribbonMesh = new THREE.Mesh(new THREE.CylinderGeometry(24.6, 24.6, 0.85, 120, 1, true), ribbonMat);
      ribbonMesh.rotation.x = Math.PI / 2;
      ring2Group.add(ribbonMesh);
      ring2Group.rotation.set(-Math.PI * 0.30, -Math.PI * 0.22, 0.18);

      // Ring 3: 土星級寬幅宇宙星環 + 260 顆環繞晶體小行星帶
      ring3Group = new THREE.Group();
      const saturnMesh = new THREE.Mesh(new THREE.RingGeometry(29.0, 41.0, 128), saturnRingMat);
      ring3Group.add(saturnMesh);

      const astCount = 260;
      const astGeo = new THREE.OctahedronGeometry(0.24, 0);
      asteroidInstanced = new THREE.InstancedMesh(astGeo, matAccentCrystal, astCount);
      const dummy = new THREE.Object3D();
      asteroidMeta = [];
      for (let i = 0; i < astCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 29.5 + Math.random() * 11.0;
        const zOff = (Math.random() - 0.5) * 1.1;
        const s = 0.55 + Math.random() * 1.35;
        asteroidMeta.push({ angle: a, radius: r, z: zOff, scale: s, speed: (0.04 + Math.random() * 0.06) * (34 / r) });
        dummy.position.set(Math.cos(a) * r, Math.sin(a) * r, zOff);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        asteroidInstanced.setMatrixAt(i, dummy.matrix);
      }
      asteroidInstanced.instanceMatrix.needsUpdate = true;
      ring3Group.add(asteroidInstanced);
      ring3Group.rotation.set(Math.PI * 0.42, -Math.PI * 0.08, 0.18);

      // Ring 4: 最外層宏偉星座拱環
      ring4Group = new THREE.Group();
      ring4Group.add(new THREE.Mesh(new THREE.TorusGeometry(45.5, 0.36, 12, 128), matGoldMetal));
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const mark = new THREE.Mesh(
          new THREE.BoxGeometry(0.55, 1.35, 0.55),
          i % 4 === 0 ? matAccentCrystal : matTitanium
        );
        mark.position.set(Math.cos(a) * 45.5, Math.sin(a) * 45.5, 0);
        mark.rotation.z = a;
        ring4Group.add(mark);
      }
      ring4Group.rotation.set(-Math.PI * 0.38, Math.PI * 0.16, -0.22);

      palaceGroup.add(ring1Group, ring2Group, ring3Group, ring4Group);
    }

    /* ------------------------------------------------------------------
     * 4. 滿天絢麗 4 旋臂星辰星系 + 遠景環繞行星 + 懸浮晶簇
     * ------------------------------------------------------------------ */
    function buildSpiralGalaxy(starCount) {
      if (galaxyPoints) {
        scene.remove(galaxyPoints);
        galaxyPoints.geometry.dispose();
      }
      const arms = 4;
      const maxRadius = 128;
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);
      const sizes = new Float32Array(starCount);
      const phases = new Float32Array(starCount);

      const coreColor = new THREE.Color("#fff3c4");
      const midColor = new THREE.Color("#38e8ff");
      const outerColor = new THREE.Color("#c084fc");
      const tempCol = new THREE.Color();

      for (let i = 0; i < starCount; i++) {
        const arm = i % arms;
        const rNorm = Math.pow(Math.random(), 1.35);
        const r = 4.0 + rNorm * maxRadius;
        const spin = rNorm * 5.2;
        const branchAngle = (arm / arms) * Math.PI * 2;
        const scatter = (Math.random() - 0.5) * (0.55 + rNorm * 0.85);
        const a = branchAngle + spin + scatter;

        positions[i * 3]     = Math.cos(a) * r;
        positions[i * 3 + 1] = (Math.random() - 0.5) * (6.5 * (1.0 - rNorm * 0.55));
        positions[i * 3 + 2] = Math.sin(a) * r;

        if (rNorm < 0.35) {
          tempCol.lerpColors(coreColor, midColor, rNorm / 0.35);
        } else {
          tempCol.lerpColors(midColor, outerColor, (rNorm - 0.35) / 0.65);
        }
        colors[i * 3] = tempCol.r;
        colors[i * 3 + 1] = tempCol.g;
        colors[i * 3 + 2] = tempCol.b;

        sizes[i] = (1.0 - rNorm * 0.5) * (1.8 + Math.random() * 3.4);
        phases[i] = Math.random();
      }

      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
      geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
      geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

      galaxyPoints = new THREE.Points(geo, galaxyMat);
      galaxyPoints.position.set(0, 14, -78);
      galaxyPoints.rotation.set(0.72, 0.12, -0.32);
      scene.add(galaxyPoints);
    }

    function buildCosmicPlanets() {
      planetGroup = new THREE.Group();
      const S = global.ASTRAL_SHADERS;

      const makePlanet = (radius, cA, cB, rim, pos, hasRing) => {
        const g = new THREE.Group();
        const mat = new THREE.ShaderMaterial({
          vertexShader: S.planetAtmo.vertexShader,
          fragmentShader: S.planetAtmo.fragmentShader,
          uniforms: {
            uColorA: { value: new THREE.Color(cA) },
            uColorB: { value: new THREE.Color(cB) },
            uRimColor: { value: new THREE.Color(rim) },
            uLightMode: { value: animState.lightMode }
          }
        });
        g.add(new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 24), mat));
        if (hasRing) {
          const rMat = new THREE.MeshBasicMaterial({
            color: rim,
            transparent: true,
            opacity: 0.42,
            side: THREE.DoubleSide
          });
          const ring = new THREE.Mesh(new THREE.RingGeometry(radius * 1.45, radius * 2.25, 64), rMat);
          ring.rotation.set(Math.PI * 0.38, 0.25, 0.15);
          g.add(ring);
        }
        g.position.set(pos[0], pos[1], pos[2]);
        g.userData.planetMat = mat;
        planetGroup.add(g);
      };

      // 3 顆不同遠近與色調的星際行星點綴深空
      makePlanet(6.8, "#7c3aed", "#f472b6", "#f5c443", [-58, 24, -92], true);
      makePlanet(4.4, "#0ea5e9", "#34e2d8", "#93c5fd", [64, 22, -98], false);
      makePlanet(3.1, "#d97706", "#fef08a", "#fde047", [-36, -12, -74], false);

      scene.add(planetGroup);
    }

    function buildInstancedShards() {
      const count = 80;
      const geo = new THREE.OctahedronGeometry(0.55, 0);
      geo.scale(0.75, 1.75, 0.75);
      instancedShards = new THREE.InstancedMesh(geo, matAccentCrystal, count);
      const dummy = new THREE.Object3D();
      shardMeta = [];

      for (let i = 0; i < count; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const angle = (Math.random() * 0.85 + 0.15) * Math.PI * 0.45 * side + (side < 0 ? Math.PI : 0);
        const radius = 22 + Math.random() * 34;
        const x = Math.cos(angle) * radius * 1.15;
        const z = -26 + Math.sin(angle) * radius * 0.65 + (Math.random() - 0.5) * 18;
        const y = (Math.random() - 0.45) * 24;
        const s = 0.45 + Math.random() * 1.3;
        shardMeta.push({ x, y, z, scale: s, speed: 0.4 + Math.random() * 0.8, phase: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.6 });
        dummy.position.set(x, y, z);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        instancedShards.setMatrixAt(i, dummy.matrix);
      }
      instancedShards.instanceMatrix.needsUpdate = true;
      scene.add(instancedShards);
    }

    function buildStardust(count) {
      if (stardustPoints) {
        scene.remove(stardustPoints);
        stardustPoints.geometry.dispose();
      }
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const phases = new Float32Array(count);
      const mixes = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 115;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 56;
        positions[i * 3 + 2] = -75 + Math.random() * 90;
        sizes[i] = 1.6 + Math.random() * 3.8;
        phases[i] = Math.random();
        mixes[i] = Math.random();
      }
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
      geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
      geo.setAttribute("aMix", new THREE.BufferAttribute(mixes, 1));

      stardustPoints = new THREE.Points(geo, stardustMat);
      scene.add(stardustPoints);
    }

    function buildLegacyStars(starCount) {
      if (!legacyGroup) return;
      if (legacyStarPoints) {
        legacyGroup.remove(legacyStarPoints);
        legacyStarPoints.geometry.dispose();
      }
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);
      const sizes = new Float32Array(starCount);
      const phases = new Float32Array(starCount);
      const sparkles = new Float32Array(starCount);

      const palette = [
        new THREE.Color("#ff4da6"),
        new THREE.Color("#ff8c2b"),
        new THREE.Color("#ffd43b"),
        new THREE.Color("#38f28b"),
        new THREE.Color("#00e5ff"),
        new THREE.Color("#3b82f6"),
        new THREE.Color("#a855f7"),
        new THREE.Color("#e843ff"),
        new THREE.Color("#ff4d6d"),
        new THREE.Color("#7dff9a"),
        new THREE.Color("#ffffff")
      ];

      for (let i = 0; i < starCount; i++) {
        const spread = 220;
        positions[i * 3]     = (Math.random() - 0.5) * spread;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 140;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 90 - 6;

        // 降低純白比例，讓各種彩色粒子區別更明顯
        const idx = Math.random() < 0.06 ? (palette.length - 1) : Math.floor(Math.random() * (palette.length - 1));
        const c = palette[idx];
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;

        const isBright = Math.random() > 0.82;
        sizes[i] = isBright ? (5.8 + Math.random() * 4.2) : (2.6 + Math.random() * 2.8);
        phases[i] = Math.random();
        sparkles[i] = isBright ? (0.86 + Math.random() * 0.14) : Math.random() * 0.6;
      }

      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
      geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
      geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
      geo.setAttribute("aSparkle", new THREE.BufferAttribute(sparkles, 1));

      legacyStarPoints = new THREE.Points(geo, legacyStarMat);
      legacyStarPoints.position.set(0, 0, -18);
      legacyGroup.add(legacyStarPoints);
    }

    // 舊版星系旋臂彩色星塵 (沿著旋臂分佈並隨星系自轉，讓色彩漸層與旋轉一目了然)
    function buildLegacySpiralDust(count) {
      if (!legacyDiscGroup || !legacyStarMat) return;
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const phases = new Float32Array(count);
      const sparkles = new Float32Array(count);
      const stops = [
        [0.00, new THREE.Color("#fff1d6")],
        [0.14, new THREE.Color("#ffa04a")],
        [0.30, new THREE.Color("#ff4f93")],
        [0.48, new THREE.Color("#a35cff")],
        [0.66, new THREE.Color("#4a7dff")],
        [0.84, new THREE.Color("#2fe0e6")],
        [1.00, new THREE.Color("#46f0a0")]
      ];
      const tmp = new THREE.Color();
      const gradAt = (r) => {
        for (let s = 1; s < stops.length; s++) {
          if (r <= stops[s][0]) {
            const k = (r - stops[s - 1][0]) / (stops[s][0] - stops[s - 1][0]);
            return tmp.copy(stops[s - 1][1]).lerp(stops[s][1], k);
          }
        }
        return tmp.copy(stops[stops.length - 1][1]);
      };
      const HALF = 89;
      for (let i = 0; i < count; i++) {
        const rn = 0.04 + Math.pow(Math.random(), 0.75) * 0.9;
        const arm = Math.floor(Math.random() * 2) * Math.PI;
        const spread = (Math.random() - 0.5) * (0.55 + rn * 0.35);
        const ang = arm - 3.1 * Math.log(rn + 0.085) + spread;
        const rad = rn * HALF;
        positions[i * 3] = Math.cos(ang) * rad;
        positions[i * 3 + 1] = Math.sin(ang) * rad;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 4.0 * (1.0 - rn * 0.6);
        const c = gradAt(Math.min(1, rn + (Math.random() - 0.5) * 0.08));
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
        const bright = Math.random() > 0.9;
        sizes[i] = bright ? 3.2 + Math.random() * 2.4 : 1.1 + Math.random() * 1.8;
        phases[i] = Math.random();
        sparkles[i] = bright ? 0.9 : Math.random() * 0.5;
      }
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
      geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
      geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
      geo.setAttribute("aSparkle", new THREE.BufferAttribute(sparkles, 1));
      legacySpiralDust = new THREE.Points(geo, legacyStarMat);
      legacyDiscGroup.add(legacySpiralDust);
    }

    function buildLegacyExplosionSystem() {
      const S = global.ASTRAL_SHADERS;
      legacyDebrisGeo = new THREE.BufferGeometry();
      legacyDebrisPos = new Float32Array(LEGACY_DEBRIS_COUNT * 3);
      legacyDebrisVel = new Float32Array(LEGACY_DEBRIS_COUNT * 3);
      const cols = new Float32Array(LEGACY_DEBRIS_COUNT * 3);
      const pal = [
        new THREE.Color(0x00f6ff),
        new THREE.Color(0xf5c443),
        new THREE.Color(0xc084fc),
        new THREE.Color(0x38e888),
        new THREE.Color(0xffffff)
      ];
      for (let i = 0; i < LEGACY_DEBRIS_COUNT; i++) {
        const c = pal[Math.floor(Math.random() * pal.length)];
        cols[i * 3] = c.r;
        cols[i * 3 + 1] = c.g;
        cols[i * 3 + 2] = c.b;
      }
      legacyDebrisGeo.setAttribute("position", new THREE.BufferAttribute(legacyDebrisPos, 3));
      legacyDebrisGeo.setAttribute("color", new THREE.BufferAttribute(cols, 3));

      legacyDebrisMat = new THREE.PointsMaterial({
        size: 1.15,
        vertexColors: true,
        transparent: true,
        opacity: 0,
        blending: currentTheme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending,
        depthWrite: false
      });
      legacyDebrisPoints = new THREE.Points(legacyDebrisGeo, legacyDebrisMat);
      legacyDebrisPoints.position.set(0, 0, 0);
      legacyDebrisPoints.visible = false;
      legacyGroup.add(legacyDebrisPoints);

      legacyBlastRingMat = new THREE.ShaderMaterial({
        vertexShader: S.shockwaveRing.vertexShader,
        fragmentShader: S.shockwaveRing.fragmentShader,
        uniforms: { uColor: { value: new THREE.Color("#f5c443") }, uOpacity: { value: 0 } },
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      legacyBlastRing = new THREE.Mesh(new THREE.RingGeometry(4.0, 7.6, 64), legacyBlastRingMat);
      legacyBlastRing.rotation.x = -Math.PI * 0.42;
      legacyBlastRing.visible = false;
      legacyGroup.add(legacyBlastRing);
    }

    function buildLegacyVolumetricGalaxy(starCount) {
      const S = global.ASTRAL_SHADERS;
      legacyGroup = new THREE.Group();
      legacyGroup.position.set(0, 1.8, -32);
      legacyGroup.visible = legacyMode;

      // 1. 放大 2 倍之升級版經典量子球體 ＋ 四道金屬發光星環 ＋ 4 顆公轉自轉晶體衛星
      legacyReactorGroup = new THREE.Group();
      legacyReactorGroup.scale.setScalar(getLegacyReactorBaseScale());
      legacyGroup.add(legacyReactorGroup);

      const isLight = currentTheme === "light";

      // 內層脈衝金輝微核 (取代原本黑漆漆的著色球體，重現經典發光能量核心)
      legacyInnerGlowMat = new THREE.MeshBasicMaterial({
        color: isLight ? 0x38bdf8 : 0xf5c443,
        transparent: true,
        opacity: isLight ? 0.58 : 0.78
      });
      legacyInnerGlowMesh = new THREE.Mesh(new THREE.SphereGeometry(5.8, 24, 20), legacyInnerGlowMat);
      legacyReactorGroup.add(legacyInnerGlowMesh);

      // 中層深藍半透明晶球護核 (讓內核金光自然透出)
      legacyCoreMat = new THREE.MeshStandardMaterial({
        color: isLight ? 0xdbeafe : 0x0a2548,
        emissive: isLight ? 0x93c5fd : 0x082046,
        emissiveIntensity: isLight ? 0.35 : 0.65,
        metalness: 0.28,
        roughness: 0.25,
        transparent: true,
        opacity: isLight ? 0.68 : 0.72
      });
      legacyCoreMesh = new THREE.Mesh(new THREE.SphereGeometry(8.6, 30, 24), legacyCoreMat);
      legacyReactorGroup.add(legacyCoreMesh);

      legacyGlassShellMat = new THREE.MeshPhysicalMaterial({
        color: isLight ? 0x38bdf8 : 0x24d0c6,
        metalness: 0.05,
        roughness: 0.1,
        clearcoat: 1.0,
        transparent: true,
        opacity: isLight ? 0.24 : 0.22,
        depthWrite: false
      });
      legacyGlassShell = new THREE.Mesh(new THREE.SphereGeometry(9.8, 26, 20), legacyGlassShellMat);
      legacyReactorGroup.add(legacyGlassShell);

      // 外層經典細緻二級正二十面體科技晶格 (IcosahedronGeometry detail=2)
      legacyLatticeMat = new THREE.MeshBasicMaterial({
        color: isLight ? 0x0284c7 : 0x00f6ff,
        wireframe: true,
        transparent: true,
        opacity: isLight ? 0.50 : 0.85
      });
      legacyLatticeMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(10.8, 2), legacyLatticeMat);
      legacyReactorGroup.add(legacyLatticeMesh);

      const ringSpecs = [
        { r: 14.5, tube: 0.24, dark: 0xf5c443, light: 0xc27803, rot: [Math.PI / 2, 0, 0] },
        { r: 17.6, tube: 0.20, dark: 0x00f6ff, light: 0x0284c7, rot: [Math.PI / 3.2, Math.PI / 4, 0] },
        { r: 21.0, tube: 0.17, dark: 0x38e888, light: 0x059669, rot: [-Math.PI / 3.5, 0, Math.PI / 5] },
        { r: 24.6, tube: 0.15, dark: 0xc084fc, light: 0x7c3aed, rot: [Math.PI / 4.5, Math.PI / 2.4, 0] }
      ];
      legacyRings = [];
      legacyRingMats = [];
      ringSpecs.forEach((spec) => {
        const colHex = isLight ? spec.light : spec.dark;
        const rMat = new THREE.MeshStandardMaterial({
          color: colHex,
          emissive: colHex,
          emissiveIntensity: isLight ? 0.22 : 0.72,
          metalness: 0.78,
          roughness: 0.22,
          transparent: true,
          opacity: isLight ? 0.78 : 0.86
        });
        const ringGroup = new THREE.Group();
        ringGroup.add(new THREE.Mesh(new THREE.TorusGeometry(spec.r, spec.tube, 12, 84), rMat));
        for (let b = 0; b < 2; b++) {
          const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), rMat);
          beacon.position.set(b === 0 ? spec.r : -spec.r, 0, 0);
          ringGroup.add(beacon);
        }
        ringGroup.rotation.set(spec.rot[0], spec.rot[1], spec.rot[2]);
        legacyReactorGroup.add(ringGroup);
        legacyRings.push(ringGroup);
        legacyRingMats.push({ mat: rMat, dark: spec.dark, light: spec.light });
      });

      legacySatMat = new THREE.MeshStandardMaterial({
        color: isLight ? 0x0284c7 : 0x34e2d8,
        emissive: isLight ? 0x0284c7 : 0x34e2d8,
        emissiveIntensity: isLight ? 0.25 : 0.85,
        metalness: 0.7,
        roughness: 0.2
      });
      legacySatellites = [];
      for (let i = 0; i < 4; i++) {
        const sat = new THREE.Mesh(new THREE.OctahedronGeometry(0.76, 0), legacySatMat);
        legacyReactorGroup.add(sat);
        legacySatellites.push({
          mesh: sat,
          orbitR: 14.5 + i * 3.35,
          speed: 0.72 + i * 0.26,
          phase: (i * Math.PI) / 2,
          tilt: 0.20 + i * 0.07
        });
      }

      // 2. 放大 2 倍之後景體積感 3D 旋臂星雲星系 (位於球體後方 Z: -58)
      legacyDiscGroup = new THREE.Group();
      legacyDiscGroup.position.set(0, 0, -26);
      legacyDiscGroup.rotation.set(-1.04, 0.12, -0.22);
      legacyDiscGroup.scale.setScalar(2.0);

      const offsets = [-1.0, 0.0, 1.0];
      const zShifts = [-2.4, 0.0, 2.4];
      legacyGalaxyMats = [];
      legacyGalaxyMeshes = [];
      offsets.forEach((off, idx) => {
        const mat = new THREE.ShaderMaterial({
          vertexShader: S.volumetricGalaxy.vertexShader,
          fragmentShader: S.volumetricGalaxy.fragmentShader,
          uniforms: {
            uTime: { value: 0 },
            uLightMode: { value: animState.lightMode },
            uPulseBoost: { value: 0 },
            uLayerOffset: { value: off }
          },
          transparent: true,
          blending: THREE.NormalBlending,
          side: THREE.DoubleSide,
          depthWrite: false
        });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(178, 178), mat);
        mesh.position.z = zShifts[idx];
        legacyDiscGroup.add(mesh);
        legacyGalaxyMats.push(mat);
        legacyGalaxyMeshes.push(mesh);
      });

      legacyGroup.add(legacyDiscGroup);

      legacyStarMat = new THREE.ShaderMaterial({
        vertexShader: S.sparkleStar.vertexShader,
        fragmentShader: S.sparkleStar.fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uLightMode: { value: animState.lightMode },
          uPixelRatio: { value: renderer.getPixelRatio() },
          uPulseBoost: { value: 0 }
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      buildLegacyStars(starCount);
      buildLegacySpiralDust(Math.round(starCount * 1.3));
      buildLegacyExplosionSystem();
      scene.add(legacyGroup);
    }

    function buildSupernovaSystem() {
      const S = global.ASTRAL_SHADERS;
      const ringColors = ["#fde047", "#34e2d8", "#e879f9"];
      const ringTilts = [
        [-Math.PI * 0.5, 0, 0],
        [-Math.PI * 0.3, 0.55, 0.25],
        [-Math.PI * 0.35, -0.55, -0.25]
      ];
      shockwaves = [];
      for (let i = 0; i < 3; i++) {
        const mat = new THREE.ShaderMaterial({
          vertexShader: S.shockwaveRing.vertexShader,
          fragmentShader: S.shockwaveRing.fragmentShader,
          uniforms: { uColor: { value: new THREE.Color(ringColors[i]) }, uOpacity: { value: 0 } },
          transparent: true,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false
        });
        const mesh = new THREE.Mesh(new THREE.RingGeometry(2.4, 4.4, 72), mat);
        mesh.position.set(0, 2.7, -24);
        mesh.rotation.set(ringTilts[i][0], ringTilts[i][1], ringTilts[i][2]);
        scene.add(mesh);
        shockwaves.push({ mesh, mat });
      }

      const pCount = 450;
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(pCount * 3);
      const sizes = new Float32Array(pCount);
      const mixes = new Float32Array(pCount);
      supernovaMeta = [];
      for (let i = 0; i < pCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const dir = new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta),
          Math.sin(phi) * Math.sin(theta),
          Math.cos(phi)
        );
        supernovaMeta.push({
          dir,
          outerR: 26 + Math.random() * 14,
          burstR: 42 + Math.random() * 38,
          spin: (Math.random() - 0.5) * 4.5
        });
        sizes[i] = 2.6 + Math.random() * 4.8;
        mixes[i] = Math.random();
      }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
      geo.setAttribute("aMix", new THREE.BufferAttribute(mixes, 1));

      supernovaPoints = new THREE.Points(geo, supernovaMat);
      supernovaPoints.position.set(0, 2.7, -24);
      supernovaPoints.visible = false;
      scene.add(supernovaPoints);

      // 新版星穹宮殿專屬：蒼穹聖輝能量光柱 (僅於新版特效啟動，絕不拆散宮殿)
      palaceBeamMat = new THREE.ShaderMaterial({
        vertexShader: S.palaceBeam.vertexShader,
        fragmentShader: S.palaceBeam.fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uColorA: { value: moodPrimary.clone() },
          uColorB: { value: moodSecondary.clone() },
          uOpacity: { value: 0 }
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      palaceBeamMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 3.6, 56, 24, 1, true), palaceBeamMat);
      palaceBeamMesh.position.set(0, 26, -24);
      palaceBeamMesh.visible = false;
      scene.add(palaceBeamMesh);
    }

    function updateSupernovaParticles() {
      if (!supernovaState.active || !supernovaPoints) return;
      const posAttr = supernovaPoints.geometry.attributes.position;
      const p = supernovaState.progress;
      for (let i = 0; i < supernovaMeta.length; i++) {
        const m = supernovaMeta[i];
        let r;
        if (supernovaState.phase === 1) {
          // 階段 1：從外圈高速螺旋內縮吸入核心
          r = m.outerR * (1.0 - p);
          const ang = p * m.spin;
          const cosA = Math.cos(ang), sinA = Math.sin(ang);
          const x = m.dir.x * cosA - m.dir.z * sinA;
          const z = m.dir.x * sinA + m.dir.z * cosA;
          posAttr.setXYZ(i, x * r, m.dir.y * r, z * r);
        } else if (supernovaState.phase === 3) {
          // 階段 3：爆炸碎片漩渦重聚核心重生
          r = m.burstR * (1.0 - Math.pow(p, 0.65));
          const ang = (1.0 - p) * m.spin * 1.4;
          const cosA = Math.cos(ang), sinA = Math.sin(ang);
          const x = m.dir.x * cosA - m.dir.z * sinA;
          const z = m.dir.x * sinA + m.dir.z * cosA;
          posAttr.setXYZ(i, x * r, m.dir.y * r, z * r);
        } else {
          // 階段 2：向外猛烈噴發散射
          r = 0.8 + Math.pow(p, 0.72) * m.burstR;
          posAttr.setXYZ(i, m.dir.x * r, m.dir.y * r, m.dir.z * r);
        }
      }
      posAttr.needsUpdate = true;
      supernovaMat.uniforms.uOpacity.value = supernovaState.opacity;
      supernovaMat.uniforms.uHeat.value = supernovaState.heat;
    }

    /* ------------------------------------------------------------------
     * 5. 後處理管線 (EffectComposer + UnrealBloomPass)
     * ------------------------------------------------------------------ */
    function setupPostProcessing(width, height) {
      const hasPost =
        typeof THREE.EffectComposer === "function" &&
        typeof THREE.RenderPass === "function" &&
        typeof THREE.UnrealBloomPass === "function";
      if (!hasPost) { useBloom = false; return; }

      try {
        let rt = null;
        if (renderer.capabilities?.isWebGL2) {
          rt = new THREE.WebGLRenderTarget(width, height, {
            type: THREE.HalfFloatType,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat
          });
        }
        composer = rt ? new THREE.EffectComposer(renderer, rt) : new THREE.EffectComposer(renderer);
        composer.setPixelRatio(renderer.getPixelRatio());
        composer.setSize(width, height);
        composer.addPass(new THREE.RenderPass(scene, camera));
        bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(width, height), 0.48, 0.62, 0.74);
        composer.addPass(bloomPass);
        useBloom = !legacyMode && currentTheme === "dark" && currentQuality !== "smooth";
      } catch (e) {
        composer = null; bloomPass = null; useBloom = false;
      }
    }

    /* ------------------------------------------------------------------
     * 6. Three.js 3D 立體介面邊框系統 (主頁使用，進入作物計算後保持直立好操作)
     * ------------------------------------------------------------------ */
    function buildUI3DFrameForElement(el) {
      const group = new THREE.Group();
      const slab = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.28), matUiGlass);
      slab.position.z = -0.14;
      group.add(slab);

      const railGeo = new THREE.BoxGeometry(1, 1, 0.34);
      const topRail = new THREE.Mesh(railGeo, matUiBezel);
      const bottomRail = new THREE.Mesh(railGeo, matUiBezel);
      const leftRail = new THREE.Mesh(railGeo, matUiBezel);
      const rightRail = new THREE.Mesh(railGeo, matUiBezel);
      group.add(topRail, bottomRail, leftRail, rightRail);

      const claspGeo = new THREE.BoxGeometry(0.24, 0.24, 0.42);
      const gemGeo = new THREE.OctahedronGeometry(0.11, 0);
      const corners = [];
      for (let i = 0; i < 4; i++) {
        const clasp = new THREE.Mesh(claspGeo, matGoldMetal);
        const gem = new THREE.Mesh(gemGeo, matAccentCrystal);
        gem.position.z = 0.26;
        const cornerGroup = new THREE.Group();
        cornerGroup.add(clasp, gem);
        group.add(cornerGroup);
        corners.push({ cornerGroup, gem });
      }
      uiRigGroup.add(group);
      return { el, group, slab, topRail, bottomRail, leftRail, rightRail, corners };
    }

    function initUI3DFrames() {
      appStageEl = document.querySelector(".app-stage");
      uiRigGroup = new THREE.Group();
      uiRigGroup.position.set(0, 0, -18);
      camera.add(uiRigGroup);

      uiFrameItems = [];
      document.querySelectorAll("[data-ui3d]").forEach((el) => {
        uiFrameItems.push(buildUI3DFrameForElement(el));
      });

      if (appStageEl && typeof global.ResizeObserver === "function") {
        const ro = new global.ResizeObserver(() => { uiRectsDirty = true; });
        ro.observe(appStageEl);
      }
    }

    function syncUI3DFrames(t) {
      if (!uiRigGroup || !camera || uiFrameItems.length === 0) return;

      // 舊版介面或進入作物計算頁後不用 3D 骨架包圍與舞台傾斜，保持純淨精準直覺操作
      const showFrames = !legacyMode && currentView === "picker";
      uiRigGroup.visible = showFrames;

      const rx = showFrames && parallaxEnabled ? -smoothPY * 0.008 : 0;
      const ry = showFrames && parallaxEnabled ? smoothPX * 0.008 : 0;
      uiRigGroup.rotation.set(rx, ry, 0);

      if (!showFrames) {
        if (appStageEl && (lastStageRX !== 0 || lastStageRY !== 0)) {
          lastStageRX = 0;
          lastStageRY = 0;
          appStageEl.style.setProperty("--stage-rx", "0deg");
          appStageEl.style.setProperty("--stage-ry", "0deg");
        }
        return;
      }

      const vw = global.innerWidth || 1280;
      const vh = global.innerHeight || 720;
      const dist = 18;
      const visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * dist;
      const visW = visH * camera.aspect;
      const railThick = Math.max(0.065, visH * 0.0048);

      // 先完成佈局尺寸讀取，再套用舞台旋轉屬性以避免強迫同步排版
      for (let i = 0; i < uiFrameItems.length; i++) {
        const item = uiFrameItems[i];
        const el = item.el;
        if (!el || el.offsetParent === null) { item.group.visible = false; continue; }
        if (uiRectsDirty || !item.cachedRect) {
          item.cachedRect = el.getBoundingClientRect();
        }
        const rect = item.cachedRect;
        if (rect.width < 20 || rect.height < 20 || rect.bottom < -30 || rect.top > vh + 30) {
          item.group.visible = false;
          continue;
        }
        item.group.visible = true;
        const wWorld = (rect.width / vw) * visW;
        const hWorld = (rect.height / vh) * visH;
        const cx = ((rect.left + rect.width * 0.5) / vw - 0.5) * visW;
        const cy = (0.5 - (rect.top + rect.height * 0.5) / vh) * visH;

        item.group.position.set(cx, cy, 0);
        item.slab.scale.set(wWorld, hWorld, 1);

        item.topRail.scale.set(wWorld + railThick, railThick, 1);
        item.topRail.position.set(0, hWorld * 0.5, 0);
        item.bottomRail.scale.set(wWorld + railThick, railThick, 1);
        item.bottomRail.position.set(0, -hWorld * 0.5, 0);
        item.leftRail.scale.set(railThick, hWorld, 1);
        item.leftRail.position.set(-wWorld * 0.5, 0, 0);
        item.rightRail.scale.set(railThick, hWorld, 1);
        item.rightRail.position.set(wWorld * 0.5, 0, 0);

        const hx = wWorld * 0.5, hy = hWorld * 0.5;
        const coords = [[-hx, hy], [hx, hy], [-hx, -hy], [hx, -hy]];
        for (let c = 0; c < 4; c++) {
          const cg = item.corners[c];
          cg.cornerGroup.position.set(coords[c][0], coords[c][1], 0.02);
          cg.gem.rotation.y = t * 1.4 + c * 0.8 + i * 0.5;
          cg.gem.rotation.x = Math.sin(t * 1.1 + c) * 0.3;
        }
      }
      uiRectsDirty = false;

      if (appStageEl && (Math.abs(rx - lastStageRX) > 0.0004 || Math.abs(ry - lastStageRY) > 0.0004)) {
        lastStageRX = rx;
        lastStageRY = ry;
        appStageEl.style.setProperty("--stage-rx", `${(rx * 57.2958 * 0.65).toFixed(3)}deg`);
        appStageEl.style.setProperty("--stage-ry", `${(ry * 57.2958 * 0.65).toFixed(3)}deg`);
      }
    }

    /* ------------------------------------------------------------------
     * 7. 初始化
     * ------------------------------------------------------------------ */
    function init({ canvasId = "quantumCanvas3D", theme = "dark", quality = "smooth", parallax = true, legacy = false } = {}) {
      if (initialized) return;
      const canvas = document.getElementById(canvasId);
      if (!canvas || !global.THREE || !global.ASTRAL_SHADERS) return;

      currentTheme = theme === "light" ? "light" : "dark";
      currentQuality = ["ultra", "high", "smooth"].includes(quality) ? quality : "smooth";
      parallaxEnabled = Boolean(parallax);
      legacyMode = Boolean(legacy);
      animState.lightMode = currentTheme === "light" ? 1.0 : 0.0;

      const w = global.innerWidth || 1280;
      const h = global.innerHeight || 720;

      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
      renderer.setSize(w, h);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = currentTheme === "light" ? 0.90 : 1.02;
      renderer.outputEncoding = THREE.sRGBEncoding;

      const maxDpr = currentQuality === "ultra" ? 2.0 : currentQuality === "high" ? 1.5 : 1.0;
      renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, maxDpr));

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(48, w / h, 0.5, 900);
      camera.position.set(0, animState.camTargetY, animState.camTargetZ);
      scene.add(camera);

      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      envMapDark = buildStudioEnvMap(pmrem, false);
      envMapLight = buildStudioEnvMap(pmrem, true);
      pmrem.dispose();
      scene.environment = currentTheme === "light" ? envMapLight : envMapDark;

      const brushedTex = createBrushedMetalTexture();
      const strataTex = createStrataBumpTexture();
      const isLight = currentTheme === "light";

      matGoldMetal = new THREE.MeshStandardMaterial({
        color: isLight ? 0xc28e26 : 0xe5b954,
        metalness: 0.88, roughness: 0.25, roughnessMap: brushedTex, bumpMap: brushedTex, bumpScale: 0.015
      });
      matTitanium = new THREE.MeshStandardMaterial({
        color: isLight ? 0x3b536e : 0x26384d,
        metalness: 0.82, roughness: 0.30, roughnessMap: brushedTex
      });
      matMarble = new THREE.MeshStandardMaterial({
        color: isLight ? 0xdde7f2 : 0x1e3046,
        metalness: 0.22, roughness: 0.42, bumpMap: strataTex, bumpScale: 0.04
      });
      matStone = new THREE.MeshStandardMaterial({
        color: isLight ? 0x52647a : 0x162234,
        metalness: 0.14, roughness: 0.80, bumpMap: strataTex, bumpScale: 0.14
      });
      matGlassDome = new THREE.MeshPhysicalMaterial({
        color: isLight ? 0x22a6b3 : 0x72e8ec,
        metalness: 0, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.04,
        transparent: true, opacity: isLight ? 0.28 : 0.22, depthWrite: false
      });
      matVeinGlow = new THREE.MeshStandardMaterial({
        color: moodPrimary.clone(), emissive: moodPrimary.clone(),
        emissiveIntensity: isLight ? 0.55 : 1.35, metalness: 0.2, roughness: 0.2
      });
      matAccentCrystal = new THREE.MeshPhysicalMaterial({
        color: moodPrimary.clone(), emissive: moodPrimary.clone(),
        emissiveIntensity: isLight ? 0.35 : 0.85, metalness: 0.15, roughness: 0.12, clearcoat: 1.0
      });
      matUiGlass = new THREE.MeshPhysicalMaterial({
        color: isLight ? 0xc8e4f8 : 0x0b1f36,
        metalness: 0.05, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.08,
        transparent: true, opacity: isLight ? 0.16 : 0.18, depthWrite: false
      });
      matUiBezel = new THREE.MeshStandardMaterial({
        color: isLight ? 0x415b78 : 0x2c4663,
        metalness: 0.85, roughness: 0.26, roughnessMap: brushedTex
      });

      const S = global.ASTRAL_SHADERS;

      skyMat = new THREE.ShaderMaterial({
        vertexShader: S.skyDome.vertexShader, fragmentShader: S.skyDome.fragmentShader,
        uniforms: {
          uTime: { value: 0 }, uLightMode: { value: animState.lightMode },
          uMoodPrimary: { value: moodPrimary.clone() }, uMoodSecondary: { value: moodSecondary.clone() },
          uPulseBoost: { value: 0 }
        },
        side: THREE.BackSide, depthWrite: false
      });
      scene.add(new THREE.Mesh(new THREE.SphereGeometry(320, 24, 16), skyMat));

      galaxyMat = new THREE.ShaderMaterial({
        vertexShader: S.spiralGalaxy.vertexShader, fragmentShader: S.spiralGalaxy.fragmentShader,
        uniforms: {
          uTime: { value: 0 }, uLightMode: { value: animState.lightMode },
          uPixelRatio: { value: renderer.getPixelRatio() }, uPulseBoost: { value: 0 }
        },
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
      });

      saturnRingMat = new THREE.ShaderMaterial({
        vertexShader: S.saturnRing.vertexShader, fragmentShader: S.saturnRing.fragmentShader,
        uniforms: {
          uTime: { value: 0 }, uLightMode: { value: animState.lightMode },
          uMoodPrimary: { value: moodPrimary.clone() }, uMoodSecondary: { value: moodSecondary.clone() },
          uInnerR: { value: 29.0 }, uOuterR: { value: 41.0 }
        },
        transparent: true, side: THREE.DoubleSide, depthWrite: false
      });

      cloudMat1 = new THREE.ShaderMaterial({
        vertexShader: S.cloudSea.vertexShader, fragmentShader: S.cloudSea.fragmentShader,
        uniforms: {
          uTime: { value: 0 }, uLightMode: { value: animState.lightMode },
          uMoodPrimary: { value: moodPrimary.clone() }, uMoodSecondary: { value: moodSecondary.clone() },
          uOpacity: { value: 0.85 }
        },
        transparent: true, depthWrite: false
      });
      cloudPlane1 = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), cloudMat1);
      cloudPlane1.rotation.x = -Math.PI / 2; cloudPlane1.position.y = -27;
      scene.add(cloudPlane1);

      cloudMat2 = new THREE.ShaderMaterial({
        vertexShader: S.cloudSea.vertexShader, fragmentShader: S.cloudSea.fragmentShader,
        uniforms: {
          uTime: { value: 12 }, uLightMode: { value: animState.lightMode },
          uMoodPrimary: { value: moodPrimary.clone() }, uMoodSecondary: { value: moodSecondary.clone() },
          uOpacity: { value: 0.5 }
        },
        transparent: true, depthWrite: false
      });
      cloudPlane2 = new THREE.Mesh(new THREE.PlaneGeometry(440, 440), cloudMat2);
      cloudPlane2.rotation.x = -Math.PI / 2; cloudPlane2.position.y = -35;
      scene.add(cloudPlane2);

      crystalMat = new THREE.ShaderMaterial({
        vertexShader: S.crystalCore.vertexShader, fragmentShader: S.crystalCore.fragmentShader,
        uniforms: {
          uTime: { value: 0 }, uLightMode: { value: animState.lightMode },
          uPrimaryColor: { value: moodPrimary.clone() }, uSecondaryColor: { value: moodSecondary.clone() },
          uIridescence: { value: moodTarget.iridescent }, uGlowIntensity: { value: moodTarget.glow },
          uPulseBoost: { value: 0 }
        },
        transparent: true
      });

      ribbonMat = new THREE.ShaderMaterial({
        vertexShader: S.energyRingRibbon.vertexShader, fragmentShader: S.energyRingRibbon.fragmentShader,
        uniforms: {
          uTime: { value: 0 }, uLightMode: { value: animState.lightMode },
          uColorA: { value: moodPrimary.clone() }, uColorB: { value: moodSecondary.clone() },
          uSpeed: { value: 1.8 }, uPulseBoost: { value: 0 }
        },
        transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false
      });

      stardustMat = new THREE.ShaderMaterial({
        vertexShader: S.stardustBokeh.vertexShader, fragmentShader: S.stardustBokeh.fragmentShader,
        uniforms: {
          uTime: { value: 0 }, uLightMode: { value: animState.lightMode },
          uPixelRatio: { value: renderer.getPixelRatio() },
          uColorA: { value: moodPrimary.clone() }, uColorB: { value: moodSecondary.clone() }
        },
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
      });

      supernovaMat = new THREE.ShaderMaterial({
        vertexShader: S.supernovaBurst.vertexShader, fragmentShader: S.supernovaBurst.fragmentShader,
        uniforms: { uPixelRatio: { value: renderer.getPixelRatio() }, uOpacity: { value: 0 }, uHeat: { value: 1.0 } },
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
      });

      // 燈光系統
      hemiLight = new THREE.HemisphereLight(isLight ? 0x93c5fd : 0x4cc9f0, isLight ? 0x475569 : 0x0b132b, 0.78);
      scene.add(hemiLight);
      dirLight = new THREE.DirectionalLight(isLight ? 0xfff1d6 : 0xbde8ff, isLight ? 1.15 : 1.38);
      dirLight.position.set(24, 36, 20);
      scene.add(dirLight);
      corePointLight = new THREE.PointLight(moodPrimary.getHex(), isLight ? 1.3 : 2.8, 64);
      corePointLight.position.set(0, 6.2, -24);
      scene.add(corePointLight);
      leftRimLight = new THREE.PointLight(0x34e2d8, isLight ? 0.85 : 1.9, 60);
      leftRimLight.position.set(-34, 8, -18);
      scene.add(leftRimLight);
      rightRimLight = new THREE.PointLight(0xf4c553, isLight ? 0.85 : 1.9, 60);
      rightRimLight.position.set(34, 8, -18);
      scene.add(rightRimLight);

      // 建造：宇宙皇家宮殿 + 星環 + 中心神果 + 滿天星系 + 遠景行星 + 懸浮晶簇
      buildCosmicPalace();
      buildCosmicPlanets();
      buildInstancedShards();
      buildSupernovaSystem();
      buildSpiralGalaxy(currentQuality === "ultra" ? 4200 : currentQuality === "high" ? 2800 : 1800);
      buildStardust(currentQuality === "ultra" ? 1400 : currentQuality === "high" ? 900 : 480);
      buildLegacyVolumetricGalaxy(currentQuality === "ultra" ? 2800 : currentQuality === "high" ? 2200 : 1600);

      initUI3DFrames();
      setupPostProcessing(w, h);
      setLegacyMode(legacyMode);

      global.addEventListener("resize", handleResize);
      global.addEventListener("scroll", () => { uiRectsDirty = true; }, { passive: true });
      global.addEventListener("mousemove", (e) => {
        if (!parallaxEnabled || global.isCustomSortDragging) return;
        isGyroInput = false;
        const w = global.innerWidth || 1280;
        const h = global.innerHeight || 720;
        pointerNX = (e.clientX / w - 0.5) * 2;
        pointerNY = (e.clientY / h - 0.5) * 2;

        if (legacyMode) {
          const mx = e.clientX - w * 0.5;
          const my = e.clientY - h * 0.5;
          legacyVelX += mx * 0.0012;
          legacyVelY -= my * 0.0012;
        }

        // 偵測電腦滑鼠劇烈來回甩動蓄能 (調高門檻避免一般移動誤觸爆炸)
        const now = performance.now();
        const dtMouse = Math.max(10, now - lastMouseTime);
        if (lastMouseX !== null) {
          const dx = e.clientX - lastMouseX;
          const dy = e.clientY - lastMouseY;
          const dist = Math.hypot(dx, dy);
          const speed = (dist / dtMouse) * 1000;
          if (dist > 85 && speed > 3600) {
            const curDirX = Math.sign(dx);
            const curDirY = Math.sign(dy);
            const revX = lastDirX !== 0 && curDirX !== 0 && curDirX !== lastDirX;
            const revY = lastDirY !== 0 && curDirY !== 0 && curDirY !== lastDirY;
            if (revX || revY) {
              mouseReversals = (now - lastReversalTime < 480) ? (mouseReversals + 1) : 1;
              lastReversalTime = now;
              if (mouseReversals >= 5) shakeEnergy += 18;
            }
            lastDirX = curDirX;
            lastDirY = curDirY;
          } else if (now - lastReversalTime > 600) {
            mouseReversals = 0;
          }
        }
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        lastMouseTime = now;
      }, { passive: true });
      global.addEventListener("devicemotion", (e) => {
        if (!parallaxEnabled || global.isCustomSortDragging) return;
        const acc = e.acceleration || e.accelerationIncludingGravity;
        if (!acc) return;
        const ax = acc.x || 0;
        const ay = acc.y || 0;
        const az = acc.z || 0;
        if (legacyMode) {
          legacyVelX -= ax * 0.35;
          legacyVelY += ay * 0.35;
        }
        const jerk = Math.abs(ax - lastAx) + Math.abs(ay - lastAy) + Math.abs(az - lastAz);
        if (jerk > 6.5) shakeEnergy += jerk * 0.55;
        lastAx = ax;
        lastAy = ay;
        lastAz = az;
      }, { passive: true });
      global.addEventListener("deviceorientation", (e) => {
        if (!parallaxEnabled || !Number.isFinite(e.gamma) || !Number.isFinite(e.beta)) return;
        if (Math.abs(e.beta) > 150) return;
        isGyroInput = true;
        if (gyroBaseGamma === null || gyroBaseBeta === null) {
          gyroBaseGamma = e.gamma;
          gyroBaseBeta = e.beta;
        }
        const dG = e.gamma - gyroBaseGamma;
        const dB = e.beta - gyroBaseBeta;
        // 基準姿態極緩慢跟隨手部姿勢 (放慢回正速度，傾斜時能持續感受到跟隨)
        gyroBaseGamma += dG * 0.0015;
        gyroBaseBeta += dB * 0.0015;
        // 背景視差：取消死區門檻，恢復原本的跟隨幅度
        pointerNX = Math.max(-1, Math.min(1, dG / 30));
        pointerNY = Math.max(-1, Math.min(1, dB / 30));
        if (legacyMode) {
          // 舊版球體保持目前的晃動手感 (沿用原本的死區與幅度)
          const deadzone = (v) => (Math.abs(v) < 1.5 ? 0 : v - Math.sign(v) * 1.5);
          const sNX = Math.max(-0.55, Math.min(0.55, deadzone(dG) / 28));
          const sNY = Math.max(-0.55, Math.min(0.55, deadzone(dB) / 28));
          legacyVelX += sNX * 0.38;
          legacyVelY -= sNY * 0.38;
        }
      }, { passive: true });
      document.addEventListener("visibilitychange", () => {
        isPaused = document.hidden;
        if (!isPaused && clock) clock.getDelta();
      });

      clock = new THREE.Clock();
      initialized = true;
      animate();
    }

    function handleResize() {
      if (!initialized || !renderer || !camera) return;
      uiRectsDirty = true;
      const w = global.innerWidth || 1280;
      const h = global.innerHeight || 720;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (composer) composer.setSize(w, h);
      if (bloomPass) bloomPass.setSize(w, h);
      if (legacyReactorGroup && legacyExpState === "IDLE") {
        legacyReactorGroup.scale.setScalar(getLegacyReactorBaseScale());
      }
    }

    /* ------------------------------------------------------------------
     * 8. 主動畫迴圈
     * ------------------------------------------------------------------ */
    function animate() {
      rafId = global.requestAnimationFrame(animate);
      if (isPaused || global.isCustomSortDragging || !renderer || !scene || !camera) return;

      frameCounter++;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const nowMs = performance.now();

      shakeEnergy *= 0.95;

      skyMat.uniforms.uTime.value = t;
      skyMat.uniforms.uLightMode.value = animState.lightMode;
      skyMat.uniforms.uPulseBoost.value = animState.pulseBoost;

      if (legacyMode) {
        if (legacyWarp > 1.0) legacyWarp = Math.max(1.0, legacyWarp - dt * 2.4);
        if (legacyWarp <= 1.15 && animState.pulseBoost <= 0.05) legacyTargetDir = 1.0;
        legacyRotDir += (legacyTargetDir - legacyRotDir) * Math.min(1.0, dt * 3.5);
        if (legacyBurstSpeed > 0) legacyBurstSpeed = Math.max(0, legacyBurstSpeed - dt * 0.85);

        crystalMat.uniforms.uTime.value = t;
        crystalMat.uniforms.uLightMode.value = animState.lightMode;
        crystalMat.uniforms.uPulseBoost.value = animState.pulseBoost;

        stardustMat.uniforms.uTime.value = t;
        stardustMat.uniforms.uLightMode.value = animState.lightMode;

        for (let i = 0; i < legacyGalaxyMats.length; i++) {
          if (legacyGalaxyMeshes[i] && !legacyGalaxyMeshes[i].visible) continue;
          legacyGalaxyMats[i].uniforms.uTime.value = t;
          legacyGalaxyMats[i].uniforms.uLightMode.value = animState.lightMode;
          legacyGalaxyMats[i].uniforms.uPulseBoost.value = animState.pulseBoost;
        }
        if (legacyStarMat) {
          legacyStarMat.uniforms.uTime.value = t;
          legacyStarMat.uniforms.uLightMode.value = animState.lightMode;
          legacyStarMat.uniforms.uPulseBoost.value = animState.pulseBoost;
        }
        if (legacyDiscGroup) {
          // 舊版星系與粒子平時持續溫和自轉，點擊作物(正向)與退回鈕(反向)時加速反轉；不跟隨滑鼠 / 陀螺儀傾斜位移
          legacyDiscGroup.rotation.z += dt * (0.07 * legacyWarp + animState.ringSpeedBoost * 0.25 + legacyBurstSpeed * 0.95) * legacyRotDir;
          legacyDiscGroup.rotation.x = -1.04;
          legacyDiscGroup.rotation.y = 0.12;
          legacyDiscGroup.position.x = 0;
          legacyDiscGroup.position.y = 0;
        }
        if (legacyStarPoints) {
          legacyStarPoints.rotation.y += dt * (0.042 * legacyWarp + legacyBurstSpeed * 0.55) * legacyRotDir;
          legacyStarPoints.rotation.x += dt * (0.018 * legacyWarp + legacyBurstSpeed * 0.28) * legacyRotDir;
          legacyStarPoints.position.x = 0;
          legacyStarPoints.position.y = 0;
        }

        // 舊版經典彈簧阻尼實體晃動 ＋ 過載蓄能震動爆裂
        const forceX = (0 - legacySpringX) * 0.08 - legacyVelX * 0.16;
        const forceY = (0 - legacySpringY) * 0.08 - legacyVelY * 0.16;
        legacyVelX += forceX;
        legacyVelY += forceY;
        legacySpringX = Math.max(-18, Math.min(18, legacySpringX + legacyVelX));
        legacySpringY = Math.max(-14, Math.min(14, legacySpringY + legacyVelY));

        let shakeBoost = 0;
        if (legacyExpState === "IDLE") {
          if (legacyReactorGroup) {
            const jitterX = shakeEnergy > 32 ? (Math.random() - 0.5) * (shakeEnergy * 0.045) : 0;
            const jitterY = shakeEnergy > 32 ? (Math.random() - 0.5) * (shakeEnergy * 0.045) : 0;
            legacyReactorGroup.position.x = legacySpringX + jitterX;
            legacyReactorGroup.position.y = Math.sin(t * 0.7) * 0.35 + legacySpringY + jitterY;
            legacyReactorGroup.rotation.z = -legacySpringX * 0.032;
            if (shakeEnergy > 32) shakeBoost = shakeEnergy * 0.065;
          }
          if (shakeEnergy > 120 && nowMs >= shakeCooldownUntil) {
            shakeEnergy = 0;
            shakeCooldownUntil = nowMs + 2200;
            triggerLegacyExplosion(true);
            triggerScreenGlow();
          }
        } else if (legacyExpState === "EXPLODING" && legacyDebrisPoints) {
          legacyExpTimer += dt;
          for (let i = 0; i < LEGACY_DEBRIS_COUNT; i++) {
            const idx = i * 3;
            legacyDebrisPos[idx] += legacyDebrisVel[idx] * dt * 16;
            legacyDebrisPos[idx + 1] += legacyDebrisVel[idx + 1] * dt * 16;
            legacyDebrisPos[idx + 2] += legacyDebrisVel[idx + 2] * dt * 16;
            legacyDebrisVel[idx] *= 0.95;
            legacyDebrisVel[idx + 1] *= 0.95;
            legacyDebrisVel[idx + 2] *= 0.95;
          }
          legacyDebrisGeo.attributes.position.needsUpdate = true;
          if (legacyExpTimer > 0.9) {
            legacyExpState = "COLLAPSING";
            legacyRotDir = -1;
            legacyTargetDir = 1;
          }
        } else if (legacyExpState === "COLLAPSING" && legacyDebrisPoints) {
          let allReturned = true;
          for (let i = 0; i < LEGACY_DEBRIS_COUNT; i++) {
            const idx = i * 3;
            const px = legacyDebrisPos[idx];
            const py = legacyDebrisPos[idx + 1];
            const pz = legacyDebrisPos[idx + 2];
            const dist = Math.hypot(px, py, pz);
            if (dist > 1.6) {
              allReturned = false;
              legacyDebrisPos[idx] += (-px * 6.8 + py * 3.2) * dt;
              legacyDebrisPos[idx + 1] += (-py * 6.8 - px * 3.2) * dt;
              legacyDebrisPos[idx + 2] += (-pz * 6.8) * dt;
            }
          }
          legacyDebrisGeo.attributes.position.needsUpdate = true;
          if (allReturned) {
            legacyExpState = "IDLE";
            legacyDebrisMat.opacity = 0;
            legacyDebrisPoints.visible = false;
            if (legacyReactorGroup) {
              legacyReactorGroup.visible = true;
              const baseS = getLegacyReactorBaseScale();
              if (global.gsap) {
                legacyReactorGroup.scale.setScalar(baseS * 0.2);
                global.gsap.to(legacyReactorGroup.scale, { x: baseS, y: baseS, z: baseS, duration: 0.7, ease: "elastic.out(1, 0.45)" });
              } else {
                legacyReactorGroup.scale.setScalar(baseS);
              }
            }
            if (global.gsap) global.gsap.to(animState, { pulseBoost: 0, ringSpeedBoost: 0, duration: 0.8, ease: "power2.out" });
          }
        }

        if (legacyReactorGroup && legacyReactorGroup.visible) {
          const lSpeed = dt * legacyWarp * legacyRotDir * (1.0 + animState.ringSpeedBoost * 4.2 + shakeBoost);
          if (legacyCoreMesh) {
            legacyCoreMesh.rotation.y -= lSpeed * 0.25;
            legacyCoreMesh.rotation.x += lSpeed * 0.14;
          }
          if (legacyInnerGlowMesh) {
            legacyInnerGlowMesh.rotation.y -= lSpeed * 0.35;
            legacyInnerGlowMesh.rotation.x += lSpeed * 0.25;
          }
          if (legacyGlassShell) legacyGlassShell.rotation.y += lSpeed * 0.22;
          if (legacyLatticeMesh) {
            legacyLatticeMesh.rotation.x += lSpeed * 0.36;
            legacyLatticeMesh.rotation.y += lSpeed * 0.54;
          }
          if (legacyRings.length >= 4) {
            legacyRings[0].rotation.z -= lSpeed * 0.45; legacyRings[0].rotation.y += lSpeed * 0.14;
            legacyRings[1].rotation.y += lSpeed * 0.42; legacyRings[1].rotation.x += lSpeed * 0.22;
            legacyRings[2].rotation.x += lSpeed * 0.36; legacyRings[2].rotation.z -= lSpeed * 0.24;
            legacyRings[3].rotation.x += lSpeed * 0.34; legacyRings[3].rotation.y -= lSpeed * 0.28; legacyRings[3].rotation.z += lSpeed * 0.20;
          }
          for (let i = 0; i < legacySatellites.length; i++) {
            const s = legacySatellites[i];
            const ang = t * s.speed * legacyRotDir * (1.0 + (legacyWarp - 1.0) * 0.35) + s.phase;
            s.mesh.position.set(
              Math.cos(ang) * s.orbitR,
              Math.sin(ang * 1.4) * (s.orbitR * s.tilt),
              Math.sin(ang) * s.orbitR
            );
            s.mesh.rotation.x += 1.6 * dt * legacyRotDir;
            s.mesh.rotation.y += 2.2 * dt * legacyRotDir;
          }
        }
      } else {
        // 新版搖晃蓄能過載：僅觸發宮殿專屬蒼穹聖輝特效，絕不拆散宮殿或果實
        if (shakeEnergy > 120 && nowMs >= shakeCooldownUntil) {
          shakeEnergy = 0;
          shakeCooldownUntil = nowMs + 2200;
          triggerNewPalaceEffect(true);
          triggerScreenGlow();
        }

        galaxyMat.uniforms.uTime.value = t;
        galaxyMat.uniforms.uLightMode.value = animState.lightMode;
        galaxyMat.uniforms.uPulseBoost.value = animState.pulseBoost;

        saturnRingMat.uniforms.uTime.value = t;
        saturnRingMat.uniforms.uLightMode.value = animState.lightMode;

        cloudMat1.uniforms.uTime.value = t;
        cloudMat1.uniforms.uLightMode.value = animState.lightMode;
        if (cloudPlane2?.visible) {
          cloudMat2.uniforms.uTime.value = t + 12.0;
          cloudMat2.uniforms.uLightMode.value = animState.lightMode;
        }

        crystalMat.uniforms.uTime.value = t;
        crystalMat.uniforms.uLightMode.value = animState.lightMode;
        crystalMat.uniforms.uPulseBoost.value = animState.pulseBoost;

        ribbonMat.uniforms.uTime.value = t;
        ribbonMat.uniforms.uLightMode.value = animState.lightMode;
        ribbonMat.uniforms.uPulseBoost.value = animState.pulseBoost;

        stardustMat.uniforms.uTime.value = t;
        stardustMat.uniforms.uLightMode.value = animState.lightMode;

        if (palaceBeamMesh?.visible && palaceBeamMat) {
          palaceBeamMat.uniforms.uTime.value = t;
        }

        if (planetGroup) {
          planetGroup.children.forEach((p, idx) => {
            p.rotation.y += dt * (0.04 + idx * 0.015);
            if (p.userData.planetMat) p.userData.planetMat.uniforms.uLightMode.value = animState.lightMode;
          });
        }

        if (galaxyPoints) {
          galaxyPoints.rotation.y += dt * 0.018;
        }

        const speedMult = 1.0 + animState.ringSpeedBoost * 5.0;
        if (palaceGroup) {
          palaceGroup.position.y = -3.5 + Math.sin(t * 0.5) * 0.45;
        }
        if (fruitGroup) {
          fruitGroup.rotation.y += dt * (0.35 + animState.ringSpeedBoost * 1.6);
          fruitGroup.position.y = 6.2 + Math.sin(t * 1.4) * 0.28;
          const s = (animState.weightScale + Math.sin(t * 2.0) * 0.02 + animState.pulseBoost * 0.12) * animState.fruitBurstScale;
          fruitGroup.scale.setScalar(s);
        }
        if (fruitSeedsGroup) {
          fruitSeedsGroup.rotation.y -= dt * 0.9;
        }

        if (ring1Group) { ring1Group.rotation.z += dt * 0.24 * speedMult; ring1Group.rotation.y += dt * 0.09 * speedMult; }
        if (ring2Group) { ring2Group.rotation.z -= dt * 0.16 * speedMult; ring2Group.rotation.x += dt * 0.06 * speedMult; }
        if (ring3Group) { ring3Group.rotation.z += dt * 0.05 * speedMult; }
        if (ring4Group) { ring4Group.rotation.z -= dt * 0.07 * speedMult; }

        // 懸浮晶簇隔幀更新，並重用全域 _dummy 消除每幀配置 GC
        if (instancedShards && shardMeta.length > 0 && (frameCounter % 2 === 0)) {
          for (let i = 0; i < shardMeta.length; i++) {
            const m = shardMeta[i];
            _dummy.position.set(m.x, m.y + Math.sin(t * m.speed + m.phase) * 0.9, m.z);
            _dummy.rotation.set(0, t * m.rotSpeed + m.phase, 0);
            _dummy.scale.setScalar(m.scale);
            _dummy.updateMatrix();
            instancedShards.setMatrixAt(i, _dummy.matrix);
          }
          instancedShards.instanceMatrix.needsUpdate = true;
        }

        updateSupernovaParticles();
      }

      // 主頁攝影機距離較遠 (z=40 vs 作物頁 z=34)，補償視差幅度讓主頁與進入作物後的背景晃動幅度一致
      const pickerComp = (!legacyMode && currentView === "picker") ? 1.24 : 1.0;
      const scaleX = (isGyroInput ? 3.0 : 3.4) * pickerComp;
      const scaleY = (isGyroInput ? 1.6 : 1.8) * pickerComp;
      const damp = isGyroInput ? 0.05 : 0.06;
      const targetPX = parallaxEnabled ? pointerNX * scaleX : 0;
      const targetPY = parallaxEnabled ? -pointerNY * scaleY : 0;
      smoothPX += (targetPX - smoothPX) * damp;
      smoothPY += (targetPY - smoothPY) * damp;

      // 新版背景遠景層視差 (星系、星球依景深反向位移，跟隨滑鼠 / 陀螺儀更有感)
      if (!legacyMode) {
        if (galaxyPoints) {
          galaxyPoints.position.x = -smoothPX * 3.2;
          galaxyPoints.position.y = 14 - smoothPY * 2.0;
        }
        if (planetGroup) {
          planetGroup.position.x = -smoothPX * 1.8;
          planetGroup.position.y = -smoothPY * 1.2;
        }
      }

      const shakeX = animState.camShake > 0.001 ? (Math.random() - 0.5) * animState.camShake : 0;
      const shakeY = animState.camShake > 0.001 ? (Math.random() - 0.5) * animState.camShake : 0;

      // 舊版模式不移動攝影機（確保星系與粒子完全不跟隨滑鼠/陀螺儀，僅中央球體晃動）
      camera.position.x = animState.camTargetX + (legacyMode ? 0 : smoothPX) + shakeX;
      camera.position.y = animState.camTargetY + (legacyMode ? 0 : smoothPY) + shakeY;
      camera.position.z = animState.camTargetZ;
      camera.lookAt(0, animState.lookAtY, -24);

      if (!legacyMode) syncUI3DFrames(t);

      // 主頁作物晶塊跟隨滑鼠 / 陀螺儀微微傾斜 (正常靜止時回正 0deg，不刻意偏斜)
      if (!pickerGridEl) pickerGridEl = document.getElementById("pickerGrid");
      if (pickerGridEl) {
        const wantTilt = currentView === "picker" && !legacyMode && parallaxEnabled;
        const tileRx = wantTilt ? (smoothPY / Math.max(0.1, scaleY)) * 6.5 : 0;
        const tileRy = wantTilt ? (smoothPX / Math.max(0.1, scaleX)) * 7.5 : 0;
        if (Math.abs(tileRx - lastTileTiltX) > 0.08 || Math.abs(tileRy - lastTileTiltY) > 0.08) {
          lastTileTiltX = tileRx;
          lastTileTiltY = tileRy;
          pickerGridEl.style.setProperty("--tilt-rx", `${tileRx.toFixed(2)}deg`);
          pickerGridEl.style.setProperty("--tilt-ry", `${tileRy.toFixed(2)}deg`);
        }
      }

      if (useBloom && composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    }

    /* ------------------------------------------------------------------
     * 9. 外部連動 API
     * ------------------------------------------------------------------ */
    function setTheme(themeName) {
      currentTheme = themeName === "light" ? "light" : "dark";
      if (!initialized) return;
      const isLight = currentTheme === "light";
      scene.environment = isLight ? envMapLight : envMapDark;
      useBloom = !legacyMode && !isLight && currentQuality !== "smooth" && Boolean(composer);

      const dur = 0.85;
      if (global.gsap) {
        global.gsap.to(animState, { lightMode: isLight ? 1.0 : 0.0, duration: dur, ease: "power2.inOut" });
        global.gsap.to(renderer, { toneMappingExposure: isLight ? 0.90 : 1.02, duration: dur });

        const tweenCol = (mat, hex) => {
          const c = new THREE.Color(hex);
          global.gsap.to(mat.color, { r: c.r, g: c.g, b: c.b, duration: dur });
        };
        tweenCol(matGoldMetal, isLight ? 0xc28e26 : 0xe5b954);
        tweenCol(matTitanium,  isLight ? 0x3b536e : 0x26384d);
        tweenCol(matMarble,    isLight ? 0xdde7f2 : 0x1e3046);
        tweenCol(matStone,     isLight ? 0x52647a : 0x162234);
        tweenCol(matGlassDome, isLight ? 0x22a6b3 : 0x72e8ec);
        tweenCol(matUiGlass,   isLight ? 0xc8e4f8 : 0x0b1f36);
        tweenCol(matUiBezel,   isLight ? 0x415b78 : 0x2c4663);

        global.gsap.to(matGlassDome, { opacity: isLight ? 0.28 : 0.22, duration: dur });
        global.gsap.to(matVeinGlow, { emissiveIntensity: isLight ? 0.55 : 1.35, duration: dur });
        global.gsap.to(matAccentCrystal, { emissiveIntensity: isLight ? 0.35 : 0.85, duration: dur });
        global.gsap.to(matUiGlass, { opacity: isLight ? 0.16 : 0.18, duration: dur });

        const hSky = new THREE.Color(isLight ? 0x93c5fd : 0x4cc9f0);
        const hGnd = new THREE.Color(isLight ? 0x475569 : 0x0b132b);
        const dCol = new THREE.Color(isLight ? 0xfff1d6 : 0xbde8ff);
        global.gsap.to(hemiLight.color, { r: hSky.r, g: hSky.g, b: hSky.b, duration: dur });
        global.gsap.to(hemiLight.groundColor, { r: hGnd.r, g: hGnd.g, b: hGnd.b, duration: dur });
        global.gsap.to(dirLight.color, { r: dCol.r, g: dCol.g, b: dCol.b, duration: dur });
        global.gsap.to(dirLight, { intensity: isLight ? 1.15 : 1.38, duration: dur });
        global.gsap.to(corePointLight, { intensity: isLight ? 1.3 : 2.8, duration: dur });
        global.gsap.to(leftRimLight, { intensity: isLight ? 0.85 : 1.9, duration: dur });
        global.gsap.to(rightRimLight, { intensity: isLight ? 0.85 : 1.9, duration: dur });

        if (legacyInnerGlowMat) {
          const ic = new THREE.Color(isLight ? 0x38bdf8 : 0xf5c443);
          global.gsap.to(legacyInnerGlowMat.color, { r: ic.r, g: ic.g, b: ic.b, duration: dur });
          global.gsap.to(legacyInnerGlowMat, { opacity: isLight ? 0.58 : 0.78, duration: dur });
        }
        if (legacyCoreMat) {
          const cc = new THREE.Color(isLight ? 0xdbeafe : 0x0a2548);
          const ec = new THREE.Color(isLight ? 0x93c5fd : 0x082046);
          global.gsap.to(legacyCoreMat.color, { r: cc.r, g: cc.g, b: cc.b, duration: dur });
          global.gsap.to(legacyCoreMat.emissive, { r: ec.r, g: ec.g, b: ec.b, duration: dur });
          global.gsap.to(legacyCoreMat, { opacity: isLight ? 0.68 : 0.72, duration: dur });
        }
        if (legacyGlassShellMat) {
          const gc = new THREE.Color(isLight ? 0x38bdf8 : 0x24d0c6);
          global.gsap.to(legacyGlassShellMat.color, { r: gc.r, g: gc.g, b: gc.b, duration: dur });
          global.gsap.to(legacyGlassShellMat, { opacity: isLight ? 0.24 : 0.22, duration: dur });
        }
        if (legacyLatticeMat) {
          const lc = new THREE.Color(isLight ? 0x0284c7 : 0x00f6ff);
          global.gsap.to(legacyLatticeMat.color, { r: lc.r, g: lc.g, b: lc.b, duration: dur });
          global.gsap.to(legacyLatticeMat, { opacity: isLight ? 0.50 : 0.85, duration: dur });
        }
        legacyRingMats.forEach((entry) => {
          const rc = new THREE.Color(isLight ? entry.light : entry.dark);
          global.gsap.to(entry.mat.color, { r: rc.r, g: rc.g, b: rc.b, duration: dur });
          global.gsap.to(entry.mat.emissive, { r: rc.r, g: rc.g, b: rc.b, duration: dur });
          global.gsap.to(entry.mat, { emissiveIntensity: isLight ? 0.22 : 0.72, opacity: isLight ? 0.78 : 0.86, duration: dur });
        });
        if (legacySatMat) {
          const sc = new THREE.Color(isLight ? 0x0284c7 : 0x34e2d8);
          global.gsap.to(legacySatMat.color, { r: sc.r, g: sc.g, b: sc.b, duration: dur });
          global.gsap.to(legacySatMat.emissive, { r: sc.r, g: sc.g, b: sc.b, duration: dur });
          global.gsap.to(legacySatMat, { emissiveIntensity: isLight ? 0.25 : 0.85, duration: dur });
        }
        if (legacyDebrisMat) {
          legacyDebrisMat.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
          legacyDebrisMat.needsUpdate = true;
        }
      }
    }

    function setView(viewName) {
      currentView = viewName === "calculator" ? "calculator" : "picker";
      uiRectsDirty = true;
      if (!initialized || !global.gsap) return;
      const isCalc = currentView === "calculator";
      global.gsap.to(animState, {
        camTargetY: isCalc ? 4.0 : 4.8,
        camTargetZ: isCalc ? 34.0 : 40.0,
        lookAtY: isCalc ? 2.2 : 2.0,
        duration: 0.95,
        ease: "power3.out"
      });
    }

    function setDominantMood(moodKey) {
      if (!initialized) return;
      const paletteSet = global.FARM_CONFIG?.QUALITY_MOODS?.[moodKey] || global.FARM_CONFIG?.QUALITY_MOODS?.["至臻"];
      if (!paletteSet) return;
      const p = currentTheme === "light" ? paletteSet.light : paletteSet.dark;

      const c1 = new THREE.Color(p.primary);
      const c2 = new THREE.Color(p.secondary);
      const cRim = new THREE.Color(p.rim);

      const applyU = (u, tc) => {
        if (!u) return;
        if (global.gsap) global.gsap.to(u.value, { r: tc.r, g: tc.g, b: tc.b, duration: 0.65 });
        else u.value.copy(tc);
      };
      applyU(skyMat.uniforms.uMoodPrimary, c1);
      applyU(skyMat.uniforms.uMoodSecondary, c2);
      applyU(saturnRingMat.uniforms.uMoodPrimary, c1);
      applyU(saturnRingMat.uniforms.uMoodSecondary, c2);
      applyU(cloudMat1.uniforms.uMoodPrimary, c1);
      applyU(cloudMat1.uniforms.uMoodSecondary, c2);
      applyU(cloudMat2.uniforms.uMoodPrimary, c1);
      applyU(cloudMat2.uniforms.uMoodSecondary, c2);
      applyU(crystalMat.uniforms.uPrimaryColor, c1);
      applyU(crystalMat.uniforms.uSecondaryColor, c2);
      applyU(ribbonMat.uniforms.uColorA, c1);
      applyU(ribbonMat.uniforms.uColorB, c2);
      applyU(stardustMat.uniforms.uColorA, c1);
      applyU(stardustMat.uniforms.uColorB, c2);
      if (palaceBeamMat) {
        applyU(palaceBeamMat.uniforms.uColorA, c1);
        applyU(palaceBeamMat.uniforms.uColorB, c2);
      }

      if (global.gsap) {
        global.gsap.to(crystalMat.uniforms.uIridescence, { value: p.iridescent, duration: 0.65 });
        global.gsap.to(crystalMat.uniforms.uGlowIntensity, { value: p.glow, duration: 0.65 });
        [matVeinGlow, matAccentCrystal].forEach((m) => {
          global.gsap.to(m.color, { r: c1.r, g: c1.g, b: c1.b, duration: 0.65 });
          global.gsap.to(m.emissive, { r: c1.r, g: c1.g, b: c1.b, duration: 0.65 });
        });
        global.gsap.to(corePointLight.color, { r: c1.r, g: c1.g, b: c1.b, duration: 0.65 });
        global.gsap.to(leftRimLight.color, { r: c1.r, g: c1.g, b: c1.b, duration: 0.65 });
        global.gsap.to(rightRimLight.color, { r: cRim.r, g: cRim.g, b: cRim.b, duration: 0.65 });
      }
    }

    function setWeightEnergy(ratio) {
      const clamped = Math.max(0, Math.min(1, Number(ratio) || 0));
      const targetScale = 0.86 + clamped * 0.34;
      if (global.gsap) global.gsap.to(animState, { weightScale: targetScale, duration: 0.45, ease: "power2.out" });
      else animState.weightScale = targetScale;
    }

    function pulse(moodKey, direction = 1) {
      if (moodKey) setDominantMood(moodKey);
      if (!initialized || !global.gsap) return;
      const dir = direction < 0 ? -1 : 1;

      global.gsap.killTweensOf(animState, "pulseBoost");
      animState.pulseBoost = 0.6;
      global.gsap.to(animState, { pulseBoost: 0, duration: 0.9, ease: "power2.out" });

      if (legacyMode) {
        legacyWarp = 3.8;
        legacyRotDir = dir;
        legacyTargetDir = dir;
        legacyBurstSpeed = 1.0;
        legacyBurstDir = dir;
        if (legacyReactorGroup) {
          const baseS = getLegacyReactorBaseScale();
          global.gsap.killTweensOf(legacyReactorGroup.scale);
          global.gsap.fromTo(legacyReactorGroup.scale, { x: baseS * 1.16, y: baseS * 1.16, z: baseS * 1.16 }, { x: baseS, y: baseS, z: baseS, duration: 0.65, ease: "elastic.out(1.1, 0.4)" });
        }
        if (legacyBlastRing && legacyBlastRingMat) {
          legacyBlastRing.visible = true;
          legacyBlastRingMat.uniforms.uColor.value.copy(crystalMat.uniforms.uPrimaryColor.value);
          legacyBlastRingMat.uniforms.uOpacity.value = 0.72;
          legacyBlastRing.scale.setScalar(0.6);
          global.gsap.killTweensOf(legacyBlastRing.scale);
          global.gsap.killTweensOf(legacyBlastRingMat.uniforms.uOpacity);
          global.gsap.to(legacyBlastRing.scale, { x: 4.5, y: 4.5, z: 4.5, duration: 0.9, ease: "power2.out" });
          global.gsap.to(legacyBlastRingMat.uniforms.uOpacity, { value: 0, duration: 0.9, ease: "power2.out", onComplete: () => { legacyBlastRing.visible = false; } });
        }
      } else if (shockwaves.length > 0) {
        const sw = shockwaves[0];
        sw.mesh.position.set(0, 2.7, -24);
        sw.mesh.visible = true;
        sw.mat.uniforms.uColor.value.copy(crystalMat.uniforms.uPrimaryColor.value);
        sw.mesh.scale.setScalar(0.8);
        sw.mat.uniforms.uOpacity.value = 0.8;
        global.gsap.killTweensOf(sw.mesh.scale);
        global.gsap.killTweensOf(sw.mat.uniforms.uOpacity);
        global.gsap.to(sw.mesh.scale, { x: 8.5, y: 8.5, z: 8.5, duration: 1.05, ease: "power2.out" });
        global.gsap.to(sw.mat.uniforms.uOpacity, { value: 0, duration: 1.05, ease: "power2.out" });
      }
    }

    /* 舊版獨立特效：球體碎裂成 650 顆粒子物理爆散 ＋ 金青超新星環 ＋ 漩渦倒流重聚彈性重生 */
    function triggerLegacyExplosion(playAudio = false, force = false) {
      if (!initialized || !legacyDebrisPoints) return;
      if (!force && legacyExpState !== "IDLE") return;
      if (playAudio) global.AstraAudio?.supernova();

      legacyExpState = "EXPLODING";
      legacyExpTimer = 0;
      legacyWarp = 7.0;
      legacyRotDir = 1;
      legacyTargetDir = 1;
      if (legacyMode) {
        legacyBurstSpeed = 1.6;
        legacyBurstDir = 1;
      }

      if (legacyReactorGroup) legacyReactorGroup.visible = false;
      legacyDebrisPoints.visible = true;
      legacyDebrisMat.opacity = 1.0;

      for (let i = 0; i < LEGACY_DEBRIS_COUNT; i++) {
        const idx = i * 3;
        legacyDebrisPos[idx] = 0;
        legacyDebrisPos[idx + 1] = 0;
        legacyDebrisPos[idx + 2] = 0;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const spd = 2.4 + Math.random() * 4.2;
        legacyDebrisVel[idx] = Math.sin(phi) * Math.cos(theta) * spd;
        legacyDebrisVel[idx + 1] = Math.sin(phi) * Math.sin(theta) * spd;
        legacyDebrisVel[idx + 2] = Math.cos(phi) * spd;
      }
      legacyDebrisGeo.attributes.position.needsUpdate = true;

      if (legacyBlastRing && legacyBlastRingMat && global.gsap) {
        legacyBlastRing.visible = true;
        legacyBlastRing.scale.setScalar(0.5);
        legacyBlastRingMat.uniforms.uColor.value.set("#f5c443");
        legacyBlastRingMat.uniforms.uOpacity.value = 0.95;
        global.gsap.killTweensOf(legacyBlastRing.scale);
        global.gsap.killTweensOf(legacyBlastRingMat.uniforms.uOpacity);
        global.gsap.to(legacyBlastRing.scale, { x: 8.8, y: 8.8, z: 8.8, duration: 1.2, ease: "power2.out" });
        global.gsap.to(legacyBlastRingMat.uniforms.uOpacity, { value: 0, duration: 1.2, ease: "power2.out", onComplete: () => { legacyBlastRing.visible = false; } });
      }

      if (global.gsap) {
        const baseZ = currentView === "calculator" ? 34.0 : 40.0;
        global.gsap.killTweensOf(animState, "pulseBoost,ringSpeedBoost,camTargetZ,camShake");
        animState.pulseBoost = 1.5;
        animState.ringSpeedBoost = 2.2;
        animState.camShake = 0.65;
        global.gsap.to(animState, { camTargetZ: baseZ + 4.0, duration: 0.25, ease: "power3.out" });
        global.gsap.to(animState, { camTargetZ: baseZ, camShake: 0, duration: 1.0, delay: 0.25, ease: "power2.out" });
        global.gsap.to(animState, { pulseBoost: 0.25, ringSpeedBoost: 0.4, duration: 1.4, ease: "power2.out" });
      }
    }

    /* 新版獨立特效：星穹宮殿聖輝共鳴（光柱衝天 ＋ 三重虹彩震波 ＋ 星群聚能爆發，不拆散宮殿） */
    function triggerNewPalaceEffect(playAudio = false) {
      if (!initialized || !global.gsap || !supernovaPoints) return;
      if (playAudio) global.AstraAudio?.supernova();

      if (supernovaTimeline) {
        supernovaTimeline.kill();
        supernovaTimeline = null;
      }

      const baseZ = currentView === "calculator" ? 34.0 : 40.0;
      supernovaPoints.position.set(0, 2.7, -24);
      shockwaves.forEach((sw) => { sw.mesh.position.set(0, 2.7, -24); sw.mesh.visible = true; });

      supernovaPoints.visible = true;
      supernovaState.active = true;
      supernovaState.phase = 1;
      supernovaState.progress = 0;
      supernovaState.opacity = 0.95;
      supernovaState.heat = 1.0;

      const tl = global.gsap.timeline({
        onComplete: () => {
          supernovaState.active = false;
          supernovaPoints.visible = false;
          if (palaceBeamMesh) palaceBeamMesh.visible = false;
          supernovaTimeline = null;
        }
      });
      supernovaTimeline = tl;

      // Stage 1: 引力星輝收束至宮殿神果 (0 -> 0.72s)
      tl.to(supernovaState, { progress: 1, duration: 0.72, ease: "power2.in" }, 0)
        .to(animState, { fruitBurstScale: 0.68, ringSpeedBoost: 1.5, camTargetZ: baseZ - 3.6, camShake: 0.2, pulseBoost: 0.85, duration: 0.72, ease: "power2.in" }, 0);

      // Stage 2: 聖輝光柱直貫蒼穹 ＋ 三重震波綻放 (0.72s -> 2.4s)
      tl.call(() => {
        supernovaState.phase = 2;
        supernovaState.progress = 0;
        if (palaceBeamMesh && palaceBeamMat) {
          palaceBeamMesh.visible = true;
          palaceBeamMesh.scale.set(0.5, 1, 0.5);
          palaceBeamMat.uniforms.uOpacity.value = 0.92;
          global.gsap.to(palaceBeamMesh.scale, { x: 1.35, z: 1.35, duration: 0.5, ease: "power3.out" });
          global.gsap.to(palaceBeamMat.uniforms.uOpacity, { value: 0, duration: 1.45, delay: 0.35, ease: "power2.inOut" });
        }
        shockwaves.forEach((sw, idx) => {
          sw.mesh.scale.setScalar(0.5);
          sw.mat.uniforms.uOpacity.value = 0.95;
          global.gsap.to(sw.mesh.scale, { x: 14 + idx * 2, y: 14 + idx * 2, z: 14 + idx * 2, duration: 1.35 + idx * 0.2, delay: idx * 0.08, ease: "power2.out" });
          global.gsap.to(sw.mat.uniforms.uOpacity, { value: 0, duration: 1.35 + idx * 0.2, delay: idx * 0.08, ease: "power2.out" });
        });
      }, null, 0.72);

      tl.to(animState, { fruitBurstScale: 1.42, pulseBoost: 1.65, camTargetZ: baseZ + 3.8, camShake: 0.65, duration: 0.24, ease: "power4.out" }, 0.72)
        .to(supernovaState, { progress: 1, heat: 0.15, duration: 1.65, ease: "power3.out" }, 0.72)
        .to(supernovaState, { opacity: 0, duration: 0.9, ease: "power2.in" }, 1.62)
        .to(animState, { fruitBurstScale: 1.0, camTargetZ: baseZ, camShake: 0, duration: 1.15, ease: "elastic.out(1, 0.45)" }, 0.96)
        .to(animState, { pulseBoost: 0, ringSpeedBoost: 0, duration: 2.2, ease: "power3.out" }, 1.0);

      if (bloomPass && useBloom) {
        global.gsap.fromTo(bloomPass, { strength: 1.45 }, { strength: 0.48, duration: 1.6, delay: 0.72, ease: "power2.out" });
      }
    }

    function triggerSupernova() {
      if (legacyMode) triggerLegacyExplosion(false, true);
      else triggerNewPalaceEffect(false);
    }

    function setParallaxEnabled(enabled) {
      parallaxEnabled = Boolean(enabled);
      gyroBaseGamma = null;
      gyroBaseBeta = null;
      if (!parallaxEnabled) { pointerNX = 0; pointerNY = 0; shakeEnergy = 0; }
    }

    function setLegacyMode(enabled) {
      legacyMode = Boolean(enabled);
      uiRectsDirty = true;
      if (!initialized) return;

      const showNew = !legacyMode;
      const showDetailClouds = currentQuality !== "smooth";
      if (palaceGroup) palaceGroup.visible = showNew;
      if (planetGroup) planetGroup.visible = showNew;
      if (instancedShards) instancedShards.visible = showNew;
      if (galaxyPoints) galaxyPoints.visible = showNew;
      if (stardustPoints) stardustPoints.visible = true;
      if (cloudPlane1) cloudPlane1.visible = showNew;
      if (cloudPlane2) cloudPlane2.visible = showNew && showDetailClouds;
      if (uiRigGroup) uiRigGroup.visible = showNew && currentView === "picker";
      if (legacyGroup) legacyGroup.visible = legacyMode;
      if (legacyGalaxyMeshes[2]) legacyGalaxyMeshes[2].visible = showDetailClouds;

      // 隔離新舊版專屬特效，切換模式時即刻清理殘留狀態
      shakeEnergy = 0;
      if (legacyMode) {
        if (supernovaTimeline) { supernovaTimeline.kill(); supernovaTimeline = null; }
        supernovaState.active = false;
        if (supernovaPoints) supernovaPoints.visible = false;
        if (palaceBeamMesh) palaceBeamMesh.visible = false;
        shockwaves.forEach((sw) => { sw.mesh.visible = false; });
        if (legacyReactorGroup) {
          legacyReactorGroup.visible = true;
          legacyReactorGroup.scale.setScalar(getLegacyReactorBaseScale());
        }
      } else {
        legacyExpState = "IDLE";
        if (legacyDebrisPoints) legacyDebrisPoints.visible = false;
        if (legacyBlastRing) legacyBlastRing.visible = false;
        if (legacyReactorGroup) legacyReactorGroup.visible = true;
      }

      if (legacyMode && appStageEl) {
        lastStageRX = 0;
        lastStageRY = 0;
        appStageEl.style.setProperty("--stage-rx", "0deg");
        appStageEl.style.setProperty("--stage-ry", "0deg");
      }

      useBloom = !legacyMode && currentTheme === "dark" && currentQuality !== "smooth" && Boolean(composer);
    }

    function setQuality(tier) {
      if (!["ultra", "high", "smooth"].includes(tier)) return;
      currentQuality = tier;
      if (!initialized || !renderer) return;

      const maxDpr = tier === "ultra" ? 2.0 : tier === "high" ? 1.5 : 1.0;
      const dpr = Math.min(global.devicePixelRatio || 1, maxDpr);
      renderer.setPixelRatio(dpr);
      stardustMat.uniforms.uPixelRatio.value = dpr;
      galaxyMat.uniforms.uPixelRatio.value = dpr;
      supernovaMat.uniforms.uPixelRatio.value = dpr;
      if (legacyStarMat) legacyStarMat.uniforms.uPixelRatio.value = dpr;

      useBloom = !legacyMode && currentTheme === "dark" && tier !== "smooth" && Boolean(composer);
      if (composer) composer.setPixelRatio(dpr);

      buildSpiralGalaxy(tier === "ultra" ? 4200 : tier === "high" ? 2800 : 1800);
      buildStardust(tier === "ultra" ? 1400 : tier === "high" ? 900 : 480);
      buildLegacyStars(tier === "ultra" ? 2800 : tier === "high" ? 2200 : 1600);
      setLegacyMode(legacyMode);
      handleResize();
    }

    return {
      init, setTheme, setView, setDominantMood, setWeightEnergy,
      pulse, triggerSupernova, setParallaxEnabled, setQuality, setLegacyMode
    };
  })();

  global.AstralScene3D = AstralScene3D;
})(window);
