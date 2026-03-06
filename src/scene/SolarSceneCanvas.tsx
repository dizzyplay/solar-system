import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  ASTEROID_BELT_INNER_AU,
  ASTEROID_BELT_OUTER_AU,
  ASTEROID_BELT_PARTICLE_COUNT,
  ASTEROID_BELT_TILT_X,
  EARTH_ORBIT_LOCAL_OFFSET,
  SOLAR_SYSTEM_CAMERA_FAR,
  SOLAR_SYSTEM_OUTER_RADIUS,
  SUN_POSITION,
  SUN_RADIUS,
  TEXTURES,
} from "./constants";
import { createAsteroidBelt } from "./effects/asteroidBelt";
import { createSaturnRingLod } from "./effects/saturnRingLod";
import { createStarField } from "./effects/starField";
import { createPlanetSystem } from "./entities/planetSystem";
import { getSolarSystemPlanetDefinitions } from "./entities/solarSystemPlanets";
import type { FocusTargetId } from "./focusTargets";
import { createSolarLighting, createSunVisual } from "./entities/sun";
import { createFocusController } from "./interaction/focusController";
import { createSaturnRingColorTexture } from "./saturnRingTextures";
import { createSunHaloTexture } from "./sunTextures";

type SolarSceneCanvasProps = {
  timeScale: number;
  solarIrradiance: number;
  focusedTargetId: FocusTargetId;
  trackingEnabled: boolean;
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
  saturnRingAlphaTexture: THREE.Texture;
  saturnRingColorTexture: THREE.Texture;
  sunTexture: THREE.Texture;
  sunHaloTexture: THREE.Texture;
};

type SceneRuntime = {
  planetSystem: ReturnType<typeof createPlanetSystem>;
  sunVisual: ReturnType<typeof createSunVisual>;
  starField: ReturnType<typeof createStarField>;
  asteroidBelt: ReturnType<typeof createAsteroidBelt>;
  saturnRingLod: ReturnType<typeof createSaturnRingLod>;
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
    sceneTextures.saturnRingColorTexture,
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
    sceneTextures.saturnRingAlphaTexture,
    sceneTextures.saturnRingColorTexture,
    sceneTextures.sunTexture,
    sceneTextures.sunHaloTexture,
  ];

  for (const texture of textures) {
    texture.anisotropy = Math.min(8, maxAnisotropy);
  }
}

function getFovFitDistance(camera: THREE.PerspectiveCamera, radius: number) {
  if (radius <= 0) {
    return 0;
  }
  const verticalHalfFov = THREE.MathUtils.degToRad(camera.fov) * 0.5;
  const horizontalHalfFov = Math.atan(Math.tan(verticalHalfFov) * camera.aspect);
  const limitingHalfFov = Math.max(0.01, Math.min(verticalHalfFov, horizontalHalfFov));
  const baseDistance = radius / Math.sin(limitingHalfFov);
  return baseDistance * 1.12;
}

