export type TeamSide = "home" | "away";
export function oppositeSide(side: TeamSide): TeamSide { return side === "home" ? "away" : "home"; }
