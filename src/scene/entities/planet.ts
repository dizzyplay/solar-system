import * as THREE from "three";

export type PlanetMaterialOptions = {
  map?: THREE.Texture;
  normalMap?: THREE.Texture;
  normalScale?: THREE.Vector2 | number;
  specularMap?: THREE.Texture;
  specular?: THREE.ColorRepresentation;
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
};

export type PlanetEntity = PlanetMeshParts & {
  bodyGroup: THREE.Group;
  orbitCenter?: THREE.Group;
  orbitPlane?: THREE.Group;
  update: (delta: number) => void;
};

export function createPlanetMesh(options: PlanetMeshOptions): PlanetMeshParts {
  const geometry = new THREE.SphereGeometry(
    options.radius,
    options.widthSegments ?? 96,
    options.heightSegments ?? 96,
  );

  const material = new THREE.MeshPhongMaterial({
    map: options.material.map,
    normalMap: options.material.normalMap,
    specularMap: options.material.specularMap,
    specular:
      options.material.specular === undefined
        ? undefined
        : new THREE.Color(options.material.specular),
    shininess: options.material.shininess,
    bumpMap: options.material.bumpMap,
    bumpScale: options.material.bumpScale,
    color: options.material.color,
  });

  if (options.material.normalScale !== undefined) {
    if (typeof options.material.normalScale === "number") {
      material.normalScale.setScalar(options.material.normalScale);
    } else {
      material.normalScale.copy(options.material.normalScale);
    }
  }

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

  const spinSpeed = config.spinSpeed ?? 0;
  const orbitSpeed = config.orbit?.speed ?? 0;
  const update = (delta: number) => {
    if (spinSpeed !== 0) {
      mesh.rotation.y += delta * spinSpeed;
    }
    if (orbitCenter && orbitSpeed !== 0) {
      orbitCenter.rotation.y += delta * orbitSpeed;
    }
  };

  return {
    mesh,
    geometry,
    material,
    bodyGroup,
    orbitCenter,
    orbitPlane,
    update,
  };
}
