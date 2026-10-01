import * as THREE from "three";
import { createEvidenceFragment } from "./EvidenceFragment";

// Fixed, deterministic fragment configurations tailored to match the reference composition
const FRAGMENT_DEFINITIONS = [
  // Prominent Floating Metallic Cubes cluster on Right Perimeter (matching reference image slide 2)
  { type: "cube",     position: [7.2, 3.8, -1.8],  rotation: [-0.35, 0.45, 0.2], scale: [1.35, 1.35, 1.35], depthLayer: "foreground", hasAccent: true, floatSpeed: 0.38, floatAmp: 0.22, phase: 0.4 },
  { type: "cube",     position: [8.8, 1.6, -2.5],  rotation: [0.4, -0.3, 0.5],  scale: [1.15, 1.15, 1.15], depthLayer: "middle",     hasAccent: true, floatSpeed: 0.44, floatAmp: 0.20, phase: 1.8 },
  { type: "cube",     position: [6.4, -1.2, -2.2], rotation: [-0.25, 0.6, -0.15], scale: [1.0, 1.0, 1.0],   depthLayer: "middle",     hasAccent: false, floatSpeed: 0.32, floatAmp: 0.24, phase: 3.2 },
  { type: "cube",     position: [9.2, -3.2, -3.2], rotation: [0.3, -0.4, 0.3],  scale: [1.25, 1.25, 1.25], depthLayer: "middle",     hasAccent: true, floatSpeed: 0.48, floatAmp: 0.18, phase: 4.5 },

  // Left perimeter framing fragments
  { type: "document", position: [-6.8, 4.4, -2.5], rotation: [0.3, 0.4, -0.2], scale: [1.1, 1.1, 1.1], depthLayer: "middle", hasAccent: false, floatSpeed: 0.35, floatAmp: 0.22, phase: 0.2 },
  { type: "cube",     position: [-8.2, 1.8, -2.8], rotation: [0.2, 0.6, -0.1], scale: [0.95, 0.95, 0.95], depthLayer: "middle", hasAccent: true, floatSpeed: 0.30, floatAmp: 0.25, phase: 2.8 },
  { type: "polygon",  position: [-6.5, -3.8, -2.2], rotation: [-0.4, 0.5, 0.2], scale: [1.0, 1.0, 1.0], depthLayer: "middle", hasAccent: false, floatSpeed: 0.40, floatAmp: 0.22, phase: 1.1 },

  // Top perimeter & depth nodes
  { type: "cube",     position: [2.5, 5.2, -4.0],  rotation: [0.4, 0.5, -0.3], scale: [0.9, 0.9, 0.9], depthLayer: "middle", hasAccent: false, floatSpeed: 0.50, floatAmp: 0.16, phase: 3.0 },
  { type: "polygon",  position: [-2.0, 4.8, -4.5], rotation: [0.5, -0.2, 0.4], scale: [0.85, 0.85, 0.85], depthLayer: "middle", hasAccent: false, floatSpeed: 0.45, floatAmp: 0.18, phase: 1.5 },

  // Background deep ambient nodes
  { type: "cube",     position: [0.5, 2.5, -6.5],   rotation: [-0.3, -0.2, 0.5], scale: [0.8, 0.8, 0.8], depthLayer: "background", hasAccent: false, floatSpeed: 0.28, floatAmp: 0.15, phase: 1.9 },
  { type: "document", position: [-1.5, -2.8, -7.0], rotation: [0.4, 0.1, -0.2], scale: [0.8, 0.8, 0.8], depthLayer: "background", hasAccent: true, floatSpeed: 0.22, floatAmp: 0.12, phase: 3.0 }
];

// Relationships connecting specific fragment index pairs
const RELATION_LINKS = [
  [0, 1], // cluster on right
  [1, 2],
  [2, 3],
  [4, 5], // left perimeter
  [5, 6],
  [7, 8]  // top perimeter
];

export function createEvidenceFragments(scene, isLowPerf = false) {
  const container = new THREE.Group();

  const defsToUse = isLowPerf ? FRAGMENT_DEFINITIONS.slice(0, 6) : FRAGMENT_DEFINITIONS;
  const fragments = defsToUse.map(def => {
    const frag = createEvidenceFragment(def);
    container.add(frag.group);
    return frag;
  });

  // Glowing azure relationship filaments linking fragments
  const lineGeometries = [];
  const lineMeshes = [];
  const linkMaterial = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.35,
    linewidth: 1
  });

  RELATION_LINKS.forEach(([idxA, idxB]) => {
    if (idxA < fragments.length && idxB < fragments.length) {
      const geom = new THREE.BufferGeometry().setFromPoints([
        fragments[idxA].position,
        fragments[idxB].position
      ]);
      const line = new THREE.Line(geom, linkMaterial);
      container.add(line);
      lineGeometries.push({ geom, idxA, idxB });
      lineMeshes.push(line);
    }
  });

  scene.add(container);

  return {
    container,
    update(time, mouseX, mouseY, reducedMotion = false) {
      fragments.forEach(f => f.update(time, mouseX, mouseY, reducedMotion));

      if (!reducedMotion) {
        lineGeometries.forEach(({ geom, idxA, idxB }) => {
          const pA = fragments[idxA].group.position;
          const pB = fragments[idxB].group.position;
          const positions = new Float32Array([
            pA.x, pA.y, pA.z,
            pB.x, pB.y, pB.z
          ]);
          geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
          geom.attributes.position.needsUpdate = true;
        });
      }
    },
    dispose() {
      fragments.forEach(f => f.dispose());
      lineGeometries.forEach(l => l.geom.dispose());
      linkMaterial.dispose();
      scene.remove(container);
    }
  };
}
