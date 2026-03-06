import * as THREE from "three";

export type PlanetMaterialOptions = {
  map?: THREE.Texture;
  alphaMap?: THREE.Texture;
  normalMap?: THREE.Texture;
  normalScale?: THREE.Vector2 | number;
  specularMap?: THREE.Texture;
  specular?: THREE.ColorRepresentation;
  emissive?: THREE.ColorRepresentation;
  emissiveIntensity?: number;
  shininess?: number;
  bumpMap?: THREE.Texture;
  bumpScale?: number;
  color?: THREE.ColorRepresentation;
};

export type PlanetTransformOptions = {
  position?: THREE.Vector3;
  rotation?: {
    x?: number;
    y?: number;
    z?: number;
  };
};

export type PlanetMeshOptions = {
  radius: number;
  widthSegments?: number;
  heightSegments?: number;
  focusDistance?: number;
  material: PlanetMaterialOptions;
  transform?: PlanetTransformOptions;
};

export type PlanetMeshParts = {
  mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhongMaterial>;
  geometry: THREE.SphereGeometry;
  material: THREE.MeshPhongMaterial;
};

export type PlanetOrbitOptions = {
  centerPosition?: THREE.Vector3;
  initialOffset: THREE.Vector3;
  inclinationX?: number;
  speed?: number;
};

export type PlanetConfig = {
  mesh: PlanetMeshOptions;
  axialTiltZ?: number;
  spinSpeed?: number;
  orbit?: PlanetOrbitOptions;
  layers?: PlanetLayerOptions[];
  rings?: PlanetRingOptions[];
  nightLights?: PlanetNightLightOptions[];
};

export type PlanetEntity = PlanetMeshParts & {
  bodyGroup: THREE.Group;
  orbitCenter?: THREE.Group;
  orbitPlane?: THREE.Group;
  ringMeshes: Array<THREE.Mesh<THREE.RingGeometry, THREE.MeshPhongMaterial>>;
  update: (delta: number) => void;
  dispose: () => void;
};

export type PlanetLayerOptions = {
  radiusScale: number;
  spinSpeed?: number;
  widthSegments?: number;
  heightSegments?: number;
  material: PlanetMaterialOptions & {
    transparent?: boolean;
    opacity?: number;
    depthWrite?: boolean;
    blending?: THREE.Blending;
    side?: THREE.Side;
  };
};

export type PlanetRingOptions = {
  innerRadiusScale: number;
  outerRadiusScale: number;
  tiltX?: number;
  material: PlanetMaterialOptions & {
    transparent?: boolean;
    opacity?: number;
    depthWrite?: boolean;
    blending?: THREE.Blending;
    side?: THREE.Side;
  };
};

export type PlanetNightLightOptions = {
  texture: THREE.Texture;
  radiusScale?: number;
  intensity?: number;
  color?: THREE.ColorRepresentation;
};

type PlanetMaterialRuntimeOptions = PlanetMaterialOptions & {
  transparent?: boolean;
  opacity?: number;
  depthWrite?: boolean;
  blending?: THREE.Blending;
  side?: THREE.Side;
};

function createPhongMaterial(options: PlanetMaterialRuntimeOptions) {
  const params: THREE.MeshPhongMaterialParameters = {};

  if (options.map !== undefined) {
    params.map = options.map;
  }
  if (options.normalMap !== undefined) {
    params.normalMap = options.normalMap;
  }
  if (options.alphaMap !== undefined) {
    params.alphaMap = options.alphaMap;
  }
  if (options.specularMap !== undefined) {
    params.specularMap = options.specularMap;
  }
  if (options.specular !== undefined) {
    params.specular = new THREE.Color(options.specular);
  }
  if (options.emissive !== undefined) {
    params.emissive = new THREE.Color(options.emissive);
  }
  if (options.emissiveIntensity !== undefined) {
    params.emissiveIntensity = options.emissiveIntensity;
  }
  if (options.shininess !== undefined) {
    params.shininess = options.shininess;
  }
  if (options.bumpMap !== undefined) {
    params.bumpMap = options.bumpMap;
  }
  if (options.bumpScale !== undefined) {
    params.bumpScale = options.bumpScale;
  }
  if (options.color !== undefined) {
    params.color = options.color;
  }
  if (options.transparent !== undefined) {
    params.transparent = options.transparent;
  }
  if (options.opacity !== undefined) {
    params.opacity = options.opacity;
  }
  if (options.depthWrite !== undefined) {
    params.depthWrite = options.depthWrite;
  }
  if (options.blending !== undefined) {
    params.blending = options.blending;
  }
  if (options.side !== undefined) {
    params.side = options.side;
  }

  const material = new THREE.MeshPhongMaterial(params);
  if (options.normalScale !== undefined) {
    if (typeof options.normalScale === "number") {
      material.normalScale.setScalar(options.normalScale);
    } else {
      material.normalScale.copy(options.normalScale);
    }
  }

  return material;
}

