import { useState } from "react";
import "./App.css";
import { SceneOverlay } from "./components/SceneOverlay";
import { SolarSceneCanvas } from "./scene/SolarSceneCanvas";

function App() {
  const [timeScale, setTimeScale] = useState(1);

  return (
    <main className="container">
      <div
        className="earth-canvas"
        role="img"
        aria-label="Rotating 3D earth and orbiting moon rendered with three.js"
      >
        <SolarSceneCanvas timeScale={timeScale} />
      </div>
      <SceneOverlay timeScale={timeScale} onTimeScaleChange={setTimeScale} />
    </main>
  );
}

export default App;
