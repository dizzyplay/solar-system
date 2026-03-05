import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { SUN_DISTANCE, SUN_POSITION, SUN_RADIUS, TEXTURES } from "./constants";
import { createStarField } from "./effects/starField";
import { createPlanetSystem } from "./entities/planetSystem";
import { getSolarSystemPlanetDefinitions } from "./entities/solarSystemPlanets";
import type { FocusTargetId } from "./focusTargets";
import { createSolarLighting, createSunVisual } from "./entities/sun";
import { createFocusController } from "./interaction/focusController";
import { createSunHaloTexture, createSunTexture } from "./sunTextures";

type SolarSceneCanvasProps = {
  timeScale: number;
  focusedTargetId: FocusTargetId;
  onFocusedTargetIdChange: (nextTargetId: FocusTargetId) => void;
};

type SceneTextures = {
  earthDay: THREE.Texture;
  earthNormal: THREE.Texture;
  earthSpecular: THREE.Texture;
  earthNight: THREE.Texture;
  mercuryTexture: THREE.Texture;
  venusTexture: THREE.Texture;
  venusCloudTexture: THREE.Texture;
  marsTexture: THREE.Texture;
  jupiterTexture: THREE.Texture;
  saturnTexture: THREE.Texture;
  uranusTexture: THREE.Texture;
  neptuneTexture: THREE.Texture;
  moonTexture: THREE.Texture;
  ioTexture: THREE.Texture;
  europaTexture: THREE.Texture;
  ganymedeTexture: THREE.Texture;
  callistoTexture: THREE.Texture;
  titanTexture: THREE.Texture;
  rheaTexture: THREE.Texture;
  iapetusTexture: THREE.Texture;
  dioneTexture: THREE.Texture;
  tethysTexture: THREE.Texture;
  enceladusTexture: THREE.Texture;
  mimasTexture: THREE.Texture;
  saturnRingTexture: THREE.Texture;
  sunTexture: THREE.Texture;
  sunHaloTexture: THREE.Texture;
};

type SceneRuntime = {
  planetSystem: ReturnType<typeof createPlanetSystem>;
  sunVisual: ReturnType<typeof createSunVisual>;
  starField: ReturnType<typeof createStarField>;
  focusController: ReturnType<typeof createFocusController>;
};

function disposeTextures(textures: THREE.Texture[]) {
  for (const texture of textures) {
    texture.dispose();
  }
}

