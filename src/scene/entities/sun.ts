import * as THREE from "three";

type SolarLightingOptions = {
  sunPosition: THREE.Vector3;
  sunRadius: number;
};

export type SolarLightingRuntime = {
  sunLight: THREE.DirectionalLight;
  dispose: () => void;
};

export function createSolarLighting(
  scene: THREE.Scene,
  options: SolarLightingOptions,
): SolarLightingRuntime {
  const ambientLight = new THREE.AmbientLight(0x24374f, 0.12);
  const hemisphereLight = new THREE.HemisphereLight(0x7ea0e0, 0x101722, 0.32);
  const sunLight = new THREE.DirectionalLight(0xfff6de, 1.85);
  sunLight.position.copy(options.sunPosition);
  const bounceLight = new THREE.DirectionalLight(0x86a8cf, 0.16);
  bounceLight.position.copy(options.sunPosition).multiplyScalar(-1);
  const sunHaloLight = new THREE.PointLight(0xffb45a, 1.25, options.sunRadius * 34, 2);
  sunHaloLight.position.copy(options.sunPosition);
  scene.add(ambientLight, hemisphereLight, sunLight, bounceLight, sunHaloLight);

  const dispose = () => {
    scene.remove(ambientLight, hemisphereLight, sunLight, bounceLight, sunHaloLight);
  };

  return { sunLight, dispose };
}

type SunVisualOptions = {
  sunPosition: THREE.Vector3;
  sunRadius: number;
  sunTexture: THREE.Texture;
  haloTexture: THREE.Texture;
};

export type SunVisualRuntime = {
  mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  update: (delta: number, time: number) => void;
  dispose: () => void;
};

export function createSunVisual(
  scene: THREE.Scene,
  options: SunVisualOptions,
): SunVisualRuntime {
  const geometry = new THREE.SphereGeometry(options.sunRadius, 96, 96);
  const material = new THREE.MeshBasicMaterial({
    map: options.sunTexture,
    color: 0xffd8a3,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(options.sunPosition);
  mesh.userData.focusDistance = Math.max(options.sunRadius * 4.4, 5.4);
  scene.add(mesh);

  const haloMaterial = new THREE.SpriteMaterial({
    map: options.haloTexture,
    color: 0xffc786,
    transparent: true,
    opacity: 0.34,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });
  const haloSprite = new THREE.Sprite(haloMaterial);
  haloSprite.position.copy(options.sunPosition);
  haloSprite.scale.set(options.sunRadius * 8.8, options.sunRadius * 8.8, 1);
  scene.add(haloSprite);

  const update = (delta: number, time: number) => {
    mesh.rotation.y += delta * 0.06;
    mesh.rotation.z = Math.sin(time * 0.18) * 0.04;
    const haloPulse = 0.5 + Math.sin(time * 0.85) * 0.5;
    haloMaterial.opacity = 0.28 + haloPulse * 0.12;
    const haloScale = options.sunRadius * (8.5 + haloPulse * 0.9);
    haloSprite.scale.set(haloScale, haloScale, 1);
  };

  const dispose = () => {
    scene.remove(mesh, haloSprite);
    geometry.dispose();
    material.dispose();
    haloMaterial.dispose();
  };

  return { mesh, update, dispose };
}
