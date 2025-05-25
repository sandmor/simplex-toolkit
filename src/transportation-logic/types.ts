// Transportation Problem Types
export interface TransportationProblem {
  supply: number[];
  demand: number[];
  costs: number[][];
  supplyLabels: string[];
  demandLabels: string[];
}

export interface Allocation {
  row: number;
  col: number;
  value: number;
}

// Initial solution methods
export type InitialMethod = "NWC" | "LCM" | "VAM";

// All methods including MODI optimization
export type TransportationMethod = InitialMethod | "MODI";

export interface TransportationState {
  problem: TransportationProblem;
  allocations: Allocation[];
  totalCost: number;
  step: number;
  method: TransportationMethod;
  status: "Initial" | "Running" | "Complete";
  explanation: string;
  remainingSupply: number[];
  remainingDemand: number[];
  isOptimal?: boolean;
  degeneracy?: boolean;
  modiData?: MODIData;
}

export interface CellInfo {
  row: number;
  col: number;
  cost: number;
  allocation: number;
  isBasic: boolean;
  penalty?: number;
}

export interface VAMPenalty {
  type: "row" | "col";
  index: number;
  penalty: number;
  minCosts: number[];
}

export interface MODIData {
  uValues: (number | undefined)[];
  vValues: (number | undefined)[];
  opportunityCosts: number[][];
  mostNegativeCell: { row: number; col: number; value: number } | null;
  enteringCell: { row: number; col: number } | null;
  exitingCell: { row: number; col: number } | null;
  loop: { row: number; col: number }[] | null;
  theta: number | null;
}
