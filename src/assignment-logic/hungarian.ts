import { HungarianState, Assignment } from "./types";
import {
  findMinInRow,
  findMinInCol,
  deepCopyMatrix,
  findUncoveredZeros,
  findMinUncoveredValue,
  calculateTotalAssignmentCost,
} from "./common";

export function reduceRows(state: HungarianState): HungarianState {
  const newMatrix = deepCopyMatrix(state.costMatrix);
  const n = newMatrix.length;

  // Subtract the minimum value in each row from all elements in that row
  for (let i = 0; i < n; i++) {
    const minValue = findMinInRow(newMatrix, i);
    for (let j = 0; j < n; j++) {
      newMatrix[i][j] -= minValue;
    }
  }

  return {
    ...state,
    costMatrix: newMatrix,
    step: state.step + 1,
    currentPhase: "reduce_cols",
    explanation: `Step ${
      state.step + 1
    }: Reduced rows by subtracting minimum value from each row.`,
  };
}

export function reduceCols(state: HungarianState): HungarianState {
  const newMatrix = deepCopyMatrix(state.costMatrix);
  const n = newMatrix.length;

  // Subtract the minimum value in each column from all elements in that column
  for (let j = 0; j < n; j++) {
    const minValue = findMinInCol(newMatrix, j);
    for (let i = 0; i < n; i++) {
      newMatrix[i][j] -= minValue;
    }
  }

  return {
    ...state,
    costMatrix: newMatrix,
    step: state.step + 1,
    currentPhase: "cover_zeros",
    explanation: `Step ${
      state.step + 1
    }: Reduced columns by subtracting minimum value from each column.`,
  };
}

export function coverZeros(state: HungarianState): HungarianState {
  const n = state.costMatrix.length;
  const newMarkedMatrix = state.markedMatrix.map((row) => [...row]);
  const newCoveredRows = new Array(n).fill(false);
  const newCoveredCols = new Array(n).fill(false);

  // Step 1: Find and star zeros
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (state.costMatrix[i][j] === 0 && newMarkedMatrix[i][j] === null) {
        // Check if this row or column already has a starred zero
        const rowHasStar = newMarkedMatrix[i].some(
          (mark) => mark === "starred"
        );
        const colHasStar = newMarkedMatrix.some((row) => row[j] === "starred");

        if (!rowHasStar && !colHasStar) {
          newMarkedMatrix[i][j] = "starred";
        }
      }
    }
  }

  // Step 2: Cover columns with starred zeros
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      if (newMarkedMatrix[i][j] === "starred") {
        newCoveredCols[j] = true;
        break;
      }
    }
  }

  // Count covered columns
  const coveredCount = newCoveredCols.filter((covered) => covered).length;

  return {
    ...state,
    markedMatrix: newMarkedMatrix,
    coveredRows: newCoveredRows,
    coveredCols: newCoveredCols,
    step: state.step + 1,
    currentPhase: coveredCount === n ? "find_assignment" : "adjust_matrix",
    explanation: `Step ${
      state.step + 1
    }: Starred independent zeros and covered ${coveredCount} columns. ${
      coveredCount === n
        ? "Optimal assignment found!"
        : "Need to find more zeros."
    }`,
  };
}

export function findOptimalAssignment(state: HungarianState): HungarianState {
  const assignments: Assignment[] = [];
  const n = state.markedMatrix.length;

  // Find all starred zeros - these represent the optimal assignment
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (state.markedMatrix[i][j] === "starred") {
        assignments.push({ row: i, col: j });
      }
    }
  }

  const totalCost = calculateTotalAssignmentCost(
    assignments,
    state.originalMatrix
  );

  return {
    ...state,
    assignments,
    totalCost,
    step: state.step + 1,
    status: "Complete",
    currentPhase: "complete",
    explanation: `Step ${
      state.step + 1
    }: Optimal assignment found with total cost ${totalCost}.`,
  };
}

