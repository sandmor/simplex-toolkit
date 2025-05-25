import {
  TransportationProblem,
  TransportationState,
  Allocation,
  InitialMethod,
  TransportationMethod,
} from "./types";

export type {
  TransportationProblem,
  TransportationState,
  Allocation,
  InitialMethod,
  TransportationMethod,
} from "./types";

export function balanceProblem(
  problem: TransportationProblem
): TransportationProblem {
  const totalSupply = problem.supply.reduce((sum, s) => sum + s, 0);
  const totalDemand = problem.demand.reduce((sum, d) => sum + d, 0);

  if (totalSupply === totalDemand) {
    return problem; // Already balanced
  }

  const balanced = {
    supply: [...problem.supply],
    demand: [...problem.demand],
    costs: problem.costs.map((row) => [...row]),
    supplyLabels: [...problem.supplyLabels],
    demandLabels: [...problem.demandLabels],
  };

  if (totalSupply > totalDemand) {
    // Add dummy demand column
    balanced.demand.push(totalSupply - totalDemand);
    balanced.demandLabels.push("Dummy");
    balanced.costs.forEach((row) => row.push(0));
  } else {
    // Add dummy supply row
    balanced.supply.push(totalDemand - totalSupply);
    balanced.supplyLabels.push("Dummy");
    balanced.costs.push(new Array(balanced.demand.length).fill(0));
  }

  return balanced;
}

export function initializeTransportationProblem(
  problem: TransportationProblem,
  method: InitialMethod
): TransportationState {
  const balancedProblem = balanceProblem(problem);

  return {
    problem: balancedProblem,
    allocations: [],
    totalCost: 0,
    step: 0,
    method,
    status: "Initial",
    explanation: `Starting ${getMethodName(
      method
    )} to find initial basic feasible solution.`,
    remainingSupply: [...balancedProblem.supply],
    remainingDemand: [...balancedProblem.demand],
    degeneracy: false,
  };
}

export function getMethodName(method: TransportationMethod): string {
  switch (method) {
    case "NWC":
      return "Northwest Corner Method";
    case "LCM":
      return "Least Cost Method";
    case "VAM":
      return "Vogel's Approximation Method";
    case "MODI":
      return "MODI Method";
  }
}

export function isAllocationComplete(state: TransportationState): boolean {
  return (
    state.remainingSupply.every((s) => s === 0) &&
    state.remainingDemand.every((d) => d === 0)
  );
}

export function calculateTotalCost(
  allocations: Allocation[],
  costs: number[][]
): number {
  return allocations.reduce((total, alloc) => {
    return total + costs[alloc.row][alloc.col] * alloc.value;
  }, 0);
}

export function findAllocation(
  allocations: Allocation[],
  row: number,
  col: number
): Allocation | undefined {
  return allocations.find((a) => a.row === row && a.col === col);
}

export function addAllocation(
  state: TransportationState,
  row: number,
  col: number,
  value: number
): void {
  const existingIndex = state.allocations.findIndex(
    (a) => a.row === row && a.col === col
  );
  if (existingIndex >= 0) {
    state.allocations[existingIndex].value += value;
  } else {
    state.allocations.push({ row, col, value });
  }

  state.remainingSupply[row] -= value;
  state.remainingDemand[col] -= value;
  state.totalCost = calculateTotalCost(state.allocations, state.problem.costs);
}

export function checkDegeneracy(state: TransportationState): boolean {
  const m = state.problem.supply.length;
  const n = state.problem.demand.length;
  const expectedBasicVariables = m + n - 1;
  const actualBasicVariables = state.allocations.filter(
    (a) => a.value > 0
  ).length;

  return actualBasicVariables < expectedBasicVariables;
}
