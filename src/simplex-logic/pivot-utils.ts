import { MNumber } from "./m-number";
import { SimplexState } from "./big-m";

export interface PivotInfo {
  enteringVarIndex: number | null;
  leavingRowIndex: number | null;
  ratios: (number | null)[];
  minRatioValue: number | null;
  isUnbounded: boolean;
  enteringVarName?: string;
  leavingVarName?: string;
}

/**
 * Calculates information about the next pivot operation based on the current tableau state.
 * Used to highlight educational information about the simplex method.
 */
export function calculatePivotInfo(state: SimplexState): PivotInfo {
  const { variables, basis, tableau, zj_cj, rhs, status, isMaximization } =
    state;

  const pivotInfo: PivotInfo = {
    enteringVarIndex: null,
    leavingRowIndex: null,
    ratios: [],
    minRatioValue: null,
    isUnbounded: false,
  };

  // If we've reached a terminal state, no pivot is needed
  if (["Optimal", "Unbounded", "Infeasible"].includes(status)) {
    return pivotInfo;
  }

  // Determine entering variable for the next iteration
  if (isMaximization) {
    // For maximization, find the most negative Zj-Cj
    let minValue = new MNumber(Infinity, Infinity);
    for (let j = 0; j < zj_cj.length; j++) {
      if (MNumber.compare(zj_cj[j], minValue) < 0) {
        minValue = zj_cj[j];
        pivotInfo.enteringVarIndex = j;
      }
    }
    // If all Zj-Cj >= 0, we're optimal for maximization
    if (
      pivotInfo.enteringVarIndex !== null &&
      MNumber.compare(minValue, new MNumber()) >= 0
    ) {
      pivotInfo.enteringVarIndex = null;
    }
  } else {
    // Minimization - find the most positive Zj-Cj
    let maxValue = new MNumber(-Infinity, -Infinity);
    for (let j = 0; j < zj_cj.length; j++) {
      if (MNumber.compare(zj_cj[j], maxValue) > 0) {
        maxValue = zj_cj[j];
        pivotInfo.enteringVarIndex = j;
      }
    }
    // If all Zj-Cj <= 0, we're optimal for minimization
    if (
      pivotInfo.enteringVarIndex !== null &&
      MNumber.compare(maxValue, new MNumber()) <= 0
    ) {
      pivotInfo.enteringVarIndex = null;
    }
  }

  // If we found an entering variable, calculate ratios and determine leaving row
  if (pivotInfo.enteringVarIndex !== null) {
    const enteringIdx = pivotInfo.enteringVarIndex;
    pivotInfo.enteringVarName = variables[enteringIdx];

    let hasPositiveCoefficient = false;
    pivotInfo.minRatioValue = Infinity;

    // Initialize ratios array with nulls
    pivotInfo.ratios = new Array(tableau.length).fill(null);

    for (let i = 0; i < tableau.length; i++) {
      const coeff = tableau[i][enteringIdx];

      // Only positive coefficients are eligible for ratio test
      if (coeff > 1e-9) {
        // Use small epsilon for floating point comparison
        hasPositiveCoefficient = true;
        const ratio = rhs[i] / coeff;
        pivotInfo.ratios[i] = ratio;

        // Track minimum ratio
        if (ratio < pivotInfo.minRatioValue && ratio >= 0) {
          pivotInfo.minRatioValue = ratio;
          pivotInfo.leavingRowIndex = i;
        }
      }
    }

    // If no positive coefficients in entering column, problem is unbounded
    if (!hasPositiveCoefficient) {
      pivotInfo.isUnbounded = true;
      pivotInfo.leavingRowIndex = null;
    } else if (pivotInfo.leavingRowIndex !== null) {
      pivotInfo.leavingVarName = basis[pivotInfo.leavingRowIndex];
    }
  }

  return pivotInfo;
}