export function adjustMatrix(state: HungarianState): HungarianState {
  // Find uncovered zeros and try to find an augmenting path
  const uncoveredZeros = findUncoveredZeros(
    state.costMatrix,
    state.coveredRows,
    state.coveredCols
  );

  if (uncoveredZeros.length > 0) {
    // Try to find an augmenting path starting from the first uncovered zero
    const startZero = uncoveredZeros[0];
    const newMarkedMatrix = state.markedMatrix.map((row) => [...row]);
    const newCoveredRows = [...state.coveredRows];
    const newCoveredCols = [...state.coveredCols];

    // Prime the uncovered zero
    newMarkedMatrix[startZero.row][startZero.col] = "primed";

    // Check if there's a starred zero in this row
    const starredColInRow = newMarkedMatrix[startZero.row].findIndex(
      (mark) => mark === "starred"
    );

    if (starredColInRow !== -1) {
      // Cover this row and uncover the column with the starred zero
      newCoveredRows[startZero.row] = true;
      newCoveredCols[starredColInRow] = false;

      return {
        ...state,
        markedMatrix: newMarkedMatrix,
        coveredRows: newCoveredRows,
        coveredCols: newCoveredCols,
        step: state.step + 1,
        explanation: `Step ${state.step + 1}: Primed zero at (${
          startZero.row + 1
        }, ${startZero.col + 1}). Covered row ${
          startZero.row + 1
        } and uncovered column ${starredColInRow + 1}.`,
      };
    } else {
      // Found an augmenting path - construct assignment
      return constructAugmentingPath(state, startZero);
    }
  }

  // No uncovered zeros found - need to modify the matrix
  return modifyMatrix(state);
}

function constructAugmentingPath(
  state: HungarianState,
  startZero: { row: number; col: number }
): HungarianState {
  const newMarkedMatrix = state.markedMatrix.map((row) => [...row]);

  // Simple case: just star the primed zero and unstar conflicting starred zeros
  newMarkedMatrix[startZero.row][startZero.col] = "starred";

  // Clear all primes
  for (let i = 0; i < newMarkedMatrix.length; i++) {
    for (let j = 0; j < newMarkedMatrix[i].length; j++) {
      if (newMarkedMatrix[i][j] === "primed") {
        newMarkedMatrix[i][j] = null;
      }
    }
  }

  // Reset coverage and re-cover columns with starred zeros
  const newCoveredRows = new Array(state.costMatrix.length).fill(false);
  const newCoveredCols = new Array(state.costMatrix.length).fill(false);

  for (let j = 0; j < newMarkedMatrix.length; j++) {
    for (let i = 0; i < newMarkedMatrix.length; i++) {
      if (newMarkedMatrix[i][j] === "starred") {
        newCoveredCols[j] = true;
        break;
      }
    }
  }

  const coveredCount = newCoveredCols.filter((covered) => covered).length;

  return {
    ...state,
    markedMatrix: newMarkedMatrix,
    coveredRows: newCoveredRows,
    coveredCols: newCoveredCols,
    step: state.step + 1,
    currentPhase:
      coveredCount === newMarkedMatrix.length
        ? "find_assignment"
        : "adjust_matrix",
    explanation: `Step ${
      state.step + 1
    }: Constructed augmenting path. Now covering ${coveredCount} columns.`,
  };
}

function modifyMatrix(state: HungarianState): HungarianState {
  const minUncovered = findMinUncoveredValue(
    state.costMatrix,
    state.coveredRows,
    state.coveredCols
  );

  const newMatrix = deepCopyMatrix(state.costMatrix);
  const n = newMatrix.length;

  // Subtract min from uncovered elements, add to elements covered by both row and column
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (!state.coveredRows[i] && !state.coveredCols[j]) {
        // Uncovered element - subtract min
        newMatrix[i][j] -= minUncovered;
      } else if (state.coveredRows[i] && state.coveredCols[j]) {
        // Covered by both - add min
        newMatrix[i][j] += minUncovered;
      }
      // Elements covered by only row or only column remain unchanged
    }
  }

  return {
    ...state,
    costMatrix: newMatrix,
    minUncoveredValue: minUncovered,
    step: state.step + 1,
    explanation: `Step ${
      state.step + 1
    }: Modified matrix by subtracting ${minUncovered} from uncovered elements and adding to doubly-covered elements.`,
  };
}

export function performHungarianStep(state: HungarianState): HungarianState {
  if (state.status === "Complete") {
    return state;
  }

  switch (state.currentPhase) {
    case "reduce_rows":
      return reduceRows(state);
    case "reduce_cols":
      return reduceCols(state);
    case "cover_zeros":
      return coverZeros(state);
    case "find_assignment":
      return findOptimalAssignment(state);
    case "adjust_matrix":
      return adjustMatrix(state);
    default:
      return state;
  }
}

export function solveHungarianProblem(state: HungarianState): HungarianState[] {
  const steps: HungarianState[] = [state];
  let currentState = state;
  let maxSteps = 100; // Prevent infinite loops

  while (currentState.status !== "Complete" && maxSteps > 0) {
    currentState = performHungarianStep(currentState);
    steps.push(currentState);
    maxSteps--;
  }

  return steps;
}
