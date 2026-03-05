export const MAJOR_FOCUS_TARGET_OPTIONS = [
  { id: "none", label: "직접 조작" },
  { id: "sun", label: "태양" },
  { id: "mercury", label: "수성" },
  { id: "venus", label: "금성" },
  { id: "earth", label: "지구" },
  { id: "mars", label: "화성" },
  { id: "jupiter", label: "목성" },
  { id: "saturn", label: "토성" },
  { id: "uranus", label: "천왕성" },
  { id: "neptune", label: "해왕성" },
] as const;

export const FOCUS_MOON_OPTIONS_BY_PLANET = {
  earth: [{ id: "moon", label: "달" }],
  jupiter: [
    { id: "io", label: "이오" },
    { id: "europa", label: "유로파" },
    { id: "ganymede", label: "가니메데" },
    { id: "callisto", label: "칼리스토" },
  ],
  saturn: [
    { id: "titan", label: "타이탄" },
    { id: "rhea", label: "레아" },
    { id: "iapetus", label: "이아페투스" },
    { id: "dione", label: "디오네" },
    { id: "tethys", label: "테티스" },
    { id: "enceladus", label: "엔셀라두스" },
    { id: "mimas", label: "미마스" },
  ],
} as const;

type MajorFocusTargetId = (typeof MAJOR_FOCUS_TARGET_OPTIONS)[number]["id"];
type MoonTargetId =
  (typeof FOCUS_MOON_OPTIONS_BY_PLANET)[keyof typeof FOCUS_MOON_OPTIONS_BY_PLANET][number]["id"];

export type FocusTargetId = MajorFocusTargetId | MoonTargetId;

export const FOCUS_TARGET_OPTIONS = [
  ...MAJOR_FOCUS_TARGET_OPTIONS,
  ...FOCUS_MOON_OPTIONS_BY_PLANET.earth,
  ...FOCUS_MOON_OPTIONS_BY_PLANET.jupiter,
  ...FOCUS_MOON_OPTIONS_BY_PLANET.saturn,
] as const;

const FOCUS_PARENT_BY_TARGET: Record<FocusTargetId, MajorFocusTargetId> = {
  none: "none",
  sun: "sun",
  mercury: "mercury",
  venus: "venus",
  earth: "earth",
  moon: "earth",
  mars: "mars",
  jupiter: "jupiter",
  io: "jupiter",
  europa: "jupiter",
  ganymede: "jupiter",
  callisto: "jupiter",
  saturn: "saturn",
  titan: "saturn",
  rhea: "saturn",
  iapetus: "saturn",
  dione: "saturn",
  tethys: "saturn",
  enceladus: "saturn",
  mimas: "saturn",
  uranus: "uranus",
  neptune: "neptune",
};

export function getMajorFocusTargetId(targetId: FocusTargetId): MajorFocusTargetId {
  return FOCUS_PARENT_BY_TARGET[targetId];
}

export function getMoonOptionsForMajorTarget(
  targetId: MajorFocusTargetId,
): ReadonlyArray<{ id: MoonTargetId; label: string }> {
  if (targetId === "earth") {
    return FOCUS_MOON_OPTIONS_BY_PLANET.earth;
  }
  if (targetId === "jupiter") {
    return FOCUS_MOON_OPTIONS_BY_PLANET.jupiter;
  }
  if (targetId === "saturn") {
    return FOCUS_MOON_OPTIONS_BY_PLANET.saturn;
  }
  return [];
}
