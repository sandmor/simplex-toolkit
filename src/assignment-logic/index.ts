import { performHungarianStep, solveHungarianProblem } from "./hungarian";
import type { HungarianState } from "./types";

export function performAssignmentStep(state: HungarianState): HungarianState {
  return performHungarianStep(state);
}

export function solveAssignmentProblem(
  state: HungarianState
): HungarianState[] {
  return solveHungarianProblem(state);
}

export * from "./types";
export * from "./common";
export * from "./hungarian";
