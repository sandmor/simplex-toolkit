import { TransportationState } from "./types";
import {
  performNorthwestCornerStep,
  solveNorthwestCorner,
} from "./northwest-corner";
import { performLeastCostStep, solveLeastCost } from "./least-cost";
import { performVAMStep, solveVAM } from "./vam";
import { performMODIStep, solveMODI } from "./modi";

export function performTransportationStep(
  state: TransportationState
): TransportationState {
  switch (state.method) {
    case "NWC":
      return performNorthwestCornerStep(state);
    case "LCM":
      return performLeastCostStep(state);
    case "VAM":
      return performVAMStep(state);
    case "MODI":
      return performMODIStep(state);
    default:
      throw new Error(`Unknown method: ${state.method}`);
  }
}

export function solveTransportationProblem(
  state: TransportationState
): TransportationState[] {
  switch (state.method) {
    case "NWC":
      return solveNorthwestCorner(state);
    case "LCM":
      return solveLeastCost(state);
    case "VAM":
      return solveVAM(state);
    case "MODI":
      return solveMODI(state);
    default:
      throw new Error(`Unknown method: ${state.method}`);
  }
}

export * from "./types";
export * from "./common";
export * from "./northwest-corner";
export * from "./least-cost";
export * from "./vam";
export * from "./modi";
