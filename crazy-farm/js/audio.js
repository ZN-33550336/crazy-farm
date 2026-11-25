/* ============================================================================
 * 瘋狂農場•果實計算器 — 工作室級程序化空間音效引擎 (Web Audio API + 殘響)
 * ============================================================================ */
(function (global) {
  "use strict";

  let ctx = null;
  let masterGain = null;
  let dryGain = null;
  let wetGain = null;
  let unlocked = false;
  let noteStep = 0;

  // 五聲音階頻率輪轉，讓快速點選詞條聽起來像悅耳的水晶琴韻，不會單調刺耳
  const CRYSTAL_SCALE = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];

  function isSoundAllowed() {
    if (typeof global.getSoundEnabled === "function") {
      return global.getSoundEnabled();
    }
    return true;
  }

  function createImpulseResponse(audioCtx, duration = 0.42, decay = 3.2) {
    const sampleRate = audioCtx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const impulse = audioCtx.createBuffer(2, length, sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        const env = Math.pow(1 - i / length, decay);
        data[i] = (Math.random() * 2 - 1) * env * 0.5;
      }
    }
    return impulse;
  }

  function ensureAudioGraph() {
    if (!ctx) {
      const AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (!masterGain && ctx) {
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -16;
      compressor.knee.value = 18;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.004;
      compressor.release.value = 0.14;

      masterGain = ctx.createGain();
      masterGain.gain.value = 0.72;

      dryGain = ctx.createGain();
      dryGain.gain.value = 0.85;

      wetGain = ctx.createGain();
      wetGain.gain.value = 0.22;

      try {
        const convolver = ctx.createConvolver();
        convolver.buffer = createImpulseResponse(ctx);
        masterGain.connect(dryGain);
        masterGain.connect(convolver);
        convolver.connect(wetGain);
        dryGain.connect(compressor);
        wetGain.connect(compressor);
        compressor.connect(ctx.destination);
      } catch (e) {
        masterGain.connect(compressor);
        compressor.connect(ctx.destination);
      }
    }
    return ctx;
  }

  function unlock() {
    const c = ensureAudioGraph();
    if (!c) return;
    if (c.state === "suspended") {
      c.resume().catch(() => {});
    }
    unlocked = true;
  }

  function playTone(freq, {
    type = "sine",
    duration = 0.12,
    gain = 0.12,
    attack = 0.004,
    endFreq = null,
    delay = 0
  } = {}) {
    if (!isSoundAllowed()) return;
    const c = ensureAudioGraph();
    if (!c || !masterGain) return;
    if (c.state === "suspended") {
      c.resume().catch(() => {});
    }

    const now = c.currentTime + delay;
    const osc = c.createOscillator();
    const env = c.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq && endFreq > 0) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    }

    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(gain, now + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(env);
    env.connect(masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  const AstraAudio = {
    unlock,

    /* 輕快立體玻璃鍵盤點擊 */
    tap(baseFreq = 760) {
      playTone(baseFreq, { type: "triangle", duration: 0.048, gain: 0.085, endFreq: baseFreq * 0.72 });
      playTone(baseFreq * 2.1, { type: "sine", duration: 0.036, gain: 0.032 });
    },
    click(baseFreq = 760) {
      this.tap(baseFreq);
    },

    /* 詞條選取：清脆水晶和弦共鳴（五聲音階自動輪替） */
    activate() {
      const root = CRYSTAL_SCALE[noteStep % CRYSTAL_SCALE.length];
      noteStep = (noteStep + 1) % CRYSTAL_SCALE.length;
      playTone(root, { type: "sine", duration: 0.14, gain: 0.11 });
      playTone(root * 1.5, { type: "triangle", duration: 0.16, gain: 0.05, delay: 0.018 });
      playTone(root * 2.756, { type: "sine", duration: 0.09, gain: 0.022, delay: 0.01 });
    },

    /* 取消／清空：溫潤低頻玻璃收斂 */
    cancel() {
      playTone(392, { type: "triangle", duration: 0.11, gain: 0.085, endFreq: 246.94 });
      playTone(587.33, { type: "sine", duration: 0.07, gain: 0.03, endFreq: 329.63 });
    },

    /* 選擇作物進入工作區：星穹雙層琶音 */
    selectCrop() {
      playTone(261.63, { type: "triangle", duration: 0.24, gain: 0.09 });
      playTone(523.25, { type: "sine", duration: 0.20, gain: 0.08, delay: 0.025 });
      playTone(659.25, { type: "sine", duration: 0.22, gain: 0.075, delay: 0.065 });
      playTone(987.77, { type: "sine", duration: 0.28, gain: 0.055, delay: 0.11 });
    },

    /* 開關切換：精密機械雙段撥片 */
    toggle(on = true) {
      const f1 = on ? 620 : 520;
      const f2 = on ? 940 : 380;
      playTone(f1, { type: "triangle", duration: 0.035, gain: 0.075 });
      playTone(f2, { type: "sine", duration: 0.055, gain: 0.065, delay: 0.028 });
    },

    /* 彈窗開啟 / 關閉 */
    modalOpen() {
      playTone(440, { type: "sine", duration: 0.14, gain: 0.07, endFreq: 660 });
      playTone(880, { type: "sine", duration: 0.18, gain: 0.04, delay: 0.03 });
    },
    modalClose() {
      playTone(580, { type: "sine", duration: 0.12, gain: 0.06, endFreq: 340 });
    },

    /* 連擊三次標誌的三段式宇宙超新星交響爆發 (內縮蓄力 -> 重低音爆裂 -> 天穹餘韻) */
    supernova() {
      if (!isSoundAllowed()) return;
      // Stage 1 (0 ~ 0.75s): 能量內縮聚集爬升
      playTone(110, { type: "sine", duration: 0.72, gain: 0.08, endFreq: 330 });
      playTone(220, { type: "triangle", duration: 0.72, gain: 0.05, endFreq: 660 });
      // Stage 2 (0.74s): 深沉宇宙震波爆裂
      playTone(65.41, { type: "sawtooth", duration: 0.85, gain: 0.10, endFreq: 38.0, delay: 0.74 });
      playTone(130.81, { type: "triangle", duration: 0.65, gain: 0.09, endFreq: 55.0, delay: 0.74 });
      // Stage 3 (0.78s+): 燦爛星辰水晶琶音消散
      [261.63, 329.63, 392.0, 493.88, 587.33, 659.25, 783.99, 987.77, 1174.66].forEach((f, idx) => {
        playTone(f, { type: "sine", duration: 0.78, gain: 0.06, delay: 0.78 + idx * 0.065 });
      });
    },

    isUnlocked() {
      return unlocked;
    }
  };

  // 與原程式碼相容的別名
  global.AstraAudio = AstraAudio;
  global.CyberAudio = AstraAudio;
})(window);
