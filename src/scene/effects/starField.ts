import * as THREE from "three";

export type StarFieldRuntime = {
  points: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  update: (cameraPosition: THREE.Vector3, delta: number) => void;
  dispose: () => void;
};

type CreateStarFieldOptions = {
  starCount?: number;
  minRadius?: number;
  radiusRange?: number;
};

export function createStarField(
  scene: THREE.Scene,
  options?: CreateStarFieldOptions,
): StarFieldRuntime {
  const starCount = options?.starCount ?? 800;
  const minRadius = options?.minRadius ?? 240;
  const radiusRange = options?.radiusRange ?? 180;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    const radius = minRadius + Math.random() * radiusRange;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const index = i * 3;
    positions[index] = radius * Math.sin(phi) * Math.cos(theta);
    positions[index + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[index + 2] = radius * Math.cos(phi);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xd7ebff,
    size: 0.12,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  const update = (cameraPosition: THREE.Vector3, delta: number) => {
    points.rotation.y += delta * 0.008;
    points.position.copy(cameraPosition);
  };

  const dispose = () => {
    geometry.dispose();
    material.dispose();
  };

  return { points, update, dispose };
}
