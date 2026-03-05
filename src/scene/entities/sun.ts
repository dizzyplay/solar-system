import * as THREE from "three";

const TAU = Math.PI * 2;

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
    color: 0xffffff,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(options.sunPosition);
  mesh.userData.focusDistance = Math.max(options.sunRadius * 4.4, 5.4);
  scene.add(mesh);

  const haloMaterial = new THREE.SpriteMaterial({
    map: options.haloTexture,
    color: 0xed7c38,
    transparent: true,
    opacity: 0.26,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });
  const haloSprite = new THREE.Sprite(haloMaterial);
  haloSprite.position.copy(options.sunPosition);
  haloSprite.scale.set(options.sunRadius * 8.8, options.sunRadius * 8.8, 1);
  scene.add(haloSprite);

  const outerHaloMaterial = new THREE.SpriteMaterial({
    map: options.haloTexture,
    color: 0x5a1f10,
    transparent: true,
    opacity: 0.1,
    blending: THREE.NormalBlending,
    depthWrite: false,
    depthTest: false,
  });
  const outerHaloSprite = new THREE.Sprite(outerHaloMaterial);
  outerHaloSprite.position.copy(options.sunPosition);
  outerHaloSprite.scale.set(options.sunRadius * 12.2, options.sunRadius * 12.2, 1);
  scene.add(outerHaloSprite);

  // 표면에 붙어서 커졌다 작아졌다 하는 흐릿한 발광 파티클
  const glowCount = 5000;
  const glowDirs = new Float32Array(glowCount * 3);
  const glowPhase = new Float32Array(glowCount);
  const glowSize = new Float32Array(glowCount);
  const glowSpeed = new Float32Array(glowCount);
  const glowHeat = new Float32Array(glowCount);

  for (let i = 0; i < glowCount; i++) {
    // 구체 표면 위 균일 분포
    const theta = Math.random() * TAU;
    const cosP = Math.random() * 2 - 1;
    const sinP = Math.sqrt(1 - cosP * cosP);
    glowDirs[i * 3] = Math.cos(theta) * sinP;
    glowDirs[i * 3 + 1] = Math.sin(theta) * sinP;
    glowDirs[i * 3 + 2] = cosP;

    glowPhase[i] = Math.random() * TAU;
    glowSize[i] = 1.5 + Math.random() * 9.0;
    glowSpeed[i] = 0.3 + Math.random() * 1.8;
    glowHeat[i] = 0.5 + Math.random() * 0.7;
  }

  const glowGeo = new THREE.BufferGeometry();
  glowGeo.setAttribute("position", new THREE.BufferAttribute(glowDirs, 3));
  glowGeo.setAttribute("phase", new THREE.BufferAttribute(glowPhase, 1));
  glowGeo.setAttribute("size", new THREE.BufferAttribute(glowSize, 1));
  glowGeo.setAttribute("speed", new THREE.BufferAttribute(glowSpeed, 1));
  glowGeo.setAttribute("heat", new THREE.BufferAttribute(glowHeat, 1));

  const glowMat = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      baseRadius: { value: options.sunRadius * 1.005 },
      pointScale: { value: options.sunRadius * 45 },
    },
    vertexShader: `
      uniform float time;
      uniform float baseRadius;
      uniform float pointScale;
      attribute float phase;
      attribute float size;
      attribute float speed;
      attribute float heat;
      varying float vAlpha;
      varying float vHeat;

      void main() {
        vec3 dir = normalize(position);
        vec3 pos = dir * baseRadius;
        vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPos;

        // 여러 주파수로 맥동 (커졌다 작아졌다)
        float pulse1 = sin(time * speed * 1.2 + phase) * 0.5 + 0.5;
        float pulse2 = sin(time * speed * 0.4 + phase * 2.3) * 0.5 + 0.5;
        float pulse3 = sin(time * speed * 2.8 + phase * 0.7) * 0.5 + 0.5;
        float pulse = pulse1 * 0.5 + pulse2 * 0.3 + pulse3 * 0.2;

        gl_PointSize = size * pointScale * (0.3 + pulse * 0.7) / max(0.5, -mvPos.z);
        vAlpha = pulse * pulse;
        vHeat = heat * (0.6 + pulse * 0.4);
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      varying float vHeat;

      void main() {
        vec2 c = gl_PointCoord * 2.0 - 1.0;
        float r2 = dot(c, c);
        if (r2 > 1.0) discard;

        // 매우 부드러운 감쇠 (흐릿한 발광)
        float soft = exp(-r2 * 1.8);

        vec3 deepRed = vec3(0.4, 0.04, 0.005);
        vec3 orange = vec3(1.0, 0.35, 0.03);
        vec3 bright = vec3(1.0, 0.7, 0.15);

        vec3 color = mix(deepRed, orange, vHeat);
        color = mix(color, bright, vHeat * vHeat);

        float alpha = soft * vAlpha * 0.12;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: true,
  });
  const glowParticles = new THREE.Points(glowGeo, glowMat);
  glowParticles.position.copy(options.sunPosition);
  scene.add(glowParticles);

  const update = (delta: number, time: number) => {
    mesh.rotation.y += delta * 0.06;
    mesh.rotation.z = Math.sin(time * 0.18) * 0.04;
    const haloPulse = 0.5 + Math.sin(time * 0.85) * 0.5;
    haloMaterial.opacity = 0.12 + haloPulse * 0.09;
    const haloScale = options.sunRadius * (7.9 + haloPulse * 0.8);
    haloSprite.scale.set(haloScale, haloScale, 1);
    outerHaloMaterial.opacity = 0.04 + haloPulse * 0.06;
    outerHaloMaterial.rotation = time * 0.015;
    const outerHaloScale = options.sunRadius * (10.9 + haloPulse * 0.85);
    outerHaloSprite.scale.set(outerHaloScale, outerHaloScale, 1);
    glowMat.uniforms.time.value = time;
    glowParticles.rotation.y += delta * 0.012;
  };

  const dispose = () => {
    scene.remove(mesh, haloSprite, outerHaloSprite, glowParticles);
    geometry.dispose();
    material.dispose();
    haloMaterial.dispose();
    outerHaloMaterial.dispose();
    glowGeo.dispose();
    glowMat.dispose();
  };

  return { mesh, update, dispose };
}
