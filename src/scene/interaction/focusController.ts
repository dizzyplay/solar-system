import * as THREE from "three";

type CameraControls = {
  getDistance: () => number;
  minDistance: number;
  maxDistance: number;
  target: THREE.Vector3;
  addEventListener: (type: "start", listener: () => void) => void;
  removeEventListener: (type: "start", listener: () => void) => void;
};

type FocusControllerOptions = {
  camera: THREE.PerspectiveCamera;
  controls: CameraControls;
  canvas: HTMLCanvasElement;
  selectableBodies: THREE.Object3D[];
  trackingEnabled?: boolean;
  initialFocusedBody?: THREE.Object3D | null;
  onFocusChanged?: (body: THREE.Object3D | null) => void;
};

export type FocusController = {
  update: () => void;
  setFocusedBody: (body: THREE.Object3D | null, autoZoom?: boolean) => void;
  setTrackingEnabled: (enabled: boolean) => void;
  dispose: () => void;
};

export function createFocusController(options: FocusControllerOptions): FocusController {
  const { camera, controls, canvas, selectableBodies } = options;
  const selectableBodySet = new Set<THREE.Object3D>(selectableBodies);
  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();

  let pointerDownX = 0;
  let pointerDownY = 0;
  let focusedBody: THREE.Object3D | null = options.initialFocusedBody ?? null;
  let desiredFocusDistance = controls.getDistance();
  let isAutoZooming = focusedBody !== null;
  let isTrackingEnabled = options.trackingEnabled ?? false;
  const baseMinDistance = controls.minDistance;

  const focusWorldPosition = new THREE.Vector3();
  const focusViewDirection = new THREE.Vector3();
  const trackedCameraOffset = new THREE.Vector3();
  const desiredCameraPosition = new THREE.Vector3();
  const worldScale = new THREE.Vector3();

  const getBodyWorldRadius = (body: THREE.Object3D) => {
    if (!(body instanceof THREE.Mesh)) {
      return 0;
    }
    const geometry = body.geometry;
    if (!geometry.boundingSphere) {
      geometry.computeBoundingSphere();
    }
    const radius = geometry.boundingSphere?.radius;
    if (typeof radius !== "number" || !Number.isFinite(radius) || radius <= 0) {
      return 0;
    }
    body.getWorldScale(worldScale);
    const maxScale = Math.max(worldScale.x, worldScale.y, worldScale.z);
    return radius * maxScale;
  };

  const getFovFitDistance = (radius: number) => {
    if (radius <= 0) {
      return 0;
    }
    const verticalHalfFov = THREE.MathUtils.degToRad(camera.fov) * 0.5;
    const horizontalHalfFov = Math.atan(Math.tan(verticalHalfFov) * camera.aspect);
    const limitingHalfFov = Math.max(0.01, Math.min(verticalHalfFov, horizontalHalfFov));
    const baseDistance = radius / Math.sin(limitingHalfFov);
    return baseDistance * 1.12;
  };

  const getBodyMinZoomDistance = (body: THREE.Object3D) => {
    const bodyRadius = getBodyWorldRadius(body);
    if (bodyRadius <= 0) {
      return baseMinDistance;
    }
    const clippingPadding = camera.near + Math.max(0.012, bodyRadius * 0.015);
    const minimumDistance = bodyRadius + clippingPadding;
    return THREE.MathUtils.clamp(
      Math.max(baseMinDistance, minimumDistance),
      baseMinDistance,
      controls.maxDistance - 0.5,
    );
  };

  const syncMinDistanceWithFocus = (body: THREE.Object3D | null) => {
    controls.minDistance = body ? getBodyMinZoomDistance(body) : baseMinDistance;
  };

  const getBodyFocusDistance = (body: THREE.Object3D) => {
    const rawValue = body.userData.focusDistance;
    const fallback = controls.getDistance();
    const configuredDistance =
      typeof rawValue === "number" && Number.isFinite(rawValue) ? rawValue : fallback;
    const bodyRadius = getBodyWorldRadius(body);
    const fitDistance = getFovFitDistance(bodyRadius);
    return THREE.MathUtils.clamp(
      Math.max(configuredDistance, fitDistance),
      controls.minDistance + 0.1,
      controls.maxDistance - 0.5,
    );
  };

  const getClampedCurrentDistance = () =>
    THREE.MathUtils.clamp(
      controls.getDistance(),
      controls.minDistance + 0.1,
      controls.maxDistance - 0.5,
    );

  syncMinDistanceWithFocus(focusedBody);
  if (focusedBody) {
    desiredFocusDistance = getBodyFocusDistance(focusedBody);
  }

  const setFocusedBody = (body: THREE.Object3D | null, autoZoom = true) => {
    focusedBody = body;
    syncMinDistanceWithFocus(focusedBody);
    if (!focusedBody) {
      isAutoZooming = false;
      options.onFocusChanged?.(null);
      return;
    }
    desiredFocusDistance = getBodyFocusDistance(focusedBody);
    isAutoZooming = autoZoom;
    options.onFocusChanged?.(focusedBody);
  };

  const setTrackingEnabled = (enabled: boolean) => {
    isTrackingEnabled = enabled;
    if (!focusedBody) {
      return;
    }
    desiredFocusDistance = getClampedCurrentDistance();
    if (enabled) {
      isAutoZooming = true;
    } else {
      isAutoZooming = false;
    }
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

    const rect = canvas.getBoundingClientRect();
    pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointerNdc, camera);

    const intersections = raycaster.intersectObjects(selectableBodies, true);
    if (intersections.length === 0) {
      setFocusedBody(null);
      return;
    }

    const selectedBody = resolveSelectableBody(intersections[0].object);
    if (selectedBody) {
      setFocusedBody(selectedBody);
    }
  };

  const onWheel = () => {
    if (!focusedBody) {
      return;
    }
    desiredFocusDistance = getClampedCurrentDistance();
    isAutoZooming = false;
  };

  const onControlsStart = () => {
    if (!focusedBody) {
      return;
    }
    desiredFocusDistance = getClampedCurrentDistance();
    isAutoZooming = false;
  };

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("wheel", onWheel, { passive: true });
  controls.addEventListener("start", onControlsStart);

  const update = () => {
    syncMinDistanceWithFocus(focusedBody);
    if (!focusedBody) {
      return;
    }
    focusedBody.getWorldPosition(focusWorldPosition);
    trackedCameraOffset.copy(camera.position).sub(controls.target);
    const currentDistance = trackedCameraOffset.length();
    const minDistance = controls.minDistance + 0.1;
    const maxDistance = controls.maxDistance - 0.5;
    if (currentDistance > 1e-6) {
      trackedCameraOffset.setLength(
        THREE.MathUtils.clamp(currentDistance, minDistance, maxDistance),
      );
    } else {
      trackedCameraOffset.set(
        0,
        0,
        THREE.MathUtils.clamp(desiredFocusDistance, minDistance, maxDistance),
      );
    }
    const shouldTrackTarget = isTrackingEnabled || isAutoZooming;
    if (!shouldTrackTarget) {
      controls.target.lerp(focusWorldPosition, 0.16);
      return;
    }
    controls.target.copy(focusWorldPosition);

    if (isTrackingEnabled && !isAutoZooming) {
      camera.position.copy(focusWorldPosition).add(trackedCameraOffset);
      desiredFocusDistance = trackedCameraOffset.length();
      return;
    }

    focusViewDirection.copy(trackedCameraOffset);
    if (focusViewDirection.lengthSq() < 1e-6) {
      focusViewDirection.set(0, 0, desiredFocusDistance > 0 ? desiredFocusDistance : 1);
    }
    focusViewDirection.normalize();
    desiredCameraPosition
      .copy(focusWorldPosition)
      .addScaledVector(focusViewDirection, desiredFocusDistance);
    camera.position.lerp(desiredCameraPosition, 0.13);
    if (!isTrackingEnabled) {
      const nextDistance = camera.position.distanceTo(controls.target);
      if (Math.abs(nextDistance - desiredFocusDistance) < 0.04) {
        isAutoZooming = false;
      }
    }
  };

  const dispose = () => {
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("wheel", onWheel);
    controls.removeEventListener("start", onControlsStart);
  };

  return { update, setFocusedBody, setTrackingEnabled, dispose };
}
