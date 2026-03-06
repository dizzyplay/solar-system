import * as THREE from "three";

type RingStop = {
  t: number;
  color: string;
};

const COLOR_STOPS: RingStop[] = [
  { t: 0, color: "#3d362f" },
  { t: 0.08, color: "#625548" },
  { t: 0.16, color: "#cdbb95" },
  { t: 0.26, color: "#b49d78" },
  { t: 0.34, color: "#6f6253" },
  { t: 0.39, color: "#2e2a27" },
  { t: 0.45, color: "#e5d7b7" },
  { t: 0.57, color: "#f1e8cf" },
  { t: 0.66, color: "#d3c19d" },
  { t: 0.74, color: "#7f715f" },
  { t: 0.79, color: "#2b2927" },
  { t: 0.86, color: "#e5d4b1" },
  { t: 0.93, color: "#f4ead5" },
  { t: 1, color: "#c5af85" },
];

export function createSaturnRingColorTexture() {
  const width = 2048;
  const height = 48;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    return new THREE.CanvasTexture(canvas);
  }

  const gradient = context.createLinearGradient(0, 0, width, 0);
  for (const stop of COLOR_STOPS) {
    gradient.addColorStop(stop.t, stop.color);
  }
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  for (let y = 0; y < height; y += 1) {
    const depth = Math.abs(y / (height - 1) - 0.5) * 2;
    context.fillStyle = `rgba(255,255,255,${0.065 * (1 - depth)})`;
    context.fillRect(0, y, width, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}
