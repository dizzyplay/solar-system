import { SUN_DISTANCE_COMPRESS_FACTOR } from "../scene/constants";

const TIME_PRESETS = [0, 0.5, 1, 5, 10];

type SceneOverlayProps = {
  timeScale: number;
  onTimeScaleChange: (nextValue: number) => void;
};

export function SceneOverlay({
  timeScale,
  onTimeScaleChange,
}: SceneOverlayProps) {
  return (
    <div className="overlay">
      <h1>3D 지구</h1>
      <p className="subtitle">태양광 기반 주야 변화 + 달 공전</p>
      <p className="control-note">
        좌클릭: 천체 포커스+자동줌, 좌클릭 드래그: 이동, 우클릭 드래그: 회전, 휠: 줌
      </p>
      <p className="scale-note">
        태양-지구 거리는 실제 비율을 약 {SUN_DISTANCE_COMPRESS_FACTOR.toLocaleString()}배
        압축해 표시
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
      </div>
    </div>
  );
}
