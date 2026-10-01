import * as THREE from "three";

export function createSceneLighting(scene) {
  const group = new THREE.Group();

  // 1. Ambient baseline with deep navy tint
  const ambient = new THREE.AmbientLight(0x0a1628, 0.8);
  group.add(ambient);

  // 2. Bright Sky-Blue Key Light (Upper Right Key Specular)
  const azureKeyLight = new THREE.PointLight(0x38bdf8, 2.2, 35, 1.8);
  azureKeyLight.position.set(5.5, 4.5, 4.0);
  group.add(azureKeyLight);

  // 3. Deep Cobalt Fill Light (Bottom-Left Depth)
  const cobaltFillLight = new THREE.PointLight(0x1d4ed8, 1.8, 30, 2);
  cobaltFillLight.position.set(-6.0, -3.5, 2.5);
  group.add(cobaltFillLight);

  // 4. Cool Directional Rim Light for metallic specular chrome edges
  const rimLight = new THREE.DirectionalLight(0xe0f2fe, 0.7);
  rimLight.position.set(-3, 8, 8);
  group.add(rimLight);

  scene.add(group);

  return {
    group,
    update(time, reducedMotion = false) {
      if (reducedMotion) return;
      // Very subtle organic light breathing
      azureKeyLight.position.x = 5.5 + Math.sin(time * 0.3) * 0.5;
      azureKeyLight.position.y = 4.5 + Math.cos(time * 0.25) * 0.4;
    },
    dispose() {
      scene.remove(group);
    }
  };
}
