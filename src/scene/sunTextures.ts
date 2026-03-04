import * as THREE from "three";

export function createSunTexture() {
  const size = 1536;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) {
    return new THREE.CanvasTexture(canvas);
  }

  const gradient = context.createRadialGradient(
    size * 0.46,
    size * 0.43,
    size * 0.08,
    size * 0.5,
    size * 0.5,
    size * 0.52,
  );
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

  const limbDarkening = context.createRadialGradient(
    size * 0.5,
    size * 0.5,
    size * 0.28,
    size * 0.5,
    size * 0.5,
    size * 0.5,
  );
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
