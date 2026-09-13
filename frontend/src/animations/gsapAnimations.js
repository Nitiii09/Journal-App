import gsap from "gsap";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Slow, continuous drift for decorative hero shapes. Runs forever; the
 * returned timeline must be killed on unmount.
 */
export function driftDecor(targets, { amplitude = 24, duration = 9 } = {}) {
  if (prefersReducedMotion() || !targets?.length) return null;

  const tl = gsap.timeline({ repeat: -1, yoyo: true });
  gsap.utils.toArray(targets).forEach((el, i) => {
    tl.to(
      el,
      {
        y: i % 2 === 0 ? -amplitude : amplitude * 0.65,
        x: i % 3 === 0 ? amplitude * 0.4 : -amplitude * 0.3,
        rotate: i % 2 === 0 ? 5 : -4,
        duration: duration + i * 0.8,
        ease: "sine.inOut",
      },
      0
    );
  });
  return tl;
}

/** Parallax: decorative layers trail the cursor at different depths. */
export function attachParallax(container, layers, strength = 22) {
  if (prefersReducedMotion() || !container || !layers?.length) return () => {};

  const setters = layers.map((el) => ({
    x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
    y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
  }));

  const onMove = (event) => {
    const rect = container.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;

    setters.forEach((set, i) => {
      const depth = (i + 1) / setters.length;
      set.x(relX * strength * depth * -1);
      set.y(relY * strength * depth * -1);
    });
  };

  container.addEventListener("mousemove", onMove);
  return () => container.removeEventListener("mousemove", onMove);
}

/**
 * Oversized numerals counting up (streak, entry counts).
 *
 * Reports each frame through `onValue` rather than writing textContent
 * directly — a React re-render would overwrite the DOM and freeze the
 * number at its initial value.
 */
export function countUp(value, onValue, { duration = 1.4, delay = 0.2 } = {}) {
  if (typeof onValue !== "function") return null;

  if (prefersReducedMotion() || !value) {
    onValue(value);
    return null;
  }

  const counter = { n: 0 };
  const tween = gsap.to(counter, {
    n: value,
    duration,
    delay,
    ease: "power3.out",
    onUpdate: () => onValue(Math.round(counter.n)),
    onComplete: () => onValue(value),
  });

  // GSAP is driven by requestAnimationFrame, which browsers pause in
  // background tabs. Without this the number would sit at zero until the
  // tab is focused, so a timer (which still fires) snaps it to the truth.
  const safety = setTimeout(
    () => {
      if (!tween.progress()) onValue(value);
    },
    (delay + duration) * 1000 + 250
  );

  const originalKill = tween.kill.bind(tween);
  tween.kill = (...args) => {
    clearTimeout(safety);
    return originalKill(...args);
  };

  return tween;
}

/**
 * THE SIGNATURE INTERACTION — "DAY UNLOCK".
 *
 * Fires after today's entry saves. The sequence is deliberately theatrical
 * because it marks the one moment the product is built around: your words
 * buy you access to everyone else's.
 *
 *   1. save button compresses          6. lock rotates
 *   2. loading indicator               7. lock opens
 *   3. button becomes a checkmark      8. circular waves expand
 *   4. checkmark settles               9. particles scatter
 *   5. lock icon appears              10. "FRIENDS' DAYS" slides in
 *                                     11. journal cards reveal in sequence
 *
 * `refs` are plain DOM nodes; any missing node is skipped safely.
 */
