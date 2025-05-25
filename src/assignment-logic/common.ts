import { AssignmentProblem, HungarianState, Assignment } from "./types";

export type { AssignmentProblem, HungarianState, Assignment } from "./types";

export function balanceAssignmentProblem(
  problem: AssignmentProblem
): AssignmentProblem {
  const n = Math.max(problem.costs.length, problem.costs[0]?.length || 0);

  // Create balanced square matrix
  const balancedCosts: number[][] = [];
  const balancedRowLabels: string[] = [];
  const balancedColLabels: string[] = [];

  // Fill rows
  for (let i = 0; i < n; i++) {
    balancedCosts[i] = [];
    if (i < problem.rowLabels.length) {
      balancedRowLabels[i] = problem.rowLabels[i];
    } else {
      balancedRowLabels[i] = `Dummy-${i + 1}`;
    }

    // Fill columns
    for (let j = 0; j < n; j++) {
      if (i < problem.costs.length && j < problem.costs[i].length) {
        balancedCosts[i][j] = problem.costs[i][j];
      } else {
        // Use 0 for dummy assignments (they won't affect optimal solution)
        balancedCosts[i][j] = 0;
      }
    }
  }

  // Fill column labels
  for (let j = 0; j < n; j++) {
    if (j < problem.colLabels.length) {
      balancedColLabels[j] = problem.colLabels[j];
    } else {
      balancedColLabels[j] = `Dummy-${j + 1}`;
    }
  }

  return {
    costs: balancedCosts,
    rowLabels: balancedRowLabels,
    colLabels: balancedColLabels,
    isMaximization: problem.isMaximization,
  };
}

export function initializeHungarianProblem(
  problem: AssignmentProblem
): HungarianState {
  const balancedProblem = balanceAssignmentProblem(problem);
  const n = balancedProblem.costs.length;

  // Convert maximization to minimization by negating costs
  let costMatrix: number[][];
  if (balancedProblem.isMaximization) {
    const maxValue = Math.max(...balancedProblem.costs.flat());
    costMatrix = balancedProblem.costs.map((row) =>
      row.map((cost) => maxValue - cost)
    );
  } else {
    costMatrix = balancedProblem.costs.map((row) => [...row]);
  }

  return {
    problem: balancedProblem,
    costMatrix,
    originalMatrix: balancedProblem.costs.map((row) => [...row]),
    assignments: [],
    totalCost: 0,
    step: 0,
    status: "Initial",
    explanation: `Starting Hungarian Method for ${
      balancedProblem.isMaximization ? "maximization" : "minimization"
    } assignment problem.`,
    coveredRows: new Array(n).fill(false),
    coveredCols: new Array(n).fill(false),
    markedMatrix: Array.from({ length: n }, () => new Array(n).fill(null)),
    currentPhase: "reduce_rows",
  };
}

export function calculateTotalAssignmentCost(
  assignments: Assignment[],
  originalCosts: number[][]
): number {
  return assignments.reduce((total, assignment) => {
    return total + originalCosts[assignment.row][assignment.col];
  }, 0);
}

export function findMinInRow(matrix: number[][], row: number): number {
  return Math.min(...matrix[row]);
}

export function findMinInCol(matrix: number[][], col: number): number {
  return Math.min(...matrix.map((row) => row[col]));
}

export function deepCopyMatrix(matrix: number[][]): number[][] {
  return matrix.map((row) => [...row]);
}

export function findUncoveredZeros(
  matrix: number[][],
  coveredRows: boolean[],
  coveredCols: boolean[]
): { row: number; col: number }[] {
  const zeros: { row: number; col: number }[] = [];

  for (let i = 0; i < matrix.length; i++) {
    if (coveredRows[i]) continue;

    for (let j = 0; j < matrix[i].length; j++) {
      if (coveredCols[j]) continue;

      if (matrix[i][j] === 0) {
        zeros.push({ row: i, col: j });
      }
    }
  }

  return zeros;
}

export function findMinUncoveredValue(
  matrix: number[][],
  coveredRows: boolean[],
  coveredCols: boolean[]
): number {
  let min = Infinity;

  for (let i = 0; i < matrix.length; i++) {
    if (coveredRows[i]) continue;

    for (let j = 0; j < matrix[i].length; j++) {
      if (coveredCols[j]) continue;

      if (matrix[i][j] < min) {
        min = matrix[i][j];
      }
    }
  }

  return min === Infinity ? 0 : min;
}
