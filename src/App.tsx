import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { SceneOverlay } from "./components/SceneOverlay";
import type { FocusTargetId } from "./scene/focusTargets";
import { SolarSceneCanvas } from "./scene/SolarSceneCanvas";

function App() {
  const [timeScale, setTimeScale] = useState(1);
  const [solarIrradiance, setSolarIrradiance] = useState(12);
  const [focusedTargetId, setFocusedTargetId] = useState<FocusTargetId>("earth");
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [sceneVersion, setSceneVersion] = useState(0);

  const handleFocusedTargetIdChange = useCallback((nextTargetId: FocusTargetId) => {
    setFocusedTargetId((prevTargetId) =>
      prevTargetId === nextTargetId ? prevTargetId : nextTargetId,
    );
  }, []);

  useEffect(() => {
    if (!import.meta.hot) {
      return;
    }

    const handleBeforeUpdate = (payload: unknown) => {
      const updates =
        typeof payload === "object" &&
        payload !== null &&
        "updates" in payload &&
        Array.isArray((payload as { updates?: unknown[] }).updates)
          ? ((payload as {
              updates: Array<{ path?: string; acceptedPath?: string }>;
            }).updates ?? [])
          : [];

      const shouldRefreshScene = updates.some((update) => {
        const candidates = [update.path, update.acceptedPath].filter(
          (value): value is string => typeof value === "string",
        );
        return candidates.some((value) => {
          const normalized = value.startsWith("/") ? value.slice(1) : value;
          return (
            normalized.includes("src/scene/") ||
            normalized.includes("public/textures/")
          );
        });
      });

      if (shouldRefreshScene) {
        setSceneVersion((version) => version + 1);
      }
    };

    import.meta.hot.on("vite:beforeUpdate", handleBeforeUpdate);
    return () => {
      import.meta.hot?.off("vite:beforeUpdate", handleBeforeUpdate);
    };
  }, []);

  return (
    <main className="container">
      <div
        className="earth-canvas"
        role="img"
        aria-label="Rotating 3D earth and orbiting moon rendered with three.js"
      >
        <SolarSceneCanvas
          key={sceneVersion}
          timeScale={timeScale}
          solarIrradiance={solarIrradiance}
          focusedTargetId={focusedTargetId}
          trackingEnabled={trackingEnabled}
          onFocusedTargetIdChange={handleFocusedTargetIdChange}
        />
      </div>
      <SceneOverlay
        timeScale={timeScale}
        onTimeScaleChange={setTimeScale}
        solarIrradiance={solarIrradiance}
        onSolarIrradianceChange={setSolarIrradiance}
        focusedTargetId={focusedTargetId}
        trackingEnabled={trackingEnabled}
        onTrackingEnabledChange={setTrackingEnabled}
        onFocusedTargetIdChange={handleFocusedTargetIdChange}
      />
    </main>
  );
}

export default App;
