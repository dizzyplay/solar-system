import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./App.css";

const SCENE_HMR_VERSION = import.meta.hot?.data.sceneVersion ?? 0;
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose((data) => {
    data.sceneVersion = SCENE_HMR_VERSION + 1;
  });
}

const EARTH_RADIUS = 1;
const MOON_RADIUS_RATIO = 0.273;
const MOON_DISTANCE_RATIO = 60.3;
const DISTANCE_COMPRESSION = 0.09;
const MOON_ORBIT_RADIUS = MOON_DISTANCE_RATIO * DISTANCE_COMPRESSION;
const EARTH_DAY_SECONDS = 24;
const MOON_ORBIT_PERIOD_DAYS = 27.321661;
const EARTH_ORBIT_PERIOD_DAYS = 365.256363004;
const EARTH_ROTATION_SPEED = (Math.PI * 2) / EARTH_DAY_SECONDS;
const MOON_ORBIT_SPEED =
  (Math.PI * 2) / (EARTH_DAY_SECONDS * MOON_ORBIT_PERIOD_DAYS);
const EARTH_ORBIT_SPEED =
  (Math.PI * 2) / (EARTH_DAY_SECONDS * EARTH_ORBIT_PERIOD_DAYS);
const EARTH_AXIAL_TILT = THREE.MathUtils.degToRad(23.44);
const MOON_ORBIT_INCLINATION = THREE.MathUtils.degToRad(5.145);
const REAL_SUN_DISTANCE_RATIO = 23455;
const REAL_SUN_RADIUS_RATIO = 109;
const SUN_DISTANCE_COMPRESSION = 0.00175;
const SUN_RADIUS_COMPRESSION = 0.012;
const SUN_DISTANCE = REAL_SUN_DISTANCE_RATIO * SUN_DISTANCE_COMPRESSION;
const SUN_POSITION = new THREE.Vector3(-8.5, 2.8, -SUN_DISTANCE);
const SUN_RADIUS = REAL_SUN_RADIUS_RATIO * SUN_RADIUS_COMPRESSION;
const SUN_DISTANCE_COMPRESS_FACTOR = Math.round(1 / SUN_DISTANCE_COMPRESSION);
const EARTH_ORBIT_LOCAL_OFFSET = new THREE.Vector3(
  -SUN_POSITION.x,
  0,
  -SUN_POSITION.z,
);

const TEXTURES = {
  earthDay: "/textures/earth_day.jpg",
  earthNormal: "/textures/earth_normal.jpg",
  earthSpecular: "/textures/earth_specular.jpg",
  moon: "/textures/moon.jpg",
};

