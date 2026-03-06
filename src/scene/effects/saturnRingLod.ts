import * as THREE from "three";

type SaturnRingLodOptions = {
  bodyGroup: THREE.Group;
  mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhongMaterial>;
  ringMeshes: Array<THREE.Mesh<THREE.RingGeometry, THREE.MeshPhongMaterial>>;
  particleCount?: number;
};

export type SaturnRingLodRuntime = {
  update: (cameraPosition: THREE.Vector3, delta: number) => void;
  dispose: () => void;
};

const TAU = Math.PI * 2;

function createParticleSpriteTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Failed to create Saturn ring particle texture");
  }

  const gradient = context.createRadialGradient(32, 32, 2, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.36, "rgba(255,250,244,0.95)");
  gradient.addColorStop(0.72, "rgba(244,230,210,0.35)");
  gradient.addColorStop(1, "rgba(244,230,210,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

type RingBand = {
  inner: number;
  outer: number;
  weight: number;
  color: THREE.ColorRepresentation;
  opacity: number;
};

const RING_BANDS: RingBand[] = [
  { inner: 1.16, outer: 1.34, weight: 0.4, color: "#cdb48c", opacity: 0.08 },
  { inner: 1.38, outer: 1.98, weight: 1, color: "#efe1c8", opacity: 0.2 },
  { inner: 2.02, outer: 2.12, weight: 0.06, color: "#c9b18b", opacity: 0.025 },
  { inner: 2.16, outer: 2.62, weight: 0.72, color: "#dcc9aa", opacity: 0.14 },
];

function pickBand() {
  const totalWeight = RING_BANDS.reduce((sum, band) => sum + band.weight, 0);
  let remaining = Math.random() * totalWeight;
  for (const band of RING_BANDS) {
    remaining -= band.weight;
    if (remaining <= 0) {
      return band;
    }
  }
  return RING_BANDS[RING_BANDS.length - 1];
}

export function createSaturnRingLod(
  options: SaturnRingLodOptions,
): SaturnRingLodRuntime {
  if (options.ringMeshes.length === 0) {
    return {
      update: () => undefined,
      dispose: () => undefined,
    };
  }

  const particleCount = options.particleCount ?? 10000;
  const ringSpriteTexture = createParticleSpriteTexture();
  const ringMaterialBaseOpacity = options.ringMeshes.map(
    (ringMesh) => ringMesh.material.opacity,
  );

  let outerRadius = 0;
  for (const ringMesh of options.ringMeshes) {
    outerRadius = Math.max(outerRadius, ringMesh.geometry.parameters.outerRadius);
  }

  const fadeStartDistance = outerRadius * 1.4;
  const fadeEndDistance = outerRadius * 4.2;

  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const angles = new Float32Array(particleCount);
  const radii = new Float32Array(particleCount);
  const heights = new Float32Array(particleCount);
  const angularSpeeds = new Float32Array(particleCount);
  const twinkles = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i += 1) {
    const band = pickBand();
    const radiusScale = THREE.MathUtils.lerp(
      band.inner,
      band.outer,
      Math.pow(Math.random(), 0.82),
    );
    const radius = options.mesh.geometry.parameters.radius * radiusScale;
    const angle = Math.random() * TAU;
    const height = (Math.random() - 0.5) * radius * 0.0018;
    const angularSpeed = THREE.MathUtils.lerp(0.16, 0.42, Math.random()) / Math.sqrt(radiusScale);
    const twinkle = Math.random() * TAU;
    const color = new THREE.Color(band.color).lerp(
      new THREE.Color("#fffef7"),
      Math.random() * 0.24,
    );
    const alpha = band.opacity * THREE.MathUtils.lerp(0.7, 1.02, Math.random());

    angles[i] = angle;
    radii[i] = radius;
    heights[i] = height;
    angularSpeeds[i] = angularSpeed;
    twinkles[i] = twinkle;

    const index = i * 3;
    positions[index] = Math.cos(angle) * radius;
    positions[index + 1] = height;
    positions[index + 2] = Math.sin(angle) * radius;
    colors[index] = color.r * alpha;
    colors[index + 1] = color.g * alpha;
    colors[index + 2] = color.b * alpha;
    sizes[i] = THREE.MathUtils.lerp(1.2, 3.2, Math.random());
  }

  const geometry = new THREE.BufferGeometry();
  const positionAttribute = new THREE.BufferAttribute(positions, 3);
  positionAttribute.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute("position", positionAttribute);
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      pointTexture: { value: ringSpriteTexture },
      opacity: { value: 0 },
    },
    vertexShader: `
      attribute float size;
      varying vec3 vColor;

      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (44.0 / max(1.0, -mvPosition.z));
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D pointTexture;
      uniform float opacity;
      varying vec3 vColor;

      void main() {
        vec4 sprite = texture2D(pointTexture, gl_PointCoord);
        float alpha = sprite.a * opacity;
        if (alpha < 0.01) {
          discard;
        }
        gl_FragColor = vec4(vColor * sprite.rgb, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    vertexColors: true,
    blending: THREE.NormalBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.visible = false;
  points.frustumCulled = false;
  options.bodyGroup.add(points);

  const saturnWorldPosition = new THREE.Vector3();
  const update = (cameraPosition: THREE.Vector3, delta: number) => {
    for (let i = 0; i < particleCount; i += 1) {
      const nextAngle = angles[i] + angularSpeeds[i] * delta;
      angles[i] = nextAngle;
      const radius = radii[i];
      const index = i * 3;
      positions[index] = Math.cos(nextAngle) * radius;
      positions[index + 1] =
        heights[i] + Math.sin(nextAngle * 3.2 + twinkles[i]) * radius * 0.00014;
      positions[index + 2] = Math.sin(nextAngle) * radius;
    }
    positionAttribute.needsUpdate = true;

    options.mesh.getWorldPosition(saturnWorldPosition);
    const distanceToCamera = saturnWorldPosition.distanceTo(cameraPosition);
    const farBlend = THREE.MathUtils.smoothstep(
      distanceToCamera,
      fadeStartDistance,
      fadeEndDistance,
    );
    const particleOpacity = (1 - farBlend) * 0.34;

    points.visible = particleOpacity > 0.02;
    material.uniforms.opacity.value = particleOpacity;

    for (let i = 0; i < options.ringMeshes.length; i += 1) {
      const ringMesh = options.ringMeshes[i];
      const ringOpacity =
        ringMaterialBaseOpacity[i] * (0.28 + farBlend * 0.72);
      ringMesh.visible = ringOpacity > 0.02;
      ringMesh.material.opacity = ringOpacity;
    }
  };

  const dispose = () => {
    options.bodyGroup.remove(points);
    geometry.dispose();
    material.dispose();
    ringSpriteTexture.dispose();
    for (let i = 0; i < options.ringMeshes.length; i += 1) {
      options.ringMeshes[i].material.opacity = ringMaterialBaseOpacity[i];
      options.ringMeshes[i].visible = true;
    }
  };

  return { update, dispose };
}
