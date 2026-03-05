import * as THREE from "three";

export function createSaturnSurfaceTexture() {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    return new THREE.CanvasTexture(canvas);
  }

  for (let y = 0; y < height; y += 1) {
    const t = y / Math.max(1, height - 1);
    const largeBand = Math.sin(t * Math.PI * 22) * 0.5 + 0.5;
    const mediumBand = Math.sin(t * Math.PI * 56 + 0.9) * 0.5 + 0.5;
    const fineBand = Math.sin(t * Math.PI * 160 + 1.7) * 0.5 + 0.5;
    const mixed = largeBand * 0.5 + mediumBand * 0.33 + fineBand * 0.17;
    const turbulence = (Math.random() - 0.5) * 9;

    const r = 182 + mixed * 58 + turbulence;
    const g = 154 + mixed * 46 + turbulence * 0.8;
    const b = 112 + mixed * 28 + turbulence * 0.6;

    context.fillStyle = `rgb(${Math.max(0, Math.min(255, r))}, ${Math.max(0, Math.min(255, g))}, ${Math.max(0, Math.min(255, b))})`;
    context.fillRect(0, y, width, 1);
  }

  const limbSoftening = context.createRadialGradient(
    width * 0.5,
    height * 0.5,
    height * 0.22,
    width * 0.5,
    height * 0.5,
    height * 0.62,
  );
  limbSoftening.addColorStop(0, "rgba(255,255,255,0)");
  limbSoftening.addColorStop(1, "rgba(0,0,0,0.24)");
  context.fillStyle = limbSoftening;
  context.fillRect(0, 0, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createSaturnRingTexture() {
  const size = 2048;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) {
    return new THREE.CanvasTexture(canvas);
  }

  const center = size * 0.5;
  const maxRadius = size * 0.5;
  const innerRadius = maxRadius * 0.42;
  const outerRadius = maxRadius * 0.98;

  context.clearRect(0, 0, size, size);
  const ringThickness = outerRadius - innerRadius;
  const bandCount = 520;
  for (let i = 0; i <= bandCount; i += 1) {
    const radial = i / bandCount;
    const radius = innerRadius + radial * ringThickness;

    const largeBand = Math.sin(radial * Math.PI * 15.5) * 0.5 + 0.5;
    const fineBand = Math.sin(radial * Math.PI * 96 + 0.8) * 0.5 + 0.5;
    const grain = Math.random() * 0.09;
    const cassiniDivision =
      radial > 0.48 && radial < 0.56 ? 0.08 : 1;
    const edgeFade = Math.min(
      Math.min(radial / 0.08, (1 - radial) / 0.16),
      1,
    );
    const brightness = 172 + largeBand * 52 + fineBand * 22;
    const alpha =
      (0.26 + largeBand * 0.34 + fineBand * 0.18 + grain) *
      cassiniDivision *
      edgeFade;

    context.strokeStyle = `rgba(${Math.max(0, Math.min(255, brightness + 24))}, ${Math.max(0, Math.min(255, brightness + 10))}, ${Math.max(0, Math.min(255, brightness - 18))}, ${Math.max(0, Math.min(1, alpha))})`;
    context.lineWidth = 1.9;
    context.beginPath();
    context.arc(center, center, radius, 0, Math.PI * 2);
    context.stroke();
  }

  context.globalCompositeOperation = "destination-out";
  context.beginPath();
  context.arc(center, center, innerRadius * 1.01, 0, Math.PI * 2);
  context.fill();
  context.globalCompositeOperation = "source-over";

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