function createSunTexture() {
  const size = 1536;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) {
    return new THREE.CanvasTexture(canvas);
  }

  const gradient = context.createRadialGradient(size * 0.46, size * 0.43, size * 0.08, size * 0.5, size * 0.5, size * 0.52);
  gradient.addColorStop(0, "#fff6cb");
  gradient.addColorStop(0.25, "#ffd46a");
  gradient.addColorStop(0.58, "#ff9f3d");
  gradient.addColorStop(0.85, "#ea6124");
  gradient.addColorStop(1, "#9a2f15");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  for (let i = 0; i < 3200; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 1 + Math.random() * 7;
    const warmth = Math.floor(170 + Math.random() * 70);
    context.globalAlpha = 0.015 + Math.random() * 0.05;
    context.fillStyle = `rgb(255, ${warmth}, 70)`;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  for (let i = 0; i < 140; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 10 + Math.random() * 38;
    const spot = context.createRadialGradient(x, y, 0, x, y, radius);
    spot.addColorStop(0, "rgba(48,18,8,0.38)");
    spot.addColorStop(0.5, "rgba(100,36,12,0.16)");
    spot.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = spot;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  const limbDarkening = context.createRadialGradient(size * 0.5, size * 0.5, size * 0.28, size * 0.5, size * 0.5, size * 0.5);
  limbDarkening.addColorStop(0, "rgba(0,0,0,0)");
  limbDarkening.addColorStop(0.65, "rgba(0,0,0,0.05)");
  limbDarkening.addColorStop(1, "rgba(0,0,0,0.28)");
  context.fillStyle = limbDarkening;
  context.fillRect(0, 0, size, size);

  context.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createSunHaloTexture() {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) {
    return new THREE.CanvasTexture(canvas);
  }

  const gradient = context.createRadialGradient(
    size * 0.5,
    size * 0.5,
    size * 0.05,
    size * 0.5,
    size * 0.5,
    size * 0.5,
  );
  gradient.addColorStop(0, "rgba(255,240,190,0.82)");
  gradient.addColorStop(0.28, "rgba(255,186,102,0.48)");
  gradient.addColorStop(0.62, "rgba(255,130,58,0.16)");
  gradient.addColorStop(1, "rgba(255,110,40,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function App() {
  const earthCanvasRef = useRef<HTMLDivElement | null>(null);
  const [timeScale, setTimeScale] = useState(1);
  const timeScaleRef = useRef(timeScale);

  useEffect(() => {
    timeScaleRef.current = timeScale;
  }, [timeScale]);

  useEffect(() => {
    const host = earthCanvasRef.current;
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
      controls.minDistance = 1.2;
      controls.maxDistance = Math.max(120, SUN_DISTANCE * 3.2);
      controls.target.set(0, 0, 0);
      controls.update();

      const ambientLight = new THREE.AmbientLight(0x24374f, 0.12);
      const hemisphereLight = new THREE.HemisphereLight(0x7ea0e0, 0x101722, 0.32);
      const sunLight = new THREE.DirectionalLight(0xfff6de, 1.85);
      sunLight.position.copy(SUN_POSITION);
      const bounceLight = new THREE.DirectionalLight(0x86a8cf, 0.16);
      bounceLight.position.copy(SUN_POSITION).multiplyScalar(-1);
      const sunHaloLight = new THREE.PointLight(0xffb45a, 1.25, SUN_RADIUS * 34, 2);
      sunHaloLight.position.copy(SUN_POSITION);
      scene.add(ambientLight, hemisphereLight, sunLight, bounceLight, sunHaloLight);

      const textureLoader = new THREE.TextureLoader();
      const [earthDay, earthNormal, earthSpecular, moonTexture] =
        await Promise.all([
          textureLoader.loadAsync(TEXTURES.earthDay),
          textureLoader.loadAsync(TEXTURES.earthNormal),
          textureLoader.loadAsync(TEXTURES.earthSpecular),
          textureLoader.loadAsync(TEXTURES.moon),
        ]);
      const sunTexture = createSunTexture();
      const sunHaloTexture = createSunHaloTexture();

      if (disposed) {
        earthDay.dispose();
        earthNormal.dispose();
        earthSpecular.dispose();
        moonTexture.dispose();
        sunTexture.dispose();
        sunHaloTexture.dispose();
        controls.dispose();
        renderer.dispose();
        if (host.contains(renderer.domElement)) {
          host.removeChild(renderer.domElement);
        }
        return;
      }

      earthDay.colorSpace = THREE.SRGBColorSpace;
      moonTexture.colorSpace = THREE.SRGBColorSpace;

      earthDay.wrapS = THREE.RepeatWrapping;
      earthNormal.wrapS = THREE.RepeatWrapping;
      earthSpecular.wrapS = THREE.RepeatWrapping;
      moonTexture.wrapS = THREE.RepeatWrapping;

      const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
      [earthDay, earthNormal, earthSpecular, moonTexture, sunTexture, sunHaloTexture].forEach(
        (texture) => {
          texture.anisotropy = Math.min(8, maxAnisotropy);
        },
      );

      const earthOrbit = new THREE.Group();
      earthOrbit.position.copy(SUN_POSITION);
      scene.add(earthOrbit);

      const earthSystem = new THREE.Group();
      earthSystem.position.copy(EARTH_ORBIT_LOCAL_OFFSET);
      earthSystem.rotation.z = EARTH_AXIAL_TILT;
      earthOrbit.add(earthSystem);

      const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 160, 160);
      const earthMaterial = new THREE.MeshPhongMaterial({
        map: earthDay,
        normalMap: earthNormal,
        normalScale: new THREE.Vector2(0.72, 0.72),
        specularMap: earthSpecular,
        specular: new THREE.Color("#1d2f44"),
        shininess: 8,
      });
      const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
      earthMesh.rotation.x = 0.15;
      earthMesh.userData.focusDistance = 3.3;
      earthSystem.add(earthMesh);

      const sunTarget = new THREE.Object3D();
      sunTarget.position.set(0, 0, 0);
      earthSystem.add(sunTarget);
      sunLight.target = sunTarget;

      const sunGeometry = new THREE.SphereGeometry(SUN_RADIUS, 96, 96);
      const sunMaterial = new THREE.MeshBasicMaterial({
        map: sunTexture,
        color: 0xffd8a3,
      });
      const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
      sunMesh.position.copy(SUN_POSITION);
      sunMesh.userData.focusDistance = Math.max(SUN_RADIUS * 4.4, 5.4);
      scene.add(sunMesh);

      const sunHaloMaterial = new THREE.SpriteMaterial({
        map: sunHaloTexture,
        color: 0xffc786,
        transparent: true,
        opacity: 0.34,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      });
      const sunHaloSprite = new THREE.Sprite(sunHaloMaterial);
      sunHaloSprite.position.copy(SUN_POSITION);
      sunHaloSprite.scale.set(SUN_RADIUS * 8.8, SUN_RADIUS * 8.8, 1);
      scene.add(sunHaloSprite);

      const earthOrbitPointCount = 400;
      const earthOrbitPoints: THREE.Vector3[] = [];
      for (let i = 0; i < earthOrbitPointCount; i += 1) {
        const angle = (i / earthOrbitPointCount) * Math.PI * 2;
        earthOrbitPoints.push(
          EARTH_ORBIT_LOCAL_OFFSET.clone()
            .applyAxisAngle(new THREE.Vector3(0, 1, 0), angle)
            .add(SUN_POSITION),
        );
      }
      const earthOrbitGeometry = new THREE.BufferGeometry().setFromPoints(earthOrbitPoints);
      const earthOrbitMaterial = new THREE.LineDashedMaterial({
        color: 0xffd791,
        dashSize: 0.35,
        gapSize: 0.2,
        transparent: true,
        opacity: 0.3,
      });
      const earthOrbitLine = new THREE.LineLoop(earthOrbitGeometry, earthOrbitMaterial);
      earthOrbitLine.computeLineDistances();
      scene.add(earthOrbitLine);

      const moonGeometry = new THREE.SphereGeometry(
        EARTH_RADIUS * MOON_RADIUS_RATIO,
        96,
        96,
      );
      const moonMaterial = new THREE.MeshPhongMaterial({
        map: moonTexture,
        bumpMap: moonTexture,
        bumpScale: 0.028,
        shininess: 5,
      });
      const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
      moonMesh.userData.focusDistance = 1.6;

      const moonOrbitPlane = new THREE.Group();
      moonOrbitPlane.rotation.x = MOON_ORBIT_INCLINATION;
      earthSystem.add(moonOrbitPlane);

      const moonOrbit = new THREE.Group();
      moonMesh.position.set(MOON_ORBIT_RADIUS, 0, 0);
      moonOrbit.add(moonMesh);
      moonOrbitPlane.add(moonOrbit);

      const selectableBodies = [sunMesh, earthMesh, moonMesh];
      const selectableBodySet = new Set<THREE.Object3D>(selectableBodies);
      const raycaster = new THREE.Raycaster();
      const pointerNdc = new THREE.Vector2();
      let pointerDownX = 0;
      let pointerDownY = 0;
      let focusedBody: THREE.Object3D | null = earthMesh;
      let desiredFocusDistance = Number(earthMesh.userData.focusDistance);
      let isAutoZooming = true;

      const getBodyFocusDistance = (body: THREE.Object3D) => {
        const rawValue = body.userData.focusDistance;
        const fallback = controls.getDistance();
        if (typeof rawValue !== "number" || Number.isNaN(rawValue)) {
          return fallback;
        }
        return THREE.MathUtils.clamp(
          rawValue,
          controls.minDistance + 0.1,
          controls.maxDistance - 0.5,
        );
      };

      const resolveSelectableBody = (object: THREE.Object3D | null) => {
        let current: THREE.Object3D | null = object;
        while (current) {
          if (selectableBodySet.has(current)) {
            return current;
          }
          current = current.parent;
        }
        return null;
      };

      const onPointerDown = (event: PointerEvent) => {
        if (event.button !== 0) {
          return;
        }
        pointerDownX = event.clientX;
        pointerDownY = event.clientY;
      };

      const onPointerUp = (event: PointerEvent) => {
        if (event.button !== 0) {
          return;
        }
        const dragDistance = Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY);
        if (dragDistance > 5) {
          return;
        }

        const rect = renderer.domElement.getBoundingClientRect();
        pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointerNdc, camera);

        const intersections = raycaster.intersectObjects(selectableBodies, true);
        if (intersections.length === 0) {
          focusedBody = null;
          isAutoZooming = false;
          return;
        }
        focusedBody = resolveSelectableBody(intersections[0].object);
        if (focusedBody) {
          desiredFocusDistance = getBodyFocusDistance(focusedBody);
          isAutoZooming = true;
        }
      };

      const onWheel = () => {
        if (!focusedBody) {
          return;
        }
        desiredFocusDistance = THREE.MathUtils.clamp(
          controls.getDistance(),
          controls.minDistance + 0.1,
          controls.maxDistance - 0.5,
        );
        isAutoZooming = false;
      };

      renderer.domElement.addEventListener("pointerdown", onPointerDown);
      renderer.domElement.addEventListener("pointerup", onPointerUp);
      renderer.domElement.addEventListener("wheel", onWheel, { passive: true });

      const orbitPointCount = 240;
      const orbitPoints: THREE.Vector3[] = [];
      for (let i = 0; i < orbitPointCount; i += 1) {
        const angle = (i / orbitPointCount) * Math.PI * 2;
        orbitPoints.push(
          new THREE.Vector3(
            Math.cos(angle) * MOON_ORBIT_RADIUS,
            0,
            Math.sin(angle) * MOON_ORBIT_RADIUS,
          ),
        );
      }
      const moonOrbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const moonOrbitMaterial = new THREE.LineDashedMaterial({
        color: 0x8db5cf,
        dashSize: 0.12,
        gapSize: 0.08,
        transparent: true,
        opacity: 0.3,
      });
      const moonOrbitLine = new THREE.LineLoop(moonOrbitGeometry, moonOrbitMaterial);
      moonOrbitLine.computeLineDistances();
      moonOrbitPlane.add(moonOrbitLine);

      const starCount = 800;
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i += 1) {
        const radius = 240 + Math.random() * 180;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const index = i * 3;

        starPositions[index] = radius * Math.sin(phi) * Math.cos(theta);
        starPositions[index + 1] = radius * Math.sin(phi) * Math.sin(theta);
        starPositions[index + 2] = radius * Math.cos(phi);
      }

      const starGeometry = new THREE.BufferGeometry();
      starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
      const starMaterial = new THREE.PointsMaterial({
        color: 0xd7ebff,
        size: 0.12,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true,
      });
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);

      const getViewportSize = () => {
        const rect = host.getBoundingClientRect();
        const width = Math.max(host.clientWidth, Math.floor(rect.width), window.innerWidth, 320);
        const height = Math.max(host.clientHeight, Math.floor(rect.height), window.innerHeight, 320);
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
      const earthWorldPosition = new THREE.Vector3();
      const focusWorldPosition = new THREE.Vector3();
      const focusViewDirection = new THREE.Vector3();
      const desiredCameraPosition = new THREE.Vector3();

      const animate = () => {
        const delta = Math.min(clock.getDelta(), 0.1);
        const scaledDelta = delta * timeScaleRef.current;
        sunAnimationTime += scaledDelta;
        earthOrbit.rotation.y += scaledDelta * EARTH_ORBIT_SPEED;
        earthMesh.rotation.y += scaledDelta * EARTH_ROTATION_SPEED;
        moonOrbit.rotation.y += scaledDelta * MOON_ORBIT_SPEED;
        earthMesh.getWorldPosition(earthWorldPosition);
        moonMesh.lookAt(earthWorldPosition);
        stars.rotation.y += scaledDelta * 0.008;
        stars.position.copy(camera.position);
        sunMesh.rotation.y += scaledDelta * 0.06;
        sunMesh.rotation.z = Math.sin(sunAnimationTime * 0.18) * 0.04;
        const haloPulse = 0.5 + Math.sin(sunAnimationTime * 0.85) * 0.5;
        sunHaloMaterial.opacity = 0.28 + haloPulse * 0.12;
        const haloScale = SUN_RADIUS * (8.5 + haloPulse * 0.9);
        sunHaloSprite.scale.set(haloScale, haloScale, 1);
        if (focusedBody) {
          focusedBody.getWorldPosition(focusWorldPosition);
          controls.target.lerp(focusWorldPosition, 0.16);
          if (isAutoZooming) {
            focusViewDirection.copy(camera.position).sub(controls.target);
            if (focusViewDirection.lengthSq() < 1e-6) {
              focusViewDirection.set(0, 0, 1);
            }
            focusViewDirection.normalize();
            desiredCameraPosition
              .copy(focusWorldPosition)
              .addScaledVector(focusViewDirection, desiredFocusDistance);
            camera.position.lerp(desiredCameraPosition, 0.13);
            const currentDistance = camera.position.distanceTo(controls.target);
            if (Math.abs(currentDistance - desiredFocusDistance) < 0.04) {
              isAutoZooming = false;
            }
          }
        }

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
        renderer.domElement.removeEventListener("pointerdown", onPointerDown);
        renderer.domElement.removeEventListener("pointerup", onPointerUp);
        renderer.domElement.removeEventListener("wheel", onWheel);

        earthGeometry.dispose();
        earthMaterial.dispose();
        sunGeometry.dispose();
        sunMaterial.dispose();
        sunHaloMaterial.dispose();
        earthOrbitGeometry.dispose();
        earthOrbitMaterial.dispose();
        moonGeometry.dispose();
        moonMaterial.dispose();
        moonOrbitGeometry.dispose();
        moonOrbitMaterial.dispose();
        starGeometry.dispose();
        starMaterial.dispose();

        earthDay.dispose();
        earthNormal.dispose();
        earthSpecular.dispose();
        moonTexture.dispose();
        sunTexture.dispose();
        sunHaloTexture.dispose();

        earthSystem.remove(sunTarget);
        scene.remove(sunHaloSprite);
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
  }, [SCENE_HMR_VERSION]);

  return (
    <main className="container">
      <div
        ref={earthCanvasRef}
        className="earth-canvas"
        role="img"
        aria-label="Rotating 3D earth and orbiting moon rendered with three.js"
      />
      <div className="overlay">
        <h1>3D 지구</h1>
        <p className="subtitle">태양광 기반 주야 변화 + 달 공전</p>
        <p className="control-note">
          좌클릭: 천체 포커스+자동줌, 좌클릭 드래그: 이동, 우클릭 드래그: 회전, 휠: 줌
        </p>
        <p className="scale-note">
          태양-지구 거리는 실제 비율을 약 {SUN_DISTANCE_COMPRESS_FACTOR.toLocaleString()}배
          압축해 표시
        </p>
        <div className="time-controls">
          <label htmlFor="time-scale" className="time-label">
            시간 배속 x{timeScale.toFixed(1)}
          </label>
          <input
            id="time-scale"
            className="time-slider"
            type="range"
            min="0"
            max="20"
            step="0.1"
            value={timeScale}
            onChange={(event) => {
              setTimeScale(Number(event.currentTarget.value));
            }}
          />
          <div className="time-preset-list">
            {[0, 0.5, 1, 5, 10].map((preset) => (
              <button
                key={preset}
                type="button"
                className={`time-preset ${Math.abs(timeScale - preset) < 0.05 ? "active" : ""}`}
                onClick={() => setTimeScale(preset)}
              >
                x{preset}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
