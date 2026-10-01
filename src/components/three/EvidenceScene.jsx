import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { createSceneCamera } from "./SceneCamera";
import { createSceneLighting } from "./SceneLighting";
import { createEvidenceFragments } from "./EvidenceFragments";
import { createAtmosphericParticles } from "./AtmosphericParticles";
import { createSceneEnvironment } from "./SceneEnvironment";

function isWebGLAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch (e) {
    return false;
  }
}

export default function EvidenceScene({ activeCapability = null }) {
  const mountRef = useRef(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    if (!isWebGLAvailable()) {
      console.warn("[ReCoveryAI 3D] WebGL not available. Falling back to static atmospheric styling.");
      setHasWebGL(false);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    // Detect device capability & reduced motion
    const isMobile = window.innerWidth < 768;
    const isLowPerf = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || isMobile;
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = reducedMotionQuery.matches;

    const handleReducedMotionChange = (e) => {
      reducedMotion = e.matches;
    };
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);

    // 1. Scene & Renderer
    const scene = new THREE.Scene();
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isLowPerf,
        alpha: true,
        powerPreference: "high-performance"
      });
    } catch (err) {
      console.warn("[ReCoveryAI 3D] Failed to create WebGLRenderer:", err);
      setHasWebGL(false);
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // 2. Camera, Lighting, Environment, Fragments, Particles
    const sceneCamera = createSceneCamera(width, height);
    const sceneEnvironment = createSceneEnvironment(scene, renderer);
    const sceneLighting = createSceneLighting(scene);
    const evidenceFragments = createEvidenceFragments(scene, isLowPerf);
    const atmosphericParticles = createAtmosphericParticles(scene, 180, isLowPerf);

    // 3. Mouse Parallax Listener
    let mouseNormX = 0;
    let mouseNormY = 0;

    const handleMouseMove = (e) => {
      mouseNormX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNormY = -(e.clientY / window.innerHeight) * 2 + 1;
      sceneCamera.setMouseParallax(mouseNormX, mouseNormY, reducedMotion);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 4. Resize Listener
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      sceneCamera.updateAspect(w, h);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // 5. Render Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      sceneCamera.update(reducedMotion);
      sceneLighting.update(elapsedTime, reducedMotion);
      evidenceFragments.update(elapsedTime, mouseNormX, mouseNormY, reducedMotion);
      atmosphericParticles.update(elapsedTime, reducedMotion);

      renderer.render(scene, sceneCamera.camera);
    };

    animate();

    // 6. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      reducedMotionQuery.removeEventListener("change", handleReducedMotionChange);

      evidenceFragments.dispose();
      atmosphericParticles.dispose();
      sceneLighting.dispose();
      sceneEnvironment.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (!hasWebGL) {
    // Pure CSS fallback for devices without WebGL
    return (
      <div 
        className="fixed inset-0 pointer-events-none z-[1] bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.06),transparent_70%)]" 
        aria-hidden="true" 
      />
    );
  }

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 pointer-events-none z-[1] overflow-hidden"
      aria-hidden="true"
    />
  );
}