function configureTextures(
  renderer: THREE.WebGLRenderer,
  sceneTextures: SceneTextures,
) {
  const colorTextures = [
    sceneTextures.earthDay,
    sceneTextures.earthNight,
    sceneTextures.mercuryTexture,
    sceneTextures.venusTexture,
    sceneTextures.venusCloudTexture,
    sceneTextures.marsTexture,
    sceneTextures.jupiterTexture,
    sceneTextures.saturnTexture,
    sceneTextures.uranusTexture,
    sceneTextures.neptuneTexture,
    sceneTextures.moonTexture,
    sceneTextures.ioTexture,
    sceneTextures.europaTexture,
    sceneTextures.ganymedeTexture,
    sceneTextures.callistoTexture,
    sceneTextures.titanTexture,
    sceneTextures.rheaTexture,
    sceneTextures.iapetusTexture,
    sceneTextures.dioneTexture,
    sceneTextures.tethysTexture,
    sceneTextures.enceladusTexture,
    sceneTextures.mimasTexture,
    sceneTextures.saturnRingTexture,
  ];
  for (const texture of colorTextures) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }

  const repeatingTextures = [
    sceneTextures.earthDay,
    sceneTextures.earthNormal,
    sceneTextures.earthSpecular,
    sceneTextures.earthNight,
    sceneTextures.mercuryTexture,
    sceneTextures.venusTexture,
    sceneTextures.venusCloudTexture,
    sceneTextures.marsTexture,
    sceneTextures.jupiterTexture,
    sceneTextures.saturnTexture,
    sceneTextures.uranusTexture,
    sceneTextures.neptuneTexture,
    sceneTextures.moonTexture,
    sceneTextures.ioTexture,
    sceneTextures.europaTexture,
    sceneTextures.ganymedeTexture,
    sceneTextures.callistoTexture,
    sceneTextures.titanTexture,
    sceneTextures.rheaTexture,
    sceneTextures.iapetusTexture,
    sceneTextures.dioneTexture,
    sceneTextures.tethysTexture,
    sceneTextures.enceladusTexture,
    sceneTextures.mimasTexture,
  ];
  for (const texture of repeatingTextures) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
  }

  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  const textures = [
    sceneTextures.earthDay,
    sceneTextures.earthNormal,
    sceneTextures.earthSpecular,
    sceneTextures.earthNight,
    sceneTextures.mercuryTexture,
    sceneTextures.venusTexture,
    sceneTextures.venusCloudTexture,
    sceneTextures.marsTexture,
    sceneTextures.jupiterTexture,
    sceneTextures.saturnTexture,
    sceneTextures.uranusTexture,
    sceneTextures.neptuneTexture,
    sceneTextures.moonTexture,
    sceneTextures.ioTexture,
    sceneTextures.europaTexture,
    sceneTextures.ganymedeTexture,
    sceneTextures.callistoTexture,
    sceneTextures.titanTexture,
    sceneTextures.rheaTexture,
    sceneTextures.iapetusTexture,
    sceneTextures.dioneTexture,
    sceneTextures.tethysTexture,
    sceneTextures.enceladusTexture,
    sceneTextures.mimasTexture,
    sceneTextures.saturnRingTexture,
    sceneTextures.sunTexture,
    sceneTextures.sunHaloTexture,
  ];

  for (const texture of textures) {
    texture.anisotropy = Math.min(8, maxAnisotropy);
  }
}

