const FOCUS_TARGET_TREE = {
  none: { label: "직접 조작", satellites: [] },
  sun: { label: "태양", satellites: [] },
  mercury: { label: "수성", satellites: [] },
  venus: { label: "금성", satellites: [] },
  earth: {
    label: "지구",
    satellites: [{ id: "moon", label: "달" }],
  },
  mars: { label: "화성", satellites: [] },
  jupiter: {
    label: "목성",
    satellites: [
      { id: "io", label: "이오" },
      { id: "europa", label: "유로파" },
      { id: "ganymede", label: "가니메데" },
      { id: "callisto", label: "칼리스토" },
    ],
  },
  saturn: {
    label: "토성",
    satellites: [
      { id: "titan", label: "타이탄" },
      { id: "rhea", label: "레아" },
      { id: "iapetus", label: "이아페투스" },
      { id: "dione", label: "디오네" },
      { id: "tethys", label: "테티스" },
      { id: "enceladus", label: "엔셀라두스" },
      { id: "mimas", label: "미마스" },
    ],
  },
  uranus: { label: "천왕성", satellites: [] },
  neptune: { label: "해왕성", satellites: [] },
} as const;

type MajorFocusTargetId = keyof typeof FOCUS_TARGET_TREE;
type SatelliteTargetId =
  (typeof FOCUS_TARGET_TREE)[MajorFocusTargetId]["satellites"][number]["id"];

export type FocusTargetId = MajorFocusTargetId | SatelliteTargetId;

export const MAJOR_FOCUS_TARGET_OPTIONS = (
  Object.entries(FOCUS_TARGET_TREE) as Array<
    [MajorFocusTargetId, (typeof FOCUS_TARGET_TREE)[MajorFocusTargetId]]
  >
).map(([id, target]) => ({
  id,
  label: target.label,
}));

const FOCUS_PARENT_BY_TARGET = (
  Object.entries(FOCUS_TARGET_TREE) as Array<
    [MajorFocusTargetId, (typeof FOCUS_TARGET_TREE)[MajorFocusTargetId]]
  >
).reduce(
  (parentByTarget, [majorTargetId, target]) => {
    parentByTarget[majorTargetId] = majorTargetId;
    for (const satellite of target.satellites) {
      parentByTarget[satellite.id] = majorTargetId;
    }
    return parentByTarget;
  },
  {} as Record<FocusTargetId, MajorFocusTargetId>,
);

export function getMajorFocusTargetId(targetId: FocusTargetId): MajorFocusTargetId {
  return FOCUS_PARENT_BY_TARGET[targetId];
}

export function getSatelliteOptionsForMajorTarget(
  targetId: MajorFocusTargetId,
): ReadonlyArray<{ id: SatelliteTargetId; label: string }> {
  return FOCUS_TARGET_TREE[targetId].satellites;
}
