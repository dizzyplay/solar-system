export const FOCUS_TARGET_OPTIONS = [
  { id: "none", label: "직접 조작" },
  { id: "sun", label: "태양" },
  { id: "mercury", label: "수성" },
  { id: "venus", label: "금성" },
  { id: "earth", label: "지구" },
  { id: "moon", label: "달" },
  { id: "mars", label: "화성" },
  { id: "jupiter", label: "목성" },
  { id: "saturn", label: "토성" },
  { id: "titan", label: "타이탄" },
  { id: "io", label: "이오" },
  { id: "europa", label: "유로파" },
  { id: "ganymede", label: "가니메데" },
  { id: "callisto", label: "칼리스토" },
] as const;

export type FocusTargetId = (typeof FOCUS_TARGET_OPTIONS)[number]["id"];