function createRingGeometry(innerRadius: number, outerRadius: number) {
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 256, 1);
  const positions = geometry.attributes.position;
  const uvs = geometry.attributes.uv;
  const radiusSpan = Math.max(outerRadius - innerRadius, 1e-6);

  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const radius = Math.hypot(x, y);
    const radialT = THREE.MathUtils.clamp(
      (radius - innerRadius) / radiusSpan,
      0,
      1,
    );
    uvs.setXY(i, radialT, 0.5);
  }

  return geometry;
}

export function createPlanetMesh(options: PlanetMeshOptions): PlanetMeshParts {
  const geometry = new THREE.SphereGeometry(
    options.radius,
    options.widthSegments ?? 96,
    options.heightSegments ?? 96,
  );

  const material = createPhongMaterial(options.material);

  const mesh = new THREE.Mesh(geometry, material);
  if (options.transform?.position) {
    mesh.position.copy(options.transform.position);
  }
  if (options.transform?.rotation?.x !== undefined) {
    mesh.rotation.x = options.transform.rotation.x;
  }
  if (options.transform?.rotation?.y !== undefined) {
    mesh.rotation.y = options.transform.rotation.y;
  }
  if (options.transform?.rotation?.z !== undefined) {
    mesh.rotation.z = options.transform.rotation.z;
  }
  if (typeof options.focusDistance === "number") {
    mesh.userData.focusDistance = options.focusDistance;
  }

  return { mesh, geometry, material };
}

