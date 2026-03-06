import * as THREE from "three";

type CameraControls = {
  getDistance: () => number;
};

type FocusAssistLightingOptions = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: CameraControls;
  enabled?: boolean;
};

export type FocusAssistLightingRuntime = {
  setEnabled: (enabled: boolean) => void;
  setFocusedBody: (body: THREE.Object3D | null) => void;
  update: () => void;
  dispose: () => void;
};

const BASE_LAYER = 0;
const FOCUS_ASSIST_LAYER = 1;

function getFocusLightingRoot(body: THREE.Object3D) {
  const lightingRoot = body.userData.lightingRoot;
  return lightingRoot instanceof THREE.Object3D ? lightingRoot : body;
}

function getBodyFocusDistance(body: THREE.Object3D, fallback: number) {
  const rawValue = body.userData.focusDistance;
  return typeof rawValue === "number" && Number.isFinite(rawValue)
    ? rawValue
    : fallback;
}

export function createFocusAssistLighting(
  options: FocusAssistLightingOptions,
): FocusAssistLightingRuntime {
  const { scene, camera, controls } = options;
  let enabled = options.enabled ?? false;
  let focusedBody: THREE.Object3D | null = null;
  let activeRoot: THREE.Object3D | null = null;
  let currentBlend = 0;
  let sunlightSuppressed = false;

  camera.layers.enable(FOCUS_ASSIST_LAYER);

  const hemisphereLight = new THREE.HemisphereLight(0xf4eddc, 0x1a2130, 0);
  hemisphereLight.layers.set(FOCUS_ASSIST_LAYER);
  scene.add(hemisphereLight);

  const keyLight = new THREE.DirectionalLight(0xfff4df, 0);
  keyLight.layers.set(FOCUS_ASSIST_LAYER);
  scene.add(keyLight);
  scene.add(keyLight.target);

  const fillLight = new THREE.DirectionalLight(0xc7d8ff, 0);
  fillLight.layers.set(FOCUS_ASSIST_LAYER);
  scene.add(fillLight);
  scene.add(fillLight.target);

  const focusWorldPosition = new THREE.Vector3();
  const cameraDirection = new THREE.Vector3();
  const fillOffset = new THREE.Vector3(-3, 2, 1.5);

  const releaseActiveRoot = () => {
    if (!activeRoot) {
      currentBlend = 0;
      sunlightSuppressed = false;
      hemisphereLight.intensity = 0;
      keyLight.intensity = 0;
      fillLight.intensity = 0;
      return;
    }
    activeRoot.traverse((object) => {
      object.layers.enable(BASE_LAYER);
      object.layers.disable(FOCUS_ASSIST_LAYER);
    });
    activeRoot = null;
    currentBlend = 0;
    sunlightSuppressed = false;
    hemisphereLight.intensity = 0;
    keyLight.intensity = 0;
    fillLight.intensity = 0;
  };

  const engageAssist = (body: THREE.Object3D) => {
    const nextRoot = getFocusLightingRoot(body);
    if (activeRoot !== nextRoot) {
      releaseActiveRoot();
      activeRoot = nextRoot;
      activeRoot.traverse((object) => {
        object.layers.enable(BASE_LAYER);
        object.layers.enable(FOCUS_ASSIST_LAYER);
      });
    }
  };

  const setEnabled = (nextEnabled: boolean) => {
    enabled = nextEnabled;
    if (!enabled) {
      releaseActiveRoot();
    }
  };

  const setFocusedBody = (body: THREE.Object3D | null) => {
    if (focusedBody === body) {
      return;
    }
    releaseActiveRoot();
    focusedBody = body;
  };

  const update = () => {
    if (!enabled || !focusedBody || focusedBody.userData.focusLightingEligible === false) {
      releaseActiveRoot();
      return;
    }

    const currentDistance = controls.getDistance();
    const focusDistance = getBodyFocusDistance(focusedBody, currentDistance);
    const fullAssistDistance = focusDistance * 4.8;
    const fadeOutDistance = focusDistance * 15.5;
    const targetBlend =
      1 - THREE.MathUtils.smoothstep(currentDistance, fullAssistDistance, fadeOutDistance);

    if (targetBlend <= 0.001) {
      releaseActiveRoot();
      return;
    }

    engageAssist(focusedBody);
    currentBlend = targetBlend;

    if (!activeRoot) {
      hemisphereLight.intensity = 0;
      keyLight.intensity = 0;
      fillLight.intensity = 0;
      return;
    }

    if (!sunlightSuppressed && currentBlend >= 0.92) {
      activeRoot.traverse((object) => {
        object.layers.disable(BASE_LAYER);
        object.layers.enable(FOCUS_ASSIST_LAYER);
      });
      sunlightSuppressed = true;
    } else if (sunlightSuppressed && currentBlend <= 0.82) {
      activeRoot.traverse((object) => {
        object.layers.enable(BASE_LAYER);
        object.layers.enable(FOCUS_ASSIST_LAYER);
      });
      sunlightSuppressed = false;
    }

    focusedBody.getWorldPosition(focusWorldPosition);
    cameraDirection.copy(camera.position).sub(focusWorldPosition).normalize();
    keyLight.position.copy(focusWorldPosition).addScaledVector(cameraDirection, 14);
    keyLight.target.position.copy(focusWorldPosition);
    keyLight.target.updateMatrixWorld();
    fillLight.position
      .copy(focusWorldPosition)
      .addScaledVector(cameraDirection, -8)
      .add(fillOffset);
    fillLight.target.position.copy(focusWorldPosition);
    fillLight.target.updateMatrixWorld();
    hemisphereLight.intensity = 0.36 * currentBlend;
    keyLight.intensity = 1.75 * currentBlend;
    fillLight.intensity = 0.42 * currentBlend;
  };

  const dispose = () => {
    releaseActiveRoot();
    camera.layers.disable(FOCUS_ASSIST_LAYER);
    scene.remove(hemisphereLight, keyLight, keyLight.target, fillLight, fillLight.target);
  };

  return { setEnabled, setFocusedBody, update, dispose };
}
