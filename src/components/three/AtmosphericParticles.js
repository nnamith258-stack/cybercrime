import * as THREE from "three";

export function createAtmosphericParticles(scene, count = 180, isLowPerf = false) {
  const actualCount = isLowPerf ? 70 : count;

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(actualCount * 3);
  const colors = new Float32Array(actualCount * 3);
  const phases = new Float32Array(actualCount);
  const speeds = new Float32Array(actualCount);

  // Cool cobalt and electric sky-blue tones
  const colorPalette = [
    new THREE.Color(0x38bdf8), // Cyan / Sky Blue
    new THREE.Color(0x60a5fa), // Light Blue
    new THREE.Color(0x2563eb), // Royal Cobalt Blue
    new THREE.Color(0x93c5fd), // Soft Icy Blue
  ];

  for (let i = 0; i < actualCount; i++) {
    // Spread in viewing frustum
    positions[i * 3 + 0] = (Math.random() - 0.5) * 24;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;

    const chosenColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i * 3 + 0] = chosenColor.r;
    colors[i * 3 + 1] = chosenColor.g;
    colors[i * 3 + 2] = chosenColor.b;

    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.15 + Math.random() * 0.35;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  return {
    points,
    update(time, reducedMotion = false) {
      if (reducedMotion) return;

      const posAttr = geometry.attributes.position;
      const posArray = posAttr.array;

      for (let i = 0; i < actualCount; i++) {
        // Slow vertical and horizontal drifting
        posArray[i * 3 + 1] += Math.sin(time * speeds[i] + phases[i]) * 0.003;
        posArray[i * 3 + 0] += Math.cos(time * (speeds[i] * 0.7) + phases[i]) * 0.002;
      }

      posAttr.needsUpdate = true;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      scene.remove(points);
    }
  };
}
