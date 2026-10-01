import * as THREE from "three";

export function createSceneCamera(width, height) {
  const aspect = width / height;
  const camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 100);
  camera.position.set(0, 0.3, 16);
  camera.lookAt(0, 0, 0);

  // Parallax state
  const target = { x: 0, y: 0.3 };
  const current = { x: 0, y: 0.3 };

  return {
    camera,
    updateAspect(w, h) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    setMouseParallax(normalizedX, normalizedY, reducedMotion = false) {
      if (reducedMotion) {
        target.x = 0;
        target.y = 0.3;
        return;
      }
      // Subtle 5-8% parallax range
      target.x = normalizedX * 1.2;
      target.y = 0.3 + normalizedY * 0.8;
    },
    update(reducedMotion = false) {
      if (reducedMotion) return;
      current.x += (target.x - current.x) * 0.04;
      current.y += (target.y - current.y) * 0.04;

      camera.position.x = current.x;
      camera.position.y = current.y;
      camera.lookAt(0, 0, 0);
    }
  };
}
