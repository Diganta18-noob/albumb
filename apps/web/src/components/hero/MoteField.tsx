"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Raw Three.js — no react-three-fiber, because this is one static point cloud
 * and the reconciler would cost more than it saves.
 *
 * ~900 additive points drifting upward on a slow sine, tinted brass, with the
 * pointer nudging the whole field. Pauses when the tab is hidden.
 */
export function MoteField() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.z = 14;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
    } catch {
      return; // No WebGL — the hero is complete without this.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    const COUNT = 900;
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    const phases = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 34;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
      speeds[i] = 0.15 + Math.random() * 0.5;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.075,
      color: new THREE.Color("#b08d4f"),
      transparent: true,
      opacity: 0.62,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const pointer = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const onResize = () => {
      if (!el.clientWidth || !el.clientHeight) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    let running = true;
    const start = performance.now();

    const tick = () => {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      const t = (performance.now() - start) / 1000;
      const pos = geometry.attributes.position;
      if (!pos) return;
      const arr = pos.array as Float32Array;

      for (let i = 0; i < COUNT; i++) {
        const iy = i * 3 + 1;
        const speed = speeds[i] ?? 0.3;
        const phase = phases[i] ?? 0;
        arr[iy] = (arr[iy] ?? 0) + speed * 0.008;
        if ((arr[iy] ?? 0) > 11) arr[iy] = -11;
        const ix = i * 3;
        arr[ix] = (arr[ix] ?? 0) + Math.sin(t * 0.35 + phase) * 0.0022;
      }
      pos.needsUpdate = true;

      // Field drifts toward the pointer, heavily damped.
      points.rotation.y += (pointer.x * 0.12 - points.rotation.y) * 0.02;
      points.rotation.x += (-pointer.y * 0.08 - points.rotation.x) * 0.02;

      renderer.render(scene, camera);
    };
    tick();

    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running) tick();
      else cancelAnimationFrame(raf);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={host} className="size-full" />;
}
