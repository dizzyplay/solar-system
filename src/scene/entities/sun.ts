import * as THREE from "three";

type SolarLightingOptions = {
  sunPosition: THREE.Vector3;
  referenceDistance: number;
  referenceIrradiance?: number;
};

export type SolarLightingRuntime = {
  setReferenceIrradiance: (nextValue: number) => void;
  dispose: () => void;
};

export function createSolarLighting(
  scene: THREE.Scene,
  options: SolarLightingOptions,
): SolarLightingRuntime {
  const referenceDistanceSquared = options.referenceDistance * options.referenceDistance;
  const ambientLight = new THREE.AmbientLight(0x0b111a, 0.0045);
  const sunPointLight = new THREE.PointLight(0xfff6de, 1, 0, 2);
  sunPointLight.position.copy(options.sunPosition);
  scene.add(ambientLight, sunPointLight);

  const setReferenceIrradiance = (nextValue: number) => {
    const clampedValue = Math.max(0, nextValue);
    sunPointLight.intensity = clampedValue * referenceDistanceSquared;
  };
  setReferenceIrradiance(options.referenceIrradiance ?? 12);

  const dispose = () => {
    scene.remove(ambientLight, sunPointLight);
  };

  return { setReferenceIrradiance, dispose };
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