export function createPlanetEntity(
  parent: THREE.Object3D,
  config: PlanetConfig,
): PlanetEntity {
  const { mesh, geometry, material } = createPlanetMesh(config.mesh);
  const bodyGroup = new THREE.Group();
  if (typeof config.axialTiltZ === "number") {
    bodyGroup.rotation.z = config.axialTiltZ;
  }
  bodyGroup.add(mesh);

  let orbitCenter: THREE.Group | undefined;
  let orbitPlane: THREE.Group | undefined;
  if (config.orbit) {
    orbitCenter = new THREE.Group();
    if (config.orbit.centerPosition) {
      orbitCenter.position.copy(config.orbit.centerPosition);
    }
    parent.add(orbitCenter);

    orbitPlane = new THREE.Group();
    orbitPlane.rotation.x = config.orbit.inclinationX ?? 0;
    orbitCenter.add(orbitPlane);

    bodyGroup.position.copy(config.orbit.initialOffset);
    orbitPlane.add(bodyGroup);
  } else {
    parent.add(bodyGroup);
  }

  const layerParts: PlanetMeshParts[] = [];
  const layerSpeeds: number[] = [];
  const ringParts: Array<{
    mesh: THREE.Mesh<THREE.RingGeometry, THREE.MeshPhongMaterial>;
    geometry: THREE.RingGeometry;
    material: THREE.MeshPhongMaterial;
  }> = [];
  const nightLightParts: Array<{
    geometry: THREE.SphereGeometry;
    material: THREE.ShaderMaterial;
  }> = [];
  const layerSegments = {
    width: config.mesh.widthSegments ?? 96,
    height: config.mesh.heightSegments ?? 96,
  };

  if (config.layers) {
    for (const layerConfig of config.layers) {
      const layer = createPlanetMesh({
        radius: config.mesh.radius * layerConfig.radiusScale,
        widthSegments: layerConfig.widthSegments ?? layerSegments.width,
        heightSegments: layerConfig.heightSegments ?? layerSegments.height,
        material: layerConfig.material,
      });
      layer.material.transparent = layerConfig.material.transparent ?? true;
      layer.material.opacity = layerConfig.material.opacity ?? 1;
      layer.material.depthWrite = layerConfig.material.depthWrite ?? true;
      layer.material.blending =
        layerConfig.material.blending ?? THREE.NormalBlending;
      if (layerConfig.material.side !== undefined) {
        layer.material.side = layerConfig.material.side;
      }
      bodyGroup.add(layer.mesh);
      layerParts.push(layer);
      layerSpeeds.push(layerConfig.spinSpeed ?? 0);
    }
  }

  if (config.rings) {
    for (const ringConfig of config.rings) {
      const geometry = createRingGeometry(
        config.mesh.radius * ringConfig.innerRadiusScale,
        config.mesh.radius * ringConfig.outerRadiusScale,
      );
      const material = createPhongMaterial({
        ...ringConfig.material,
        transparent: ringConfig.material.transparent ?? true,
        opacity: ringConfig.material.opacity ?? 1,
        depthWrite: ringConfig.material.depthWrite ?? false,
        blending: ringConfig.material.blending ?? THREE.NormalBlending,
        side: ringConfig.material.side ?? THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(geometry, material);
      ringMesh.rotation.x = ringConfig.tiltX ?? Math.PI / 2;
      bodyGroup.add(ringMesh);
      ringParts.push({ mesh: ringMesh, geometry, material });
    }
  }

  if (config.nightLights) {
    const sunPosition = config.orbit?.centerPosition ?? new THREE.Vector3();
    for (const nightLightConfig of config.nightLights) {
      const geometry = new THREE.SphereGeometry(
        config.mesh.radius * (nightLightConfig.radiusScale ?? 1.002),
        layerSegments.width,
        layerSegments.height,
      );
      const material = new THREE.ShaderMaterial({
        uniforms: {
          nightMap: { value: nightLightConfig.texture },
          sunPosition: { value: sunPosition.clone() },
          tint: { value: new THREE.Color(nightLightConfig.color ?? "#ffd7a3") },
          intensity: { value: nightLightConfig.intensity ?? 1 },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vWorldNormal;
          varying vec3 vWorldPosition;

          void main() {
            vUv = uv;
            vWorldNormal = normalize(mat3(modelMatrix) * normal);
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
          }
        `,
        fragmentShader: `
          uniform sampler2D nightMap;
          uniform vec3 sunPosition;
          uniform vec3 tint;
          uniform float intensity;
          varying vec2 vUv;
          varying vec3 vWorldNormal;
          varying vec3 vWorldPosition;

          void main() {
            vec3 toSun = normalize(sunPosition - vWorldPosition);
            float litAmount = dot(normalize(vWorldNormal), toSun);
            float dayAmount = smoothstep(-0.05, 0.2, litAmount);
            float nightAmount = 1.0 - dayAmount;

            vec3 nightColor = texture2D(nightMap, vUv).rgb * tint * intensity;
            float luminance = dot(nightColor, vec3(0.2126, 0.7152, 0.0722));
            float alpha = clamp(luminance * nightAmount * 1.6, 0.0, 1.0);

            gl_FragColor = vec4(nightColor * nightAmount, alpha);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const nightLightMesh = new THREE.Mesh(geometry, material);
      // Attach to the rotating planet mesh so night lights spin with the surface.
      mesh.add(nightLightMesh);
      nightLightParts.push({ geometry, material });
    }
  }

  const spinSpeed = config.spinSpeed ?? 0;
  const orbitSpeed = config.orbit?.speed ?? 0;
  const update = (delta: number) => {
    if (spinSpeed !== 0) {
      mesh.rotation.y += delta * spinSpeed;
    }
    if (orbitCenter && orbitSpeed !== 0) {
      orbitCenter.rotation.y += delta * orbitSpeed;
    }
    for (let i = 0; i < layerParts.length; i += 1) {
      const layerSpeed = layerSpeeds[i];
      if (layerSpeed !== 0) {
        layerParts[i].mesh.rotation.y += delta * layerSpeed;
      }
    }
  };

  const dispose = () => {
    geometry.dispose();
    material.dispose();
    for (const layer of layerParts) {
      layer.geometry.dispose();
      layer.material.dispose();
    }
    for (const ring of ringParts) {
      ring.geometry.dispose();
      ring.material.dispose();
    }
    for (const nightLight of nightLightParts) {
      nightLight.geometry.dispose();
      nightLight.material.dispose();
    }
  };

  return {
    mesh,
    geometry,
    material,
    bodyGroup,
    orbitCenter,
    orbitPlane,
    ringMeshes: ringParts.map((ring) => ring.mesh),
    update,
    dispose,
  };
}