export function playUnlockSequence(refs = {}, { onComplete } = {}) {
  const {
    button,
    spinner,
    check,
    lockWrap,
    lockShackle,
    waves = [],
    particles = [],
    heading,
    cards = [],
  } = refs;

  // Everything the overlay needs to become visible. If motion is off — or
  // never starts — these must still end up on screen, because the overlay
  // covers the page and an invisible one would trap the user.
  const revealTargets = [lockWrap, heading, ...cards].filter(Boolean);

  const reveal = () =>
    gsap.set(revealTargets, { opacity: 1, y: 0, scale: 1, rotate: 0 });

  if (prefersReducedMotion()) {
    reveal();
    onComplete?.();
    return null;
  }

  const tl = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete });

  // 1 — the button compresses under the press
  if (button) {
    tl.to(button, { scaleX: 0.88, scaleY: 0.82, duration: 0.22, ease: "power2.inOut" });
  }

  // 2 — loading indicator
  if (spinner) {
    tl.fromTo(spinner, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.2 }, "<0.1")
      .to(spinner, { rotate: 360, duration: 0.7, ease: "none" })
      .to(spinner, { opacity: 0, scale: 0.5, duration: 0.18 });
  }

  // 3+4 — button transforms into a checkmark, then settles
  if (check) {
    tl.fromTo(
      check,
      { opacity: 0, scale: 0.3, rotate: -25 },
      { opacity: 1, scale: 1, rotate: 0, duration: 0.42, ease: "back.out(2.4)" },
      "<0.05"
    ).to(check, { scale: 0.92, duration: 0.16, yoyo: true, repeat: 1 });
  }

  // 5 — the lock appears
  if (lockWrap) {
    tl.fromTo(
      lockWrap,
      { opacity: 0, scale: 0.4, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.9)" },
      "+=0.1"
    );
  }

  // 6 — it rotates, weighing the decision
  if (lockWrap) {
    tl.to(lockWrap, { rotate: -14, duration: 0.28, ease: "power2.inOut" })
      .to(lockWrap, { rotate: 10, duration: 0.24, ease: "power2.inOut" })
      .to(lockWrap, { rotate: 0, duration: 0.2 });
  }

  // 7 — the shackle lifts and swings open
  if (lockShackle) {
    tl.to(lockShackle, {
      y: -7,
      rotate: 34,
      transformOrigin: "left bottom",
      duration: 0.42,
      ease: "back.out(2)",
    });
  }

  // 8 — circular waves push outward from the lock
  if (waves.length) {
    tl.fromTo(
      waves,
      { scale: 0.3, opacity: 0.85 },
      {
        scale: 3.4,
        opacity: 0,
        duration: 1.25,
        ease: "power2.out",
        stagger: 0.16,
      },
      "-=0.2"
    );
  }

  // 9 — particles scatter on their own arcs
  if (particles.length) {
    particles.forEach((p, i) => {
      const angle = (i / particles.length) * Math.PI * 2;
      const distance = 110 + Math.random() * 110;
      tl.fromTo(
        p,
        { opacity: 1, x: 0, y: 0, scale: 0 },
        {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          scale: 0.4 + Math.random() * 0.8,
          opacity: 0,
          duration: 1.1 + Math.random() * 0.5,
          ease: "power2.out",
        },
        "-=1.15"
      );
    });
  }

  // 10 — the section heading slides into view
  if (heading) {
    tl.fromTo(
      heading,
      { opacity: 0, y: 48, skewY: 4 },
      { opacity: 1, y: 0, skewY: 0, duration: 0.62 },
      "-=0.55"
    );
  }

  // 11 — friends' entries reveal themselves one after another
  if (cards.length) {
    tl.fromTo(
      cards,
      { opacity: 0, y: 60, rotate: -2, scale: 0.94 },
      {
        opacity: 1,
        y: 0,
        rotate: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.11,
        ease: "back.out(1.4)",
      },
      "-=0.3"
    );
  }

  // requestAnimationFrame is paused in background tabs, which would leave
  // the overlay blank. A timer still fires, so snap it open if the timeline
  // hasn't started by the time it should have finished.
  const safety = setTimeout(() => {
    if (!tl.progress()) {
      reveal();
      onComplete?.();
    }
  }, 6000);

  const originalKill = tl.kill.bind(tl);
  tl.kill = (...args) => {
    clearTimeout(safety);
    return originalKill(...args);
  };

  return tl;
}

/** Frosted lock overlay dissolving as content becomes readable. */
export function dissolveLock(overlay, { onComplete } = {}) {
  if (!overlay) {
    onComplete?.();
    return null;
  }
  if (prefersReducedMotion()) {
    gsap.set(overlay, { opacity: 0, display: "none" });
    onComplete?.();
    return null;
  }

  return gsap.to(overlay, {
    opacity: 0,
    scale: 1.06,
    filter: "blur(14px)",
    duration: 0.75,
    ease: "power2.inOut",
    onComplete: () => {
      gsap.set(overlay, { display: "none" });
      onComplete?.();
    },
  });
}

export { gsap };
