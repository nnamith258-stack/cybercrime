import * as THREE from "three";

export function createSceneEnvironment(scene, renderer) {
  // Dark forensic atmospheric fog (soft emerald-tinted black)
  scene.fog = new THREE.FogExp2(0x020604, 0.038);

  // Clear renderer with transparency to seamlessly blend with CSS gradients
  renderer.setClearColor(0x020604, 0.0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

  return {
    dispose() {
      scene.fog = null;
    }
  };
}
