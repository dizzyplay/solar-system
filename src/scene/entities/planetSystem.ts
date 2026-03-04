import * as THREE from "three";
import { createPlanetEntity, type PlanetConfig, type PlanetEntity } from "./planet";

const ORBIT_ROTATION_AXIS = new THREE.Vector3(0, 1, 0);

type OrbitLineConfig = {
  color: THREE.ColorRepresentation;
  dashSize: number;
  gapSize: number;
  opacity: number;
  pointCount?: number;
};

export type PlanetNodeDefinition = {
  id: string;
  parentId?: string;
  config: PlanetConfig;
  orbitLine?: OrbitLineConfig;
  lookAtId?: string;
};

type OrbitLineRuntime = {
  geometry: THREE.BufferGeometry;
  material: THREE.LineDashedMaterial;
};

export type PlanetSystemRuntime = {
  entities: Map<string, PlanetEntity>;
  selectableBodies: THREE.Mesh[];
  update: (delta: number) => void;
  dispose: () => void;
};

function createOrbitLine(
  orbitPlane: THREE.Group,
  initialOffset: THREE.Vector3,
  orbitLine: OrbitLineConfig,
): OrbitLineRuntime {
  const pointCount = orbitLine.pointCount ?? 240;
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < pointCount; i += 1) {
    const angle = (i / pointCount) * Math.PI * 2;
    points.push(initialOffset.clone().applyAxisAngle(ORBIT_ROTATION_AXIS, angle));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineDashedMaterial({
    color: orbitLine.color,
    dashSize: orbitLine.dashSize,
    gapSize: orbitLine.gapSize,
    transparent: true,
    opacity: orbitLine.opacity,
  });
  const line = new THREE.LineLoop(geometry, material);
  line.computeLineDistances();
  orbitPlane.add(line);
  return { geometry, material };
}

export function createPlanetSystem(
  root: THREE.Object3D,
  definitions: PlanetNodeDefinition[],
): PlanetSystemRuntime {
  const entities = new Map<string, PlanetEntity>();
  const orbitLines: OrbitLineRuntime[] = [];
  const lookAtLinks: Array<{ mesh: THREE.Mesh; target: THREE.Mesh }> = [];
  const pendingLookAt: Array<{ mesh: THREE.Mesh; targetId: string }> = [];
  const selectableBodies: THREE.Mesh[] = [];

  for (const definition of definitions) {
    const parentEntity =
      definition.parentId === undefined ? undefined : entities.get(definition.parentId);
    if (definition.parentId && !parentEntity) {
      throw new Error(`Unknown parent planet id: ${definition.parentId}`);
    }

    const entityParent = parentEntity?.bodyGroup ?? root;
    const entity = createPlanetEntity(entityParent, definition.config);
    entities.set(definition.id, entity);
    selectableBodies.push(entity.mesh);

    if (definition.orbitLine && definition.config.orbit && entity.orbitPlane) {
      orbitLines.push(
        createOrbitLine(
          entity.orbitPlane,
          definition.config.orbit.initialOffset,
          definition.orbitLine,
        ),
      );
    }

    if (definition.lookAtId) {
      pendingLookAt.push({ mesh: entity.mesh, targetId: definition.lookAtId });
    }
  }

  for (const lookAt of pendingLookAt) {
    const target = entities.get(lookAt.targetId);
    if (!target) {
      throw new Error(`Unknown look-at target id: ${lookAt.targetId}`);
    }
    lookAtLinks.push({ mesh: lookAt.mesh, target: target.mesh });
  }

  const targetWorldPosition = new THREE.Vector3();
  const update = (delta: number) => {
    for (const entity of entities.values()) {
      entity.update(delta);
    }
    for (const lookAtLink of lookAtLinks) {
      lookAtLink.target.getWorldPosition(targetWorldPosition);
      lookAtLink.mesh.lookAt(targetWorldPosition);
    }
  };

  const dispose = () => {
    for (const entity of entities.values()) {
      entity.geometry.dispose();
      entity.material.dispose();
    }
    for (const orbitLine of orbitLines) {
      orbitLine.geometry.dispose();
      orbitLine.material.dispose();
    }
  };

  return { entities, selectableBodies, update, dispose };
}
