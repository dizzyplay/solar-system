import { SUN_DISTANCE_COMPRESS_FACTOR } from "../scene/constants";
import {
  MAJOR_FOCUS_TARGET_OPTIONS,
  getMajorFocusTargetId,
  getSatelliteOptionsForMajorTarget,
  type FocusTargetId,
} from "../scene/focusTargets";

const TIME_PRESETS = [0, 0.5, 1, 5, 10];

type SceneOverlayProps = {
  timeScale: number;
  onTimeScaleChange: (nextValue: number) => void;
  solarIrradiance: number;
  onSolarIrradianceChange: (nextValue: number) => void;
  focusedTargetId: FocusTargetId;
  trackingEnabled: boolean;
  onTrackingEnabledChange: (enabled: boolean) => void;
  focusAssistLightingEnabled: boolean;
  onFocusAssistLightingEnabledChange: (enabled: boolean) => void;
  onFocusedTargetIdChange: (nextTargetId: FocusTargetId) => void;
};

export function SceneOverlay({
  timeScale,
  onTimeScaleChange,
  solarIrradiance,
  onSolarIrradianceChange,
  focusedTargetId,
  trackingEnabled,
  onTrackingEnabledChange,
  focusAssistLightingEnabled,
  onFocusAssistLightingEnabledChange,
  onFocusedTargetIdChange,
}: SceneOverlayProps) {
  const majorTargetId = getMajorFocusTargetId(focusedTargetId);
  const satelliteOptions = getSatelliteOptionsForMajorTarget(majorTargetId);
  const satelliteSelectValue = satelliteOptions.some(
    (satellite) => satellite.id === focusedTargetId,
  )
    ? focusedTargetId
    : majorTargetId;

  return (
    <div className="overlay">
      <h1>solar system</h1>
      <p className="control-note">
        좌클릭: 천체 포커스+자동줌, 좌클릭 드래그: 이동, 우클릭 드래그: 회전,
        휠: 줌
      </p>
      <p className="scale-note">
        태양-지구 거리는 실제 비율을 약{" "}
        {SUN_DISTANCE_COMPRESS_FACTOR.toLocaleString()}배 압축해 표시
      </p>
      <div className="time-controls">
        <label htmlFor="time-scale" className="time-label">
          시간 배속 x{timeScale.toFixed(1)}
        </label>
        <input
          id="time-scale"
          className="time-slider"
          type="range"
          min="0"
          max="20"
          step="0.1"
          value={timeScale}
          onChange={(event) => {
            onTimeScaleChange(Number(event.currentTarget.value));
          }}
        />
        <div className="time-preset-list">
          {TIME_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              className={`time-preset ${Math.abs(timeScale - preset) < 0.05 ? "active" : ""}`}
              onClick={() => onTimeScaleChange(preset)}
            >
              x{preset}
            </button>
          ))}
        </div>
        <div className="solar-controls">
          <label htmlFor="solar-irradiance" className="time-label">
            태양광 강도 {solarIrradiance.toFixed(1)}
          </label>
          <input
            id="solar-irradiance"
            className="time-slider"
            type="range"
            min="2"
            max="24"
            step="0.1"
            value={solarIrradiance}
            onChange={(event) => {
              onSolarIrradianceChange(Number(event.currentTarget.value));
            }}
          />
        </div>
        <div className="focus-controls">
          <label htmlFor="focus-target-major" className="focus-label">
            포커스 대상
          </label>
          <select
            id="focus-target-major"
            className="focus-select"
            value={majorTargetId}
            onChange={(event) => {
              onFocusedTargetIdChange(
                event.currentTarget.value as FocusTargetId,
              );
            }}
          >
            {MAJOR_FOCUS_TARGET_OPTIONS.map((target) => (
              <option key={target.id} value={target.id}>
                {target.label}
              </option>
            ))}
          </select>
          {satelliteOptions.length > 0 ? (
            <>
              <label
                htmlFor="focus-target-satellite"
                className="focus-label focus-sub-label"
              >
                위성 선택
              </label>
              <select
                id="focus-target-satellite"
                className="focus-select"
                value={satelliteSelectValue}
                onChange={(event) => {
                  onFocusedTargetIdChange(
                    event.currentTarget.value as FocusTargetId,
                  );
                }}
              >
                <option value={majorTargetId}>행성 본체</option>
                {satelliteOptions.map((satellite) => (
                  <option key={satellite.id} value={satellite.id}>
                    {satellite.label}
                  </option>
                ))}
              </select>
            </>
          ) : null}
          <label className="tracking-toggle">
            <input
              type="checkbox"
              checked={trackingEnabled}
              onChange={(event) => {
                onTrackingEnabledChange(event.currentTarget.checked);
              }}
            />
            <span>행성 추적 유지</span>
          </label>
          <label className="tracking-toggle">
            <input
              type="checkbox"
              checked={focusAssistLightingEnabled}
              onChange={(event) => {
                onFocusAssistLightingEnabledChange(event.currentTarget.checked);
              }}
            />
            <span>포커스 조명 보정</span>
          </label>
        </div>
      </div>
    </div>
  );
}
