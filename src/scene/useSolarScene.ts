import { useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { SUN_DISTANCE, SUN_POSITION, SUN_RADIUS, TEXTURES } from "./constants";
import { createStarField } from "./effects/starField";
import { createPlanetSystem } from "./entities/planetSystem";
import { getSolarSystemPlanetDefinitions } from "./entities/solarSystemPlanets";
import { createSolarLighting, createSunVisual } from "./entities/sun";
import { createFocusController } from "./interaction/focusController";
import { createSunHaloTexture, createSunTexture } from "./sunTextures";

type UseSolarSceneOptions = {
  hostRef: RefObject<HTMLDivElement | null>;
  timeScale: number;
};

type SceneTextures = {
  earthDay: THREE.Texture;
  earthNormal: THREE.Texture;
  earthSpecular: THREE.Texture;
  moonTexture: THREE.Texture;
  mercuryTexture: THREE.Texture;
  venusTexture: THREE.Texture;
  venusCloudTexture: THREE.Texture;
  sunTexture: THREE.Texture;
  sunHaloTexture: THREE.Texture;
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
  sceneTextures.earthDay.colorSpace = THREE.SRGBColorSpace;
  sceneTextures.moonTexture.colorSpace = THREE.SRGBColorSpace;
  sceneTextures.mercuryTexture.colorSpace = THREE.SRGBColorSpace;
  sceneTextures.venusTexture.colorSpace = THREE.SRGBColorSpace;
  sceneTextures.venusCloudTexture.colorSpace = THREE.SRGBColorSpace;

  sceneTextures.earthDay.wrapS = THREE.RepeatWrapping;
  sceneTextures.earthNormal.wrapS = THREE.RepeatWrapping;
  sceneTextures.earthSpecular.wrapS = THREE.RepeatWrapping;
  sceneTextures.moonTexture.wrapS = THREE.RepeatWrapping;
  sceneTextures.mercuryTexture.wrapS = THREE.RepeatWrapping;
  sceneTextures.venusTexture.wrapS = THREE.RepeatWrapping;
  sceneTextures.venusCloudTexture.wrapS = THREE.RepeatWrapping;

  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  const textures = [
    sceneTextures.earthDay,
    sceneTextures.earthNormal,
    sceneTextures.earthSpecular,
    sceneTextures.moonTexture,
    sceneTextures.mercuryTexture,
    sceneTextures.venusTexture,
    sceneTextures.venusCloudTexture,
    sceneTextures.sunTexture,
    sceneTextures.sunHaloTexture,
  ];
  for (const texture of textures) {
    texture.anisotropy = Math.min(8, maxAnisotropy);
  }
}

export function useSolarScene({ hostRef, timeScale }: UseSolarSceneOptions) {
  const timeScaleRef = useRef(timeScale);
  const [hmrVersion, setHmrVersion] = useState(0);

  useEffect(() => {
    if (!import.meta.hot) {
      return;
    }
    const handleAfterUpdate = () => {
      setHmrVersion((version) => version + 1);
    };
    import.meta.hot.on("vite:afterUpdate", handleAfterUpdate);
    return () => {
      import.meta.hot?.off("vite:afterUpdate", handleAfterUpdate);
    };
  }, []);

  useEffect(() => {
    timeScaleRef.current = timeScale;
  }, [timeScale]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    let disposed = false;
    let teardown: (() => void) | undefined;

    const initialize = async () => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        45,
        host.clientWidth / host.clientHeight,
        0.1,
        600,
      );
      camera.position.set(0, 0.25, 13);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.22;
      host.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enablePan = true;
      controls.enableZoom = true;
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.rotateSpeed = 0.75;
      controls.zoomSpeed = 1.2;
      controls.panSpeed = 1.35;
      controls.zoomToCursor = true;
      controls.screenSpacePanning = true;
      controls.keyPanSpeed = 18;
      controls.listenToKeyEvents(window);
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      };
      controls.minDistance = 0.35;
      controls.maxDistance = Math.max(120, SUN_DISTANCE * 3.2);
      controls.target.set(0, 0, 0);
      controls.update();

      const lighting = createSolarLighting(scene, {
        sunPosition: SUN_POSITION,
        sunRadius: SUN_RADIUS,
      });

      const textureLoader = new THREE.TextureLoader();
      const [
        earthDay,
        earthNormal,
        earthSpecular,
        moonTexture,
        mercuryTexture,
        venusTexture,
        venusCloudTexture,
      ] = await Promise.all([
        textureLoader.loadAsync(TEXTURES.earthDay),
        textureLoader.loadAsync(TEXTURES.earthNormal),
        textureLoader.loadAsync(TEXTURES.earthSpecular),
        textureLoader.loadAsync(TEXTURES.moon),
        textureLoader.loadAsync(TEXTURES.mercury),
        textureLoader.loadAsync(TEXTURES.venus),
        textureLoader.loadAsync(TEXTURES.venusClouds),
      ]);
      const sceneTextures: SceneTextures = {
        earthDay,
        earthNormal,
        earthSpecular,
        moonTexture,
        mercuryTexture,
        venusTexture,
        venusCloudTexture,
        sunTexture: createSunTexture(),
        sunHaloTexture: createSunHaloTexture(),
      };
      const allTextures = Object.values(sceneTextures);

      if (disposed) {
        disposeTextures(allTextures);
        lighting.dispose();
        controls.dispose();
        renderer.dispose();
        if (host.contains(renderer.domElement)) {
          host.removeChild(renderer.domElement);
        }
        return;
      }

      configureTextures(renderer, sceneTextures);

      const planetSystem = createPlanetSystem(
        scene,
        getSolarSystemPlanetDefinitions({
          earthDay: sceneTextures.earthDay,
          earthNormal: sceneTextures.earthNormal,
          earthSpecular: sceneTextures.earthSpecular,
          moon: sceneTextures.moonTexture,
          mercury: sceneTextures.mercuryTexture,
          venus: sceneTextures.venusTexture,
          venusClouds: sceneTextures.venusCloudTexture,
        }),
      );
      const earthEntity = planetSystem.entities.get("earth");
      if (!earthEntity) {
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
        canvas: renderer.domElement,
        selectableBodies: [sunVisual.mesh, ...planetSystem.selectableBodies],
        initialFocusedBody: earthEntity.mesh,
      });

      const getViewportSize = () => {
        const rect = host.getBoundingClientRect();
        const width = Math.max(
          host.clientWidth,
          Math.floor(rect.width),
          window.innerWidth,
          320,
        );
        const height = Math.max(
          host.clientHeight,
          Math.floor(rect.height),
          window.innerHeight,
          320,
        );
        return { width, height };
      };

      const onResize = () => {
        const { width, height } = getViewportSize();
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };
      onResize();

      const resizeObserver = new ResizeObserver(() => {
        onResize();
      });
      resizeObserver.observe(host);

      const clock = new THREE.Clock();
      let animationId = 0;
      let sunAnimationTime = 0;

      const animate = () => {
        const delta = Math.min(clock.getDelta(), 0.1);
        const scaledDelta = delta * timeScaleRef.current;
        sunAnimationTime += scaledDelta;
        planetSystem.update(scaledDelta);
        starField.update(camera.position, scaledDelta);
        sunVisual.update(scaledDelta, sunAnimationTime);
        focusController.update();
        controls.update();
        renderer.render(scene, camera);
        animationId = window.requestAnimationFrame(animate);
      };

      window.addEventListener("resize", onResize);
      animate();

      teardown = () => {
        window.removeEventListener("resize", onResize);
        resizeObserver.disconnect();
        window.cancelAnimationFrame(animationId);
        focusController.dispose();
        planetSystem.dispose();
        starField.dispose();
        sunVisual.dispose();
        lighting.dispose();
        disposeTextures(allTextures);
        controls.stopListenToKeyEvents();
        controls.dispose();
        renderer.dispose();
        if (host.contains(renderer.domElement)) {
          host.removeChild(renderer.domElement);
        }
      };

      if (disposed) {
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
    };
  }, [hostRef, hmrVersion]);
}
