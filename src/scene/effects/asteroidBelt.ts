import * as THREE from "three";
import { EARTH_ORBIT_SPEED } from "../constants";

export type AsteroidBeltRuntime = {
  points: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  update: (delta: number) => void;
  dispose: () => void;
};

type CreateAsteroidBeltOptions = {
  centerPosition: THREE.Vector3;
  earthOrbitRadius: number;
  count?: number;
  innerAu?: number;
  outerAu?: number;
  tiltX?: number;
};

export function createAsteroidBelt(
  scene: THREE.Scene,
  options: CreateAsteroidBeltOptions,
): AsteroidBeltRuntime {
  const count = options.count ?? 2200;
  const innerAu = options.innerAu ?? 2.1;
  const outerAu = options.outerAu ?? 3.3;
  const tiltX = options.tiltX ?? 0;

  const group = new THREE.Group();
  group.position.copy(options.centerPosition);
  group.rotation.x = tiltX;
  scene.add(group);

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const angles = new Float32Array(count);
  const radii = new Float32Array(count);
  const heights = new Float32Array(count);
  const speeds = new Float32Array(count);
  const stretches = new Float32Array(count);
  const wobblePhases = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const t = Math.pow(Math.random(), 0.82);
    const au = THREE.MathUtils.lerp(innerAu, outerAu, t);
    const radius = options.earthOrbitRadius * au;
    const angle = Math.random() * Math.PI * 2;
    const baseKeplerScale = 1 / Math.sqrt(au * au * au);
    const speedJitter = THREE.MathUtils.lerp(0.92, 1.08, Math.random());
    const speed = EARTH_ORBIT_SPEED * baseKeplerScale * speedJitter;
    const stretch = THREE.MathUtils.lerp(0.9, 1.11, Math.random());
    const vertical = (Math.random() - 0.5) * radius * 0.026;
    const wobblePhase = Math.random() * Math.PI * 2;

    angles[i] = angle;
    radii[i] = radius;
    heights[i] = vertical;
    speeds[i] = speed;
    stretches[i] = stretch;
    wobblePhases[i] = wobblePhase;

    const index = i * 3;
    positions[index] = Math.cos(angle) * radius;
    positions[index + 1] = vertical;
    positions[index + 2] = Math.sin(angle) * radius * stretch;

    const tone = THREE.MathUtils.lerp(0.52, 0.86, Math.random());
    const warm = THREE.MathUtils.lerp(0.86, 1.02, Math.random());
    colors[index] = tone * warm;
    colors[index + 1] = tone * 0.92;
    colors[index + 2] = tone * 0.78;
  }

  const geometry = new THREE.BufferGeometry();
  const positionAttribute = new THREE.BufferAttribute(positions, 3);
  positionAttribute.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute("position", positionAttribute);
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.055,
    vertexColors: true,
    transparent: true,
    opacity: 0.78,
    sizeAttenuation: true,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  group.add(points);

  const update = (delta: number) => {
    for (let i = 0; i < count; i += 1) {
      const nextAngle = angles[i] + speeds[i] * delta;
      angles[i] = nextAngle;

      const radius = radii[i];
      const index = i * 3;
      positions[index] = Math.cos(nextAngle) * radius;
      positions[index + 1] =
        heights[i] + Math.sin(nextAngle * 2.7 + wobblePhases[i]) * radius * 0.0016;
      positions[index + 2] = Math.sin(nextAngle) * radius * stretches[i];
    }
    positionAttribute.needsUpdate = true;
  };

  const dispose = () => {
    scene.remove(group);
    geometry.dispose();
    material.dispose();
  };

  return { points, update, dispose };
}
