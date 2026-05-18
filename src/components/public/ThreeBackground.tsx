"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    // SCENE, CAMERA, RENDERER
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // Move camera back to see particles
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // GENERATE GOLDEN GLOW TEXTURE
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.2, "rgba(196, 146, 40, 0.8)"); // #C49228
      gradient.addColorStop(0.5, "rgba(196, 146, 40, 0.2)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);

    // PARTICLES CREATION HELPER
    const createParticles = (count: number, size: number, opacity: number, speedMultiplier: number) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const originalPositions = new Float32Array(count * 3);
      const speeds = new Float32Array(count);
      
      for (let i = 0; i < count; i++) {
        // Spread particles in a wide 3D space
        const x = (Math.random() - 0.5) * 400;
        const y = (Math.random() - 0.5) * 400;
        const z = (Math.random() - 0.5) * 200 - 50; // Keep slightly behind

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        originalPositions[i * 3] = x;
        originalPositions[i * 3 + 1] = y;
        originalPositions[i * 3 + 2] = z;

        // Random speed for soft, slow vertical drift
        speeds[i] = (Math.random() * 0.04 + 0.01) * speedMultiplier;
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({
        size: size,
        map: texture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: opacity,
      });

      const particles = new THREE.Points(geometry, material);
      scene.add(particles);

      return { particles, geometry, material, speeds, originalPositions, count };
    };

    const particleSystems = [
      createParticles(300, 1.0, 0.25, 0.6), // Small, slow, background
      createParticles(200, 1.8, 0.35, 1.0), // Medium, midground
      createParticles(100, 3.0, 0.15, 1.5), // Large, foreground, faster
    ];

    // INTERACTION & ANIMATION VARIABLES
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    let isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const handleMouseMove = (event: MouseEvent) => {
      if (isReducedMotion) return;
      mouseX = event.clientX - windowHalfX;
      mouseY = event.clientY - windowHalfY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // ANIMATION LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      const time = clock.getElapsedTime();

      // Parallax target smoothing (Softened)
      targetX = mouseX * 0.03;
      targetY = mouseY * 0.03;
      
      camera.position.x += (targetX - camera.position.x) * 0.02;
      camera.position.y += (-targetY - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      if (!isReducedMotion) {
        particleSystems.forEach(({ particles, geometry, speeds, originalPositions, count }, index) => {
          const posAttr = geometry.attributes.position;
          const posArray = posAttr.array as Float32Array;

          for (let i = 0; i < count; i++) {
            const ix = i * 3;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;

            // Slow upward drift
            posArray[iy] += speeds[i];

            // Small sine wave wobble, offset by index for variety
            posArray[ix] += Math.sin(time * 0.5 + i + index) * 0.05;

            // Wrap around logic
            if (posArray[iy] > 200) {
              posArray[iy] = -200;
              posArray[ix] = originalPositions[ix];
            }
          }
          posAttr.needsUpdate = true;
          
          // Very slow group rotation, slightly different per layer
          particles.rotation.y = time * (0.01 + index * 0.005);
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      currentMount.removeChild(renderer.domElement);
      particleSystems.forEach(({ geometry, material }) => {
        geometry.dispose();
        material.dispose();
      });
      texture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: "transparent" }}
    />
  );
}
