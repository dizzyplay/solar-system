import * as THREE from "three";

type CameraControls = {
  getDistance: () => number;
  minDistance: number;
  maxDistance: number;
  target: THREE.Vector3;
};

type FocusControllerOptions = {
  camera: THREE.PerspectiveCamera;
  controls: CameraControls;
  canvas: HTMLCanvasElement;
  selectableBodies: THREE.Object3D[];
  initialFocusedBody?: THREE.Object3D | null;
};

export type FocusController = {
  update: () => void;
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

  const focusWorldPosition = new THREE.Vector3();
  const focusViewDirection = new THREE.Vector3();
  const desiredCameraPosition = new THREE.Vector3();

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

  if (focusedBody) {
    desiredFocusDistance = getBodyFocusDistance(focusedBody);
  }

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

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("wheel", onWheel, { passive: true });

  const update = () => {
    if (!focusedBody) {
      return;
    }
    focusedBody.getWorldPosition(focusWorldPosition);
    controls.target.lerp(focusWorldPosition, 0.16);

    if (!isAutoZooming) {
      return;
    }

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
  };

  const dispose = () => {
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("wheel", onWheel);
  };

  return { update, dispose };
}
