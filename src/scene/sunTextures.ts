import * as THREE from "three";

export function createSunHaloTexture() {
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
