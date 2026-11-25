/* ============================================================================
 * 瘋狂農場•果實計算器 — 核心應用邏輯模組
 * 保留 100% 原版演算法、詞條合成互斥、自訂排列拖曳與完整雙向試算體驗
 * ============================================================================ */
(function (global) {
  "use strict";

  const CFG = global.FARM_CONFIG;
  const KEYS = CFG.STORAGE_KEYS;
  const TOOL_STATE = CFG.TOOL_STATE;
  const RECIPES = CFG.RECIPES;
  const qualityOrder = CFG.qualityOrder;
  const cropQualityRank = CFG.cropQualityRank;
  const displayNames = CFG.displayNames;
  const characterMap = CFG.characterMap;
  const CROP_IMAGE_MAP = CFG.CROP_IMAGE_MAP || {};
  const NO_COLOR_MUTATION_CROPS = CFG.NO_COLOR_MUTATION_CROPS;
  const FLOW_WEATHER_MUTATIONS = CFG.FLOW_WEATHER_MUTATIONS;
  const PORCELAIN_WEATHER_MUTATIONS = CFG.PORCELAIN_WEATHER_MUTATIONS;

  const state = {
    crops: [],
    mutations: [],
    selectedMutations: new Set(),
    weatherBatchMode: null,
    lastManualWeatherMutations: null,
    selectedCropName: "",
    currentFilterQuality: null,
    dropdownFilterQuality: null,
    view: "picker",
    soundEnabled: true,
    showComparison: false,
    sortMode: "quality",
    sortDirection: "desc",
    allowExtraDecimals: false,
    autoClear2: true,
    autoClearMore: false,
    priceDigits: 2,
    comparePriceDigits: 2,
    theme: "dark",
    graphicsQuality: "smooth",
    legacyUI: false,
    gyroEnabled: true,
    hideTip: false,
    hideCalcTip: false,
    customMutationLayout: null,
    lastEditedField: "weight",
    activeQuickPct: null,
    lastManualInput: null,
    changelogMode: "simple"
  };

  global.getSoundEnabled = () => state.soundEnabled;

  const els = {
    pickerView: document.getElementById("pickerView"),
    calculatorView: document.getElementById("calculatorView"),
    pickerSearch: document.getElementById("pickerSearch"),
    qualityTabs: document.getElementById("qualityTabs"),
    pickerGrid: document.getElementById("pickerGrid"),
    backToPickerBtn: document.getElementById("backToPickerBtn"),

    activeCropBanner: document.getElementById("activeCropBanner"),
    activeCropImg: document.getElementById("activeCropImg"),
    cropTitleName: document.getElementById("cropTitleName"),
    cropQualityBadge: document.getElementById("cropQualityBadge"),
    cropSubMeta: document.getElementById("cropSubMeta"),
    dropdownTriggerBtn: document.getElementById("dropdownTriggerBtn"),
    dropdownMenuList: document.getElementById("dropdownMenuList"),
    dropdownCropsContainer: document.getElementById("dropdownCropsContainer"),

    weightRangeLabel: document.getElementById("weightRangeLabel"),
    percentRangeLabel: document.getElementById("percentRangeLabel"),
    weightInput: document.getElementById("weightInput"),
    percentInput: document.getElementById("percentInput"),
    growthTimeBox: document.getElementById("growthTimeBox"),
    allowExtraDecimalsToggle: document.getElementById("allowExtraDecimalsToggle"),
    autoClear2Label: document.getElementById("autoClear2Label"),
    autoClear2Toggle: document.getElementById("autoClear2Toggle"),
    autoClearMoreLabel: document.getElementById("autoClearMoreLabel"),
    autoClearMoreToggle: document.getElementById("autoClearMoreToggle"),

    selectedPriceText: document.getElementById("selectedPriceText"),
    totalMultiplierText: document.getElementById("totalMultiplierText"),
    valPrecTriggerBtn: document.getElementById("valPrecTriggerBtn"),
    valPrecCurrentNum: document.getElementById("valPrecCurrentNum"),
    valPrecDropdownMenu: document.getElementById("valPrecDropdownMenu"),

    mutationGroupsContainer: document.getElementById("mutationGroupsContainer"),
    batchFlowFireBtn: document.getElementById("batchFlowFireBtn"),
    batchPorcelainBtn: document.getElementById("batchPorcelainBtn"),
    resetMutationsBtn: document.getElementById("resetMutationsBtn"),

    showComparisonToggle: document.getElementById("showComparisonToggle"),
    comparisonTableSection: document.getElementById("comparisonTableSection"),
    comparePercentSlider: document.getElementById("comparePercentSlider"),
    comparePercentLabel: document.getElementById("comparePercentLabel"),
    sortModeBtn: document.getElementById("sortModeBtn"),
    sortDirBtn: document.getElementById("sortDirBtn"),
    compareValPrecTriggerBtn: document.getElementById("compareValPrecTriggerBtn"),
    compareValPrecCurrentNum: document.getElementById("compareValPrecCurrentNum"),
    compareValPrecDropdownMenu: document.getElementById("compareValPrecDropdownMenu"),
    comparisonTableBody: document.getElementById("comparisonTableBody"),

    headerLogoGem: document.getElementById("headerLogoGem"),
    screenFlash: document.getElementById("screenFlash"),

    disclaimerModal: document.getElementById("disclaimerModal"),
    disclaimerCloseBtn: document.getElementById("disclaimerCloseBtn"),
    disclaimerConfirmBtn: document.getElementById("disclaimerConfirmBtn"),

    changelogModal: document.getElementById("changelogModal"),
    footerChangelogBtn: document.getElementById("footerChangelogBtn"),
    changelogCloseBtn: document.getElementById("changelogCloseBtn"),
    changelogConfirmBtn: document.getElementById("changelogConfirmBtn"),

    blacklistBtn: document.getElementById("blacklistBtn"),
    blacklistModal: document.getElementById("blacklistModal"),
    blacklistCloseBtn: document.getElementById("blacklistCloseBtn"),
    blacklistConfirmBtn: document.getElementById("blacklistConfirmBtn"),

    settingsBtn: document.getElementById("settingsBtn"),
    settingsModal: document.getElementById("settingsModal"),
    settingsCloseBtn: document.getElementById("settingsCloseBtn"),
    settingsConfirmBtn: document.getElementById("settingsConfirmBtn"),
    settingLegacyUIToggle: document.getElementById("settingLegacyUIToggle"),
    settingSoundToggle: document.getElementById("settingSoundToggle"),
    themeDarkBtn: document.getElementById("themeDarkBtn"),
    themeLightBtn: document.getElementById("themeLightBtn"),
    graphicsQualityCtrl: document.getElementById("graphicsQualityCtrl"),
    settingGyroToggle: document.getElementById("settingGyroToggle"),
    settingGyroLabel: document.getElementById("settingGyroLabel"),
    settingHideTipToggle: document.getElementById("settingHideTipToggle"),
    settingHideCalcTipToggle: document.getElementById("settingHideCalcTipToggle"),
    settingsMemoryTipCard: document.getElementById("settingsMemoryTipCard"),
    calcPrecisionTipCard: document.getElementById("calcPrecisionTipCard"),
    tipGuideBtn: document.getElementById("tipGuideBtn"),
    settingGuideRow: document.getElementById("settingGuideRow"),
    openSwitchGuideBtn: document.getElementById("openSwitchGuideBtn"),
    switchGuideModal: document.getElementById("switchGuideModal"),
    switchGuideCloseBtn: document.getElementById("switchGuideCloseBtn"),
    switchGuideConfirmBtn: document.getElementById("switchGuideConfirmBtn"),
    guideInteractiveName: document.getElementById("guideInteractiveName"),
    guideInteractiveDesc: document.getElementById("guideInteractiveDesc"),

    openCustomOrderBtn: document.getElementById("openCustomOrderBtn"),
    resetCustomOrderBtn: document.getElementById("resetCustomOrderBtn"),
    customSortModal: document.getElementById("customSortModal"),
    customSortCloseBtn: document.getElementById("customSortCloseBtn"),
    customSortCancelBtn: document.getElementById("customSortCancelBtn"),
    customSortConfirmBtn: document.getElementById("customSortConfirmBtn"),
    addCustomCategoryBtn: document.getElementById("addCustomCategoryBtn"),
    customCatCountBadge: document.getElementById("customCatCountBadge"),
    customSortCategoriesContainer: document.getElementById("customSortCategoriesContainer"),

    confirmActionModal: document.getElementById("confirmActionModal"),
    confirmActionTitle: document.getElementById("confirmActionTitle"),
    confirmActionMessage: document.getElementById("confirmActionMessage"),
    confirmActionSubMessage: document.getElementById("confirmActionSubMessage"),
    confirmActionCloseBtn: document.getElementById("confirmActionCloseBtn"),
    confirmActionYesBtn: document.getElementById("confirmActionYesBtn"),
    confirmActionNoBtn: document.getElementById("confirmActionNoBtn")
  };

  /* --------------------------------------------------------------------------
   * 裝置與音訊解鎖
   * -------------------------------------------------------------------------- */
  ["touchstart", "pointerdown", "mousedown", "keydown"].forEach((evt) => {
    global.addEventListener(evt, () => global.AstraAudio?.unlock(), { once: true, passive: true });
  });

  function vibrate(ms = 12) {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try { navigator.vibrate(ms); } catch (e) {}
    }
  }

  function detectIsMobile() {
    const ua = navigator.userAgent || "";
    if (/Windows NT/i.test(ua) && !/Windows Phone|IEMobile/i.test(ua)) return false;
    if (global.screen && typeof global.screen.width === "number" && typeof global.screen.height === "number") {
      if (Math.min(global.screen.width, global.screen.height) < 600) return true;
    }
    const isMac = /Macintosh/i.test(ua);
    const hasMultiTouch = typeof navigator !== "undefined" && navigator.maxTouchPoints > 1;
    const isIPad = /iPad/i.test(ua) || (isMac && hasMultiTouch);
    if (isMac && !isIPad) return false;
    const isCoarse = typeof global.matchMedia === "function" && global.matchMedia("(pointer: coarse)")?.matches;
    if (/Linux/i.test(ua) && !/Android/i.test(ua) && !(hasMultiTouch && isCoarse)) return false;
    if (/Android|iPhone|iPod|iPad|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua) || isIPad) return true;
    if (global.matchMedia && global.matchMedia("(hover: hover) and (pointer: fine)").matches) return false;
    return ("ontouchstart" in global) || (navigator.maxTouchPoints > 0);
  }

  let isMobileDevice = detectIsMobile();

  function updateDeviceSpecificUI() {
    if (els.settingGyroLabel) {
      els.settingGyroLabel.textContent = isMobileDevice ? "陀螺儀權限" : "滑鼠互動";
    }
    if (els.guideInteractiveName) {
      els.guideInteractiveName.textContent = isMobileDevice ? "陀螺儀權限" : "滑鼠互動";
    }
    if (els.guideInteractiveDesc) {
      els.guideInteractiveDesc.textContent = isMobileDevice
        ? "啟用行動裝置姿態感應，輕微傾斜裝置時背景 3D 場景會像滑鼠互動一樣平緩跟隨傾斜，不會劇烈晃動。"
        : "啟用電腦滑鼠互動，滑鼠游標移動時背景 3D 星穹聖殿會隨視角動態平滑響應。";
    }
  }

  global.addEventListener("pointermove", (e) => {
    if (e.pointerType === "mouse" && isMobileDevice) {
      isMobileDevice = false;
      updateDeviceSpecificUI();
    }
  }, { passive: true });

  /* --------------------------------------------------------------------------
   * 基礎格式化與遊戲公式函數 (完全對齊原版)
   * -------------------------------------------------------------------------- */
  function escapeHtml(val) {
    return String(val ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  }

  function formatNumber(val, digits = state.allowExtraDecimals ? 6 : 2) {
    const num = Number(val);
    if (!Number.isFinite(num)) return "0";
    return num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: digits });
  }

  function formatPrice(val, digits = state.priceDigits || 2) {
    const num = Number(val);
    if (!Number.isFinite(num)) return "0";
    const d = Number(digits) || 2;
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(d).replace(/\.?0+$/, "")}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(d).replace(/\.?0+$/, "")}M`;
    if (num >= 10000) return `${(num / 10000).toFixed(d).replace(/\.?0+$/, "")}W`;
    return num.toFixed(d).replace(/\.?0+$/, "");
  }

  function formatDuration(sec) {
    const total = Math.max(0, Math.round(Number(sec) || 0));
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (d > 0) return `${d}日${h}小時${m}分${s}秒`;
    if (h > 0) return `${h}小時${m}分${s}秒`;
    if (m > 0) return `${m}分${s}秒`;
    return `${s}秒`;
  }

  function displayName(val) {
    const text = String(val ?? "");
    if (displayNames[text]) return displayNames[text];
    return text.replace(/[灯黄蓝牵银环树苹叶车龙猕惊芦红马铃兰听绿钻异尘阳蚀连冻雾圣湿机荧热颤栗陨烧云]/g, (ch) => characterMap[ch] || ch);
  }

  function getCropImageSrc(cropName) {
    const file = CROP_IMAGE_MAP[cropName];
    return file ? `./assets/crops/${file}` : "./favicon.svg";
  }

  function roundTo2(val) {
    const n = Number(val);
    if (!Number.isFinite(n)) return "";
    return String(Math.round(n * 100) / 100);
  }

  function minPercent(crop) {
    if (!crop) return 3;
    const name = crop.name || "";
    const disp = displayName(name);
    if (
      name === "迷路的疯象南瓜" || disp === "迷路的瘋象南瓜" ||
      name === "沉静的疯象南瓜" || disp === "沉靜的瘋象南瓜" ||
      name === "听歌的柿黛拉" || disp === "聽歌的柿黛拉" ||
      name === "跳舞的柿黛拉" || disp === "跳舞的柿黛拉"
    ) {
      return 1;
    }
    return 3;
  }

  function minWeight(crop) {
    if (!crop) return 0;
    return (minPercent(crop) / 100) * Number(crop.maxWeight);
  }

  function getSelectedCrop() {
    return state.crops.find((c) => c.name === state.selectedCropName) || state.crops[0];
  }

  function getCropSpecialMutationNames(crop) {
    if (!crop) return [];
    if (Array.isArray(crop.specialMutations)) return crop.specialMutations.filter(Boolean);
    return crop.specialMutation ? [crop.specialMutation] : [];
  }

  function cropHasColorMutations(crop) {
    if (!crop) return true;
    return !NO_COLOR_MUTATION_CROPS.has(crop.name) && !NO_COLOR_MUTATION_CROPS.has(displayName(crop.name));
  }

  function getMutationByName() {
    return new Map(state.mutations.map((m) => [m.name, m]));
  }

  function activeRecipes(toolState = TOOL_STATE) {
    return RECIPES.filter((r) => {
      if (r.result === "琥珀") return toolState.huanxingji;
      if (r.result === "橙钻") return toolState.huanxingji && toolState.liuxingzhang;
      return true;
    });
  }

  function recipeIngredientsFor(result, seen = new Set(), toolState = TOOL_STATE) {
    if (seen.has(result)) return [];
    seen.add(result);
    const names = [];
    activeRecipes(toolState).forEach((r) => {
      if (r.result !== result) return;
      names.push(...r.ingredients);
      r.ingredients.forEach((ing) => names.push(...recipeIngredientsFor(ing, seen, toolState)));
    });
    return names;
  }

  function isMutationDisabled(name, selectedNames, toolState = TOOL_STATE) {
    const selected = [...selectedNames];
    if (selected.includes(name)) return false;
    const hasFlowFire = selected.includes("流火");
    const hasPorcelain = selected.includes("瓷化");
    const hasOrangeDiamond = selected.includes("橙钻");
    const hasAmber = selected.includes("琥珀");

    if ((name === "流火" && hasPorcelain) || (name === "瓷化" && hasFlowFire)) return true;
    if (name === "灼热") return hasFlowFire || hasPorcelain;
    if (name === "生机") return toolState.huanxingji && (hasAmber || hasOrangeDiamond);
    if (name === "亮晶晶" || name === "琥珀") return toolState.liuxingzhang && toolState.huanxingji && hasOrangeDiamond;
    if (name === "沙尘" && selected.includes("潮湿")) return selected.includes("陶化") || selected.includes("瓷化");

    return activeRecipes(toolState).some((r) => {
      if (!selected.includes(r.result)) return false;
      return recipeIngredientsFor(r.result, new Set(), toolState)
        .filter((ing) => ing !== "潮湿")
        .includes(name);
    });
  }

  function normalizeMutations(names, toolState = TOOL_STATE) {
    let normalized = [...names];
    let changed = true;
    while (changed) {
      changed = false;
      for (const recipe of activeRecipes(toolState)) {
        const hasIngredients = recipe.ingredients.every((ing) => normalized.includes(ing));
        const hasResult = normalized.includes(recipe.result);
        if (!hasIngredients || hasResult) continue;
        if ((recipe.result === "流火" && normalized.includes("瓷化")) || (recipe.result === "瓷化" && normalized.includes("流火"))) continue;
        normalized = normalized.filter((n) => !recipe.ingredients.includes(n) || n === "潮湿");
        normalized.push(recipe.result);
        changed = true;
        break;
      }
    }
    return normalized;
  }

  function getDefaultMutationLayout() {
    return [
      {
        id: "cat_base",
        title: "基礎詞條",
        mutations: [
          "星空", "流光", "水晶", "金", "银",
          "幻彩", "异彩",
          "连体", "笑日葵", "黄瓜蛇", "万圣夜", "香蕉猴", "薯片", "方形", "糖葫芦"
        ]
      },
      {
        id: "cat_weather",
        title: "天氣詞條",
        mutations: [
          "霓虹", "橙钻", "流火", "日蚀", "亮晶晶", "瓷化", "花雨",
          "暗雾", "太阳耀斑", "极光", "荧光", "彩虹", "琥珀",
          "陶化", "冰冻", "落雷",
          "生机", "沙尘", "灼热", "结霜", "迷雾", "覆雪", "潮湿", "颤栗"
        ]
      },
      {
        id: "cat_past",
        title: "活動與下架詞條",
        mutations: [
          "星环", "火烧云", "幽幽南瓜", "血月", "幽魂", "惊魂夜", "彩尘", "哈基咪", "故障", "金币", "陨石"
        ]
      }
    ];
  }

  function isWeatherMutation(name) {
    const m = getMutationByName().get(name);
    return m && m.groupKey !== "quality" && m.groupKey !== "color" && m.groupKey !== "past" && m.groupKey !== "special";
  }

  function updateWeatherBatchButtons() {
    if (els.batchFlowFireBtn) els.batchFlowFireBtn.classList.toggle("active", state.weatherBatchMode === "flow");
    if (els.batchPorcelainBtn) els.batchPorcelainBtn.classList.toggle("active", state.weatherBatchMode === "porcelain");
  }

  function handleWeatherBatchSelect(mode) {
    const targetSet = mode === "flow" ? FLOW_WEATHER_MUTATIONS : PORCELAIN_WEATHER_MUTATIONS;
    if (state.weatherBatchMode === mode) {
      const nonWeather = [...state.selectedMutations].filter((n) => !isWeatherMutation(n));
      const restoredWeather = state.lastManualWeatherMutations ? [...state.lastManualWeatherMutations] : [];
      state.selectedMutations = new Set(normalizeMutations([...nonWeather, ...restoredWeather]));
      state.weatherBatchMode = null;
      state.lastManualWeatherMutations = null;
      global.AstraAudio.cancel();
      vibrate(12);
    } else {
      if (state.weatherBatchMode === null) {
        state.lastManualWeatherMutations = [...state.selectedMutations].filter((n) => isWeatherMutation(n));
      }
      const nonWeather = [...state.selectedMutations].filter((n) => !isWeatherMutation(n));
      state.selectedMutations = new Set([...nonWeather, ...targetSet]);
      state.weatherBatchMode = mode;
      global.AstraAudio.activate();
      vibrate(16);
    }
    updateWeatherBatchButtons();
    renderAll();
  }

  function getMultipliers(selectedNames, crop = null) {
    const mutationByName = getMutationByName();
    const hasColor = crop ? cropHasColorMutations(crop) : true;
    let qualityMultiplier = 1;
    let specialMultiplier = 1;
    let weatherMultiplierSum = 0;
    selectedNames.forEach((n) => {
      const m = mutationByName.get(n);
      if (!m) return;
      if (m.groupKey === "color" && !hasColor) return;
      const mult = Number(m.multiplier) || 0;
      if (m.groupKey === "quality") qualityMultiplier = Math.max(qualityMultiplier, mult);
      else if (m.groupKey === "special") specialMultiplier = Math.max(specialMultiplier, mult);
      else weatherMultiplierSum += mult;
    });
    return { qualityMultiplier, specialMultiplier, weatherMultiplierSum };
  }

  function getDisplayedTotalMultiplier() {
    const mutationByName = getMutationByName();
    const crop = getSelectedCrop();
    const hasColor = cropHasColorMutations(crop);
    return [...state.selectedMutations].reduce((sum, n) => {
      const m = mutationByName.get(n);
      if (!m) return sum;
      if (m.groupKey === "color" && !hasColor) return sum;
      const isWeatherOrPast = m.groupKey !== "quality" && m.groupKey !== "special" && m.groupKey !== "color";
      const isCountedColor = (n === "异彩" || n === "幻彩") && hasColor;
      return isWeatherOrPast || isCountedColor ? sum + Number(m.multiplier || 0) : sum;
    }, 0);
  }

  function calculatePrice(crop, weight, selectedNames = state.selectedMutations) {
    const multipliers = getMultipliers(selectedNames, crop);
    const coefficient =
      Number(Number(crop.priceCoefficient).toFixed(4)) *
      multipliers.qualityMultiplier *
      (multipliers.weatherMultiplierSum + 1) *
      multipliers.specialMultiplier;
    const price = Number((coefficient * Math.pow(weight, 1.5)).toFixed(4));
    return { price, formattedPrice: formatPrice(price), multipliers };
  }

  function baseCropValue(crop) {
    return calculatePrice(crop, Number(crop.maxWeight), new Set()).price;
  }

  function compareCropsForPicker(a, b) {
    const qualityDelta = (cropQualityRank[b.quality] || 0) - (cropQualityRank[a.quality] || 0);
    if (qualityDelta !== 0) return qualityDelta;
    const valDelta = baseCropValue(b) - baseCropValue(a);
    if (Math.abs(valDelta) > 1e-6) return valDelta;
    if (a.name.includes("沉静") && b.name.includes("跳舞")) return -1;
    if (b.name.includes("沉静") && a.name.includes("跳舞")) return 1;
    return Number(a.sortOrder) - Number(b.sortOrder);
  }

  /* --------------------------------------------------------------------------
   * 3D 場景單一主導氛圍 (克制高級感，絕不點一詞條就變花)
   * -------------------------------------------------------------------------- */
  function getDominantMoodKey() {
    for (const q of qualityOrder) {
      if (state.selectedMutations.has(q)) return q;
    }
    const crop = getSelectedCrop();
    return crop ? crop.quality : "至臻";
  }

  function sync3DSceneState() {
    if (!global.AstralScene3D) return;
    global.AstralScene3D.setDominantMood(getDominantMoodKey());
    const crop = getSelectedCrop();
    const w = parseFloat(els.weightInput?.value || "0") || 0;
    const ratio = crop && Number(crop.maxWeight) > 0 ? Math.min(1, w / Number(crop.maxWeight)) : 0.35;
    global.AstralScene3D.setWeightEnergy(state.view === "picker" ? 0.45 : ratio);
  }

  /* --------------------------------------------------------------------------
   * 視圖切換與作物選取
   * -------------------------------------------------------------------------- */
  function setView(view) {
    state.view = view;
    document.body.classList.toggle("view-calculator", view === "calculator");
    if (view === "picker") {
      if (els.dropdownMenuList) els.dropdownMenuList.hidden = true;
      if (els.valPrecDropdownMenu) els.valPrecDropdownMenu.hidden = true;
      if (els.compareValPrecDropdownMenu) els.compareValPrecDropdownMenu.hidden = true;
      const arrow = document.getElementById("repickArrow");
      if (arrow) arrow.textContent = "❯";
      els.dropdownTriggerBtn?.classList.remove("active");
      document.querySelector(".control-pod-3d")?.classList.remove("dropdown-open");
      document.querySelector(".energy-reactor-dock")?.classList.remove("precision-dropdown-open");

      els.pickerView.hidden = false;
      els.calculatorView.hidden = true;
      els.pickerView.style.display = "block";
      els.calculatorView.style.display = "none";
    } else {
      els.pickerView.hidden = true;
      els.calculatorView.hidden = false;
      els.pickerView.style.display = "none";
      els.calculatorView.style.display = "flex";
    }
    global.scrollTo({ top: 0, behavior: "smooth" });
    global.AstralScene3D?.setView(view);

    if (global.gsap) {
      const target = view === "picker" ? "#pickerView" : "#calculatorView > *";
      global.gsap.fromTo(
        target,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.28, stagger: 0.04, ease: "power2.out" }
      );
    }
  }

  function chooseCrop(cropName) {
    els.dropdownMenuList.hidden = true;
    const arrow = document.getElementById("repickArrow");
    if (arrow) arrow.textContent = "❯";
    els.dropdownTriggerBtn?.classList.remove("active");
    document.querySelector(".control-pod-3d")?.classList.remove("dropdown-open");
    state.selectedCropName = cropName;
    const crop = getSelectedCrop();

    state.selectedMutations.clear();
    state.weatherBatchMode = null;
    state.lastManualWeatherMutations = null;
    updateWeatherBatchButtons();

    els.percentInput.value = "";
    els.weightInput.value = "";
    state.activeQuickPct = null;
    state.lastManualInput = null;
    updateQuickPctButtons();

    global.AstraAudio.selectCrop();
    vibrate(18);
    if (crop) {
      global.AstralScene3D?.pulse(crop.quality, 1);
    }
    setView("calculator");
    renderAll();
  }

  function clampWeight(crop, val) {
    return Math.min(Number(crop.maxWeight), Math.max(minWeight(crop), val));
  }

  function clampPercent(crop, val) {
    return Math.min(100, Math.max(minPercent(crop), val));
  }

  function setWeightFromPercent(crop, { clamp = false } = {}) {
    if (els.percentInput.value.trim() === "") {
      els.weightInput.value = "";
      renderSelectedCrop();
      return;
    }
    const raw = Number(els.percentInput.value);
    if (!Number.isFinite(raw)) return;
    if (raw > 100 || clamp) {
      const safe = clampPercent(crop, raw);
      els.percentInput.value = formatNumber(safe);
      els.weightInput.value = formatNumber((safe / 100) * Number(crop.maxWeight));
    } else if (raw >= minPercent(crop)) {
      els.weightInput.value = formatNumber((raw / 100) * Number(crop.maxWeight));
    } else {
      els.weightInput.value = "";
    }
    renderSelectedCrop();
  }

  function setPercentFromWeight(crop, { clamp = false } = {}) {
    if (els.weightInput.value.trim() === "") {
      els.percentInput.value = "";
      renderSelectedCrop();
      return;
    }
    const raw = Number(els.weightInput.value);
    if (!Number.isFinite(raw)) return;
    if (raw > Number(crop.maxWeight) || clamp) {
      const safe = clampWeight(crop, raw);
      els.weightInput.value = formatNumber(safe);
      els.percentInput.value = formatNumber(Math.min(100, Math.max(minPercent(crop), (safe / Number(crop.maxWeight)) * 100)));
    } else if (raw >= minWeight(crop)) {
      els.percentInput.value = formatNumber((raw / Number(crop.maxWeight)) * 100);
    } else {
      els.percentInput.value = "";
    }
    renderSelectedCrop();
  }

  /* --------------------------------------------------------------------------
   * 畫面渲染
   * -------------------------------------------------------------------------- */
  function renderPicker(animateCards = false) {
    const query = els.pickerSearch.value.trim().toLowerCase();
    const qFilter = state.currentFilterQuality;

    document.querySelectorAll("#qualityTabs .filter-tab-pill").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.q === qFilter);
    });

    const crops = state.crops
      .filter((crop) => {
        const isDragonFruitAlias = (crop.name === "火龙狗" || displayName(crop.name) === "火龍狗") && (query.includes("火龍果") || query.includes("火龙果") || "火龍果".includes(query) || "火龙果".includes(query));
        const isKiwiAlias = (crop.name.includes("猕猴桃") || displayName(crop.name).includes("奇異果")) && (query.includes("獼猴桃") || query.includes("猕猴桃") || query.includes("奇異果") || query.includes("奇异果") || "奇異果".includes(query) || "獼猴桃".includes(query));
        const isCherryAlias = (crop.name.includes("车厘子") || displayName(crop.name).includes("櫻桃")) && (query.includes("車厘子") || query.includes("车厘子") || query.includes("櫻桃") || query.includes("樱桃") || "櫻桃".includes(query) || "車厘子".includes(query));
        const isPotatoAlias = (crop.name.includes("土豆") || displayName(crop.name).includes("馬鈴薯")) && (query.includes("土豆") || query.includes("馬鈴薯") || query.includes("马铃薯") || "馬鈴薯".includes(query));
        const isCucumberAlias = (crop.name.includes("黄瓜") || displayName(crop.name).includes("黃瓜")) && (query.includes("小黃瓜") || query.includes("小黄瓜") || "小黃瓜".includes(query));
        const matchQuery = isDragonFruitAlias || isKiwiAlias || isCherryAlias || isPotatoAlias || isCucumberAlias ||
          crop.name.toLowerCase().includes(query) || displayName(crop.name).toLowerCase().includes(query) || crop.quality.toLowerCase().includes(query);
        if (!matchQuery) return false;
        if (!qFilter) return true;
        return displayName(crop.quality) === qFilter || crop.quality === qFilter;
      })
      .sort(compareCropsForPicker);

    if (state.legacyUI) {
      // 舊版介面亦採無外框、無品階、無公斤數的純淨清單樣式：作物圖案不漂浮、下方無圓盤
      els.pickerGrid.innerHTML = crops
        .map((crop) => `
          <button class="crop-legacy-item" type="button" data-crop="${escapeHtml(crop.name)}">
            <img class="crop-legacy-sprite" src="${escapeHtml(getCropImageSrc(crop.name))}" alt="${escapeHtml(displayName(crop.name))}" loading="lazy" />
            <span class="crop-legacy-name">${escapeHtml(displayName(crop.name))}</span>
          </button>
        `)
        .join("");
    } else {
      // 新版 3D 無外框立體懸浮晶塊標本：移除底部圓盤，改為真實擠出厚度晶塊＋同步呼吸接地投影
      els.pickerGrid.innerHTML = crops
        .map((crop, idx) => `
          <button class="crop-pedestal-3d specimen-q-${crop.quality}" type="button" data-crop="${escapeHtml(crop.name)}" style="--float-delay: ${((idx % 9) * -0.42).toFixed(2)}s;">
            <div class="crop-3d-stage">
              <div class="crop-3d-token">
                <span class="crop-3d-depth crop-3d-depth-2" aria-hidden="true"></span>
                <span class="crop-3d-depth crop-3d-depth-1" aria-hidden="true"></span>
                <div class="crop-3d-face">
                  <img class="crop-3d-sprite" src="${escapeHtml(getCropImageSrc(crop.name))}" alt="${escapeHtml(displayName(crop.name))}" loading="lazy" />
                  <span class="crop-3d-sheen" aria-hidden="true"></span>
                </div>
              </div>
              <span class="crop-3d-ground-shadow" aria-hidden="true"></span>
            </div>
            <span class="crop-3d-name">${escapeHtml(displayName(crop.name))}</span>
          </button>
        `)
        .join("");
    }

    if (animateCards && global.gsap) {
      global.gsap.fromTo(
        "#pickerGrid .crop-pedestal-3d, #pickerGrid .crop-legacy-item",
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 0.22, stagger: 0.008, ease: "power2.out" }
      );
    }
  }

  function renderCropOptions() {
    const current = getSelectedCrop();
    if (!current) return;

    els.activeCropBanner.className = `active-crop-banner q-theme-${current.quality}`;
    if (els.activeCropImg) {
      els.activeCropImg.src = getCropImageSrc(current.name);
      els.activeCropImg.alt = displayName(current.name);
    }
    els.cropTitleName.textContent = displayName(current.name);
    if (els.cropQualityBadge) {
      els.cropQualityBadge.textContent = `${displayName(current.quality)}品階`;
      els.cropQualityBadge.className = `b-quality-badge q-theme-${current.quality}`;
    }

    const maxTimeSec = (Number(current.growthSpeed) || 0) * Number(current.maxWeight);
    const maxTimeText = maxTimeSec > 0 ? `滿重耗時: 約${formatDuration(maxTimeSec)}` : "成熟耗時: 暫無數據";
    els.cropSubMeta.textContent = `MAX ${Number(current.maxWeight) > 0 ? formatNumber(current.maxWeight) + "KG" : "待實測"} • ${maxTimeText}`;

    if (els.weightRangeLabel) {
      const minW = formatNumber(minWeight(current));
      const maxW = formatNumber(current.maxWeight);
      els.weightRangeLabel.textContent = `${minW}kg ~ ${maxW}kg`;
    }
    if (els.percentRangeLabel) {
      const minP = minPercent(current);
      els.percentRangeLabel.textContent = `${minP}~100%`;
      if (els.percentInput) els.percentInput.min = String(minP);
    }

    renderDropdownCrops();
  }

  function renderDropdownCrops() {
    const qFilter = state.dropdownFilterQuality;
    const dropdownTabs = document.getElementById("dropdownQualityTabs");
    if (dropdownTabs) {
      dropdownTabs.querySelectorAll(".filter-tab-pill").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.q === qFilter);
      });
    }

    const container = document.getElementById("dropdownCropsContainer");
    if (!container) return;

    const crops = [...state.crops]
      .filter((c) => !qFilter || displayName(c.quality) === qFilter || c.quality === qFilter)
      .sort(compareCropsForPicker);

    container.innerHTML = crops
      .map((c) => `
        <button class="dropdown-item-btn q-theme-${c.quality} ${c.name === state.selectedCropName ? "selected" : ""}" type="button" data-crop="${escapeHtml(c.name)}">
          <span>${escapeHtml(displayName(c.name))}</span>
          <span>${escapeHtml(displayName(c.quality))} · ${Number(c.maxWeight) > 0 ? formatNumber(c.maxWeight) + "kg" : "待實測"}</span>
        </button>
      `)
      .join("");
  }

  function renderSelectedCrop() {
    const crop = getSelectedCrop();
    if (!crop) return;

    const hasWeight = els.weightInput.value.trim() !== "";
    const weight = hasWeight ? Number(els.weightInput.value) : 0;
    const safeWeight = hasWeight && Number.isFinite(weight) ? clampWeight(crop, weight) : 0;
    const result = calculatePrice(crop, safeWeight);

    els.selectedPriceText.textContent = hasWeight ? result.formattedPrice : "0";
    els.totalMultiplierText.textContent = `x${formatNumber(getDisplayedTotalMultiplier())}`;

    const speed = Number(crop.growthSpeed) || 0;
    if (hasWeight && safeWeight > 0 && speed > 0) {
      const totalSeconds = safeWeight * speed;
      const secPerPct = totalSeconds / 100;
      const rateText = secPerPct >= 60 ? formatDuration(secPerPct) : `${formatNumber(secPerPct, 1)}秒`;
      els.growthTimeBox.textContent = `約${formatDuration(totalSeconds)}（${rateText}/1%）`;
    } else {
      els.growthTimeBox.textContent = "-";
    }

    sync3DSceneState();
  }

  function mutationSort(a, b) {
    if (a.name === "霓虹" && b.name === "橙钻") return -1;
    if (a.name === "橙钻" && b.name === "霓虹") return 1;
    if (a.groupKey === "past" && b.groupKey === "past") {
      const pastOrder = ["星环", "火烧云", "幽幽南瓜", "血月", "幽魂", "惊魂夜", "彩尘", "哈基咪", "故障", "金币", "陨石"];
      const ai = pastOrder.indexOf(a.name);
      const bi = pastOrder.indexOf(b.name);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
    }
    const weatherOrder = [
      "霓虹", "橙钻", "流火", "日蚀", "亮晶晶", "瓷化", "花雨",
      "暗雾", "太阳耀斑", "极光", "荧光", "彩虹", "琥珀",
      "陶化", "冰冻", "落雷",
      "生机", "沙尘", "灼热", "结霜", "迷雾", "覆雪", "潮湿", "颤栗"
    ];
    const wAi = weatherOrder.indexOf(a.name);
    const wBi = weatherOrder.indexOf(b.name);
    if (wAi !== -1 && wBi !== -1) return wAi - wBi;
    if (wAi !== -1) return -1;
    if (wBi !== -1) return 1;
    if (a.groupKey === "color" && b.groupKey === "color") {
      const colorOrder = ["幻彩", "异彩"];
      const delta = colorOrder.indexOf(a.name) - colorOrder.indexOf(b.name);
      if (delta !== 0) return delta;
    }
    const qualityDelta = qualityOrder.indexOf(a.name) - qualityOrder.indexOf(b.name);
    if (a.groupKey === "quality" && b.groupKey === "quality" && qualityDelta !== 0) return qualityDelta;
    return Number(b.multiplier) - Number(a.multiplier) || a.name.localeCompare(b.name, "zh-Hant");
  }

  function toggleMutation(name) {
    const crop = getSelectedCrop();
    const mutation = getMutationByName().get(name);
    if (mutation?.groupKey === "color" && !cropHasColorMutations(crop)) return;
    if (isMutationDisabled(name, state.selectedMutations)) return;
    if (isWeatherMutation(name)) {
      state.weatherBatchMode = null;
      state.lastManualWeatherMutations = null;
      updateWeatherBatchButtons();
    }
    let next = [...state.selectedMutations];
    if (next.includes(name)) {
      next = next.filter((item) => item !== name);
      global.AstraAudio.cancel();
    } else {
      if (mutation?.groupKey === "quality" || mutation?.groupKey === "color") {
        next = next.filter((item) => getMutationByName().get(item)?.groupKey !== mutation.groupKey);
      }
      RECIPES.forEach((recipe) => {
        if (recipe.result !== name) return;
        const ingredients = recipeIngredientsFor(name);
        next = next.filter((item) => !ingredients.includes(item) || item === "潮湿");
      });
      next.push(name);
      next = normalizeMutations(next);
      global.AstraAudio.activate();
      vibrate(14);
    }
    state.selectedMutations = new Set(next);
    renderAll();
  }

  function renderMutations() {
    const active = state.mutations.filter((m) => m.isActive !== false);
    const mutationByName = getMutationByName();
    const crop = getSelectedCrop();
    const specialNames = getCropSpecialMutationNames(crop);
    const hasColor = cropHasColorMutations(crop);

    const quality = active.filter((m) => m.groupKey === "quality").sort(mutationSort);
    const color = hasColor ? active.filter((m) => m.groupKey === "color").sort(mutationSort) : [];
    const cropSpecials = specialNames.map((n) => mutationByName.get(n)).filter(Boolean).sort(mutationSort);
    const weather = active.filter((m) => m.groupKey !== "quality" && m.groupKey !== "color" && m.groupKey !== "past" && m.groupKey !== "special").sort(mutationSort);
    const past = active.filter((m) => m.groupKey === "past").sort(mutationSort);

    function createChip(m) {
      const selected = state.selectedMutations.has(m.name);
      const disabled = isMutationDisabled(m.name, state.selectedMutations);
      return `
        <button class="chip-3d chip-color-${m.color} ${selected ? "selected" : ""} ${disabled ? "disabled" : ""}"
                type="button"
                data-mutation="${escapeHtml(m.name)}"
                ${disabled ? "disabled" : ""}>
          <span>${escapeHtml(displayName(m.name))}</span>
        </button>
      `;
    }

    let html = "";
    if (state.customMutationLayout && Array.isArray(state.customMutationLayout) && state.customMutationLayout.length > 0) {
      state.customMutationLayout.forEach((cat) => {
        const validMutations = (cat.mutations || [])
          .map((n) => mutationByName.get(n))
          .filter((m) => {
            if (!m || m.isActive === false) return false;
            if (m.groupKey === "special") return specialNames.includes(m.name);
            if (m.groupKey === "color") return hasColor;
            return true;
          });
        if (validMutations.length > 0) {
          const gridClass = (cat.id === "cat_weather" || cat.title?.includes("天氣") || validMutations.length >= 24) ? "chips-grid-5" : "chips-grid-6";
          html += `
            <div class="mutation-group-3d">
              <div class="mutation-group-title">◆ ${escapeHtml(cat.title)}</div>
              <div class="${gridClass}">${validMutations.map(createChip).join("")}</div>
            </div>
          `;
        }
      });
    } else {
      const secondRowChips = [...color, ...cropSpecials];
      html += `
        <div class="mutation-group-3d">
          <div class="mutation-group-title">◆ 基礎詞條</div>
          <div class="chips-grid-5" ${secondRowChips.length > 0 ? 'style="margin-bottom: 8px;"' : ""}>
            ${quality.map(createChip).join("")}
          </div>
          ${secondRowChips.length > 0 ? `<div class="chips-grid-5">${secondRowChips.map(createChip).join("")}</div>` : ""}
        </div>
        <div class="mutation-group-3d">
          <div class="mutation-group-title">◆ 天氣詞條</div>
          <div class="chips-grid-5">${weather.map(createChip).join("")}</div>
        </div>
        <div class="mutation-group-3d">
          <div class="mutation-group-title">◆ 活動與下架詞條</div>
          <div class="chips-grid-6">${past.map(createChip).join("")}</div>
        </div>
      `;
    }
    els.mutationGroupsContainer.innerHTML = html;
  }

  function renderTable() {
    const percent = Number(els.comparePercentSlider.value) || 100;
    els.comparePercentLabel.textContent = `${percent}%`;
    els.comparePercentSlider.style.setProperty("--slider-val", `${percent}%`);

    if (!state.showComparison) {
      els.comparisonTableBody.innerHTML = "";
      return;
    }

    const rows = state.crops.map((crop) => {
      const weight = Math.min(Number(crop.maxWeight), Math.max(minWeight(crop), (percent / 100) * Number(crop.maxWeight)));
      const result = calculatePrice(crop, weight);
      return { crop, weight, result };
    });

    if (els.sortModeBtn) {
      els.sortModeBtn.textContent = state.sortMode === "quality" ? "依品階排序" : "依價值排序";
    }
    if (state.sortMode === "quality") {
      rows.sort((a, b) => compareCropsForPicker(a.crop, b.crop));
    } else {
      rows.sort((a, b) => b.result.price - a.result.price || compareCropsForPicker(a.crop, b.crop));
    }
    if (state.sortDirection === "asc") rows.reverse();
    els.sortDirBtn.textContent = state.sortDirection === "desc" ? "高到低 ▼" : "低到高 ▲";

    els.comparisonTableBody.innerHTML = rows
      .map(({ crop, weight, result }) => {
        const totalMult = result.multipliers.qualityMultiplier * (result.multipliers.weatherMultiplierSum + 1) * result.multipliers.specialMultiplier;
        const formattedPrice = formatPrice(result.price, state.comparePriceDigits);
        return `
          <tr>
            <td><strong>${escapeHtml(displayName(crop.name))}</strong></td>
            <td><span class="q-theme-${crop.quality}" style="padding: 2px 9px; border-radius: 7px; font-size: 11px; font-weight: 800; display: inline-block; border: 1px solid var(--glass-border);">${escapeHtml(displayName(crop.quality))}</span></td>
            <td>${formatNumber(weight)} kg</td>
            <td class="td-price-highlight">${formattedPrice}</td>
            <td style="color: var(--accent-pink); font-weight: 800;">x${formatNumber(totalMult)}</td>
            <td>${formatNumber(crop.maxWeight)} kg</td>
          </tr>
        `;
      })
      .join("");
  }

  function renderAll() {
    renderPicker(false);
    renderCropOptions();
    if (state.view === "calculator") renderSelectedCrop();
    renderMutations();
    updateWeatherBatchButtons();
    els.showComparisonToggle.checked = state.showComparison;
    els.comparisonTableSection.hidden = !state.showComparison;
    renderTable();
    sync3DSceneState();
  }

  function updateAutoClearToggleVisibility() {
    if (els.autoClear2Label) els.autoClear2Label.style.display = state.allowExtraDecimals ? "none" : "inline-flex";
    if (els.autoClearMoreLabel) els.autoClearMoreLabel.style.display = state.allowExtraDecimals ? "inline-flex" : "none";
  }

  function setupAutoClearInput(input, isWeight) {
    input.addEventListener("focus", () => {
      input.dataset.prevVal = input.value;
      const shouldClear = state.allowExtraDecimals ? state.autoClearMore : state.autoClear2;
      if (!shouldClear) return;
      input.value = "";
      input.dataset.justFocused = "true";
      setTimeout(() => { delete input.dataset.justFocused; }, 300);
      renderSelectedCrop();
    });
    input.addEventListener("click", () => {
      const shouldClear = state.allowExtraDecimals ? state.autoClearMore : state.autoClear2;
      if (!shouldClear) return;
      if (!input.dataset.justFocused) {
        input.dataset.prevVal = input.value;
        input.value = "";
        renderSelectedCrop();
      }
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") input.blur();
    });
    input.addEventListener("blur", () => {
      delete input.dataset.justFocused;
      if (input.value.trim() === "") input.value = input.dataset.prevVal || "";
      const crop = getSelectedCrop();
      if (isWeight) setPercentFromWeight(crop, { clamp: true });
      else setWeightFromPercent(crop, { clamp: true });
      renderSelectedCrop();
    });
  }

  document.addEventListener("pointerdown", (e) => {
    const active = document.activeElement;
    if (active && (active === els.weightInput || active === els.percentInput) && e.target !== active) {
      active.blur();
    }
  }, { passive: true });

  if (global.visualViewport) {
    let lastVpHeight = global.visualViewport.height;
    global.visualViewport.addEventListener("resize", () => {
      const currentH = global.visualViewport.height;
      if (currentH > lastVpHeight + 80) {
        if (document.activeElement === els.weightInput || document.activeElement === els.percentInput) {
          document.activeElement.blur();
        }
      }
      lastVpHeight = currentH;
    });
  }

  function limitDecimalPlaces(input) {
    const maxDecimals = state.allowExtraDecimals ? 6 : 2;
    const val = input.value;
    if (val.includes(".")) {
      const parts = val.split(".");
      if (parts[1].length > maxDecimals) {
        input.value = parts[0] + "." + parts[1].slice(0, maxDecimals);
      }
    }
  }

  setupAutoClearInput(els.weightInput, true);
  setupAutoClearInput(els.percentInput, false);

  els.weightInput.addEventListener("input", () => {
    state.lastEditedField = "weight";
    state.activeQuickPct = null;
    updateQuickPctButtons();
    limitDecimalPlaces(els.weightInput);
    state.lastManualInput = { field: "weight", val: els.weightInput.value };
    setPercentFromWeight(getSelectedCrop());
  });

  els.percentInput.addEventListener("input", () => {
    state.lastEditedField = "percent";
    state.activeQuickPct = null;
    updateQuickPctButtons();
    limitDecimalPlaces(els.percentInput);
    state.lastManualInput = { field: "percent", val: els.percentInput.value };
    setWeightFromPercent(getSelectedCrop());
  });

  els.allowExtraDecimalsToggle.addEventListener("change", () => {
    state.allowExtraDecimals = els.allowExtraDecimalsToggle.checked;
    try { localStorage.setItem(KEYS.DECIMALS, state.allowExtraDecimals); } catch (e) {}
    updateAutoClearToggleVisibility();
    global.AstraAudio.toggle(state.allowExtraDecimals);
    vibrate(10);
    const crop = getSelectedCrop();
    if (els.weightRangeLabel) {
      els.weightRangeLabel.textContent = `${formatNumber(minWeight(crop))}kg ~ ${formatNumber(crop.maxWeight)}kg`;
    }
    if (!state.allowExtraDecimals) {
      if (state.lastEditedField === "weight" && els.weightInput.value.trim() !== "") {
        els.weightInput.value = roundTo2(els.weightInput.value);
        setPercentFromWeight(crop, { clamp: true });
      } else if (els.percentInput.value.trim() !== "") {
        let rounded = Number(roundTo2(els.percentInput.value));
        if (Number(els.percentInput.value) > 0 && rounded < minPercent(crop)) rounded = minPercent(crop);
        els.percentInput.value = formatNumber(rounded);
        setWeightFromPercent(crop, { clamp: true });
      }
    } else {
      limitDecimalPlaces(els.weightInput);
      limitDecimalPlaces(els.percentInput);
      if (state.lastEditedField === "weight" && els.weightInput.value.trim() !== "") setPercentFromWeight(crop);
      else if (els.percentInput.value.trim() !== "") setWeightFromPercent(crop);
    }
  });

  if (els.autoClear2Toggle) {
    els.autoClear2Toggle.addEventListener("change", () => {
      state.autoClear2 = els.autoClear2Toggle.checked;
      try { localStorage.setItem(KEYS.AUTOCLEAR_2, state.autoClear2); } catch (e) {}
      global.AstraAudio.toggle(state.autoClear2);
      vibrate(10);
    });
  }
  if (els.autoClearMoreToggle) {
    els.autoClearMoreToggle.addEventListener("change", () => {
      state.autoClearMore = els.autoClearMoreToggle.checked;
      try { localStorage.setItem(KEYS.AUTOCLEAR_MORE, state.autoClearMore); } catch (e) {}
      global.AstraAudio.toggle(state.autoClearMore);
      vibrate(10);
    });
  }

  /* --------------------------------------------------------------------------
   * 主題與畫質切換
   * -------------------------------------------------------------------------- */
  function applyTheme(themeName, save = true) {
    state.theme = themeName === "light" ? "light" : "dark";
    document.body.classList.toggle("theme-light", state.theme === "light");
    if (els.themeDarkBtn) els.themeDarkBtn.classList.toggle("active", state.theme === "dark");
    if (els.themeLightBtn) els.themeLightBtn.classList.toggle("active", state.theme === "light");

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute("content", state.theme === "light" ? "#d9ecff" : "#040914");

    global.AstralScene3D?.setTheme(state.theme);
    sync3DSceneState();

    if (save) {
      try { localStorage.setItem(KEYS.THEME, state.theme); } catch (e) {}
    }
  }

  function applyGraphicsQuality(tier, save = true) {
    const valid = ["ultra", "high", "smooth"].includes(tier) ? tier : "smooth";
    state.graphicsQuality = valid;
    if (els.graphicsQualityCtrl) {
      els.graphicsQualityCtrl.querySelectorAll("[data-quality]").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.quality === valid);
      });
    }
    global.AstralScene3D?.setQuality(valid);
    if (save) {
      try { localStorage.setItem(KEYS.GRAPHICS, valid); } catch (e) {}
    }
  }

  function applyLegacyUI(enabled, save = true) {
    state.legacyUI = Boolean(enabled);
    document.body.classList.toggle("legacy-ui", state.legacyUI);
    if (els.settingLegacyUIToggle) els.settingLegacyUIToggle.checked = state.legacyUI;
    global.AstralScene3D?.setLegacyMode(state.legacyUI);
    if (save) {
      try { localStorage.setItem(KEYS.LEGACY_UI, String(state.legacyUI)); } catch (e) {}
      renderPicker(false);
    }
  }

  if (els.graphicsQualityCtrl) {
    els.graphicsQualityCtrl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-quality]");
      if (!btn) return;
      applyGraphicsQuality(btn.dataset.quality);
      global.AstraAudio.tap(840);
      vibrate(10);
    });
  }

  /* --------------------------------------------------------------------------
   * 彈窗系統
   * -------------------------------------------------------------------------- */
  function openModal(modal, sound = true) {
    if (!modal) return;
    modal.classList.add("active");
    if (sound) { global.AstraAudio.modalOpen(); vibrate(10); }
  }
  function closeModal(modal, sound = true) {
    if (!modal) return;
    modal.classList.remove("active");
    if (sound) global.AstraAudio.modalClose();
  }

  document.getElementById("footerDisclaimerBtn")?.addEventListener("click", () => openModal(els.disclaimerModal));
  els.disclaimerCloseBtn?.addEventListener("click", () => closeModal(els.disclaimerModal));
  els.disclaimerConfirmBtn?.addEventListener("click", () => closeModal(els.disclaimerModal));
  els.disclaimerModal?.addEventListener("click", (e) => { if (e.target === els.disclaimerModal) closeModal(els.disclaimerModal); });

  function setChangelogMode(mode, playSfx = false) {
    state.changelogMode = mode === "pro" ? "pro" : "simple";
    const simpleBtn = document.getElementById("changelogModeSimpleBtn");
    const proBtn = document.getElementById("changelogModeProBtn");
    const simpleView = document.getElementById("changelogSimpleView");
    const proView = document.getElementById("changelogProView");
    if (simpleBtn && proBtn) {
      simpleBtn.classList.toggle("active", state.changelogMode === "simple");
      proBtn.classList.toggle("active", state.changelogMode === "pro");
    }
    if (simpleView && proView) {
      simpleView.style.display = state.changelogMode === "simple" ? "block" : "none";
      proView.style.display = state.changelogMode === "pro" ? "block" : "none";
    }
    if (playSfx) { global.AstraAudio.tap(720); vibrate(10); }
  }
  document.getElementById("changelogModeSimpleBtn")?.addEventListener("click", () => setChangelogMode("simple", true));
  document.getElementById("changelogModeProBtn")?.addEventListener("click", () => setChangelogMode("pro", true));

  els.footerChangelogBtn?.addEventListener("click", () => {
    setChangelogMode("simple", false);
    openModal(els.changelogModal);
  });
  els.changelogCloseBtn?.addEventListener("click", () => closeModal(els.changelogModal));
  els.changelogConfirmBtn?.addEventListener("click", () => closeModal(els.changelogModal));
  els.changelogModal?.addEventListener("click", (e) => { if (e.target === els.changelogModal) closeModal(els.changelogModal); });

  // 黑名單分類篩選
  const blCategoryBtn = document.getElementById("blCategoryBtn");
  const blCategoryMenu = document.getElementById("blCategoryMenu");
  const blCategoryCurrent = document.getElementById("blCategoryCurrent");
  const blCategoryStat = document.getElementById("blCategoryStat");
  const blDropdownItems = document.querySelectorAll(".bl-dropdown-item");
  const blScamSection = document.getElementById("blScamSection");
  const blBlockSection = document.getElementById("blBlockSection");

  function setBlacklistFilter(cat, playSound = true) {
    if (blCategoryCurrent) blCategoryCurrent.textContent = cat === "scam" ? "詐騙&害人" : (cat === "block" ? "擋地" : "全部");
    if (blCategoryStat) {
      blCategoryStat.innerHTML = cat === "scam"
        ? "顯示：<strong>詐騙&amp;害人通報</strong>（共 7 件）"
        : cat === "block"
          ? "顯示：<strong>擋地影響通報</strong>（共 3 件）"
          : "顯示：<strong>全部名單</strong>（詐騙&amp;害人 7 件 · 擋地 3 件）";
    }
    blDropdownItems.forEach((btn) => btn.classList.toggle("active", btn.getAttribute("data-bl-filter") === cat));
    if (blScamSection) blScamSection.style.display = (cat === "all" || cat === "scam") ? "" : "none";
    if (blBlockSection) blBlockSection.style.display = (cat === "all" || cat === "block") ? "" : "none";
    if (blCategoryMenu) blCategoryMenu.classList.remove("active");
    if (playSound) global.AstraAudio.tap(640);
  }

  if (blCategoryBtn && blCategoryMenu) {
    blCategoryBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = blCategoryMenu.classList.contains("active");
      blCategoryMenu.classList.toggle("active", !isOpen);
      global.AstraAudio.tap(isOpen ? 520 : 680);
    });
    blDropdownItems.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        setBlacklistFilter(btn.getAttribute("data-bl-filter") || "all", true);
      });
    });
    document.addEventListener("click", (e) => {
      if (blCategoryMenu.classList.contains("active") && !e.target.closest(".bl-dropdown-wrap")) {
        blCategoryMenu.classList.remove("active");
      }
    });
  }

  els.blacklistBtn?.addEventListener("click", () => {
    setBlacklistFilter("all", false);
    openModal(els.blacklistModal);
  });
  els.blacklistCloseBtn?.addEventListener("click", () => closeModal(els.blacklistModal));
  els.blacklistConfirmBtn?.addEventListener("click", () => closeModal(els.blacklistModal));
  els.blacklistModal?.addEventListener("click", (e) => { if (e.target === els.blacklistModal) closeModal(els.blacklistModal); });

  function updateHideTipVisibility() {
    if (els.settingsMemoryTipCard) els.settingsMemoryTipCard.style.display = state.hideTip ? "none" : "";
    if (els.calcPrecisionTipCard) els.calcPrecisionTipCard.style.display = state.hideCalcTip ? "none" : "";
    if (els.settingGuideRow) els.settingGuideRow.style.display = "flex";
  }

  els.settingsBtn?.addEventListener("click", () => {
    updateDeviceSpecificUI();
    if (els.settingLegacyUIToggle) els.settingLegacyUIToggle.checked = state.legacyUI;
    if (els.settingSoundToggle) els.settingSoundToggle.checked = state.soundEnabled;
    if (els.themeDarkBtn) els.themeDarkBtn.classList.toggle("active", state.theme === "dark");
    if (els.themeLightBtn) els.themeLightBtn.classList.toggle("active", state.theme === "light");
    if (els.settingGyroToggle) els.settingGyroToggle.checked = state.gyroEnabled;
    if (els.settingHideTipToggle) els.settingHideTipToggle.checked = state.hideTip;
    if (els.settingHideCalcTipToggle) els.settingHideCalcTipToggle.checked = state.hideCalcTip;
    updateSettingsCustomOrderUI();
    openModal(els.settingsModal);
  });
  els.settingsCloseBtn?.addEventListener("click", () => closeModal(els.settingsModal));
  els.settingsConfirmBtn?.addEventListener("click", () => closeModal(els.settingsModal));
  els.settingsModal?.addEventListener("click", (e) => { if (e.target === els.settingsModal) closeModal(els.settingsModal); });

  els.openSwitchGuideBtn?.addEventListener("click", () => { updateDeviceSpecificUI(); openModal(els.switchGuideModal); });
  els.tipGuideBtn?.addEventListener("click", () => { updateDeviceSpecificUI(); openModal(els.switchGuideModal); });
  els.switchGuideCloseBtn?.addEventListener("click", () => closeModal(els.switchGuideModal));
  els.switchGuideConfirmBtn?.addEventListener("click", () => closeModal(els.switchGuideModal));
  els.switchGuideModal?.addEventListener("click", (e) => { if (e.target === els.switchGuideModal) closeModal(els.switchGuideModal); });

  els.settingLegacyUIToggle?.addEventListener("change", () => {
    applyLegacyUI(els.settingLegacyUIToggle.checked, true);
    global.AstraAudio.toggle(state.legacyUI);
    vibrate(12);
  });

  els.settingSoundToggle?.addEventListener("change", () => {
    state.soundEnabled = els.settingSoundToggle.checked;
    try { localStorage.setItem(KEYS.SOUND, state.soundEnabled); } catch (e) {}
    global.AstraAudio.toggle(state.soundEnabled);
    vibrate(10);
  });
  els.themeDarkBtn?.addEventListener("click", () => { applyTheme("dark"); global.AstraAudio.tap(880); vibrate(12); });
  els.themeLightBtn?.addEventListener("click", () => { applyTheme("light"); global.AstraAudio.tap(920); vibrate(12); });

  els.settingGyroToggle?.addEventListener("change", () => {
    const wantOn = els.settingGyroToggle.checked;
    if (wantOn && typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission().then((res) => {
        state.gyroEnabled = res === "granted";
        els.settingGyroToggle.checked = state.gyroEnabled;
        try { localStorage.setItem(KEYS.GYRO, String(state.gyroEnabled)); } catch (e) {}
        global.AstralScene3D?.setParallaxEnabled(state.gyroEnabled);
        if (state.gyroEnabled) global.AstraAudio.activate();
        else alert("陀螺儀權限未被允許。");
      }).catch(() => {
        state.gyroEnabled = false;
        els.settingGyroToggle.checked = false;
      });
    } else {
      state.gyroEnabled = wantOn;
      try { localStorage.setItem(KEYS.GYRO, String(wantOn)); } catch (e) {}
      global.AstralScene3D?.setParallaxEnabled(wantOn);
      global.AstraAudio.toggle(wantOn);
    }
  });

  els.settingHideTipToggle?.addEventListener("change", () => {
    state.hideTip = els.settingHideTipToggle.checked;
    try { localStorage.setItem(KEYS.HIDE_TIP, state.hideTip); } catch (e) {}
    updateHideTipVisibility();
    global.AstraAudio.toggle(!state.hideTip);
  });
  els.settingHideCalcTipToggle?.addEventListener("change", () => {
    state.hideCalcTip = els.settingHideCalcTipToggle.checked;
    try { localStorage.setItem(KEYS.HIDE_CALC_TIP, state.hideCalcTip); } catch (e) {}
    updateHideTipVisibility();
    global.AstraAudio.toggle(!state.hideCalcTip);
  });

  /* --------------------------------------------------------------------------
   * 通用確認彈窗 & 自訂詞條拖曳排列編輯器
   * -------------------------------------------------------------------------- */
  let confirmActionCallback = null;
  function showConfirmDialog({ title, message, subMessage = "", onConfirm }) {
    if (!els.confirmActionModal) return;
    if (els.confirmActionTitle) els.confirmActionTitle.innerHTML = title;
    if (els.confirmActionMessage) els.confirmActionMessage.textContent = message;
    if (els.confirmActionSubMessage) els.confirmActionSubMessage.textContent = subMessage;
    confirmActionCallback = onConfirm;
    openModal(els.confirmActionModal);
  }
  function closeConfirmDialog() {
    confirmActionCallback = null;
    closeModal(els.confirmActionModal);
  }
  els.confirmActionCloseBtn?.addEventListener("click", closeConfirmDialog);
  els.confirmActionNoBtn?.addEventListener("click", closeConfirmDialog);
  els.confirmActionYesBtn?.addEventListener("click", () => {
    const cb = confirmActionCallback;
    closeConfirmDialog();
    if (cb) cb();
  });
  els.confirmActionModal?.addEventListener("click", (e) => { if (e.target === els.confirmActionModal) closeConfirmDialog(); });

  let customSortDraft = null;
  let selectedChipToMove = null;
  let initialSortSnapshot = null;

  function isLayoutEqualToDefault(layout) {
    if (!layout || !Array.isArray(layout)) return true;
    const def = getDefaultMutationLayout();
    if (layout.length !== def.length) return false;
    for (let i = 0; i < def.length; i++) {
      if (layout[i].title !== def[i].title) return false;
      const lMuts = layout[i].mutations || [];
      const dMuts = def[i].mutations || [];
      if (lMuts.length !== dMuts.length) return false;
      for (let j = 0; j < dMuts.length; j++) if (lMuts[j] !== dMuts[j]) return false;
    }
    return true;
  }

  function updateSettingsCustomOrderUI() {
    const isDefault = isLayoutEqualToDefault(state.customMutationLayout);
    if (isDefault) {
      state.customMutationLayout = null;
      try { localStorage.removeItem(KEYS.CUSTOM_MUTATIONS); } catch (e) {}
    }
    if (els.resetCustomOrderBtn) els.resetCustomOrderBtn.style.display = isDefault ? "none" : "inline-flex";
  }

  function syncTitleInputsFromDOM() {
    els.customSortCategoriesContainer?.querySelectorAll(".custom-cat-title-input").forEach((inp) => {
      const idx = Number(inp.dataset.catIdx);
      if (customSortDraft?.[idx]) customSortDraft[idx].title = inp.value.trim() || `分類 ${idx + 1}`;
    });
  }

  function hasCustomSortChanged() {
    syncTitleInputsFromDOM();
    return JSON.stringify(customSortDraft) !== initialSortSnapshot;
  }

  const markerBar = document.createElement("div");
  markerBar.className = "drag-insert-marker-bar";
  let sortCurHoverZone = null;
  let sortCurTargetCard = null;
  let sortDragGhost = null;
  let sortDraggedName = null;
  let sortHoldTimer = null;
  let sortIsHoldReady = false;
  let sortIsDragging = false;
  let sortDragTrackingTouchId = null;
  let sortStartPos = null;
  let sortActiveSourceChip = null;
  let sortSecondaryScrollTouchId = null;
  let sortSecondaryLastY = 0;
  let sortPreventClick = false;
  let sortGlobalListenersInitialized = false;
  let sortAutoScrollSpeed = 0;
  let sortAutoScrollRaf = null;

  function removeMarkerBar() {
    if (markerBar.parentNode) markerBar.parentNode.removeChild(markerBar);
  }
  function clearAllInsertMarkers() {
    removeMarkerBar();
    if (sortCurHoverZone) { sortCurHoverZone.classList.remove("drag-hover"); sortCurHoverZone = null; }
    if (sortCurTargetCard) { sortCurTargetCard.classList.remove("drag-target"); sortCurTargetCard = null; }
  }
  function sortStopAutoScroll() {
    sortAutoScrollSpeed = 0;
    if (sortAutoScrollRaf) { cancelAnimationFrame(sortAutoScrollRaf); sortAutoScrollRaf = null; }
  }
  function sortAutoScrollLoop() {
    if (!sortAutoScrollSpeed) { sortAutoScrollRaf = null; return; }
    const modalBody = document.querySelector(".custom-sort-modal-body");
    if (modalBody) modalBody.scrollTop += sortAutoScrollSpeed;
    sortAutoScrollRaf = requestAnimationFrame(sortAutoScrollLoop);
  }
  function sortStartAutoScroll(clientY) {
    const modalBody = document.querySelector(".custom-sort-modal-body");
    if (!modalBody) return;
    const rect = modalBody.getBoundingClientRect();
    if (clientY < rect.top + 50) {
      sortAutoScrollSpeed = -Math.max(2, Math.min(16, (rect.top + 50 - clientY) * 0.35));
      if (!sortAutoScrollRaf) sortAutoScrollRaf = requestAnimationFrame(sortAutoScrollLoop);
    } else if (clientY > rect.bottom - 50) {
      sortAutoScrollSpeed = Math.max(2, Math.min(16, (clientY - (rect.bottom - 50)) * 0.35));
      if (!sortAutoScrollRaf) sortAutoScrollRaf = requestAnimationFrame(sortAutoScrollLoop);
    } else {
      sortStopAutoScroll();
    }
  }

  function updateInsertionMarkerAtPoint(clientX, clientY) {
    const dropElem = document.elementFromPoint(clientX, clientY);
    if (!dropElem) { clearAllInsertMarkers(); return; }
    const targetChip = dropElem.closest(".custom-sort-chip");
    const zone = dropElem.closest(".custom-cat-chips-zone");
    const card = dropElem.closest(".custom-cat-card");

    if (sortCurHoverZone !== zone) {
      sortCurHoverZone?.classList.remove("drag-hover");
      zone?.classList.add("drag-hover");
      sortCurHoverZone = zone;
    }
    if (sortCurTargetCard !== card) {
      sortCurTargetCard?.classList.remove("drag-target");
      card?.classList.add("drag-target");
      sortCurTargetCard = card;
    }

    if (targetChip && zone) {
      const rect = targetChip.getBoundingClientRect();
      const isBefore = clientX < rect.left + rect.width / 2;
      if (isBefore && markerBar.nextSibling !== targetChip) zone.insertBefore(markerBar, targetChip);
      else if (!isBefore && markerBar.previousSibling !== targetChip) zone.insertBefore(markerBar, targetChip.nextSibling);
    } else if (zone && !targetChip) {
      const moveBtn = zone.querySelector(".btn-move-here");
      if (moveBtn && markerBar.nextSibling !== moveBtn) zone.insertBefore(markerBar, moveBtn);
      else if (!moveBtn && markerBar.parentNode !== zone) zone.appendChild(markerBar);
    } else {
      removeMarkerBar();
    }
  }

  function moveMutationInDraft(mutName, targetCatIdx, targetChipIdx = null) {
    if (!customSortDraft || targetCatIdx < 0 || targetCatIdx >= customSortDraft.length) return;
    for (const cat of customSortDraft) {
      const idx = (cat.mutations || []).indexOf(mutName);
      if (idx !== -1) { cat.mutations.splice(idx, 1); break; }
    }
    const targetCat = customSortDraft[targetCatIdx];
    if (!targetCat.mutations) targetCat.mutations = [];
    if (targetChipIdx === null || targetChipIdx < 0 || targetChipIdx >= targetCat.mutations.length) {
      targetCat.mutations.push(mutName);
    } else {
      targetCat.mutations.splice(targetChipIdx, 0, mutName);
    }
    selectedChipToMove = null;
    renderCustomSortEditor();
    global.AstraAudio.tap(740);
    vibrate(10);
  }

  function endDragOperation(isDrop) {
    sortStopAutoScroll();
    sortSecondaryScrollTouchId = null;
    sortSecondaryLastY = 0;
    if (sortHoldTimer) { clearTimeout(sortHoldTimer); sortHoldTimer = null; }
    sortActiveSourceChip?.classList.remove("chip-holding-jiggle", "chip-dragging-dimmed");

    if (sortIsDragging && sortDragGhost) {
      sortDragGhost.remove();
      sortDragGhost = null;
      if (isDrop && markerBar.parentNode?.classList.contains("custom-cat-chips-zone")) {
        const targetZone = markerBar.parentNode;
        const targetCatIdx = Number(targetZone.dataset.catIdx);
        const nextEl = markerBar.nextElementSibling;
        const targetChipIdx = (nextEl?.classList.contains("custom-sort-chip") && nextEl.dataset.chipIdx !== undefined)
          ? Number(nextEl.dataset.chipIdx)
          : (customSortDraft?.[targetCatIdx]?.mutations.length ?? null);
        clearAllInsertMarkers();
        if (sortDraggedName) moveMutationInDraft(sortDraggedName, targetCatIdx, targetChipIdx);
      } else {
        clearAllInsertMarkers();
        global.AstraAudio.cancel();
      }
    }
    sortIsHoldReady = false;
    sortIsDragging = false;
    global.isCustomSortDragging = false;
    sortDragTrackingTouchId = null;
    sortStartPos = null;
    sortActiveSourceChip = null;
    sortDraggedName = null;
  }

  function initCustomSortGlobalListenersOnce() {
    if (sortGlobalListenersInitialized) return;
    sortGlobalListenersInitialized = true;

    global.addEventListener("touchstart", (e) => {
      if (!sortIsDragging || sortDragTrackingTouchId === null) return;
      for (const t of e.touches) {
        if (t.identifier !== sortDragTrackingTouchId && sortSecondaryScrollTouchId === null) {
          sortSecondaryScrollTouchId = t.identifier;
          sortSecondaryLastY = t.clientY;
          break;
        }
      }
    }, { passive: true });

    global.addEventListener("touchmove", (e) => {
      if (!sortIsDragging || sortDragTrackingTouchId === null) return;
      let dragTouch = null, scrollTouch = null;
      for (const t of e.touches) {
        if (t.identifier === sortDragTrackingTouchId) dragTouch = t;
        else if (t.identifier === sortSecondaryScrollTouchId || sortSecondaryScrollTouchId === null) {
          if (sortSecondaryScrollTouchId === null) { sortSecondaryScrollTouchId = t.identifier; sortSecondaryLastY = t.clientY; }
          scrollTouch = t;
        }
      }
      if (dragTouch && sortDragGhost) {
        sortDragGhost.style.transform = `translate3d(${dragTouch.clientX - 35}px, ${dragTouch.clientY - 18}px, 0) scale(1.08)`;
        updateInsertionMarkerAtPoint(dragTouch.clientX, dragTouch.clientY);
        sortStartAutoScroll(dragTouch.clientY);
      }
      const modalBody = document.querySelector(".custom-sort-modal-body");
      if (scrollTouch && modalBody) {
        modalBody.scrollTop -= (scrollTouch.clientY - sortSecondaryLastY);
        sortSecondaryLastY = scrollTouch.clientY;
      }
      if (e.cancelable) e.preventDefault();
    }, { passive: false });

    global.addEventListener("touchend", (e) => {
      if (sortDragTrackingTouchId !== null) {
        const activeIds = new Set([...e.touches].map((t) => t.identifier));
        if (!activeIds.has(sortSecondaryScrollTouchId)) { sortSecondaryScrollTouchId = null; sortSecondaryLastY = 0; }
        if (!activeIds.has(sortDragTrackingTouchId)) endDragOperation(true);
      }
    });
    global.addEventListener("touchcancel", () => { if (sortDragTrackingTouchId !== null) endDragOperation(false); });

    global.addEventListener("mousemove", (e) => {
      if (!sortActiveSourceChip) return;
      if (!sortIsHoldReady) {
        if (sortStartPos && Math.hypot(e.clientX - sortStartPos.x, e.clientY - sortStartPos.y) > 8) {
          clearTimeout(sortHoldTimer); sortHoldTimer = null;
          sortActiveSourceChip.classList.remove("chip-holding-jiggle");
          sortActiveSourceChip = null; sortStartPos = null;
        }
        return;
      }
      if (!sortIsDragging) {
        sortIsDragging = true;
        global.isCustomSortDragging = true;
        sortPreventClick = true;
        sortActiveSourceChip.classList.remove("chip-holding-jiggle");
        sortActiveSourceChip.classList.add("chip-dragging-dimmed");
        if (!sortDragGhost) {
          sortDragGhost = sortActiveSourceChip.cloneNode(true);
          sortDragGhost.className = "custom-sort-drag-ghost";
          sortDragGhost.style.left = "0"; sortDragGhost.style.top = "0";
          document.body.appendChild(sortDragGhost);
        }
      }
      if (sortDragGhost) {
        sortDragGhost.style.transform = `translate3d(${e.clientX - 35}px, ${e.clientY - 18}px, 0) scale(1.06)`;
        updateInsertionMarkerAtPoint(e.clientX, e.clientY);
        sortStartAutoScroll(e.clientY);
      }
    });
    global.addEventListener("mouseup", () => { if (sortActiveSourceChip && sortDragTrackingTouchId === null) endDragOperation(true); });
  }

  function renderCustomSortEditor() {
    if (!customSortDraft || !els.customSortCategoriesContainer) return;
    const catCount = customSortDraft.length;
    if (els.customCatCountBadge) els.customCatCountBadge.textContent = `${catCount}/10`;
    if (els.addCustomCategoryBtn) els.addCustomCategoryBtn.disabled = catCount >= 10;

    const mutationByName = getMutationByName();
    els.customSortCategoriesContainer.innerHTML = customSortDraft.map((cat, catIdx) => {
      const chipsHtml = (cat.mutations || []).map((mutName, chipIdx) => {
        const m = mutationByName.get(mutName);
        if (!m) return "";
        const isSelected = selectedChipToMove?.name === mutName;
        return `
          <button class="chip-3d custom-sort-chip chip-color-${m.color} ${isSelected ? "selected-for-move" : ""}"
                  type="button" data-cat-idx="${catIdx}" data-chip-idx="${chipIdx}" data-mutation="${escapeHtml(mutName)}">
            <span>${escapeHtml(displayName(mutName))}</span>
          </button>
        `;
      }).join("");
      const moveHereBtn = selectedChipToMove
        ? `<button class="btn-move-here" type="button" data-move-to-cat="${catIdx}">⬇ 移至此分類「${escapeHtml(cat.title || `分類 ${catIdx + 1}`)}」</button>`
        : "";
      return `
        <div class="custom-cat-card" data-cat-idx="${catIdx}">
          <div class="custom-cat-header">
            <div class="custom-cat-title-wrap">
              <input class="custom-cat-title-input" type="text" maxlength="20" value="${escapeHtml(cat.title)}" data-cat-idx="${catIdx}" placeholder="輸入分類名稱..." />
              <span class="custom-cat-count-tag">${(cat.mutations || []).length} 個詞條</span>
            </div>
            <button class="btn-cat-del" type="button" data-delete-cat="${catIdx}" ${catCount <= 1 ? "disabled" : ""}>🗑 刪除分類</button>
          </div>
          <div class="custom-cat-chips-zone" data-cat-idx="${catIdx}">${chipsHtml}${moveHereBtn}</div>
        </div>
      `;
    }).join("");

    initCustomSortGlobalListenersOnce();
    els.customSortCategoriesContainer.querySelectorAll(".custom-cat-title-input").forEach((inp) => {
      inp.addEventListener("input", () => {
        const idx = Number(inp.dataset.catIdx);
        if (customSortDraft?.[idx]) customSortDraft[idx].title = inp.value;
      });
    });
    els.customSortCategoriesContainer.querySelectorAll("[data-delete-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const catIdx = Number(btn.dataset.deleteCat);
        if (!customSortDraft || customSortDraft.length <= 1) return;
        const [removed] = customSortDraft.splice(catIdx, 1);
        if (removed?.mutations?.length) {
          const targetIdx = Math.max(0, catIdx - 1);
          customSortDraft[targetIdx].mutations.push(...removed.mutations);
        }
        if (selectedChipToMove?.catIdx === catIdx) selectedChipToMove = null;
        renderCustomSortEditor();
        global.AstraAudio.cancel();
      });
    });
    els.customSortCategoriesContainer.querySelectorAll("[data-move-to-cat]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (selectedChipToMove) moveMutationInDraft(selectedChipToMove.name, Number(btn.dataset.moveToCat));
      });
    });
    els.customSortCategoriesContainer.querySelectorAll(".custom-sort-chip").forEach((chip) => {
      chip.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        sortActiveSourceChip = chip;
        sortDraggedName = chip.dataset.mutation;
        sortStartPos = { x: e.clientX, y: e.clientY };
        sortIsHoldReady = false; sortIsDragging = false; sortDragTrackingTouchId = null; sortPreventClick = false;
        clearTimeout(sortHoldTimer);
        sortHoldTimer = setTimeout(() => { sortIsHoldReady = true; chip.classList.add("chip-holding-jiggle"); vibrate(18); }, 200);
      });
      chip.addEventListener("click", (e) => {
        e.stopPropagation();
        if (sortPreventClick || sortIsDragging) { sortPreventClick = false; return; }
        const mName = chip.dataset.mutation, cIdx = Number(chip.dataset.catIdx), chIdx = Number(chip.dataset.chipIdx);
        if (!selectedChipToMove) { selectedChipToMove = { name: mName, catIdx: cIdx, chipIdx: chIdx }; renderCustomSortEditor(); global.AstraAudio.tap(600); }
        else if (selectedChipToMove.name === mName) { selectedChipToMove = null; renderCustomSortEditor(); global.AstraAudio.cancel(); }
        else moveMutationInDraft(selectedChipToMove.name, cIdx, chIdx);
      });
      chip.addEventListener("touchstart", (e) => {
        if (sortIsDragging) return;
        const touch = e.touches[0];
        sortActiveSourceChip = chip; sortDraggedName = chip.dataset.mutation; sortDragTrackingTouchId = touch.identifier;
        sortStartPos = { x: touch.clientX, y: touch.clientY };
        sortIsHoldReady = false; sortIsDragging = false; sortPreventClick = false;
        clearTimeout(sortHoldTimer);
        sortHoldTimer = setTimeout(() => { sortIsHoldReady = true; chip.classList.add("chip-holding-jiggle"); vibrate(18); }, 200);
      }, { passive: true });
      chip.addEventListener("touchmove", (e) => {
        if (sortActiveSourceChip !== chip) return;
        const trackedTouch = [...e.touches].find((t) => t.identifier === sortDragTrackingTouchId);
        if (!trackedTouch) return;
        if (!sortIsHoldReady) {
          if (Math.hypot(trackedTouch.clientX - sortStartPos.x, trackedTouch.clientY - sortStartPos.y) > 8) {
            clearTimeout(sortHoldTimer); sortHoldTimer = null;
            chip.classList.remove("chip-holding-jiggle");
            sortActiveSourceChip = null; sortDragTrackingTouchId = null; sortStartPos = null; sortDraggedName = null;
          }
        } else {
          if (!sortIsDragging) {
            sortIsDragging = true; global.isCustomSortDragging = true; sortPreventClick = true;
            chip.classList.remove("chip-holding-jiggle"); chip.classList.add("chip-dragging-dimmed");
            if (!sortDragGhost) {
              sortDragGhost = chip.cloneNode(true);
              sortDragGhost.className = "custom-sort-drag-ghost";
              sortDragGhost.style.left = "0"; sortDragGhost.style.top = "0";
              document.body.appendChild(sortDragGhost);
            }
          }
          if (e.cancelable) e.preventDefault();
        }
      }, { passive: false });
      chip.addEventListener("touchend", () => {
        if (sortActiveSourceChip !== chip) return;
        clearTimeout(sortHoldTimer); sortHoldTimer = null;
        chip.classList.remove("chip-holding-jiggle");
        sortPreventClick = sortIsDragging;
      });
    });
  }

  function closeCustomSortModal() {
    customSortDraft = null; selectedChipToMove = null; initialSortSnapshot = null;
    removeMarkerBar();
    closeModal(els.customSortModal);
  }

  els.openCustomOrderBtn?.addEventListener("click", () => {
    customSortDraft = JSON.parse(JSON.stringify(state.customMutationLayout || getDefaultMutationLayout()));
    selectedChipToMove = null;
    initialSortSnapshot = JSON.stringify(customSortDraft);
    renderCustomSortEditor();
    closeModal(els.settingsModal, false);
    openModal(els.customSortModal);
  });

  els.addCustomCategoryBtn?.addEventListener("click", () => {
    if (!customSortDraft || customSortDraft.length >= 10) return;
    customSortDraft.push({ id: `cat_${Date.now()}`, title: `分類 ${customSortDraft.length + 1}`, mutations: [] });
    renderCustomSortEditor();
    global.AstraAudio.activate();
  });

  function handleCustomSortCancel() {
    if (!hasCustomSortChanged()) { closeCustomSortModal(); return; }
    showConfirmDialog({
      title: "<span>✕</span> 取消編輯",
      message: "是否取消本次排列？",
      subMessage: "取消後將捨棄未儲存的排列調整，並退出編輯模式。",
      onConfirm: closeCustomSortModal
    });
  }
  els.customSortCancelBtn?.addEventListener("click", handleCustomSortCancel);
  els.customSortCloseBtn?.addEventListener("click", handleCustomSortCancel);

  els.customSortConfirmBtn?.addEventListener("click", () => {
    if (!customSortDraft) return;
    syncTitleInputsFromDOM();
    if (!hasCustomSortChanged()) { closeCustomSortModal(); return; }
    showConfirmDialog({
      title: "<span>💾</span> 確認儲存排列",
      message: "是否確定更改詞條排列？",
      subMessage: "確認後將以全新的自訂分類與排序呈現於計算器中。",
      onConfirm: () => {
        customSortDraft.forEach((cat, i) => { if (!cat.title?.trim()) cat.title = `分類 ${i + 1}`; });
        const present = new Set(customSortDraft.flatMap((c) => c.mutations || []));
        (global.GAME_DATA?.mutations || []).forEach((m) => { if (!present.has(m.name)) customSortDraft[0].mutations.push(m.name); });
        if (isLayoutEqualToDefault(customSortDraft)) {
          state.customMutationLayout = null;
          try { localStorage.removeItem(KEYS.CUSTOM_MUTATIONS); } catch (e) {}
        } else {
          state.customMutationLayout = customSortDraft;
          try { localStorage.setItem(KEYS.CUSTOM_MUTATIONS, JSON.stringify(state.customMutationLayout)); } catch (e) {}
        }
        updateSettingsCustomOrderUI();
        closeCustomSortModal();
        renderAll();
        global.AstraAudio.activate();
      }
    });
  });

  els.resetCustomOrderBtn?.addEventListener("click", () => {
    showConfirmDialog({
      title: "<span>🔄</span> 恢復預設排列",
      message: "是否恢復詞條的預設排列？",
      subMessage: "確認後將清除所有自訂分類與排序，立即還原為系統預設排列。",
      onConfirm: () => {
        state.customMutationLayout = null;
        try { localStorage.removeItem(KEYS.CUSTOM_MUTATIONS); } catch (e) {}
        updateSettingsCustomOrderUI();
        renderAll();
        global.AstraAudio.tap(600);
      }
    });
  });

  /* --------------------------------------------------------------------------
   * 主要點擊與輸入綁定
   * -------------------------------------------------------------------------- */
  els.backToPickerBtn.addEventListener("click", () => {
    state.selectedMutations.clear();
    state.weatherBatchMode = null;
    state.lastManualWeatherMutations = null;
    updateWeatherBatchButtons();
    els.percentInput.value = "";
    els.weightInput.value = "";
    state.activeQuickPct = null;
    state.lastManualInput = null;
    updateQuickPctButtons();
    global.AstraAudio.tap(680);
    vibrate(10);
    global.AstralScene3D?.pulse("至臻", -1);
    setView("picker");
    renderAll();
  });

  els.pickerSearch.addEventListener("input", () => renderPicker(false));
  els.qualityTabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-tab-pill");
    if (!btn) return;
    const clickedQ = btn.dataset.q;
    state.currentFilterQuality = state.currentFilterQuality === clickedQ ? null : clickedQ;
    if (state.currentFilterQuality) global.AstraAudio.activate();
    else global.AstraAudio.cancel();
    vibrate(12);
    renderPicker(true);
  });

  els.pickerGrid.addEventListener("click", (e) => {
    const card = e.target.closest("[data-crop]");
    if (card) chooseCrop(card.dataset.crop);
  });

  function updateQuickPctButtons() {
    document.querySelectorAll(".pct-3d-btn").forEach((btn) => {
      btn.classList.toggle("active", state.activeQuickPct !== null && Number(btn.dataset.pct) === Number(state.activeQuickPct));
    });
  }

  document.querySelectorAll(".pct-3d-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const crop = getSelectedCrop();
      const pct = Number(btn.dataset.pct);
      if (state.activeQuickPct === pct) {
        state.activeQuickPct = null;
        updateQuickPctButtons();
        btn.blur();
        global.AstraAudio.cancel();
        if (state.lastManualInput && state.lastManualInput.val !== "") {
          if (state.lastManualInput.field === "weight") {
            state.lastEditedField = "weight";
            els.weightInput.value = state.lastManualInput.val;
            setPercentFromWeight(crop, { clamp: true });
          } else {
            state.lastEditedField = "percent";
            els.percentInput.value = state.lastManualInput.val;
            setWeightFromPercent(crop, { clamp: true });
          }
        } else {
          els.weightInput.value = "";
          els.percentInput.value = "";
          renderSelectedCrop();
        }
      } else {
        state.activeQuickPct = pct;
        updateQuickPctButtons();
        state.lastEditedField = "percent";
        els.percentInput.value = pct;
        global.AstraAudio.tap(920);
        vibrate(10);
        setWeightFromPercent(crop, { clamp: true });
      }
    });
  });

  els.dropdownTriggerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = els.dropdownMenuList.hidden;
    els.dropdownMenuList.hidden = !willOpen;
    const arrow = document.getElementById("repickArrow");
    if (arrow) arrow.textContent = willOpen ? "▼" : "❯";
    els.dropdownTriggerBtn.classList.toggle("active", willOpen);
    document.querySelector(".control-pod-3d")?.classList.toggle("dropdown-open", willOpen);
    if (willOpen) {
      if (els.valPrecDropdownMenu) els.valPrecDropdownMenu.hidden = true;
      if (els.compareValPrecDropdownMenu) els.compareValPrecDropdownMenu.hidden = true;
      state.dropdownFilterQuality = null;
      renderDropdownCrops();
    }
    global.AstraAudio.tap(780);
  });

  document.getElementById("dropdownQualityTabs")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-tab-pill");
    if (!btn) return;
    e.stopPropagation();
    const clickedQ = btn.dataset.q;
    state.dropdownFilterQuality = state.dropdownFilterQuality === clickedQ ? null : clickedQ;
    if (state.dropdownFilterQuality) global.AstraAudio.activate();
    else global.AstraAudio.cancel();
    renderDropdownCrops();
  });

  els.dropdownMenuList.addEventListener("click", (e) => {
    const item = e.target.closest("[data-crop]");
    if (item) chooseCrop(item.dataset.crop);
  });

  function updateValPrecMenuUI() {
    if (els.valPrecCurrentNum) els.valPrecCurrentNum.textContent = state.priceDigits;
    els.valPrecDropdownMenu?.querySelectorAll(".val-prec-item").forEach((item) => {
      item.classList.toggle("active", Number(item.dataset.digits) === state.priceDigits);
    });
  }
  function updateCompareValPrecMenuUI() {
    if (els.compareValPrecCurrentNum) els.compareValPrecCurrentNum.textContent = state.comparePriceDigits;
    els.compareValPrecDropdownMenu?.querySelectorAll(".compare-val-prec-item").forEach((item) => {
      item.classList.toggle("active", Number(item.dataset.digits) === state.comparePriceDigits);
    });
  }

  els.valPrecTriggerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = !els.valPrecDropdownMenu.hidden;
    els.valPrecDropdownMenu.hidden = isOpen;
    document.querySelector(".energy-reactor-dock")?.classList.toggle("precision-dropdown-open", !isOpen);
    if (!isOpen) els.dropdownMenuList.hidden = true;
    updateValPrecMenuUI();
    global.AstraAudio.tap(780);
  });
  els.valPrecDropdownMenu.addEventListener("click", (e) => {
    const item = e.target.closest(".val-prec-item");
    if (!item) return;
    const digits = Number(item.dataset.digits);
    if (digits >= 2 && digits <= 6) {
      state.priceDigits = digits;
      try { localStorage.setItem(KEYS.PRICE_DECIMALS, state.priceDigits); } catch (err) {}
      updateValPrecMenuUI();
      els.valPrecDropdownMenu.hidden = true;
      document.querySelector(".energy-reactor-dock")?.classList.remove("precision-dropdown-open");
      global.AstraAudio.tap(880);
      renderSelectedCrop();
      renderTable();
    }
  });

  els.compareValPrecTriggerBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = !els.compareValPrecDropdownMenu.hidden;
    els.compareValPrecDropdownMenu.hidden = isOpen;
    updateCompareValPrecMenuUI();
    global.AstraAudio.tap(780);
  });
  els.compareValPrecDropdownMenu?.addEventListener("click", (e) => {
    const item = e.target.closest(".compare-val-prec-item");
    if (!item) return;
    const digits = Number(item.dataset.digits);
    if (digits >= 2 && digits <= 6) {
      state.comparePriceDigits = digits;
      try { localStorage.setItem(KEYS.COMPARE_PRICE_DECIMALS, state.comparePriceDigits); } catch (err) {}
      updateCompareValPrecMenuUI();
      els.compareValPrecDropdownMenu.hidden = true;
      global.AstraAudio.tap(880);
      renderTable();
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest("#dropdownTriggerBtn") && !e.target.closest("#dropdownMenuList")) {
      els.dropdownMenuList.hidden = true;
      const arrow = document.getElementById("repickArrow");
      if (arrow) arrow.textContent = "❯";
      els.dropdownTriggerBtn?.classList.remove("active");
      document.querySelector(".control-pod-3d")?.classList.remove("dropdown-open");
    }
    if (els.valPrecDropdownMenu && !document.querySelector(".value-precision-box:not(.compare-val-prec-box)")?.contains(e.target)) {
      els.valPrecDropdownMenu.hidden = true;
      document.querySelector(".energy-reactor-dock")?.classList.remove("precision-dropdown-open");
    }
    if (els.compareValPrecDropdownMenu && !document.querySelector(".compare-val-prec-box")?.contains(e.target)) {
      els.compareValPrecDropdownMenu.hidden = true;
    }
  });

  els.comparePercentSlider.addEventListener("input", renderTable);
  els.showComparisonToggle.addEventListener("change", () => {
    state.showComparison = els.showComparisonToggle.checked;
    try { localStorage.setItem(KEYS.COMPARE, state.showComparison); } catch (e) {}
    global.AstraAudio.toggle(state.showComparison);
    renderAll();
  });
  els.sortModeBtn.addEventListener("click", () => {
    state.sortMode = state.sortMode === "quality" ? "price" : "quality";
    try { localStorage.setItem(KEYS.SORT_MODE, state.sortMode); } catch (e) {}
    global.AstraAudio.tap(760);
    renderTable();
  });
  els.sortDirBtn.addEventListener("click", () => {
    state.sortDirection = state.sortDirection === "desc" ? "asc" : "desc";
    try { localStorage.setItem(KEYS.SORT_DIR, state.sortDirection); } catch (e) {}
    global.AstraAudio.tap(760);
    renderTable();
  });

  els.batchFlowFireBtn?.addEventListener("click", () => handleWeatherBatchSelect("flow"));
  els.batchPorcelainBtn?.addEventListener("click", () => handleWeatherBatchSelect("porcelain"));
  els.resetMutationsBtn.addEventListener("click", () => {
    state.selectedMutations.clear();
    state.weatherBatchMode = null;
    state.lastManualWeatherMutations = null;
    updateWeatherBatchButtons();
    global.AstraAudio.cancel();
    vibrate(20);
    renderAll();
  });
  els.mutationGroupsContainer.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-mutation]");
    if (chip) toggleMutation(chip.dataset.mutation);
  });

  // 三擊左上角標誌彩蛋特效：蓄能旋轉發光並觸發對應模式之超新星／聖輝光柱 (零額外負擔，不影響流暢度)
  let logoClickCount = 0;
  let logoClickTimer = null;
  els.headerLogoGem?.addEventListener("click", (e) => {
    logoClickCount = (e && e.detail >= 3) ? 3 : logoClickCount + 1;
    global.AstraAudio.tap(600 + logoClickCount * 140);
    vibrate(10);
    clearTimeout(logoClickTimer);

    const gem = els.headerLogoGem;
    gem.classList.remove("gem-charge-1", "gem-charge-2", "gem-supernova-spin");

    if (logoClickCount >= 3) {
      logoClickCount = 0;
      void gem.offsetWidth;
      gem.classList.add("gem-supernova-spin");
      setTimeout(() => gem.classList.remove("gem-supernova-spin"), 680);

      global.AstraAudio.supernova();
      global.AstralScene3D?.triggerSupernova();

      if (els.screenFlash) {
        const flashDelay = state.legacyUI ? 0 : 720;
        setTimeout(() => {
          els.screenFlash.classList.add("active");
          setTimeout(() => els.screenFlash.classList.remove("active"), 240);
        }, flashDelay);
      }
    } else {
      gem.classList.add(logoClickCount === 1 ? "gem-charge-1" : "gem-charge-2");
      logoClickTimer = setTimeout(() => {
        logoClickCount = 0;
        gem.classList.remove("gem-charge-1", "gem-charge-2");
      }, 900);
    }
  });

  // 首頁 3D 立體懸浮晶塊標本節流追蹤 (rAF 節流，僅新版介面啟用)
  let pickerTiltRaf = null;
  let pendingTiltEvent = null;
  els.pickerGrid?.addEventListener("pointermove", (e) => {
    if (state.legacyUI || e.pointerType !== "mouse") return;
    pendingTiltEvent = e;
    if (pickerTiltRaf !== null) return;
    pickerTiltRaf = global.requestAnimationFrame(() => {
      pickerTiltRaf = null;
      const ev = pendingTiltEvent;
      pendingTiltEvent = null;
      if (!ev) return;
      const card = ev.target.closest?.(".crop-pedestal-3d");
      if (!card) return;
      const r = card.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const nx = (ev.clientX - r.left) / r.width - 0.5;
      const ny = (ev.clientY - r.top) / r.height - 0.5;
      card.style.setProperty("--card-rx", `${(-ny * 22).toFixed(2)}deg`);
      card.style.setProperty("--card-ry", `${(nx * 22).toFixed(2)}deg`);
      card.style.setProperty("--card-mx", `${((nx + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty("--card-my", `${((ny + 0.5) * 100).toFixed(1)}%`);
    });
  }, { passive: true });

  els.pickerGrid?.addEventListener("pointerout", (e) => {
    const card = e.target.closest?.(".crop-pedestal-3d, .crop-card-3d");
    if (card && !card.contains(e.relatedTarget)) {
      card.style.removeProperty("--card-rx");
      card.style.removeProperty("--card-ry");
      card.style.removeProperty("--card-mx");
      card.style.removeProperty("--card-my");
    }
  }, { passive: true });

  els.pickerGrid?.addEventListener("pointerover", (e) => {
    if (e.pointerType !== "mouse" || state.view !== "picker") return;
    const card = e.target.closest?.(".crop-pedestal-3d, .crop-legacy-item, .crop-card-3d");
    if (!card) return;
    const crop = state.crops.find((c) => c.name === card.dataset.crop);
    if (crop) global.AstralScene3D?.setDominantMood(crop.quality);
  }, { passive: true });

  global.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      [els.disclaimerModal, els.changelogModal, els.blacklistModal, els.settingsModal, els.switchGuideModal]
        .forEach((m) => { if (m?.classList.contains("active")) closeModal(m); });
    }
  });

  function reconcileCustomMutationLayout(savedLayout) {
    if (!Array.isArray(savedLayout) || savedLayout.length === 0) return false;
    const defaultLayout = getDefaultMutationLayout();
    const metaByName = new Map();
    const orderedActive = [];

    defaultLayout.forEach((defCat) => {
      const muts = defCat.mutations || [];
      muts.forEach((mName, idx) => {
        const prevAnchors = [];
        for (let i = idx - 1; i >= 0; i--) prevAnchors.push(muts[i]);
        const nextAnchors = [];
        for (let i = idx + 1; i < muts.length; i++) nextAnchors.push(muts[i]);
        metaByName.set(mName, { defaultCatId: defCat.id, defIdx: idx, prevAnchors, nextAnchors });
        orderedActive.push(mName);
      });
    });

    (global.GAME_DATA?.mutations || []).forEach((m) => {
      if (m && m.isActive !== false && !metaByName.has(m.name)) {
        orderedActive.push(m.name);
      }
    });

    const activeSet = new Set(
      (global.GAME_DATA?.mutations || [])
        .filter((m) => m && m.isActive !== false)
        .map((m) => m.name)
    );

    const present = new Set(
      savedLayout.flatMap((c) => (Array.isArray(c?.mutations) ? c.mutations : []))
    );

    let changed = false;
    orderedActive.forEach((mName) => {
      if (activeSet.size > 0 && !activeSet.has(mName)) return;
      if (present.has(mName)) return;
      changed = true;

      const meta = metaByName.get(mName);
      const targetCat = meta ? savedLayout.find((c) => c && c.id === meta.defaultCatId) : null;

      if (targetCat) {
        if (!Array.isArray(targetCat.mutations)) targetCat.mutations = [];
        let inserted = false;

        // 1. 優先緊鄰預設前後錨點（例如火燒雲優先插在「星环」後面或「幽幽南瓜」前面）
        if (meta.prevAnchors.length > 0) {
          const idx = targetCat.mutations.indexOf(meta.prevAnchors[0]);
          if (idx !== -1) {
            targetCat.mutations.splice(idx + 1, 0, mName);
            inserted = true;
          }
        }
        if (!inserted && meta.nextAnchors.length > 0) {
          const idx = targetCat.mutations.indexOf(meta.nextAnchors[0]);
          if (idx !== -1) {
            targetCat.mutations.splice(idx, 0, mName);
            inserted = true;
          }
        }
        if (!inserted) {
          for (const prev of meta.prevAnchors) {
            const idx = targetCat.mutations.indexOf(prev);
            if (idx !== -1) {
              targetCat.mutations.splice(idx + 1, 0, mName);
              inserted = true;
              break;
            }
          }
        }
        if (!inserted) {
          for (const nxt of meta.nextAnchors) {
            const idx = targetCat.mutations.indexOf(nxt);
            if (idx !== -1) {
              targetCat.mutations.splice(idx, 0, mName);
              inserted = true;
              break;
            }
          }
        }
        // 若該分類保留但找不到任何錨點詞條，則依預設首尾位置插入
        if (!inserted) {
          if (meta.defIdx === 0) targetCat.mutations.unshift(mName);
          else targetCat.mutations.push(mName);
        }
      } else {
        // 2. 若預設分類已被刪除或大改，統一加入第一個分類的第一個位置 (index 0)
        if (!Array.isArray(savedLayout[0].mutations)) savedLayout[0].mutations = [];
        savedLayout[0].mutations.unshift(mName);
      }

      present.add(mName);
    });

    return changed;
  }

  /* --------------------------------------------------------------------------
   * 讀取記憶設定並啟動
   * -------------------------------------------------------------------------- */
  try {
    const savedSound = localStorage.getItem(KEYS.SOUND);
    if (savedSound !== null) state.soundEnabled = savedSound === "true";

    const savedTheme = localStorage.getItem(KEYS.THEME);
    state.theme = savedTheme === "light" ? "light" : "dark";

    const savedQuality = localStorage.getItem(KEYS.GRAPHICS);
    state.graphicsQuality = ["ultra", "high", "smooth"].includes(savedQuality)
      ? savedQuality
      : "smooth";

    state.legacyUI = localStorage.getItem(KEYS.LEGACY_UI) === "true";

    const savedCompare = localStorage.getItem(KEYS.COMPARE);
    if (savedCompare !== null) state.showComparison = savedCompare === "true";

    const savedSortMode = localStorage.getItem(KEYS.SORT_MODE);
    if (savedSortMode === "quality" || savedSortMode === "price") state.sortMode = savedSortMode;

    const savedSortDir = localStorage.getItem(KEYS.SORT_DIR);
    if (savedSortDir === "asc" || savedSortDir === "desc") state.sortDirection = savedSortDir;

    const savedDecimals = localStorage.getItem(KEYS.DECIMALS);
    state.allowExtraDecimals = savedDecimals === "true";
    els.allowExtraDecimalsToggle.checked = state.allowExtraDecimals;

    const savedAutoClear2 = localStorage.getItem(KEYS.AUTOCLEAR_2);
    state.autoClear2 = savedAutoClear2 !== null ? savedAutoClear2 === "true" : true;
    if (els.autoClear2Toggle) els.autoClear2Toggle.checked = state.autoClear2;

    const savedAutoClearMore = localStorage.getItem(KEYS.AUTOCLEAR_MORE);
    state.autoClearMore = savedAutoClearMore === "true";
    if (els.autoClearMoreToggle) els.autoClearMoreToggle.checked = state.autoClearMore;
    updateAutoClearToggleVisibility();

    const savedPriceDec = Number(localStorage.getItem(KEYS.PRICE_DECIMALS));
    if (savedPriceDec >= 2 && savedPriceDec <= 6) state.priceDigits = savedPriceDec;
    updateValPrecMenuUI();

    const savedCmpDec = Number(localStorage.getItem(KEYS.COMPARE_PRICE_DECIMALS));
    if (savedCmpDec >= 2 && savedCmpDec <= 6) state.comparePriceDigits = savedCmpDec;
    updateCompareValPrecMenuUI();

    const savedGyro = localStorage.getItem(KEYS.GYRO);
    state.gyroEnabled = savedGyro !== null ? savedGyro === "true" : true;
    if (els.settingGyroToggle) els.settingGyroToggle.checked = state.gyroEnabled;

    state.hideTip = localStorage.getItem(KEYS.HIDE_TIP) === "true";
    state.hideCalcTip = localStorage.getItem(KEYS.HIDE_CALC_TIP) === "true";
    updateHideTipVisibility();

    const savedCustom = localStorage.getItem(KEYS.CUSTOM_MUTATIONS);
    if (savedCustom) {
      const parsed = JSON.parse(savedCustom);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (reconcileCustomMutationLayout(parsed)) {
          try { localStorage.setItem(KEYS.CUSTOM_MUTATIONS, JSON.stringify(parsed)); } catch (err) {}
        }
        state.customMutationLayout = parsed;
      }
    }
    updateSettingsCustomOrderUI();
  } catch (e) {}

  state.crops = [...(global.GAME_DATA?.crops || [])].sort(compareCropsForPicker);
  state.mutations = global.GAME_DATA?.mutations || [];
  state.selectedCropName = state.crops[0]?.name || "";

  // 初始化 3D 場景與 UI
  global.AstralScene3D?.init({
    canvasId: "quantumCanvas3D",
    theme: state.theme,
    quality: state.graphicsQuality,
    parallax: state.gyroEnabled,
    legacy: state.legacyUI
  });
  applyTheme(state.theme, false);
  applyGraphicsQuality(state.graphicsQuality, false);
  applyLegacyUI(state.legacyUI, false);
  updateDeviceSpecificUI();
  setView("picker");
  renderAll();
})(window);