function SolarSceneContent({
  timeScale,
  focusedTargetId,
  onFocusedTargetIdChange,
}: SolarSceneCanvasProps) {
  const { camera, gl, scene } = useThree();
  const runtimeRef = useRef<SceneRuntime | null>(null);
  const timeScaleRef = useRef(timeScale);
  const focusedTargetIdRef = useRef<FocusTargetId>(focusedTargetId);
  const focusTargetByIdRef = useRef(new Map<FocusTargetId, THREE.Object3D>());
  const focusIdByTargetRef = useRef(new Map<THREE.Object3D, FocusTargetId>());
  const animationTimeRef = useRef(0);
  const [controls, setControls] = useState<OrbitControlsImpl | null>(null);

  const onControlsReady = useCallback((next: OrbitControlsImpl | null) => {
    setControls(next);
  }, []);

  useEffect(() => {
    timeScaleRef.current = timeScale;
  }, [timeScale]);

  useEffect(() => {
    focusedTargetIdRef.current = focusedTargetId;
    const runtime = runtimeRef.current;
    if (!runtime) {
      return;
    }
    const nextBody = focusTargetByIdRef.current.get(focusedTargetId) ?? null;
    runtime.focusController.setFocusedBody(nextBody);
  }, [focusedTargetId]);

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera) || !controls) {
      return;
    }

    controls.zoomToCursor = true;
    controls.screenSpacePanning = true;
    controls.keyPanSpeed = 18;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    };
    controls.minDistance = 0.35;
    controls.maxDistance = Math.max(120, SUN_DISTANCE * 3.2);
    controls.target.set(0, 0, 0);
    controls.update();
  }, [camera, controls]);

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera) || !controls) {
      return;
    }

    let disposed = false;
    let teardown: (() => void) | undefined;
    const lighting = createSolarLighting(scene, {
      sunPosition: SUN_POSITION,
      sunRadius: SUN_RADIUS,
    });

    const initialize = async () => {
      const textureLoader = new THREE.TextureLoader();
      const [
        earthDay,
        earthNormal,
        earthSpecular,
        earthNight,
        mercuryTexture,
        venusTexture,
        venusCloudTexture,
        marsTexture,
        jupiterTexture,
        saturnTexture,
        uranusTexture,
        neptuneTexture,
        moonTexture,
        ioTexture,
        europaTexture,
        ganymedeTexture,
        callistoTexture,
        titanTexture,
        rheaTexture,
        iapetusTexture,
        dioneTexture,
        tethysTexture,
        enceladusTexture,
        mimasTexture,
        saturnRingTexture,
      ] = await Promise.all([
        textureLoader.loadAsync(TEXTURES.earthDay),
        textureLoader.loadAsync(TEXTURES.earthNormal),
        textureLoader.loadAsync(TEXTURES.earthSpecular),
        textureLoader.loadAsync(TEXTURES.earthNight),
        textureLoader.loadAsync(TEXTURES.mercury),
        textureLoader.loadAsync(TEXTURES.venus),
        textureLoader.loadAsync(TEXTURES.venusClouds),
        textureLoader.loadAsync(TEXTURES.mars),
        textureLoader.loadAsync(TEXTURES.jupiter),
        textureLoader.loadAsync(TEXTURES.saturn),
        textureLoader.loadAsync(TEXTURES.uranus),
        textureLoader.loadAsync(TEXTURES.neptune),
        textureLoader.loadAsync(TEXTURES.moon),
        textureLoader.loadAsync(TEXTURES.io),
        textureLoader.loadAsync(TEXTURES.europa),
        textureLoader.loadAsync(TEXTURES.ganymede),
        textureLoader.loadAsync(TEXTURES.callisto),
        textureLoader.loadAsync(TEXTURES.titan),
        textureLoader.loadAsync(TEXTURES.rhea),
        textureLoader.loadAsync(TEXTURES.iapetus),
        textureLoader.loadAsync(TEXTURES.dione),
        textureLoader.loadAsync(TEXTURES.tethys),
        textureLoader.loadAsync(TEXTURES.enceladus),
        textureLoader.loadAsync(TEXTURES.mimas),
        textureLoader.loadAsync(TEXTURES.saturnRing),
      ]);

      const sceneTextures: SceneTextures = {
        earthDay,
        earthNormal,
        earthSpecular,
        earthNight,
        moonTexture,
        mercuryTexture,
        venusTexture,
        venusCloudTexture,
        marsTexture,
        jupiterTexture,
        saturnTexture,
        uranusTexture,
        neptuneTexture,
        ioTexture,
        europaTexture,
        ganymedeTexture,
        callistoTexture,
        titanTexture,
        rheaTexture,
        iapetusTexture,
        dioneTexture,
        tethysTexture,
        enceladusTexture,
        mimasTexture,
        saturnRingTexture,
        sunTexture: createSunTexture(),
        sunHaloTexture: createSunHaloTexture(),
      };

      const allTextures = Object.values(sceneTextures);
      if (disposed) {
        disposeTextures(allTextures);
        return;
      }

      configureTextures(gl, sceneTextures);

      const planetSystem = createPlanetSystem(
        scene,
        getSolarSystemPlanetDefinitions({
          earthDay: sceneTextures.earthDay,
          earthNormal: sceneTextures.earthNormal,
          earthSpecular: sceneTextures.earthSpecular,
          earthNight: sceneTextures.earthNight,
          mercury: sceneTextures.mercuryTexture,
          venus: sceneTextures.venusTexture,
          venusClouds: sceneTextures.venusCloudTexture,
          mars: sceneTextures.marsTexture,
          jupiter: sceneTextures.jupiterTexture,
          saturn: sceneTextures.saturnTexture,
          uranus: sceneTextures.uranusTexture,
          neptune: sceneTextures.neptuneTexture,
          moon: sceneTextures.moonTexture,
          io: sceneTextures.ioTexture,
          europa: sceneTextures.europaTexture,
          ganymede: sceneTextures.ganymedeTexture,
          callisto: sceneTextures.callistoTexture,
          titan: sceneTextures.titanTexture,
          rhea: sceneTextures.rheaTexture,
          iapetus: sceneTextures.iapetusTexture,
          dione: sceneTextures.dioneTexture,
          tethys: sceneTextures.tethysTexture,
          enceladus: sceneTextures.enceladusTexture,
          mimas: sceneTextures.mimasTexture,
          saturnRing: sceneTextures.saturnRingTexture,
        }),
      );

      const earthEntity = planetSystem.entities.get("earth");
      if (!earthEntity) {
        disposeTextures(allTextures);
        planetSystem.dispose();
        throw new Error("Earth entity was not created");
      }

      const sunVisual = createSunVisual(scene, {
        sunPosition: SUN_POSITION,
        sunRadius: SUN_RADIUS,
        sunTexture: sceneTextures.sunTexture,
        haloTexture: sceneTextures.sunHaloTexture,
      });

      const starField = createStarField(scene);
      const focusController = createFocusController({
        camera,
        controls,
        canvas: gl.domElement,
        selectableBodies: [sunVisual.mesh, ...planetSystem.selectableBodies],
        initialFocusedBody: earthEntity.mesh,
        onFocusChanged: (body) => {
          const nextTargetId =
            body === null
              ? "none"
              : (focusIdByTargetRef.current.get(body) ?? "none");
          onFocusedTargetIdChange(nextTargetId);
        },
      });

      const focusTargetById = new Map<FocusTargetId, THREE.Object3D>();
      const focusIdByTarget = new Map<THREE.Object3D, FocusTargetId>();
      focusTargetById.set("sun", sunVisual.mesh);
      focusIdByTarget.set(sunVisual.mesh, "sun");
      for (const [id, entity] of planetSystem.entities) {
        const targetId = id as FocusTargetId;
        focusTargetById.set(targetId, entity.mesh);
        focusIdByTarget.set(entity.mesh, targetId);
      }
      focusTargetByIdRef.current = focusTargetById;
      focusIdByTargetRef.current = focusIdByTarget;

      runtimeRef.current = {
        planetSystem,
        sunVisual,
        starField,
        focusController,
      };

      const initialFocusBody =
        focusedTargetIdRef.current === "none"
          ? null
          : (focusTargetById.get(focusedTargetIdRef.current) ?? earthEntity.mesh);
      focusController.setFocusedBody(initialFocusBody);

      teardown = () => {
        runtimeRef.current = null;
        focusTargetByIdRef.current.clear();
        focusIdByTargetRef.current.clear();
        animationTimeRef.current = 0;
        focusController.dispose();
        planetSystem.dispose();
        starField.dispose();
        sunVisual.dispose();
        disposeTextures(allTextures);
      };

      if (disposed && teardown) {
        teardown();
      }
    };

    initialize().catch((error) => {
      console.error("Failed to initialize 3D scene", error);
    });

    return () => {
      disposed = true;
      if (teardown) {
        teardown();
      }
      lighting.dispose();
    };
  }, [camera, controls, gl, onFocusedTargetIdChange, scene]);

  useFrame((_, delta) => {
    const runtime = runtimeRef.current;
    if (!runtime) {
      return;
    }

    const scaledDelta = Math.min(delta, 0.1) * timeScaleRef.current;
    animationTimeRef.current += scaledDelta;
    runtime.planetSystem.update(scaledDelta);
    runtime.starField.update(camera.position, scaledDelta);
    runtime.sunVisual.update(scaledDelta, animationTimeRef.current);
    runtime.focusController.update();
  });

  return (
    <OrbitControls
      ref={onControlsReady}
      makeDefault
      enablePan
      enableZoom
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.75}
      zoomSpeed={1.2}
      panSpeed={1.35}
    />
  );
}

export function SolarSceneCanvas({
  timeScale,
  focusedTargetId,
  onFocusedTargetIdChange,
}: SolarSceneCanvasProps) {
  return (
    <Canvas
      camera={{ fov: 45, near: 0.1, far: 600, position: [0, 0.25, 13] }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.22;
      }}
    >
      <SolarSceneContent
        timeScale={timeScale}
        focusedTargetId={focusedTargetId}
        onFocusedTargetIdChange={onFocusedTargetIdChange}
      />
    </Canvas>
  );
}
