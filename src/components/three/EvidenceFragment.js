import * as THREE from "three";

export function createEvidenceFragment({
  type = "cube",
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  depthLayer = "middle",
  hasAccent = false,
  floatSpeed = 0.4,
  floatAmp = 0.25,
  phase = 0
}) {
  const group = new THREE.Group();

  let geometry;
  if (type === "document") {
    // Sleek rectangular data slab
    geometry = new THREE.BoxGeometry(1.6 * scale[0], 2.2 * scale[1], 0.12 * scale[2]);
  } else if (type === "polygon") {
    // Faceted evidence polygon
    geometry = new THREE.OctahedronGeometry(0.9 * scale[0], 0);
  } else if (type === "tetra") {
    geometry = new THREE.TetrahedronGeometry(0.85 * scale[0], 0);
  } else {
    // Polished metallic data cube (matching the reference image)
    geometry = new THREE.BoxGeometry(1.05 * scale[0], 1.05 * scale[1], 1.05 * scale[2]);
  }

  // Glossy metallic cobalt/azure blue material (as in the UnioMind reference image)
  const material = new THREE.MeshStandardMaterial({
    color: hasAccent ? 0x2563eb : 0x1d4ed8,
    roughness: 0.18,
    metalness: 0.88,
    transparent: true,
    opacity: depthLayer === "foreground" ? 0.75 : 0.92,
    emissive: hasAccent ? 0x0284c7 : 0x0c2340,
    emissiveIntensity: hasAccent ? 0.45 : 0.2
  });

  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);

  // Luminous cyan/sky-blue beveled edge lines
  const edgesGeometry = new THREE.EdgesGeometry(geometry);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: hasAccent ? 0x38bdf8 : 0x60a5fa,
    transparent: true,
    opacity: hasAccent ? 0.85 : 0.55,
    linewidth: 1
  });
  const wireframe = new THREE.LineSegments(edgesGeometry, lineMaterial);
  group.add(wireframe);

  // Base transforms
  const basePos = new THREE.Vector3(...position);
  const baseRot = new THREE.Euler(...rotation);
  group.position.copy(basePos);
  group.rotation.copy(baseRot);

  // Parallax sensitivity based on depth layer
  const parallaxFactor = depthLayer === "foreground" ? 0.45 : depthLayer === "middle" ? 0.25 : 0.1;
  const rotSpeedX = 0.08 * (floatSpeed > 0 ? 1 : -1);
  const rotSpeedY = 0.12 * (floatSpeed > 0 ? 1 : -1);

  return {
    group,
    position: group.position,
    update(time, mouseNormX, mouseNormY, reducedMotion = false) {
      if (reducedMotion) return;

      // Slow organic vertical float
      group.position.y = basePos.y + Math.sin(time * floatSpeed + phase) * floatAmp;
      
      // Slight mouse parallax offset
      group.position.x = basePos.x + mouseNormX * parallaxFactor;
      group.position.z = basePos.z + mouseNormY * (parallaxFactor * 0.5);

      // Continuous subtle rotation
      group.rotation.x = baseRot.x + Math.sin(time * floatSpeed * 0.7 + phase) * 0.15 + (time * 0.03);
      group.rotation.y = baseRot.y + (time * rotSpeedY * 0.4);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      edgesGeometry.dispose();
      lineMaterial.dispose();
    }
  };
}
