/* ============================================================================
 * 瘋狂農場•果實計算器 — 商業級客製 GLSL Shaders 庫
 * 包含：skyDome (星海極光/藍天晴空)、spiralGalaxy (4旋臂璀璨星系)、
 *       saturnRing (宇宙星環)、planetAtmo (行星大氣)、supernovaBurst (三段超新星爆發)、
 *       cloudSea、crystalCore、energyRingRibbon、stardustBokeh、shockwaveRing
 * ============================================================================ */
(function (global) {
  "use strict";

  const NOISE_GLSL = /* glsl */ `
    float hash21(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float noise2(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      float a = hash21(i);
      float b = hash21(i + vec2(1.0, 0.0));
      float c = hash21(i + vec2(0.0, 1.0));
      float d = hash21(i + vec2(1.0, 1.0));
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    float fbm2(vec2 p) {
      float v = 0.0;
      float a = 0.54;
      mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
      for (int i = 0; i < 3; i++) {
        v += a * noise2(p);
        p = rot * p * 2.03 + vec2(17.1, 31.7);
        a *= 0.5;
      }
      return v;
    }

    float fbm2Fast(vec2 p) {
      mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
      float v = 0.62 * noise2(p);
      p = rot * p * 2.05 + vec2(17.1, 31.7);
      v += 0.34 * noise2(p);
      return v;
    }
  `;

  global.ASTRAL_SHADERS = {
    /* 1. 深空絢麗星雲極光 / 淺色藍天星穹穹頂 */
    skyDome: {
      vertexShader: /* glsl */ `
        varying vec3 vWorldDir;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldDir = normalize(position);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uLightMode;
        uniform vec3 uMoodPrimary;
        uniform vec3 uMoodSecondary;
        uniform float uPulseBoost;
        varying vec3 vWorldDir;

        ${NOISE_GLSL}

        void main() {
          vec3 dir = normalize(vWorldDir);
          float horizon = smoothstep(-0.12, 0.48, dir.y);
          float zenith = smoothstep(0.16, 0.92, dir.y);

          // --- Dark Palette: Deep Multi-Layer Cosmic Nebula & Starfield ---
          vec3 dZenith  = vec3(0.012, 0.022, 0.068);
          vec3 dMid     = vec3(0.026, 0.068, 0.148);
          vec3 dHorizon = mix(vec3(0.065, 0.130, 0.220), uMoodPrimary * 0.26, 0.38);
          vec3 darkSky  = mix(dHorizon, dMid, horizon);
          darkSky       = mix(darkSky, dZenith, zenith);

          // 銀河星雲帶 (斜切天際的絢麗紫青金星塵)
          vec2 nebUv = vec2(dir.x * 2.2 + dir.y * 1.4, dir.z * 2.2 - dir.y * 1.1);
          float nebA = fbm2(nebUv * 1.6 + vec2(uTime * 0.01, -uTime * 0.008));
          float nebB = fbm2Fast(nebUv * 3.1 - vec2(uTime * 0.012, uTime * 0.009));
          float galacticBand = smoothstep(0.32, 0.85, nebA * 0.65 + nebB * 0.35);
          vec3 nebCol = mix(vec3(0.12, 0.36, 0.58), vec3(0.45, 0.18, 0.62), nebB);
          nebCol = mix(nebCol, uMoodSecondary * 0.85, smoothstep(0.55, 0.85, nebA) * 0.45);
          darkSky += nebCol * galacticBand * 0.34;

          // 雙層閃爍星辰
          if (dir.y > -0.25) {
            vec2 starUv1 = dir.xz / (abs(dir.y) + 0.55) * 48.0;
            vec2 cell1 = floor(starUv1);
            vec2 gv1 = fract(starUv1) - 0.5;
            float rnd1 = hash21(cell1);
            if (rnd1 > 0.82) {
              vec2 off1 = vec2(hash21(cell1 + 7.1), hash21(cell1 + 13.7)) - 0.5;
              float d1 = length(gv1 - off1 * 0.65);
              float tw1 = 0.60 + 0.40 * sin(uTime * (1.8 + rnd1 * 3.2) + rnd1 * 40.0);
              float s1 = smoothstep(0.09, 0.0, d1) * tw1;
              vec3 st1 = mix(vec3(0.75, 0.92, 1.0), vec3(1.0, 0.88, 0.66), fract(rnd1 * 19.3));
              darkSky += st1 * s1 * 1.05;
            }
          }

          // 極光光幕
          if (dir.y > 0.0) {
            vec2 aUv = vec2(atan(dir.z, dir.x) * 1.5, dir.y * 3.0);
            float w1 = fbm2(vec2(aUv.x * 1.8 + uTime * 0.035, aUv.y * 0.9 - uTime * 0.02));
            float w2 = fbm2Fast(vec2(aUv.x * 3.1 - uTime * 0.025, aUv.y * 1.3 + uTime * 0.015));
            float curtain = smoothstep(0.45, 0.78, w1 * 0.65 + w2 * 0.35);
            float hMask = smoothstep(0.02, 0.22, dir.y) * smoothstep(0.85, 0.28, dir.y);
            vec3 auroraCol = mix(uMoodPrimary, uMoodSecondary, w2);
            darkSky += auroraCol * curtain * hMask * (0.45 + uPulseBoost * 0.35);
          }

          // --- Light Palette: Crisp Daytime Royal-Sapphire Sky (clamped <= 0.88) ---
          vec3 lZenith  = vec3(0.08, 0.28, 0.62);
          vec3 lMid     = vec3(0.26, 0.56, 0.84);
          vec3 lHorizon = vec3(0.66, 0.76, 0.85);
          vec3 lightSky = mix(lHorizon, lMid, horizon);
          lightSky      = mix(lightSky, lZenith, zenith);

          vec3 sunDir = normalize(vec3(0.45, 0.46, -0.76));
          float sunDot = max(dot(dir, sunDir), 0.0);
          float sunHalo = pow(sunDot, 10.0) * 0.14 + pow(sunDot, 72.0) * 0.28;
          lightSky += vec3(0.95, 0.88, 0.72) * sunHalo;

          if (dir.y > 0.02) {
            vec2 cUv = dir.xz / (dir.y + 0.35) * 1.6 + vec2(uTime * 0.012, uTime * 0.006);
            float cirrus = smoothstep(0.55, 0.84, fbm2Fast(cUv));
            lightSky = mix(lightSky, vec3(0.90, 0.93, 0.97), cirrus * 0.24 * smoothstep(0.02, 0.25, dir.y));
          }
          lightSky = min(lightSky, vec3(0.88));

          vec3 col = mix(darkSky, lightSky, uLightMode);
          float abyss = smoothstep(0.05, -0.45, dir.y);
          vec3 abyssDark = vec3(0.010, 0.018, 0.048);
          vec3 abyssLight = vec3(0.42, 0.56, 0.74);
          col = mix(col, mix(abyssDark, abyssLight, uLightMode), abyss);

          gl_FragColor = vec4(col, 1.0);
        }
      `
    },

    /* 2. 滿天 4 旋臂絢麗星辰星系 (Full-Sky Spiral Galaxy) */
    spiralGalaxy: {
      vertexShader: /* glsl */ `
        attribute float aSize;
        attribute vec3 aColor;
        attribute float aPhase;
        uniform float uTime;
        uniform float uPixelRatio;
        varying vec3 vColor;
        varying float vTwinkle;
        void main() {
          vColor = aColor;
          vTwinkle = 0.65 + 0.35 * sin(uTime * 2.1 + aPhase * 12.56);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = clamp(aSize * uPixelRatio * (165.0 / max(-mvPosition.z, 12.0)), 1.6, 20.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uLightMode;
        uniform float uPulseBoost;
        varying vec3 vColor;
        varying float vTwinkle;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float core = pow(1.0 - d * 2.0, 2.4);
          float halo = pow(1.0 - d * 2.0, 1.2) * 0.45;
          vec3 lightTint = mix(vec3(0.96, 0.85, 0.58), vec3(0.45, 0.78, 0.98), vColor.b);
          vec3 col = mix(vColor * (1.25 + uPulseBoost * 0.6), lightTint, uLightMode);
          float alpha = (core + halo) * vTwinkle * mix(0.92, 0.34, uLightMode);
          gl_FragColor = vec4(col, alpha);
        }
      `
    },

    /* 3. 土星級寬幅星環 (Planetary Star-Ring around the Palace) */
    saturnRing: {
      vertexShader: /* glsl */ `
        varying vec2 vPos;
        void main() {
          vPos = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uLightMode;
        uniform vec3 uMoodPrimary;
        uniform vec3 uMoodSecondary;
        uniform float uInnerR;
        uniform float uOuterR;
        varying vec2 vPos;

        void main() {
          float r = length(vPos);
          float t = clamp((r - uInnerR) / (uOuterR - uInnerR), 0.0, 1.0);
          float edgeFade = smoothstep(0.0, 0.14, t) * smoothstep(1.0, 0.86, t);

          // 卡西尼環縫與細緻同心晶帶
          float bands = 0.55 + 0.45 * sin(t * 48.0) * cos(t * 17.0);
          float cassiniGap = smoothstep(0.04, 0.10, abs(t - 0.62));
          float angle = atan(vPos.y, vPos.x);
          float sweep = 0.68 + 0.32 * sin(angle * 3.0 - uTime * 0.9 + t * 8.0);

          vec3 colDark = mix(uMoodPrimary, uMoodSecondary, sin(t * 9.0) * 0.5 + 0.5);
          colDark = mix(colDark, vec3(0.95, 0.88, 1.0), bands * 0.32);

          vec3 colLight = mix(vec3(0.78, 0.58, 0.18), vec3(0.12, 0.56, 0.72), t);
          vec3 col = mix(colDark, colLight, uLightMode);

          float alpha = edgeFade * cassiniGap * (0.28 + bands * 0.36) * sweep * mix(0.88, 0.58, uLightMode);
          gl_FragColor = vec4(col, alpha);
        }
      `
    },

    /* 4. 遠景行星與大氣層微光 */
    planetAtmo: {
      vertexShader: /* glsl */ `
        varying vec3 vNormalWorld;
        varying vec3 vViewDir;
        varying vec3 vLocalPos;
        void main() {
          vLocalPos = position;
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vNormalWorld = normalize(mat3(modelMatrix) * normal);
          vViewDir = normalize(cameraPosition - wp.xyz);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform vec3 uRimColor;
        uniform float uLightMode;
        varying vec3 vNormalWorld;
        varying vec3 vViewDir;
        varying vec3 vLocalPos;
        void main() {
          vec3 N = normalize(vNormalWorld);
          vec3 V = normalize(vViewDir);
          vec3 L = normalize(vec3(0.6, 0.5, 0.6));
          float diff = smoothstep(-0.15, 0.85, dot(N, L));
          float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0);
          float band = 0.5 + 0.5 * sin(vLocalPos.y * 4.5 + sin(vLocalPos.x * 2.0) * 0.6);
          vec3 surface = mix(uColorA, uColorB, band);
          vec3 col = surface * (0.22 + diff * 0.85) + uRimColor * fresnel * mix(1.15, 0.65, uLightMode);
          gl_FragColor = vec4(col, 1.0);
        }
      `
    },

    /* 5. 三段式超新星粒子爆發 Shader (內縮聚能 -> 高能引爆 -> 消散) */
    supernovaBurst: {
      vertexShader: /* glsl */ `
        attribute float aSize;
        attribute float aMix;
        uniform float uPixelRatio;
        varying float vMix;
        void main() {
          vMix = aMix;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = clamp(aSize * uPixelRatio * (140.0 / max(-mv.z, 8.0)), 2.0, 28.0);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        uniform float uHeat;
        varying float vMix;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float core = pow(1.0 - d * 2.0, 2.0);
          vec3 hotCol = mix(vec3(1.0, 0.96, 0.82), vec3(0.35, 0.95, 1.0), vMix);
          vec3 coolCol = mix(vec3(0.95, 0.35, 0.78), vec3(0.45, 0.32, 0.98), vMix);
          vec3 col = mix(coolCol, hotCol, uHeat) * 1.4;
          gl_FragColor = vec4(col, core * uOpacity);
        }
      `
    },

    /* 6. 層次體積感雲海 */
    cloudSea: {
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uLightMode;
        uniform vec3 uMoodPrimary;
        uniform vec3 uMoodSecondary;
        uniform float uOpacity;
        varying vec2 vUv;
        varying vec3 vWorldPos;

        ${NOISE_GLSL}

        void main() {
          vec2 p = vWorldPos.xz * 0.014;
          vec2 drift1 = vec2(uTime * 0.016, uTime * 0.008);
          vec2 drift2 = vec2(-uTime * 0.011, uTime * 0.013);

          float n1 = fbm2(p + drift1);
          float n2 = fbm2Fast(p * 2.1 + drift2);
          float density = n1 * 0.65 + n2 * 0.35;

          float nRidge = fbm2Fast(p + drift1 + vec2(0.08, 0.05));
          float ridge = clamp((density - nRidge) * 4.5 + 0.5, 0.0, 1.0);

          float dist = length(vWorldPos.xz);
          float radialFade = smoothstep(210.0, 48.0, dist);
          float cloudMask = smoothstep(0.32, 0.78, density) * radialFade;

          vec3 dBase = vec3(0.032, 0.062, 0.130);
          vec3 dRim  = mix(vec3(0.18, 0.42, 0.58), uMoodPrimary * 0.55 + uMoodSecondary * 0.35, 0.45);
          vec3 darkCol = mix(dBase, dRim, ridge * 0.72);

          vec3 lBase = vec3(0.36, 0.50, 0.68);
          vec3 lRim  = vec3(0.84, 0.87, 0.92);
          vec3 lightCol = mix(lBase, lRim, smoothstep(0.22, 0.84, ridge));

          vec3 col = mix(darkCol, lightCol, uLightMode);
          gl_FragColor = vec4(col, cloudMask * uOpacity);
        }
      `
    },

    /* 7. 中央宇宙神果／虹彩結晶核心 */
    crystalCore: {
      vertexShader: /* glsl */ `
        varying vec3 vNormalWorld;
        varying vec3 vViewDir;
        varying vec3 vLocalPos;
        void main() {
          vLocalPos = position;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vNormalWorld = normalize(mat3(modelMatrix) * normal);
          vViewDir = normalize(cameraPosition - worldPos.xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uLightMode;
        uniform vec3 uPrimaryColor;
        uniform vec3 uSecondaryColor;
        uniform float uIridescence;
        uniform float uGlowIntensity;
        uniform float uPulseBoost;
        varying vec3 vNormalWorld;
        varying vec3 vViewDir;
        varying vec3 vLocalPos;

        ${NOISE_GLSL}

        vec3 spectralRamp(float t) {
          return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
        }

        void main() {
          vec3 N = normalize(vNormalWorld);
          vec3 V = normalize(vViewDir);
          float ndotv = clamp(dot(N, V), 0.0, 1.0);
          float fresnel = pow(1.0 - ndotv, 2.3);

          float veinNoise = fbm2(vLocalPos.xy * 1.45 + vec2(0.0, -uTime * 0.55));
          float vein = smoothstep(0.54, 0.84, veinNoise);

          vec3 L = normalize(vec3(0.5, 0.85, 0.45));
          vec3 H = normalize(L + V);
          float spec = pow(max(dot(N, H), 0.0), 42.0);

          vec3 baseBody = mix(uPrimaryColor * 0.46, uSecondaryColor * 0.72, ndotv * 0.55);
          vec3 iridCol = spectralRamp(fresnel * 1.3 + vLocalPos.y * 0.14 + uTime * 0.16);
          vec3 rimCol = mix(uSecondaryColor, iridCol, uIridescence);

          float glowScale = mix(1.0, 0.74, uLightMode) * uGlowIntensity + uPulseBoost * 0.95;
          vec3 col = baseBody
                   + rimCol * fresnel * 1.65 * glowScale
                   + mix(uPrimaryColor, vec3(1.0), 0.45) * vein * 0.80 * glowScale
                   + vec3(1.0, 0.98, 0.94) * spec * 1.15;

          gl_FragColor = vec4(col, 0.96);
        }
      `
    },

    /* 8. 軌道能量流光帶 */
    energyRingRibbon: {
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uLightMode;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform float uSpeed;
        uniform float uPulseBoost;
        varying vec2 vUv;

        void main() {
          float angle = vUv.x * 6.2831853;
          float wave1 = 0.5 + 0.5 * sin(angle * 3.0 - uTime * uSpeed);
          float wave2 = 0.5 + 0.5 * sin(angle * 7.0 + uTime * (uSpeed * 0.6));
          float pulse = pow(wave1, 3.0) * 0.75 + pow(wave2, 5.0) * 0.45;
          float edge = sin(vUv.y * 3.14159265);
          edge = pow(clamp(edge, 0.0, 1.0), 0.85);

          vec3 col = mix(uColorA, uColorB, wave2);
          float alpha = (0.14 + pulse * 0.68 + uPulseBoost * 0.35) * edge * mix(1.0, 0.62, uLightMode);
          gl_FragColor = vec4(col * (1.1 + pulse * 0.75), alpha);
        }
      `
    },

    /* 9. 景深光斑星塵粒子 */
    stardustBokeh: {
      vertexShader: /* glsl */ `
        attribute float aSize;
        attribute float aPhase;
        attribute float aMix;
        uniform float uTime;
        uniform float uPixelRatio;
        varying float vAlpha;
        varying float vMix;
        void main() {
          vMix = aMix;
          vec3 pos = position;
          pos.y += mod(uTime * (0.35 + aMix * 0.4) + aPhase * 8.0, 48.0) - 24.0;
          pos.x += sin(uTime * 0.35 + aPhase * 6.283) * 0.8;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          float twinkle = 0.45 + 0.55 * sin(uTime * (1.2 + aMix) + aPhase * 12.56);
          vAlpha = twinkle * smoothstep(-150.0, -25.0, mvPosition.z);
          gl_PointSize = clamp(aSize * uPixelRatio * (115.0 / max(-mvPosition.z, 10.0)), 1.5, 22.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uLightMode;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        varying float vAlpha;
        varying float vMix;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float soft = pow(1.0 - d * 2.0, 2.2);
          vec3 darkTint = mix(uColorA, uColorB, vMix);
          vec3 lightTint = mix(vec3(0.88, 0.68, 0.25), vec3(0.15, 0.68, 0.78), vMix);
          vec3 col = mix(darkTint, lightTint, uLightMode);
          float a = soft * vAlpha * mix(0.85, 0.42, uLightMode);
          gl_FragColor = vec4(col, a);
        }
      `
    },

    /* 10. 超新星與選取擴散衝擊波環 */
    shockwaveRing: {
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          float d = abs(vUv.y - 0.5) * 2.0;
          float ring = pow(clamp(1.0 - d, 0.0, 1.0), 2.5);
          gl_FragColor = vec4(uColor * 1.45, ring * uOpacity);
        }
      `
    },

    /* 11. 舊版介面專屬：升級版體積感旋臂星雲星系 (Seamless Volumetric Spiral Galaxy) */
    volumetricGalaxy: {
      vertexShader: /* glsl */ `
        varying vec2 vCentered;
        void main() {
          vCentered = (uv - 0.5) * 2.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uLightMode;
        uniform float uPulseBoost;
        uniform float uLayerOffset;
        varying vec2 vCentered;

        ${NOISE_GLSL}

        void main() {
          vec2 p = vCentered;
          float r = length(p);
          if (r > 0.99) discard;

          float layerAbs = abs(uLayerOffset);
          float twist = 3.1 * log(r + 0.085) - uTime * 0.05 + uLayerOffset * 0.25;
          float cs = cos(twist);
          float sn = sin(twist);
          vec2 tp = vec2(p.x * cs - p.y * sn, p.x * sn + p.y * cs);

          // 雙重有機渦流擾動 (完全以旋轉後的笛卡兒座標取樣，零 atan 接縫)
          float cloudA = fbm2(tp * 3.2 + vec2(uTime * 0.015, uLayerOffset * 3.7));
          float cloudB = fbm2Fast(tp * 6.4 - vec2(uTime * 0.022, -uLayerOffset * 5.1));
          float wisp = fbm2Fast(tp * 10.5 + vec2(cloudA * 1.4, cloudB * 1.4));

          // 主副旋臂結構 (無縫三角函數旋臂)
          float ang = atan(p.y, p.x);
          float phase = ang + twist + (cloudA - 0.5) * 1.65;
          float armMain = pow(0.5 + 0.5 * cos(phase * 2.0), 2.4);
          float armSub  = pow(0.5 + 0.5 * cos(phase * 4.0 + 1.1), 3.0) * 0.55;
          float arms = clamp(armMain + armSub, 0.0, 1.0);

          // 星雲與塵埃暗帶層次
          float dustCarve = smoothstep(0.28, 0.72, cloudB * 0.65 + wisp * 0.35);
          float nebula = (0.28 + arms * 0.92) * smoothstep(0.18, 0.82, cloudA * 0.6 + dustCarve * 0.4);

          // 中心亮核與暈光
          float coreHot = exp(-r * 8.5);
          float coreWarm = exp(-r * 3.4);
          float outerHaze = smoothstep(0.95, 0.20, r) * exp(-r * 1.25);

          // 深色主題色盤 (多彩徑向漸層：暖金白核 -> 琥珀橙 -> 玫瑰洋紅 -> 紫羅蘭 -> 寶石藍 -> 青綠外緣)
          vec3 colCore   = vec3(1.00, 0.93, 0.78);
          vec3 colAmber  = vec3(0.98, 0.58, 0.22);
          vec3 colRose   = vec3(0.90, 0.24, 0.52);
          vec3 colViolet = vec3(0.56, 0.26, 0.92);
          vec3 colBlue   = vec3(0.18, 0.42, 0.98);
          vec3 colCyan   = vec3(0.12, 0.82, 0.86);
          vec3 colTeal   = vec3(0.20, 0.90, 0.58);

          // 依半徑清楚分段的色彩漸層
          vec3 armCol = mix(colAmber, colRose, smoothstep(0.10, 0.28, r));
          armCol = mix(armCol, colViolet, smoothstep(0.26, 0.46, r));
          armCol = mix(armCol, colBlue, smoothstep(0.44, 0.66, r));
          armCol = mix(armCol, colCyan, smoothstep(0.62, 0.86, r));
          // 旋臂內的雲氣局部色偏 (隨旋臂一起轉動，讓自轉更容易看出)
          armCol = mix(armCol, colTeal, smoothstep(0.62, 0.90, cloudA) * smoothstep(0.40, 0.80, r) * 0.45);
          armCol = mix(armCol, colRose, smoothstep(0.64, 0.92, wisp) * smoothstep(0.75, 0.35, r) * 0.35);

          // 旋臂亮度對比加強 (臂與臂間較暗，看得出旋臂形狀與轉動)
          float armBright = 0.30 + arms * 1.05;
          vec3 darkCol = armCol * (nebula * 0.78 * armBright + outerHaze * 0.22)
                       + colAmber * coreWarm * 0.42
                       + colCore * coreHot * (0.80 + uPulseBoost * 0.35);
          darkCol = min(darkCol, vec3(0.95));

          // 淺色主題色盤 (晴空紫藍星霧，避免過曝刺眼)
          vec3 lightArm = mix(vec3(0.84, 0.36, 0.62), vec3(0.54, 0.34, 0.88), smoothstep(0.18, 0.42, r));
          lightArm = mix(lightArm, vec3(0.22, 0.48, 0.92), smoothstep(0.40, 0.66, r));
          lightArm = mix(lightArm, vec3(0.10, 0.66, 0.74), smoothstep(0.64, 0.90, r));
          vec3 lightCol = lightArm * (nebula * 0.65 + outerHaze * 0.25)
                        + vec3(0.92, 0.74, 0.48) * coreWarm * 0.42
                        + vec3(0.94, 0.96, 1.0) * coreHot * 0.48;
          lightCol = min(lightCol, vec3(0.84));

          vec3 finalCol = mix(darkCol, lightCol, uLightMode);
          float edgeFade = smoothstep(0.97, 0.36, r);
          float layerScale = mix(0.92, 0.36, smoothstep(0.0, 1.0, layerAbs));
          float alpha = clamp((nebula * 0.72 + coreWarm * 0.55 + coreHot * 0.85 + outerHaze * 0.25), 0.0, 1.0)
                      * edgeFade * layerScale * mix(1.0, 0.52, uLightMode);

          gl_FragColor = vec4(finalCol, alpha);
        }
      `
    },

    /* 12. 舊版星系專屬：4 芒星綻放深空星場 (Sparkle Deep-Space Starfield) */
    sparkleStar: {
      vertexShader: /* glsl */ `
        attribute float aSize;
        attribute vec3 aColor;
        attribute float aPhase;
        attribute float aSparkle;
        uniform float uTime;
        uniform float uPixelRatio;
        varying vec3 vColor;
        varying float vTwinkle;
        varying float vSparkle;
        void main() {
          vColor = aColor;
          vSparkle = aSparkle;
          vTwinkle = 0.62 + 0.38 * sin(uTime * (1.6 + aPhase * 2.2) + aPhase * 15.7);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = clamp(aSize * uPixelRatio * (150.0 / max(-mvPosition.z, 12.0)), 1.5, 28.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uLightMode;
        uniform float uPulseBoost;
        varying vec3 vColor;
        varying float vTwinkle;
        varying float vSparkle;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;

          float core = pow(max(0.0, 1.0 - d * 2.0), 2.4);
          float halo = pow(max(0.0, 1.0 - d * 2.0), 1.15) * 0.56;
          float rays = 0.0;
          if (vSparkle > 0.82) {
            float rx = exp(-abs(c.y) * 26.0) * exp(-abs(c.x) * 4.5);
            float ry = exp(-abs(c.x) * 26.0) * exp(-abs(c.y) * 4.5);
            rays = (rx + ry) * 0.95;
          }
          vec3 col = mix(vColor * (1.42 + uPulseBoost * 0.5), vColor * 0.85, uLightMode);
          float alpha = clamp(core + halo + rays, 0.0, 1.0) * vTwinkle * mix(0.95, 0.38, uLightMode);
          gl_FragColor = vec4(col, alpha);
        }
      `
    },

    /* 13. 新版星穹宮殿專屬：蒼穹星輝光柱 */
    palaceBeam: {
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          float vFade = smoothstep(0.0, 0.16, vUv.y) * smoothstep(1.0, 0.25, vUv.y);
          float streak = 0.65 + 0.35 * sin(vUv.x * 25.1327 - uTime * 4.5);
          float core = 0.55 + 0.45 * sin(vUv.y * 12.0 - uTime * 6.0);
          vec3 col = mix(uColorA, uColorB, vUv.y) * (1.25 + core * 0.45);
          gl_FragColor = vec4(col, vFade * streak * uOpacity);
        }
      `
    }
  };
})(window);