function SolarSceneContent({
  timeScale,
  solarIrradiance,
  focusedTargetId,
  trackingEnabled,
  onFocusedTargetIdChange,
}: SolarSceneCanvasProps) {
  const { camera, gl, scene } = useThree();
  const runtimeRef = useRef<SceneRuntime | null>(null);
  const lightingRef = useRef<ReturnType<typeof createSolarLighting> | null>(null);
  const timeScaleRef = useRef(timeScale);
  const solarIrradianceRef = useRef(solarIrradiance);
  const focusedTargetIdRef = useRef<FocusTargetId>(focusedTargetId);
  const trackingEnabledRef = useRef(trackingEnabled);
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
    solarIrradianceRef.current = solarIrradiance;
    lightingRef.current?.setReferenceIrradiance(solarIrradiance);
  }, [solarIrradiance]);

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
    trackingEnabledRef.current = trackingEnabled;
    runtimeRef.current?.focusController.setTrackingEnabled(trackingEnabled);
  }, [trackingEnabled]);

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
    const solarSystemOverviewDistance = getFovFitDistance(
      camera,
      SOLAR_SYSTEM_OUTER_RADIUS * 1.08,
    );
    controls.minDistance = 0.35;
    controls.maxDistance = Math.max(1320, solarSystemOverviewDistance);
    camera.far = Math.max(
      SOLAR_SYSTEM_CAMERA_FAR,
      controls.maxDistance + SOLAR_SYSTEM_OUTER_RADIUS * 1.4,
    );
    camera.updateProjectionMatrix();
    controls.target.set(0, 0, 0);
    controls.update();
  }, [camera, controls]);

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera) || !controls) {
      return;
    }

    let disposed = false;
    let teardown: (() => void) | undefined;
    const earthSunReferenceDistance = EARTH_ORBIT_LOCAL_OFFSET.length();
    const lighting = createSolarLighting(scene, {
      sunPosition: SUN_POSITION,
      referenceDistance: earthSunReferenceDistance,
      referenceIrradiance: solarIrradianceRef.current,
    });
    lightingRef.current = lighting;

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
        saturnRingAlphaTexture,
        sunTexture,
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
        textureLoader.loadAsync(TEXTURES.sun),
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
        saturnRingAlphaTexture,
        saturnRingColorTexture: createSaturnRingColorTexture(),
        sunTexture,
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
          saturnRingAlpha: sceneTextures.saturnRingAlphaTexture,
          saturnRingColor: sceneTextures.saturnRingColorTexture,
        }),
      );

      const earthEntity = planetSystem.entities.get("earth");
      if (!earthEntity) {
        disposeTextures(allTextures);
        planetSystem.dispose();
        throw new Error("Earth entity was not created");
      }
      const saturnEntity = planetSystem.entities.get("saturn");
      if (!saturnEntity) {
        disposeTextures(allTextures);
        planetSystem.dispose();
        throw new Error("Saturn entity was not created");
      }

      const sunVisual = createSunVisual(scene, {
        sunPosition: SUN_POSITION,
        sunRadius: SUN_RADIUS,
        sunTexture: sceneTextures.sunTexture,
        haloTexture: sceneTextures.sunHaloTexture,
      });

      const starField = createStarField(scene);
      const asteroidBelt = createAsteroidBelt(scene, {
        centerPosition: SUN_POSITION,
        earthOrbitRadius: earthSunReferenceDistance,
        count: ASTEROID_BELT_PARTICLE_COUNT,
        innerAu: ASTEROID_BELT_INNER_AU,
        outerAu: ASTEROID_BELT_OUTER_AU,
        tiltX: ASTEROID_BELT_TILT_X,
      });
      const saturnRingLod = createSaturnRingLod({
        bodyGroup: saturnEntity.bodyGroup,
        mesh: saturnEntity.mesh,
        ringMeshes: saturnEntity.ringMeshes,
      });
      const focusController = createFocusController({
        camera,
        controls,
        canvas: gl.domElement,
        selectableBodies: [sunVisual.mesh, ...planetSystem.selectableBodies],
        trackingEnabled: trackingEnabledRef.current,
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
        asteroidBelt,
        saturnRingLod,
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
        saturnRingLod.dispose();
        planetSystem.dispose();
        starField.dispose();
        asteroidBelt.dispose();
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
      lightingRef.current = null;
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
    runtime.asteroidBelt.update(scaledDelta);
    runtime.saturnRingLod.update(camera.position, scaledDelta);
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
  solarIrradiance,
  focusedTargetId,
  trackingEnabled,
  onFocusedTargetIdChange,
}: SolarSceneCanvasProps) {
  return (
    <Canvas
      camera={{
        fov: 45,
        near: 0.1,
        far: SOLAR_SYSTEM_CAMERA_FAR,
        position: [0, 0.25, 13],
      }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      onCreated={({ gl }) => {
        (gl as THREE.WebGLRenderer & { useLegacyLights?: boolean }).useLegacyLights = false;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.22;
      }}
    >
      <SolarSceneContent
        timeScale={timeScale}
        solarIrradiance={solarIrradiance}
        focusedTargetId={focusedTargetId}
        trackingEnabled={trackingEnabled}
        onFocusedTargetIdChange={onFocusedTargetIdChange}
      />
    </Canvas>
  );
}
