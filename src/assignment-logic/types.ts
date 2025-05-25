// Assignment Problem Types
export interface AssignmentProblem {
  costs: number[][];
  rowLabels: string[];
  colLabels: string[];
  isMaximization: boolean;
}

export interface Assignment {
  row: number;
  col: number;
}

export interface HungarianState {
  problem: AssignmentProblem;
  costMatrix: number[][];
  originalMatrix: number[][];
  assignments: Assignment[];
  totalCost: number;
  step: number;
  status: "Initial" | "Running" | "Complete";
  explanation: string;
  coveredRows: boolean[];
  coveredCols: boolean[];
  markedMatrix: ("starred" | "primed" | null)[][];
  minUncoveredValue?: number;
  currentPhase:
    | "reduce_rows"
    | "reduce_cols"
    | "cover_zeros"
    | "find_assignment"
    | "adjust_matrix"
    | "complete";
}

export interface ZeroLocation {
  row: number;
  col: number;
}

export interface AugmentingPath {
  path: ZeroLocation[];
}
