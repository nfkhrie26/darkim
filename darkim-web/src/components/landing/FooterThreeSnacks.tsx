'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  createChipsTexture,
  createSodaCanTexture,
  createLowPolyChipsBag,
  createLowPolySodaCan,
} from './threeSnackModels';

export default function FooterThreeSnacks() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();

    const width = container.clientWidth || 160;
    const height = container.clientHeight || 130;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 5.5);

    // 2. WebGL Renderer with transparency
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 3. Lighting (Clean Neo-Brutalist illumination)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(4, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00d084, 0.4);
    dirLight2.position.set(-3, -2, -2);
    scene.add(dirLight2);

    // 4. Create Models from modular factories
    const chipsTexture = createChipsTexture();
    const sodaTexture = createSodaCanTexture();

    const chipsBag = createLowPolyChipsBag(chipsTexture);
    chipsBag.position.set(-0.92, 0.05, 0.1);
    chipsBag.rotation.set(0.15, 0.35, -0.18);
    chipsBag.scale.set(0.92, 0.92, 0.92);

    const sodaCan = createLowPolySodaCan(sodaTexture);
    sodaCan.position.set(0.9, -0.05, 0.15);
    sodaCan.rotation.set(0.08, -0.45, 0.14);
    sodaCan.scale.set(0.92, 0.92, 0.92);

    // Root group holding both models
    const rootGroup = new THREE.Group();
    rootGroup.add(chipsBag);
    rootGroup.add(sodaCan);
    scene.add(rootGroup);

    // Subtle interactive tilt tracking
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetTiltX = y * 0.25;
      targetTiltY = x * 0.35;
    };

    const handlePointerLeave = () => {
      targetTiltX = 0;
      targetTiltY = 0;
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('mouseleave', handlePointerLeave);

    // 5. Idle Floating ("Naik-Turun") Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const baseChipsY = chipsBag.position.y;
    const baseChipsRotY = chipsBag.rotation.y;
    const baseChipsRotZ = chipsBag.rotation.z;

    const baseCanY = sodaCan.position.y;
    const baseCanRotY = sodaCan.rotation.y;
    const baseCanRotX = sodaCan.rotation.x;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Smooth lerp interactive tilt
      currentTiltX += (targetTiltX - currentTiltX) * 0.08;
      currentTiltY += (targetTiltY - currentTiltY) * 0.08;
      rootGroup.rotation.x = currentTiltX;
      rootGroup.rotation.y = currentTiltY;

      // Sinusoidal floating animation (subtle offset between models)
      chipsBag.position.y = baseChipsY + Math.sin(elapsed * 2.2) * 0.11;
      chipsBag.rotation.y = baseChipsRotY + Math.sin(elapsed * 1.3) * 0.12;
      chipsBag.rotation.z = baseChipsRotZ + Math.cos(elapsed * 1.6) * 0.05;

      sodaCan.position.y = baseCanY + Math.sin(elapsed * 2.2 + 1.3) * 0.11;
      sodaCan.rotation.y = baseCanRotY + Math.cos(elapsed * 1.1) * 0.14;
      sodaCan.rotation.x = baseCanRotX + Math.sin(elapsed * 1.5) * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    // 6. Responsive Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      if (newW > 0 && newH > 0) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 7. Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('mouseleave', handlePointerLeave);

      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }

      chipsTexture.dispose();
      sodaTexture.dispose();

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });

      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-28 h-24 sm:w-36 sm:h-28 md:w-44 md:h-32 flex items-center justify-center select-none cursor-grab active:cursor-grabbing overflow-visible"
      title="3D Low-Poly Ciki & Soda (Three.js)"
    />
  );
}
