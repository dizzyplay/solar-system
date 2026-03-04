import { useRef, useState } from "react";
import "./App.css";
import { SceneOverlay } from "./components/SceneOverlay";
import { useSolarScene } from "./scene/useSolarScene";

function App() {
  const earthCanvasRef = useRef<HTMLDivElement | null>(null);
  const [timeScale, setTimeScale] = useState(1);

  useSolarScene({ hostRef: earthCanvasRef, timeScale });

  return (
    <main className="container">
      <div
        ref={earthCanvasRef}
        className="earth-canvas"
        role="img"
        aria-label="Rotating 3D earth and orbiting moon rendered with three.js"
      />
      <SceneOverlay timeScale={timeScale} onTimeScaleChange={setTimeScale} />
    </main>
  );
}

export default App;
