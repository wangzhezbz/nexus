"use client";
import { useEffect, useRef } from "react";

/* 招牌背景：会动的水墨「山海」+ 日月轮转。
   日月沿天弧东升西落、天色昼夜流转、入夜星现；叠加群山·飞鸟·涌浪·锦鲤，整景随鼠标视差。 */
export function Topo() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvEl = ref.current;
    if (!cvEl) return;
    const ctxC = cvEl.getContext("2d");
    if (!ctxC) return;
    const cv = cvEl;     // 非空别名，供闭包内安全使用
    const ctx = ctxC;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, dpr = 1;
    const m = { x: 0.5, y: 0.4, tx: 0.5, ty: 0.4 };
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);
    const onMove = (e: MouseEvent) => { m.tx = e.clientX / window.innerWidth; m.ty = e.clientY / window.innerHeight; };
    window.addEventListener("mousemove", onMove, { passive: true });

    const mix = (a: number[], b: number[], t: number) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    const rgb = (c: number[], al = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${al})`;
    const sstep = (x: number) => { const c = Math.max(0, Math.min(1, x)); return c * c * (3 - 2 * c); }; // 平滑缓动

    const stars = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random() * 0.55, r: Math.random() * 1.3 + 0.3, ph: Math.random() * 6.28, tw: 0.5 + Math.random() }));
    const birds = Array.from({ length: 7 }, () => ({ cx: 0.18 + Math.random() * 0.72, cy: 0.08 + Math.random() * 0.2, rx: 0.05 + Math.random() * 0.09, ry: 0.02 + Math.random() * 0.045, sp: 0.12 + Math.random() * 0.22, ph: Math.random() * 6.28, s: 0.55 + Math.random() * 0.7 }));
    const glide = Array.from({ length: 3 }, () => ({ x: Math.random(), sp: (0.0008 + Math.random() * 0.0012) * (Math.random() < 0.5 ? 1 : -1), depth: 0.18 + Math.random() * 0.5, ph: Math.random() * 6.28, s: 0.8 + Math.random() * 0.6 }));
    const jump = [{ t: -5, dur: 2.8, gap: 9, x0: 0.3, dir: 1 }, { t: -11, dur: 2.8, gap: 12, x0: 0.6, dir: -1 }];

    function ridge(yBase: number, amp: number, freq: number, phase: number, px: number, grad: CanvasGradient) {
      ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 8) { const u = x / W; const y = yBase + Math.sin(u * freq + phase) * amp + Math.sin(u * freq * 2.4 + phase * 1.7) * amp * 0.42 + Math.sin(u * freq * 0.6) * amp * 0.3; ctx.lineTo(x + px, y); }
      ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
    }
    function bird(x: number, y: number, s: number, flap: number, al: number) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.strokeStyle = `rgba(210,224,232,${al})`; ctx.lineWidth = 1.5; ctx.lineCap = "round";
      const w = 5 + Math.sin(flap) * 4.5;
      ctx.beginPath(); ctx.moveTo(-10, 0); ctx.quadraticCurveTo(-4, -w, 0, 1); ctx.quadraticCurveTo(4, -w, 10, 0); ctx.stroke(); ctx.restore();
    }
    function koi(x: number, y: number, dir: number, s: number, sway: number, alpha: number) {
      ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s); ctx.fillStyle = `rgba(150,205,185,${alpha})`;
      ctx.beginPath(); ctx.moveTo(13, 0); ctx.quadraticCurveTo(2, -4.5, -12, -1.5); ctx.quadraticCurveTo(-16, 0, -12, 1.5); ctx.quadraticCurveTo(2, 4.5, 13, 0); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-12, 0); ctx.quadraticCurveTo(-20, -7 + sway, -25, -3 + sway); ctx.quadraticCurveTo(-19, 0, -25, 6 + sway); ctx.quadraticCurveTo(-20, 3 + sway, -12, 0); ctx.fill(); ctx.restore();
    }
    function ripple(x: number, y: number, r: number, alpha: number) { ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.34, 0, 0, Math.PI * 2); ctx.strokeStyle = `rgba(180,225,210,${alpha})`; ctx.lineWidth = 1.2; ctx.stroke(); }

    const CYCLE = 34; // 一整轮日夜的秒数
    let raf = 0, t = 0, cyc = 0.12;
    function frame() {
      const dt = reduce ? 0 : 0.016; t += dt; cyc = (cyc + dt / CYCLE) % 1;
      m.x += (m.tx - m.x) * 0.05; m.y += (m.ty - m.y) * 0.05;
      const pxBack = (m.x - 0.5) * 34, pxMid = (m.x - 0.5) * 66, pyBob = (m.y - 0.5) * 16;
      const horizonY = H * 0.64;

      // —— 日月轮转（统一连续模型：靠高度渐隐渐现，交班平滑）——
      const sunAlt = Math.sin(cyc * Math.PI * 2);          // >0 昼 / <0 夜
      const moonAlt = -sunAlt;
      const daylight = Math.max(0, sunAlt);
      const twilight = sstep((0.62 - Math.abs(sunAlt)) / 0.62); // 朝晚霞：更宽、平滑淡入淡出
      const moonGlow = sstep((0.6 - Math.abs(moonAlt)) / 0.6);  // 月升月落的银辉
      const moonUp = Math.max(0, moonAlt);
      const sunAlpha = Math.min(1, Math.max(0, sunAlt / 0.14));   // 近地平线淡出
      const moonAlpha = Math.min(1, Math.max(0, moonAlt / 0.14));
      // 方位角连续：日出东(左)→日落西(右)；月相反，且全程连续不跳变
      const sunX = (0.5 - 0.5 * Math.cos(cyc * Math.PI * 2)) * W + pxBack * 0.6;
      const sunY = horizonY - Math.max(0, sunAlt) * (H * 0.52) + pyBob * 0.4;
      const moonX = (0.5 - 0.5 * Math.cos((cyc + 0.5) * Math.PI * 2)) * W + pxBack * 0.6;
      const moonY = horizonY - Math.max(0, moonAlt) * (H * 0.52) + pyBob * 0.4;

      ctx.clearRect(0, 0, W, H);

      // 天色：夜↔昼渐变 + 地平线暖霞
      // 天色基底（昼夜）
      let topC = mix([9, 12, 19], [22, 44, 56], daylight);
      let horC = mix([12, 18, 23], [54, 86, 88], daylight);
      // 夜里月色偏冷银
      topC = mix(topC, [26, 34, 52], moonUp * 0.5);
      horC = mix(horC, [34, 46, 64], moonUp * 0.45);
      // 朝晚霞：整片天色自然染暖（地平线橙 → 中段玫瑰紫），smoothstep 平滑
      horC = mix(horC, [234, 122, 64], twilight * 0.85);
      const midC = mix(mix(topC, horC, 0.5), [196, 96, 120], twilight * 0.5);
      const sky = ctx.createLinearGradient(0, 0, 0, horizonY + 40);
      sky.addColorStop(0, rgb(topC));
      sky.addColorStop(0.52, rgb(midC));
      sky.addColorStop(0.84, rgb(horC));
      sky.addColorStop(1, rgb([8, 11, 14]));
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, horizonY + 40);
      // 太阳侧暖光团（强调日出/日落方位）
      if (twilight > 0.01) {
        const wg = ctx.createRadialGradient(sunX, horizonY + 10, 0, sunX, horizonY + 10, 520);
        wg.addColorStop(0, `rgba(246,166,104,${0.5 * twilight})`);
        wg.addColorStop(0.5, `rgba(220,120,86,${0.2 * twilight})`);
        wg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = wg; ctx.fillRect(0, 0, W, horizonY + 60);
      }
      // 月升月落：地平线冷银辉（绑月亮方位）
      if (moonGlow > 0.01) {
        const mgw = ctx.createRadialGradient(moonX, horizonY + 10, 0, moonX, horizonY + 10, 460);
        mgw.addColorStop(0, `rgba(172,198,226,${0.32 * moonGlow})`);
        mgw.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = mgw; ctx.fillRect(0, 0, W, horizonY + 60);
      }

      // 星辰（夜里浮现，闪烁）
      const starA = Math.max(0, 1 - daylight * 2.4);
      if (starA > 0.01) for (const s of stars) { const a = starA * (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * s.tw + s.ph))); ctx.beginPath(); ctx.arc(s.x * W + pxBack * 0.3, s.y * horizonY, s.r, 0, 6.28); ctx.fillStyle = `rgba(225,235,245,${a})`; ctx.fill(); }

      // 太阳（高度淡入淡出）
      if (sunAlpha > 0.01) {
        const gl = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 150);
        gl.addColorStop(0, `rgba(255,214,150,${0.5 * sunAlpha})`); gl.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(sunX, sunY, 150, 0, 6.28); ctx.fill();
        ctx.beginPath(); ctx.arc(sunX, sunY, 30, 0, 6.28); ctx.fillStyle = `rgba(255,228,178,${0.95 * sunAlpha})`; ctx.fill();
      }
      // 月亮（高度淡入淡出 + 月华光环 + 环形山）
      if (moonAlpha > 0.01) {
        const halo = ctx.createRadialGradient(moonX, moonY, 18, moonX, moonY, 190);
        halo.addColorStop(0, `rgba(190,212,236,${0.22 * moonAlpha})`);
        halo.addColorStop(0.5, `rgba(150,180,220,${0.08 * moonAlpha})`);
        halo.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(moonX, moonY, 190, 0, 6.28); ctx.fill();
        const gl = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 90);
        gl.addColorStop(0, `rgba(208,224,240,${0.5 * moonAlpha})`); gl.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(moonX, moonY, 90, 0, 6.28); ctx.fill();
        ctx.beginPath(); ctx.arc(moonX, moonY, 22, 0, 6.28); ctx.fillStyle = `rgba(228,236,244,${0.92 * moonAlpha})`; ctx.fill();
        ctx.fillStyle = `rgba(18,24,30,${0.28 * moonAlpha})`;
        [[-7, -5, 5], [6, 3, 4], [-2, 8, 3]].forEach(([cx, cy, r]) => { ctx.beginPath(); ctx.arc(moonX + cx, moonY + cy, r, 0, 6.28); ctx.fill(); });
      }

      // 群山（受光：白昼略亮）
      const ml = 0.12 + daylight * 0.12;
      const g1 = ctx.createLinearGradient(0, H * 0.16, 0, H * 0.62); g1.addColorStop(0, rgb(mix([150, 188, 174], [180, 205, 195], daylight), ml + 0.02)); g1.addColorStop(1, "rgba(150,188,174,0)");
      ridge(H * 0.30 + pyBob, H * 0.12, 5.5, 0.6, pxBack, g1);
      const g2 = ctx.createLinearGradient(0, H * 0.30, 0, H * 0.74); g2.addColorStop(0, rgb(mix([110, 162, 144], [150, 190, 170], daylight), ml + 0.10)); g2.addColorStop(1, "rgba(110,162,144,0)");
      ridge(H * 0.48 + pyBob * 1.7, H * 0.15, 4, 2.2, pxMid, g2);

      // 海：水体 + 层叠涌浪 + 浪尖反光（夜里反光偏冷，日间偏暖）
      const sg = ctx.createLinearGradient(0, horizonY, 0, H); sg.addColorStop(0, rgb(mix([60, 116, 102], [90, 150, 130], daylight), 0.13)); sg.addColorStop(1, "rgba(8,12,14,0)");
      ctx.fillStyle = sg; ctx.fillRect(0, horizonY, W, H - horizonY);
      const waveAt = (x: number, baseY: number, amp: number, spd: number, i: number) => { const u = x / W; return baseY + Math.sin(u * 6.5 + t * spd + i) * amp + Math.sin(u * 16 - t * spd * 0.7) * amp * 0.4 + pyBob; };
      const crest = mix([185, 228, 213], [255, 230, 190], twilight * 0.6);
      for (let i = 0; i < 4; i++) {
        const baseY = horizonY + i * (H * 0.055), amp = 7 + i * 4, spd = 0.55 + i * 0.16;
        ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, waveAt(0, baseY, amp, spd, i));
        for (let x = 0; x <= W; x += 10) ctx.lineTo(x, waveAt(x, baseY, amp, spd, i));
        ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = `rgba(96,150,134,${0.06 + i * 0.03})`; ctx.fill();
        ctx.beginPath(); for (let x = 0; x <= W; x += 10) { const y = waveAt(x, baseY, amp, spd, i); x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.strokeStyle = rgb(crest, 0.14 - i * 0.025); ctx.lineWidth = 1.3; ctx.stroke();
      }
      // 日月在海面的倒影：随波闪烁的光带（非矩形）
      const drawReflection = (rx: number, col: number[], a: number) => {
        if (a <= 0.01 || rx < -60 || rx > W + 60) return;
        // 水面光晕（柔和椭圆）
        const pool = ctx.createRadialGradient(rx, horizonY + 6, 0, rx, horizonY + 6, 70);
        pool.addColorStop(0, rgb(col, 0.16 * a)); pool.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = pool; ctx.beginPath(); ctx.ellipse(rx, horizonY + 6, 70, 16, 0, 0, 6.28); ctx.fill();
        // 向下的碎光：一段段横线随波摆动、越远越淡越短
        for (let y = horizonY + 6; y < H; y += 7) {
          const d = (y - horizonY) / (H - horizonY);
          const wob = Math.sin(y * 0.18 + t * 2.2) * (6 + d * 22);
          const len = (24 - d * 16) * (0.6 + 0.4 * Math.sin(y * 0.5 + t * 3));
          const seg = a * (1 - d) * (0.18 + 0.12 * Math.sin(y * 0.7 + t * 4));
          if (seg <= 0) continue;
          ctx.strokeStyle = rgb(col, Math.max(0, seg)); ctx.lineWidth = 1.4; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(rx + wob - len / 2, y); ctx.lineTo(rx + wob + len / 2, y); ctx.stroke();
        }
      };
      drawReflection(sunX, [255, 214, 150], sunAlpha);
      drawReflection(moonX, [205, 222, 236], moonAlpha);

      // 锦鲤：水下游弋
      for (const f of glide) { if (!reduce) f.x += f.sp; if (f.x > 1.15) f.x = -0.15; if (f.x < -0.15) f.x = 1.15; const gx = f.x * W, gy = horizonY + f.depth * (H - horizonY) + Math.sin(t * 0.5 + f.ph) * 7 + pyBob; koi(gx, gy, f.sp >= 0 ? 1 : -1, f.s, Math.sin(t * 4 + f.ph) * 3, 0.14); }
      // 偶尔跃出 + 涟漪
      for (const f of jump) {
        f.t += dt;
        if (f.t > 0 && f.t < f.dur) { const p = f.t / f.dur; const fx = (f.x0 + p * 0.28 * f.dir) * W + pxMid * 0.4; const fy = horizonY - Math.sin(p * Math.PI) * 78 + pyBob; ctx.save(); ctx.translate(fx, fy); ctx.rotate(Math.cos(p * Math.PI) * 0.85 * f.dir); koi(0, 0, f.dir, 1.15, Math.sin(t * 10) * 2.5, 0.42); ctx.restore(); if (p < 0.12 || p > 0.88) ripple((f.x0 + (p > 0.5 ? 0.28 : 0) * f.dir) * W, horizonY + pyBob, 14 + (p > 0.88 ? (p - 0.88) * 240 : (0.12 - p) * 240), 0.18); }
        else if (f.t > f.dur + f.gap) { f.t = 0; f.gap = 9 + Math.random() * 8; f.x0 = 0.2 + Math.random() * 0.5; f.dir = Math.random() < 0.5 ? 1 : -1; }
      }

      // 盘旋飞鸟（夜里更淡）
      const birdA = 0.4 + daylight * 0.25;
      for (const b of birds) { const a = t * b.sp + b.ph; const bx = b.cx * W + Math.cos(a) * b.rx * W + pxBack * 1.6; const by = b.cy * H + Math.sin(a) * b.ry * H + pyBob * 0.5; bird(bx, by, b.s, t * 7 + b.ph, birdA); }

      raf = requestAnimationFrame(frame);
    }
    frame();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", onMove); };
  }, []);

  return <canvas ref={ref} className="topo" aria-hidden="true" />;
}
